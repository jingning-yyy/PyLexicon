/* 工具与调参：loguru / argparse / pyinstaller / optuna / imbalanced-learn */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'loguru', name: 'loguru', icon: '🪵', category: '自动化与效率',
  doc: 'https://loguru.readthedocs.io/',
  desc: '零配置日志库：import 即用，文件轮转、异常捕获一行搞定，替代繁琐的 logging。',
  install: 'pip install loguru',
  entries: [
    {
      name: '基础', sig: "from loguru import logger / logger.info('x') / logger.error('x')",
      brief: '导入即用，带时间/级别/位置信息的日志。',
      examples: [
        { title: '', code: `from loguru import logger\n\nlogger.debug('调试信息')\nlogger.info('任务开始')\nlogger.success('完成!')       # 比info更醒目的级别\nlogger.warning('磁盘快满了')\nlogger.error('失败: {}', 42)  # {} 占位, 类似format\nlogger.exception(e)           # 在except里用, 自动带堆栈` },
      ],
      pitfalls: [
        '默认只输出到<b>控制台(stderr)</b>，要落文件必须 logger.add("xx.log")。',
        '风格是 <code>logger.info("值: {}", x)</code>，不是 f-string 也能用（但直接 f-string 也可以）。',
      ],
      related: ['文件与轮转'],
      tags: ['日志', 'loguru'],
    },
    {
      name: '文件与轮转', sig: 'logger.add("app.log", rotation="500 MB", retention="10 days", encoding="utf-8")',
      brief: '输出到文件：自动切分、自动清理旧日志。',
      examples: [
        { title: '', code: `from loguru import logger\n\nlogger.add('logs/app.log',\n           rotation='00:00',        # 每天零点切分(也可'500 MB')\n           retention='7 days',      # 只留7天\n           level='INFO',\n           encoding='utf-8',\n           enqueue=True)            # 多进程/线程安全(异步写)\n\nlogger.info('写入文件了')` },
      ],
      pitfalls: [
        '<b>中文日志文件必须 encoding="utf-8"</b>，否则 Windows 下 GBK 乱码。',
        'rotation 按时间或按大小二选一即可；不配 retention 日志会无限堆积。',
        'logger.remove() 可以清掉默认的控制台输出（想只写文件时用）。',
      ],
      related: ['基础'],
      tags: ['文件', '轮转', 'retention'],
    },
    {
      name: '异常捕获', sig: '@logger.catch / with logger.catch(): ...',
      brief: '一行捕获并记录完整异常堆栈。',
      examples: [
        { title: '', code: `from loguru import logger\n\n@logger.catch                      # 函数抛异常自动记录完整堆栈\ndef risky():\n    return 1 / 0\n\nrisky()   # 崩了但日志里有变量值和堆栈(backtrace)\n\n# 或者临时包一段:\nwith logger.catch(message='解析失败但不中断'):\n    do_something()` },
      ],
      pitfalls: [
        'logger.catch 默认<b>吞掉异常继续跑</b>（返回 None），要重新抛出传 <code>reraise=True</code>。',
        'backtrace/diagnose 出的日志含变量值，生产环境注意敏感信息，可 diagnose=False。',
      ],
      related: ['基础'],
      tags: ['异常', '堆栈', 'catch'],
    },
  ],
});

MODULES.push({
  id: 'argparse', name: 'argparse', icon: '🎛️', category: '自动化与效率',
  doc: 'https://docs.python.org/zh-cn/3/library/argparse.html',
  desc: '命令行参数解析标准库：让脚本支持 python job.py --date 2024-05 --dry-run。',
  install: false,
  entries: [
    {
      name: '基础', sig: "p = argparse.ArgumentParser() / p.add_argument('--n', type=int, default=1) / p.parse_args()",
      brief: '三步：建解析器、加参数、解析。',
      examples: [
        { title: '', code: `import argparse\n\np = argparse.ArgumentParser(description='数据跑批工具')\np.add_argument('--date', required=True, help='跑批日期 YYYY-MM-DD')\np.add_argument('--limit', type=int, default=100)\nargs = p.parse_args()\n\nprint(args.date, args.limit)\n# 运行: python job.py --date 2024-05-20 --limit 50\n# python job.py -h  自动生成帮助` },
      ],
      pitfalls: [
        'required=True 的参数不给会报错退出；type=int 时传非数字也会友好报错。',
        '<b>属性名是横线转下划线</b>：--dry-run → args.dry_run。',
      ],
      related: ['位置与开关'],
      tags: ['命令行', '参数', '脚本'],
    },
    {
      name: '位置与开关', sig: "p.add_argument('输入文件') / p.add_argument('--verbose', action='store_true')",
      brief: '位置参数（必填按顺序）与布尔开关。',
      examples: [
        { title: '', code: `p = argparse.ArgumentParser()\np.add_argument('src')                       # 位置参数: python app.py 输入.csv\np.add_argument('--verbose', action='store_true')   # 开关: 出现即True\np.add_argument('--tags', nargs='+')         # 多值: --tags a b c\np.add_argument('--mode', choices=['fast', 'full'], default='fast')\nargs = p.parse_args()\nprint(args.src, args.verbose, args.tags, args.mode)` },
      ],
      pitfalls: [
        '<b>位置参数不加横线、顺序固定</b>；可选参数加 -- 可任意顺序。',
        'choices 之外取值直接报错退出（这是保护不是 bug）。',
      ],
      related: ['基础'],
      tags: ['开关', 'choices'],
    },
  ],
});

