/* 标准库：re / json / datetime / time / collections / random */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 're', name: 're', icon: '🔤', category: '标准库',
  doc: 'https://docs.python.org/zh-cn/3/library/re.html',
  desc: '正则表达式：文本提取、清洗、校验的瑞士军刀，爬虫和数据清洗高频使用。',
  install: false,
  aliases: ['正则', 'regex', 'regexp'],
  tips: [
    '<b>pattern 永远写原始字符串</b>：<code>r"\\d+"</code>。不加 r 的话 <code>"\\b"</code> 会被 Python 先解释成退格符，正则直接失灵。',
    '匹配中文直接用字符或 <code>[\\u4e00-\\u9fa5]</code>，不要加多余 flag。',
    '调正则先在 regex101.com 或 <code>re.findall</code> 里试，别在大程序里猜。',
  ],
  entries: [
    {
      name: 'match-search-findall', sig: 're.match(p, s) / re.search(p, s) / re.findall(p, s) / re.finditer(p, s)',
      brief: '三大查找函数：match 只从开头、search 找第一个、findall 找全部。',
      returns: 'match/search 返回 Match 对象（或 None）；findall 返回列表',
      examples: [
        { title: '', code: `import re\ns = '订单A: 128元, 订单B: 45元'\n\nprint(re.match(r'订单', s))        # 从头匹配 -> Match\nprint(re.match(r'\\d+', s))         # None! 开头不是数字\nprint(re.search(r'\\d+', s))        # 第一个数字 128\nprint(re.findall(r'\\d+', s))       # ['128', '45']  全部\n\nfor m in re.finditer(r'订单(\\w): (\\d+)元', s):\n    print(m.group(1), m.group(2))  # A 128 / B 45` },
      ],
      pitfalls: [
        '<b>findall 有分组时返回分组内容而不是整体匹配</b>：r"(a)(b)" 返回 [("a","b")...]，想返回整体用非捕获组 (?:...) 或 finditer。',
        '<code>match != search</code>：match 等价于 search 且强制 ^ 在开头，只会"打头阵"。',
        'search 找不到返回 None，直接 m.group() 会 AttributeError，先判断 if m:。',
      ],
      related: ['分组', '贪婪'],
      tags: ['查找', '提取', '正则'],
    },
    {
      name: '分组', sig: '(...) 捕获组 / (?:...) 非捕获 / (?P<name>...) 命名组 / m.group(n) / m.groups()',
      brief: '用括号提取子串，group(0) 是整体。',
      examples: [
        { title: '', code: `import re\nm = re.search(r'(\\d{4})-(\\d{2})-(\\d{2})', '截止 2024-05-20 交付')\nprint(m.group(0))     # 2024-05-20 整体\nprint(m.group(1))     # 2024\nprint(m.groups())     # ('2024', '05', '20')\n\n# 命名组(推荐, 可读性好):\nm = re.search(r'(?P<year>\\d{4})-(?P<month>\\d{2})', '2024-05')\nprint(m.group('year'))   # 2024\n\n# 非捕获组: 只要整体不提取\nre.findall(r'(?:张|李)三', '张三李三王三')   # ['张三', '李三']` },
      ],
      pitfalls: [
        '括号有副作用：会改变 findall 的返回结构，"只是想分组用但不提取"时用 (?:...)。',
        'group(1) 越界报 IndexError：分组从 1 数起，group(0) 是整体。',
      ],
      related: ['match-search-findall', 'sub'],
      tags: ['分组', '提取', 'group'],
    },
    {
      name: 'sub', sig: 're.sub(pattern, repl, string, count=0, flags=0)',
      brief: '替换：把匹配的部分换成字符串或函数结果，文本清洗主力。',
      examples: [
        { title: '', code: `import re\ns = '价格: 128元；折扣: 45元'\nprint(re.sub(r'\\d+', 'N', s))          # 价格: N元；折扣: N元\nprint(re.sub(r'\\s+', ' ', 'a  b\\tc'))  # 多空白合一\n\n# repl 里用分组: \\1 引用第1组\nprint(re.sub(r'(\\d{4})-(\\d{2})', r'\\2/\\1', '2024-05'))  # 05/2024\n\n# repl 传函数, m 是 Match 对象\nprint(re.sub(r'\\d+', lambda m: str(int(m.group()) * 2), 'a1b12'))  # a2b24\n\n# 只替换前1次: count=1\n# 忽略大小写: flags=re.IGNORECASE` },
      ],
      pitfalls: [
        'repl 字符串里的 <code>\\1</code> 必须写成原始字符串 r"\\1"，否则被 Python 先转义。',
        'repl 想放字面量反斜杠时要小心，<code>re.escape</code> 处理 pattern 侧，repl 侧用 lambda 返回。',
        'pattern 里有用户输入时先 <code>re.escape(text)</code>，防正则注入和报错。',
      ],
      related: ['match-search-findall', '分组'],
      tags: ['替换', '清洗', 'sub'],
    },
    {
      name: 'split', sig: 're.split(pattern, string, maxsplit=0)',
      brief: '按正则切分字符串，支持多个分隔符。',
      examples: [
        { title: '', code: `import re\nprint(re.split(r'[,;、\\s]+', 'a, b;c、d  e'))   # ['a','b','c','d','e']\nprint(re.split(r'(,)', 'a,b'))                  # 保留分隔符: ['a', ',', 'b']` },
      ],
      pitfalls: [
        '分隔符组合写成字符集 <code>[,;\\s]+</code> 并加 +，否则连续分隔符会产生空串。',
        '简单单字符切分直接用 str.split 更快，re.split 用在多分隔符场景。',
      ],
      related: ['sub'],
      tags: ['切分', '分隔符'],
    },
    {
      name: '贪婪', sig: '.* 贪婪 / .*? 非贪婪',
      brief: '量词默认贪婪（尽量多吃），加 ? 变非贪婪（尽量少吃），提取错位的第一元凶。',
      examples: [
        { title: '', code: `import re\ns = '<a>内容1</a><a>内容2</a>'\nprint(re.findall(r'<a>(.*)</a>', s))    # ['内容1</a><a>内容2'] 贪婪吃到底!\nprint(re.findall(r'<a>(.*?)</a>', s))   # ['内容1', '内容2'] 非贪婪\n\nprint(re.findall(r'\\d+?', '123'))       # ['1','2','3'] +? 也变非贪婪` },
      ],
      pitfalls: [
        '<b>用 .* 提取多条记录却只拿到一条巨大的，就是忘了加 ?</b> —— 正则第一坑。',
        '解析 HTML 优先用 BeautifulSoup 而不是正则；正则适合简单、结构稳定的场景。',
      ],
      related: ['match-search-findall'],
      tags: ['贪婪', '非贪婪', '提取'],
    },
    {
      name: '元字符速查', sig: '\\d \\D \\w \\W \\s \\S . ^ $ | + * ? {m,n} [ ] \\b',
      brief: '常用元字符与语法速查表。',
      params: [
        { n: '\\d / \\D', t: '-', d: '数字 [0-9] / 非数字' },
        { n: '\\w / \\s', t: '-', d: '字母数字下划线 / 空白符（含空格\\t\\n）' },
        { n: '. ', t: '-', d: '任意字符（默认不匹配换行 \\n，加 flags=re.S 才匹配）' },
        { n: '^ $', t: '-', d: '串首/串尾；flags=re.M 时是每行的首尾' },
        { n: '* + ?', t: '-', d: '重复 0+ 次 / 1+ 次 / 0 或 1 次' },
        { n: '{2,5}', t: '-', d: '重复 2 到 5 次；{2,} 至少 2 次' },
        { n: '[abcA-Z0-9]', t: '-', d: '字符集，任选其一；[^abc] 取反' },
        { n: 'a|b', t: '-', d: '或（注意用括号限制范围）' },
        { n: '\\b', t: '-', d: '单词边界' },
      ],
      examples: [
        { title: '实用片段', code: `import re\nr手机号 = re.compile(r'1[3-9]\\d{9}')\nr邮箱   = re.compile(r'[\\w.+-]+@[\\w-]+\\.[\\w.]+')\nr日期   = re.compile(r'\\d{4}[-/]\\d{1,2}[-/]\\d{1,2}')\nprint(r手机号.findall('电话13812345678'))\nprint(r邮箱.findall('发到 a.b@qq.com 和 x@163.com'))` },
      ],
      pitfalls: [
        '<code>.</code> 默认不匹配换行符，跨行提取要 <code>flags=re.S</code>。',
        'pattern 必须用原始字符串 r""；compile 一次反复用更高效。',
        '中文既是 \\w 的一部分（Unicode 模式），<code>re.match(r"\\w+", "中文")</code> 能匹配 —— 与 JS 等语言不同。',
      ],
      related: ['match-search-findall', '贪婪'],
      tags: ['语法', '速查', '元字符', '手机号', '邮箱'],
    },
  ],
});

