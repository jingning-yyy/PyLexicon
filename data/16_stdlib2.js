/* 标准库补强：functools / itertools / copy / sys / subprocess / dataclasses / uuid */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'functools', name: 'functools', icon: '🧩', category: '标准库',
  doc: 'https://docs.python.org/zh-cn/3/library/functools.html',
  desc: '函数工具集：缓存加速、固定参数、装饰器辅助。',
  install: false,
  entries: [
    {
      name: 'lru_cache', sig: '@lru_cache(maxsize=None) / from functools import cache  # 3.9+=无限缓存',
      brief: '给函数加结果缓存：同参数直接返回，递归/重复计算神器。',
      examples: [
        { title: '', code: `from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef fib(n):\n    return n if n < 2 else fib(n - 1) + fib(n - 2)\n\nprint(fib(100))    # 秒出(没缓存的话要算到天荒地老)\n\nfib.cache_clear()                    # 清缓存\nfib.cache_info()                     # 命中率查看` },
      ],
      pitfalls: [
        '<b>参数必须可哈希</b>：传 list/dict 直接 TypeError，换 tuple 或改函数签名。',
        '缓存不自动失效：函数依赖外部状态（文件/时间/数据库）时缓存会"说谎"，别乱加。',
        '递归深度大时配合 sys.setrecursionlimit 或改循环，缓存救不了栈溢出。',
      ],
      related: ['partial'],
      tags: ['缓存', '递归', '加速'],
    },
    {
      name: 'partial', sig: 'partial(func, *args, **kwargs)',
      brief: '固定函数的部分参数，生成新函数（配 pandas apply / 排序 key 常用）。',
      examples: [
        { title: '', code: `from functools import partial\n\ndef power(base, exp):\n    return base ** exp\n\nsquare = partial(power, exp=2)\nprint(square(9))            # 81\n\n# 常见场景: 给 key/apply 传带参数的函数\nimport pandas as pd\ndf['a'].apply(partial(round, ndigits=1))   # round(x, 1)` },
      ],
      pitfalls: [
        'partial 固定的是<b>最左边的位置参数</b>（或用关键字任意位置）；想固定后面的参数只能用关键字形式。',
      ],
      related: ['lru_cache'],
      tags: ['偏函数', '固定参数'],
    },
    {
      name: 'wraps', sig: '@wraps(func)  # 装饰器内层使用',
      brief: '写装饰器时保留原函数的名称和文档。',
      examples: [
        { title: '', code: `from functools import wraps\nimport time\n\ndef timer(func):\n    @wraps(func)                 # 不加: 装饰后 __name__ 变成 'wrapper'\n    def wrapper(*args, **kwargs):\n        t = time.perf_counter()\n        r = func(*args, **kwargs)\n        print(func.__name__, time.perf_counter() - t)\n        return r\n    return wrapper\n\n@timer\ndef process():\n    ...` },
      ],
      pitfalls: [
        '不加 wraps，被装饰函数的 <code>__name__/__doc__</code> 全变成 wrapper 的，调试和文档生成都会糊涂。',
      ],
      related: ['lru_cache'],
      tags: ['装饰器', '调试'],
    },
    {
      name: 'reduce', sig: 'from functools import reduce; reduce(函数, 序列, 初始值)',
      brief: '累进归约：把序列滚成一个值（连乘、合并的祖师爷）。',
      examples: [
        { title: '', code: `from functools import reduce\n\nreduce(lambda a, b: a * b, [1, 2, 3, 4])     # 24  连乘 (((1*2)*3)*4)\nreduce(lambda a, b: a + b, [1, 2, 3], 10)    # 16  带初始值 10\n\n# 实用例: 多个字典合并 / 多个集合求并\ndicts = [{'a': 1}, {'b': 2}, {'a': 3}]\nmerged = reduce(lambda x, y: {**x, **y}, dicts)   # {'a': 3, 'b': 2}\n\nsets = [{1, 2}, {2, 3}, {3, 4}]\nreduce(lambda x, y: x | y, sets)                  # {1, 2, 3, 4}` },
      ],
      pitfalls: [
        'reduce 在 <b>functools 里要 import</b>（Py2 时代是内置；直接用报 NameError 就是忘了导入）。',
        '简单求和/连乘优先 sum()、math.prod()，可读性更好；reduce 留给"自定义合并规则"的场景。',
        '空序列且没给初始值会报 TypeError——写上初始值最稳。',
      ],
      related: ['partial', 'lru_cache'],
      tags: ['reduce', '归约', '合并'],
    },
  ],
});