MODULES.push({
  id: 'pyinstaller', name: 'pyinstaller', icon: '📦', category: '自动化与效率',
  doc: 'https://pyinstaller.org/',
  desc: '把 Python 脚本打包成 exe：发给别人双击就用，不用装 Python。',
  install: 'pip install pyinstaller',
  aliases: ['打包', 'exe'],
  tips: [
    '<b>在干净的虚拟环境里打包</b>（只装本项目依赖），体积能小一半且少报缺包：python -m venv venv。',
    'exe 双击闪退时，在 cmd 里运行它看报错 —— 90% 是缺数据文件或缺隐藏导入。',
  ],
  entries: [
    {
      name: '基本打包', sig: 'pyinstaller app.py -> dist/app.exe',
      brief: '一条命令打包，产物在 dist 目录。',
      examples: [
        { title: '', code: `# 命令行执行(不是 python 代码):\npyinstaller app.py\n# 产物:\n#   build/     中间文件(可删)\n#   dist/app/  有一堆dll + app.exe (文件夹版)\n#   app.spec   打包配置(可编辑后用 pyinstaller app.spec 重复打包)\n\n# 文件夹版启动快; 想要单个exe用 -F 见下一条` },
      ],
      pitfalls: [
        '<b>重复打包前删掉 build/ 和 dist/</b>（或加 --noconfirm），旧产物有时不更新。',
        'exe 双击闪退：cmd 里运行看 traceback；多半是相对路径找不到文件或缺模块。',
      ],
      related: ['常用参数', '资源文件'],
      tags: ['打包', 'exe', '分发'],
    },
    {
      name: '常用参数', sig: 'pyinstaller -F -w -i 图标.ico --name 工具 app.py',
      brief: '单文件、无窗口、图标等高频参数。',
      params: [
        { n: '-F / --onefile', t: '-', d: '打成单个 exe（启动稍慢）' },
        { n: '-w / --noconsole', t: '-', d: '不显示黑色控制台（图形界面程序用）' },
        { n: '-i / --icon', t: '-', d: 'exe 图标 .ico 文件' },
        { n: '--name', t: '-', d: '产物名称，默认用脚本名' },
      ],
      examples: [
        { title: '', code: `pyinstaller -F -w -i tool.ico --name 数据工具 app.py\n# -> dist/数据工具.exe 单文件\n\n# 控制台脚本别加 -w: 加了 print 看不见、报错也不知道` },
      ],
      pitfalls: [
        '<b>-w 只给 GUI 程序用</b>（如 pyautogui/tkinter）；控制台程序加 -w 等于自废调试能力。',
        '-F 单文件版启动慢几秒（要解压到临时目录），文件多的小工具用文件夹版体验更好。',
      ],
      related: ['基本打包', '资源文件'],
      tags: ['onefile', '图标', '参数'],
    },
    {
      name: '资源文件', sig: "--add-data '源;目标' / sys._MEIPASS",
      brief: '把配置/图片/模型一起打包，并让代码找得到它们。',
      examples: [
        { title: '', code: `# 打包时带上资源 (Windows 用分号分隔, Linux/Mac 用冒号):\npyinstaller -F --add-data "config.json;." --add-data "img;img" app.py\n\n# 代码里统一这样取路径(开发和打包都通用):\nimport sys, os\n\ndef res_path(name):\n    base = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))\n    return os.path.join(base, name)\n\nopen(res_path('config.json'), encoding='utf-8')` },
      ],
      pitfalls: [
        '<b>单文件 exe 运行时解压到临时目录 _MEIPASS</b>，代码里的相对路径默认在临时目录找 —— 读不到配置/图片全因为这个。',
        '数据文件写到 exe 旁边（用户可改的），别打进包里；打进包的是只读资源。',
      ],
      related: ['常用参数'],
      tags: ['资源', '路径', '_MEIPASS'],
    },
    {
      name: '常见坑', sig: '杀软误报 / 缺模块 / 体积巨大',
      brief: '打包三连坑与解法。',
      examples: [
        { title: '', code: `# 1. 杀毒软件报毒: 打包特征被误判 -> 换目录排除/加信任,\n#    正式分发考虑代码签名证书\n# 2. ModuleNotFoundError: 动态导入的包 pyinstaller 看不到\n#    -> --hidden-import 包名  或写进 .spec 的 hiddenimports\n# 3. 体积几百MB: pandas/numpy 常态; 干净venv + 只 import 用到的\n#    + 不打包 pandas 时别顺手 import\n# 4. 杀进程后临时目录残留: -F 每次解压, 排查时用文件夹版定位` },
      ],
      pitfalls: [
        '打包前先在干净环境跑通脚本，再打包 —— 直接在有几十个包的大环境打包，最容易隐性依赖炸裂。',
      ],
      related: ['基本打包'],
      tags: ['误报', 'hidden-import', '体积'],
    },
  ],
});

