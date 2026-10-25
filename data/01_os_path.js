/* 文件与系统：os / pathlib / glob / shutil */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'os', name: 'os', icon: '🗂️', category: '文件与系统',
  doc: 'https://docs.python.org/zh-cn/3/library/os.html',
  desc: '与操作系统交互：目录、文件、路径、环境变量、执行命令。',
  install: false,
  tips: [
    '老代码大量使用 <code>os.path</code>，新代码推荐 <b>pathlib.Path</b>（见左侧 pathlib），两者可以混用但风格别混。',
    '<code>os.remove / rmdir / renamed</code> 一类删除、改名操作<b>不可恢复且不进回收站</b>，批量操作前先打印确认。',
  ],
  entries: [
    {
      name: 'getcwd', sig: 'os.getcwd()',
      brief: '获取当前工作目录（进程运行时所在目录，不一定是脚本所在目录）。',
      examples: [
        { title: '查看当前目录', code: `import os\nprint(os.getcwd())        # 例如 D:\\work\nos.chdir(r'D:\\data')      # 切换工作目录\nprint(os.getcwd())` },
      ],
      pitfalls: [
        '工作目录 ≠ 脚本所在目录：双击运行、定时任务、从别的目录启动时经常和你想的不一样。',
        '要"脚本文件所在的目录"应该用：<code>os.path.dirname(os.path.abspath(__file__))</code>',
      ],
      related: ['listdir', 'path.join'],
      tags: ['目录', '路径', '工作目录'],
    },
    {
      name: 'listdir', sig: 'os.listdir(path=".")',
      brief: '列出目录下的所有条目名字（文件+文件夹），不递归子目录。',
      params: [
        { n: 'path', t: 'str / PathLike', d: '目标目录', dflt: "'.'" },
      ],
      returns: '<code>list[str]</code>，只是<b>名字</b>不是完整路径',
      examples: [
        { title: '列出并筛选 csv 文件', code: `import os\nnames = os.listdir('data')\ncsvs = [n for n in names if n.endswith('.csv')]\nprint(csvs)\n# 需要完整路径时自己拼接：\ncsv_paths = [os.path.join('data', n) for n in csvs]` },
      ],
      pitfalls: [
        '返回的是文件名不是路径，拿去 open 前要 <code>os.path.join</code>。',
        '不保证排序（按文件系统返回顺序），需要顺序时用 <code>sorted(os.listdir(...))</code>。',
        '不会递归进子目录；递归遍历用 <code>os.walk</code>。',
      ],
      related: ['walk', 'makedirs'],
      tags: ['目录', '遍历', '文件列表'],
    },
    {
      name: 'makedirs', sig: 'os.makedirs(name, exist_ok=False)',
      brief: '递归创建目录（父目录不存在会一并创建）。',
      params: [
        { n: 'name', t: 'str', d: '要创建的目录路径' },
        { n: 'exist_ok', t: 'bool', d: '目录已存在时是否不报错', dflt: 'False' },
      ],
      examples: [
        { title: '安全创建输出目录', code: `import os\nos.makedirs('output/figures/2024', exist_ok=True)  # 三层一起建\n# os.mkdir('output/figures/2024')  # 错误示范：父目录不存在直接报错，且只建一层` },
      ],
      pitfalls: [
        '<code>os.mkdir</code> 只能建一层，父目录不存在报 FileNotFoundError；日常建议无脑用 <code>makedirs(..., exist_ok=True)</code>。',
        '<code>exist_ok=False</code>（默认）时目录已存在会抛 FileExistsError。',
      ],
      related: ['remove', 'rename'],
      tags: ['创建目录', 'mkdir'],
    },
    {
      name: 'walk', sig: 'os.walk(top, topdown=True)',
      brief: '递归遍历目录树，逐层产生 (当前目录, 子目录列表, 文件名列表)。',
      params: [
        { n: 'top', t: 'str', d: '起始目录' },
        { n: 'topdown', t: 'bool', d: 'True 自上而下（可借此剪枝）', dflt: 'True' },
      ],
      returns: '生成器，每次 yield <code>(dirpath, dirnames, filenames)</code>',
      examples: [
        { title: '统计项目下所有 py 文件', code: `import os\nfor dirpath, dirnames, filenames in os.walk(r'D:\\my_project'):\n    # 剪枝：跳过虚拟环境和缓存目录（必须原地修改 dirnames）\n    dirnames[:] = [d for d in dirnames if d not in ('.git', '__pycache__', 'venv')]\n    for f in filenames:\n        if f.endswith('.py'):\n            print(os.path.join(dirpath, f))` },
      ],
      pitfalls: [
        '它是<b>生成器只能遍历一次</b>，要复用先 <code>list(os.walk(top))</code>。',
        '剪枝必须写 <code>dirnames[:] = [...]</code>（原地改），写成 <code>dirnames = [...]</code> 不会生效。',
        '<code>dirnames</code> 和 <code>filenames</code> 是名字不是路径。',
      ],
      related: ['listdir', 'path.join'],
      tags: ['遍历', '递归', '目录树'],
    },
    {
      name: 'rename', sig: 'os.rename(src, dst)',
      brief: '重命名文件或目录（也可当作同盘移动）。',
      examples: [
        { title: '批量重命名', code: `import os\nfor i, f in enumerate(sorted(os.listdir('imgs'))):\n    if f.endswith('.jpg'):\n        os.rename(os.path.join('imgs', f), os.path.join('imgs', f'{i:03d}.jpg'))` },
      ],
      pitfalls: [
        '目标名已存在时：Windows 直接报 FileExistsError；想覆盖用 <code>os.replace(src, dst)</code>（跨平台一致）。',
        '跨盘符（如 C: → D:）<b>不能</b> rename，报 OSError；跨盘移动用 <code>shutil.move</code>。',
      ],
      related: ['remove', 'path.join'],
      tags: ['重命名', '移动', '批量改名'],
    },
    {
      name: 'remove', sig: 'os.remove(path)',
      brief: '删除文件（不进回收站，不可恢复）。',
      examples: [
        { title: '清理临时文件', code: `import os, glob\nfor f in glob.glob('temp/*.tmp'):\n    os.remove(f)` },
      ],
      pitfalls: [
        '只能删<b>文件</b>；删空目录用 <code>os.rmdir</code>，删整个目录树用 <code>shutil.rmtree</code>。',
        'Windows 下文件被 Excel/其他程序打开时报 PermissionError，先关闭占用程序。',
      ],
      related: ['rename', 'makedirs'],
      tags: ['删除', '文件'],
    },
    {
      name: 'environ', sig: "os.environ['KEY'] / os.environ.get('KEY', default)",
      brief: '环境变量的字典式接口，读、写、设默认值。',
      examples: [
        { title: '读取与设置环境变量', code: `import os\nprint(os.environ.get('PYTHONPATH', '未设置'))\nos.environ['MY_VAR'] = '123'      # 本进程及其子进程可见\nprint(os.environ['MY_VAR'])` },
      ],
      pitfalls: [
        '<code>os.environ["K"]</code> 键不存在直接 KeyError，不确定存在与否用 <code>.get()</code>。',
        '这里设置的变量只对当前进程生效，<b>不是</b>改系统环境变量（那要去系统设置）。',
        '数据库密码等敏感信息建议从环境变量读取，别写死在代码里。',
      ],
      related: ['system'],
      tags: ['环境变量', '配置', '密钥'],
    },
    {
      name: 'system', sig: 'os.system(command)',
      brief: '执行系统命令字符串，返回退出码（0 通常表示成功）。',
      examples: [
        { title: '执行命令', code: `import os\nret = os.system('ping www.baidu.com -n 1')  # Windows\nprint('退出码', ret)` },
      ],
      pitfalls: [
        '<b>拿不到标准输出</b>；要拿输出用 subprocess：<code>subprocess.run(cmd, shell=True, capture_output=True, text=True)</code>',
        'Windows 下中文输出乱码是因为控制台编码是 GBK；优先用 subprocess 并指定 encoding。',
        '命令里有用户输入时有命令注入风险，别拼字符串。',
      ],
      related: ['environ'],
      tags: ['命令', 'shell', 'subprocess'],
    },
    {
      name: 'path.join', sig: 'os.path.join(path, *paths)',
      brief: '智能拼接路径（自动处理分隔符），最常用的路径函数。',
      examples: [
        { title: '拼接路径', code: `import os\np = os.path.join('D:\\\\data', '2024', 'a.csv')\nprint(p)   # D:\\data\\2024\\a.csv （Windows 下）` },
      ],
      pitfalls: [
        '后面的参数如果是<b>绝对路径</b>，会丢弃之前所有部分：<code>os.path.join("D:/a", "C:/b") → "C:/b"</code>',
        '写 Python 代码时路径里用 <code>/</code> 即可，Windows 也认；Python 字符串里单独的 <code>\\</code> 会有转义问题（如 \\t、\\n），保险写法是原始字符串 <code>r"D:\\data"</code>。',
        '更现代的写法是 pathlib：<code>Path("D:/data") / "2024" / "a.csv"</code>',
      ],
      related: ['path.exists', 'path.splitext'],
      tags: ['路径', '拼接', 'join'],
    },
    {
      name: 'path.exists', sig: 'os.path.exists(path) / os.path.isfile(path) / os.path.isdir(path)',
      brief: '判断路径/文件/文件夹是否存在。',
      examples: [
        { title: '存在性判断', code: `import os\nif os.path.exists('data.csv'):\n    print('存在')\nprint(os.path.isfile('data.csv'))   # 是文件吗\nprint(os.path.isdir('data'))        # 是文件夹吗` },
      ],
      pitfalls: [
        '<code>exists</code> 对文件和文件夹都返回 True，区分时要配 <code>isfile / isdir</code>。',
        '指向损坏的快捷方式/软链接时 exists 返回 False。',
        '判断之后文件可能又被删（竞态），open 时最好还是 try/except FileNotFoundError。',
      ],
      related: ['path.join', 'path.getsize'],
      tags: ['存在', '判断', '文件'],
    },
    {
      name: 'path.splitext', sig: 'os.path.splitext(path)',
      brief: '把路径拆成 (主名, 扩展名) 两部分，扩展名带点。',
      examples: [
        { title: '拆分扩展名', code: `import os\nprint(os.path.splitext('a/b/report.xlsx'))  # ('a/b/report', '.xlsx')\nprint(os.path.splitext('archive.tar.gz'))   # ('archive.tar', '.gz')\nname, ext = os.path.splitext('data.csv')\nprint(name + '_backup' + ext)               # data_backup.csv` },
      ],
      pitfalls: [
        '<code>splitext(".gitignore")</code> 返回 <code>(".gitignore", "")</code> —— 开头的点不算扩展名。',
        '<code>.tar.gz</code> 这类双扩展只取最后一个 <code>.gz</code>。',
        '想一次拿文件名/目录名：配合 <code>os.path.basename / dirname</code>。',
      ],
      related: ['path.join', 'path.exists'],
      tags: ['扩展名', '拆分', '后缀'],
    },
    {
      name: 'path.getsize', sig: 'os.path.getsize(path) / os.path.getmtime(path)',
      brief: '获取文件大小（字节）和最后修改时间（时间戳）。',
      examples: [
        { title: '查看文件大小与修改时间', code: `import os\nfrom datetime import datetime\nsize = os.path.getsize('data.csv')\nmtime = os.path.getmtime('data.csv')\nprint(size / 1024 / 1024, 'MB')\nprint(datetime.fromtimestamp(mtime))   # 2024-05-01 10:23:00` },
      ],
      pitfalls: [
        '<code>getsize</code> 单位是字节，除以 1024**2 才是 MB。',
        '<code>getmtime</code> 返回时间戳（浮点数），不是 datetime，要用 <code>datetime.fromtimestamp()</code> 转换。',
      ],
      related: ['path.exists'],
      tags: ['大小', '时间', '文件信息'],
    },
    {
      name: 'path.basename', sig: "os.path.basename(p) / os.path.dirname(p) / os.replace(src, dst)",
      brief: '取文件名/目录名；os.replace 带覆盖的安全重命名。',
      examples: [
        { title: '', code: `import os
p = 'D:/data/report.xlsx'
print(os.path.basename(p))    # report.xlsx
print(os.path.dirname(p))     # D:/data

# replace: 目标存在会覆盖(比 rename 省心, 跨平台一致)
os.replace('draft.xlsx', 'final.xlsx')` },
      ],
      pitfalls: [
        'basename/dirname 只做<b>字符串处理</b>不访问磁盘，路径不存在也不报错。',
        '<b>os.replace 在目标存在时直接覆盖</b>（os.rename 在 Windows 会报错），批量覆盖写用它。',
      ],
      related: ['path.splitext', 'path.join', 'rename'],
      tags: ['文件名', '目录名', '覆盖'],
    },
  ],
});

