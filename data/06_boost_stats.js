/* 机器学习：xgboost / lightgbm / statsmodels / joblib */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'xgboost', name: 'xgboost', icon: '🚀', category: '机器学习',
  doc: 'https://xgboost.readthedocs.io/en/stable/',
  desc: '梯度提升树王者之一，表格数据竞赛与工业界主力，精度和速度都强。',
  install: 'pip install xgboost',
  aliases: ['xgb'],
  tips: [
    '<b>两套接口</b>：sklearn 风格（XGBClassifier/XGBRegressor）与原生接口（DMatrix + xgb.train），参数名还不同：eta↔learning_rate、num_boost_round↔n_estimators。',
    '<b>2.0 版本大变化</b>：early_stopping_rounds 从 fit() 移到了构造函数里；网上老教程的 <code>fit(early_stopping_rounds=100)</code> 在新版会报错/警告 —— 报错就按本文条目写。',
  ],
  entries: [
    {
      name: 'XGBClassifier', sig: "XGBClassifier(n_estimators=300, learning_rate=0.1, max_depth=6, subsample=0.8, colsample_bytree=0.8, scale_pos_weight=1)",
      brief: 'XGBoost 分类器（sklearn 风格接口），fit/predict 与 sklearn 一致。',
      params: [
        { n: 'n_estimators', t: 'int', d: '树的数量（原生接口叫 num_boost_round）', dflt: '100' },
        { n: 'learning_rate', t: 'float', d: '学习率（原生叫 eta），小了要更多树', dflt: '0.3' },
        { n: 'max_depth', t: 'int', d: '树深，防过拟合第一杠杆', dflt: '6' },
        { n: 'subsample', t: 'float', d: '每棵树抽样比例', dflt: '1.0' },
        { n: 'colsample_bytree', t: 'float', d: '每棵树特征抽样比例', dflt: '1.0' },
        { n: 'scale_pos_weight', t: 'float', d: '正负样本失衡时设为 负样本数/正样本数', dflt: '1' },
      ],
      examples: [
        { title: '', code: `from xgboost import XGBClassifier\nclf = XGBClassifier(\n    n_estimators=500, learning_rate=0.05, max_depth=6,\n    subsample=0.8, colsample_bytree=0.8,\n    eval_metric='logloss', random_state=42,\n)\nclf.fit(X_train, y_train)\nprint(clf.predict(X_test))               # 类别 0/1\nprint(clf.predict_proba(X_test)[:, 1])   # 正类概率` },
      ],
      pitfalls: [
        'XGBoost 要求数值型输入，<b>字符串类别列要先编码</b>（或 enable_categorical=True）。',
        '缺失值可以直接喂（自动学习默认方向），无需提前填充 —— 与 sklearn 模型不同。',
        '类别极度不平衡时只调 scale_pos_weight 不够，配合阈值调整与 AUC 评估。',
      ],
      related: ['fit-early-stopping', 'XGBRegressor', 'plot_importance'],
      tags: ['分类', '梯度提升', '调参'],
    },
    {
      name: 'XGBRegressor', sig: "XGBRegressor(n_estimators=300, learning_rate=0.1, max_depth=6, objective='reg:squarederror')",
      brief: 'XGBoost 回归器，用法与分类器一致，评估换成 RMSE/MAE。',
      examples: [
        { title: '', code: `from xgboost import XGBRegressor\nfrom sklearn.metrics import mean_squared_error\nimport numpy as np\nreg = XGBRegressor(n_estimators=500, learning_rate=0.05,\n                   max_depth=6, subsample=0.8,\n                   objective='reg:squarederror')\nreg.fit(X_train, y_train)\ny_pred = reg.predict(X_test)\nprint(np.sqrt(mean_squared_error(y_test, y_pred)))   # RMSE` },
      ],
      pitfalls: [
        'objective 决定输出：squarederror 是普通回归，reg:absoluteerror 更抗离群值，count:poisson 用于计数。',
        '树模型不能外推：预测超出训练范围的 y 会被"截"在边界，趋势类数据考虑 linear booster 或差分。',
      ],
      related: ['XGBClassifier', 'fit-early-stopping'],
      tags: ['回归', '梯度提升'],
    },
    {
      name: 'fit-early-stopping', sig: 'clf.fit(X, y, eval_set=[(X_val, y_val)], verbose=100)',
      brief: '带验证集训练 + 早停（防止树太多过拟合）。',
      examples: [
        { title: '新版(2.0+)写法', code: `clf = XGBClassifier(\n    n_estimators=2000, learning_rate=0.05,\n    early_stopping_rounds=50,        # 2.0+ 放构造函数里!\n    eval_metric='auc',\n)\nclf.fit(X_train, y_train,\n        eval_set=[(X_val, y_val)],\n        verbose=100)                  # 每100轮打印\nprint(clf.best_iteration)             # 最优轮数\npred = clf.predict(X_test)            # 自动用 best_iteration 的模型` },
      ],
      pitfalls: [
        '<b>版本差异重灾区</b>：1.x 是 <code>fit(..., early_stopping_rounds=50)</code>；2.0+ 移到构造函数，放 fit 里会 TypeError/警告。报错先查版本 <code>import xgboost; print(xgboost.__version__)</code>。',
        'eval_set 的验证集是从训练数据里再划出来的，不要把测试集当验证集（间接泄漏）。',
        '早停要求至少一个 eval_metric，新版可在构造函数里给。',
      ],
      related: ['XGBClassifier', 'native-train'],
      tags: ['早停', '训练', '版本'],
    },
    {
      name: 'native-train', sig: "dtrain = xgb.DMatrix(X, label=y) / model = xgb.train(params, dtrain, num_boost_round=500, evals=[(dval,'val')], early_stopping_rounds=50)",
      brief: '原生接口：参数放 dict，数据包成 DMatrix，性能最好、控制最细。',
      examples: [
        { title: '', code: `import xgboost as xgb\nparams = {\n    'objective': 'binary:logistic',\n    'eta': 0.05,             # 即 learning_rate\n    'max_depth': 6,\n    'subsample': 0.8,\n    'eval_metric': 'auc',\n}\ndtrain = xgb.DMatrix(X_train, label=y_train)\ndval   = xgb.DMatrix(X_val, label=y_val)\nmodel = xgb.train(params, dtrain, num_boost_round=2000,\n                  evals=[(dval, 'val')], early_stopping_rounds=50)\ny_prob = model.predict(xgb.DMatrix(X_test))   # 直接是概率` },
      ],
      pitfalls: [
        '参数名对照：eta=learning_rate、num_boost_round=n_estimators、lambda/alpha 是正则项系数。',
        'predict DMatrix 要用 <b>同一套预处理</b>重新包 DMatrix，别把 sklearn 风格训练的模型用原生 predict 混着来。',
        '原生 predict 输出默认是概率（binary:logistic），没有 predict_proba。',
      ],
      related: ['fit-early-stopping', 'plot_importance'],
      tags: ['原生接口', 'dmatrix', 'train'],
    },
    {
      name: 'plot_importance', sig: "xgb.plot_importance(model, importance_type='gain', max_num_features=15)",
      brief: '画特征重要性条形图；模型属性 feature_importances_ 同源。',
      examples: [
        { title: '', code: `from xgboost import plot_importance\nimport matplotlib.pyplot as plt\nplot_importance(model, importance_type='gain', max_num_features=15)\nplt.rcParams['font.sans-serif'] = ['SimHei']\nplt.show()\n\nimport pandas as pd\nimp = pd.Series(model.feature_importances_, index=X_train.columns)\nprint(imp.sort_values(ascending=False))` },
      ],
      pitfalls: [
        '<b>importance_type 三种含义不同</b>：weight（特征被用次数）、gain（带来增益，最推荐）、cover；plot_importance 默认 weight，feature_importances_ 默认 gain，两者对不上别慌。',
        '重要性高 ≠ 因果，且高基数列（如用户ID）天然偏高。',
      ],
      related: ['XGBClassifier'],
      tags: ['特征重要性', '解释'],
    },
  ],
});