MODULES.push({
  id: 'json', name: 'json', icon: '🧾', category: '标准库',
  doc: 'https://docs.python.org/zh-cn/3/library/json.html',
  desc: 'JSON 编解码：与前端/接口/配置文件交换数据的事实标准。',
  install: false,
  tips: [
    '带中文的输出记住两个参数：<code>json.dumps(d, ensure_ascii=False, indent=2)</code>。',
    'json 是文本格式：写文件用 encoding="utf-8"，读取同理，Windows 下尤其要显式指定。',
  ],
  entries: [
    {
      name: 'dumps-loads', sig: "json.dumps(obj, ensure_ascii=True, indent=None, sort_keys=False) / json.loads(s)",
      brief: 'Python 对象 ↔ JSON 字符串。',
      params: [
        { n: 'ensure_ascii', t: 'bool', d: 'False 时中文原样输出（否则变成 \\uXXXX）', dflt: 'True' },
        { n: 'indent', t: 'int', d: '缩进格数，美化输出用', dflt: 'None(单行)' },
      ],
      examples: [
        { title: '', code: `import json\nd = {'name': '张三', 'tags': ['vip', 'new'], 'score': 95.5}\n\ns = json.dumps(d, ensure_ascii=False, indent=2)\nprint(s)\nd2 = json.loads(s)          # 解析回字典\nprint(d2['name'])` },
      ],
      pitfalls: [
        '<b>ensure_ascii 默认 True</b>，中文全部变 \\u5f20\\u4e09，不是乱码但没法看。',
        'dict 的 key 必须是 str（int key 会自动转字符串）；set、datetime、自定义类直接 TypeError。',
        'loads 严格按 JSON 语法：字符串必须双引号、不能有尾逗号、不能有注释，单引号直接 JSONDecodeError。',
      ],
      related: ['dump-load', '类型对照'],
      tags: ['序列化', '字符串', '中文'],
    },
    {
      name: 'dump-load', sig: "json.dump(obj, fp, ensure_ascii=False, indent=2) / json.load(fp)",
      brief: '对象 ↔ JSON 文件。',
      examples: [
        { title: '', code: `import json\n\nwith open('config.json', 'w', encoding='utf-8') as f:\n    json.dump({'host': 'localhost', '端口': 8080}, f, ensure_ascii=False, indent=2)\n\nwith open('config.json', encoding='utf-8') as f:\n    cfg = json.load(f)\nprint(cfg['host'])` },
      ],
      pitfalls: [
        'open 忘了 encoding="utf-8"：Windows 默认 GBK，写中文要么报错要么文件用别的工具打开乱码。',
        'json.load 一次读整个文件，超大文件（几百 MB）考虑 ijson 流式解析。',
      ],
      related: ['dumps-loads'],
      tags: ['文件', '配置', '读写'],
    },
    {
      name: '类型对照', sig: 'Python <-> JSON 类型映射',
      brief: '两边类型怎么对应、什么不能直接转。',
      params: [
        { n: 'None / True / False', t: '-', d: 'null / true / false（首字母大小写不同）' },
        { n: 'int / float', t: '-', d: 'number' },
        { n: 'tuple', t: '-', d: 'list（读回来变 list，不再是 tuple！）' },
        { n: 'datetime / set / 自定义类', t: '-', d: '<b>不支持</b>，要先转换' },
      ],
      examples: [
        { title: 'datetime 与自定义对象的转法', code: `import json\nfrom datetime import datetime\n\n# 方法1: default 兜底函数\ndef ser(o):\n    if isinstance(o, datetime):\n        return o.strftime('%Y-%m-%d %H:%M:%S')\n    if isinstance(o, set):\n        return list(o)\n    raise TypeError(type(o))\n\ns = json.dumps({'time': datetime.now(), 'tags': {1, 2}}, default=ser)\n\n# 方法2: 对象转 dict\njson.dumps(user, default=lambda o: o.__dict__)` },
      ],
      pitfalls: [
        'datetime 不转就 TypeError: Object of type datetime is not JSON serializable —— 用 default 参数或先 isoformat()。',
        'json 往返会悄悄改类型：tuple→list、int key→str key，依赖原类型比较 (==) 的代码会出 bug。',
      ],
      related: ['dumps-loads'],
      tags: ['类型', 'datetime', 'set', '转换'],
    },
    {
      name: '常见报错', sig: 'json.decoder.JSONDecodeError: Expecting ...',
      brief: '解析失败的四大原因与排查顺序。',
      examples: [
        { title: '', code: `import json\n# 1. 单引号: "{'a': 1}" -> 报错, JSON 只认双引号\n#    字典字面量字符串可改用 ast.literal_eval\nimport ast\nd = ast.literal_eval("{'a': 1}")\n\n# 2. 尾逗号 / 注释 / None True False -> 都不符合 JSON\n# 3. 空响应: 接口返回 '' -> 先判空再 loads\ns = resp.text\nif s.strip():\n    data = json.loads(s)\n# 4. 与 eval 的区别: eval 能执行任意代码, 绝不用于解析外来数据` },
      ],
      pitfalls: [
        '接口返回报 JSONDecodeError 时，先把 resp.text 打出来看 —— 很多是返回了 HTML 错误页而不是 JSON。',
        '<b>永远不要用 eval 解析数据</b>：ast.literal_eval 是安全替代（但也只支持字面量）。',
      ],
      related: ['dumps-loads', '类型对照'],
      tags: ['报错', '解析失败', 'literal_eval'],
    },
  ],
});