MODULES.push({
  id: 'itertools', name: 'itertools', icon: '♾️', category: '标准库',
  doc: 'https://docs.python.org/zh-cn/3/library/itertools.html',
  desc: '迭代器工具集：拼接、组合、分组，处理序列的高级积木（全是生成器，省内存）。',
  install: false,
  entries: [
    {
      name: 'chain-product', sig: 'chain(*iterables) / product(*iterables) / combinations(xs, r)',
      brief: '拼接、笛卡尔积、组合排列。',
      examples: [
        { title: '', code: `from itertools import chain, product, combinations, permutations\n\nlist(chain([1, 2], [3, 4]))              # [1,2,3,4] 拼接多个可迭代\nlist(product('AB', '12'))                # 笛卡尔积: A1 A2 B1 B2 (替代双层循环)\nlist(combinations([1, 2, 3], 2))         # 组合: (1,2)(1,3)(2,3)\nlist(permutations([1, 2, 3], 2))         # 排列: (1,2)(2,1)...` },
      ],
      pitfalls: [
        '全部返回<b>迭代器</b>，要 list() 才能看内容且只能遍历一次。',
        'combinations 无序对（(1,2) 就没有 (2,1)），要顺序算排列用 permutations。',
      ],
      related: ['groupby'],
      tags: ['组合', '笛卡尔积', '拼接'],
    },
    {
      name: 'groupby', sig: 'groupby(已排序序列, key=函数)',
      brief: '相邻分组：先排序再用，否则分组碎片化。',
      examples: [
        { title: '', code: `from itertools import groupby\n\nrows = [('a', 1), ('a', 2), ('b', 3), ('b', 4)]\n# 数据必须先按 key 排好序!\nfor k, group in groupby(rows, key=lambda r: r[0]):\n    print(k, list(group))     # a [('a',1),('a',2)]  b [('b',3),('b',4)]` },
      ],
      pitfalls: [
        '<b>只对"相邻"元素分组</b>：数据没排序会得到一堆碎组 —— 用之前 sorted(data, key=...)，最大坑没有之一。',
        'group 迭代器随主迭代器推进而失效，循环内要 list(group) 先固化。',
      ],
      related: ['chain-product'],
      tags: ['分组', '排序'],
    },
    {
      name: 'islice', sig: 'islice(可迭代, stop) / islice(可迭代, start, stop, step)',
      brief: '给迭代器做切片（无限流/生成器专用，list 切片替代）。',
      examples: [
        { title: '', code: `from itertools import islice, count\n\nlist(islice(count(10), 5))       # [10,11,12,13,14] 从无限数列取5个\n\n# 读取大文件前100行:\nwith open('big.log') as f:\n    head = list(islice(f, 100))` },
      ],
      pitfalls: [
        'islice 同样是迭代器，islice(f, 100) 之后文件指针已前移。',
        '负数索引/负步长不支持（不完整迭代器没有"长度"概念）。',
      ],
      related: ['chain-product'],
      tags: ['切片', '无限流'],
    },
  ],
});

MODULES.push({
  id: 'copy', name: 'copy', icon: '📑', category: '标准库',
  doc: 'https://docs.python.org/zh-cn/3/library/copy.html',
  desc: '浅拷贝与深拷贝：解决"改 b 结果 a 也变了"的引用问题。',
  install: false,
  entries: [
    {
      name: '浅vs深', sig: 'b = a (引用) / b = a.copy() / list(a) (浅) / copy.deepcopy(a) (深)',
      brief: '三种"复制"的区别，嵌套结构必用深拷贝。',
      examples: [
        { title: '', code: `import copy\n\na = [1, [2, 3]]\nb = a                    # 不是拷贝! 同一个对象, 改b的a也变\nb = a.copy()             # 浅拷贝: 外层独立, 内层[2,3]仍共享\nc = copy.deepcopy(a)     # 深拷贝: 完全独立\n\nb[0] = 99\nc[1].append(4)\nprint(a)                 # [1, [2, 3]]  a 没被 c 影响` },
      ],
      pitfalls: [
        '<b>嵌套结构必须 deepcopy</b>：列表套列表/字典套字典的 .copy() 内层还是共享的 —— "改 b 把 a 改了"的元凶。',
        '<code>b = a</code> 根本不是拷贝只是起别名；判断身份用 <code>a is b</code>。',
        'pandas/numpy 的 .copy() 默认就是深拷贝，和 list.copy() 行为不同。',
      ],
      related: [],
      tags: ['拷贝', '引用', '深拷贝'],
    },
  ],
});

