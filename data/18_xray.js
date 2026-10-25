/* X 射线工具：xraylib / xraydb / lmfit / pyFAI / fabio / pymatgen
   (本文件在 index.html 中最先引入, 使「X 射线工具」分类排在侧边栏最前) */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'xraylib', name: 'xraylib', icon: '☢️', category: 'X 射线工具',
  desc: 'X 射线物理参数数据库：线系能量、吸收边、衰减系数、荧光截面，XRF/XAS 计算的标准库。',
  install: 'pip install xraylib',
  doc: 'https://xraylib.github.io/',
  aliases: ['荧光', '衰减系数', '吸收边', 'XRF'],
  tips: [
    '<b>元素用原子序数 Z</b> 不用元素符号：<code>xrl.SymbolToAtomicNumber("Fe")</code> 可转换。',
    '单位约定：能量 eV，CS 系列（截面/质量衰减系数）cm²/g；线衰减系数 μ = CS × 密度。',
    '线名是常量：<code>KA1_LINE / KA2_LINE / KB1_LINE / LA1_LINE / LB1_LINE</code>，壳层是 <code>K_SHELL / L3_SHELL</code> 等。',
  ],
  entries: [
    {
      name: 'LineEnergy-EdgeEnergy', sig: 'xrl.LineEnergy(Z, xrl.KA1_LINE) / xrl.EdgeEnergy(Z, xrl.K_SHELL)',
      brief: '特征线能量与吸收边能量（eV）。',
      examples: [
        { title: 'Fe 的线系与吸收边', code: `import xraylib as xrl\n\nz = xrl.SymbolToAtomicNumber('Fe')          # 26\nprint(xrl.LineEnergy(z, xrl.KA1_LINE))      # 6403.84 eV  Fe Kα1\nprint(xrl.LineEnergy(z, xrl.KB1_LINE))      # 7058.0  eV  Fe Kβ1\nprint(xrl.EdgeEnergy(z, xrl.K_SHELL))       # 7112.0  eV  K 吸收边\n\n# 列出某元素全部可用线:\nfor line in xrl.xray_lines(z):\n    print(line, xrl.LineEnergy(z, line))` },
      ],
      pitfalls: [
        '返回单位是 <b>eV</b> 不是 keV；画谱轴时除以 1000。',
        '高于吸收边的激发才产生对应线系（E &gt; EdgeEnergy 才有 K 线荧光）。',
      ],
      related: ['CS衰减系数', 'CS_FluorLine'],
      tags: ['能量', '吸收边', '特征线'],
    },
    {
      name: 'CS衰减系数', sig: 'xrl.CS_Total(Z, E) / xrl.CS_TotalForCompound("CaCO3", E)',
      brief: '质量衰减系数（cm²/g）：CS_Photo 光电 / CS_Rayl 相干 / CS_Compt 非相干 / CS_Total 总和。',
      params: [
        { n: 'Z / 化合物', t: '-', d: '元素传 Z；化合物直接传化学式字符串' },
        { n: 'E', t: 'float', d: '能量 eV' },
      ],
      examples: [
        { title: '透射率计算的完整套路', code: `import xraylib as xrl\nE = 8000\ncs = xrl.CS_TotalForCompound('SiO2', E)   # cm²/g\nrho = 2.65                                # g/cm³\nmu = cs * rho                             # 线衰减系数 1/cm\nimport math\nt = 0.1                                   # 样品厚度 cm\nT = math.exp(-mu * t)                     # 透射率\nprint(mu, T)\n\n# 分解相互作用类型:\nprint(xrl.CS_Photo('SiO2', E), xrl.CS_Rayl('SiO2', E), xrl.CS_Compt('SiO2', E))` },
      ],
      pitfalls: [
        'CS 是<b>质量</b>衰减系数（已除以密度），乘上密度才是 μ (1/cm)。',
        '低能段（&lt;1 keV）和高能段精度下降；化合物写法支持括号，如 "Ca5(PO4)3F"。',
      ],
      related: ['LineEnergy-EdgeEnergy', 'RefractiveIndex-密度'],
      tags: ['衰减', '透射', '吸收'],
    },
    {
      name: 'CS_FluorLine', sig: 'xrl.CS_FluorLine(Z, xrl.KA1_LINE, E_excitation)',
      brief: '荧光截面：用能量 E 激发某线系的产生截面（XRF 定量的核心物理量）。',
      examples: [
        { title: '比较激发效率', code: `import xraylib as xrl\nz_fe = xrl.SymbolToAtomicNumber('Fe')\n\n# 9 keV 激发 vs 8 keV(低于K边,无K荧光)\nprint(xrl.CS_FluorLine(z_fe, xrl.KA1_LINE, 9000))\nprint(xrl.CS_FluorLine(z_fe, xrl.KA1_LINE, 8000))   # 0.0, 能量低于K边\n\n# 荧光产额与跳变比:\nprint(xrl.FluorYield(z_fe, xrl.K_SHELL))\nprint(xrl.JumpRatio(z_fe, xrl.K_SHELL))` },
      ],
      pitfalls: [
        '激发能量必须高于对应<b>吸收边</b>，否则截面为 0（或无意义）。',
        '截面 ≠ 探测到的强度：还要乘荧光产额、几何立体角、探测器效率 —— 完整定量建议上 PyMca。',
      ],
      related: ['LineEnergy-EdgeEnergy', 'CS衰减系数'],
      tags: ['荧光', 'XRF', '截面'],
    },
    {
      name: 'CompoundParser', sig: "xrl.CompoundParser('Ca5(PO4)3F')",
      brief: '解析化学式（支持括号）：返回各元素原子数、质量分数、摩尔质量。',
      examples: [
        { title: '', code: `import xraylib as xrl\n\ninfo = xrl.CompoundParser('Ca5(PO4)3F')\nprint(info['n_atoms'])        # [5, 3, 12, 1] 各元素原子数\nprint(info['Elements'])       # ['Ca', 'P', 'O', 'F']\nprint(info['massFrac'])       # 质量分数列表\nprint(info['molarMass'])      # 摩尔质量 g/mol` },
      ],
      pitfalls: [
        '化学式字符串区分大小写（CL 不行、Cl 可以）；水合物的 · 写法不支持，手动展开成 H2O 计数。',
        '得到质量分数后可直接喂给 CS_TotalForCompound / Refractive_Index。',
      ],
      related: ['CS衰减系数'],
      tags: ['化学式', '解析'],
    },
    {
      name: 'RefractiveIndex-密度', sig: "xrl.Refractive_Index('SiO2', E, 2.65) / xrl.ElementDensity(Z)",
      brief: 'X 射线折射率（实部 1-δ、虚部 β）与元素密度 —— 反射率/波带片计算用。',
      examples: [
        { title: '', code: `import xraylib as xrl\n\nn = xrl.Refractive_Index('SiO2', 8000, 2.65)   # [1-δ, β]\nprint(n)                                       # 复折射率两部分\nprint(xrl.ElementDensity(14))                  # 2.33 g/cm³\nprint(xrl.AtomicWeight(14))                    # 原子量 g/mol` },
      ],
      pitfalls: [
        '返回值是 [实部, 虚部] 列表：实部形如 0.99999xx（即 1-δ），虚部与吸收对应。',
        '能量必须高于某元素电离能否则返回 NaN；化合物+密度缺一不可。',
      ],
      related: ['CS衰减系数', 'CompoundParser'],
      tags: ['折射率', '密度', '反射率'],
    },
  ],
});

