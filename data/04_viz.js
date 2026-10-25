/* 数据可视化：matplotlib / seaborn / pyecharts */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'matplotlib', name: 'matplotlib', icon: '📈', category: '数据可视化',
  doc: 'https://matplotlib.org/stable/',
  desc: 'Python 绘图基石，一切静态图的底层；约定 import matplotlib.pyplot as plt。',
  install: 'pip install matplotlib',
  aliases: ['mpl', 'plt', 'pyplot'],
  tips: [
    '<b>中文乱码</b>必设两行：<code>plt.rcParams["font.sans-serif"] = ["SimHei"]</code> 和 <code>plt.rcParams["axes.unicode_minus"] = False</code>（Mac 用 "Arial Unicode MS"）。',
    '推荐面向对象写法 <code>fig, ax = plt.subplots()</code>，方法都挂在 ax 上（ax.plot / ax.set_title）；plt.xxx 是快捷方式，两者可混用但容易晕。',
    '<b>savefig 必须写在 plt.show() 之前</b>，show 之后画布已被清空，存出来是白图。',
  ],
  entries: [
    {
      name: 'plot', thumb: 'line', sig: "plt.plot(x, y, fmt, color=, linestyle=, linewidth=, marker=, label=)",
      brief: '画折线图（也顺手画点），最基础的绘图函数。',
      params: [
        { n: 'fmt', t: 'str', d: "格式串速记，如 'ro--' = 红色圆点虚线" },
        { n: 'color', t: 'str', d: "颜色：'red'、'#FF5733'、'C0'~'C9'" },
        { n: 'linestyle', t: 'str', d: "'-'实线 '--'虚线 ':'点线 '-.'" },
        { n: 'marker', t: 'str', d: "'o'圆 's'方 '^'三角 '*'星" },
        { n: 'label', t: 'str', d: '图例文字，配合 plt.legend()' },
      ],
      examples: [
        { title: '', code: `import matplotlib.pyplot as plt\nx = [1, 2, 3, 4]\ny = [10, 25, 15, 30]\nplt.plot(x, y, 'o-', color='steelblue', label='销量')\nplt.plot(x, [v * 0.8 for v in y], '--', label='预测')\nplt.legend()\nplt.show()` },
      ],
      pitfalls: [
        '连续调用多次 plot 画在同一坐标系；想画新图先 <code>plt.figure()</code> 或 plt.show()。',
        'x 或 y 长度不一致不报错但图错乱，长度检查是第一步。',
      ],
      related: ['scatter', 'bar-hist', 'savefig'],
      tags: ['折线图', '绘图'],
    },
    {
      name: 'scatter', thumb: 'scatter', sig: 'plt.scatter(x, y, s=None, c=None, alpha=None, cmap=None)',
      brief: '散点图，看两变量关系；s 控制点大小、c 控制颜色（可传数组做第三维）。',
      examples: [
        { title: '', code: `import numpy as np\nx = np.random.randn(200)\ny = x * 1.5 + np.random.randn(200) * 0.5\nplt.scatter(x, y, s=20, c=y, cmap='viridis', alpha=0.6)\nplt.colorbar(label='y 值')\nplt.show()` },
      ],
      pitfalls: [
        '<code>s</code> 是"面积的平方像素"不是直径，视觉大小约为 sqrt(s)。',
        '散点太密加 <code>alpha=0.3</code> 半透明，不然一团黑。',
      ],
      related: ['plot', 'subplots'],
      tags: ['散点图', '相关性'],
    },
    {
      name: 'bar-hist', thumb: 'bar', sig: 'plt.bar(x, height, width=0.8) / plt.hist(data, bins=20, density=False)',
      brief: '柱状图（类别 vs 数值）与直方图（数值分布），长得像但用途完全不同。',
      examples: [
        { title: '柱状图: 类别对比', code: `cats = ['北京', '上海', '广州']\nvals = [320, 410, 280]\nplt.bar(cats, vals)\nplt.bar_label(plt.bar(cats, vals))   # 3.4+ 直接标数值\nplt.show()` },
        { title: '直方图: 分布形态', code: `import numpy as np\ndata = np.random.randn(1000)\nplt.hist(data, bins=30, edgecolor='white')\nplt.show()` },
      ],
      pitfalls: [
        '<b>bar 是"类别→数值"，hist 是"数值→频率"</b>：给 hist 传已经统计好的频数表是错的，那要用 plt.bar。',
        '直方图 bins 太少看不出形态、太多全是毛刺，先试 20~50。',
        '分类标签是中文记得先设字体（见模块提示）。',
      ],
      related: ['plot', 'rcParams-style'],
      tags: ['柱状图', '直方图', '分布'],
    },
    {
      name: 'subplots', thumb: 'grid', sig: "fig, axes = plt.subplots(nrows=1, ncols=2, figsize=(10, 4), sharex=False)",
      brief: '一张 figure 上排多个子图；axes 是子图数组。',
      examples: [
        { title: '2x2 网格子图', code: `fig, axes = plt.subplots(2, 2, figsize=(10, 6))\naxes = axes.flatten()               # 拉平成一维数组方便循环\nfor ax, col in zip(axes, ['a', 'b', 'c', 'd']):\n    ax.plot(range(10), range(10))\n    ax.set_title(col)\nplt.tight_layout()                  # 自动调整间距, 防重叠\nplt.show()` },
      ],
      pitfalls: [
        '<code>plt.subplots(2, 2)</code> 返回二维数组，<code>axes[0]</code> 是第一行不是第一个图；循环前 <code>axes.flatten()</code>。',
        '单个子图时返回的不是数组，<code>axes</code> 直接就是 ax。',
        '子图标题/坐标轴互相重叠时 <code>plt.tight_layout()</code> 或 <code>constrained_layout=True</code>。',
      ],
      related: ['savefig', 'plot'],
      tags: ['子图', '多图', '布局'],
    },
    {
      name: '标题图例', sig: 'ax.set_title(t) / ax.set_xlabel(t) / plt.legend(loc="best") / plt.suptitle(t)',
      brief: '给图加标题、轴标签、图例。',
      examples: [
        { title: '', code: `fig, ax = plt.subplots()\nax.plot([1, 2], [3, 4], label='线1')\nax.set_title('月度销量')\nax.set_xlabel('月份')\nax.set_ylabel('销量(万)')\nax.legend(loc='upper left')\nfig.suptitle('2024 报告', fontsize=14)   # 整图大标题\nplt.show()` },
      ],
      pitfalls: [
        '面向对象写法是 <code>ax.set_title</code>，plt 快捷写法是 <code>plt.title</code>，别混着调（对 plt 调用影响的是"当前子图"）。',
        'legend 不显示：画线时忘了 <code>label=</code>。',
        '中文显示方块：先设 rcParams 字体（见模块提示）。',
      ],
      related: ['plot', 'subplots'],
      tags: ['标题', '图例', '标签'],
    },
    {
      name: 'savefig', sig: "plt.savefig(fname, dpi=300, bbox_inches='tight', transparent=False)",
      brief: '保存图片，支持 png/jpg/svg/pdf；必须写在 show() 之前。',
      examples: [
        { title: '', code: `plt.plot([1, 2, 3], [2, 4, 3])\nplt.savefig('fig.png', dpi=300, bbox_inches='tight')  # 先保存\nplt.show()                                            # 后显示\n# 批量存: 每个 figure 各自 savefig\n# 存矢量图: 'fig.svg' 或 'fig.pdf' (论文推荐, 放大不糊)` },
      ],
      pitfalls: [
        '<b>顺序错了存出白图</b>：show() 会清空画布，savefig 一定放它前面。',
        '不设 dpi 时默认 100，放进 PPT/论文会糊，一般 300。',
        '图边缘留白多 → <code>bbox_inches="tight"</code>；要透明背景加 transparent=True。',
      ],
      related: ['plot', 'subplots'],
      tags: ['保存', '导出', 'dpi'],
    },
    {
      name: 'rcParams-style', sig: "plt.rcParams['font.sans-serif']=['SimHei'] / plt.style.use('ggplot')",
      brief: '全局样式设置：中文字体、负号显示、整体绘图风格。',
      examples: [
        { title: '每次画图前的万能开头', code: `import matplotlib.pyplot as plt\nplt.rcParams['font.sans-serif'] = ['SimHei']     # 中文黑体\nplt.rcParams['axes.unicode_minus'] = False       # 负号正常显示\nplt.style.use('ggplot')                          # 换整体风格(可选)\nplt.plot([-2, -1, 0, 1], [-2, -1, 0, 1])\nplt.title('负号 -2 也能显示')\nplt.show()` },
      ],
      pitfalls: [
        '设置了中文字体后<b>负号会变方块</b>，必须配套 unicode_minus=False。',
        '服务器(无 GUI 环境)画图报错，开头加 <code>matplotlib.use("Agg")</code>。',
        '<code>plt.style.available</code> 查看所有内置风格；style.use 会覆盖 rcParams，先 style 后字体。',
      ],
      related: ['标题图例', 'savefig'],
      tags: ['中文', '乱码', '样式', '字体'],
    },
    {
      name: '颜色与注释', sig: "ax.annotate(text, xy, xytext) / ax.axhline(y) / plt.text(x, y, s)",
      brief: '在图上标注：箭头指示、参考线、文字说明。',
      examples: [
        { title: '', code: `plt.plot(range(12), sales)\nplt.axhline(100, color='red', ls='--', lw=1)      # 目标线\nplt.axvline(6, color='gray', ls=':')               # 某时点竖线\nplt.annotate('峰值', xy=(9, 180), xytext=(10, 150),\n             arrowprops=dict(arrowstyle='->'))\nplt.text(0, 190, '单位: 万元', fontsize=9)\nplt.show()` },
      ],
      pitfalls: [
        'annotate 的 xy 是"指向点"坐标，xytext 是"文字放哪"，两个都要数据坐标。',
        'axhline/axvline 是整幅图的参考线，参数只要一个 y 或 x。',
      ],
      related: ['plot', '标题图例'],
      tags: ['标注', '参考线', '箭头'],
    },
    {
      name: '数据来源df', thumb: 'bar', sig: "df.plot(kind='line'/'bar'/'hist'/'scatter'/'box', ax=None)",
      brief: 'pandas 自带的快捷绘图（底层就是 matplotlib），直接对 DataFrame 画图。',
      examples: [
        { title: '', code: `# pip install pandas 后即可用\ndf.plot(kind='bar', x='城市', y='金额', figsize=(8, 4), title='各城市金额')\ndf['金额'].plot(kind='hist', bins=30)\ndf.plot(kind='scatter', x='广告投入', y='销量')\nplt.show()` },
      ],
      pitfalls: [
        '返回的是 <code>matplotlib.axes.Axes</code>，之后还能继续用 plt.xxx 加标题存图。',
        '多列同时 plot 时索引会被当作 x 轴，先 set_index 或 reset_index 理清楚。',
      ],
      related: ['plot', 'bar-hist'],
      tags: ['dataframe', '快捷绘图'],
    },
    {
      name: 'pie 饼图', thumb: 'pie', sig: "plt.pie(sizes, labels=, autopct='%1.1f%%', startangle=90, explode=)",
      brief: '饼图与环形图：占比构成展示。',
      examples: [
        { title: '饼图 + 环形图', code: `labels = ['北京', '上海', '广州', '其他']
sizes = [320, 410, 280, 90]
explode = (0, 0.06, 0, 0)            # 突出某一块

plt.pie(sizes, labels=labels, autopct='%1.1f%%',
        startangle=90, explode=explode,
        wedgeprops={'edgecolor': 'white'})
plt.axis('equal')                     # 保证是正圆
plt.show()

# 环形图(甜甜圈): wedgeprops 加 width
plt.pie(sizes, labels=labels, autopct='%1.1f%%',
        wedgeprops={'width': 0.42})` },
      ],
      pitfalls: [
        'sizes 不用凑成 100，plt 自动按比例换算；autopct 控制百分比格式。',
        '<b>默认从 0 度逆时针</b>画；报告习惯从 12 点钟顺时针 → startangle=90 + counterclock=False。',
        '饼块多于 6 块可读性差，小占比合并成"其他"。',
      ],
      related: ['bar-hist', 'plot'],
      tags: ['饼图', '占比'],
    },
    {
      name: 'boxplot-violin', thumb: 'box', sig: "plt.boxplot(data, tick_labels=, showmeans=True) / plt.violinplot(data)",
      brief: '箱线图(分布+离群点)与小提琴图(分布形状)。',
      examples: [
        { title: '', code: `data = [g1, g2, g3]                 # 每组一个数组

plt.boxplot(data, tick_labels=['A', 'B', 'C'],
            showmeans=True, patch_artist=True)
plt.ylabel('数值')
plt.show()

plt.violinplot(data, showmedians=True)   # 小提琴=密度轮廓
plt.show()` },
      ],
      pitfalls: [
        '箱体=四分位距(IQR)，晶须默认 1.5 倍 IQR，圆点是<b>离群值</b>。',
        '<b>3.9 起参数 labels 改名 tick_labels</b>，老代码报意外关键字就是它。',
        '组内样本太少时小提琴密度不可信，用箱线图。',
      ],
      related: ['bar-hist', 'plot'],
      tags: ['箱线图', '小提琴', '离群值'],
    },
    {
      name: 'errorbar-errorfill', thumb: 'errorline', sig: "plt.errorbar(x, y, yerr=err, fmt='o', capsize=4) / plt.fill_between(x, lo, hi, alpha=.2)",
      brief: '误差棒与置信带：实验数据不确定度的标准画法。',
      examples: [
        { title: '', code: `plt.errorbar(x, y, yerr=yerr, fmt='o', capsize=4,
             color='steelblue', label='测量值')

# 置信带(上下界随 x 变化):
plt.plot(x, y, 'k-')
plt.fill_between(x, y - ci, y + ci, alpha=0.25, label='95% 置信')
plt.legend()
plt.show()` },
      ],
      pitfalls: [
        'yerr 是<b>对称误差</b>；上下不同的非对称误差传 shape 为 (2, N) 的数组。',
        '<b>capsize 别忘加</b>，否则端帽看不见；多组数据错开横坐标防重叠。',
        'fill_between 画的是上下界之间的带，与主线叠加表达不确定性。',
      ],
      related: ['plot', '颜色与注释'],
      tags: ['误差棒', '置信带'],
    },
    {
      name: 'fill_between-stackplot', thumb: 'stack', sig: 'plt.fill_between(x, y1, y2, alpha=0.4) / plt.stackplot(x, y1, y2, labels=)',
      brief: '区域填充与堆叠面积图。',
      examples: [
        { title: '', code: `plt.plot(x, y1)
plt.fill_between(x, y1, where=(x > 5), alpha=0.3)   # 条件填充

# 堆叠面积图:
plt.stackplot(x, s1, s2, s3, labels=['a', 'b', 'c'])
plt.legend(loc='upper left')
plt.show()` },
      ],
      pitfalls: [
        'where 条件填充在边界处会"断崖"，把边界相邻点包含进条件更平滑。',
        'stackplot 是<b>叠加</b>显示（各层垒起来），不是重叠画线。',
      ],
      related: ['plot'],
      tags: ['填充', '堆叠面积'],
    },
    {
      name: 'imshow-contour', thumb: 'heatmap', sig: "plt.imshow(m, cmap='viridis', origin='lower') / plt.contourf(X, Y, Z, levels=20)",
      brief: '矩阵热度图与等高线（二维强度数据可视化）。',
      examples: [
        { title: '', code: `m = np.random.rand(8, 12)
plt.imshow(m, cmap='viridis', aspect='auto')
plt.colorbar(label='强度')
plt.show()

X, Y = np.meshgrid(np.linspace(-3, 3, 100), np.linspace(-3, 3, 100))
Z = np.exp(-(X ** 2 + Y ** 2))
plt.contourf(X, Y, Z, levels=20, cmap='magma')
plt.colorbar()
plt.contour(X, Y, Z, levels=6, colors='white', linewidths=0.5)  # 叠加等高线` },
      ],
      pitfalls: [
        '<b>imshow 的 origin 默认 upper</b>（行 0 在顶部，y 轴朝下），物理数据记得 origin="lower"。',
        'imshow 不给坐标范围时用的是像素下标；要真实轴用 <code>extent=[x0, x1, y0, y1]</code>。',
        'colorbar 一定要加，没色标的热度图读不出数值。',
      ],
      related: ['颜色与注释', 'plot'],
      tags: ['热度图', '等高线', '矩阵'],
    },
    {
      name: 'hist2d-hexbin', thumb: 'dots2d', sig: "plt.hist2d(x, y, bins=40) / plt.hexbin(x, y, gridsize=30)",
      brief: '二维密度分布：散点太密看不清时的替代方案。',
      examples: [
        { title: '', code: `plt.hist2d(x, y, bins=40, cmap='Blues')
plt.colorbar(label='计数')

# 六边形分箱(更好看):
plt.hexbin(x, y, gridsize=30, cmap='viridis', mincnt=1)
plt.colorbar(label='计数')
plt.show()` },
      ],
      pitfalls: [
        'bins/gridsize 太细则全是噪点，先粗后细试。',
        '<code>mincnt=1</code> 让零计数格子不显示，背景干净。',
      ],
      related: ['bar-hist', 'scatter'],
      tags: ['二维直方图', '密度'],
    },
    {
      name: '3D 图', thumb: 'surface3d', sig: "ax = fig.add_subplot(projection='3d') / ax.plot_surface(X, Y, Z, cmap='viridis')",
      brief: '三维曲面/散点（新版 matplotlib 不再需要 import mpl_toolkits）。',
      examples: [
        { title: '', code: `X, Y = np.meshgrid(np.linspace(-3, 3, 60), np.linspace(-3, 3, 60))
Z = np.exp(-(X ** 2 + Y ** 2))

fig = plt.figure(figsize=(8, 6))
ax = fig.add_subplot(projection='3d')
surf = ax.plot_surface(X, Y, Z, cmap='viridis', linewidth=0)
fig.colorbar(surf, shrink=0.6)
ax.view_init(elev=30, azim=-60)      # 调视角
ax.set_zlabel('Z')
plt.show()

# 3D 散点: ax.scatter3D(x, y, z)` },
      ],
      pitfalls: [
        '<b>plot_surface 必须传网格</b>（np.meshgrid 的二维 X/Y/Z），传一维数组画不出面。',
        '默认视角可能挡住关键特征，view_init(elev=仰角, azim=方位角) 多试几个角度。',
      ],
      related: ['subplots', 'imshow-contour'],
      tags: ['3d', '曲面', 'meshgrid'],
    },
    {
      name: '雷达图', thumb: 'radar', sig: "ax = plt.subplot(projection='polar') / 数据首尾闭合画法",
      brief: '极坐标与雷达图（多指标对比）。',
      examples: [
        { title: '雷达图标准模板', code: `labels = ['灵敏度', '分辨率', '稳定性', '速度', '成本']
vals = [4, 3, 5, 2, 4]

angles = np.linspace(0, 2 * np.pi, len(labels), endpoint=False)
ang = np.concatenate([angles, angles[:1]])     # 闭合!
val = np.concatenate([vals, vals[:1]])

ax = plt.subplot(projection='polar')
ax.plot(ang, val)
ax.fill(ang, val, alpha=0.25)
ax.set_xticks(angles)
ax.set_xticklabels(labels)
plt.show()` },
      ],
      pitfalls: [
        '<b>数据必须首尾闭合</b>（把第一个点接回末尾），否则雷达图缺一个扇形口。',
        '不同指标量纲差异大时先各自归一化到同一刻度，否则图形失真。',
      ],
      related: ['plot'],
      tags: ['雷达图', '极坐标'],
    },
    {
      name: 'twinx 双轴', sig: 'ax2 = ax1.twinx()',
      brief: '双 y 轴图：两组量纲不同的数据画在一起。',
      examples: [
        { title: '', code: `fig, ax1 = plt.subplots()
ax1.bar(months, sales, alpha=0.6, label='销量')
ax1.set_ylabel('销量(万)')

ax2 = ax1.twinx()                     # 共享x轴的新y轴
ax2.plot(months, rate, color='red', marker='o', label='利润率%')
ax2.set_ylabel('利润率(%)')

# 图例合并(双轴的图例不会自动合并):
h1, l1 = ax1.get_legend_handles_labels()
h2, l2 = ax2.get_legend_handles_labels()
ax1.legend(h1 + h2, l1 + l2)
plt.show()` },
      ],
      pitfalls: [
        '<b>双轴的两个图例不会自动合并</b>，要手动拼接 handles（见示例）。',
        '两条轴各配一个颜色体系（轴标签/刻度同色），否则读者分不清哪条线对应哪根轴。',
        '双轴容易造成"虚假相关"的视觉误导，报告里谨慎使用。',
      ],
      related: ['subplots', '标题图例'],
      tags: ['双轴', '对比'],
    },
  ],
});