MODULES.push({
  id: 'sys', name: 'sys', icon: '🖥️', category: '标准库',
  doc: 'https://docs.python.org/zh-cn/3/library/sys.html',
  desc: 'Python 解释器接口：命令行参数、模块搜索路径、退出码。',
  install: false,
  entries: [
    {
      name: 'argv', sig: "sys.argv  ->  ['脚本名', '参数1', ...]",
      brief: '原始命令行参数列表（简单场景够用，复杂用 argparse）。',
      examples: [
        { title: '', code: `import sys\n\n# python job.py 2024-05-20 full\nprint(sys.argv)      # ['job.py', '2024-05-20', 'full']\n\nif len(sys.argv) < 2:\n    sys.exit('用法: python job.py 日期 [模式]')   # 退出并打印错误\ndate = sys.argv[1]` },
      ],
      pitfalls: [
        'argv[0] 是<b>脚本名</b>，真正的参数从 [1] 开始。',
        '参数全是字符串，要数字自己 int()；参数多/有选项时换 argparse。',
      ],
      related: ['path'],
      tags: ['命令行', '参数'],
    },
    {
      name: 'path', sig: "sys.path.append('/data/libs') / sys.executable",
      brief: '模块搜索路径：import 找不到包时看这里。',
      examples: [
        { title: '', code: `import sys\n\nprint(sys.path)      # import 的搜索顺序\n# 临时导入隔壁目录的模块(快捷但hack):\nsys.path.append(r'D:\\my_libs')\nimport my_utils\n\nprint(sys.executable)   # 当前用的哪个python(排查环境问题神器)\nprint(sys.version)` },
      ],
      pitfalls: [
        'sys.path.append 是<b>临时</b>的（进程结束就没），长期方案是装包或配 PYTHONPATH。',
        '排查"装了包却 import 不到"：print(sys.executable) 确认 jupyter/ide 用的解释器和你 pip 的是不是同一个。',
      ],
      related: ['argv'],
      tags: ['路径', 'import', '环境'],
    },
    {
      name: 'exit', sig: 'sys.exit(0) / sys.exit("错误信息")',
      brief: '退出程序并返回退出码（0=成功）。',
      examples: [
        { title: '', code: `import sys\n\nif not data_ok:\n    sys.exit('数据校验失败')     # 打印信息并以退出码1结束\n\nsys.exit(0)                      # 正常结束(可选)` },
      ],
      pitfalls: [
        '退出码给调度系统看：0 成功、非 0 失败；crontab/airflow 靠它判断任务成败。',
        'sys.exit 抛的是 SystemExit，被裸 except Exception 捕不到（它不是 Exception 子类），一般不用管。',
      ],
      related: ['argv'],
      tags: ['退出码', '调度'],
    },
  ],
});

MODULES.push({
  id: 'subprocess', name: 'subprocess', icon: '⌨️', category: '标准库',
  doc: 'https://docs.python.org/zh-cn/3/library/subprocess.html',
  desc: '执行外部命令的标准姿势：调用 ffmpeg/git/另一个 python，拿输出和退出码。',
  install: false,
  aliases: ['命令行', 'shell'],
  entries: [
    {
      name: 'run', sig: "subprocess.run(['cmd', 'arg'], capture_output=True, text=True, timeout=60)",
      brief: '现代标准接口：执行命令并收集结果。',
      examples: [
        { title: '', code: `import subprocess\n\nr = subprocess.run(\n    ['ping', 'www.baidu.com', '-n', '1'],   # 参数用列表, 不要拼字符串\n    capture_output=True,    # 捕获输出\n    text=True,              # 输出转 str(否则是bytes)\n    timeout=30,\n)\nprint(r.returncode)     # 0=成功\nprint(r.stdout[:100])\nprint(r.stderr)` },
      ],
      pitfalls: [
        '<b>参数用列表而不是拼字符串</b>：["ping", "x"] 安全可靠；写 shell=True + 字符串有注入风险且跨平台坑多。',
        '<b>text=True 记得加</b>，否则 stdout 是 bytes；Windows 中文输出再配 encoding="gbk"。',
        'check=True 时非 0 退出码抛 CalledProcessError，适合"失败就该停"的脚本。',
      ],
      related: ['超时异常'],
      tags: ['命令', '执行', '输出'],
    },
    {
      name: '超时异常', sig: 'timeout=秒 / subprocess.TimeoutExpired / check=True',
      brief: '给外部命令加超时和失败检查。',
      examples: [
        { title: '', code: `import subprocess\n\ntry:\n    r = subprocess.run(['ffmpeg', '-i', 'a.mp4', 'b.mp4'],\n                       capture_output=True, text=True,\n                       timeout=600, check=True)\nexcept subprocess.TimeoutExpired:\n    print('命令超时被杀掉')\nexcept subprocess.CalledProcessError as e:\n    print('失败:', e.returncode)\n    print(e.stderr[-500:])     # 尾部通常是报错信息` },
      ],
      pitfalls: [
        '超时后进程被 kill 但<b>它派生的子进程不一定死</b>（ffmpeg 类还好）。',
        'ffmpeg/git 报错信息都在 stderr 的<b>最后几行</b>，从头 print 很难找。',
      ],
      related: ['run'],
      tags: ['超时', '异常', 'ffmpeg'],
    },
    {
      name: '典型场景', sig: '调用另一个 python 脚本 / git / 批处理',
      brief: '常见组合用法。',
      examples: [
        { title: '', code: `import subprocess, sys\n\n# 跑另一个脚本(用当前解释器):\nsubprocess.run([sys.executable, 'worker.py', '--date', '2024-05'], check=True)\n\n# git 拉最新代码:\nr = subprocess.run(['git', 'pull'], capture_output=True, text=True)\nprint(r.stdout)\n\n# 逐行实时读取输出(长任务):\nproc = subprocess.Popen(['ping', 'x', '-t'], stdout=subprocess.PIPE, text=True)\nfor line in proc.stdout:\n    print(line.strip())` },
      ],
      pitfalls: [
        '跑 python 脚本用 <code>sys.executable</code> 而不是硬编码 "python"，保证同一个环境。',
        'Popen 的逐行读取是阻塞式的，进程不结束且不输出时会卡住 —— 加 timeout 或异步方案。',
      ],
      related: ['run'],
      tags: ['脚本', 'git', 'popen'],
    },
  ],
});