MODULES.push({
  id: 'lightgbm', name: 'lightgbm', icon: '🌿', category: '机器学习',
  doc: 'https://lightgbm.readthedocs.io/en/stable/',
  desc: '微软出品的梯度提升库：比 XGBoost 更快更省内存，原生支持类别特征。',
  install: 'pip install lightgbm',
  aliases: ['lgb', 'lgbm'],
  tips: [
    'LGBM 按 <b>leaf-wise</b> 方向生长（XGBoost 是 level-wise），同样精度下树更浅更快，但更容易过拟合 —— 控制 <code>num_leaves</code> 比控制 max_depth 更重要。',
    '与 xgboost 一样有两套接口；早停在新版也是通过 callbacks 传入。',
  ],
  entries: [
    {
      name: 'LGBMClassifier', sig: 'LGBMClassifier(n_estimators=500, learning_rate=0.05, num_leaves=31, min_child_samples=20, subsample=0.8, colsample_bytree=0.8)',
      brief: 'LightGBM 分类器，sklearn 风格接口。',
      params: [
        { n: 'num_leaves', t: 'int', d: '叶子数，复杂度主控（应 < 2^max_depth）', dflt: '31' },
        { n: 'min_child_samples', t: 'int', d: '叶子最少样本数，防过拟合', dflt: '20' },
        { n: 'learning_rate / n_estimators', t: '-', d: '与 XGB 相同，小学习率+早停套路' },
      ],
      examples: [
        { title: '', code: `from lightgbm import LGBMClassifier\nclf = LGBMClassifier(\n    n_estimators=2000, learning_rate=0.05,\n    num_leaves=63, min_child_samples=20,\n    subsample=0.8, colsample_bytree=0.8,\n    random_state=42,\n)\nclf.fit(X_train, y_train)\nprint(clf.score(X_test, y_test))` },
      ],
      pitfalls: [
        'num_leaves 调太大训练集分数暴涨验证集暴跌 —— 典型过拟合信号，先减它再加树。',
        '特征名带特殊字符（逗号、方括号、引号、空格）默认报错，DataFrame 列名清洗一下或传 <code>feature_name</code>。',
      ],
      related: ['fit-callbacks', '原生接口'],
      tags: ['分类', 'lgbm', '调参'],
    },
    {
      name: 'fit-callbacks', sig: 'clf.fit(X, y, eval_set=[(X_val, y_val)], callbacks=[lgb.early_stopping(50), lgb.log_evaluation(100)])',
      brief: '验证集 + 早停 + 日志回调（新版标准写法）。',
      examples: [
        { title: '', code: `import lightgbm as lgb\nclf.fit(\n    X_train, y_train,\n    eval_set=[(X_val, y_val)],\n    eval_metric='auc',\n    callbacks=[\n        lgb.early_stopping(stopping_rounds=50),\n        lgb.log_evaluation(period=100),      # 每100轮打日志, 0=不打印\n    ],\n)\nprint(clf.best_iteration_)\npred = clf.predict(X_test, num_iteration=clf.best_iteration_)` },
      ],
      pitfalls: [
        '老写法 <code>fit(early_stopping_rounds=50, verbose=100)</code> 新版会报参数已移除，改用 callbacks。',
        '<b>分类别特征</b>：数值编码后传 <code>categorical_feature=[列名列表]</code>，别做 onehot（LGBM 原生支持，效果更好速度更快）。',
      ],
      related: ['LGBMClassifier', '原生接口'],
      tags: ['早停', 'callbacks', '类别特征'],
    },
    {
      name: '原生接口', sig: "lgb.Dataset(X, label=y) / model = lgb.train(params, dtrain, num_boost_round=2000, valid_sets=[dval], callbacks=[...])",
      brief: '原生训练接口，控制最细，速度最快。',
      examples: [
        { title: '', code: `import lightgbm as lgb\nparams = {\n    'objective': 'binary',\n    'metric': 'auc',\n    'learning_rate': 0.05,\n    'num_leaves': 63,\n    'feature_pre_filter': False,\n}\ndtrain = lgb.Dataset(X_train, label=y_train,\n                     categorical_feature=['城市', '渠道'])\ndval = lgb.Dataset(X_val, label=y_val, reference=dtrain)\nmodel = lgb.train(params, dtrain, num_boost_round=2000,\n                  valid_sets=[dval],\n                  callbacks=[lgb.early_stopping(50)])\ny_prob = model.predict(X_test, num_iteration=model.best_iteration)` },
      ],
      pitfalls: [
        '验证集 Dataset 要传 <code>reference=dtrain</code> 保证特征对齐。',
        'params 里写 sklearn 风格参数名（如 n_estimators）不生效 —— 原生接口是 num_boost_round / num_iterations。',
      ],
      related: ['fit-callbacks', 'LGBMClassifier'],
      tags: ['原生', 'dataset', 'train'],
    },
    {
      name: '过拟合速查', sig: '调参优先级：num_leaves → min_data_in_leaf → max_depth → feature_fraction/bagging',
      brief: 'LightGBM 过拟合时的调参顺序与经验值。',
      params: [
        { n: 'feature_fraction', t: 'float', d: '列采样（=colsample_bytree），0.6~0.9', dflt: '1.0' },
        { n: 'bagging_fraction + bagging_freq', t: 'float/int', d: '行采样，两个要一起设才生效', dflt: '1/0' },
        { n: 'lambda_l1 / lambda_l2', t: 'float', d: 'L1/L2 正则' },
      ],
      examples: [
        { title: '', code: `params = {\n    'objective': 'binary', 'metric': 'auc',\n    'learning_rate': 0.03,\n    'num_leaves': 31,             # 训练AUC远高验证AUC时先减它\n    'min_data_in_leaf': 100,\n    'feature_fraction': 0.8,\n    'bagging_fraction': 0.8, 'bagging_freq': 1,\n    'lambda_l2': 1.0,\n}` },
      ],
      pitfalls: [
        'bagging_fraction 不配 bagging_freq 等于没开。',
        '学习率 <0.03 时必须配足量的树+早停，否则欠拟合。',
      ],
      related: ['LGBMClassifier'],
      tags: ['调参', '过拟合', '正则'],
    },
  ],
});