MODULES.push({
  id: 'seaborn', name: 'seaborn', icon: '🎨', category: '数据可视化',
  doc: 'https://seaborn.pydata.org/',
  desc: '基于 matplotlib 的统计可视化库：更少的代码画出更好看的统计图。',
  install: 'pip install seaborn',
  aliases: ['seaborns', 'sns'],
  tips: [
    '约定 <code>import seaborn as sns</code>；seaborn 的图可以直接当 matplotlib 对象继续加工（plt.title / plt.savefig 照用）。',
    '统计图函数分三族：relplot（关系）、displot（分布）、catplot（类别）；xxxplot 是不带分面的底层版。',
  ],
  entries: [
    {
      name: 'set_theme', sig: "sns.set_theme(style='whitegrid', palette='deep', font='SimHei')",
      brief: '一键设置全局主题风格，通常在脚本开头调用一次。',
      params: [
        { n: 'style', t: 'str', d: "'darkgrid' / 'whitegrid' / 'dark' / 'white' / 'ticks'" },
        { n: 'palette', t: 'str', d: '调色板：deep, muted, pastel, Set2, husl...' },
      ],
      examples: [
        { title: '', code: `import seaborn as sns\nimport matplotlib.pyplot as plt\nsns.set_theme(style='whitegrid')\nplt.rcParams['font.sans-serif'] = ['SimHei']   # 中文仍要自己设\nplt.rcParams['axes.unicode_minus'] = False` },
      ],
      pitfalls: [
        '<code>sns.set()</code> 是它的快捷别名；一旦调用会覆盖之前的 matplotlib rcParams，顺序放在最前面。',
        '中文依旧要 plt.rcParams 设置字体，seaborn 不负责中文。',
      ],
      related: ['relplot', 'heatmap'],
      tags: ['主题', '样式', '美化'],
    },
    {
      name: 'relplot', thumb: 'scatterline', sig: "sns.relplot(data=df, x=, y=, hue=, size=, style=, kind='scatter'/'line', col=, row=)",
      brief: '关系图：两变量关系 + 用颜色/大小/形状/分面编码更多维度。',
      params: [
        { n: 'hue', t: '列名', d: '按该列着色（分类或数值）' },
        { n: 'size', t: '列名', d: '按该列改变点大小' },
        { n: 'col / row', t: '列名', d: '按该列拆成多个子图（分面）' },
        { n: 'kind', t: 'str', d: "'scatter' 散点 / 'line' 折线(line 会自动聚合+置信带)", dflt: "'scatter'" },
      ],
      examples: [
        { title: '', code: `import seaborn as sns\nsns.relplot(data=df, x='广告投入', y='销量',\n            hue='渠道', style='渠道', col='季度')\n# 折线趋势 + 置信区间:\nsns.relplot(data=df, x='月份', y='销量', kind='line', hue='城市')` },
      ],
      pitfalls: [
        '<code>relplot</code> 返回 FacetGrid，与 plt 交互时用 <code>g.figure</code>；只画单图更简单的直接用 <code>sns.scatterplot / lineplot</code>（返回普通 ax）。',
        'lineplot 对重复 x 会自动聚合画均值带置信区间 —— 看到的不是原始数据！要去掉传 errorbar=None。',
      ],
      related: ['heatmap', 'displot'],
      tags: ['散点', '折线', '关系'],
    },
    {
      name: 'displot', thumb: 'hist', sig: "sns.displot(data=df, x=, hue=, kind='hist'/'kde'/'ecdf', bins=30, kde=True)",
      brief: '分布图：直方图、核密度曲线及其组合。',
      examples: [
        { title: '', code: `sns.displot(data=df, x='年龄', hue='性别', kde=True, bins=30)\n# 只叠加一条密度曲线:\nsns.kdeplot(data=df, x='收入', fill=True)\n# 二维联合分布:\nsns.jointplot(data=df, x='年龄', y='收入', kind='scatter')` },
      ],
      pitfalls: [
        'displot 是 figure 级（返回 FacetGrid），plt.tight_layout() 对它无效，用 <code>g.tight_layout()</code>。',
        'kde 曲线可能画出负值区域（核平滑副作用），数据非负时注意解释。',
      ],
      related: ['relplot', 'catplot'],
      tags: ['分布', '直方图', '密度'],
    },
    {
      name: 'catplot', thumb: 'box', sig: "sns.catplot(data=df, x=, y=, hue=, kind='box'/'violin'/'bar'/'count'/'strip', col=)",
      brief: '类别图一族：箱线、小提琴、计数、条形等，按 kind 切换。',
      examples: [
        { title: '', code: `sns.catplot(data=df, x='城市', y='金额', kind='box')     # 箱线: 看分布+离群点\nsns.catplot(data=df, x='城市', kind='count')             # 计数柱状\nsns.catplot(data=df, x='城市', y='金额', kind='bar')     # 均值+置信区间\nplt.xticks(rotation=30)   # 类别名太长时斜着放` },
      ],
      pitfalls: [
        '<b>sns.barplot 画的是均值±置信区间，不是计数！</b>要计数用 countplot —— 最常见的误用。',
        'boxplot 的"须"外点才是离群值，箱体是四分位距；想并排看分布形状用 violin。',
      ],
      related: ['displot', 'heatmap'],
      tags: ['箱线图', '类别', '计数'],
    },
    {
      name: 'heatmap', thumb: 'heatmap', sig: "sns.heatmap(data, annot=True, fmt='.2f', cmap='RdBu_r', vmin=, vmax=, center=0)",
      brief: '热力图：矩阵数据可视化，相关系数矩阵的标配画法。',
      examples: [
        { title: '相关系数矩阵', code: `import seaborn as sns\nimport matplotlib.pyplot as plt\ncorr = df[['年龄', '收入', '消费']].corr()\nsns.heatmap(corr, annot=True, fmt='.2f', cmap='RdBu_r', vmin=-1, vmax=1, center=0)\nplt.title('相关性矩阵')\nplt.show()` },
      ],
      pitfalls: [
        '相关矩阵必须 <code>vmin=-1, vmax=1, center=0</code>，否则颜色映射不对称、视觉误导。',
        '<code>annot=True</code> 才显示数值，<code>fmt=".2f"</code> 控制小数位；数值很长时 fmt=".1f"。',
        '热力图吃的是<b>矩阵</b>（DataFrame 即可），传原始长表要先 pivot。',
      ],
      related: ['catplot', 'set_theme'],
      tags: ['热力图', '相关性', '矩阵'],
    },
    {
      name: 'pairplot', thumb: 'grid', sig: 'sns.pairplot(df, hue=None, vars=None, diag_kind="kde")',
      brief: '多变量两两关系总览：对角线是分布，非对角是两两散点。',
      examples: [
        { title: '', code: `sns.pairplot(df[['年龄', '收入', '消费', '类别']], hue='类别')\nplt.show()` },
      ],
      pitfalls: [
        '变量一多图巨大且慢，用 <code>vars=[...]</code> 只挑关心的列（一般 ≤6 列）。',
        '大数据量先抽样再画，否则渲染几十秒。',
      ],
      related: ['relplot', 'heatmap'],
      tags: ['多变量', '矩阵图', '探索'],
    },
    {
      name: '图尺寸与保存', sig: "plt.figure(figsize=(w, h)) / g.fig.set_size_inches(w, h) / plt.savefig()",
      brief: '控制 seaborn 图的大小和导出（figure 级与 axes 级 API 不同）。',
      examples: [
        { title: '', code: `# axes 级(scatterplot 等): 先建 figure\nplt.figure(figsize=(10, 5))\nsns.scatterplot(data=df, x='x', y='y')\nplt.savefig('a.png', dpi=300, bbox_inches='tight')\n\n# figure 级(relplot/displot/catplot): 用 height/aspect 或事后调\ng = sns.relplot(data=df, x='x', y='y', height=5, aspect=2)  # 宽=高*2\ng.savefig('b.png', dpi=300)` },
      ],
      pitfalls: [
        'relplot/displot/catplot 不吃 plt.figure 的 figsize，要用 <code>height + aspect</code> 参数。',
        '保存前 <code>plt.tight_layout()</code> 防标签被裁掉（FacetGrid 用 g.tight_layout()）。',
      ],
      related: ['set_theme', 'relplot'],
      tags: ['尺寸', '保存', '导出'],
    },
    {
      name: 'regplot-lmplot', thumb: 'scatterline', sig: "sns.regplot(data=df, x=, y=, order=2, ci=95) / sns.lmplot(col=, hue=)",
      brief: '回归关系图：散点+拟合线+置信带一步到位。',
      examples: [
        { title: '', code: `sns.regplot(data=df, x='温度', y='强度',
            order=2,                        # 二项式拟合
            ci=95,                          # 置信带
            scatter_kws={'s': 15, 'alpha': 0.5},
            line_kws={'color': 'red'})

# 需要分面/着色时用 lmplot(figure级):
sns.lmplot(data=df, x='温度', y='强度', hue='材料', col='批次')` },
      ],
      pitfalls: [
        '<b>regplot 是 axes 级、lmplot 是 figure 级</b>：分面(hue/col)只有 lmplot 支持，返回对象类型也不同。',
        '关系明显非线性时加 order=2/3 或 lowess=True，否则直线拟合误导。',
      ],
      related: ['relplot', 'displot'],
      tags: ['回归', '拟合', '相关'],
    },
    {
      name: 'jointplot', thumb: 'joint', sig: "sns.jointplot(data=df, x=, y=, kind='scatter'/'kde'/'hex'/'reg')",
      brief: '联合分布图：主图 + 边缘分布（直方/密度）三合一。',
      examples: [
        { title: '', code: `sns.jointplot(data=df, x='年龄', y='收入', kind='hex', height=6)
# kind: scatter(默认) / kde(密度) / hex / reg / hist
plt.show()` },
      ],
      pitfalls: [
        'jointplot 返回 JointGrid，plt.title 直接设不上：用 <code>g.figure.suptitle("标题")</code>。',
        '大数据量 kind="hex"/"kde" 比默认 scatter 可读。',
      ],
      related: ['displot', 'pairplot'],
      tags: ['联合分布', '边缘分布'],
    },
    {
      name: 'strip-swarm', thumb: 'dotrows', sig: 'sns.stripplot(data=df, x=, y=, jitter=0.2) / sns.swarmplot(...)',
      brief: '类别散点：展示每组原始数据点，与箱线图叠加效果最佳。',
      examples: [
        { title: '箱线图 + 原始点叠加', code: `sns.boxplot(data=df, x='城市', y='金额', showfliers=False, width=0.4)
sns.stripplot(data=df, x='城市', y='金额',
              color='0.3', size=3, alpha=0.5)   # 叠加原始点
plt.show()

# swarmplot 自动避让不重叠(样本多时慢):
sns.swarmplot(data=df, x='城市', y='金额', size=3)` },
      ],
      pitfalls: [
        'axes 级 API 连续调用画在同一张图上即可叠加。',
        '<b>swarmplot 样本上万会非常慢</b>，大数据用 stripplot。',
      ],
      related: ['catplot'],
      tags: ['散点', '类别', '叠加'],
    },
  ],
});

