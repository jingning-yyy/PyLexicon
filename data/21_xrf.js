/* XRF/XAFS 专业工具：PyMca / xraylarch / silx */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'PyMca', name: 'PyMca', icon: '🧪', category: 'X 射线工具',
  desc: 'ESRF 出品的 XRF 分析套件：MCA 谱拟合、定量、ROI 成像、批量处理，同步辐射线上工具。',
  install: 'pip install pymca',
  pkg: 'PyMca',
  doc: 'http://pymca.sourceforge.net/',
  aliases: ['XRF', '谱拟合', 'MCA'],
  tips: [
    '标准工作流：先在 GUI 里把拟合配置调好并保存为 <b>.cfg</b>，程序化批量拟合直接复用该配置。',
    'GUI 部分依赖 Qt；服务器无图形环境时只用它的拟合/IO 库函数即可。',
  ],
  entries: [
    {
      name: 'GUI 与概览', sig: 'pymca  (命令行启动) / python -m PyMca5.PyMcaMain',
      brief: '主程序包含 MCA 拟合、ROI 成像、批量拟合等窗口。',
      examples: [
        { title: '', code: `# 安装后命令行启动主程序:\npymca\n# 或:\npython -m PyMca5.PyMcaMain\n\n# 主要窗口: MCA 拟合 / ROI Imaging / 批量拟合\n# 调好拟合参数后 File -> Save 保存为 .cfg, 给程序化拟合复用` },
      ],
      pitfalls: [
        '无图形界面的服务器上启动 GUI 会报 Qt 错误 —— 服务器只用它的拟合/IO 库函数。',
        'MCA 数据常见格式（.mca/.edf/.h5）PyMca 都能直接打开。',
      ],
      related: ['McaAdvancedFit', 'BatchFit'],
      tags: ['xrf', 'gui'],
    },
    {
      name: 'McaAdvancedFit', sig: "from PyMca5.PyMcaPhysics.xrf.McaAdvancedFit import McaAdvancedFit",
      brief: '程序化拟合 MCA 谱：加载配置 → 拟合 → 取结果。',
      examples: [
        { title: '', code: `from PyMca5.PyMcaPhysics.xrf.McaAdvancedFit import McaAdvancedFit\n\nfit = McaAdvancedFit()\nfit.setData(x=energies, y=counts, xmin=2.0, xmax=40.0)  # keV\nfit.setConfiguration('myconfig.cfg')   # GUI 里保存的配置\nfit.estimate()                         # 估计初始参数\nfit.startfit()\nresult = fit.getResult()               # 拟合结果字典` },
      ],
      pitfalls: [
        '配置文件决定元素/线系/本底模型 —— <b>先用 GUI 拟合一条谱验证配置</b>再程序化批量。',
        '能量轴单位默认 keV；setData 的具体关键字以你安装版本的源码/官方示例为准。',
      ],
      related: ['BatchFit'],
      tags: ['拟合', '定量'],
    },
    {
      name: 'BatchFit', sig: "from PyMca5.PyMcaPhysics.xrf.BatchFit import BatchFit",
      brief: '批量拟合目录下全部 MCA 谱（复用同一份配置）。',
      examples: [
        { title: '', code: `from PyMca5.PyMcaPhysics.xrf.BatchFit import BatchFit\n\nb = BatchFit()\nb.setConfiguration('myconfig.cfg')\nb.setInputDirectory('mca_dir')\nb.setOutputDirectory('fit_out')\nb.processList()      # 批量拟合并输出结果文件` },
      ],
      pitfalls: [
        '批量输出默认为 .fit/CSV 文件，读回后配合 numpy/pandas 做元素分布分析。',
        '大批量跑之前先用 2~3 个谱试跑验证配置，避免浪费机时。',
      ],
      related: ['McaAdvancedFit'],
      tags: ['批量', '拟合'],
    },
    {
      name: 'Elements 元素数据库', sig: "from PyMca5.PyMcaPhysics import Elements / Elements.Element['Fe']",
      brief: '内置 X 射线元素数据库：质量、密度、线系能量、产额、截面。',
      examples: [
        { title: '', code: `from PyMca5.PyMcaPhysics import Elements

fe = Elements.Element['Fe']
print(list(fe.keys()))        # 先看这个元素有哪些数据
print(fe['Mass'])             # 摩尔质量 g/mol
print(fe['Density'])          # 密度 g/cm3

# 线系能量/荧光产额也在这个字典里, 键名随版本打印确认` },
      ],
      pitfalls: [
        '键名随版本变化，先 <code>print(list(fe.keys()))</code> 再取值。',
        '元素用符号字符串（"Fe"）不是原子序数；更全的截面/反常散射用 xraylib/xraydb（字典里有条目）。',
      ],
      related: ['BatchFit'],
      tags: ['元素', '数据库'],
    },
    {
      name: 'ConfigDict 配置读写', sig: "from PyMca5.PyMcaIO.ConfigDict import ConfigDict / cfg.read('myconfig.cfg')",
      brief: '程序化读写 PyMca 的 .cfg 配置文件（批量微调不用手改文件）。',
      examples: [
        { title: '', code: `from PyMca5.PyMcaIO.ConfigDict import ConfigDict

cfg = ConfigDict()
cfg.read('myconfig.cfg')        # 读 GUI 保存的配置
print(cfg.keys())               # fit / detector / ... 分组

# 像字典一样修改后写回, 给 BatchFit 用:
cfg.write('adjusted.cfg')` },
      ],
      pitfalls: [
        '.cfg 是 PyMca 专有格式（本质是结构化文本），<b>用 ConfigDict 读写而不是手工改</b>，避免格式损坏。',
        '嵌套键用字典式访问；版本升级后新增键以 GUI 重新生成为准。',
      ],
      related: ['BatchFit'],
      tags: ['配置', 'cfg'],
    },
    {
      name: 'ROI 成像', sig: 'ROI Imaging 窗口 / XRFStack 堆栈拟合',
      brief: 'XRF mapping 的看家功能：从多通道图直接出元素分布图。',
      examples: [
        { title: 'GUI 工作流(最快出图)', code: `# 1. File -> Open 打开多通道 map 数据(.h5/.edf 系列)
# 2. Tools -> ROI Imaging: 拖出元素峰对应的能量窗口
# 3. 直接得到每个元素的空间分布图, 可另存为 .edf/tiff

# 程序化方案: 堆栈拟合得到全部元素定量图
from PyMca5.PyMcaPhysics.xrf.XRFStack import XRFStack

stack = XRFStack()
stack.loadIndexedStack('map.h5')       # 方法名随版本略有差异
stack.setConfiguration('myconfig.cfg')
stack.fitStack()                        # 逐像素拟合(数据大时耗时长)` },
      ],
      pitfalls: [
        '逐像素拟合金字塔规则：<b>先 ROI 快速看分布，需要定量再全谱拟合</b>。',
        '大 map 拟合耗时长，先裁剪区域或降采样试跑；结果图配合 matplotlib 叠加光学照片。',
      ],
      related: ['BatchFit'],
      tags: ['成像', 'mapping', 'roi'],
    },
  ],
});

