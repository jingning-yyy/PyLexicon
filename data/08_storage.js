/* 存储与序列化：sqlalchemy / openpyxl / pickle */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'sqlalchemy', name: 'sqlalchemy', icon: '🗃️', category: '存储与序列化',
  doc: 'https://docs.sqlalchemy.org/',
  desc: 'Python 数据库工具箱：连接各种数据库、ORM、配合 pandas 读写表。',
  install: 'pip install sqlalchemy  (还需对应驱动如 pymysql)',
  aliases: ['sql', '数据库', 'orm'],
  tips: [
    '<b>1.x 与 2.0 API 差异很大</b>：2.0 移除了 engine.execute()，查询统一用 <code>select()</code>；网上老代码报错先看版本。',
    '连接不同数据库要装驱动：MySQL 装 pymysql、PostgreSQL 装 psycopg2、SQL Server 装 pyodbc。',
    '与 pandas 搭配是数据分析最常用姿势：<code>pd.read_sql(sql, engine)</code> / <code>df.to_sql(表名, engine)</code>。',
  ],
  entries: [
    {
      name: 'create_engine', sig: "create_engine('数据库类型+驱动://用户名:密码@主机:端口/库名', echo=False, pool_pre_ping=True)",
      brief: '创建数据库引擎（连接池），所有操作的起点。',
      params: [
        { n: 'url', t: 'str', d: '连接串，格式见示例' },
        { n: 'echo', t: 'bool', d: 'True 打印执行的 SQL，调试用', dflt: 'False' },
        { n: 'pool_pre_ping', t: 'bool', d: '取连接前先 ping，防长时间空闲后断连（MySQL 八小时断连问题）', dflt: 'False' },
      ],
      examples: [
        { title: '常见数据库连接串', code: `from sqlalchemy import create_engine\n\n# MySQL (需 pip install pymysql)\nengine = create_engine(\n    'mysql+pymysql://root:123456@localhost:3306/mydb?charset=utf8mb4',\n    pool_pre_ping=True,\n)\n# PostgreSQL (需 psycopg2)\nengine_pg = create_engine('postgresql+psycopg2://user:pwd@host:5432/db')\n# SQLite (本地文件, 无需装驱动)\nengine_lite = create_engine('sqlite:///local.db')\n# SQL Server (需 pyodbc)\nengine_ms = create_engine(\n    'mssql+pyodbc://user:pwd@host/db?driver=ODBC+Driver+17+for+SQL+Server')` },
      ],
      pitfalls: [
        '<b>密码含 @ : / 等特殊字符必须 URL 编码</b>：<code>from urllib.parse import quote_plus; quote_plus("p@ss")</code>。',
        'MySQL 中文乱码/存不进去：连接串加 <code>charset=utf8mb4</code>。',
        'create_engine 不会真的连数据库（惰性），第一次执行操作才连接 —— 连接串错了要等用时才报错。',
      ],
      related: ['read_sql-to_sql', 'orm-模型'],
      tags: ['连接', '数据库', 'engine', 'mysql'],
    },
    {
      name: 'read_sql-to_sql', sig: "pd.read_sql(sql, engine) / df.to_sql('表名', engine, if_exists='fail', index=False, chunksize=1000)",
      brief: 'pandas 与数据库互导，数据分析最高频组合。',
      params: [
        { n: 'if_exists', t: 'str', d: "表已存在时：'fail'报错 / 'replace'清了重建 / 'append'追加", dflt: "'fail'" },
        { n: 'index', t: 'bool', d: '是否把 DataFrame 索引写成一列', dflt: 'True' },
        { n: 'dtype', t: 'dict', d: "指定列类型，如 {'name': String(50)}" },
        { n: 'chunksize', t: 'int', d: '分批写入，大表必设防内存爆' },
      ],
      examples: [
        { title: '', code: `import pandas as pd\nfrom sqlalchemy import create_engine, text\nengine = create_engine('mysql+pymysql://root:pwd@localhost:3306/shop')\n\n# 读\ndf = pd.read_sql('SELECT * FROM orders WHERE amount > 100', engine)\ndf = pd.read_sql(text('SELECT * FROM orders WHERE city = :c'),\n                 engine, params={'c': '北京'})   # 参数化防注入\n\n# 写\ndf.to_sql('结果表', engine, if_exists='replace', index=False)\ndf.to_sql('结果表', engine, if_exists='append', index=False, chunksize=5000)` },
      ],
      pitfalls: [
        '<b>if_exists="replace" 会直接删表重建</b>，生产库慎用；追加用 append。',
        'df.to_sql 每次都会触发表结构推断，列类型可能和预期不同，重要表先在数据库端建好表再 append。',
        'read_sql 传 SQL 字符串时 sqlalchemy 2.0 建议包一层 text()，带参数必须用 :参数名 + params。',
      ],
      related: ['create_engine', '原生SQL'],
      tags: ['pandas', '读写', 'to_sql', 'read_sql'],
    },
    {
      name: 'orm-模型', sig: "class User(Base): __tablename__ = 'users'; id = Column(Integer, primary_key=True, autoincrement=True); name = Column(String(50), nullable=False)",
      brief: 'ORM：用 Python 类定义表结构，一张表一个类。',
      params: [
        { n: 'primary_key', t: 'bool', d: '主键' },
        { n: 'String(n) / Integer / Float / DateTime / Text / Boolean', t: '类型', d: '常用列类型；MySQL 的 String 长度必填' },
        { n: 'unique / nullable / default', t: '-', d: '唯一 / 可空 / 默认值' },
      ],
      examples: [
        { title: '', code: `from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime\nfrom sqlalchemy.orm import declarative_base\nfrom datetime import datetime\n\nBase = declarative_base()\n\nclass Order(Base):\n    __tablename__ = 'orders'\n    id = Column(Integer, primary_key=True, autoincrement=True)\n    uid = Column(Integer, nullable=False, index=True)\n    amount = Column(Float, default=0.0)\n    created = Column(DateTime, default=datetime.now)\n\nengine = create_engine('sqlite:///shop.db')\nBase.metadata.create_all(engine)     # 建表(已存在则跳过)` },
      ],
      pitfalls: [
        '<b>改了类定义不会自动改表结构</b>，ORM 不做迁移；改表用 alembic 或手动 ALTER。',
        'declarative_base 的导入位置 1.4/2.0 有变化：<code>sqlalchemy.orm.declarative_base</code>，从 sqlalchemy.ext.declarative 导入会有弃用警告。',
      ],
      related: ['session', 'create_engine'],
      tags: ['orm', '建表', '模型'],
    },
    {
      name: 'session', sig: "Session = sessionmaker(bind=engine) / with Session() as session: session.add(obj); session.commit()",
      brief: '会话：ORM 增删改查的工作单元，用完要 commit 或 rollback。',
      examples: [
        { title: '', code: `from sqlalchemy.orm import sessionmaker\nSession = sessionmaker(bind=engine)\n\n# 增\nwith Session() as s:\n    s.add(Order(uid=1, amount=99.9))\n    s.add_all([Order(uid=2, amount=50), Order(uid=3, amount=120)])\n    s.commit()                 # 不 commit 不落库!\n\n# 改\nwith Session() as s:\n    o = s.get(Order, 1)        # 按主键查\n    o.amount = 199\n    s.commit()\n\n# 删\nwith Session() as s:\n    o = s.get(Order, 2)\n    s.delete(o)\n    s.commit()` },
      ],
      pitfalls: [
        '忘 commit 数据根本没写进去（查询自己却能看到 —— 在同一个 session 的事务里）。',
        'session 不是线程安全的，多线程各开各的。',
        '异常时自动 rollback（with 写法），但靠手动 try 的旧写法要显式 rollback。',
      ],
      related: ['orm-模型', '查询'],
      tags: ['session', '事务', '增删改'],
    },
    {
      name: '查询', sig: "session.query(User).filter(User.age > 18).order_by(User.id.desc()).limit(10).all()",
      brief: 'ORM 查询链：filter 条件、排序、分页、聚合。',
      examples: [
        { title: '', code: `from sqlalchemy import select, func\n\n# 1.x 风格 Query\nusers = (s.query(User)\n           .filter(User.age >= 18, User.name.like('%张%'))\n           .order_by(User.id.desc())\n           .offset(0).limit(10)\n           .all())\nfirst = s.query(User).filter_by(name='张三').first()   # filter_by 用关键字\ncnt = s.query(User).count()\n\n# 2.0 风格 (推荐新代码)\nstmt = select(User).where(User.age >= 18).limit(10)\nusers = s.execute(stmt).scalars().all()\n\n# 聚合\nrows = s.query(User.city, func.count(User.id)).group_by(User.city).all()` },
      ],
      pitfalls: [
        '<code>filter</code> 传表达式（User.age == 18），<code>filter_by</code> 传关键字（age=18），混了会报错。',
        '多个条件在 filter 里逗号隔开就是 AND；OR 要 <code>from sqlalchemy import or_; or_(a, b)</code>。',
        '<code>.all()</code> 返回列表，忘了调用拿到的是 Query 对象不是数据。',
      ],
      related: ['session', '原生SQL'],
      tags: ['查询', 'filter', 'select'],
    },
    {
      name: '原生SQL', sig: "text('SELECT ... WHERE city = :c') / with engine.connect() as conn: conn.execute(stmt)",
      brief: '直接跑 SQL：2.0 用 text() + connect()，参数用 :name 占位。',
      examples: [
        { title: '', code: `from sqlalchemy import text\n\n# 只读查询\nwith engine.connect() as conn:\n    result = conn.execute(\n        text('SELECT id, name FROM users WHERE age > :a'),\n        {'a': 18},\n    )\n    for row in result:\n        print(row.id, row.name)\n\n# 写操作要显式 commit\nwith engine.begin() as conn:          # begin() 自动提交\n    conn.execute(text('UPDATE users SET age = age + 1 WHERE id = :i'), {'i': 1})` },
      ],
      pitfalls: [
        '<b>engine.execute() 在 2.0 已删除</b>，报 "Engine.execute() removed"；改成 connect()/begin() 写法。',
        'SQL 字符串别用 % 或 format 拼接（注入+语法坑），参数一律 :name 传字典。',
        '普通 connect() 里执行 UPDATE 不 commit 不生效；要自动提交用 engine.begin()。',
      ],
      related: ['create_engine', 'read_sql-to_sql'],
      tags: ['原生sql', 'text', 'execute'],
    },
  ],
});