MODULES.push({
  id: 'pathlib', name: 'pathlib', icon: '🛤️', category: '文件与系统',
  doc: 'https://docs.python.org/zh-cn/3/library/pathlib.html',
  desc: '面向对象的路径操作，os.path 的现代替代品，用 / 拼路径，链式调用一切。',
  install: false,
  aliases: ['path', 'Path', 'os.path 替代'],
  tips: [
    '<code>from pathlib import Path</code> 是固定开场；Path 对象可以直接传给 open、pandas 等（几乎所有库都支持）。',
    'Path 对象与字符串不能直接混算：Path + str 会报错，str + Path 也报错，统一转 str() 再拼。',
  ],
  entries: [
    {
      name: 'Path', sig: "Path('dir') / 'file.txt'  或  Path('dir', 'file.txt')",
      brief: '构造路径对象，用 / 运算符拼接，替代 os.path.join。',
      examples: [
        { title: '构造与拼接', code: `from pathlib import Path\np = Path('D:/data') / '2024' / 'a.csv'\nprint(p)              # D:\\data\\2024\\a.csv (Windows)\nprint(type(p))        # <class 'pathlib.WindowsPath'>\nprint(str(p))         # 需要字符串时显式转` },
      ],
      pitfalls: [
        '<code>/</code> 两侧至少一边必须是 Path 对象，两个纯字符串相加/相除还是老样子报错。',
        '<code>Path("D:/data")</code> 和 <code>Path("D:\\\\data")</code> 等价；在代码里写 Windows 反斜杠记得用原始字符串。',
      ],
      related: ['属性', 'exists'],
      tags: ['路径', '面向对象', '拼接'],
    },
    {
      name: '属性', sig: 'p.name / p.stem / p.suffix / p.parent / p.parents / p.drive / p.anchor',
      brief: '路径的各个组成部分，全是属性不用加括号。',
      examples: [
        { title: '拆解一个路径', code: `from pathlib import Path\np = Path('D:/data/report.xlsx')\nprint(p.name)     # report.xlsx   文件名\nprint(p.stem)     # report        主名（无扩展名）\nprint(p.suffix)   # .xlsx         扩展名（带点）\nprint(p.parent)   # D:\\data       父目录（还是 Path 对象，可继续 .parent）\nprint(p.exists())` },
      ],
      pitfalls: [
        '<code>suffix</code> 是 <code>".xlsx"</code> 带点，判断时别写成 == "xlsx"。',
        '<code>archive.tar.gz</code> 的 suffix 是 <code>".gz"</code>，多级扩展没有内置一次性取法。',
        '<code>p.parent</code> 返回 Path，想拿字符串要 <code>str(p.parent)</code>。',
      ],
      related: ['Path', 'glob'],
      tags: ['文件名', '扩展名', '父目录'],
    },
    {
      name: 'exists', sig: 'p.exists() / p.is_file() / p.is_dir() / p.is_symlink()',
      brief: '存在性判断（对比 os.path.exists，语义一样）。',
      examples: [
        { title: '', code: `from pathlib import Path\np = Path('data.csv')\nif p.exists() and p.is_file():\n    print('是存在的文件')` },
      ],
      pitfalls: [
        '这些是<b>方法要加括号</b>：<code>p.exists()</code>；写成 <code>p.exists</code> 拿到的是方法对象，if 判断永远为真。',
      ],
      related: ['属性', 'mkdir'],
      tags: ['存在', '判断'],
    },
    {
      name: 'mkdir', sig: 'p.mkdir(parents=False, exist_ok=False) / p.touch() / p.unlink(missing_ok=False)',
      brief: '创建目录、创建空文件、删除文件。',
      examples: [
        { title: '', code: `from pathlib import Path\nout = Path('output/figures')\nout.mkdir(parents=True, exist_ok=True)   # 递归创建，等价 os.makedirs\n(out / 'run.txt').touch()                 # 新建空文件\n(out / 'run.txt').unlink(missing_ok=True) # 删除文件(3.8+ 不存在也不报错)` },
      ],
      pitfalls: [
        '参数名和 os 不同：<code>parents</code>（复数）对应 makedirs 的递归行为，<code>exist_ok</code> 一样。',
        '删除目录是 <code>p.rmdir()</code>，但只能删空目录；删整棵树仍用 <code>shutil.rmtree(p)</code>。',
      ],
      related: ['exists', '属性'],
      tags: ['创建', '删除', '目录'],
    },
    {
      name: 'glob', sig: "p.glob('*.csv') / p.rglob('*.csv') / p.iterdir()",
      brief: '目录内容遍历：iterdir 列全部，glob 按模式（本级），rglob 递归所有子目录。',
      examples: [
        { title: '三种遍历', code: `from pathlib import Path\ndata = Path('data')\n\nfor f in data.iterdir():            # 所有直接子项（文件+文件夹）\n    print(f)\n\nfor f in data.glob('*.csv'):        # 本级所有 csv\n    print(f)\n\nfor f in data.rglob('*.csv'):       # 本级+所有子目录的 csv\n    print(f)` },
      ],
      pitfalls: [
        '三个都是<b>生成器只能遍历一次</b>；要复用先 <code>list(...)</code>。',
        '<code>glob</code> 不会递归，想递归要么 <code>rglob</code> 要么 <code>glob("**/*.csv")</code>。',
        '模式匹配大小写：Windows 上不敏感、Linux 上敏感，跨平台脚本注意。',
      ],
      related: ['属性', 'read_text'],
      tags: ['遍历', '通配符', '递归'],
    },
    {
      name: 'read_text', sig: "p.read_text(encoding='utf-8') / p.write_text(s) / p.read_bytes() / p.write_bytes(b)",
      brief: '一行代码读写整个文本/二进制文件，替代 open+read+close。',
      examples: [
        { title: '', code: `from pathlib import Path\np = Path('config.txt')\np.write_text('你好', encoding='utf-8')     # 覆盖写入\ns = p.read_text(encoding='utf-8')          # 一次性读出\nprint(s)\nPath('img.png').write_bytes(b'\\x89PNG...') # 二进制` },
      ],
      pitfalls: [
        '<code>write_text</code> 是<b>覆盖</b>不是追加；追加仍需 <code>open(p, "a")</code>。',
        '读中文文件不写 encoding 时按系统默认（Windows 常是 GBK）解码，容易 UnicodeDecodeError —— 显式 encoding 是好习惯。',
        '大文件别用（全量进内存），老老实实逐行迭代。',
      ],
      related: ['glob', 'mkdir'],
      tags: ['读写', '文件', '文本'],
    },
    {
      name: 'resolve', sig: 'p.resolve() / p.absolute()',
      brief: '转成绝对路径；resolve 还会解析 . .. 和符号链接。',
      examples: [
        { title: '', code: `from pathlib import Path\np = Path('./data/../config.txt')\nprint(p.resolve())    # D:\\work\\config.txt（基于当前工作目录展开）\nprint(Path(__file__).resolve().parent)   # 脚本所在目录（常用！）` },
      ],
      pitfalls: [
        '<code>resolve()</code> 按当前工作目录展开相对路径 —— 路径不存在也不报错（旧版本 strict 行为不同）。',
        '"脚本所在目录"的推荐写法：<code>Path(__file__).resolve().parent</code>。',
      ],
      related: ['Path', '属性'],
      tags: ['绝对路径', '相对路径'],
    },
    {
      name: 'with_suffix', sig: 'p.with_suffix(".csv") / p.with_name("new.txt") / p.rename(target) / p.stat()',
      brief: '改扩展名/文件名、重命名移动、读元数据。',
      examples: [
        { title: 'csv 转换文件名的小技巧', code: `from pathlib import Path\nfor f in Path('data').glob('*.xlsx'):\n    out = f.with_suffix('.csv')      # report.xlsx -> report.csv\n    f.rename(out)                    # 重命名（同盘）\nprint(f.stat().st_size, 'bytes')     # 元数据` },
      ],
      pitfalls: [
        '<code>with_suffix("")</code> 去掉扩展名；传的字符串必须以点开头（如 ".csv"），否则 ValueError。',
        '<code>rename</code> 目标存在时 Windows 报错（覆盖用 <code>p.replace(target)</code>）。',
      ],
      related: ['属性', 'glob'],
      tags: ['重命名', '扩展名', '元数据'],
    },
    {
      name: 'relative_to-home', sig: 'p.relative_to(base) / Path.home() / Path.cwd()',
      brief: '求相对路径、用户主目录与当前目录。',
      examples: [
        { title: '', code: `from pathlib import Path

p = Path('D:/data/2024/a.csv')
print(p.relative_to('D:/data'))    # 2024\\a.csv  去掉公共前缀
print(Path.home())                 # 用户主目录
print(Path.cwd())                  # 当前工作目录

# 判断某文件是否在目录内(3.9+):
print(p.is_relative_to('D:/data')) # True` },
      ],
      pitfalls: [
        '<b>relative_to 不是字符串替换</b>：前缀不匹配直接 ValueError，先 is_relative_to 判断。',
        'Path.home() 拼桌面/文档路径比写死 C:/Users/某某 可靠。',
      ],
      related: ['resolve', 'Path'],
      tags: ['相对路径', '主目录'],
    },
  ],
});

