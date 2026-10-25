/* 特征处理速查（渲染在 #/feat 页）
   谱图/数据 → 可建模特征 的完整流水线，每步给推荐工具与可复制代码。 */
window.FEATURES = window.FEATURES || [];

FEATURES.push({
  group: '① 预处理与清洗（先把谱变干净）',
  steps: [
    {
      name: 'Savitzky–Golay 平滑', tool: 'scipy.signal.savgol_filter',
      desc: '保峰形去噪的首选：窗口滑动多项式拟合，峰位峰宽基本不动。',
      code: `from scipy.signal import savgol_filter, medfilt\n\nys = savgol_filter(y, window_length=11, polyorder=3)\n# 先去尖峰再平滑(组合拳):\nys = savgol_filter(medfilt(y, 5), 11, 3)`
    },
    {
      name: '去尖峰（宇宙射线/读出错码）', tool: 'scipy.signal.medfilt + 阈值替换',
      desc: '中值滤波全谱替换会钝化峰，更好的做法是只替换"离群点"。',
      code: `import numpy as np\nfrom scipy.signal import medfilt\n\nmed = medfilt(y, 5)\nspikes = np.abs(y - med) > 5 * np.std(y - med)   # 离群点\ny[spikes] = med[spikes]                          # 只替换毛刺处`
    },
    {
      name: '插值到统一横轴', tool: 'np.interp / CubicSpline',
      desc: '多样品能量轴/角度轴不一致时，先统一网格才能逐点比较和堆叠。',
      code: `import numpy as np\nfrom scipy.interpolate import CubicSpline\n\nnew_x = np.arange(10, 60, 0.05)          # 统一网格\ny_new = np.interp(new_x, x, y)            # 线性(够用且稳)\ny_cs = CubicSpline(x, y)(new_x)           # 三次样条(更平滑)`
    },
    {
      name: '去均值/去线性漂移', tool: 'scipy.signal.detrend',
      desc: '仪器零点漂移、慢变背景的快速处理。',
      code: `from scipy.signal import detrend\n\ny_flat = detrend(y)                       # 去线性\n# 二阶趋势: detrend(y, type='polynomial', order=2)  # 或用 np.polyfit 自定义`
    },
  ],
});

FEATURES.push({
  group: '② 基线扣除（谱图分析的地基）',
  steps: [
    {
      name: '手动选点 + 多项式基线', tool: 'np.polyfit',
      desc: '最透明可控：在无峰区选若干点，拟合低阶多项式作为基线扣除。',
      code: `import numpy as np\n\nanchor_x = np.array([10.0, 25.0, 40.0, 55.0])   # 无峰区选点\nanchor_y = y[np.searchsorted(x, anchor_x)]\ncoef = np.polyfit(anchor_x, anchor_y, 2)         # 二次基线\nbaseline = np.polyval(coef, x)\ny_corr = y - baseline`
    },
    {
      name: '滚动分位数基线（快速近似）', tool: 'pandas rolling.quantile',
      desc: '低分位滚动窗口当基线，适合峰稀疏、基线平滑的谱。',
      code: `import pandas as pd\n\nqs = pd.Series(y).rolling(101, center=True, min_periods=1).quantile(0.1)\nqs = qs.rolling(101, center=True, min_periods=1).mean()   # 再平滑\ny_corr = y - qs.to_numpy()`
    },
    {
      name: 'ALS 非对称最小二乘（学术标准）', tool: 'pybaselines',
      desc: '荧光/XAS 类弯曲基线的经典算法，现成库 pybaselines 一行搞定（还含 arPLS、SNIP 等）。',
      code: `# pip install pybaselines\nfrom pybaselines import Baseline\nimport numpy as np\n\nbl = Baseline(x)\ny_corr, params = bl.als(y, lam=1e6, p=0.01)   # lam大=基线硬, p小=只贴下方\nbaseline = y - y_corr`
    },
    {
      name: '峰 + 背景联合拟合', tool: 'lmfit',
      desc: '把背景作为模型的一部分（常数/线性）与峰一起拟合，避免"先扣基线"的误差传递。',
      code: `from lmfit.models import PseudoVoigtModel, LinearModel\n\nmodel = PseudoVoigtModel(prefix='p1_') + LinearModel(prefix='b_')\nparams = model.make_params(p1_center=10, p1_sigma=0.5,\n                           p1_amplitude=100, b_intercept=0, b_slope=0)\nresult = model.fit(y, params, x=x)   # 见 lmfit 模块的"多峰复合拟合"`
    },
  ],
});

