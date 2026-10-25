/* Web 与页面：flask / jinja2 / streamlit / gradio */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'flask', name: 'flask', icon: '🧪', category: 'Web 与页面',
  doc: 'https://flask.palletsprojects.com/',
  desc: '轻量 Web 框架：把 Python 函数变成网页和接口，给工具套个浏览器界面最常用的选择。',
  install: 'pip install flask',
  aliases: ['网页', '后端', '接口'],
  tips: [
    '<code>debug=True</code> 只用于开发：代码改动自动重载、出错有网页调试器；<b>生产环境千万别开</b>。',
    'Flask 自带服务器只适合本机用；真正部署用 gunicorn/waitress（Windows 用 waitress）。',
  ],
  entries: [
    {
      name: '最小应用', sig: "Flask(__name__) / @app.route('/') / app.run(debug=True)",
      brief: '十几行起一个网站。',
      examples: [
        { title: 'hello.py', code: `from flask import Flask\n\napp = Flask(__name__)\n\n@app.route('/')\ndef index():\n    return '你好，这是首页'\n\nif __name__ == '__main__':\n    app.run(debug=True, port=5000)\n# 运行: python hello.py, 浏览器打开 http://127.0.0.1:5000` },
      ],
      pitfalls: [
        '<b>必须写在 if __name__ == "__main__": 里再 app.run()</b>，否则被 pyinstaller 等工具导入时直接起服务。',
        '端口被占用报 OSError，换个 port；想让局域网其他设备访问加 host="0.0.0.0"。',
        'debug=True 会暴露交互式调试器，等于把服务器送给攻击者。',
      ],
      related: ['路由与参数', 'render_template'],
      tags: ['启动', '路由', 'web'],
    },
    {
      name: '路由与参数', sig: "@app.route('/user/<int:uid>') / request.args.get('q')",
      brief: 'URL 路径参数与查询参数的取法。',
      examples: [
        { title: '', code: `from flask import Flask, request\n\n@app.route('/user/<int:uid>')          # 路径参数, 自动转 int\ndef user(uid):\n    return f'用户 {uid}'\n\n@app.route('/search')                   # /search?q=python&page=2\ndef search():\n    q = request.args.get('q', '')       # 查询参数(可能不存在, 用 get)\n    page = request.args.get('page', 1, type=int)\n    return f'搜索 {q} 第 {page} 页'` },
      ],
      pitfalls: [
        '路径参数写法是 <code>&lt;类型:名字&gt;</code>，类型有 int/float/string/path，不写默认 string。',
        '<code>request.args</code> 是查询串(?后面的)；POST 表单在 request.form，别混。',
        'args.get 取不到返回 None，直接用会报错，给默认值。',
      ],
      related: ['request', '最小应用'],
      tags: ['路由', '参数', 'get'],
    },
    {
      name: 'render_template', sig: "render_template('report.html', title='报表', rows=data)",
      brief: '渲染 templates 目录下的模板页（底层是 Jinja2）。',
      examples: [
        { title: '', code: `from flask import render_template\n# 项目结构: app.py 同级建 templates/report.html\n\n@app.route('/report')\ndef report():\n    return render_template('report.html',\n                           title='月度报表',\n                           rows=[('北京', 320), ('上海', 410)])\n\n# 模板里: <h1>{{ title }}</h1> {% for r in rows %} {{ r[0] }} {% endfor %}` },
      ],
      pitfalls: [
        '模板文件必须放在 <b>templates/ 目录</b>（和 app.py 同级），找不到就报 TemplateNotFound。',
        '直接返回 pandas 表格可以偷懒：<code>df.to_html()</code> 传进模板，或用 <code>df.to_html(classes="table")</code>。',
      ],
      related: ['request', '最小应用'],
      tags: ['模板', 'html', '页面'],
    },
    {
      name: 'request', sig: "request.form / request.json / request.files / request.method",
      brief: '取请求里的数据：表单、JSON、上传文件。',
      examples: [
        { title: '', code: `from flask import request\n\n@app.route('/submit', methods=['POST'])\ndef submit():\n    name = request.form.get('name')            # 表单字段\n    data = request.get_json(silent=True)       # JSON 请求体(取不到返回None)\n    f = request.files.get('file')              # 上传的文件\n    if f:\n        f.save('uploads/' + f.filename)\n    return '收到'` },
      ],
      pitfalls: [
        '默认只允许 GET，POST 接口要在路由里写 <code>methods=["POST"]</code>，否则 405。',
        '表单(form)与 JSON 是两种编码，前端传 json 后端用 form 取是空的。',
        '上传文件名不可信（可能带 ../），重命名后再存。',
      ],
      related: ['路由与参数', 'render_template'],
      tags: ['post', '表单', '上传', 'json'],
    },
    {
      name: '返回与jsonify', sig: 'return dict / return jsonify(...) / return ..., 404',
      brief: '返回页面、JSON 与状态码。',
      examples: [
        { title: '', code: `from flask import jsonify\n\n@app.route('/api/data')\ndef api():\n    return {'data': [1, 2, 3], 'ok': True}     # Flask 2.2+ dict 自动转 JSON\n\n@app.route('/api/old')\ndef old():\n    return jsonify(code=0, msg='ok')           # 老版本用 jsonify\n\n@app.route('/404test')\ndef notfound():\n    return '没有这个页面', 404                  # body + 状态码` },
      ],
      pitfalls: [
        '老版本 Flask 直接 return dict 报错，用 jsonify；返回带中文时 jsonify 默认转 \\u 转义（前端不受影响）。',
        '想 return df 直接给前端：先 <code>df.to_json(orient="records", force_ascii=False)</code>。',
      ],
      related: ['request'],
      tags: ['json', 'api', '返回'],
    },
    {
      name: 'url_for-static', sig: "url_for('static', filename='style.css') / 模板里 {{ url_for(...) }}",
      brief: '静态文件(CSS/JS/图片)引用与端点反转。',
      examples: [
        { title: '', code: `# 目录结构: app.py 同级建 static/ 和 templates/
from flask import Flask, render_template
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

# 模板里引用静态文件(不要手写 /static/ 绝对路径):
#   <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
#   <img src="{{ url_for('static', filename='logo.png') }}">` },
      ],
      pitfalls: [
        '静态文件必须放在 <b>static/ 目录</b>（与 templates/ 并列），url_for 才找得到。',
        '浏览器缓存旧 css：加版本参数 <code>url_for("static", filename="a.css", v=2)</code>。',
      ],
      related: ['render_template'],
      tags: ['静态文件', 'css'],
    },
  ],
});