MODULES.push({
  id: 'pyecharts', name: 'pyecharts', icon: '🌏', category: '数据可视化',
  doc: 'https://pyecharts.org/#/',
  desc: '生成 ECharts 交互式图表（HTML）：悬停提示、缩放、动画，做报表大屏常用。',
  install: 'pip install pyecharts',
  tips: [
    '产出的 <code>render("xx.html")</code> 用浏览器打开即可交互；嵌网页/发给别人就是这个 html 文件。',
    'v1 与 v2 的 API 差异大，网上的旧代码报 import 错误多半是版本问题；本字典基于 v2.x。',
  ],
  entries: [
    {
      name: 'Bar', thumb: 'bar', sig: 'Bar(init_opts=opts.InitOpts(width="900px", theme=ThemeType.LIGHT))',
      brief: '柱状图三步走：add_xaxis → add_yaxis → set_global_opts → render。',
      examples: [
        { title: '标准模板', code: `from pyecharts.charts import Bar\nfrom pyecharts import options as opts\n\nbar = (\n    Bar()\n    .add_xaxis(['北京', '上海', '广州'])\n    .add_yaxis('销售额', [320, 410, 280])\n    .set_global_opts(\n        title_opts=opts.TitleOpts(title='各城市销售额'),\n        tooltip_opts=opts.TooltipOpts(trigger='axis'),\n    )\n)\nbar.render('bar.html')   # 浏览器打开` },
      ],
      pitfalls: [
        '<code>add_yaxis</code> 的数据是<b>纯数值列表</b>；而 Pie 要的是 [["名", 值]] 元组列表，两者格式不同最易混。',
        '链式调用最后别忘了 render()；render() 返回文件路径，print 出来确认。',
        '图空白：多半是没装对应渲染依赖或 html 被 CSP 拦截，先单独打开 html 测试。',
      ],
      related: ['Line-Pie', 'set_global_opts'],
      tags: ['柱状图', 'echarts', '交互'],
    },
    {
      name: 'Line-Pie', thumb: 'line', sig: "Line().add_yaxis(series_name, y, is_smooth=True) / Pie().add(series, [(名,值), ...])",
      brief: '折线图与饼图；饼图数据格式与柱状图不同。',
      examples: [
        { title: '', code: `from pyecharts.charts import Line, Pie\nfrom pyecharts import options as opts\n\nline = (\n    Line()\n    .add_xaxis(['1月', '2月', '3月'])\n    .add_yaxis('销量', [120, 200, 150], is_smooth=True)\n    .set_global_opts(title_opts=opts.TitleOpts(title='月度趋势'))\n)\nline.render('line.html')\n\npie = (\n    Pie()\n    .add('', [('北京', 320), ('上海', 410), ('广州', 280)])   # 元组列表!\n    .set_global_opts(title_opts=opts.TitleOpts(title='占比'))\n    .set_series_opts(label_opts=opts.LabelOpts(formatter='{b}: {d}%'))\n)\npie.render('pie.html')` },
      ],
      pitfalls: [
        '<b>Pie 不用 add_xaxis</b>，直接 add("", [(名称, 数值), ...])；格式给错图就是空的。',
        '饼图 label 的 <code>{d}%</code> 是百分比、<code>{c}</code> 是数值、<code>{b}</code> 是名称，formatter 记这三个。',
      ],
      related: ['Bar', '组合图'],
      tags: ['折线图', '饼图'],
    },
    {
      name: 'set_global_opts', sig: 'set_global_opts(title_opts=, legend_opts=, tooltip_opts=, datazoom_opts=, visualmap_opts=, xaxis_opts=, yaxis_opts=)',
      brief: '全局配置入口：标题、图例、提示框、缩放条、视觉映射都在这里。',
      examples: [
        { title: '常用配置合集', code: `from pyecharts import options as opts\nbar.set_global_opts(\n    title_opts=opts.TitleOpts(title='主标题', subtitle='副标题', pos_left='center'),\n    legend_opts=opts.LegendOpts(pos_top='30'),\n    tooltip_opts=opts.TooltipOpts(trigger='axis', axis_pointer_type='cross'),\n    datazoom_opts=[opts.DataZoomOpts(type_='inside'),      # 滚轮缩放\n                   opts.DataZoomOpts(type_='slider')],     # 底部滑条\n    xaxis_opts=opts.AxisOpts(name='城市', axislabel_opts=opts.LabelOpts(rotate=30)),\n    yaxis_opts=opts.AxisOpts(name='销售额(万)'),\n)` },
      ],
      pitfalls: [
        'datazoom_opts / visualmap_opts 要传<b>列表</b>（可多个），其他 *_opts 传单个对象。',
        '参数名是 <code>type_</code> 带下划线（避开内置 type），写成 type= 会报错。',
      ],
      related: ['Bar', '组合图'],
      tags: ['配置', 'tooltip', '缩放'],
    },
    {
      name: '组合图', thumb: 'grid', sig: 'Overlap / Grid / Page / Tab / Timeline',
      brief: '多图组合：叠加双轴、网格排布、一页多图、时间轴轮播。',
      examples: [
        { title: '柱线叠加(双 y 轴)', code: `from pyecharts.charts import Bar, Line, Overlap, Page\n\nbar = Bar().add_xaxis(months).add_yaxis('销量', v1)\nline = Line().add_xaxis(months).add_yaxis('利润率', v2, yaxis_index=1)\nbar.extend_axis(yaxis=opts.AxisOpts(type_='value', name='利润率%'))\noverlap = Overlap(bar.add(line, yaxis_index=1))\n\npage = Page()\npage.add(overlap, pie)\npage.render('report.html')      # 一页多图` },
      ],
      pitfalls: [
        '双轴：主轴 0、<code>extend_axis</code> 加的是 1，对应系列的 yaxis_index 别写错。',
        'Page.add 接收<b>图表对象列表</b>；render 出的 html 很大是因为每张图都内嵌了 js，正常。',
      ],
      related: ['Bar', 'set_global_opts'],
      tags: ['双轴', '大屏', '多图'],
    },
    {
      name: '主题与截图', sig: "ThemeType.DARK / snapshot-selenium 导出图片",
      brief: '换配色主题；把交互图导出成 png 图片。',
      examples: [
        { title: '', code: `from pyecharts.globals import ThemeType\nbar = Bar(init_opts=opts.InitOpts(theme=ThemeType.DARK, width='1000px'))\n# 导出 png 需要浏览器内核: pip install snapshot-selenium\nfrom pyecharts.render import make_snapshot\nfrom snapshot_selenium import snapshot\nmake_snapshot(snapshot, bar.render(), 'bar.png')` },
      ],
      pitfalls: [
        '<code>ThemeType</code> 从 <code>pyecharts.globals</code> 导入，不是 options。',
        'make_snapshot 依赖已安装的浏览器（selenium），服务器无浏览器时改用 snapshot-phantomjs 或干脆发 html。',
      ],
      related: ['Bar'],
      tags: ['主题', '暗色', '截图'],
    },
    {
      name: 'Scatter', thumb: 'scatter', sig: "Scatter().add_yaxis('系列', [[x, y], ...], symbol_size=10) / EffectScatter 涟漪特效",
      brief: '散点图与涟漪特效散点。',
      examples: [
        { title: '', code: `from pyecharts.charts import Scatter, EffectScatter\nfrom pyecharts import options as opts\n\nscatter = (\n    Scatter()\n    .add_xaxis([80, 95, 110])                       # x 数值\n    .add_yaxis('价格-销量', [[80, 120], [95, 140], [110, 180]],\n               symbol_size=12)\n    .set_global_opts(\n        title_opts=opts.TitleOpts(title='价格-销量'),\n        xaxis_opts=opts.AxisOpts(type_='value'),     # x 当数值轴!\n    )\n)\nscatter.render('scatter.html')\n\n# 涟漪特效(动态强调某几个点):\nEffectScatter().add_xaxis(['A', 'B']).add_yaxis('', [[1, 5], [2, 8]]).render('fx.html')` },
      ],
      pitfalls: [
        'Scatter 的系列数据是 <b>[x, y] 坐标对</b>，与 Bar/Line 的纯数值列表不同；x 想当数值轴必须 <code>xaxis_opts=AxisOpts(type_="value")</code>，否则按类目轴处理。',
      ],
      related: ['Bar', 'Line-Pie'],
      tags: ['散点图', '特效'],
    },
    {
      name: 'Map-Geo', thumb: 'map', sig: "Map().add('系列', [('广东', 120), ...], 'china') / Geo().add('', [(名称, 经度, 纬度), ...])",
      brief: '地图：省份填色分布（Map）与经纬度打点/飞线（Geo）。',
      examples: [
        { title: '省份分布图', code: `from pyecharts.charts import Map\nfrom pyecharts import options as opts\n\nprov = [('广东', 320), ('浙江', 280), ('四川', 150), ('北京', 190)]\n(\n    Map()\n    .add('销售额(万)', prov, 'china')\n    .set_global_opts(\n        title_opts=opts.TitleOpts(title='全国分布'),\n        visualmap_opts=opts.VisualMapOpts(max_=400),   # 左侧颜色条\n    )\n    .render('map.html')\n)` },
        { title: '城市坐标点(Geo)', code: `from pyecharts.charts import Geo\nfrom pyecharts.globals import ChartType\n\n(\n    Geo().add_schema(maptype='china')\n    .add('', [('广州', 113.26, 23.13), ('上海', 121.47, 31.23)],\n         type_=ChartType.EFFECT_SCATTER)\n    .render('geo.html')   # 城市名查不到坐标会报错, 用 add_coordinate 自定义\n)` },
      ],
      pitfalls: [
        '省份名要匹配内置字典（一般用简称如 "广东"、"内蒙古"，不带"省"字），<b>匹配不上的数据会被静默丢弃</b>，图上少省份先改名试。',
        'Geo 报 "坐标不存在"：城市名查不到经纬度，用 <code>geo.add_coordinate(名称, 经度, 纬度)</code> 注册。',
        'visualmap 的 max_ 要略大于数据最大值，默认区间可能让所有省份一个颜色。',
      ],
      related: ['set_global_opts', 'Bar'],
      tags: ['地图', 'geo', '分布'],
    },
    {
      name: 'WordCloud', thumb: 'wcloud', sig: "WordCloud().add('', [('词', 频次), ...], word_size_range=[14, 66])",
      brief: '交互式词云图（pyecharts 内置；要出静态 png 用 wordcloud 库）。',
      examples: [
        { title: '', code: `from pyecharts.charts import WordCloud\n\nwords = [('数据分析', 1200), ('python', 980), ('爬虫', 760), ('可视化', 610)]\n(\n    WordCloud()\n    .add('', words, word_size_range=[14, 66], shape='circle')\n    .render('cloud.html')\n)` },
      ],
      pitfalls: [
        '数据必须是 <b>[(词, 数值)] 列表</b>；中文长文本先过 jieba 分词再 Counter 计数。',
        'pyecharts 版只能产出 html；导出图片见「数据可视化」分类下的 wordcloud 库。',
      ],
      related: ['Bar'],
      tags: ['词云', '文本'],
    },
    {
      name: '常见问题', sig: '渲染空白 / notebook 不显示 / 三种数据格式',
      brief: 'pyecharts 高频问题排查清单。',
      examples: [
        { title: '', code: `# 1. html 打开空白: 换浏览器试; 确认打开的就是 render() 返回的路径\n\n# 2. Notebook 里不显示: 用 render_notebook()\nbar.render_notebook()\n\n# 3. 三种数据格式别混:\n#    Bar/Line:  add_xaxis(类目列表) + add_yaxis(纯数值列表)\n#    Pie/词云:  [(名称, 数值), ...]\n#    Scatter:   [[x, y], ...] 坐标对\n\n# 4. 只生成命令不渲染, 检查配置:\nprint(bar.dump_options()[:200])` },
      ],
      pitfalls: [
        'render() 不传文件名默认覆盖写当前目录 render.html —— 多图互相覆盖时先检查这个。',
        '图很多时 html 有几 MB 是正常的（内嵌了 echarts.js），介意体积可配置 js_host 走 CDN。',
      ],
      related: ['Bar', '组合图'],
      tags: ['排查', 'faq'],
    },
    {
      name: 'Radar 雷达图', thumb: 'radar', sig: "radar.add_schema(schema=[opts.RadarIndicatorItem(name=, max_=)]) / radar.add('系列', [[值...]])",
      brief: '雷达图：多指标综合对比（性能/能力评估）。',
      examples: [
        { title: '', code: `from pyecharts.charts import Radar
from pyecharts import options as opts

schema = [opts.RadarIndicatorItem(name=n, max_=100)
          for n in ['灵敏度', '分辨率', '稳定性', '速度']]

radar = Radar()
radar.add_schema(schema=schema)
radar.add('样品1', [[85, 90, 70, 60]])
radar.add('样品2', [[70, 95, 80, 75]])
radar.set_series_opts(label_opts=opts.LabelOpts(is_show=False))
radar.set_global_opts(title_opts=opts.TitleOpts(title='性能对比'))
radar.render('radar.html')` },
      ],
      pitfalls: [
        '数据是<b>嵌套列表</b>（每个系列一个值列表），顺序对应 schema 的指标顺序。',
        '每个指标的 max_ 要合理设置，否则图形全贴边或全挤在中心。',
      ],
      related: ['Bar', 'set_global_opts'],
      tags: ['雷达图', '对比'],
    },
    {
      name: 'Funnel-Gauge', thumb: 'funnel', sig: "Funnel().add('转化', [('访问', 1000), ...]) / Gauge().add('', [('完成率', 66)])",
      brief: '漏斗图（流程转化）与仪表盘（单个 KPI）。',
      examples: [
        { title: '', code: `from pyecharts.charts import Funnel, Gauge
from pyecharts import options as opts

(
    Funnel()
    .add('转化', [('访问', 1000), ('注册', 420), ('下单', 130), ('复购', 45)],
         sort_='descending')
    .set_global_opts(title_opts=opts.TitleOpts(title='转化漏斗'))
    .render('funnel.html')
)

(
    Gauge()
    .add('完成率', [('进度', 66)])
    .set_global_opts(title_opts=opts.TitleOpts(title='年度目标'))
    .render('gauge.html')
)` },
      ],
      pitfalls: [
        '漏斗图数据顺序决定层级，配合 <code>sort_</code> 参数控制大小端方向。',
        'Gauge 默认量程 0-100，其他范围要在配置里显式给出。',
      ],
      related: ['Bar', 'Line-Pie'],
      tags: ['漏斗图', '仪表盘', 'kpi'],
    },
    {
      name: 'HeatMap', thumb: 'heatmap', sig: "HeatMap().add_yaxis('系列', y类目, [[x索引, y索引, 值], ...])",
      brief: '热力图：类目×类目的强度矩阵（如 小时×星期 的访问量）。',
      examples: [
        { title: '', code: `from pyecharts.charts import HeatMap
from pyecharts import options as opts
import random

data = [[i, j, random.randint(0, 100)] for i in range(24) for j in range(7)]
(
    HeatMap()
    .add_xaxis([f'{h}时' for h in range(24)])
    .add_yaxis('访问量', ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], data)
    .set_global_opts(
        visualmap_opts=opts.VisualMapOpts(max_=100),   # 必配, 颜色映射
        title_opts=opts.TitleOpts(title='时段热度'))
    .render('heat.html')
)` },
      ],
      pitfalls: [
        '<b>数据点的坐标是类目索引</b>不是真实值：[3, 5, 88] 表示 x 轴第 3 类、y 轴第 5 类、值 88。',
        'visualmap 不设 max_ 的话颜色映射可能失真，务必显式给出。',
      ],
      related: ['set_global_opts', 'Map-Geo'],
      tags: ['热力图', '矩阵'],
    },
  ],
});

