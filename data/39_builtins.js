/* 内置函数速查：不用 import 就能用的那批 */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'builtins', name: '内置函数速查', icon: '🔢', category: '速查',
  doc: 'https://docs.python.org/zh-cn/3/library/functions.html',
  desc: '任何脚本直接可用的函数：并行遍历、排序统计、类型转换、字符串方法、f-string 格式化、文件读写。',
  install: false,
  aliases: ['内置', 'builtin', 'enumerate', 'zip', 'sorted', 'f-string', '字符串方法', '文件读写'],
  tips: [
    'f-string 是现代格式化首选：f\'{name} 有 {n} 个\' —— 比 % 和 .format 都省事，本字典示例也全用它。',
    '本页按用途分组：并行遍历 / 排序统计 / 计数转换 / 字符串方法 / 格式化 / 文件读写。',
  ],
  entries: [
    {
      name: 'zip-enumerate', sig: "zip(a, b) / enumerate(x, start=1) / reversed(x)",
      brief: '并行遍历与带序号遍历：两个列表一起循环、循环时拿序号。',
      examples: [
        { title: '', code: `names = ['Si', 'Ca', 'Fe']\nvals = [45.7, 8.3, 3.1]\n\nfor n, v in zip(names, vals):      # 两列表并行遍历\n    print(n, v)\n\nfor i, n in enumerate(names, start=1):   # 带序号(从 1 数)\n    print(i, n)\n\nfor n in reversed(names):          # 反向遍历\n    print(n)\n\nfor n, v in zip(names, vals, strict=True):   # 3.10+: 长度不齐直接报错\n    ...` },
      ],
      pitfalls: [
        'zip 长度不齐时<b>按短的截断且不报错</b>——悄悄丢数据的事故就这么来的，想报错加 strict=True(3.10+)。',
        'enumerate 默认从 0 开始；给人看的表格/报告记得 start=1。',
        '遍历列表时别同时删元素(会跳项)：要删先遍历副本 for x in list(items):。',
      ],
      related: ['sorted-key', 'str-methods'],
      tags: ['遍历', 'enumerate', 'zip'],
    },
    {
      name: 'sorted-key', sig: "sorted(x, key=函数, reverse=True) / max(x, key=) / min / sum",
      brief: '排序与统计的钥匙——key 参数：按什么排由你说了算。',
      examples: [
        { title: '', code: `data = [('SiO2', 45.7), ('CaO', 8.3), ('Fe2O3', 3.1)]\n\nsorted(data, key=lambda t: t[1], reverse=True)   # 按数值降序\nmax(data, key=lambda t: t[1])                    # 含量最高 -> ('SiO2', 45.7)\nsum(v for _, v in data)                          # 求和\n\nwords = ['banana', 'fig', 'apple']\nsorted(words, key=len)                           # 按长度排\n\nd = {'a': 3, 'b': 1}\nsorted(d.items(), key=lambda kv: kv[1])          # 字典按值排: [('b',1),('a',3)]` },
      ],
      pitfalls: [
        '<b>sorted 返回新列表</b>；list.sort() 原地改但返回 None —— 写成 lst = lst.sort() 拿到的是 None。',
        'key 接收"每个元素"并返回"用来比较的值"；多条件排序返回元组：key=lambda t: (t[2], t[1])。',
        'key 里字符串排序默认按 Unicode 码点，中文按拼音排要安装pypinyin或自己给映射表。',
      ],
      related: ['zip-enumerate', 'range-len-round'],
      tags: ['排序', 'sorted', 'key', '统计'],
    },
    {
      name: 'range-len-round', sig: "range(起, 止, 步长) / len(x) / round(x, 位) / int() / isinstance(x, 类型)",
      brief: '计数与类型小工具：循环数列、长度、舍入、类型判断。',
      examples: [
        { title: '', code: `list(range(5))         # [0,1,2,3,4]  含头不含尾\nlist(range(1, 10, 2))  # [1,3,5,7,9]\n\nlen('光谱数据')         # 4 (字符数)\nround(3.14159, 2)      # 3.14\n\nint('42')              # 42   字符串转整数\nint(3.9)               # 3    直接砍小数, 不是四舍五入!\nround(2.5)             # 2    银行家舍入: .5 往偶数靠!\n\nisinstance(3.5, (int, float))   # True  类型判断(支持元组)\nabs(-3.5)              # 3.5` },
      ],
      pitfalls: [
        '<b>round 是银行家舍入</b>：round(2.5)=2 而 round(3.5)=4；报表要传统四舍五入用 <code>decimal.Decimal(str(x)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)</code>。',
        'int(3.9) 是截断不是舍入；int(\'abc\') 抛 ValueError，脏数据先 try 或 isdigit() 判断。',
        'range 含头不含尾：要 1~10 得写 range(1, 11)；遍历下标用 range(len(x)) 能跑但 enumerate 更地道。',
      ],
      related: ['sorted-key', 'fstring-format'],
      tags: ['range', 'round', '类型转换', 'isinstance'],
    },
    {
      name: 'str-methods', sig: "s.split(分隔) / s.strip() / s.replace(旧, 新) / sep.join(列表) / s.startswith()",
      brief: '字符串方法全家桶：拆、拼、去空格、替换、判断、查找。',
      examples: [
        { title: '', code: `line = 'SiO2, 45.7, 0.12'\nparts = [p.strip() for p in line.split(',')]   # 拆完顺手去空格\n\n'-'.join(['2026', '09', '09'])        # '2026-09-09'  列表拼回字符串\nline.replace('SiO2', '二氧化硅')\nline.startswith('Si')                 # True\n'scan01.log'.find('log')              # 7   找不到返回 -1\n'name: value'.split(':', 1)           # 只拆第一次 -> ['name', ' value']\n\n'  hello \\n'.strip()                  # 'hello'  两端空白全去\n'ABC'.lower()                         # 'abc'` },
      ],
      pitfalls: [
        '<b>split() 不带参数</b>按任意空白拆且自动丢空串；split(\' \') 死磕单个空格——清洗文本行优先用前者。',
        '字符串不可变：所有方法都返回<b>新</b>字符串，s.replace(...) 不接收返回值等于没改。',
        'join 写法是"连接符.join(列表)"，方向别写反；列表里有数字要先 str() 转成字符串。',
      ],
      related: ['zip-enumerate', 'fstring-format', 'open-file'],
      tags: ['字符串', 'split', 'join', 'strip'],
    },
    {
      name: 'fstring-format', sig: "f'{v:.2f}' / f'{n:,}' / f'{r:.1%}' / f'{i:03d}' / f'{s:>10}' / f'{x = }'",
      brief: 'f-string 格式化：小数位、千分位、百分比、补零、对齐。',
      examples: [
        { title: '', code: `pi = 3.14159\nf'{pi:.2f}'          # '3.14'         保留 2 位小数\nn = 1234567.891\nf'{n:,.2f}'          # '1,234,567.89' 千分位\nr = 0.8734\nf'{r:.1%}'           # '87.3%'        百分比\nfor i in range(3):\n    name = f'scan_{i:03d}.dat'    # scan_000.dat  补零到 3 位(排序友好)\nf'{"左":<8}|'        # 左对齐宽 8;  >8 右对齐  ^8 居中\nx = 42\nf'{x = }'            # 'x = 42'       调试神器: 连变量名一起打印` },
      ],
      pitfalls: [
        'f-string 内外引号别相同（外层双引号内层用单引号）；3.12 之前同种引号嵌套直接语法错误。',
        '想显示大括号本身用双写：f\'{{}}\' 输出 {}。',
        '日期可直接吃 strftime 代码：f\'{now:%Y-%m-%d %H:%M}\';f\'{x = }\' 等号调试要 3.8+。',
      ],
      related: ['str-methods', 'range-len-round'],
      tags: ['f-string', '格式化', '小数位', '补零'],
    },
    {
      name: 'open-file', sig: "with open('a.txt', 'r'/'w'/'a', encoding='utf-8') as f: / f.read() / f.write(s)",
      brief: '文件读写：模式、编码、逐行读大文件——with 组合是标准姿势。',
      examples: [
        { title: '', code: `# 读文本(显式给编码, 否则 Windows 默认 gbk!)\nwith open('data.txt', encoding='utf-8') as f:\n    text = f.read()              # 一次全读\n    # lines = f.readlines()      # 全读成行列表\n    # for line in f: ...         # 逐行读大文件, 内存友好\n\n# 写: 'w' 覆盖 / 'a' 追加\nwith open('result.txt', 'w', encoding='utf-8') as f:\n    f.write('第一行\\n')\n    f.writelines(['a\\n', 'b\\n'])\n\n# 二进制(图片/下载内容)加 b:\nwith open('img.png', 'wb') as f:\n    f.write(r.content)` },
      ],
      pitfalls: [
        '<b>encoding 不写在 Windows 默认 gbk</b>：写 utf-8 的文件给别人打开就乱码；读写都显式 encoding=\'utf-8\'。',
        '<b>\'w\' 一打开就清空文件</b>(哪怕你还没 write)；追加用 \'a\'；两个都想(读+改)用 \'r+\' 但指针要 seek。',
        'with 块结束自动关闭；不关在 Windows 上会占住文件导致删不掉。读报 UnicodeDecodeError 是编码猜错：换 gbk/gb18030 试。',
      ],
      related: ['str-methods', 'zip-enumerate'],
      tags: ['文件读写', 'open', 'encoding', '逐行读'],
    },
  ],
});