MODULES.push({
  id: 'xraydb', name: 'xraydb', icon: '🗄️', category: 'X 射线工具',
  desc: 'X 射线物理数据库（纯 Python 免编译）：线系/吸收边/衰减/荧光产额/反常散射 f1f2，API 比 xraylib 更顺手。',
  install: 'pip install xraydb',
  doc: 'https://xraydb.readthedocs.io/',
  aliases: ['衰减长度', 'f1f2', '反常散射'],
  tips: [
    '与 xraylib 的数据源不同（Elam vs Chantler），数值有细微差别 —— 论文里注明用的是哪个库。',
    '<b>元素直接写符号字符串</b>（"Fe"），比 xraylib 的 Z 更友好；化合物/材料名也能直接算。',
  ],
  entries: [
    {
      name: 'xray_line-edge', sig: "xraydb.xray_line('Fe', 'Ka1') / xraydb.xray_edge('Fe', 'K')",
      brief: '特征线与吸收边：能量 + 相对强度/跳变比一次拿到。',
      examples: [
        { title: '', code: `import xraydb as xdb\n\nline = xdb.xray_line('Fe', 'Ka1')\nprint(line.energy, line.intensity)     # 6404.1 eV, 相对强度\n\nedge = xdb.xray_edge('Fe', 'K')\nprint(edge.energy, edge.jump_ratio)    # 7112 eV, 跳变比\n\nxdb.xray_lines('Fe')                   # 该元素所有线系` },
      ],
      pitfalls: [
        '线名写法是 <b>Ka1/La1（a 不用 α）</b>，和 xraylib 的 KA1_LINE 风格不同。',
        'intensity 是线系内相对强度，绝对强度要配 fluor_yield。',
      ],
      related: ['mu-衰减长度'],
      tags: ['能量', '吸收边', '线系'],
    },
    {
      name: 'mu-衰减长度', sig: "xdb.mu('Fe', 8000) / xdb.material_mu('water', 10000) / xdb.attenuation_length('Si', 10000)",
      brief: '线衰减系数 μ (1/cm) 与衰减长度 —— 透射实验算厚度、算样品自吸收。',
      examples: [
        { title: '透过多少', code: `import xraydb as xdb\nimport math\n\nmu = xdb.material_mu('water', 10000)        # 1/cm, 材料名/化学式直接用\nmu_si = xdb.mu('Si', 10000, density=2.33)   # 元素可指定密度\nlength = xdb.attenuation_length('Si', 10000)  # 衰减长度 cm\n\nprint(mu, length)\nprint(math.exp(-mu * 0.1))                  # 1mm 水的透射率` },
      ],
      pitfalls: [
        'μ 单位 1/cm、衰减长度单位 cm（不是 mm），换算厚度时留神。',
        'mu 第一个参数元素/材料都行；材料名支持 "water"、"CaCO3" 等内置与化学式。',
      ],
      related: ['f1f2', 'xray_line-edge'],
      tags: ['衰减', '透射', '自吸收'],
    },
    {
      name: 'f1f2', sig: "f1, f2 = xdb.f1f2('Fe', 7112)",
      brief: '反常散射因子 f1、f2：近吸收边随能量剧烈变化（XANES/共振散射的理论输入）。',
      examples: [
        { title: '扫边看 f1 的跳变', code: `import xraydb as xdb\nimport numpy as np\n\nenergies = np.arange(7000, 7250, 5)\nf1 = [xdb.f1f2('Fe', e)[0] for e in energies]\nf2 = [xdb.f1f2('Fe', e)[1] for e in energies]\n# f2 与吸收直接相关, f1 在边处骤降(Kramers-Kronig)\n\n# 也可一次取数组:\nf1_arr, f2_arr = xdb.f1f2('Fe', energies)` },
      ],
      pitfalls: [
        '能量单位 eV；f1/f2 是"电子数"单位，配合 Thales/色散关系换算折射率。',
        '远离吸收边 f1 ≈ Z - 常数，近边数据来自 Chantler 表，插值平滑。',
      ],
      related: ['mu-衰减长度'],
      tags: ['反常散射', 'XANES', 'f1f2'],
    },
    {
      name: 'chemparse-yield', sig: "xdb.chemparse('CaCO3') / xdb.fluor_yield('Fe', 'Ka1')",
      brief: '化学式解析与荧光产额。',
      examples: [
        { title: '', code: `import xraydb as xdb\n\natoms = xdb.chemparse('CaCO3')     # {'Ca':1, 'C':1, 'O':3}\nprint(atoms)\n\ny = xdb.fluor_yield('Fe', 'Ka1')   # Kα1 荧光产额\nprint(y)                           # ~0.38` },
      ],
      pitfalls: [
        'chemparse 返回 {元素: 原子数} 字典；配合 mu/material_mu 做混合物自吸收很方便。',
      ],
      related: ['mu-衰减长度', 'xray_line-edge'],
      tags: ['化学式', '荧光产额'],
    },
  ],
});

