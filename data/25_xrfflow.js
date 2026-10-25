/* XRF 分析流程速查页数据（渲染在 #/xrfflow 页） */
window.XRFFLOW = window.XRFFLOW || [];

XRFFLOW.push({
  group: '① 数据读取与整理',
  steps: [
    {
      name: 'SPEC 扫描转 DataFrame', tool: 'silx + pandas',
      desc: '能量扫描数据先变成表格，后续所有处理都基于 DataFrame。',
      code: `import pandas as pd\nfrom silx.io.specfile import SpecFile\n\nsf = SpecFile('scan.spec')\nscan = sf['1.1']\ndf = pd.DataFrame(scan.data.T, columns=scan.labels)\ndf = df.sort_values(df.columns[0])   # 按能量排序\nprint(df.head())`
    },
    {
      name: 'HDF5 map 数据读取', tool: 'h5py',
      desc: 'XRF 成像/Map 数据通常是 HDF5：读出 (像素数, 通道数) 的谱堆栈。',
      code: `import h5py\nimport numpy as np\n\nwith h5py.File('map.h5', 'r') as f:\n    spectra = f['entry/data/spectra'][:]   # (n_pix, n_chan)\nprint(spectra.shape)\nn_pix, n_chan = spectra.shape`
    },
    {
      name: '批量 MCA 清单', tool: 'glob + sorted',
      desc: '为批量拟合成好文件清单（顺序可复现）。',
      code: `import glob\n\nfiles = sorted(glob.glob('mca_dir/*.mca'))\nprint(len(files), '个谱')\n# 交给 PyMca BatchFit 或逐个 read`
    },
  ],
});

XRFFLOW.push({
  group: '② 谱预处理',
  steps: [
    {
      name: '去尖峰（宇宙射线/读出错码）', tool: 'scipy.signal.medfilt + 阈值替换',
      desc: '只替换离群点，不动正常谱形。',
      code: `import numpy as np\nfrom scipy.signal import medfilt\n\nmed = medfilt(y, 5)\nspikes = np.abs(y - med) > 5 * np.std(y - med)\ny[spikes] = med[spikes]`
    },
    {
      name: '平滑（可选）', tool: 'scipy.signal.savgol_filter',
      desc: '定量拟合前一般不平滑（拟合器自带统计处理）；画图或找峰时用。',
      code: `from scipy.signal import savgol_filter\n\nys = savgol_filter(y, window_length=11, polyorder=3)`
    },
    {
      name: '能量轴标定', tool: 'np.polyfit + 已知线',
      desc: '用标样特征线把通道数换算成能量（keV）。',
      code: `import numpy as np\n\nch = np.array([100.0, 500.0, 1000.0])   # 标样峰位(通道)\nkev = np.array([4.51, 8.05, 14.96])     # 对应已知能量\ncoef = np.polyfit(ch, kev, 1)           # 线性标定\nenergy = np.polyval(coef, np.arange(n_chan))\n# 标定完抽查: 已知峰位是否落在正确能量上`
    },
  ],
});

XRFFLOW.push({
  group: '③ 拟合与定量',
  steps: [
    {
      name: 'PyMca 配置复用批量拟合', tool: 'PyMca BatchFit',
      desc: 'GUI 调好拟合配置后，程序化批量处理整批谱图（详见 PyMca 模块条目）。',
      code: `from PyMca5.PyMcaPhysics.xrf.BatchFit import BatchFit\n\nb = BatchFit()\nb.setConfiguration('myconfig.cfg')\nb.setInputDirectory('mca_dir')\nb.setOutputDirectory('fit_out')\nb.processList()`
    },
    {
      name: '峰面积快速定量', tool: 'scipy.integrate.trapezoid',
      desc: '不做谱拟合的快速近似：选能量窗口扣基线积分。',
      code: `from scipy.integrate import trapezoid\n\ndef peak_area(x, y, lo, hi, baseline=None):\n    m = (x >= lo) & (x <= hi)\n    yy = y[m] - (baseline[m] if baseline is not None else 0)\n    return trapezoid(yy, x[m])\n\narea_fe = peak_area(energy, counts, 6.30, 6.55)   # Fe Ka 窗口`
    },
    {
      name: '拟合结果汇总', tool: 'glob + pandas',
      desc: '把批量拟合输出读回，拼成元素含量矩阵。',
      code: `import glob\nimport pandas as pd\n\nrows = []\nfor f in sorted(glob.glob('fit_out/*.csv')):\n    df = pd.read_csv(f)\n    rows.append(df.set_index('元素')['含量'].to_dict())\n\nmatrix = pd.DataFrame(rows)\nprint(matrix.head())    # 行=样品/像素, 列=元素`
    },
  ],
});