MODULES.push({
  id: 'dataclasses', name: 'dataclasses', icon: '🧱', category: '标准库',
  doc: 'https://docs.python.org/zh-cn/3/library/dataclasses.html',
  desc: '数据类：一个装饰器自动生成 __init__/__repr__/比较，配置项和记录对象的标准写法。',
  install: false,
  entries: [
    {
      name: 'dataclass基础', sig: '@dataclass / class Config: host: str = "127.0.0.1"; port: int = 8080',
      brief: '声明字段自动生成初始化和打印。',
      examples: [
        { title: '', code: `from dataclasses import dataclass\n\n@dataclass\nclass Task:\n    name: str\n    cron: str = '0 9 * * *'      # 有默认值的字段必须在无默认值之后\n    retries: int = 3\n\nt = Task('日报', retries=5)\nprint(t)            # Task(name='日报', cron='0 9 * * *', retries=5)\nprint(t == Task('日报', retries=5))   # True, 自动按字段比较` },
      ],
      pitfalls: [
        '<b>字段必须有类型注解</b>（哪怕写 any），这是 dataclass 识别字段的依据。',
        '有默认值的字段必须排在无默认值字段后面，和函数参数同规则。',
      ],
      related: ['默认值与field'],
      tags: ['数据类', '配置', 'record'],
    },
    {
      name: '默认值与field', sig: "field(default_factory=list) / field(repr=False) / asdict(obj)",
      brief: '可变默认值、隐藏字段、转字典。',
      examples: [
        { title: '', code: `from dataclasses import dataclass, field, asdict\n\n@dataclass\nclass Job:\n    name: str\n    tags: list = field(default_factory=list)   # 可变默认必须这样写\n    secret: str = field(default='', repr=False)  # 打印时隐藏\n\nj = Job('同步', tags=['daily'])\nprint(asdict(j))     # {'name': '同步', 'tags': ['daily'], 'secret': ''}` },
      ],
      pitfalls: [
        '<b>tags: list = [] 是错误写法</b>（所有实例共享同一个列表，dataclass 直接报 ValueError），必须 default_factory。',
        'frozen=True 让实例不可变（可做字典键/防误改）。',
      ],
      related: ['dataclass基础'],
      tags: ['默认值', 'asdict'],
    },
  ],
});

MODULES.push({
  id: 'uuid', name: 'uuid', icon: '🆔', category: '标准库',
  doc: 'https://docs.python.org/zh-cn/3/library/uuid.html',
  desc: '生成全局唯一 ID：文件命名、请求追踪、去重标识。',
  install: false,
  entries: [
    {
      name: 'uuid4', sig: "uuid.uuid4() / uuid.uuid4().hex",
      brief: '随机唯一 ID（最常用的一种）。',
      examples: [
        { title: '', code: `import uuid\n\nu = uuid.uuid4()\nprint(u)        # 3f2b8c4e-...  带连字符\nprint(u.hex)    # 32位无连字符, 数据库键/文件名常用\n\n# 短ID(牺牲唯一性换长度):\nprint(u.hex[:8])   # 仅小规模去重用, 大规模必撞` },
      ],
      pitfalls: [
        '<b>hex[:8] 前 8 位只在百万级以下"基本不撞"</b>，当强唯一键用必须存完整值。',
        'uuid1 泄露 MAC 地址且有序，业务场景几乎都该用 uuid4。',
      ],
      related: [],
      tags: ['唯一id', 'uuid4', '命名'],
    },
  ],
});
