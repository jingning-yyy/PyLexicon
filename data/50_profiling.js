/* ydata-profiling：一键 DataFrame 探索报告 */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'profiling', name: 'ydata-profiling', icon: '🗒️', category: '数据处理',
  doc: 'https://docs.profiling.ydata.ai/',
  desc: '一行代码把 DataFrame 变成一份 HTML 探索报告：每列分布、缺失、相关性、告警全在里面；拿到新数据先跑一份再看。',
  install: 'pip install ydata-profiling',
  pkg: 'ydata-profiling',
  aliases: ['pandas-profiling', 'eda', '数据探索', '报告'],
  tips: [
    '工作流：拿到新 CSV → 先 <code>ProfileReport(df).to_file()</code> 看一眼，再用 describe/value_counts 深挖——方向感立省半小时。',
    '它是"自动体检"不是"自动分析"：告警（高缺失/高相关/常量列）只是线索，结论还要人来下。',
  ],
  entries: [
    {
      name: '一键报告', sig: "from ydata_profiling import ProfileReport / ProfileReport(df, title=...).to_file('report.html')",
      brief: '三行生成完整 EDA 报告，浏览器打开。',
      examples: [
        { title: '', code: `import pandas as pd\nfrom ydata_profiling import ProfileReport\n\ndf = pd.read_csv('samples.csv')\n\nprofile = ProfileReport(df, title='样品数据体检')\nprofile.to_file('report.html')      # 输出 HTML, 浏览器直接打开\n\n# Jupyter 里也可以: 直接把 profile 放最后一行内嵌显示` },
      ],
      pitfalls: [
        '<b>大 DataFrame（几十万行起）默认模式会跑很久</b>甚至内存吃紧：先 <code>df.sample(20000)</code> 或用 minimal 模式。',
        '首次运行要装一堆依赖（比一般包重），报缺依赖照提示 pip 装齐即可。',
        '旧名 pandas-profiling 已停止维护，新项目一律 <code>pip install ydata-profiling</code>。',
      ],
      related: ['minimal加速'],
      tags: ['eda', '报告', '探索'],
    },
    {
      name: 'minimal加速', sig: "ProfileReport(df, minimal=True) / explorative 模式与 correlations 配置",
      brief: '大数据量提速：精简模式与关闭昂贵计算。',
      examples: [
        { title: '', code: `from ydata_profiling import ProfileReport\n\n# 十万行以上用精简模式(跳过相关性/重复行等重计算):\nprofile = ProfileReport(df, minimal=True)\nprofile.to_file('fast.html')\n\n# 默认模式下只关掉部分昂贵计算:\nprofile = ProfileReport(\n    df,\n    correlations={'auto': {'calculate': False},\n                  'spearman': {'calculate': False}},\n    interactions={'continuous': False},\n)` },
      ],
      pitfalls: [
        'minimal 模式<b>没有相关性矩阵和交互散点</b>，这两块恰是找特征关系的——小数据还是用完整模式。',
        '文本列多、唯一值多的列计算最贵（要算 n^2 对比），能先删掉无用列再 profile 就删。',
      ],
      related: ['一键报告'],
      tags: ['提速', 'minimal', '大数据'],
    },
    {
      name: '看报告', sig: 'Overview / Warnings / Variables / Interactions 四大区块',
      brief: '报告怎么读：先看告警，再看每列详情。',
      examples: [
        { title: '', code: `# 打开 report.html 后按这个顺序看:\n# 1) Overview: 行列数/缺失率总览/重复行数 —— 数据"底子"如何\n# 2) Warnings(重点!):\n#    high cardinality  唯一值过多(可能是 ID 列, 当特征前先想)\n#    high correlation  两列高度相关(特征冗余, 二选一)\n#    many zeros / missing  分布异常, 影响建模\n#    constant          常量列, 直接删\n# 3) Variables: 点开单列看分布直方图/统计量\n# 4) Interactions: 两列数值散点交互` },
      ],
      pitfalls: [
        '报告里<b>只有统计结果没有原始数据</b>（脱敏安全），可以直接发同事/存档。',
        'high correlation 警告的阈值是 |r|>0.9 左右，临界情况自己再用 df.corr 复核。',
        '报告是快照：数据更新后要重新生成，别拿旧报告当现状。',
      ],
      related: ['一键报告', 'minimal加速'],
      tags: ['读报告', '告警', '相关性'],
    },
  ],
});