MODULES.push({
  id: 'datetime', name: 'datetime', icon: '🕰️', category: '标准库',
  doc: 'https://docs.python.org/zh-cn/3/library/datetime.html',
  desc: '日期与时间处理标准库：解析格式化、加减运算、时区。',
  install: false,
  aliases: ['date', '时间', '日期'],
  tips: [
    '最常用的是模块里的 <code>datetime 类</code>：<code>from datetime import datetime, timedelta, date</code>（模块名和类名一样，import 的是类）。',
    'strptime 是解析（字符串→时间），strftime 是格式化（时间→字符串），<b>p=parse、f=format</b>。',
  ],
  entries: [
    {
      name: 'now', sig: "datetime.now() / datetime.combine(date, time) / datetime.fromtimestamp(ts)",
      brief: '获取当前时间、由时间戳构造 datetime。',
      examples: [
        { title: '', code: `from datetime import datetime\nnow = datetime.now()\nprint(now)                    # 2024-05-20 14:30:25.123456\nprint(now.year, now.month, now.day, now.hour)\n\nts = 1716189025\ndt = datetime.fromtimestamp(ts)   # 时间戳 -> datetime\ntimestamp = now.timestamp()       # datetime -> 时间戳` },
      ],
      pitfalls: [
        '<code>datetime.now()</code> 是本地时区的 naive 时间；<code>utcnow()</code> 在 3.12 已弃用，要 UTC 用 <code>datetime.now(timezone.utc)</code>。',
        'naive（无时区）与 aware（有时区）的 datetime <b>不能比较也不能相减</b>，直接报 TypeError。',
      ],
      related: ['strptime-strftime', 'timedelta'],
      tags: ['当前时间', '时间戳'],
    },
    {
      name: 'strptime-strftime', sig: "datetime.strptime(s, 格式)  字符串->时间 / dt.strftime(格式)  时间->字符串",
      brief: '字符串与 datetime 互转，格式码是核心。',
      params: [
        { n: '%Y %m %d', t: '-', d: '年(4位) 月 日 —— 注意 %m 是月、%M 是分钟！' },
        { n: '%H %M %S', t: '-', d: '时(24h) 分 秒' },
        { n: '%y %B %b %A', t: '-', d: '两位年 / 月名(May) / 月缩写 / 星期名' },
        { n: '%f', t: '-', d: '微秒' },
      ],
      examples: [
        { title: '', code: `from datetime import datetime\n\ndt = datetime.strptime('2024/05/20 14:30', '%Y/%m/%d %H:%M')\nprint(dt.strftime('%Y-%m-%d'))          # 2024-05-20\nprint(dt.strftime('%Y年%m月%d日 %H时'))  # 2024年05月20日 14时\nprint(dt.weekday())                     # 0=周一` },
      ],
      pitfalls: [
        '<b>%m 月 vs %M 分钟</b>，写反了解析出 5 点 20 月或者直接报错（unconverted data / time data 不匹配）。',
        'strptime 格式必须与字符串完全一致（包括分隔符和前导零），解析 "2024/5/20" 用 "%Y/%m/%d" 恰好可以，但 "%Y-%m-%d" 解析 "2024-5-20" 在部分平台报错。',
        'pandas 批量转换别循环 strptime，用 <code>pd.to_datetime(列, format=...)</code>，快几十倍。',
      ],
      related: ['now', 'timedelta'],
      tags: ['格式化', '解析', 'strftime'],
    },
    {
      name: 'timedelta', sig: "timedelta(days=0, seconds=0, hours=0, weeks=0) / dt2 - dt1 -> timedelta",
      brief: '时间差：给日期加减、计算两个时间间隔。',
      examples: [
        { title: '', code: `from datetime import datetime, timedelta\nnow = datetime.now()\n\nprint(now + timedelta(days=3))            # 3天后\nprint(now - timedelta(hours=8, minutes=30))\nprint(now + timedelta(weeks=2))\n\nstart = datetime(2024, 5, 1)\ndelta = now - start                       # timedelta 对象\nprint(delta.days, '天')\nprint(delta.total_seconds(), '秒')         # 总秒数(含小数)` },
      ],
      pitfalls: [
        'timedelta 只有 days/seconds/microseconds 属性，<b>没有 .hours/.minutes</b>！整小时要 <code>delta.total_seconds() // 3600</code>。',
        'date 对象加 timedelta 得 date，datetime 加 timedelta 得 datetime，混着算会报 can\'t subtract 之类的错。',
        '两个日期相减得到 timedelta；取整数天数用 .days（向零取整，注意负值行为）。',
      ],
      related: ['now', 'strptime-strftime'],
      tags: ['时间差', '加减', '间隔'],
    },
    {
      name: 'date-time', sig: 'date(y, m, d) / time(h, m, s) / dt.date() / dt.time()',
      brief: 'date、time、datetime 三种对象的关系与互转。',
      examples: [
        { title: '', code: `from datetime import date, time, datetime\n\nd = date(2024, 5, 20)\nt = time(14, 30)\ndt = datetime(2024, 5, 20, 14, 30)\n\nprint(dt.date())      # 只取日期 -> date\nprint(dt.time())      # 只取时间 -> time\nprint(datetime.combine(d, t))   # date+time 拼回 datetime\nprint(date.today())\n# 比较: 同类对象才能比, date 和 datetime 比较报错` },
      ],
      pitfalls: [
        '<code>date.today() == datetime.now()</code> 报 TypeError，先统一类型（都转 date 再比）。',
        'pandas 读进来的"日期列"若是字符串，比较前先 to_datetime；若是 datetime64，取 date 要 <code>.dt.date</code>。',
      ],
      related: ['now', 'strptime-strftime'],
      tags: ['date', 'time', '类型'],
    },
    {
      name: '时区', sig: "timezone.utc / dt.astimezone(zone) / ZoneInfo('Asia/Shanghai')",
      brief: '带时区的时间处理（aware datetime）。',
      examples: [
        { title: '', code: `from datetime import datetime, timezone\nfrom zoneinfo import ZoneInfo      # Python 3.9+\n\nnow_utc = datetime.now(timezone.utc)          # aware 时间\nnow_bj = now_utc.astimezone(ZoneInfo('Asia/Shanghai'))\nprint(now_bj)                                 # 北京时间\n\n# 把 naive 时间指定为上海时区:\nnaive = datetime(2024, 5, 20, 10, 0)\naware = naive.replace(tzinfo=ZoneInfo('Asia/Shanghai'))` },
      ],
      pitfalls: [
        '<b>replace(tzinfo) 是"贴标签"不做换算</b>；已有时刻的时区换算用 astimezone。',
        '服务器多为 UTC：存库建议一律存 UTC 或时间戳，展示时再转本地时区。',
        'ZoneInfo 在 Windows 可能找不到 tzdata，<code>pip install tzdata</code>。',
      ],
      related: ['now'],
      tags: ['时区', 'utc', 'zoneinfo'],
    },
  ],
});