MODULES.push({
  id: 'jinja2', name: 'jinja2', icon: '📄', category: 'Web 与页面',
  doc: 'https://jinja.palletsprojects.com/',
  desc: '模板引擎：HTML 里写占位符批量填充数据，Flask 的模板底层；单独用可批量生成 HTML 报告。',
  install: 'pip install jinja2  (装 flask 会自带)',
  aliases: ['模板', 'template'],
  entries: [
    {
      name: '基础渲染', sig: "Template('...').render(变量=值) / Environment(FileSystemLoader('tpl'))",
      brief: '把数据填进模板字符串/模板文件。',
      examples: [
        { title: '单次渲染(生成HTML报告)', code: `from jinja2 import Template\n\ntpl = Template('<h1>{{ title }}</h1><p>共 {{ n }} 条</p>', autoescape=True)\nhtml = tpl.render(title='月度报告', n=42)\nopen('report.html', 'w', encoding='utf-8').write(html)\n\n# 从目录读模板(可继承/包含):\nfrom jinja2 import Environment, FileSystemLoader\nenv = Environment(loader=FileSystemLoader('tpl'), autoescape=True)\nt = env.get_template('report.html')` },
      ],
      pitfalls: [
        '渲染 HTML 一律开 <code>autoescape=True</code>，否则数据里的 &lt;script&gt; 会被当标签执行（XSS）。',
        '模板文件编码存成 UTF-8，Windows 记事本另存注意。',
      ],
      related: ['模板语法', '模板继承'],
      tags: ['模板', 'html', '报告'],
    },
    {
      name: '模板语法', sig: '{{ 变量 }} / {% for x in xs %}{% endfor %} / {% if cond %} / {{ x | filter }}',
      brief: '变量、循环、判断、过滤器速查。',
      examples: [
        { title: '常用写法', code: `<table>\n{% for row in rows %}\n  <tr class="{{ loop.cycle('odd', 'even') }}">\n    <td>{{ loop.index }}</td>              {# 当前第几行, 从1开始 #}\n    <td>{{ row.name | upper }}</td>\n    <td>{{ row.price | round(2) }}</td>\n    <td>{{ row.note | default('无') }}</td>\n  </tr>\n{% else %}\n  <tr><td colspan="4">没有数据</td></tr>\n{% endfor %}\n</table>` },
      ],
      pitfalls: [
        '三种括号各司其职：<code>{{ }} 输出值</code>、<code>{% %} 逻辑</code>、<code>{# #} 注释</code>，混了直接报错。',
        '常用过滤器：default(缺省值)、round、upper/lower、length、join、format；链式写 <code>{{ x | round(2) | default(0) }}</code>。',
        'loop.index 从 1 开始，loop.index0 才是 0 开始。',
      ],
      related: ['基础渲染', '模板继承'],
      tags: ['语法', '循环', '过滤器'],
    },
    {
      name: '模板继承', sig: "{% extends 'base.html' %} / {% block content %}{% endblock %} / {% include 'x.html' %}",
      brief: '母版页 + 子页覆盖：多页共用一个框架。',
      examples: [
        { title: '', code: `<!-- base.html: 定义骨架和可覆盖的 block -->\n<html><body>\n  {% include 'nav.html' %}\n  <main>{% block content %}{% endblock %}</main>\n</body></html>\n\n<!-- report.html: 继承并填充 -->\n{% extends 'base.html' %}\n{% block content %}\n  <h1>{{ title }}</h1>\n{% endblock %}` },
      ],
      pitfalls: [
        'extends 必须是模板<b>第一个标签</b>，前面有内容报错。',
        'block 里想用父级默认内容：<code>{{ super() }}</code>。',
      ],
      related: ['模板语法'],
      tags: ['继承', '母版', 'include'],
    },
  ],
});