FEATURES.push({
  group: '③ 归一化与强度标定（让谱之间可比）',
  steps: [
    {
      name: '最大值 / 峰高归一', tool: 'numpy',
      desc: '谱图对比展示最常用：按最高峰归一。',
      code: `import numpy as np\n\ny_norm = y / y.max()\n# 或按某特征峰归一(更有物理意义):\ny_norm = y / y[(x > 9.9) & (x < 10.1)].max()`
    },
    {
      name: '面积归一（AUC）', tool: 'scipy.integrate.trapezoid',
      desc: '按全谱面积归一，保留各成分相对强度信息。',
      code: `from scipy.integrate import trapezoid\n\ny_norm = y / trapezoid(y, x)\n# 窗口面积归一(只按某区间):\ny_norm = y / trapezoid(y[(x > 9) & (x < 11)], x[(x > 9) & (x < 11)])`
    },
    {
      name: '内标归一', tool: 'numpy',
      desc: '掺入已知内标（或用不变峰），除以内标峰强，消除通量/厚度差异。',
      code: `internal = y[(x > 5.0) & (x < 5.2)].max()   # 内标峰强\ny_norm = y / internal\n# 记录: 归一系数本身也是一个特征(样品总量信息)`
    },
    {
      name: '能量轴标定', tool: 'np.polyfit',
      desc: '用已知线（标样特征线/标准物质衍射峰）把通道数/像素换算成能量或角度。',
      code: `import numpy as np\n\nch = np.array([100.0, 500.0, 1000.0])        # 标样的峰位(通道)\nkev = np.array([4.51, 8.05, 14.96])          # 对应已知能量\ncoef = np.polyfit(ch, kev, 1)                # 线性标定\nx_kev = np.polyval(coef, np.arange(n_channels))`
    },
  ],
});

FEATURES.push({
  group: '④ 峰特征提取（谱图 → 数）',
  steps: [
    {
      name: '找峰：峰位/峰高', tool: 'scipy.signal.find_peaks',
      desc: '特征提取第一步，height/distance/prominence 三参数组合过滤。',
      code: `from scipy.signal import find_peaks\n\npeaks, props = find_peaks(ys, height=100,\n                          distance=20, prominence=50)\npeak_pos = x[peaks]\npeak_h = props['peak_heights']`
    },
    {
      name: 'FWHM 半高宽', tool: 'scipy.signal.peak_widths',
      desc: '峰宽（仪器展宽/晶粒尺寸的信息载体）。',
      code: `from scipy.signal import peak_widths\n\nw = peak_widths(ys, peaks, rel_height=0.5)[0]   # 半高宽(点数)\nfwhm = w * (x[1] - x[0])                         # 换算到实际单位\n# 注意: 应在"扣基线后"的谱上测量, 否则半高位置被背景抬高`
    },
    {
      name: '峰面积（窗口积分）', tool: 'scipy.integrate.trapezoid',
      desc: '定量分析的主力特征：选定峰窗口积分。',
      code: `from scipy.integrate import trapezoid\n\nm = (x > x[peak] - 0.3) & (x < x[peak] + 0.3)   # 峰两侧取窗口\narea = trapezoid(ys[m] - baseline[m], x[m])      # 记得减基线!`
    },
    {
      name: '峰比值 / 特征比值', tool: 'numpy',
      desc: '两个特征峰强度的比值常直接对应物理量（氧化态、配位、相比例）。',
      code: `def peak_h(x, y, lo, hi):\n    m = (x >= lo) & (x <= hi)\n    return y[m].max()\n\nratio = peak_h(x, y, 9.8, 10.2) / peak_h(x, y, 7.0, 7.4)\nfeatures['I_A/I_B'] = ratio`
    },
  ],
});