MODULES.push({
  id: 'xraylarch', name: 'xraylarch', icon: '⚙️', category: 'X 射线工具',
  desc: 'XAFS 分析标准库（XANES/EXAFS）：归一化、k 空间转换、傅里叶变换、拟合，Athena 的开源替代。',
  install: 'pip install xraylarch',
  pkg: 'xraylarch',
  doc: 'https://xraypy.github.io/xraylarch/',
  aliases: ['larch', 'XAFS', 'XANES', 'EXAFS'],
  tips: [
    '处理流程固定：读入 Group → <b>pre_edge 归一化 → autobk 转 χ(k) → xftf 转 χ(R)</b> → feffit 拟合配位数。',
    'larch 内置 xraydb 数据（边能量/线系/反常散射），很多函数直接用元素符号字符串。',
  ],
  entries: [
    {
      name: '读入数据', sig: "from larch.io import read_ascii, read_xdi / dat = read_ascii('fe.0001')",
      brief: '读入 XAFS 数据文件为 Group（推荐 XDI 标准格式，元数据最全）。',
      examples: [
        { title: '', code: `from larch.io import read_ascii, read_xdi\n\ndat = read_ascii('fe.xmu')     # 两列以上: 能量 吸收\nprint(dat.data.shape)          # 2xN 数组\n\ng = read_xdi('fe.xdi')         # XDI 标准文件, 元数据丰富\n# 后续 XAFS 函数直接操作这个 group` },
      ],
      pitfalls: [
        '纯数字无表头的数据用 <code>read_ascii(..., labels="energy mu")</code> 指定列名。',
        '读入的是 larch Group 对象（属性式访问），不是 dict。',
      ],
      related: ['pre_edge 归一化'],
      tags: ['读数据', 'xafs'],
    },
    {
      name: 'pre_edge 归一化', sig: 'pre_edge(dat, e0=7112, pre1=-150, pre2=-30, norm1=100, norm2=400)',
      brief: '定 E0、扣边前背景、归一化，输出归一谱与一阶导。',
      params: [
        { n: 'e0', t: 'float', d: '吸收边能量；不给则自动用一阶导极大值估计' },
        { n: 'pre1/pre2', t: 'float', d: '边前拟合区间（相对 E0，eV）' },
        { n: 'norm1/norm2', t: 'float', d: '边后归一化区间' },
      ],
      examples: [
        { title: '', code: `from larch.xafs import pre_edge\n\npre_edge(dat, e0=7112, pre1=-150, pre2=-30, norm1=100, norm2=400)\nprint(dat.e0, dat.edge_step)\n\nimport matplotlib.pyplot as plt\nplt.plot(dat.energy, dat.norm)      # 归一化 mu(E)\nplt.plot(dat.energy, dat.dmude)     # 一阶导(定 E0 用)` },
      ],
      pitfalls: [
        '<b>norm1/norm2 区间选错会让归一谱台阶大小失真</b>，边后要选平滑无振荡的区域。',
        '结果挂在 group 上：dat.e0 / dat.edge_step / dat.norm / dat.dmude。',
      ],
      related: ['autobk', '读入数据'],
      tags: ['归一化', 'e0', 'xafs'],
    },
    {
      name: 'autobk', sig: 'autobk(dat, kmin=2, kmax=10, kweight=2, dk=1)',
      brief: '提取 χ(k)：扣除边前背景并做 E→k 转换。',
      examples: [
        { title: '', code: `from larch.xafs import autobk\n\nautobk(dat, kmin=2, kmax=10, kweight=2, dk=1, window='kaiser')\n\nimport matplotlib.pyplot as plt\nplt.plot(dat.k, dat.chi * dat.k ** 2)   # k^2*chi(k) 看结构\nplt.xlabel('k (1/Å)')` },
      ],
      pitfalls: [
        '<b>kmax 别贪大</b>：噪声大的远 k 区间会污染后续拟合，看 chi(k) 的衰减选取。',
        'kweight=2 是常规起点；拟合时常用多 k 权重联合评估。',
      ],
      related: ['pre_edge 归一化', 'xftf'],
      tags: ['chi', 'k空间'],
    },
    {
      name: 'xftf', sig: 'xftf(dat, kmin=2, kmax=10, kweight=2, dk=1, window="kaiser")',
      brief: 'χ(k) 傅里叶变换到 χ(R)：径向结构函数。',
      examples: [
        { title: '', code: `from larch.xafs import xftf\n\nxftf(dat, kmin=2, kmax=10, kweight=2, dk=1, window='kaiser')\n\nplt.plot(dat.r, dat.chir_mag)      # |chi(R)|\nplt.xlabel('R (Å)')\n# 第一主峰 ≈ 第一配位层距离(未做相移校正, 比真实键长短 0.3~0.4 Å)` },
      ],
      pitfalls: [
        '<b>χ(R) 主峰位置比真实键长偏短 0.3~0.4 Å</b>（相移未校正），精确配位数/键长要 feffit + FEFF 路径计算。',
        'kmin/kmax/dk 必须与 autobk 一致；window 常用 kaiser。',
      ],
      related: ['autobk', 'pre_edge 归一化'],
      tags: ['xftf', '配位', 'exafs'],
    },
  ],
});