MODULES.push({
  id: 'streamlit', name: 'streamlit', icon: '🎈', category: 'Web 与页面',
  doc: 'https://docs.streamlit.io/',
  desc: '纯 Python 写交互式数据应用：不用碰 HTML/JS，保存即刷新，做内部工具/看板最快路径。',
  install: 'pip install streamlit',
  aliases: ['st', '看板'],
  tips: [
    '<b>运行方式特殊</b>：<code>streamlit run app.py</code>，不是 python app.py。',
    '核心心智模型：<b>每次交互（点按钮/拖滑块）整个脚本从头重跑一遍</b> —— 所以重的计算要 st.cache_data 缓存。',
  ],
  entries: [
    {
      name: '最小应用', sig: 'st.title / st.write / st.line_chart(df)',
      brief: '几行就有个可交互的网页。',
      examples: [
        { title: 'app.py', code: `import streamlit as st\nimport pandas as pd\n\nst.title('销售看板')\nst.write('随便写点什么, dict/list/df 都能直接放')\n\ndf = pd.DataFrame({'月份': [1, 2, 3], '销量': [120, 200, 150]})\nst.line_chart(df, x='月份', y='销量')\n\n# 运行(注意不是 python app.py):\n#   streamlit run app.py` },
      ],
      pitfalls: [
        '命令是 <code>streamlit run app.py</code>；直接 python 跑只会打印一句提示。',
        '右侧菜单改了设置没反应就 Rerun；代码保存后页面会自动提示刷新。',
      ],
      related: ['常用控件', '布局与缓存'],
      tags: ['看板', '启动', '数据应用'],
    },
    {
      name: '常用控件', sig: 'st.button / st.selectbox / st.slider / st.text_input / st.file_uploader',
      brief: '交互控件：取值直接用返回值。',
      examples: [
        { title: '', code: `city = st.selectbox('城市', ['北京', '上海', '广州'])\nprice = st.slider('价格上限', 0, 1000, 500)\nname = st.text_input('姓名')\nif st.button('开始分析'):\n    st.write(f'{city} / {price} / {name}')\n\nuploaded = st.file_uploader('上传CSV', type='csv')\nif uploaded:\n    import pandas as pd\n    df = pd.read_csv(uploaded)        # 直接读上传对象\n    st.dataframe(df.head())` },
      ],
      pitfalls: [
        '<b>没点按钮时 if 里的代码不执行</b>——控件返回值每次重跑都会重新取。',
        'file_uploader 拿到的是内存文件对象，pd.read_csv/pd.read_excel 可以直接吃，不用先存盘。',
      ],
      related: ['最小应用', '布局与缓存'],
      tags: ['控件', '上传', '交互'],
    },
    {
      name: '数据展示', sig: 'st.dataframe(df) / st.metric / st.table / st.map(df)',
      brief: '展示数据帧、指标卡、表格。',
      examples: [
        { title: '', code: `col1, col2, col3 = st.columns(3)\ncol1.metric('总销量', '12.3万', delta='+8%')\ncol2.metric('订单数', '3210', delta='-2%')\ncol3.metric('客单价', '38.3')\n\nst.dataframe(df)              # 可排序可搜索的交互表\nst.table(df.head())           # 静态表(全部显示)\nst.bar_chart(df, x='城市', y='金额')` },
      ],
      pitfalls: [
        '<code>st.dataframe</code> 大表自动虚拟滚动，<code>st.table</code> 会全量画出来 —— 大数据用 dataframe。',
        'metric 的 delta 正负自带红绿颜色，字符串也行。',
      ],
      related: ['常用控件'],
      tags: ['dataframe', '指标', '图表'],
    },
    {
      name: '布局与缓存', sig: 'st.sidebar / st.columns / st.session_state / @st.cache_data',
      brief: '侧边栏布局、跨重跑的状态与缓存（进阶必会）。',
      examples: [
        { title: '', code: `# 侧边栏放控件\nwith st.sidebar:\n    city = st.selectbox('城市', ['北京', '上海'])\n\n# 缓存昂贵计算(参数不变就不重算)\n@st.cache_data\ndef load_data(path):\n    return pd.read_csv(path)\n\ndf = load_data('big.csv')\n\n# 跨重跑记状态(如计数器)\nif 'count' not in st.session_state:\n    st.session_state.count = 0\nif st.button('+1'):\n    st.session_state.count += 1\nst.write(st.session_state.count)` },
      ],
      pitfalls: [
        '<b>没有 cache 的话每次交互都重读 CSV/重训模型</b>，页面卡到没法用 —— 读数据函数全部套 cache_data。',
        'cache_data 的参数必须可哈希（传 df 进去要小心），清缓存点页面菜单 Clear cache。',
        'session_state 在刷新页面后清空，不是数据库。',
      ],
      related: ['常用控件'],
      tags: ['缓存', '状态', '布局', 'sidebar'],
    },
  ],
});