XRFFLOW.push({
  group: '④ 元素分布成像',
  steps: [
    {
      name: 'ROI 计数图（快速）', tool: 'numpy reshape + sum',
      desc: '对每个像素的谱按能量窗求和，reshape 回空间分布。',
      code: `import numpy as np\nimport matplotlib.pyplot as plt\n\nm = (energy > 6.30) & (energy < 6.55)      # Fe Ka 窗口\nroi = spectra[:, m].sum(axis=1)            # 每像素该窗口计数\nimg = roi.reshape(n_rows, n_cols)          # 按扫描网格还原\nplt.imshow(img, cmap='inferno')\nplt.colorbar(label='Fe counts')`
    },
    {
      name: '全谱拟合成像（定量）', tool: 'PyMca XRFStack',
      desc: '逐像素全谱拟合，得到每个元素的定量分布图（慢但准）。',
      code: `from PyMca5.PyMcaPhysics.xrf.XRFStack import XRFStack\n\nstack = XRFStack()\nstack.loadIndexedStack('map.h5')\nstack.setConfiguration('myconfig.cfg')\nstack.fitStack()      # 结果可用 PyMca GUI 或读输出文件查看`
    },
    {
      name: '元素图叠加美化', tool: 'matplotlib',
      desc: '多元素分布并排 + 色标统一，报告直接可用。',
      code: `import matplotlib.pyplot as plt\n\nelems = {'Fe': img_fe, 'Ca': img_ca, 'Zn': img_zn}\nfig, axes = plt.subplots(1, len(elems), figsize=(12, 4))\nfor ax, (name, img) in zip(axes, elems.items()):\n    im = ax.imshow(img, cmap='inferno')\n    ax.set_title(name); ax.axis('off')\n    fig.colorbar(im, ax=ax, shrink=0.8)\nplt.savefig('maps.png', dpi=300, bbox_inches='tight')`
    },
  ],
});

XRFFLOW.push({
  group: '⑤ 质量检查与物理校正',
  steps: [
    {
      name: '拟合质量检查', tool: '残差 + redchi',
      desc: '定量结果可信的前提是拟合质量过关。',
      code: `# 拟合后画残差: (实测-拟合)/sqrt(实测)\nresid = (y - yfit) / np.sqrt(np.clip(y, 1, None))\nplt.plot(energy, resid, '.-')\nplt.axhline(0, color='r', ls='--')\n# 残差应有 2/3 在 ±1 内, 且无系统性结构`
    },
    {
      name: '自吸收与效率校正', tool: 'xraylib mu',
      desc: '轻元素/厚样品的自吸收会压低低能峰，定量前评估。',
      code: `import xraylib as xrl\n\nmu = xrl.CS_TotalForCompound('SiO2', 8000) * 2.65   # 1/cm\nprint('8keV 在 SiO2 中的衰减长度:', 1 / mu, 'cm')\n# 厚样品按 exp(-mu*t) 校正; 薄样品可忽略`
    },
    {
      name: '结果入库', tool: 'pandas + 字典特征速查页',
      desc: '元素矩阵存档后，进入机器学习/统计流程（见特征处理速查页第⑤⑥节）。',
      code: `matrix.to_csv('元素含量矩阵.csv', encoding='utf-8-sig')\n# 后续: PCA/聚类/回归 —— 见字典 sklearn 条目与 #/feat 页`
    },
  ],
});