MODULES.push({
  id: 'wordcloud', name: 'wordcloud', icon: '☁️', category: '数据可视化',
  doc: 'https://amueller.github.io/word_cloud/',
  desc: '生成静态词云图片（png），配合 jieba 分词做文本可视化。',
  install: 'pip install wordcloud jieba pillow',
  aliases: ['词云'],
  tips: [
    '<b>中文必须指定字体</b>：<code>font_path=r"C:\\Windows\\Fonts\\msyh.ttc"</code>（微软雅黑），否则全部显示方块。',
    '它只负责"把词频画成词云"：英文整段文本可直接扔进去；中文要先分词（jieba）。',
  ],
  entries: [
    {
      name: 'generate', thumb: 'wcloud', sig: "WordCloud(font_path=, width=800, height=400, background_color='white').generate(text).to_file('cloud.png')",
      brief: '从整段文本生成词云图片。',
      params: [
        { n: 'font_path', t: 'str', d: '字体文件路径，<b>中文必填</b>' },
        { n: 'width / height', t: 'int', d: '画布像素（有 mask 时无效）' },
        { n: 'background_color', t: 'str', d: '背景色', dflt: "'black'" },
        { n: 'max_words / stopwords', t: '-', d: '最多词数 / 停用词集合' },
        { n: 'collocations', t: 'bool', d: 'False 关闭英文双词搭配统计', dflt: 'True' },
      ],
      examples: [
        { title: '英文一键生成', code: `from wordcloud import WordCloud\n\ntext = open('article.txt', encoding='utf-8').read()\nwc = WordCloud(width=800, height=400, background_color='white',\n               max_words=100, collocations=False).generate(text)\nwc.to_file('cloud.png')\n\n# 配合 matplotlib 显示:\nimport matplotlib.pyplot as plt\nplt.imshow(wc, interpolation='bilinear')\nplt.axis('off')\nplt.show()` },
      ],
      pitfalls: [
        '<code>collocations=True</code>（默认）会让英文词云出现 "New York" 这类搭配并影响词频，做纯词频图建议关掉。',
        'generate 吃的是"空格分隔的词"，中文整段扔进去只会得到一坨大方块 —— 见 jieba分词 条目。',
      ],
      related: ['jieba分词', '词频生成'],
      tags: ['词云', '文本', '图片'],
    },
    {
      name: 'jieba分词', sig: "import jieba / jieba.lcut(text) / ' '.join(jieba.cut(text))",
      brief: '中文词云标准流程：jieba 分词（另一个库）→ 过滤停用词 → 生成。',
      examples: [
        { title: '中文词云完整流程', code: `import jieba\nfrom wordcloud import WordCloud\n\ntext = open('评论.txt', encoding='utf-8').read()\nwords = jieba.lcut(text)                    # 切成词列表\n\nstopwords = set(['的', '了', '是', '我', '你', '也', '就'])\nwords = [w for w in words if len(w) > 1 and w not in stopwords]\n\nwc = WordCloud(font_path=r'C:\\Windows\\Fonts\\msyh.ttc',\n               width=800, height=400,\n               background_color='white').generate(' '.join(words))\nwc.to_file('中文词云.png')` },
      ],
      pitfalls: [
        '<b>font_path 是 wordcloud 的参数不是 jieba 的</b>，中文不出方块靠它；Windows 常用 msyh.ttc（雅黑）/ simhei.ttf（黑体）。',
        '停用词要自己维护（的/了/是…），不过滤的话词云全是最没信息量的虚词。',
        '产品名、人名被切碎时加词库：<code>jieba.add_word("某某功能")</code>。',
      ],
      related: ['generate', '词频生成'],
      tags: ['jieba', '分词', '中文'],
    },
    {
      name: '词频生成', thumb: 'wcloud', sig: 'WordCloud().generate_from_frequencies(freq_dict) / mask= 形状 / to_array()',
      brief: '直接从 {词: 频次} 字典生成（跳过分词），以及用图片轮廓做词云形状。',
      examples: [
        { title: '', code: `from wordcloud import WordCloud\nfrom PIL import Image\nimport numpy as np\n\nfreq = {'python': 300, 'pandas': 210, '爬虫': 180, '机器学习': 150}\n\n# 图片轮廓形状(mask 中纯白区域不显示词):\nmask = np.array(Image.open('heart.png'))\nwc = WordCloud(font_path=r'C:\\Windows\\Fonts\\msyh.ttc',\n               mask=mask, background_color='white',\n               contour_width=1).generate_from_frequencies(freq)\n\nwc.to_file('shaped.png')\narr = wc.to_array()      # numpy 数组, 可交给 plt.imshow` },
      ],
      pitfalls: [
        '<b>mask 的纯白 (255,255,255) 区域不写字</b>：想让整张图都有词，把背景色改成白色以外的。',
        'mask 图片尺寸决定词云尺寸，此时 width/height 参数不生效。',
        '已有 Counter 统计结果直接传进去即可（本质就是 dict）。',
      ],
      related: ['generate', 'jieba分词'],
      tags: ['词频', 'mask', '形状'],
    },
  ],
});