MODULES.push({
  id: 'time', name: 'time', icon: '⏱️', category: '标准库',
  doc: 'https://docs.python.org/zh-cn/3/library/time.html',
  desc: '时间戳与暂停：计时、sleep、取时间戳。',
  install: false,
  entries: [
    {
      name: 'sleep', sig: 'time.sleep(seconds)',
      brief: '程序暂停指定秒数（支持小数），爬虫限速的标配。',
      examples: [
        { title: '', code: `import time\n\ntime.sleep(1)          # 暂停1秒\ntime.sleep(0.5)        # 500毫秒\n\n# 爬虫礼貌间隔:\nfor url in urls:\n    fetch(url)\n    time.sleep(random.uniform(1, 3))   # 随机1~3秒, 别打太快` },
      ],
      pitfalls: [
        'sleep 期间<b>整个线程阻塞</b>；并发等待用异步或线程。',
        '实际暂停可能略长于指定值（调度精度），做精密节拍要自己补偿。',
      ],
      related: ['计时'],
      tags: ['暂停', '等待', '限速'],
    },
    {
      name: '计时', sig: 'time.time() / time.perf_counter()',
      brief: '取时间戳与高精度计时。',
      examples: [
        { title: '', code: `import time\n\nstart = time.perf_counter()      # 计时用这个!\ntime.sleep(0.1)\nprint(time.perf_counter() - start, '秒')\n\n# time.time() 是墙上时钟: 适合存业务时间戳\n# 会被系统校时影响, 测耗时别用它\nprint(int(time.time()))          # Unix 时间戳` },
      ],
      pitfalls: [
        '<b>测代码耗时用 perf_counter()</b>（单调、高精度）；time.time() 可能因校时回退出现负耗时。',
        'datetime.fromtimestamp(time.time()) 与 datetime.now() 等价，后者更直观。',
      ],
      related: ['sleep'],
      tags: ['计时', '性能', '时间戳'],
    },
    {
      name: '本地时间', sig: "time.localtime(ts) / time.strftime('%Y-%m-%d', t)",
      brief: '时间戳转本地时间结构并格式化。',
      examples: [
        { title: '', code: `import time\nt = time.localtime()                       # 当前本地时间结构\nt = time.localtime(1716189025)             # 指定时间戳\nprint(time.strftime('%Y-%m-%d %H:%M:%S', t))\nprint(t.tm_year, t.tm_mon, t.tm_mday)` },
      ],
      pitfalls: [
        '新代码更推荐 datetime：<code>datetime.fromtimestamp(ts).strftime(...)</code>，语义更清楚。',
        'time.gmtime 是 UTC 版本， localtime 是本地时区版本，别混用。',
      ],
      related: ['计时'],
      tags: ['时间戳', '格式化'],
    },
  ],
});