MODULES.push({
  id: 'glob', name: 'glob', icon: '🔮', category: '文件与系统',
  doc: 'https://docs.python.org/zh-cn/3/library/glob.html',
  desc: '用通配符模式批量匹配文件路径，数据分析里批量读文件的神器。',
  install: false,
  entries: [
    {
      name: 'glob', sig: "glob.glob(pathname, recursive=False)",
      brief: '按通配符模式返回匹配的路径列表（*.csv、data/*/part*.xlsx）。',
      params: [
        { n: 'pathname', t: 'str', d: '模式字符串，支持 * ? [ ] 和 **' },
        { n: 'recursive', t: 'bool', d: '为 True 时 ** 才能跨目录递归', dflt: 'False' },
      ],
      returns: '<code>list[str]</code>',
      examples: [
        { title: '批量收集文件', code: `import glob\nprint(glob.glob('data/*.csv'))            # data 下所有 csv（不递归）\nprint(glob.glob('data/**/*.csv', recursive=True))  # 递归所有子目录\nfiles = sorted(glob.glob('logs/app-2024-*.log'))   # 记得 sorted` },
      ],
      pitfalls: [
        '想用 <code>**</code> 递归必须加 <code>recursive=True</code>，否则 ** 等价于单个 *。',
        '返回<b>不保证顺序</b>，按文件名序处理前先 <code>sorted()</code>。',
        'Windows 下匹配大小写不敏感，Linux 敏感。',
      ],
      related: ['iglob'],
      tags: ['通配符', '批量', '文件'],
    },
    {
      name: 'iglob', sig: 'glob.iglob(pathname, recursive=False)',
      brief: 'glob 的生成器版本，文件数量巨大时省内存。',
      examples: [
        { title: '', code: `import glob\nfor f in glob.iglob('data/**/*.csv', recursive=True):\n    print(f)   # 边找边处理，不一次性建列表` },
      ],
      pitfalls: [
        '生成器只能遍历一次；另外如果只为了 len() 或排序，直接用 glob.glob 更方便。',
      ],
      related: ['glob'],
      tags: ['生成器', '遍历'],
    },
    {
      name: 'escape', sig: 'glob.escape(pathname)',
      brief: '转义路径里的特殊字符（[ ] ? *），文件名含这些字符时先转义再拼模式。',
      examples: [
        { title: '', code: `import glob\nfname = 'report[2024].csv'\nprint(glob.glob('data/' + glob.escape(fname)))  # 不转义会匹配失败` },
      ],
      pitfalls: [
        '从用户输入/表格里拿到的文件名拼通配符前，先 escape，否则 [ 会被当成字符集。',
      ],
      related: ['glob'],
      tags: ['转义', '特殊字符'],
    },
  ],
});