MODULES.push({
  id: 'optuna', name: 'optuna', icon: '🎯', category: '机器学习',
  doc: 'https://optuna.readthedocs.io/',
  desc: '自动超参调优：比网格搜索聪明（试得少找得好），支持剪枝、断点续跑。',
  install: 'pip install optuna',
  entries: [
    {
      name: '基本流程', sig: "study = optuna.create_study(direction='maximize') / study.optimize(objective, n_trials=100)",
      brief: '定义 objective → 自动搜索 → 取最优参数。',
      examples: [
        { title: '', code: `import optuna\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.model_selection import cross_val_score\n\ndef objective(trial):\n    params = {\n        'n_estimators': trial.suggest_int('n_estimators', 50, 500),\n        'max_depth': trial.suggest_int('max_depth', 3, 15),\n        'min_samples_leaf': trial.suggest_int('min_samples_leaf', 1, 20),\n    }\n    model = RandomForestClassifier(**params, random_state=42, n_jobs=-1)\n    return cross_val_score(model, X_train, y_train, cv=3,\n                           scoring='f1').mean()\n\nstudy = optuna.create_study(direction='maximize')   # 最大化f1\nstudy.optimize(objective, n_trials=100)\nprint(study.best_params, study.best_value)` },
      ],
      pitfalls: [
        '<b>direction 要和指标方向一致</b>：AUC/F1 是 maximize，RMSE 是 minimize，反了会朝反方向搜。',
        'objective 里抛异常默认整个 optimize 停止；想跳过失败 trial 用 <code>catch=(Exception,)</code>。',
      ],
      related: ['suggest家族', '持久化'],
      tags: ['调参', '搜索', '贝叶斯'],
    },
    {
      name: 'suggest家族', sig: "trial.suggest_int / suggest_float / suggest_categorical",
      brief: '在 objective 里声明每个参数的取值范围。',
      examples: [
        { title: '', code: `def objective(trial):\n    lr = trial.suggest_float('lr', 1e-5, 1e-1, log=True)  # 对数均匀采样\n    leaves = trial.suggest_int('num_leaves', 20, 200, log=True)\n    loss = trial.suggest_categorical('loss', ['l1', 'l2', 'huber'])\n    dropout = trial.suggest_float('dropout', 0.0, 0.5, step=0.1)\n    ...` },
      ],
      pitfalls: [
        '学习率这类跨数量级的参数<b>一定要 log=True</b>，线性采样几乎全落在高端白烧算力。',
        '参数名是字符串键，best_params 的键和你 suggest 的名字一致。',
      ],
      related: ['基本流程'],
      tags: ['采样', '参数空间'],
    },
    {
      name: '持久化', sig: "create_study(storage='sqlite:///optuna.db', study_name='s1', load_if_exists=True)",
      brief: '搜索历史存 SQLite：中断续跑、多进程共享。',
      examples: [
        { title: '', code: `study = optuna.create_study(\n    storage='sqlite:///optuna.db',   # 存本地数据库\n    study_name='rf_v1',\n    direction='maximize',\n    load_if_exists=True,             # 已存在就接着跑\n)\nstudy.optimize(objective, n_trials=50, timeout=3600)  # 或限时1小时\n\ndf = study.trials_dataframe()        # 所有试验变成DataFrame分析\nprint(study.best_params)` },
      ],
      pitfalls: [
        '<b>load_if_exists=False（默认）时同名 study 再跑直接报错</b>，续跑场景必传 True。',
        'SQLite 存储多进程并行安全，多机共享换 MySQL/PostgreSQL 的 storage 地址。',
      ],
      related: ['基本流程'],
      tags: ['存储', '续跑', '断点'],
    },
  ],
});