MODULES.push({
  id: 'openpyxl', name: 'openpyxl', icon: '📗', category: '存储与序列化',
  doc: 'https://openpyxl.readthedocs.io/en/stable/',
  desc: '读写 .xlsx 文件（含样式、公式、合并单元格），pandas 读 Excel 的底层引擎。',
  install: 'pip install openpyxl',
  tips: [
    '只支持 <code>.xlsx/.xlsm</code>；老格式 <code>.xls</code> 要用 xlrd 或先转存为 xlsx。',
    '只是"读数据进 pandas"用 <code>pd.read_excel</code> 就够；要<b>保留格式改几个单元格、写带样式的报表</b>才需要 openpyxl。',
  ],
  entries: [
    {
      name: 'load_workbook', sig: "load_workbook(filename, data_only=False, read_only=False, keep_vba=False)",
      brief: '打开 xlsx 工作簿。',
      params: [
        { n: 'data_only', t: 'bool', d: 'True 时公式单元格读到的是<b>上次保存时的计算值</b>', dflt: 'False（读到公式字符串本身）' },
        { n: 'read_only', t: 'bool', d: '流式只读模式，大文件省内存；此模式下不能写' },
        { n: 'keep_vba', t: 'bool', d: '保留宏，xlsm 文件需要' },
      ],
      examples: [
        { title: '', code: `from openpyxl import load_workbook\nwb = load_workbook('报表.xlsx', data_only=True)   # 读数值就开 data_only\nws = wb['销售明细']\nprint(ws['B2'].value)` },
      ],
      pitfalls: [
        '<b>data_only=True 读公式列拿到 None</b>：说明文件从未被 Excel 打开保存过（python 写入的公式没有缓存值）。用 Excel 打开保存一次即可。',
        'data_only 和公式两者只能取一：要"公式原文"开 False，要"数值"开 True。',
        'read_only 模式的 ws 是生成式的，max_row 可能不准。',
      ],
      related: ['cell-读', 'cell-写'],
      tags: ['打开', 'workbook', '公式'],
    },
    {
      name: 'sheet操作', sig: "wb.active / wb['Sheet1'] / wb.sheetnames / wb.create_sheet('新表') / del wb['旧表']",
      brief: '工作表的选取、新建、删除。',
      examples: [
        { title: '', code: `wb = load_workbook('报表.xlsx')\nprint(wb.sheetnames)          # 所有表名\nws = wb.active                # 当前激活(打开时看到的)那张\nws = wb['销售明细']           # 按名取\n\nnew = wb.create_sheet('汇总', 0)   # 新建并插到第一位\nws.copy_worksheet(wb['模板'])      # 复制\n# del wb['废弃表']                 # 删除\nwb.save('报表.xlsx')               # 改完必须 save` },
      ],
      pitfalls: [
        '<code>wb["sheet"]</code> 名字不存在直接 KeyError，先看 <code>wb.sheetnames</code>。',
        '复制工作表只能同工作簿内（copy_worksheet），跨工作簿要自己逐格复制。',
      ],
      related: ['load_workbook', 'cell-写'],
      tags: ['工作表', 'sheet'],
    },
    {
      name: 'cell-读', sig: "ws['A1'].value / ws.cell(row=1, column=1).value / ws.iter_rows(values_only=True)",
      brief: '读取单元格：字母坐标、行列号、整行迭代三种方式。',
      params: [
        { n: 'row / column', t: 'int', d: '<b>从 1 开始数</b>，不是从 0！' },
        { n: 'values_only', t: 'bool', d: 'iter_rows 只返回值组成的元组（不要单元格对象）' },
      ],
      examples: [
        { title: '', code: `ws = wb['Sheet1']\nv = ws['B3'].value                    # 按坐标\nv2 = ws.cell(row=3, column=2).value   # 行列号, 等价\n\n# 批量读成列表套元组(和 pandas 兼容):\nfor row in ws.iter_rows(min_row=2, values_only=True):\n    print(row)                        # (姓名, 日期, 金额, ...)\n\nprint(ws.max_row, ws.max_column)      # 数据范围` },
      ],
      pitfalls: [
        '<b>行列号从 1 开始</b>，写成 0 直接 ValueError（Row or column values must be at least 1）。',
        '日期列读出来是 datetime 对象不是字符串，格式化要自己 strftime。',
        'max_row 可能比真实数据大（曾格式化过的空行），循环时判断值是否为 None。',
      ],
      related: ['load_workbook', '常见坑'],
      tags: ['读取', '单元格', 'iter_rows'],
    },
    {
      name: 'cell-写', sig: "ws['A1'] = 值 / ws.append([a, b, c]) / wb.save('文件.xlsx')",
      brief: '写入单元格、按行追加、保存；顺带常用样式。',
      examples: [
        { title: '', code: `from openpyxl import Workbook\nfrom openpyxl.styles import Font, PatternFill, Alignment\n\nwb = Workbook()\nws = wb.active\nws.title = '结果'\nws.append(['姓名', '金额'])        # 表头\nws.append(['张三', 100])\nws['B2'] = 999                    # 覆盖单个格\n\nws['A1'].font = Font(bold=True, size=12)\nws['A1'].fill = PatternFill('solid', fgColor='FFFF00')\nws.column_dimensions['A'].width = 20      # 列宽\nws.freeze_panes = 'A2'                    # 冻结首行\nwb.save('out.xlsx')               # 不 save 全白干!` },
      ],
      pitfalls: [
        '<b>忘了 wb.save() 是最常见的"程序没报错但文件没变"</b>。',
        '目标文件正被 Excel 打开时 save 报 PermissionError，先关闭 Excel。',
        'ws.append 追加位置跟在 max_row 之后，空尾行会导致中间空几行。',
      ],
      related: ['cell-读', 'pandas结合'],
      tags: ['写入', '样式', '保存'],
    },
    {
      name: 'pandas结合', sig: "pd.read_excel(f, engine='openpyxl') / df.to_excel(engine, sheet_name=, index=False) / pd.ExcelWriter",
      brief: 'openpyxl 作为 pandas 的 Excel 引擎，多 sheet 读写用 ExcelWriter。',
      examples: [
        { title: '', code: `import pandas as pd\n\n# 写多个 sheet\nwith pd.ExcelWriter('报告.xlsx', engine='openpyxl') as w:\n    df_summary.to_excel(w, sheet_name='汇总', index=False)\n    df_detail.to_excel(w, sheet_name='明细', index=False)\n\n# 给已有文件追加一个 sheet (不覆盖原内容):\nwith pd.ExcelWriter('报告.xlsx', engine='openpyxl',\n                    mode='a', if_sheet_exists='replace') as w:\n    df_new.to_excel(w, sheet_name='本月', index=False)` },
      ],
      pitfalls: [
        'mode="a" 必须配 <code>if_sheet_exists</code>（error/replace/new），否则同名 sheet 报错。',
        'to_excel 忘 index=False 会多一列Unnamed: 0。',
        'ExcelWriter 上下文没退出（缩进没走完）文件不落盘。',
      ],
      related: ['cell-写', 'load_workbook'],
      tags: ['excelwriter', '多sheet', 'pandas'],
    },
    {
      name: '常见坑', sig: '编码 / 格式 / 性能 三大坑',
      brief: 'openpyxl 高频问题清单。',
      examples: [
        { title: '', code: `# 坑1: 读 .xls -> BadZipFile / 不支持\n#      解决: 用 Excel 另存为 .xlsx, 或 pd.read_excel(engine='xlrd')\n\n# 坑2: 公式列全是 None -> load_workbook(data_only=True)\n#      且文件必须被 Excel 保存过一次\n\n# 坑3: 合并单元格只有左上角有值 -> 读后 ffill:\nimport pandas as pd\ndf = pd.read_excel('x.xlsx').ffill()\n\n# 坑4: 大文件(几十万行)慢/内存高\nwb = load_workbook('big.xlsx', read_only=True)   # 只读流式\n# 或者干脆走 pandas -> csv` },
      ],
      pitfalls: [
        'openpyxl 写入是整文件重写（不能追加保存），超大表写入慢是正常的。',
        '单元格里的富文本/图片/透视表部分特性 openpyxl 保存后会丢，重要文件先备份。',
      ],
      related: ['load_workbook', 'pandas结合'],
      tags: ['坑', '大文件', '合并单元格'],
    },
  ],
});