MODULES.push({
  id: 'collections', name: 'collections', icon: '🧰', category: '标准库',
  doc: 'https://docs.python.org/zh-cn/3/library/collections.html',
  desc: '增强容器：计数器、默认字典、双端队列、命名元组。',
  install: false,
  entries: [
    {
      name: 'Counter', sig: "Counter(iterable) / c.most_common(n) / c['key']",
      brief: '频数统计神器：一行代码数出现次数。',
      examples: [
        { title: '', code: `from collections import Counter\nwords = ['apple', 'banana', 'apple', 'cherry', 'apple']\nc = Counter(words)\nprint(c)                    # Counter({'apple': 3, ...})\nprint(c.most_common(2))     # [('apple', 3), ('banana', 1)]\nprint(c['apple'])           # 3\nprint(c['nope'])            # 0  不存在返回0不报错\nprint(c.total())            # 总数(3.10+)\n# 字符串也能数: Counter('aabbb') -> {'b':3,'a':2}` },
      ],
      pitfalls: [
        '<code>c[不存在的键]</code> 返回 0 且<b>不会</b>往里加键；但 <code>dict(c)</code> 前用 in 判断更清晰。',
        'Counter 支持加减：<code>c1 - c2</code> 只保留正计数，做差异对比很好用。',
      ],
      related: ['defaultdict'],
      tags: ['计数', '统计', '频数'],
    },
    {
      name: 'defaultdict', sig: "defaultdict(list) / defaultdict(int) / defaultdict(lambda: '默认值')",
      brief: '带默认值的字典：访问不存在的键时自动创建默认值，分组聚合神器。',
      examples: [
        { title: '分组的标准写法', code: `from collections import defaultdict\ngroups = defaultdict(list)\nfor name, city in [('张三', '北京'), ('李四', '上海'), ('王五', '北京')]:\n    groups[city].append(name)\nprint(dict(groups))     # {'北京': ['张三','王五'], '上海': ['李四']}\n\n# 计数\ncnt = defaultdict(int)\nfor w in words:\n    cnt[w] += 1          # 不用先初始化` },
      ],
      pitfalls: [
        '<b>访问过不存在的键就会真的创建它</b>（带默认值），<code>len(d)</code> 会因此变大 —— 只想读用 <code>d.get(k)</code>。',
        '默认值是"工厂调用"的结果：<code>defaultdict(list)</code> 不能写成 <code>defaultdict([])</code>（会立即求值并报错）。',
      ],
      related: ['Counter'],
      tags: ['字典', '分组', '默认值'],
    },
    {
      name: 'deque', sig: "deque(iterable, maxlen=None) / d.appendleft(x) / d.popleft()",
      brief: '双端队列：两端增删都是 O(1)，队列/滑动窗口专用。',
      examples: [
        { title: '', code: `from collections import deque\n\n# 用作队列(先进先出):\nq = deque()\nq.append('a'); q.append('b')\nprint(q.popleft())       # 'a'\n\n# 定长滑动窗口:\nhistory = deque(maxlen=3)\nfor i in range(5):\n    history.append(i)\n    print(list(history))    # 自动挤掉最老的` },
      ],
      pitfalls: [
        '<b>list.pop(0) 是 O(n)</b>，大量头部操作必须用 deque。',
        'maxlen 满后 append 自动丢弃另一端元素 —— 是特性不是 bug。',
        'deque 不支持切片 d[1:3]，需要切片就转 list。',
      ],
      related: ['Counter'],
      tags: ['队列', '双端', '滑动窗口'],
    },
    {
      name: 'namedtuple-OrderedDict', sig: "Point = namedtuple('Point', ['x', 'y']) / OrderedDict()",
      brief: '命名元组（带字段名的轻量记录）与有序字典。',
      examples: [
        { title: '', code: `from collections import namedtuple, OrderedDict\n\nRow = namedtuple('Row', ['name', 'score'])\nr = Row('张三', 95)\nprint(r.name, r.score)      # 按名访问, 比下标可读\nprint(r._asdict())          # 转字典\n\n# dataclasses(3.7+) 是更现代的替代:\n# from dataclasses import dataclass\n\nod = OrderedDict(a=1, b=2)\nod.move_to_end('a')         # 移到末尾, LRU 缓存常用` },
      ],
      pitfalls: [
        'Python 3.7 起普通 dict 就有序，OrderedDict 的"有序"优势没了，剩 move_to_end 等特有方法。',
        'namedtuple 字段名不能与 Python 关键字冲突，且不可变 —— 要可变记录用 dataclass。',
      ],
      related: ['deque'],
      tags: ['namedtuple', '有序字典'],
    },
  ],
});