MODULES.push({
  id: 'statsmodels', name: 'statsmodels', icon: '📊', category: '机器学习',
  doc: 'https://www.statsmodels.org/stable/index.html',
  desc: '统计推断库：回归系数检验、p 值、置信区间、时间序列，写报告做归因用它与 sklearn 互补。',
  install: 'pip install statsmodels',
  aliases: ['stats', 'sm'],
  tips: [
    '<b>statsmodels 不会自动加常数项（截距）</b>！必须手动 <code>sm.add_constant(X)</code>，否则回归线不过原点被强行拟合 —— 与 sklearn 的 LinearRegression 最大区别。',
    '接口定位：要"预测准"用 sklearn/XGB，要"解释为什么、系数显不显著"用 statsmodels。',
  ],
  entries: [
    {
      name: 'OLS', sig: 'model = sm.OLS(y, X).fit()',
      brief: '普通最小二乘回归（注意参数顺序是 y 在前、X 在后！）。',
      params: [
        { n: 'endog', t: 'array', d: '因变量 y —— 第一个参数' },
        { n: 'exog', t: 'array', d: '自变量 X —— 第二个参数，需含常数列' },
      ],
      examples: [
        { title: '', code: `import statsmodels.api as sm\nX = sm.add_constant(df[['广告投入', '价格']])   # 手动加截距列!\ny = df['销量']\nmodel = sm.OLS(y, X).fit()\nprint(model.params)      # 系数\nprint(model.predict(X))` },
      ],
      pitfalls: [
        '<b>OLS(y, X) 与 sklearn 的 fit(X, y) 参数顺序相反</b>，写反了报维度错或者悄悄出错。',
        'X 里没有常数列时模型强行过原点，R² 也变得不可比。',
        'y/X 有缺失值时直接报错，先 dropna。',
      ],
      related: ['summary', 'formula-ols'],
      tags: ['回归', '最小二乘', 'ols'],
    },
    {
      name: 'summary', sig: 'print(model.summary())',
      brief: '输出完整统计报告表：系数、标准误、p 值、R² 等一次看全。',
      examples: [
        { title: '怎么读这张表', code: `print(model.summary())\n# 重点看:\n#  coef        系数: 其他变量不变时, x 增加1, y 平均变化多少\n#  P>|t|       p 值: < 0.05 通常认为该变量显著\n#  [0.025 0.975] 置信区间: 区间不含 0 即显著\n#  R-squared / Adj. R-squared  解释力; 样本小看 Adjusted\n#  Durbin-Watson ≈2 无自相关; Prob(F) 整体模型显著性` },
      ],
      pitfalls: [
        'R² 高不代表模型好：可能过拟合或伪回归，看系数符号是否符合业务逻辑。',
        'p 值只是"显著"不是"重要"，效应量看 coef 大小。',
      ],
      related: ['OLS'],
      tags: ['报告', 'p值', '显著性'],
    },
    {
      name: 'formula-ols', sig: "smf.ols('y ~ x1 + x2 + C(类别)', data=df).fit()",
      brief: 'R 风格公式接口：直接用 DataFrame 列名，C() 自动处理分类变量。',
      examples: [
        { title: '', code: `import statsmodels.formula.api as smf\nmodel = smf.ols('销量 ~ 广告投入 + 价格 + C(城市)', data=df).fit()\n# C(城市) 会自动 one-hot, 并选一个基准组\nprint(model.summary())\n# 交互项:\nmodel2 = smf.ols('销量 ~ 广告投入 * 价格', data=df).fit()   # 含 广告*价格 交互\n# 对数变换也写在公式里:\nmodel3 = smf.ols('np.log(销量) ~ np.log(价格)', data=df).fit()` },
      ],
      pitfalls: [
        '公式里的列名含中文/特殊字符没问题，但<b>不能有空格和点</b>。',
        'C() 的参照组默认按排序取第一个，想指定基准组先在 DataFrame 里 set_categories。',
      ],
      related: ['OLS', 'summary'],
      tags: ['公式', '分类变量', '交互项'],
    },
    {
      name: 'Logit', sig: "sm.Logit(y, X).fit() / smf.logit('y ~ x1 + x2', data=df).fit()",
      brief: '逻辑回归（系数是 odds 的对数，解释方式与 sklearn 不同）。',
      examples: [
        { title: '', code: `import statsmodels.api as sm\nX = sm.add_constant(df[['年龄', '收入']])\nmodel = sm.Logit(df['是否流失'], X).fit()\nprint(model.summary())\n\n# 系数转成"几率比"更好解释:\nimport numpy as np\nprint(np.exp(model.params))    # >1 提升风险, <1 降低风险` },
      ],
      pitfalls: [
        'coef 是 log-odds，直接说"收入增加 1 流失率上升 coef"是错的，先 exp 变几率比。',
        '完全分离（某特征能完美区分 y）时不收敛，RegularizedMethods 或换 sklearn。',
      ],
      related: ['OLS', 'formula-ols'],
      tags: ['逻辑回归', '分类', '几率比'],
    },
    {
      name: '时间序列', sig: "ARIMA(df['y'], order=(p, d, q)).fit() / adfuller(y)",
      brief: 'ARIMA 建模与平稳性检验（ADF）。',
      examples: [
        { title: '', code: `from statsmodels.tsa.stattools import adfuller\nfrom statsmodels.tsa.arima.model import ARIMA\nimport itertools\n\n# 1. 平稳性检验\ncrit, pvalue, *_ = adfuller(df['销量'])\nprint('ADF p 值:', pvalue)      # p < 0.05 视为平稳, 否则差分\n\n# 2. 拟合 ARIMA(p, d, q)\nmodel = ARIMA(df['销量'], order=(1, 1, 1)).fit()\nprint(model.summary())\nforecast = model.forecast(steps=12)     # 预测未来12期` },
      ],
      pitfalls: [
        'ARIMA 要求<b>先平稳</b>：ADF 不通过就加大 d（差分阶数）再检验。',
        '索引必须是带频率的日期（<code>df = df.asfreq("M")</code>），否则 forecast 的日期会错。',
        '别和 statsmodels.tsa.arima.model.ARIMA 与旧的 ARMA 搞混，用新的 ARIMA。',
      ],
      related: ['OLS', 'summary'],
      tags: ['arima', '时间序列', '平稳性'],
    },
  ],
});