MODULES.push({
  id: 'shutil', name: 'shutil', icon: '📦', category: '文件与系统',
  doc: 'https://docs.python.org/zh-cn/3/library/shutil.html',
  desc: '高级文件操作：复制、移动、删除整个目录树，打包压缩。',
  install: false,
  entries: [
    {
      name: 'copy', sig: "shutil.copy(src, dst) / shutil.copy2(src, dst)",
      brief: '复制文件到目标位置；copy2 连修改时间等元数据一起保留。',
      examples: [
        { title: '', code: `import shutil\nshutil.copy('data/a.csv', 'backup/a.csv')        # dst 是目录时自动用原文件名\nshutil.copy2('data/a.csv', 'backup/')            # 推荐：保留时间戳` },
      ],
      pitfalls: [
        '<code>copy</code> 不保留元数据（修改时间会变）；备份场景用 <code>copy2</code>。',
        '只能复制文件不能复制目录；复制目录树用 <code>copytree</code>。',
      ],
      related: ['copytree', 'move'],
      tags: ['复制', '备份'],
    },
    {
      name: 'copytree', sig: 'shutil.copytree(src, dst, dirs_exist_ok=False)',
      brief: '递归复制整个目录树。',
      examples: [
        { title: '', code: `import shutil\nshutil.copytree('project', 'backup/project', dirs_exist_ok=True)` },
      ],
      pitfalls: [
        '目标目录必须<b>不存在</b>（除非 Python 3.8+ 且 <code>dirs_exist_ok=True</code>），否则报 FileExistsError。',
        '想"备份但排除某些文件"，传 <code>ignore=shutil.ignore_patterns("*.pyc", "__pycache__")</code>。',
      ],
      related: ['copy', 'rmtree'],
      tags: ['复制', '目录'],
    },
    {
      name: 'move', sig: 'shutil.move(src, dst)',
      brief: '移动文件/目录，跨盘符也可以（内部自动复制+删除）。',
      examples: [
        { title: '', code: `import shutil\nshutil.move('data.csv', 'D:/archive/data.csv')   # 跨盘移动\nshutil.move('a.txt', 'D:/archive/')              # dst 为目录则移进去` },
      ],
      pitfalls: [
        '<code>os.rename</code> 跨盘会报错，<code>shutil.move</code> 才是通用的"移动"。',
        '目标目录不存在时不会自动创建，会把文件改名成那个不存在的名字 —— 先确保目录在。',
      ],
      related: ['copy', 'copytree'],
      tags: ['移动', '剪切'],
    },
    {
      name: 'rmtree', sig: 'shutil.rmtree(path, ignore_errors=False)',
      brief: '递归删除整个目录树（含所有子目录和文件），不进回收站！',
      examples: [
        { title: '', code: `import shutil\nshutil.rmtree('build', ignore_errors=True)   # 目录不存在也不报错` },
      ],
      pitfalls: [
        '<b>最危险的函数之一</b>：路径写错（比如变量为空拼成根目录）会连环删除且无法恢复。删除前打印确认路径。',
        'Windows 下有文件被占用时报 PermissionError。',
        '只删空目录用 <code>os.rmdir</code>，删单个文件用 <code>os.remove</code>。',
      ],
      related: ['copytree', 'move'],
      tags: ['删除', '目录', '危险'],
    },
    {
      name: 'which-disk', sig: "shutil.which('ffmpeg') / shutil.disk_usage('D:/')",
      brief: '查系统命令是否存在、看磁盘剩余空间。',
      examples: [
        { title: '', code: `import shutil

print(shutil.which('ffmpeg'))     # 找到返回路径, 找不到返回 None
if shutil.which('ffmpeg') is None:
    print('请先安装 ffmpeg')

u = shutil.disk_usage('D:/')
print(u.total, u.used, u.free)    # 字节; free / 1024**3 得 GB` },
      ],
      pitfalls: [
        'which 只查 <b>PATH</b> 里的命令，等价于命令行的 where/which。',
        'disk_usage 单位是字节，除以 1024**3 得 GB。',
      ],
      related: ['move'],
      tags: ['命令', '磁盘'],
    },
    {
      name: 'make_archive', sig: "shutil.make_archive('backup', 'zip', root_dir='data') / shutil.unpack_archive(...)",
      brief: '一行打包/解包目录（zip/tar/gztar/bztar）。',
      examples: [
        { title: '', code: `import shutil

# 把 data 目录打包成 backup.zip
shutil.make_archive('backup', 'zip', root_dir='data')

# 解包到 out 目录
shutil.unpack_archive('backup.zip', extract_dir='out')
# 支持: zip / tar / gztar / bztar (按扩展名自动识别)` },
      ],
      pitfalls: [
        'make_archive 的第一个参数是<b>目标文件名(不含扩展名)</b>，格式由第二个参数决定。',
        'rar/7z 不支持；中文文件名打 zip 包在部分老解压软件里乱码（编码历史问题），跨平台建议用 tar。',
      ],
      related: ['move', 'copytree'],
      tags: ['打包', '压缩', 'zip'],
    },
  ],
});