MODULES.push({
  id: 'pickle', name: 'pickle', icon: '🥒', category: '存储与序列化',
  doc: 'https://docs.python.org/zh-cn/3/library/pickle.html',
  desc: 'Python 对象序列化标准库：把任意 Python 对象存成文件、再原样读回来。',
  install: false,
  aliases: ['序列化', 'cPickle'],
  tips: [
    '<b>安全红线</b>：永远不要 pickle.load 来路不明的文件 —— 反序列化即可执行任意代码，等价于运行别人的程序。',
    '选型：配置/简单数据用 json（跨语言可读）；模型/numpy 大数组用 joblib；任意 Python 对象内部交换才用 pickle。',
  ],
  entries: [
    {
      name: 'dump-load', sig: "pickle.dump(obj, file, protocol=pickle.HIGHEST_PROTOCOL) / obj = pickle.load(file)",
      brief: '对象写文件 / 从文件读对象，文件必须以二进制模式打开。',
      examples: [
        { title: '', code: `import pickle\n\ndata = {'列表': [1, 2, 3], '嵌套': {'a': (1, 2)}}\n\nwith open('data.pkl', 'wb') as f:      # 注意 wb!\n    pickle.dump(data, f)\n\nwith open('data.pkl', 'rb') as f:      # 注意 rb!\n    data2 = pickle.load(f)\nprint(data2 == data)   # True` },
      ],
      pitfalls: [
        '<b>模式必须是 "wb"/"rb"</b>，用文本模式报 TypeError: a bytes-like object is required。',
        '存的是自定义类实例时，读取环境必须能 import 到那个类（路径没变）。',
        'Python 版本差异：低版本读高版本 protocol 的文件会报错，跨版本用 protocol=2~4。',
      ],
      related: ['dumps-loads'],
      tags: ['序列化', '保存', '文件'],
    },
    {
      name: 'dumps-loads', sig: 'pickle.dumps(obj) -> bytes / pickle.loads(bytes)',
      brief: '内存版序列化：对象 ↔ bytes，常用于缓存（如 Redis）与网络传输。',
      examples: [
        { title: '', code: `import pickle\nb = pickle.dumps({'x': [1, 2]})   # b'\\x80\\x04\\x95...'\nobj = pickle.loads(b)             # {'x': [1, 2]}` },
      ],
      pitfalls: [
        'bytes 无法直接 json 化，跨语言/前端传输请用 json。',
        'loads 反序列化即执行代码，<b>Redis/消息队列里的数据不可信来源时禁用 loads</b>。',
      ],
      related: ['dump-load'],
      tags: ['bytes', '内存', '缓存'],
    },
    {
      name: '能存什么', sig: '可: dict/list/tuple/set/类实例/函数引用(按名字)  不可: lambda/局部函数/打开的连接',
      brief: 'pickle 支持范围速查。',
      examples: [
        { title: '', code: `# 存不了的例子:\nimport pickle\ntry:\n    pickle.dumps(lambda x: x)        # PicklingError!\nexcept Exception as e:\n    print(e)\n\n# 数据库连接、文件句柄、线程锁等"运行时状态"都不能存\n# 类实例可以存, 但只存属性, 且要求类可被 import` },
      ],
      pitfalls: [
        'lambda / 闭包 / 匿名函数存不了（joblib 的 delayed 也因此要求可导入函数）。',
        'numpy/pandas/torch 张量都能存，但大数组 joblib 压缩效率更高。',
      ],
      related: ['dump-load', 'dumps-loads'],
      tags: ['限制', '支持范围'],
    },
    {
      name: 'vs-json', sig: 'pickle vs json 对照',
      brief: '两者怎么选，一张表看清。',
      params: [
        { n: 'pickle', t: '-', d: 'Python 专属、二进制、能存几乎所有对象、<b>不安全</b>' },
        { n: 'json', t: '-', d: '跨语言、文本、只支持基本类型、人类可读、安全' },
      ],
      examples: [
        { title: '', code: `# 典型场景:\n#   缓存网页解析结果、中间处理数据 -> json (可能要人工看)\n#   sklearn 老教程的模型文件 -> pickle / joblib 均可\n#   跨程序/跨语言交接 -> 只能 json 或 csv\nimport json, pickle\nd = {'a': 1}\nprint(len(pickle.dumps(d)), 'bytes vs', len(json.dumps(d)), 'bytes')` },
      ],
      pitfalls: [
        'json 的 key 只能是字符串（int key 会自动转成字符串），pickle 的 key 可以是任意可哈希对象 —— 互转时注意类型漂移。',
        'tuple 经 json 往返会变 list，set/datetime 干脆不支持（datetime 要先 isoformat）。',
      ],
      related: ['dumps-loads'],
      tags: ['对比', '选型', 'json'],
    },
  ],
});