MODULES.push({
  id: 'lmfit', name: 'lmfit', icon: '📉', category: 'X 射线工具',
  desc: '非线性拟合神器：峰形拟合（XPS/XRD/XRF/Raman）的事实标准，参数带边界、约束、不确定度。',
  install: 'pip install lmfit',
  doc: 'https://lmfit.github.io/lmfit-py/',
  aliases: ['拟合', '分峰', '峰形', 'voigt'],
  tips: [
    '<b>初值决定成败</b>：先用 scipy find_peaks 找到峰位/峰高，把结果填进参数初值，收敛率直线上升。',
    '拟合谱图的标准流程：扣背景 → 建复合模型(多峰+背景) → 带边界初值 fit → fit_report 检查相关性。',
  ],
  entries: [
    {
      name: 'Model-fit基础', sig: "model = GaussianModel(prefix='p1_') / result = model.fit(y, params, x=x)",
      brief: '最小可用拟合：建模型 → 设初值 → fit。',
      examples: [
        { title: '', code: `import numpy as np\nfrom lmfit.models import GaussianModel\n\nmodel = GaussianModel(prefix='p1_')          # prefix 用于多峰区分参数\nparams = model.make_params(\n    center=10.0, sigma=0.5, amplitude=100)   # 初值!!!\n\nresult = model.fit(y, params, x=x)           # x 必须关键字传入\nprint(result.fit_report())\nplt.plot(x, y, 'b.', x, result.best_fit, 'r-')` },
      ],
      pitfalls: [
        '<b>x 必须以关键字 x=x 传入</b>，位置参数会报错。',
        '不给初值时 lmfit 会用数据猜测，单峰常能成，多峰基本必挂 —— 养成手动设初值的习惯。',
      ],
      related: ['峰形模型一览', '参数与约束'],
      tags: ['拟合', '高斯', '入门'],
    },
    {
      name: '峰形模型一览', sig: 'Gaussian / Lorentzian / Voigt / PseudoVoigt / SplitLorentzian / DoniachSunjic / Linear / Step',
      brief: '内置峰形与背景模型速查（X 射线谱常用清单）。',
      params: [
        { n: 'GaussianModel', t: '-', d: '高斯：仪器展宽、弹峰' },
        { n: 'LorentzianModel', t: '-', d: '洛伦兹：寿命展宽, 长尾' },
        { n: 'VoigtModel', t: '-', d: '高斯⊗洛伦兹卷积, XRD/气体相最物理' },
        { n: 'PseudoVoigtModel', t: '-', d: '高斯+洛伦兹线性混合, XRD 常用近似, 快' },
        { n: 'SplitLorentzianModel', t: '-', d: '左右两半不同宽的洛伦兹, XPS 不对称峰' },
        { n: 'DoniachSunjicModel', t: '-', d: 'Doniach–Šunjić 不对称线形, XPS 金属态' },
        { n: 'LinearModel / ConstantModel', t: '-', d: '线性/常数背景' },
        { n: 'StepModel', t: '-', d: '台阶函数(EAES/XAS 边)' },
      ],
      examples: [
        { title: '各模型统一用法', code: `from lmfit.models import PseudoVoigtModel, LinearModel\n\n# 峰 + 线性背景\npeak = PseudoVoigtModel(prefix='p1_')\nbkg  = LinearModel(prefix='b_')\nmodel = peak + bkg\nparams = model.make_params(\n    p1_center=10, p1_sigma=0.5, p1_amplitude=100,\n    p1_fraction=0.5,           # 高斯成分占比\n    b_slope=0, b_intercept=10)\nresult = model.fit(y, params, x=x)` },
      ],
      pitfalls: [
        '<b>多模型相加时 prefix 必须互不相同</b>，否则参数名冲突直接报错。',
        'PseudoVoigt 的 fraction 是高斯占比；Voigt 没有 fraction，sigma↔gamma 分开拟合但常约束相等。',
      ],
      related: ['Model-fit基础', '多峰复合拟合'],
      tags: ['voigt', 'xps', '峰形'],
    },
    {
      name: '参数与约束', sig: "params['p1_center'].set(value=, min=, max=, expr=, vary=False)",
      brief: '参数边界、固定与表达式约束（物理合理性靠它）。',
      examples: [
        { title: '', code: `params = model.make_params()\nparams['p1_center'].set(value=10.0, min=9.5, max=10.5)   # 边界\nparams['p1_sigma'].set(min=0.01)                          # 只给下限\nparams['b_slope'].set(value=0, vary=False)                # 固定不拟合\n\n# 表达式约束: 双峰间距固定为 2.0 (如 Kα1-Kα2)\nparams['p2_center'].set(expr='p1_center + 2.0')\nparams['p2_sigma'].set(expr='p1_sigma')                   # 共享宽度` },
      ],
      pitfalls: [
        '约束表达式里用<b>参数名</b>做变量（字符串），支持 + - * / 和数学函数（sin/sqrt…）。',
        'set(value=…) 会重置你 make_params 里给的初值 —— 链式调整时按顺序来。',
      ],
      related: ['多峰复合拟合'],
      tags: ['约束', '边界', 'expr'],
    },
    {
      name: '多峰复合拟合', sig: 'model = peak1 + peak2 + bkg / result = model.fit(...)',
      brief: '分峰拟合标准流程：找峰给初值 → 多峰+背景 → 约束 → 拟合。',
      examples: [
        { title: '双峰+背景完整模板', code: `import numpy as np\nfrom scipy.signal import find_peaks\nfrom lmfit.models import GaussianModel, ConstantModel\n\npk, props = find_peaks(y, prominence=50)      # 1. 找峰给初值\n\nmodel = ConstantModel(prefix='b_')\nparams = model.make_params(c=y.min())\nfor i, p in enumerate(pk[:2]):                # 2. 每个峰建一个模型\n    g = GaussianModel(prefix=f'g{i}_')\n    params.update(g.make_params(center=x[p], sigma=2,\n                                amplitude=y[p] * 3))\n    model = model + g\n\nresult = model.fit(y, params, x=x)            # 3. 拟合\nresult.plot()                                  # 自动画 拟合+残差 图\nfor name, p in result.best_values.items():     # 4. 取参数\n    print(name, round(p, 3))` },
      ],
      pitfalls: [
        '峰太近时初值互相"抢"峰，先拟单峰再放开，或对 center 加边界锁住大致位置。',
        'best_values 是 {参数名: 值} 字典；带误差的完整信息在 result.params（.value/.stderr）。',
      ],
      related: ['峰形模型一览', '参数与约束', '拟合结果报告'],
      tags: ['分峰', '多峰', '模板'],
    },
    {
      name: '拟合结果报告', sig: 'result.best_values / result.params[...].stderr / result.fit_report()',
      brief: '从拟合结果取数：参数、不确定度、统计量、画图、保存。',
      examples: [
        { title: '', code: `result.best_values                 # {'g0_center': 10.02, ...}\nresult.params['g0_center'].value   # 最优值\nresult.params['g0_center'].stderr  # 1σ 不确定度\nresult.redchi                      # 约化卡方(越小越好)\nresult.nfev                        # 迭代次数\n\nprint(result.fit_report(min_correl=0.5))  # 文字报告+强相关参数警告\n\nresult.plot(data_kws={'markersize': 3})    # 拟合图+残差图\nresult.save('fit_result.fit')              # 保存, lmfit.model.load_result 读回` },
      ],
      pitfalls: [
        '<b>别只看拟合曲线像不像</b>：看 redchi 是否接近 1、残差是否还有结构、参数 stderr 是否爆炸。',
        '参数间相关系数接近 ±1 说明模型冗余（两个峰在拟合同一个东西），减峰或加约束。',
      ],
      related: ['多峰复合拟合'],
      tags: ['报告', '不确定度', 'redchi'],
    },
  ],
});

