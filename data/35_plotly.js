/* plotly：交互式图表（悬停/缩放/拖动） */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'plotly', name: 'plotly', icon: '✨', category: '数据可视化',
  doc: 'https://plotly.com/python/',
  desc: '交互式图表：悬停看值、框选缩放、导出可点击的 HTML；仪表盘(streamlit/gradio)里嵌图首选之一。',
  install: 'pip install plotly',
  aliases: ['交互图', 'express', 'px', '悬停'],
  tips: [
    '与 matplotlib/pyecharts 的分工：论文/报告静态图用 matplotlib，网页交互图 plotly 与 pyecharts 二选一。',
    '上手路径：<b>plotly.express</b>(一行一图，吃 DataFrame) → 不够用时再下探 go.Figure 底层接口。',
  ],
  entries: [
    {
      name: 'express', sig: "import plotly.express as px / px.scatter(df, x=, y=, color=, size=) / fig.show()",
      brief: 'express 快速作图：一行出交互散点/折线/柱状。',
      examples: [
        { title: '', code: `import plotly.express as px\n\nfig = px.scatter(df,\n    x='energy', y='counts',\n    color='sample',            # 按该列自动分组配色\n    size='sigma',              # 点大小映射\n    hover_data=['单位'],        # 悬停额外显示的列\n    log_y=True,                # 对数轴\n    template='plotly_white')   # 白底简洁主题\nfig.show()                       # 浏览器打开, 可缩放/框选/导出 PNG` },
      ],
      pitfalls: [
        'express 吃的是<b>长表</b>(tidy)格式：一行一个点、分组靠 color 列，宽表先 melt。',
        '数据量大(几十万点)交互会卡：先降采样，或 <code>px.scatter(..., render_mode="webgl")</code> 走 GPU 绘制。',
      ],
      related: ['layout', '导出'],
      tags: ['交互图', '散点', 'express'],
    },
    {
      name: 'layout', sig: "fig.update_layout(title=, xaxis_title=, legend=) / fig.update_traces(...)",
      brief: '布局与细节调整：标题轴、图例位置、字体。',
      examples: [
        { title: '', code: `fig.update_layout(\n    title='XRF 谱图对比',\n    xaxis_title='能量 (keV)', yaxis_title='计数',\n    legend=dict(orientation='h', y=1.08),      # 图例横排放顶部\n    font=dict(size=14, family='Microsoft YaHei'),\n    width=900, height=450,\n    template='plotly_white',\n)\nfig.update_traces(marker=dict(opacity=0.7, line=dict(width=0.5)))\nfig.update_xaxes(range=[0, 25])                # 固定坐标范围` },
      ],
      pitfalls: [
        'update_layout 改"整图布局"，update_traces 改"数据点/线条样式"，改不生效先确认改的是哪一层。',
        '导出 PNG 时中文变方块是字体问题：给 font.family 指定系统已有的中文字体；HTML 交互无此问题。',
      ],
      related: ['express'],
      tags: ['布局', '图例', '主题'],
    },
    {
      name: '导出', sig: "fig.write_html('fig.html') / fig.write_image('fig.png', scale=2) / fig.to_json()",
      brief: '导出：自带交互的 HTML(零依赖)、静态图(需 kaleido)。',
      examples: [
        { title: '', code: `fig.write_html('fig.html', include_plotlyjs='cdn')   # 交互 HTML, 引用在线 js 体积小\n# include_plotlyjs=True 则内嵌完整库(约 3MB), 离线可用\n\nfig.write_image('fig.png', scale=2)                  # 静态图, 先: pip install kaleido\nfig.write_image('fig.pdf')                           # 矢量 PDF, 论文可用\n\ns = fig.to_json()                                    # 前端/存库用` },
      ],
      pitfalls: [
        '<code>write_image</code> 报错九成是没装 <b>kaleido</b>：<code>pip install kaleido</code>。',
        'write_html 默认把数据和 plotly.js 全嵌进去，文件好几 MB：发给网页用 <b>include_plotlyjs="cdn"</b>，离线场景才内嵌。',
        'fig.show() 在 PyCharm/Spyder 里可能弹不出来：改用 write_html 后自己开，或 fig.show(renderer="browser")。',
      ],
      related: ['express', 'layout'],
      tags: ['导出', 'HTML', 'kaleido'],
    },
  ],
});