MODULES.push({
  id: 'pymysql', name: 'pymysql', icon: '🐬', category: '存储与序列化',
  doc: 'https://pymysql.readthedocs.io/en/latest/',
  desc: '纯 Python 的 MySQL 驱动：建连接、执行 SQL、取结果，pandas 读 MySQL 的底层通道。',
  install: 'pip install pymysql',
  aliases: ['mysql'],
  tips: [
    '占位符是 <code>%s</code>（不是 ?），参数化查询永远用它，别手工拼 SQL。',
    '与 sqlalchemy 分工：手写 SQL 逐行处理用 pymysql；配合 pandas / ORM 走 sqlalchemy（pymysql 只当驱动）。',
  ],
  entries: [
    {
      name: 'connect', sig: "pymysql.connect(host='localhost', port=3306, user='root', password='x', database='db', charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor, autocommit=False)",
      brief: '建立 MySQL 连接。',
      params: [
        { n: 'charset', t: 'str', d: "<b>写 'utf8mb4'</b>，不写常出中文乱码/存不进去" },
        { n: 'cursorclass', t: 'class', d: 'DictCursor 让每行结果是字典；默认 Cursor 是元组' },
        { n: 'autocommit', t: 'bool', d: 'True 则增删改立即生效；False 必须手动 commit', dflt: 'False' },
      ],
      examples: [
        { title: '', code: `import pymysql\n\nconn = pymysql.connect(\n    host='localhost', port=3306,\n    user='root', password='123456',\n    database='shop',\n    charset='utf8mb4',\n    cursorclass=pymysql.cursors.DictCursor,\n)\ntry:\n    with conn.cursor() as cur:\n        cur.execute('SELECT VERSION()')\n        print(cur.fetchone())\nfinally:\n    conn.close()` },
      ],
      pitfalls: [
        '增删改后忘了 commit：执行成功但库里没数据（autocommit 默认关）。',
        '中文乱码九成是 charset 没写 utf8mb4。',
        '连接闲置太久被 MySQL 断开（默认 8 小时），长跑脚本要重连或用连接池（dbutils.PooledDB）。',
      ],
      related: ['cursor-execute', 'fetch'],
      tags: ['mysql', '连接'],
    },
    {
      name: 'cursor-execute', sig: 'cur.execute(sql, params) / cur.executemany(sql, [(参数...), ...])',
      brief: '执行 SQL：单条 execute、批量 executemany。',
      examples: [
        { title: '', code: `# 查询(参数化, 防注入):\ncur.execute('SELECT * FROM orders WHERE city = %s AND amount > %s',\n            ('北京', 100))\n\n# 增删改(记得 commit):\ncur.execute('INSERT INTO users(name, age) VALUES (%s, %s)',\n            ('张三', 25))\nconn.commit()\nprint(cur.lastrowid)      # 自增主键\n\n# 批量插入(比循环 execute 快得多):\nrows = [('a', 1), ('b', 2), ('c', 3)]\ncur.executemany('INSERT INTO t(name, n) VALUES (%s, %s)', rows)\nconn.commit()\nprint(cur.rowcount)       # 影响行数` },
      ],
      pitfalls: [
        '<b>占位符是 %s</b>（所有类型都用它），不是 ?；参数放在第二个位置（元组/列表）。',
        "SQL 里要用的 % 要写成 %%（如 LIKE '%%x%%'），否则被当成占位符解析报错。",
        '参数只有一个也要传元组：<code>cur.execute(sql, (id,))</code>，写 (id) 不是元组。',
      ],
      related: ['connect', 'fetch', '事务'],
      tags: ['执行', 'insert', '批量'],
    },
    {
      name: 'fetch', sig: 'cur.fetchone() / cur.fetchall() / cur.fetchmany(n)',
      brief: '取查询结果：一条、全部、N 条。',
      examples: [
        { title: '', code: `cur.execute('SELECT id, name FROM users LIMIT 5')\n\nrow = cur.fetchone()        # 第一行: {'id': 1, 'name': '张三'} (DictCursor)\nrows = cur.fetchall()       # 剩下的全部: [{...}, {...}]\n\n# 大结果集逐批取, 防内存爆:\nwhile True:\n    batch = cur.fetchmany(1000)\n    if not batch:\n        break\n    process(batch)` },
      ],
      pitfalls: [
        'fetchone 之后再 fetchall 拿的是<b>剩下的</b>行 —— 游标有位置，重取要重新 execute。',
        "没设 DictCursor 时每行是元组，row['name'] 会报错（要用下标 row[1]）。",
        '结果为空时 fetchall 返回 [] 不是 None，判断用 if not rows。',
      ],
      related: ['cursor-execute'],
      tags: ['查询', '结果集'],
    },
    {
      name: '事务', sig: 'conn.commit() / conn.rollback() / with conn: ...',
      brief: '事务控制与异常处理。',
      examples: [
        { title: '', code: `from pymysql.err import MySQLError\n\ntry:\n    with conn:                  # 块内正常自动 commit, 异常自动 rollback\n        with conn.cursor() as cur:\n            cur.execute('UPDATE account SET bal = bal - 100 WHERE id = 1')\n            cur.execute('UPDATE account SET bal = bal + 100 WHERE id = 2')\nexcept MySQLError as e:\n    print('转账失败:', e)` },
      ],
      pitfalls: [
        '转账类"多步必须同成功同失败"的逻辑务必包事务，别各自 commit。',
        '<code>with conn</code> 只管提交/回滚，<b>不会关闭连接</b>，不用了还是要 close()。',
      ],
      related: ['connect', 'cursor-execute'],
      tags: ['事务', '回滚', '异常'],
    },
    {
      name: 'pandas结合', sig: "pd.read_sql(sql, conn) / df.to_sql('表', engine)  # 写回走 sqlalchemy",
      brief: 'pandas 直接读 MySQL；写回建议走 sqlalchemy 引擎。',
      examples: [
        { title: '', code: `import pandas as pd\n\n# 读: pymysql 连接直接用\ndf = pd.read_sql('SELECT * FROM orders WHERE dt >= %s', conn,\n                 params=['2024-01-01'])\n\n# 写: 需要 sqlalchemy 引擎(pymysql 只当驱动)\nfrom sqlalchemy import create_engine\nengine = create_engine(\n    'mysql+pymysql://root:123456@localhost:3306/shop?charset=utf8mb4')\ndf.to_sql('结果表', engine, if_exists='append', index=False)` },
      ],
      pitfalls: [
        'pd.read_sql 对裸 pymysql 连接会弹 UserWarning（建议用 sqlalchemy），不影响结果。',
        'df.to_sql 不接受 pymysql 连接，必须给 sqlalchemy engine。',
      ],
      related: ['fetch', 'cursor-execute'],
      tags: ['pandas', '读表'],
    },
  ],
});

