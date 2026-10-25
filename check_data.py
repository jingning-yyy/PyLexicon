#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""校验 data/ 目录下的模块数据文件。
用法: python check_data.py
检查: JS 语法层面的括号/引号配平、模块结构完整性、related 引用是否可解析。
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent
DATA = ROOT / 'data'
errors: list[str] = []

# ---------- 1. 语法层: 忽略字符串/注释后检查括号配平 ----------
def strip_strings_and_comments(src: str) -> tuple[str, list[str]]:
    out = []
    msgs = []
    i, n = 0, len(src)
    state = 'code'  # code / s1 / s2 / s3 / line / block
    while i < n:
        c = src[i]
        nxt = src[i + 1] if i + 1 < n else ''
        if state == 'code':
            if c == "'":
                state = 's1'; out.append(' ')
            elif c == '"':
                state = 's2'; out.append(' ')
            elif c == '`':
                state = 's3'; out.append(' ')
            elif c == '/' and nxt == '/':
                state = 'line'; out.append('  '); i += 1
            elif c == '/' and nxt == '*':
                state = 'block'; out.append('  '); i += 1
            else:
                out.append(c)
        elif state == 'line':
            if c == '\n':
                state = 'code'; out.append('\n')
            else:
                out.append(' ')
        elif state == 'block':
            if c == '*' and nxt == '/':
                state = 'code'; out.append('  '); i += 1
            else:
                out.append('\n' if c == '\n' else ' ')
        else:
            q = {"s1": "'", "s2": '"', "s3": '`'}[state]
            if c == '\\':
                i += 1  # 跳过转义字符
            elif c == q:
                state = 'code'
            elif state == 's3' and c == '$' and nxt == '{':
                msgs.append(f'{f.name}: 模板字符串中发现 ${{ 插值表达式(数据文件不支持)')
            out.append('\n' if c == '\n' else ' ')
        i += 1
    if state in ('s1', 's2', 's3'):
        msgs.append(f'{f.name}: 字符串未闭合')
    if state == 'block':
        msgs.append(f'{f.name}: 块注释未闭合')
    return ''.join(out), msgs

PAIRS = {')': '(', ']': '[', '}': '{'}
for f in sorted(DATA.glob('*.js')):
    code, msgs = strip_strings_and_comments(f.read_text(encoding='utf-8'))
    errors.extend(msgs)
    stack = []
    for ln, line in enumerate(code.splitlines(), 1):
        for ch in line:
            if ch in '([{':
                stack.append((ch, ln))
            elif ch in ')]}':
                if not stack or stack[-1][0] != PAIRS[ch]:
                    errors.append(f'{f.name}:{ln}: 括号不匹配 {ch}')
                    stack.clear()
                    break
                stack.pop()
    if stack:
        errors.append(f'{f.name}: 有 {len(stack)} 个未闭合的 {stack[-1][0]} (第 {stack[-1][1]} 行起)')

# ---------- 2. 结构层: 模块与条目字段、related 引用 ----------
modules = {}
order = []
for f in sorted(DATA.glob('*.js')):
    src = f.read_text(encoding='utf-8')
    blocks = src.split('MODULES.push(')[1:]
    for bi, b in enumerate(blocks, 1):
        mid = re.search(r"\bid:\s*'([^']+)'", b)
        if not mid:
            errors.append(f'{f.name}: 第 {bi} 个模块缺少 id')
            continue
        mname = re.search(r"\bname:\s*'([^']+)'", b)
        mid_v = mid.group(1)
        if mid_v in modules:
            errors.append(f'{f.name}: 模块 id 重复: {mid_v}')
        order.append(mid_v)
        entries = re.findall(r"\n\s{4,8}name:\s*'([^']+)'", b)
        modules[mid_v] = {
            'file': f.name, 'name': mname.group(1) if mname else mid_v,
            'entries': entries,
        }
        if not entries:
            errors.append(f'{f.name}: 模块 {mid_v} 没有条目')
        for e in entries:
            if '/' in e:
                errors.append(f'{f.name}: 条目名含 / (路由冲突): {mid_v}.{e}')
        # related 引用检查
        for arr in re.findall(r'related:\s*\[([^\]]*)\]', b):
            for r in re.findall(r"'([^']+)'", arr):
                if r not in entries:
                    errors.append(f'{f.name}: {mid_v} 的 related 指向不存在的条目: {r}')

# ---------- 3. index.html 引入检查 ----------
html = (ROOT / 'index.html').read_text(encoding='utf-8')
loaded = re.findall(r'src="(data/[^"]+)"', html)
disk = sorted(p.name for p in DATA.glob('*.js'))
for p in disk:
    if f'data/{p}' not in loaded:
        errors.append(f'index.html 没有引入 data/{p}')
for l in loaded:
    if not (DATA / Path(l).name).exists():
        errors.append(f'index.html 引用了不存在的 {l}')

# ---------- 4. 官方文档链接检查 ----------
warnings = []
for f in sorted(DATA.glob('*.js')):
    src = f.read_text(encoding='utf-8')
    for mid in re.findall(r"^  id: '([^']+)',", src, flags=re.M):
        blk_start = src.index(f"id: '{mid}'")
        blk_end = src.find('MODULES.push', blk_start)
        blk = src[blk_start: blk_end if blk_end > 0 else len(src)]
        if not re.search(r"\n  doc: 'https?://", blk):
            warnings.append(f'{f.name}: 模块 {mid} 缺少 doc 官方文档链接')

# ---------- 报告 ----------
total_entries = sum(len(m['entries']) for m in modules.values())
print(f'模块 {len(modules)} 个 · 用法条目 {total_entries} 条\n')
for mid in order:
    m = modules[mid]
    print(f"  {m['name']:<14} {len(m['entries']):>3} 条  ({m['file']})")
print()
if warnings:
    print(f'⚠️ {len(warnings)} 条提醒:')
    for w in warnings:
        print('  -', w)
    print()
if errors:
    print(f'❌ 发现 {len(errors)} 个问题:')
    for e in errors:
        print('  -', e)
    sys.exit(1)
print('✅ 校验通过: 括号配平、结构完整、related 引用与文件引入均正常')
