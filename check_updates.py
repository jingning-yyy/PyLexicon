#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""版本更新检查：对比各第三方库的"本地已装版本"与"PyPI 最新版本"。

用法:
    python check_updates.py              # 检查全部
    python check_updates.py pandas xgb   # 只查名字含关键字的模块

更新工作流（库出新版后怎么维护这本字典）:
    1. 跑本脚本，看哪些库有了新版本
    2. 打开对应模块的官方文档/更新日志（模块页右上角或文档导航页 #/docs）
       重点关注 Breaking changes（API 改名、参数移位，如 xgboost 2.0 的早停参数）
    3. 编辑 data/ 对应 .js 修订受影响的条目，必要时在 pitfalls 里补一条版本差异说明
    4. python check_data.py 校验 -> 刷新浏览器

说明: 标准库随 Python 版本走，不参与检查；需联网查询 PyPI，失败会标注"查询失败"。
"""
import json
import re
import sys
import time
import urllib.error
import urllib.request
from importlib import metadata
from pathlib import Path

ROOT = Path(__file__).parent
DATA = ROOT / 'data'


def load_modules():
    """从 data/*.js 解析出 (模块名, pypi包名, 官方文档链接)。标准库跳过。"""
    out = []
    for f in sorted(DATA.glob('*.js')):
        src = f.read_text(encoding='utf-8')
        # 模块头 = id 行 到 entries 行之间（避免误匹配示例代码里的 pip install）
        for m in re.finditer(r"^  id: '([^']+)',.*$", src, flags=re.M):
            header_end = src.find('\n  entries:', m.start())
            header = src[m.start(): header_end if header_end > 0 else len(src)]
            install = re.search(r"pip install ([A-Za-z0-9][A-Za-z0-9._-]*)", header)
            if not install:
                continue  # 标准库（install: false）
            pkg_m = re.search(r"\n  pkg: '([^']+)'", header)
            doc_m = re.search(r"\n  doc: '([^']+)'", header)
            out.append({
                'id': m.group(1),
                'pkg': pkg_m.group(1) if pkg_m else install.group(1),
                'doc': doc_m.group(1) if doc_m else '',
            })
    return out


def pypi_latest(pkg, retries=2):
    # PyPI 对连续请求会限流，失败后间隔递增重试
    url = 'https://pypi.org/pypi/{}/json'.format(pkg)
    for i in range(retries + 1):
        req = urllib.request.Request(url, headers={'User-Agent': 'python-module-dict'})
        try:
            with urllib.request.urlopen(req, timeout=10) as r:
                return json.load(r)['info']['version']
        except Exception:
            if i == retries:
                raise
            time.sleep(1.5 * (i + 1))


def local_version(pkg):
    try:
        return metadata.version(pkg)
    except Exception:
        return None


def main():
    keys = [k.lower() for k in sys.argv[1:]]
    mods = load_modules()
    if keys:
        mods = [m for m in mods if any(k in m['id'].lower() or k in m['pkg'].lower() for k in keys)]

    print(f'{"模块":<14}{"PyPI 包":<18}{"本地":<12}{"最新":<12}状态')
    print('-' * 72)
    updatable = 0
    for m in mods:
        local = local_version(m['pkg'])
        try:
            latest = pypi_latest(m['pkg'])
            note = ''
        except Exception:
            latest = '-'
            note = '（查询失败，检查网络）'
        if local is None:
            status = '未安装'
        elif latest == '-':
            status = '?' + note
        elif local == latest:
            status = '✅ 已是最新'
        else:
            status = '⬆️ 可更新'
            updatable += 1
        print('{:<14}{:<18}{:<12}{:<12}{}'.format(
            m['id'], m['pkg'], local or '未安装', latest, status))

    print('-' * 72)
    print(f'共 {len(mods)} 个第三方库，{updatable} 个可更新。')
    print('更新建议见脚本顶部注释；文档直达: index.html#/docs 或各模块页右上角。')


if __name__ == '__main__':
    main()