FEATURES.push({
  group: '⑤ 谱图 → 特征表（进入机器学习的前一步）',
  steps: [
    {
      name: '分段积分（分箱降维）', tool: 'trapezoid + 列表推导',
      desc: '把整条谱切成 N 段、每段积分成一个数，谱图就变成了 N 维特征向量。',
      code: `import numpy as np\nfrom scipy.integrate import trapezoid\n\ndef bin_features(x, y, n_bins=50):\n    edges = np.linspace(x.min(), x.max(), n_bins + 1)\n    return [trapezoid(y[lo:hi], x[lo:hi])\n            for lo, hi in zip(edges[:-1], edges[1:])]\n\nvec = bin_features(x, y)          # 50 维特征\n# 多样品: rows = [bin_features(x, yi) for yi in spectra] -> pd.DataFrame(rows)`
    },
    {
      name: '峰表特征化', tool: 'find_peaks + DataFrame',
      desc: '每条谱提取 Top-N 峰的（位置, 高, 宽, 面积）摊平成固定长度的行。',
      code: `import pandas as pd\nfrom scipy.signal import find_peaks, peak_widths\n\ndef peak_table(x, y, n_top=10):\n    pk, pr = find_peaks(y, prominence=50)\n    order = pk[:n_top] if len(pk) <= n_top else pk[np.argsort(y[pk])[-n_top:]]\n    row = {}\n    for i, p in enumerate(sorted(order)):\n        row[f'pos{i}'] = x[p]\n        row[f'amp{i}'] = y[p]\n    return row\n\ndf = pd.DataFrame([peak_table(x, yi) for yi in spectra])`
    },
    {
      name: 'PCA 降维可视化 + 去相关', tool: 'sklearn.decomposition',
      desc: '高维谱压缩成少数主成分：看样品聚类、去掉冗余维度。',
      code: `from sklearn.decomposition import PCA\nimport matplotlib.pyplot as plt\n\npca = PCA(n_components=5).fit(X_spectra)      # X: (n样品, n特征)\nX_pca = pca.transform(X_spectra)\nprint(pca.explained_variance_ratio_)          # 各主成分解释比例\nplt.scatter(X_pca[:, 0], X_pca[:, 1], c=labels)\nplt.xlabel('PC1'); plt.ylabel('PC2')`
    },
    {
      name: '特征筛选', tool: 'sklearn.feature_selection',
      desc: '特征太多样本太少时，先筛掉无用维度防过拟合。',
      code: `from sklearn.feature_selection import SelectKBest, mutual_info_regression, f_regression\n\n# 方差为零/极小的列先删:\nX = X.loc[:, X.std() > 1e-10]\n# 与目标 y 的互信息/相关排序, 取 TopK:\nselector = SelectKBest(mutual_info_regression, k=30)\nX_sel = selector.fit_transform(X_train, y_train)\nselected = X.columns[selector.get_support()]`
    },
  ],
});

FEATURES.push({
  group: '⑥ 建模衔接（特征表 → 模型）',
  steps: [
    {
      name: '标准建模三件套', tool: 'sklearn',
      desc: '划分 → 标准化 → 训练；标准化器只在训练集上 fit（防泄漏）。',
      code: `from sklearn.model_selection import train_test_split\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.ensemble import RandomForestRegressor\n\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, random_state=42)\nscaler = StandardScaler().fit(X_tr)\nmodel = RandomForestRegressor(n_estimators=300).fit(scaler.transform(X_tr), y_tr)\nprint(model.score(scaler.transform(X_te), y_te))`
    },
    {
      name: '流水线固化（防泄漏 + 可部署）', tool: 'sklearn.Pipeline + joblib',
      desc: '把缩放/筛选/模型打包成 Pipeline 存档，新谱来了走同一条流水线。',
      code: `from sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nimport joblib\n\npipe = Pipeline([('sc', StandardScaler()),\n                 ('rf', RandomForestRegressor(n_estimators=300))])\npipe.fit(X_train, y_train)\njoblib.dump(pipe, 'spectra_model.pkl', compress=3)\n\n# 新样品预测:\nmodel = joblib.load('spectra_model.pkl')\nyhat = model.predict(new_features)`
    },
    {
      name: '特征重要性回读（解释谱的哪段有用）', tool: 'feature_importances_ / permutation_importance',
      desc: '把特征重要性映射回能量/角度轴，能告诉你"仪器的哪一段在起作用"。',
      code: `import pandas as pd\nimport matplotlib.pyplot as plt\n\nimp = pd.Series(model.feature_importances_, index=feature_names)\nimp.sort_values(ascending=False).head(10)\n# 特征名用能量区间命名(如 '9.8-10.2keV'), 重要性就能画回谱轴:\nimp.plot.bar(); plt.tight_layout(); plt.show()`
    },
  ],
});