MODULES.push({
  id: 'imblearn', name: 'imbalanced-learn', icon: '⚖️', category: '机器学习',
  doc: 'https://imbalanced-learn.org/',
  desc: '样本不平衡处理：SMOTE 过采样、欠采样，让少数类被模型"看见"。',
  install: 'pip install imbalanced-learn',
  pkg: 'imbalanced-learn',
  aliases: ['imblearn', 'smote', '不平衡'],
  tips: [
    '<b>只能对训练集重采样，测试集保持原始分布</b>！测试集造假等于自欺欺人。',
    '重采样不是万能：先试 class_weight="balanced" 和合适的阈值/指标（F1/AUC 而不是 accuracy）。',
  ],
  entries: [
    {
      name: 'SMOTE', sig: 'X_res, y_res = SMOTE().fit_resample(X_train, y_train)',
      brief: '合成少数类样本，把训练集"拉平"。',
      examples: [
        { title: '', code: `from imblearn.over_sampling import SMOTE\nfrom collections import Counter\n\nprint(Counter(y_train))            # {0: 9500, 1: 500}  严重不平衡\nsm = SMOTE(random_state=42, k_neighbors=5)\nX_res, y_res = sm.fit_resample(X_train, y_train)\nprint(Counter(y_res))              # {0: 9500, 1: 9500}  1:1\n\nmodel = RandomForestClassifier().fit(X_res, y_res)   # 用重采样后的训练` },
      ],
      pitfalls: [
        '<b>先 train_test_split 再 SMOTE</b>，顺序反了会把测试集信息合成进训练集（数据泄漏）。',
        'SMOTE 只支持<b>数值特征</b>；类别列要先编码，或用 SMOTENC。',
        '报 "Expected n_neighbors <= n_samples"：少数类样本太少，调小 k_neighbors。',
      ],
      related: ['采样策略', 'Pipeline结合'],
      tags: ['smote', '过采样', '不平衡'],
    },
    {
      name: '采样策略', sig: "sampling_strategy=0.5 或 {' Majority': 9500, '少数': 3000}",
      brief: '控制重采样后的比例，不必硬拉到 1:1。',
      examples: [
        { title: '', code: `from imblearn.over_sampling import SMOTE\nfrom imblearn.under_sampling import RandomUnderSampler\n\n# 少数类:多数类 = 0.5 (少数类被合成到多数类的一半)\nSMOTE(sampling_strategy=0.5)\n\n# 过采样+欠采样组合拳(推荐, 比1:1温和):\nover = SMOTE(sampling_strategy=0.3)\nunder = RandomUnderSampler(sampling_strategy=0.8)\nfrom imblearn.pipeline import Pipeline\npipe = Pipeline([('o', over), ('u', under), ('m', model)])` },
      ],
      pitfalls: [
        '<b>1:1 不一定最好</b>，全拉平常导致过拟合少数类的合成噪声，0.3~0.8 区间试。',
        'sampling_strategy 对过采样是"少数/多数"目标比，对欠采样方向相反，文档要细看。',
      ],
      related: ['SMOTE'],
      tags: ['比例', '欠采样', '策略'],
    },
    {
      name: 'Pipeline结合', sig: 'imblearn.pipeline.Pipeline([...]) + cross_val_score',
      brief: '重采样放进流水线，交叉验证时不泄漏。',
      examples: [
        { title: '', code: `from imblearn.pipeline import Pipeline as ImbPipeline\nfrom imblearn.over_sampling import SMOTE\nfrom sklearn.model_selection import cross_val_score\n\npipe = ImbPipeline([\n    ('smote', SMOTE(random_state=42)),\n    ('clf', RandomForestClassifier(n_estimators=200)),\n])\n# 注意是 imblearn 的 Pipeline: 每一折先重采样再训练\ncross_val_score(pipe, X_train, y_train, cv=5, scoring='f1')` },
      ],
      pitfalls: [
        '<b>必须用 imblearn 的 Pipeline 不是 sklearn 的</b>——只有它认识 fit_resample，否则交叉验证时整折先被重采样=泄漏。',
      ],
      related: ['SMOTE'],
      tags: ['pipeline', '交叉验证', '泄漏'],
    },
  ],
});