MODULES.push({
  id: 'silx', name: 'silx', icon: '🧫', category: 'X 射线工具',
  desc: 'ESRF 同步辐射数据工具箱：SPEC/HDF5 数据读取、拟合库、silx view 图形化浏览。',
  install: 'pip install silx',
  pkg: 'silx',
  doc: 'https://silx.readthedocs.io/',
  aliases: ['spec', '同步辐射'],
  entries: [
    {
      name: 'SpecFile 读SPEC', sig: "from silx.io.specfile import SpecFile / sf = SpecFile('scan.spec')",
      brief: '读取 SPEC 文件：每个 scan 是一个二维数据块。',
      examples: [
        { title: '', code: `from silx.io.specfile import SpecFile\n\nsf = SpecFile('scan.spec')\nprint(sf.keys())            # ['1.1', '2.1', ...] 扫描编号\nscan = sf['1.1']\nprint(scan.labels)          # 各计数器名称\ndata = scan.data            # 二维数组, 每行一个计数器\n\nmotor = scan.motor_position('energy')   # 电机位置` },
      ],
      pitfalls: [
        '<b>scan.data 的每一行是一个计数器</b>（不是每个测点），转 DataFrame 时要转置。',
        'HDF5/NeXus 文件用 <code>silx.io.open("x.h5")</code> 读，用法类似 h5py。',
      ],
      related: ['SPEC转DataFrame', 'silx view'],
      tags: ['spec', '同步辐射', '读取'],
    },
    {
      name: 'silx view', sig: 'silx view data.h5',
      brief: '随包的图形化数据浏览器：浏览 HDF5/SPEC/tiff 不用写代码。',
      examples: [
        { title: '', code: `# 命令行启动(装了 silx 就有):\nsilx view data.h5\nsilx view scan.spec\n\n# 树状结构展开数据集, 双击直接画曲线/图像, 探查数据比写代码快` },
      ],
      pitfalls: [
        '远程服务器无图形环境时用 <code>ssh -X</code> 转发窗口，或改用 h5py 程序化浏览。',
      ],
      related: ['SpecFile 读SPEC'],
      tags: ['浏览', 'gui', 'hdf5'],
    },
    {
      name: 'SPEC转DataFrame', sig: "pd.DataFrame(scan.data.T, columns=scan.labels)",
      brief: '把 SPEC 扫描转成 pandas DataFrame（接回字典的 pandas 工作流）。',
      examples: [
        { title: '', code: `import pandas as pd\nfrom silx.io.specfile import SpecFile\n\nsf = SpecFile('scan.spec')\nscan = sf['2.1']\ndf = pd.DataFrame(scan.data.T, columns=scan.labels)\ndf.plot(x=df.columns[0])   # 能量扫描曲线直接画` },
      ],
      pitfalls: [
        'data 每行是一个计数器，<b>转 DataFrame 要转置</b>（.T）。',
        '不同 scan 的计数器集合可能不同，各自建各自的 DataFrame，不要盲目 concat。',
      ],
      related: ['SpecFile 读SPEC'],
      tags: ['dataframe', 'spec'],
    },
  ],
});
