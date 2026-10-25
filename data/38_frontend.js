/* 前端页面速查：读改 HTML / CSS / JS 的最小技能集（「速查」分类） */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'frontend', name: '前端页面速查', icon: '🪄', category: '速查',
  doc: 'https://developer.mozilla.org/zh-CN/docs/Web',
  desc: '看懂和微调前端页面：JS 语法与异步、localStorage 存储、HTML 结构、常用样式、flex 布局、抓元素绑事件、F12 调试。改页面、读 JS 不用每次都求人。',
  install: false,
  aliases: ['html', 'css', 'javascript', 'js', '前端', '样式', '布局', '页面', '语法', 'async', 'await', 'promise', 'localstorage', '存储'],
  tips: [
    '学法：别背 API，F12 打开任意页面 → Elements 面板随手改样式即时生效，比看十篇教程都快。',
    '本字典的 index.html / app.js 就是现成练习素材：搜个样式类名改一改、加个 console.log 看数据流，马上有反馈。',
    '学 JS 的顺序：先「js-语法基础」，再 js-dom / js-事件与调试，要发请求再看 js-异步和 fetch；系统教程推荐 zh.javascript.info（现代 JavaScript 教程，有中文），只读基础和异步章节就够。',
  ],
  entries: [
    {
      name: 'html-骨架', sig: '<div id="app" class="box">内容</div> / <script src="app.js"> / <link rel="stylesheet" href="style.css">',
      brief: '页面结构最小集：容器、属性、引入样式与脚本。',
      examples: [
        { title: '', code: `<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <link rel="stylesheet" href="style.css">   <!-- 引样式 -->\n</head>\n<body>\n  <div id="app" class="box active">          <!-- 块级容器: id 全页唯一, class 可重复 -->\n    <span>行内小片段</span>\n    <p>段落</p>\n  </div>\n  <script src="app.js"></script>             <!-- 引脚本, 放 body 末尾 -->\n</body>\n</html>` },
      ],
      pitfalls: [
        '<b>id 全页唯一</b>（CSS/JS 里 # 取），class 可重复（. 取）——选择器体系全建立在这个约定上。',
        '<code>&lt;script&gt;</code> 放 body 末尾（或加 defer 属性）：放 head 里直接执行时页面元素还没渲染，JS 取不到。',
        '注释写法是 <code>&lt;!-- --&gt;</code>；img、br、input 这类自闭合标签没有结束标签。',
      ],
      related: ['css-常用', 'js-dom'],
      tags: ['HTML', '结构', '标签'],
    },
    {
      name: 'css-常用', sig: "#id / .class / 标签 {} → color / font / padding / margin / border / background",
      brief: '常用样式属性速查：改颜色、字号、间距、边框够用。',
      examples: [
        { title: '', code: `.box {                        /* .class; #id; 标签名直接写 */\n  color: #333;                 /* 文字颜色 */\n  background: #f5f5f5;         /* 背景色 */\n  font-size: 14px;             /* 字号; font-weight: bold 加粗 */\n  padding: 8px 12px;           /* 内边距: 上下 左右 */\n  margin: 0 auto;              /* 外边距: auto = 水平居中 */\n  border: 1px solid #ddd;      /* 宽 样式 颜色; border-radius 圆角 */\n  width: 200px;\n}\n.box:hover { color: #900; }    /* 伪类: 鼠标悬停时生效 */` },
      ],
      pitfalls: [
        'padding 是内边距(往里撑大)，margin 是外边距(往外推)；"盒子超宽"九成是 padding+border 加在了 width 外面。',
        '全页加一句 <code>* { box-sizing: border-box; }</code> 让 width 含内边距，布局立刻听话。',
        '优先级：行内 style &gt; #id &gt; .class &gt; 标签；同权重时后写的赢。改了没效果先查被谁盖掉了(F12 里被划线的属性)。',
      ],
      related: ['flex-布局', 'html-骨架'],
      tags: ['CSS', '样式', '选择器'],
    },
    {
      name: 'flex-布局', sig: "display: flex; justify-content: / align-items: / gap: / flex: 1",
      brief: '现代布局标配：一行横排、侧栏+主区、垂直居中全靠它。',
      examples: [
        { title: '', code: `.row {\n  display: flex;                    /* 子元素横向排; 纵向用 column */\n  justify-content: space-between;   /* 主轴对齐: center / space-between / flex-end */\n  align-items: center;              /* 交叉轴对齐(默认横排时=垂直) */\n  gap: 10px;                        /* 子元素间距, 现代写法不靠 margin */\n}\n.row .side { flex: 0 0 200px; }     /* 固定 200px 不伸缩 */\n.row .main { flex: 1; }             /* 占满剩余空间 —— 经典侧栏+主区 */\n\n/* 垂直+水平居中二件套: */\n.center { display: flex; justify-content: center; align-items: center; }` },
      ],
      pitfalls: [
        '<b>justify-content 管主轴、align-items 管交叉轴</b>（默认横排时=水平/垂直），写反了表现完全不对。',
        '子项太多挤一行是默认不换行，加 <code>flex-wrap: wrap</code> 才会折行。',
        '老教程里的 float / inline-block 布局能看懂即可，新页面一律 flex（复杂二维网格再学 grid）。',
      ],
      related: ['css-常用'],
      tags: ['flex', '布局', '居中'],
    },
    {
      name: 'js-语法基础', sig: "let x = 1 / (a, b) => a + b / `共 ${n} 条` / arr.map(x => x * 2)",
      brief: 'JS 语言最小集：变量、函数、模板字符串、数组方法——读 app.js 的前提，会 Python 的话半天能过完。',
      examples: [
        { title: '变量·函数·字符串(对照 Python)', code: `let count = 0;                 // 可改的变量; const 声明常量(重新赋值才报错)\nconst APP = '词典';\ncount = count + 1;\nif (count > 0 && APP) {}       // 且或非: && || !  (不是 and/or/not)\n\nfunction add(a, b) { return a + b; }   // 普通函数\nconst add2 = (a, b) => a + b;          // 箭头函数: 一行时省略 return 和 {}\n\nconst msg = \`共 \${count} 个\${APP}\`;      // 模板字符串(反引号) = Python 的 f-string\nconst { id, stars } = { id: 'frontend', stars: 5 };   // 解构: 一次拆出同名字段\n\nconst mod = { id: 'frontend' };\nmod.stars = 5;                 // 对象加字段不用预声明; mod['id'] 等价 mod.id` },
        { title: '数组方法(读代码最高频)', code: `const names = ['os', 'pandas', 'numpy'];\nnames.length;                          // 3 (不是 len(names)); names.at(-1) 取末尾\nnames.map(n => n.length);              // 逐个变换 → [2, 6, 5]\nnames.filter(n => n.length > 3);       // 过滤 → ['pandas', 'numpy']\nnames.find(n => n[0] === 'p');         // 第一个满足的 → 'pandas'\nnames.includes('os');                  // 是否包含 → true\nnames.reduce((s, n) => s + n.length, 0);   // 累加 → 13\n[10, 9, 2].sort((a, b) => a - b);      // 数字排序必须传比较函数` },
      ],
      pitfalls: [
        '从 Python 顺手写错率最高的：<code>and/or/not</code> 是 <code>&amp;&amp;/||/!</code>；<code>len(a)</code> 是 <code>a.length</code>；<code>elif</code> 是 <code>else if</code>；<code>None</code> 对应 <code>null</code>/<code>undefined</code>。',
        '判断相等一律 <code>===</code>/<code>!==</code>：<code>==</code> 会隐式转型(\'1\' == 1 为 true)，坑多，当它不存在。',
        'map/filter 返回<b>新数组</b>不改原数组；sort/reverse <b>直接改原数组</b>，且默认按字符串排：[10,9,2] 会排成 [10,2,9]，数字必须传比较函数。',
        '箭头函数省略 {} 时隐式 return；一旦写了 {} 就必须自己写 return，否则返回 undefined。',
      ],
      related: ['js-dom', 'js-异步', 'localStorage-存储'],
      tags: ['JS', '语法', '箭头函数', '数组'],
    },
    {
      name: 'js-dom', sig: "document.querySelector('#id') / el.textContent / el.classList.toggle() / el.style",
      brief: '抓元素、改内容、切换样式：页面交互三件套。',
      examples: [
        { title: '', code: `const el = document.querySelector('#app');   // 取第一个; querySelectorAll 取全部\nel.textContent = '纯文字';                    // 只改文本(安全)\nel.innerHTML = '<b>加粗</b>';                 // 按 HTML 解析(别拼用户输入!)\nel.classList.add('on');                       // 类: add / remove\ndarkBtn.classList.toggle('dark');             // 有则删无则加 —— 主题切换就这么写\nel.style.color = 'red';                       // 改内联样式\nconst div = document.createElement('div');    // 造新节点\nel.appendChild(div);                          // 挂到页面里` },
      ],
      pitfalls: [
        '取不到元素返回 null，接着 .xxx 就报 <b>Cannot read properties of null</b>——多半是脚本跑在元素渲染之前(script 放 body 末尾)。',
        'textContent vs innerHTML：纯文字用前者；innerHTML 会把字符串当 HTML 执行，拼上用户输入有注入风险。',
        'querySelector 的参数就是 CSS 选择器，语法与样式表一致：\'#id .class p\' 这样组合取。',
      ],
      related: ['js-语法基础', 'js-事件与调试', 'html-骨架'],
      tags: ['DOM', '元素', 'class切换'],
    },
    {
      name: 'localStorage-存储', sig: "localStorage.setItem('k', JSON.stringify(v)) / JSON.parse(localStorage.getItem('k'))",
      brief: '浏览器自带的本地键值库：番茄钟/网址导航/词典这些纯前端工具的数据全存这，关页面不丢。',
      examples: [
        { title: '存与取(只能存字符串)', code: `localStorage.setItem('theme', 'dark');            // 字符串直接存\nconst cfg = { pomodoro: 25, sound: true };\nlocalStorage.setItem('cfg', JSON.stringify(cfg)); // 对象必须先序列化\n\nconst theme = localStorage.getItem('theme');      // 取; 不存在返回 null\nlocalStorage.removeItem('cfg');                   // 删单个\n// localStorage.clear();                          // 清空本站全部(慎用)\n\n// 标准读法: 解析 + 兜底, 首次打开/脏数据都不崩:\nfunction loadJSON(key, fallback) {\n  try {\n    return JSON.parse(localStorage.getItem(key)) ?? fallback;\n  } catch { return fallback; }    // 存的不是合法 JSON 时走这里\n}\nconst conf = loadJSON('cfg', { pomodoro: 25 });` },
      ],
      pitfalls: [
        '<b>只能存字符串</b>：直接 setItem 存对象会变成 "[object Object]"，存对象/数组必须 <code>JSON.stringify</code>、取出 <code>JSON.parse</code>。',
        'getItem 取不到返回 <code>null</code>(不报错)；兜底用 <code>??</code> 别用 <code>||</code>——0、false、空字符串会被 || 一并吞掉。',
        '数据跟着「浏览器 + 域名」走：换浏览器/换电脑/无痕窗口互相看不见；双击打开的 file:// 页面每个路径各存各的。',
        '容量约 5MB、同步写入：适合配置和记录类小数据；一个标签页改了另一个不同步，要实时同步得监听 <code>storage</code> 事件。',
      ],
      related: ['js-语法基础', 'js-事件与调试'],
      tags: ['localStorage', '存储', 'JSON'],
    },
    {
      name: 'js-事件与调试', sig: "el.addEventListener('click', fn) / console.log() / F12 开发者工具",
      brief: '绑事件响应操作 + 用 F12 定位问题。',
      examples: [
        { title: '', code: `btn.addEventListener('click', (e) => {\n  console.log('被点了', e.target);      // 打印看状态, F12 Console 里看\n});\ninput.addEventListener('input', fn);    // 每敲一个字符触发\ninput.addEventListener('change', fn);   // 失焦且值变了才触发\nform.addEventListener('submit', (e) => {\n  e.preventDefault();                    // 阻止表单提交跳转刷新\n});\n// F12 工具: Console 看报错/随手敲 JS; Elements 看结构改样式; Network 看请求` },
      ],
      pitfalls: [
        '<code>onclick =</code> 是覆盖式赋值，<b>addEventListener 可叠加多个</b>不互相顶掉，优先用后者。',
        'Console 红色报错自带文件名和行号，点进去就是出事的地方；报 undefined/null 先怀疑元素没取到或脚本执行太早。',
        '改了 CSS/JS 页面没变化，九成是浏览器缓存：<b>Ctrl+F5</b> 强制刷新（本字典 server 模式已禁缓存，直接 F5 即可）。',
      ],
      related: ['js-dom'],
      tags: ['事件', '调试', 'F12'],
    },
    {
      name: 'grid-布局', sig: "display: grid; grid-template-columns: repeat(3, 1fr); gap:",
      brief: '二维网格布局：页面骨架、等分卡片、响应式列数。',
      examples: [
        { title: '', code: `.gallery {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);   /* 3 等分列, fr=剩余空间份数 */\n  gap: 12px;                                /* 行列间距一起管 */\n}\n\n.layout {                                  /* 经典页面骨架: 侧栏+主区+右栏 */\n  display: grid;\n  grid-template-columns: 200px 1fr 160px;\n  grid-template-rows: auto 1fr auto;        /* 头 / 弹性身 / 脚 */\n}\n.card { grid-column: span 2; }              /* 跨 2 列 */\n\n/* 响应式列数: 窗口变宽自动加列, 每列不窄于 200px */\n.auto { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }` },
      ],
      pitfalls: [
        'grid 是<b>二维</b>(行+列一起定)，flex 是一维(一条线排队)：整页骨架用 grid，一行内容排齐用 flex。',
        '想让卡片窗口变宽自动换列，用 <code>repeat(auto-fill, minmax(最小宽, 1fr))</code>，不用写媒体查询。',
        '跨行跨列用 <code>grid-column: span 2</code> / <code>grid-row: span 2</code>，配合 lines 的复杂写法先不碰。',
      ],
      related: ['flex-布局', 'css-常用'],
      tags: ['grid', '网格', '响应式'],
    },
    {
      name: 'js-异步', sig: "async function fn() { const r = await fetch(url); } / fn().then(回调).catch(兜底)",
      brief: 'JS 的「等待」：不写 await 代码不会停——fetch、定时器全靠这套，fetch 词条的前置知识。',
      examples: [
        { title: 'async/await(推荐, 长得像 Python)', code: `async function load() {\n  try {\n    const r = await fetch('/api/data');   // await: 等结果出来再往下走\n    const data = await r.json();\n    render(data);\n  } catch (err) {\n    console.error('失败:', err);           // 对应 Python 的 except\n  }\n}\nload();   // 调用这行本身不等待, 函数内部各自等待` },
        { title: 'then 链 / 并发 / 延时', code: `// .then 链式写法(老代码常见, 与上面等价):\nfetch('/api/data')\n  .then(r => r.json())\n  .then(data => render(data))\n  .catch(err => console.error(err));\n\n// 并发等全部完成(约等于 asyncio.gather):\nconst [users, list] = await Promise.all([getUsers(), getLists()]);\n\n// JS 没有 time.sleep, 延时这样写:\nawait new Promise(res => setTimeout(res, 500));` },
      ],
      pitfalls: [
        '<b>async 函数的返回值一定是 Promise</b>：调用处不 await，拿到的是 Promise 对象不是值——打印出 Promise { pending } 就是漏了 await。',
        '<b>不 await 就不会等</b>：Python 顺序执行天然阻塞，JS 漏写 await 时后面的代码拿着「还没好的半成品」继续跑，是异步头号 bug。',
        'await 只能写在 async 函数里；forEach 的回调里写 await 不生效——要逐个等用 for...of，要并发用 map + Promise.all。',
        '对应关系：Promise ≈ asyncio 的 Future/协程，async/await 两边语法几乎一样；区别是 JS 的事件循环还要管页面渲染，同步代码卡住页面就跟着卡。',
      ],
      related: ['fetch-请求', 'js-语法基础'],
      tags: ['异步', 'Promise', 'async/await'],
    },
    {
      name: 'fetch-请求', sig: "fetch(url).then(r => r.json()) / await fetch(url, { method: 'POST', body: ... })",
      brief: '浏览器原生发 HTTP 请求：GET/POST、JSON、错误处理。',
      examples: [
        { title: '', code: `// GET + 解析 JSON\nfetch('/api/data')\n  .then(r => r.json())\n  .then(data => console.log(data))\n  .catch(err => console.error('请求失败', err));\n\n// POST JSON (async/await 写法):\nasync function save(cfg) {\n  const r = await fetch('/api/save', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(cfg),\n  });\n  if (!r.ok) throw new Error('HTTP ' + r.status);   // 4xx/5xx 不会自动抛错!\n  return await r.json();\n}` },
      ],
      pitfalls: [
        '<b>fetch 对 404/500 不报错也不走 catch</b>（只有网络层失败才 reject），必须手动判 <code>r.ok</code> 或 <code>r.status</code>。',
        'POST JSON 两个都得有：<code>Content-Type</code> 头 + <code>JSON.stringify</code> 的 body，少一个服务端收到的就不是 JSON。',
        '双击打开的本地页面(file://)发 fetch 会被跨域/协议限制拦住，起本地服务再测——本字典的 server.py 就是干这个的。',
        '报 CORS 跨域是<b>服务端</b>没放行，前端无解：让后端加 Access-Control-Allow-Origin 响应头。',
      ],
      related: ['js-异步', 'js-事件与调试'],
      tags: ['fetch', '请求', 'JSON', '跨域'],
    },
    {
      name: 'css-动画', sig: "transition: all .2s / animation: 名 时长 infinite; @keyframes 名 {}",
      brief: '过渡与关键帧动画：悬停效果、加载转圈、淡入。',
      examples: [
        { title: '过渡(配悬停)', code: `.btn {\n  transition: all 0.2s ease;      /* 属性变化时平滑过渡 */\n}\n.btn:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 4px 12px rgba(0,0,0,.15);\n}` },
        { title: '关键帧(转圈/淡入)', code: `@keyframes spin {\n  from { transform: rotate(0); }\n  to   { transform: rotate(360deg); }\n}\n.loading { animation: spin 1s linear infinite; }   /* 名 时长 曲线 无限循环 */\n\n@keyframes fade-in {\n  from { opacity: 0; transform: translateY(8px); }\n  to   { opacity: 1; transform: none; }\n}\n.card { animation: fade-in 0.3s ease both; }        /* both: 播前后停在端点 */` },
      ],
      pitfalls: [
        '分工：<b>transition 管"状态之间怎么过渡"</b>(配 :hover/类切换)，animation 管"主动播放的一段动画"。',
        '动画只动 <code>transform</code> 和 <code>opacity</code> 最流畅(不触发重排)；动画改 width/top 会卡。',
        '忘写 <code>infinite</code> 动画只播一次就停；淡入元素"闪一下再消失"多半是缺 <code>both</code>。',
        '尊重系统"减弱动态效果"设置：包一层 <code>@media (prefers-reduced-motion: reduce)</code> 把动画关掉。',
      ],
      related: ['css-常用', 'flex-布局'],
      tags: ['动画', 'transition', 'keyframes'],
    },
  ],
});