MODULES.push({
  id: 'pyFAI', name: 'pyFAI', icon: '🍩', category: 'X 射线工具',
  desc: '探测器几何校正与方位角积分：SAXS/WAXS/GIWAXS 二维图 → 一维曲线的标准工具。',
  install: 'pip install pyFAI',
  doc: 'https://pyfai.readthedocs.io/',
  aliases: ['方位角积分', 'poni', '积分', 'SAXS'],
  tips: [
    '<b>几何标定用 pyFAI-calib2</b>（随包安装的 GUI）+ 标样（CeO2/AgBehenate），标完存成 .poni 文件反复使用。',
    '输入图像就是 numpy 数组（配合 fabio 读 cbf/edf/tiff），行×列 = 慢轴×快轴。',
  ],
  entries: [
    {
      name: 'integrate1d', sig: "ai = pyFAI.load('geometry.poni') / res = ai.integrate1d(img, npt, unit='q_A^-1')",
      brief: '二维衍射图 → 一维曲线（方位角积分）。',
      params: [
        { n: 'img', t: 'ndarray', d: '二维强度图' },
        { n: 'npt', t: 'int', d: '输出点数' },
        { n: 'unit', t: 'str', d: "'q_A^-1'(散射矢量) / '2th_deg'(衍射角) / 'r_mm'" },
        { n: 'mask', t: 'ndarray', d: '坏点/光束挡板掩码（True=忽略）' },
        { n: 'polarization_factor', t: 'float', d: '偏振校正，同步光常用 0.99', dflt: 'None' },
      ],
      examples: [
        { title: '', code: `import pyFAI\n\nai = pyFAI.load('geometry.poni')     # 读标定好的几何\nres = ai.integrate1d(img, 1000,\n                     unit='q_A^-1',\n                     polarization_factor=0.99)\nq, I = res.radial, res.intensity     # 散射矢量 与 强度\n\nimport matplotlib.pyplot as plt\nplt.plot(q, I); plt.xlabel('q (1/Å)')` },
      ],
      pitfalls: [
        '<b>mask 语义是 True=坏点</b>（被忽略），别写反；detector 自身 mask 可用 <code>ai.detector.mask</code> 合并。',
        'res 是结果对象，取 res.radial / res.intensity；直接解包元组顺序容易记混。',
        '单位换算 2θ↔q 依赖波长，波长来自 .poni 几何文件 —— 标定错了 q 轴整体错。',
      ],
      related: ['integrate2d', '几何标定'],
      tags: ['积分', 'saxs', 'waxs', '一维'],
    },
    {
      name: 'integrate2d', sig: "res = ai.integrate2d(img, npt_rad, npt_azim, unit='q_A^-1')",
      brief: '二维积分/蛋糕图（cake）：同时按径向和方位角展开。',
      examples: [
        { title: '', code: `res = ai.integrate2d(img, 500, 360, unit='q_A^-1')\nI, q, phi = res.intensity, res.radial, res.azimuthal\n\nimport matplotlib.pyplot as plt\nplt.imshow(I, aspect='auto',\n           extent=[q.min(), q.max(), phi.min(), phi.max()])\nplt.xlabel('q (1/Å)'); plt.ylabel('chi (deg)')` },
      ],
      pitfalls: [
        '返回三个数组的顺序是 (intensity, radial, azimuthal)，和 1d 不同。',
        '各向同性样品 integrate2d 没意义；看取向/纤维/单晶斑点才需要。',
      ],
      related: ['integrate1d'],
      tags: ['二维', 'cake', '方位角'],
    },
    {
      name: '几何标定', sig: "det = pyFAI.detector_factory('Pilatus1M') / ai = pyFAI.geometry(dist=..., poni1=..., poni2=...)",
      brief: '几何参数（dist/poni1/poni2/rot）与探测器定义。',
      params: [
        { n: 'dist', t: 'm', d: '样品到探测器距离（米）' },
        { n: 'poni1 / poni2', t: 'm', d: '几何参考点到探测器原点的坐标' },
        { n: 'rot1/rot2/rot3', t: 'rad', d: '三个旋转角' },
        { n: 'detector', t: 'str/对象', d: "探测器型号，如 'Pilatus1M'、'Pilatus_CdTe'，自带像素尺寸与掩码" },
      ],
      examples: [
        { title: '编程方式构建几何', code: `import pyFAI, pyFAI.detectors\n\ndet = pyFAI.detectors.Detector(pixel1=172e-6, pixel2=172e-6)\nai = pyFAI.geometry(dist=0.15, poni1=0.06, poni2=0.07,\n                    rot1=0, rot2=0, rot3=0, detector=det)\nai.save('geometry.poni')          # 存成 poni, 以后 load 复用\nprint(ai)                          # 打印几何与波长` },
      ],
      pitfalls: [
        'poni1/poni2 单位是<b>米</b>，rot 单位<b>弧度</b> —— 手填常见错误源；标定交给 pyFAI-calib2。',
        '波长存在 poni 里（ai.wavelength，米），换能量要重标或手动 ai.wavelength = 新值。',
      ],
      related: ['integrate1d'],
      tags: ['标定', 'poni', '几何'],
    },
  ],
});