MODULES.push({
  id: 'gradio', name: 'gradio', icon: '🎤', category: 'Web 与页面',
  doc: 'https://www.gradio.app/guides',
  desc: '给函数/模型快速套一个网页界面：三行代码出 demo，可生成临时公网链接分享。',
  install: 'pip install gradio',
  entries: [
    {
      name: '最小demo', sig: 'gr.Interface(fn, inputs=, outputs=).launch()',
      brief: '一个函数包成网页：输入组件 → 调函数 → 输出组件。',
      examples: [
        { title: '', code: `import gradio as gr\n\ndef greet(name, times):\n    return '你好 ' + name * times\n\ndemo = gr.Interface(\n    fn=greet,\n    inputs=[gr.Textbox(label='名字'), gr.Slider(1, 5, value=1, step=1)],\n    outputs=gr.Textbox(label='结果'),\n    title='问候生成器',\n)\ndemo.launch()          # 本地打开 http://127.0.0.1:7860` },
      ],
      pitfalls: [
        '<code>launch()</code> 会阻塞脚本（起服务等请求），后面的代码不执行。',
        'inputs/outputs 是<b>列表</b>时，fn 的参数和返回值顺序必须一一对应。',
        '关掉终端服务就停了；局域网访问用 launch(server_name="0.0.0.0")。',
      ],
      related: ['组件', 'Blocks布局'],
      tags: ['demo', '界面', '模型'],
    },
    {
      name: '组件', sig: 'gr.Textbox / gr.Image / gr.Audio / gr.Dataframe / gr.File / gr.Chatbot',
      brief: '输入输出组件速查。',
      examples: [
        { title: '', code: `demo = gr.Interface(\n    fn=process,\n    inputs=[gr.Image(type='filepath'),   # 默认给 numpy, filepath 给路径\n            gr.File(label='上传附件')],\n    outputs=[gr.Dataframe(), gr.File()],\n)\n# 常用: Textbox / Number / Slider / Checkbox / Dropdown /\n#       Image / Audio / Video / Dataframe / File / Chatbot` },
      ],
      pitfalls: [
        'gr.Image 默认把图片转成 <b>numpy 数组</b>传给函数；要文件路径写 <code>type="filepath"</code>。',
        '组件的 label 参数只是显示名，取值靠 fn 参数顺序。',
      ],
      related: ['最小demo'],
      tags: ['组件', 'image', 'file'],
    },
    {
      name: 'Blocks布局', sig: 'with gr.Blocks() as demo: ... btn.click(fn, inputs, outputs)',
      brief: '自由布局与事件绑定：复杂应用的写法。',
      examples: [
        { title: '', code: `import gradio as gr\n\nwith gr.Blocks() as demo:\n    gr.Markdown('# 我的工具')\n    with gr.Row():\n        inp = gr.Textbox(label='输入')\n        out = gr.Textbox(label='输出')\n    btn = gr.Button('转换')\n    btn.click(fn=lambda s: s.upper(), inputs=inp, outputs=out)\n\ndemo.launch()` },
      ],
      pitfalls: [
        '事件不止 click：change / submit / key_up 等都要传 <code>(fn, inputs, outputs)</code> 三件套。',
        'Blocks 里组件定义顺序就是页面顺序，Row/Column/Tab 控制排布。',
      ],
      related: ['最小demo', 'launch参数'],
      tags: ['blocks', '布局', '事件'],
    },
    {
      name: 'launch参数', sig: 'demo.launch(share=True, server_name="0.0.0.0", inbrowser=True)',
      brief: '分享链接与部署相关参数。',
      examples: [
        { title: '', code: `demo.launch(\n    share=True,               # 生成 72 小时的公网链接(需联网)\n    server_name='0.0.0.0',    # 局域网可访问\n    server_port=7861,         # 指定端口\n    inbrowser=True,           # 启动后自动开浏览器\n)` },
      ],
      pitfalls: [
        'share=True 的临时链接 72 小时失效且数据经过第三方隧道，<b>别用于敏感数据</b>。',
        '端口占用时换 server_port，或 gradio 会自动 +1。',
      ],
      related: ['Blocks布局'],
      tags: ['部署', '分享'],
    },
  ],
});