MODULES.push({
  id: 'random', name: 'random', icon: '🎲', category: '标准库',
  doc: 'https://docs.python.org/zh-cn/3/library/random.html',
  desc: '伪随机数：随机整数、抽样、打乱、种子。',
  install: false,
  entries: [
    {
      name: '整数与抽样', sig: "random.randint(a, b) / random.randrange(a, b) / random.choice(seq) / random.choices(seq, k=n) / random.sample(seq, k=n)",
      brief: '随机整数与抽样三兄弟：choice 选一个、choices 可重复、sample 不重复。',
      examples: [
        { title: '', code: `import random\nprint(random.randint(1, 6))        # 1~6 含两端, 骰子\nprint(random.randrange(1, 6))      # 1~5, 不含 6!\nprint(random.choice(['a', 'b']))   # 随机选1个\nprint(random.choices([1,2,3], k=5))        # 有放回抽5个\nprint(random.sample(range(100), 5))        # 无放回抽5个(不重复)\nprint(random.random())             # [0,1) 浮点` },
      ],
      pitfalls: [
        '<b>randint 双闭区间，randrange 右开区间</b> —— 最经典的 off-by-one 来源。',
        'sample 的 k 不能大于总体长度，报 ValueError；可重复抽样用 choices。',
        'sample 返回新列表不改动原列表；shuffle 是原地打乱。',
      ],
      related: ['shuffle-seed'],
      tags: ['随机', '抽样', '整数'],
    },
    {
      name: 'shuffle-seed', sig: 'random.shuffle(lst) / random.seed(42) / random.uniform(a, b)',
      brief: '原地打乱、固定种子、区间浮点。',
      examples: [
        { title: '', code: `import random\n\nrandom.seed(42)            # 固定种子 => 每次运行结果一样(复现实验)\nnums = list(range(10))\nrandom.shuffle(nums)       # 原地打乱, 返回 None!\nprint(nums)\n\nprint(random.uniform(1.5, 3.5))   # 区间浮点` },
      ],
      pitfalls: [
        '<code>shuffle 返回 None</code>（就地修改），写 <code>lst = random.shuffle(lst)</code> 会把列表变成 None！',
        'seed 只在同一进程内保证复现；numpy/torch 有各自独立的种子，都要设。',
        '<b>random 不能用于密码/token</b>（可预测），安全场景用 secrets 模块。',
      ],
      related: ['整数与抽样'],
      tags: ['打乱', '种子', '复现'],
    },
  ],
});