MODULES.push({
  id: 'joblib', name: 'joblib', icon: '💾', category: '机器学习',
  doc: 'https://joblib.readthedocs.io/en/stable/',
  desc: '模型/大数组持久化 + 简易并行，sklearn 官方推荐的模型保存方式。',
  install: 'pip install joblib',
  entries: [
    {
      name: 'dump-load', sig: "joblib.dump(value, filename, compress=0) / joblib.load(filename)",
      brief: '保存/加载 Python 对象（模型、numpy 大数组），比 pickle 对大数组更省空间。',
      params: [
        { n: 'compress', t: 'int / tuple', d: '0 不压缩；3 常用，模型文件显著变小', dflt: '0' },
      ],
      examples: [
        { title: '', code: `import joblib\njoblib.dump(model, 'model_v1.pkl', compress=3)   # 保存\nmodel = joblib.load('model_v1.pkl')              # 加载\njoblib.dump(big_array, 'features.npy.joblib')    # 大数组也适用` },
      ],
      pitfalls: [
        '加载环境要装<b>相同版本</b>的 sklearn/xgboost 等，版本差异是最常见报错。',
        '<code>.pkl</code> 里存的是对象引用路径，自定义类移动/改名后旧文件加载失败。',
        'sklearn 模型也可以用 pickle 存，但 joblib 对大 numpy 属性压缩更好，官方推荐 joblib。',
      ],
      related: ['parallel'],
      tags: ['保存', '模型', '持久化', '压缩'],
    },
    {
      name: 'parallel', sig: 'from joblib import Parallel, delayed / Parallel(n_jobs=-1)(delayed(func)(arg) for arg in args)',
      brief: '一行并行：把 for 循环的多进程/多线程加速变成一行代码。',
      params: [
        { n: 'n_jobs', t: 'int', d: '-1 用全部 CPU；CPU 密集配 prefer="processes"，IO 密集用线程' },
      ],
      examples: [
        { title: '', code: `from joblib import Parallel, delayed\nimport math\n\nresults = Parallel(n_jobs=-1)(\n    delayed(math.factorial)(n) for n in range(20)\n)\n\n# 带进度条(verbose): verbose=10\n# IO 密集(爬虫/下载)用线程:\nresults = Parallel(n_jobs=32, prefer='threads')(\n    delayed(fetch)(url) for url in urls\n)` },
      ],
      pitfalls: [
        'Windows 下多进程必须放在 <code>if __name__ == "__main__":</code> 里，否则无限递归启动报错。',
        'delayed 的函数必须<b>能被 import</b>（写在模块顶层），lambda 和嵌套函数会报 PicklingError。',
        'CPU 密集任务用进程，IO 密集用线程 —— 默认策略通常够用。',
      ],
      related: ['dump-load', 'memory'],
      tags: ['并行', '加速', '多进程'],
    },
    {
      name: 'memory', sig: "Memory(location='./cache', verbose=0)",
      brief: '函数结果磁盘缓存：参数相同就不再重算，特征工程提速利器。',
      examples: [
        { title: '', code: `from joblib import Memory\nmemory = Memory('./cache_dir', verbose=1)\n\n@memory.cache\ndef load_and_clean(path):\n    ...  # 昂贵的处理\n    return df\n\ndf = load_and_clean('big.csv')   # 第二次调用秒回` },
      ],
      pitfalls: [
        '缓存按"函数源码+参数"匹配，改了函数体自动失效（好事），但改了读的数据文件不会失效 —— 数据变了记得清缓存目录。',
        '返回大 DataFrame 时缓存目录会很大，注意磁盘。',
      ],
      related: ['parallel'],
      tags: ['缓存', '加速'],
    },
  ],
});