MODULES.push({
  id: 'fabio', name: 'fabio', icon: '🖼️', category: 'X 射线工具',
  desc: '衍射图像格式读写：cbf / edf / tiff / marccd 等直接变 numpy 数组，配 pyFAI 使用。',
  install: 'pip install fabio',
  doc: 'https://fabio.readthedocs.io/',
  aliases: ['cbf', 'edf', '衍射图像'],
  entries: [
    {
      name: 'open', sig: "img = fabio.open('scan_0001.cbf') / data = img.data",
      brief: '打开衍射图像文件，.data 就是 numpy 数组。',
      examples: [
        { title: '', code: `import fabio\n\nimg = fabio.open('scan_0001.cbf')\ndata = img.data                 # numpy 二维数组, 直接给 pyFAI\nprint(data.shape, data.dtype, data.max())\nprint(img.header)               # 文件头信息(曝光时间/波长等)` },
      ],
      pitfalls: [
        '格式自动识别靠<b>扩展名</b>，无扩展名的文件会打开失败，重命名或指定格式。',
        '探测器的饱和值/增益在 header 里，做强度校正前先看头。',
      ],
      related: ['批量写出'],
      tags: ['cbf', 'edf', '读取'],
    },
    {
      name: '批量写出', sig: "fabio.new_image(data) / img.write('out.tiff')",
      brief: '遍历批量读取 + 结果写出。',
      examples: [
        { title: '', code: `import glob, fabio\nimport numpy as np\n\nsum_img = None\nfor f in sorted(glob.glob('scan_*.cbf')):\n    d = fabio.open(f).data.astype(np.float64)\n    sum_img = d if sum_img is None else sum_img + d\n\nout = fabio.new_image(data=sum_img)\nout.write('sum.tiff')           # 也可写 .edf` },
      ],
      pitfalls: [
        'cbf 原始数据常是 int32，累加前转 <b>float64 防溢出</b>。',
        '写 tiff 用普通灰度查看器可开；要保留科学头信息写 edf。',
      ],
      related: ['open'],
      tags: ['批量', '累加', '写出'],
    },
  ],
});