MODULES.push({
  id: 'pymongo', name: 'pymongo', icon: '🍃', category: '存储与序列化',
  doc: 'https://pymongo.readthedocs.io/en/stable/',
  desc: 'MongoDB 官方驱动：文档型数据库，存 JSON 型数据、爬虫结果非常顺手。',
  install: 'pip install pymongo',
  aliases: ['mongodb', 'mongo'],
  tips: [
    '<b>不用提前建库建表</b>：client[库][集合] 第一次插入时自动创建。',
    '查询语法是 MongoDB 文档（$gt、$in、$set…）不是 SQL；复杂条件先在 Compass 里试再搬进代码。',
  ],
  entries: [
    {
      name: 'MongoClient', sig: "client = MongoClient('mongodb://user:pwd@localhost:27017/') / db = client['shop'] / coll = db['orders']",
      brief: '连接与库/集合选择。',
      examples: [
        { title: '', code: `from pymongo import MongoClient\n\nclient = MongoClient('mongodb://localhost:27017/',\n                     serverSelectionTimeoutMS=5000)   # 连不上快速失败\ndb = client['shop']\ncoll = db['orders']\nprint(client.list_database_names())` },
      ],
      pitfalls: [
        'MongoClient 是<b>惰性连接</b>：创建时不联网，第一次操作才报错。',
        '库名/集合名可以用中文（字典式访问），但不能含点号、不能 $ 开头。',
        'client 自带连接池，全局建一个复用，别每个请求新建。',
        '驱动与服务端版本要配套：PyMongo 4.18 起不再支持 MongoDB 4.2 服务器，升级驱动前先确认服务端版本。',
      ],
      related: ['insert', 'find'],
      tags: ['mongo', '连接'],
    },
    {
      name: 'insert', sig: 'coll.insert_one(doc) / coll.insert_many([doc1, doc2])',
      brief: '插入文档（dict 直接进库）。',
      examples: [
        { title: '', code: `from datetime import datetime\n\ndoc = {'name': '张三', 'amount': 99.9,\n       'tags': ['vip'], 'created': datetime.now()}\nr = coll.insert_one(doc)\nprint(r.inserted_id)        # ObjectId('...') 自动生成\n\nr2 = coll.insert_many([{'name': 'a'}, {'name': 'b'}])\nprint(r2.inserted_ids)` },
      ],
      pitfalls: [
        "dict 的 key 不能以 <b>$ 开头或含点号</b>，爬来的数据先清洗 key。",
        'datetime 存取都按 UTC，读出来直接用会差 8 小时，展示前换算。',
        '几十万条用 insert_many 分批（每批 1 万左右），别循环 insert_one。',
      ],
      related: ['find', 'update-delete'],
      tags: ['插入', '文档'],
    },
    {
      name: 'find', sig: "coll.find({'age': {'$gt': 18}}, {'_id': 0}).sort('age', -1).limit(10).skip(20)",
      brief: '查询：条件、投影、排序、分页，返回可迭代游标。',
      params: [
        { n: 'filter', t: 'dict', d: "条件：{'city': '北京'}、{'age': {'$gte': 18}}、{'$or': [...]}" },
        { n: 'projection', t: 'dict', d: "投影：{'_id': 0, 'name': 1} 控制返回字段" },
      ],
      examples: [
        { title: '', code: `# 常用操作符: $gt $gte $lt $lte $ne $in $nin $regex $exists\nfor doc in coll.find({'city': {'$in': ['北京', '上海']},\n                      'amount': {'$gte': 100}}).sort('amount', -1).limit(10):\n    print(doc)\n\ncoll.find_one({'name': '张三'})            # 单条\n\ncoll.find({'name': {'$regex': '张'}})      # 模糊搜索\n\ncoll.count_documents({'city': '北京'})     # 计数` },
      ],
      pitfalls: [
        '<b>find 返回游标是惰性的</b>：list(coll) 才真正取数；游标遍历一次后再遍历为空。',
        "默认带 _id 且是 ObjectId，<b>不能直接 json.dumps</b>，转 str(doc['_id'])。",
        'sort/limit/skip 链式顺序无所谓，但 skip 深翻页性能差，大数据用 _id 游标分页。',
      ],
      related: ['insert', 'aggregate', 'update-delete'],
      tags: ['查询', '操作符', '游标'],
    },
    {
      name: 'update-delete', sig: "coll.update_one({'name': 'x'}, {'$set': {'age': 20}}, upsert=False) / coll.delete_many({...})",
      brief: '更新与删除：$set 只改字段，不带 $ 操作符是整文档替换。',
      examples: [
        { title: '', code: `# 改字段(推荐, 只动指定字段):\ncoll.update_one({'name': '张三'}, {'$set': {'age': 26}})\ncoll.update_many({'city': '北京'}, {'$inc': {'amount': 10}})\n\n# 常用更新操作符: $set $inc $push(数组追加) $addToSet $unset\n\n# 不存在则插入:\ncoll.update_one({'uid': 1001}, {'$set': {'score': 90}}, upsert=True)\n\n# 删除:\ncoll.delete_one({'_id': oid})\ncoll.delete_many({})            # 清空集合, 慎用!` },
      ],
      pitfalls: [
        '<b>update_one(doc, {"age": 20}) 不带 $set 会把整个文档替换掉</b>（等价 replace_one），老字段全丢 —— 最贵的一课。',
        'delete_many({}) 是删全部，条件写错就是事故；删之前先用同样条件 find 数一遍。',
        'update_one 只改第一条，改全部必须 update_many。',
      ],
      related: ['find', 'insert'],
      tags: ['更新', '删除', 'set'],
    },
    {
      name: 'aggregate', sig: "coll.aggregate([{'$match': {...}}, {'$group': {'_id': '$city', 'cnt': {'$sum': 1}}}])",
      brief: '聚合管道：分组统计、多步加工（相当于 SQL 的 group by）。',
      examples: [
        { title: '分组计数+求和', code: `pipeline = [\n    {'$match': {'amount': {'$gt': 0}}},        # 相当于 WHERE\n    {'$group': {'_id': '$city',                # 相当于 GROUP BY\n                '订单数': {'$sum': 1},\n                '总金额': {'$sum': '$amount'}}},\n    {'$sort': {'总金额': -1}},\n    {'$limit': 10},\n]\nfor row in coll.aggregate(pipeline):\n    print(row)   # {'_id': '北京', '订单数': 30, '总金额': 5000.0}` },
      ],
      pitfalls: [
        "字段引用要带 <b>$ 前缀</b>：'$amount' 是取值，amount 是字面量 —— 结果全 0 或报错多半是这里。",
        '大集合聚合默认有 100MB 内存上限，报错加 <code>allowDiskUse=True</code>。',
      ],
      related: ['find'],
      tags: ['聚合', 'group', '统计'],
    },
  ],
});

