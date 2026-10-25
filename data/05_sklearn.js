/* 机器学习：sklearn */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'sklearn', name: 'sklearn', icon: '🤖', category: '机器学习',
  doc: 'https://scikit-learn.org/stable/',
  pkg: 'scikit-learn',
  desc: '机器学习标准库：统一 fit/predict 接口覆盖预处理、分类回归、聚类、评估、调参。',
  install: 'pip install scikit-learn',
  aliases: ['sk', 'scikit-learn', 'scikitlearn'],
  tips: [
    '所有模型都是同一套接口：<code>model.fit(X_train, y_train)</code> → <code>model.predict(X_test)</code>，学会一个等于学会全部。',
    '<b>数据形状</b>：特征 X 必须是二维 (n_samples, n_features)，单特征要 <code>X.reshape(-1, 1)</code> 或 <code>df[["col"]]</code>（双层括号），最常见的报错 Expected 2D array 就源于此。',
    '<b>数据泄漏</b>是新手第一大坑：所有统计量（均值、方差、编码映射）只能从训练集学，测试集只 transform。',
  ],
  entries: [
    {
      name: 'train_test_split', sig: "train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)",
      brief: '划分训练集/测试集，建模第一步。',
      params: [
        { n: 'test_size', t: 'float / int', d: '测试集比例或个数', dflt: '0.25' },
        { n: 'random_state', t: 'int', d: '随机种子，固定后每次划分一致（可复现）' },
        { n: 'stratify', t: 'array', d: '按该列分层抽样，保证训练/测试集中类别比例一致，分类任务传 y' },
      ],
      returns: 'X_train, X_test, y_train, y_test 四个值（顺序固定）',
      examples: [
        { title: '', code: `from sklearn.model_selection import train_test_split\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.2, random_state=42, stratify=y)` },
      ],
      pitfalls: [
        '<b>接收顺序必须是 X_train, X_test, y_train, y_test</b>，写成 X_train, y_train... 全乱。',
        '分类问题不加 stratify=y 时，类别比例可能失衡（小类别在测试集里几乎没有）。',
        '时间序列数据不能随机划分！要按时间切，用 shuffle=False。',
      ],
      related: ['metrics', 'Pipeline'],
      tags: ['划分', '训练集', '测试集'],
    },
    {
      name: 'StandardScaler', sig: 'StandardScaler() / MinMaxScaler() / RobustScaler()',
      brief: '标准化/归一化：fit 在训练集，transform 训练集与测试集。',
      params: [
        { n: 'StandardScaler', t: '-', d: '减均值除标准差 → 均值0方差1（最常用）' },
        { n: 'MinMaxScaler', t: '-', d: '压缩到 [0,1]，受极端值影响大' },
        { n: 'RobustScaler', t: '-', d: '用中位数和四分位距，有离群值时用它' },
      ],
      examples: [
        { title: '标准姿势(防泄漏)', code: `from sklearn.preprocessing import StandardScaler\nscaler = StandardScaler()\nX_train_s = scaler.fit_transform(X_train)   # 训练集: fit + transform\nX_test_s  = scaler.transform(X_test)        # 测试集: 只 transform!!!\n# 新数据预测前同样只用 transform\n# 逆变换: scaler.inverse_transform(X_train_s)` },
      ],
      pitfalls: [
        '<b>测试集绝不能 fit</b>！<code>fit_transform(X_test)</code> 是数据泄漏，线上用 scaler 也是错的。',
        '树模型（RF/XGB/LGBM）对特征尺度不敏感可以不缩放；线性模型、KNN、SVM、神经网络必须要。',
        'TargetEncoder 之类对 y 也一样：只在训练集上拟合。',
      ],
      related: ['train_test_split', 'Pipeline', '编码'],
      tags: ['标准化', '归一化', '预处理', '缩放'],
    },
    {
      name: '编码', sig: "LabelEncoder() / OneHotEncoder(handle_unknown='ignore') / pd.get_dummies(df)",
      brief: '把类别变量变成数字：标签编码（给 y 用）与独热编码（给特征用）。',
      examples: [
        { title: '', code: `from sklearn.preprocessing import LabelEncoder, OneHotEncoder\nimport pandas as pd\n\n# y(标签): LabelEncoder\nle = LabelEncoder()\ny = le.fit_transform(['低', '高', '中'])   # [0 1 2]\nle.inverse_transform([0, 1])               # 还原 ['低' '高']\n\n# X(特征): OneHotEncoder (推荐 sparse_output=False 直接给数组)\nohe = OneHotEncoder(handle_unknown='ignore', sparse_output=False)\nX_city = ohe.fit_transform(df[['城市']])\n\n# 或者 pandas 一行(图省事):\ndf2 = pd.get_dummies(df, columns=['城市'])` },
      ],
      pitfalls: [
        '<b>LabelEncoder 只能用于 y</b>，用于特征会引入虚假的大小关系；特征用 OneHot / Ordinal。',
        '<code>pd.get_dummies</code> 分别对训练/测试集调用时<b>列可能对不齐</b>（某类只在一边出现），列数不同模型直接报错 —— 跨集一致用 OneHotEncoder。',
        '新版 sklearn 参数是 <code>sparse_output</code>（1.2+），旧版叫 <code>sparse</code>。',
        '测试集出现训练集没见过的类别会报错，<code>handle_unknown="ignore"</code> 解决。',
      ],
      related: ['StandardScaler', 'Pipeline'],
      tags: ['编码', 'onehot', '类别', 'labelencode'],
    },
    {
      name: '线性与逻辑回归', sig: 'LinearRegression().fit(X, y) / LogisticRegression(C=1.0, max_iter=1000)',
      brief: '两个入门必会模型；注意 LogisticRegression 是"分类"模型不是回归。',
      params: [
        { n: 'fit_intercept', t: 'bool', d: '是否拟合截距', dflt: 'True' },
        { n: 'C', t: 'float', d: '正则化强度的倒数，越小正则越强', dflt: '1.0' },
        { n: 'max_iter', t: 'int', d: '最大迭代次数，不收敛报错时调大', dflt: '100' },
      ],
      examples: [
        { title: '', code: `from sklearn.linear_model import LinearRegression, LogisticRegression\n\nreg = LinearRegression().fit(X_train, y_train)\nprint(reg.coef_, reg.intercept_)       # 系数与截距\nprint(reg.predict(X_test))\nprint(reg.score(X_test, y_test))       # R²\n\nclf = LogisticRegression(max_iter=1000).fit(X_train, y_train)\nprint(clf.predict(X_test))             # 类别\nprint(clf.predict_proba(X_test)[:, 1]) # 正类概率` },
      ],
      pitfalls: [
        '<b>LogisticRegression 名字带"回归"干的是分类</b>，y 是类别标签；指标用 accuracy/auc 不是 R²。',
        '报 ConvergenceWarning：调大 max_iter，或先 StandardScaler。',
        '特征必须二维：<code>model.fit(df[["面积"]], y)</code>，传 df["面积"] 报 Expected 2D array。',
      ],
      related: ['模型速查', 'metrics', 'StandardScaler'],
      tags: ['线性回归', '逻辑回归', '分类', '回归'],
    },
    {
      name: '树与随机森林', sig: 'DecisionTreeClassifier(max_depth=None) / RandomForestClassifier(n_estimators=100, max_depth=None, n_jobs=-1)',
      brief: '决策树（可解释）与随机森林（多树投票，通常精度更高更稳）。',
      params: [
        { n: 'n_estimators', t: 'int', d: '树的数量，越多越稳（收益递减）', dflt: '100' },
        { n: 'max_depth', t: 'int / None', d: '最大深度，限制它防过拟合', dflt: 'None(长到纯)' },
        { n: 'min_samples_leaf', t: 'int', d: '叶子最少样本数，防过拟合', dflt: '1' },
        { n: 'n_jobs', t: 'int', d: '-1 用满所有 CPU 核心', dflt: 'None' },
      ],
      examples: [
        { title: '', code: `from sklearn.ensemble import RandomForestClassifier\nrf = RandomForestClassifier(n_estimators=300, max_depth=10,\n                            n_jobs=-1, random_state=42)\nrf.fit(X_train, y_train)\nprint(rf.score(X_test, y_test))\n\n# 特征重要性(训练后才有):\nimport pandas as pd\nimp = pd.Series(rf.feature_importances_, index=X_train.columns)\nprint(imp.sort_values(ascending=False).head(10))` },
      ],
      pitfalls: [
        '单棵决策树不设 max_depth 几乎必然过拟合（训练集 100%，测试集拉胯）。',
        '<code>feature_importances_</code> 在 fit 之前访问报 AttributeError，且注意基于不纯度的重要性偏向高基数特征。',
        '随机森林不能外推：训练数据范围外的预测不会更准（回归任务特别明显）。',
      ],
      related: ['模型速查', 'metrics'],
      tags: ['随机森林', '决策树', '集成'],
    },
    {
      name: '模型速查', sig: '按任务选模型：线性 → 树 → 提升树',
      brief: '常用模型一页速查：什么场景用哪个、关键参数是什么。',
      params: [
        { n: '分类/回归', t: '-', d: 'LogisticRegression / LinearRegression：基线首选，可解释' },
        { n: '表格数据', t: '-', d: 'RandomForest → XGBoost/LightGBM：结构化数据 usually 最强' },
        { n: '小样本/高维', t: '-', d: 'SVC(kernel="rbf")、朴素贝叶斯(文本)' },
        { n: '无标签', t: '-', d: 'KMeans(n_clusters=k)、DBSCAN(密度聚类)' },
        { n: '降维', t: '-', d: 'PCA(n_components=0.95 保留95%方差)' },
      ],
      examples: [
        { title: 'KMeans 示例', code: `from sklearn.cluster import KMeans\nfrom sklearn.decomposition import PCA\nkm = KMeans(n_clusters=4, n_init=10, random_state=42).fit(X_scaled)\nlabels = km.labels_\n\npca = PCA(n_components=2)\nX_2d = pca.fit_transform(X_scaled)   # 降维可视化` },
      ],
      pitfalls: [
        '聚类/降维之前先标准化，否则量纲大的特征主导距离。',
        '<code>predict</code> 对回归给数值、对分类给类别；要概率用 <code>predict_proba</code>（部分模型没有，如 SVM 默认）。',
      ],
      related: ['线性与逻辑回归', '树与随机森林', 'metrics'],
      tags: ['选型', '聚类', 'pca', 'svm'],
    },
    {
      name: 'metrics', sig: "accuracy_score(y_true, y_pred) / classification_report / roc_auc_score(y_true, y_prob) / mean_squared_error / r2_score",
      brief: '评估指标全家桶：分类看 accuracy/F1/AUC，回归看 RMSE/MAE/R²。',
      examples: [
        { title: '分类评估', code: `from sklearn.metrics import (accuracy_score, classification_report,\n                             confusion_matrix, roc_auc_score)\ny_pred = clf.predict(X_test)\ny_prob = clf.predict_proba(X_test)[:, 1]     # 正类概率\n\nprint(accuracy_score(y_test, y_pred))\nprint(classification_report(y_test, y_pred))  # 精确率/召回/F1 一步到位\nprint(confusion_matrix(y_test, y_pred))\nprint(roc_auc_score(y_test, y_prob))          # 注意传的是概率!` },
        { title: '回归评估', code: `from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score\nimport numpy as np\ny_pred = reg.predict(X_test)\nprint(mean_absolute_error(y_test, y_pred))\nprint(np.sqrt(mean_squared_error(y_test, y_pred)))   # RMSE\nprint(r2_score(y_test, y_pred))` },
      ],
      pitfalls: [
        '<b>roc_auc_score 传 predict_proba 的第二列（概率）</b>，传 predict 的类别结果 AUC 会明显偏低。',
        '类别不平衡时 accuracy 会骗人（99% 负样本时全猜负也有 99%），看 F1 / recall / AUC。',
        'classification_report 的标签顺序按 sorted(y) 排，二分类时 pos_label 默认是 1。',
      ],
      related: ['train_test_split', '线性与逻辑回归'],
      tags: ['评估', 'auc', 'f1', 'rmse'],
    },
    {
      name: 'cross_val_score', sig: "cross_val_score(model, X, y, cv=5, scoring='accuracy', n_jobs=-1)",
      brief: 'K 折交叉验证：数据少时比单次划分更可信。',
      examples: [
        { title: '', code: `from sklearn.model_selection import cross_val_score\nimport numpy as np\nscores = cross_val_score(model, X, y, cv=5, scoring='f1')\nprint(scores)                        # 每折的分数\nprint(scores.mean(), '+/-', scores.std())   # 均值±标准差` },
      ],
      pitfalls: [
        '分类任务 cv=int 时自动<b>分层抽样</b>（StratifiedKFold），回归是普通 KFold。',
        'scoring 参数名有限制（如 "f1"、"neg_mean_squared_error"），回归的 mse 带 neg 前缀（越大越好约定）。',
        'cross_val_score 返回的是<b>每折的分数</b>不是模型；要模型用 cross_validate 或自己循环。',
      ],
      related: ['train_test_split', 'GridSearchCV'],
      tags: ['交叉验证', 'cv', '评估'],
    },
    {
      name: 'GridSearchCV', sig: "GridSearchCV(model, param_grid, cv=5, scoring='f1', n_jobs=-1)",
      brief: '网格搜索调参：遍历参数组合 + 交叉验证，自动选最优。',
      params: [
        { n: 'param_grid', t: 'dict / list[dict]', d: '参数候选，值放列表' },
        { n: 'scoring', t: 'str', d: '优化目标指标' },
        { n: 'n_jobs', t: 'int', d: '-1 并行用满 CPU' },
      ],
      examples: [
        { title: '', code: `from sklearn.model_selection import GridSearchCV\nfrom sklearn.ensemble import RandomForestClassifier\n\nparam_grid = {\n    'n_estimators': [100, 300],\n    'max_depth': [5, 10, None],\n    'min_samples_leaf': [1, 5],\n}\ngs = GridSearchCV(RandomForestClassifier(random_state=42),\n                  param_grid, cv=5, scoring='f1', n_jobs=-1)\ngs.fit(X_train, y_train)\nprint(gs.best_params_)     # 最优参数\nprint(gs.best_score_)      # 最优 CV 分数\nbest_model = gs.best_estimator_      # 直接拿来用` },
      ],
      pitfalls: [
        '组合数 = 各参数候选数连乘 × cv 折数，参数范围一大就跑几天，先用 RandomizedSearchCV 粗搜。',
        'grid 里的参数名写错不会马上报错，fit 时才报 Invalid parameter —— 对照 model 的构造参数名。',
        '<code>best_score_</code> 是交叉验证分数，别拿它当测试集成绩。',
      ],
      related: ['cross_val_score', 'Pipeline'],
      tags: ['调参', '网格搜索', 'hyperparameter'],
    },
    {
      name: 'Pipeline', sig: "Pipeline([('scaler', StandardScaler()), ('model', LogisticRegression())])",
      brief: '把预处理+模型串成一条流水线：交叉验证/部署时不会数据泄漏。',
      examples: [
        { title: '', code: `from sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import GridSearchCV\n\npipe = Pipeline([\n    ('scaler', StandardScaler()),\n    ('clf', LogisticRegression(max_iter=1000)),\n])\npipe.fit(X_train, y_train)     # 缩放和训练一起做, 测试时自动复用训练集统计量\n\n# 网格搜索流水线参数: 步骤名__参数名\npipe = GridSearchCV(pipe, {'clf__C': [0.1, 1, 10]})` },
      ],
      pitfalls: [
        '流水线里调参要用<b>双下划线</b>语法：<code>"clf__C"</code> = clf 步骤的 C 参数。',
        '<b>Pipeline 的意义就是防泄漏</b>：缩放放进流水线后，交叉验证的每一折都只在训练部分 fit。',
        '步骤名不能重复也不能有空格；想跳过某步骤调参用 <code>"clf": ["passthrough"]</code>。',
      ],
      related: ['StandardScaler', 'GridSearchCV'],
      tags: ['pipeline', '流水线', '泄漏'],
    },
    {
      name: 'SimpleImputer', sig: "SimpleImputer(strategy='mean'/'median'/'most_frequent'/'constant', fill_value=None)",
      brief: '缺失值填充器，配合 Pipeline 实现训练/预测一致的处理。',
      examples: [
        { title: '', code: `from sklearn.impute import SimpleImputer\nimp = SimpleImputer(strategy='median')\nX_train_i = imp.fit_transform(X_train)\nX_test_i  = imp.transform(X_test)      # 用训练集中位数填测试集\n# 常数填充(字符串列常用):\nimp2 = SimpleImputer(strategy='constant', fill_value='未知')` },
      ],
      pitfalls: [
        '只能处理数值列（字符串列先用 OneHot 或单独填充）。',
        '默认还会删除全缺失的列（keep_empty_features=False），列数变少时注意。',
        '测试集 transform 时用训练集统计量 —— 与 StandardScaler 同一个防泄漏逻辑。',
      ],
      related: ['StandardScaler', 'Pipeline'],
      tags: ['缺失值', '填充', '预处理'],
    },
    {
      name: '保存模型', sig: "joblib.dump(model, 'model.pkl') / joblib.load('model.pkl')",
      brief: '模型持久化：sklearn 官方推荐 joblib（numpy 大数组压缩好）。',
      examples: [
        { title: '', code: `import joblib\njoblib.dump(best_model, 'model_v1.pkl', compress=3)\nmodel = joblib.load('model_v1.pkl')\nmodel.predict(X_new)` },
      ],
      pitfalls: [
        '<b>加载环境必须装有相同版本的 sklearn</b>（以及相关库），跨大版本常报错；生产环境固定版本号。',
        '自定义类/函数参与 fit 的对象，加载时模块路径必须能 import 到。',
        '只是想存一下简单结果，json/pickle 更轻；模型+大数组用 joblib。',
      ],
      related: ['GridSearchCV', 'Pipeline'],
      tags: ['保存', '部署', '持久化', '模型'],
    },
  ],
});