MODULES.push({
  id: 'pymatgen', name: 'pymatgen', icon: '💎', category: 'X 射线工具',
  desc: '材料晶体学库：读 CIF/POSCAR、按晶态模拟粉末 XRD 谱，与实验谱对比物相。',
  install: 'pip install pymatgen',
  doc: 'https://pymatgen.org/',
  aliases: ['pmg', 'xrd', 'cif', '物相'],
  tips: [
    '库比较重，首次 import 慢是正常的；只做 XRD 用 <code>pymatgen.analysis.diffraction.xrd</code> 这条链路即可。',
    '模拟谱是"点状"峰列表（位置+相对强度），和实验谱对比时把点画成杆图（stem）最直观。',
  ],
  entries: [
    {
      name: 'Structure', sig: "from pymatgen.core import Structure / struct = Structure.from_file('x.cif')",
      brief: '读入晶体结构（CIF/POSCAR/JSON）。',
      examples: [
        { title: '', code: `from pymatgen.core import Structure\n\nstruct = Structure.from_file('quartz.cif')\nprint(struct.composition)        # 组成: Si8 O16\nprint(struct.lattice.abc, struct.lattice.angles)   # 晶胞参数\nprint(len(struct))               # 位点数\nprint(struct[0])                 # 第一个原子: 元素+坐标` },
      ],
      pitfalls: [
        'CIF 里对称性不全时位点可能重复占位，可用 <code>struct = struct.get_primitive_structure()</code> 或检查 len。',
        ' Materials Project 下载的 CIF 一般可直接读，缺键长键角信息不影响 XRD。',
      ],
      related: ['XRDCalculator'],
      tags: ['晶体', 'cif', '结构'],
    },
    {
      name: 'XRDCalculator', sig: "XRDCalculator(wavelength='CuKa').get_pattern(struct) -> pattern.x / pattern.y",
      brief: '从结构模拟粉末 XRD：衍射角、相对强度、对应晶面指数。',
      examples: [
        { title: '模拟 + 与实验谱对比', code: `from pymatgen.analysis.diffraction.xrd import XRDCalculator\nimport matplotlib.pyplot as plt\n\ncalc = XRDCalculator(wavelength='CuKa')      # Cu Kα (1.5406 Å)\np = calc.get_pattern(struct, two_theta_range=(10, 80))\n\nplt.stem(p.x, p.y, basefmt=' ')              # 模拟谱(杆图)\nplt.plot(exp_x, exp_y_norm)                  # 实验谱(归一后)\nplt.xlabel('2θ (deg)'); plt.ylabel('Intensity')\n\nfor two_t, inten, hkls in zip(p.x, p.y, p.hkls):\n    print(round(two_t, 3), round(inten, 1), hkls[0]['hkl'])` },
      ],
      pitfalls: [
        '波长可传别名 <code>"CuKa" / "MoKa"</code> 或直接传数值（Å）—— 传错单位谱轴整体错。',
        '模拟强度是<b>相对强度</b>（最强峰=100），且不考虑织构/择优取向 —— 实验谱峰强比例不同很常见。',
      ],
      related: ['Structure'],
      tags: ['xrd', '模拟', '物相'],
    },
    {
      name: '常用操作', sig: 'struct.composition / struct.remove_oxidation_states() / Element("Fe").Z',
      brief: '组分、氧化态、元素信息等高频小操作。',
      examples: [
        { title: '', code: `from pymatgen.core import Structure, Element, Composition\n\ncomp = Composition('Fe2O3')\nprint(comp.weight)                    # 分子量\nprint(comp.get_el_amt_dict())        # {'Fe': 2.0, 'O': 3.0}\n\nstruct.composition.reduced_formula    # Fe2O3\nElement('Fe').Z, Element('Fe').atomic_mass` },
      ],
      pitfalls: [
        'Composition 不含结构信息（只是配比）；带氧化态的结构做 XRD 前常 remove_oxidation_states()。',
      ],
      related: ['Structure'],
      tags: ['组分', '元素'],
    },
  ],
});