MODULES.push({
  id: 'redis', name: 'redis', icon: '🟥', category: '存储与序列化',
  doc: 'https://redis-py.readthedocs.io/en/latest/',
  desc: 'Redis 客户端：缓存、计数器、队列、去重、排行榜，后端与爬虫都常用。',
  install: 'pip install redis',
  tips: [
    '<b>decode_responses=True</b> 几乎必设：不设的话所有返回值都是 bytes（b"xxx"），和字符串比较永远失败。',
    'redis-py 的方法名与 redis 命令一一对应（SET→set、HGETALL→hgetall），会命令就会 API。',
  ],
  entries: [
    {
      name: 'connect', sig: "r = redis.Redis(host='localhost', port=6379, db=0, password=None, decode_responses=True)",
      brief: '建立连接（自带连接池）。',
      examples: [
        { title: '', code: `import redis\n\nr = redis.Redis(host='127.0.0.1', port=6379,\n                password='xxx', db=0,\n                decode_responses=True,     # 返回 str 而不是 bytes\n                socket_timeout=5)\nr.ping()          # True = 连通\n\n# 多线程共享显式连接池:\npool = redis.ConnectionPool(host='127.0.0.1', decode_responses=True)\nr2 = redis.Redis(connection_pool=pool)` },
      ],
      pitfalls: [
        '<b>忘了 decode_responses=True</b>：get 返回 b"value"，if val == "value" 永远 False —— 新手第一坑。',
        'db 是数字编号 0~15 不是名字；多环境容易混，最好用 key 前缀区分。',
        '连不上先 r.ping()：redis-server 没启动/密码没传/防火墙。',
      ],
      related: ['string-过期', '常用结构'],
      tags: ['redis', '连接', '缓存'],
    },
    {
      name: 'string-过期', sig: "r.set('key', 'value', ex=60) / r.get('key') / r.expire('key', 300) / r.ttl('key')",
      brief: '字符串读写 + 过期时间（缓存的核心用法）。',
      examples: [
        { title: '', code: `r.set('token:1001', 'abc123', ex=3600)   # 1小时过期\nr.get('token:1001')                       # 'abc123'\nr.ttl('token:1001')                       # 剩余秒; -1永不过期 -2不存在\n\nr.expire('cache:user:1001', 300)          # 续期\nr.delete('cache:user:1001')\n\n# 不存在才设置(分布式锁的基础):\nr.set('lock:task', 'worker1', nx=True, ex=30)\n\n# 计数器:\nr.incr('pv:home')\nr.incrby('pv:home', 10)` },
      ],
      pitfalls: [
        '过期参数 ex（秒）/px（毫秒）可以直接放 set 里；先 set 再 expire 两步之间宕机会留下永不过期的脏 key。',
        '<b>get 不存在的 key 返回 None 不报错</b>，链式操作前判空。',
        'incr/incrby 只能对整数值用，对普通字符串报错。',
      ],
      related: ['connect', '常用结构'],
      tags: ['缓存', '过期', '计数器', '锁'],
    },
    {
      name: '常用结构', sig: "hash: hset/hget/hgetall · list: lpush/rpop/lrange · set: sadd/sismember · zset: zadd/zrevrange",
      brief: '四种常用数据结构速查。',
      examples: [
        { title: '', code: `# Hash: 对象字段级读写\nr.hset('user:1001', mapping={'name': '张三', 'age': 25})\nr.hget('user:1001', 'name')\nr.hgetall('user:1001')      # {'name': '张三', 'age': '25'}\n\n# List: 简易队列\nr.lpush('queue', 'task1')\nr.rpop('queue')\nr.lrange('queue', 0, -1)\n\n# Set: 去重(爬虫 URL 去重)\nr.sadd('seen_urls', url)\nr.sismember('seen_urls', url)   # True/False\n\n# ZSet: 排行榜\nr.zadd('rank', {'张三': 95, '李四': 88})\nr.zrevrange('rank', 0, 9, withscores=True)   # Top10` },
      ],
      pitfalls: [
        '所有值都按<b>字符串存储</b>：hget 拿到 "25"，做数值比较前 int()。',
        'smembers/hgetall 会全量返回，几百万成员会卡，改用 sscan_iter/hscan_iter 增量遍历。',
        'zadd 参数是 {成员: 分数}，和直觉的 (成员, 分数) 元组顺序相反。',
      ],
      related: ['string-过期'],
      tags: ['hash', 'list', 'set', 'zset', '队列'],
    },
  ],
});
