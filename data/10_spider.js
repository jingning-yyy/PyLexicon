/* 爬虫：requests / bs4 / lxml / tqdm */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'requests', name: 'requests', icon: '🌐', category: '爬虫',
  doc: 'https://requests.readthedocs.io/en/latest/',
  desc: 'HTTP 请求库，爬虫第一件套：发请求、带参数、带 cookie、下载文件。',
  install: 'pip install requests',
  tips: [
    '<b>timeout 必须设</b>：requests 默认永不超时，一个卡住的请求能把整个爬虫挂死。',
    '被拒/返回空数据时按顺序排查：状态码 → UA 头 → cookie → 频率（加 sleep）→ 是否 JS 渲染页面。',
    '爬虫注意合规：遵守 robots.txt、控制频率、不爬敏感数据、优先用官方 API。',
  ],
  entries: [
    {
      name: 'get', sig: "requests.get(url, params=None, headers=None, timeout=10, allow_redirects=True, verify=True)",
      brief: '发起 GET 请求，返回 Response 对象。',
      params: [
        { n: 'params', t: 'dict', d: '查询参数，自动拼到 URL 并编码' },
        { n: 'headers', t: 'dict', d: '请求头；爬虫至少要带 User-Agent 伪装浏览器' },
        { n: 'timeout', t: 'float / tuple', d: '超时秒数；(连接超时, 读取超时)，<b>必设</b>' },
        { n: 'verify', t: 'bool', d: 'False 跳过证书校验（内网自签名时用）' },
      ],
      returns: 'Response 对象（r.status_code / r.text / r.json() ...）',
      examples: [
        { title: '标准爬虫 GET 模板', code: `import requests\n\nheaders = {\n    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '\n                  'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',\n}\nr = requests.get(\n    'https://httpbin.org/get',\n    params={'q': 'python', 'page': 1},   # -> ?q=python&page=1\n    headers=headers,\n    timeout=10,\n)\nprint(r.status_code)      # 200\nr.raise_for_status()      # 非2xx直接抛异常\nprint(r.url)              # 实际请求的完整URL` },
      ],
      pitfalls: [
        '<b>不设 timeout 的请求可能永久挂起</b>，批量爬取必设超时并 try/except。',
        '部分网站对无 UA 的请求直接 403，第一反应是补 User-Agent。',
        'params 传 dict 会自动 URL 编码，自己拼字符串反而容易编码出错。',
      ],
      related: ['text-content', 'post', 'session'],
      tags: ['get', '请求', 'headers', '超时'],
    },
    {
      name: 'text-content', sig: "r.text / r.content / r.encoding / r.apparent_encoding / r.json()",
      brief: '响应内容：文本、二进制、JSON 三种取法与编码修正。',
      examples: [
        { title: '', code: `r = requests.get(url, timeout=10)\n\nr.encoding = 'utf-8'          # 猜错时手动指定(常见 gbk 站点)\ntext = r.text                  # 字符串, 交给 bs4 解析\n\nr.apparent_encoding            # chardet 猜测的编码, r.encoding = 它\nimg = requests.get(img_url, timeout=10).content   # 二进制(图片/文件)\nwith open('x.jpg', 'wb') as f:\n    f.write(img)\n\ndata = r.json()                # 接口返回JSON时直接解析成dict` },
      ],
      pitfalls: [
        '<b>中文乱码</b>：requests 对无 charset 声明的页面默认按 ISO-8859-1 猜，先 <code>r.encoding = r.apparent_encoding</code> 或直接指定 utf-8/gbk。',
        'r.text 已经按错误编码解码过，乱码后再改 encoding 也不一定救得回来 —— 养成先设 encoding 的习惯。',
        '下载文件/图片必须用 r.content（bytes），用 r.text 会损坏文件。',
      ],
      related: ['get', '大文件下载'],
      tags: ['编码', '乱码', 'json', '二进制'],
    },
    {
      name: 'post', sig: "requests.post(url, data=None, json=None, files=None, headers=None, timeout=10)",
      brief: 'POST 请求：表单登录、接口提交、文件上传。',
      params: [
        { n: 'data', t: 'dict', d: '<b>表单格式</b>（application/x-www-form-urlencoded）' },
        { n: 'json', t: 'dict', d: '<b>JSON 格式</b>（application/json），自动序列化' },
        { n: 'files', t: 'dict', d: "文件上传：{'file': open('a.jpg','rb')}" },
      ],
      examples: [
        { title: '', code: `import requests\n\n# 表单(模拟登录):\nr = requests.post(login_url,\n                  data={'username': 'u', 'password': 'p'},\n                  timeout=10)\n\n# JSON 接口:\nr2 = requests.post(api_url,\n                   json={'query': 'python', 'page': 1},  # 注意是 json=\n                   timeout=10)\nprint(r2.json())\n\n# 上传文件:\nfiles = {'file': ('report.pdf', open('report.pdf', 'rb'))}\nrequests.post(upload_url, files=files, timeout=30)` },
      ],
      pitfalls: [
        '<b>data= 和 json= 完全不同</b>：传错了服务器收到的格式不对，返回参数错误 —— 看接口文档要求（F12 Network 里看 Content-Type）。',
        'files 的文件对象用完记得 close（或用 with）。',
        '登录后要带 cookie 继续访问 → 用 Session 而不是手动复制 cookie。',
      ],
      related: ['get', 'session'],
      tags: ['post', '表单', 'json', '上传'],
    },
    {
      name: 'session', sig: "s = requests.Session() / s.get(...) / s.headers.update({...})",
      brief: '会话对象：自动保持 cookie、复用 TCP 连接，登录态爬虫必备。',
      examples: [
        { title: '', code: `import requests\n\ns = requests.Session()\ns.headers.update({\n    'User-Agent': 'Mozilla/5.0 ...',\n    'Referer': 'https://example.com/',    # 有的站校验来源\n})\n\ns.post(login_url, data=creds, timeout=10)      # 登录, cookie 存在 s 里\nr = s.get(profile_url, timeout=10)             # 自动带上登录 cookie\nprint(r.text)` },
      ],
      pitfalls: [
        '每个请求各用 requests.get() 是<b>不带 cookie</b> 的，登录后爬数据必须走同一个 Session。',
        'Session 也要每次传 timeout，它不会替你设默认超时。',
        '并发场景 Session 不是线程安全的，每线程一个。',
      ],
      related: ['get', 'post'],
      tags: ['会话', 'cookie', '登录'],
    },
    {
      name: '大文件下载', sig: "requests.get(url, stream=True) / r.iter_content(chunk_size=1024*1024)",
      brief: '流式下载大文件，不把整个文件塞进内存。',
      examples: [
        { title: '带进度条下载', code: `import requests\n\nwith requests.get(url, stream=True, timeout=30) as r:\n    r.raise_for_status()\n    total = int(r.headers.get('content-length', 0))\n    done = 0\n    with open('bigfile.zip', 'wb') as f:\n        for chunk in r.iter_content(chunk_size=1024 * 1024):  # 1MB\n            f.write(chunk)\n            done += len(chunk)\n            print(f'\\r{done / total:.1%}', end='')` },
      ],
      pitfalls: [
        '<b>不写 stream=True 时 r.content 一口气全进内存</b>，下载几个 G 的文件直接 OOM。',
        'with 块确保连接释放；中断重连要自己做 Range 断点续传。',
      ],
      related: ['get', 'text-content'],
      tags: ['下载', 'stream', '大文件'],
    },
    {
      name: '重试与代理', sig: "HTTPAdapter(max_retries=Retry(...)) / requests.get(url, proxies={...})",
      brief: '自动重试、限速代理，提升爬虫稳定性。',
      examples: [
        { title: '', code: `import requests\nfrom requests.adapters import HTTPAdapter, Retry\n\ns = requests.Session()\nretries = Retry(total=3, backoff_factor=1,\n                status_forcelist=[429, 500, 502, 503, 504])\ns.mount('http://', HTTPAdapter(max_retries=retries))\ns.mount('https://', HTTPAdapter(max_retries=retries))\n\n# 代理:\nproxies = {'http': 'http://127.0.0.1:7890',\n           'https': 'http://127.0.0.1:7890'}\ns.get(url, proxies=proxies, timeout=10)` },
      ],
      pitfalls: [
        'Retry 默认只重试连接错误，要加 <code>status_forcelist</code> 才重试 5xx 状态码。',
        'backoff_factor 退避等待，别把对方打死；429 表示你太快了，乖乖 sleep。',
        '免费代理不稳定，生产用付费池并配合重试。',
      ],
      related: ['get', 'session'],
      tags: ['重试', '代理', '稳定性'],
    },
  ],
});

MODULES.push({
  id: 'bs4', name: 'bs4', icon: '🍲', category: '爬虫',
  doc: 'https://www.crummy.com/software/BeautifulSoup/bs4/doc.zh/',
  pkg: 'beautifulsoup4',
  desc: 'BeautifulSoup：HTML/XML 解析库，用类 CSS 语法优雅地提取网页数据。',
  install: 'pip install beautifulsoup4  (解析器建议再装 lxml)',
  aliases: ['beautifulsoup', 'beautifulsoup4', 'soup'],
  tips: [
    '解析器选择：<code>html.parser</code> 内置够用，<code>lxml</code>（需 pip install lxml）更快更宽容，生产推荐 lxml。',
    'js 动态渲染的页面 bs4 拿不到内容 —— 先看接口/F12 XHR 请求，实在不行上 selenium/playwright。',
  ],
  entries: [
    {
      name: 'BeautifulSoup', sig: "BeautifulSoup(html, 'lxml') / soup.title / soup.prettify()",
      brief: '解析 HTML 字符串/文件成树结构。',
      params: [
        { n: 'markup', t: 'str / 文件对象', d: 'requests 的 r.text' },
        { n: 'features', t: 'str', d: "解析器：'lxml' / 'html.parser' / 'html5lib'" },
      ],
      examples: [
        { title: '', code: `import requests\nfrom bs4 import BeautifulSoup\n\nr = requests.get(url, headers=UA, timeout=10)\nr.encoding = 'utf-8'\nsoup = BeautifulSoup(r.text, 'lxml')\n\nprint(soup.title.text)     # <title> 的文字\nprint(soup.prettify()[:500])   # 格式化输出, 调试神器` },
      ],
      pitfalls: [
        "传 r.content 时 bs4 自己猜编码，行为和 r.text 不同 —— 统一用设好 encoding 的 r.text。",
        "没装 lxml 就写 'lxml' 会报 FeatureNotFound，装包或改 'html.parser'。",
      ],
      related: ['find-find_all', 'select'],
      tags: ['解析', 'html'],
    },
    {
      name: 'find-find_all', sig: "soup.find('div', class_='item') / soup.find_all('a', href=True, limit=10)",
      brief: '按标签名+属性查找：find 返回第一个（或 None），find_all 返回列表。',
      params: [
        { n: 'name', t: 'str', d: '标签名：div、a、span...' },
        { n: 'class_', t: 'str', d: 'class 属性（class 是保留字所以带下划线！）' },
        { n: 'id / href / attrs', t: '-', d: '其他属性直接传或放 attrs dict' },
        { n: 'text', t: 'str / 函数', d: '按文本内容匹配（新版可用 string=）' },
        { n: 'limit', t: 'int', d: 'find_all 最多返回几个' },
      ],
      examples: [
        { title: '', code: `soup.find('h1')                       # 第一个 h1\nsoup.find_all('a')                    # 所有链接\nsoup.find('div', class_='price')      # <div class="price">\nsoup.find(id='main')                  # id 查找\nsoup.find_all('a', href=True)         # 有 href 的 a\nsoup.find_all('li', limit=5)          # 只要前5个\n\nfor a in soup.find_all('a'):\n    print(a.get_text(strip=True), a.get('href'))` },
      ],
      pitfalls: [
        '<b>class 写成 class_</b>（保留字）；多值 class（"a b"）匹配其中一个即可命中。',
        '<code>find</code> 没找到返回 <b>None</b>，链式取属性前先判空，否则 AttributeError。',
        'find_all 返回<b>列表</b>（找不到是空列表不是 None），if 判断用 truthiness。',
      ],
      related: ['BeautifulSoup', 'select', '取文本属性'],
      tags: ['查找', '提取', 'find'],
    },
    {
      name: 'select', sig: "soup.select('div.item > a.title') / soup.select_one('#main p')",
      brief: 'CSS 选择器查找，会 CSS 就会爬。',
      examples: [
        { title: '', code: `soup.select('div.item')               # 所有 .item 的 div\nsoup.select('ul#list > li')           # id=list 的直接子 li\nsoup.select('a[href^="https"]')       # href 以 https 开头\nsoup.select('td:nth-of-type(2)')      # 每行第2列\nsoup.select_one('.price').text        # 只要第一个\n\n# 混用: 先 find 再在局部继续找\nbox = soup.find('div', class_='info')\nprint(box.select('span.name'))` },
      ],
      pitfalls: [
        'select 永远返回<b>列表</b>（哪怕只有一个结果），取第一个要么 select_one 要么 [0]。',
        '选择器里跨级用空格、直接子级用 >，和写 CSS 完全一致；从浏览器复制的 selector 常带 nth-child 自动生成的路径，太脆，改写成稳定的 class/id。',
      ],
      related: ['find-find_all', '取文本属性'],
      tags: ['css', '选择器', 'select'],
    },
    {
      name: '取文本属性', sig: "e.get_text(strip=True) / e.text / e['href'] / e.get('href', '')",
      brief: '从节点取文字与属性值。',
      examples: [
        { title: '', code: `a = soup.find('a')\nprint(a.text)                  # 内部所有文字(含子标签的)\nprint(a.get_text(strip=True))  # 去掉首尾空白\nprint(a['href'])               # 属性, 不存在会 KeyError!\nprint(a.get('href'))           # 安全取属性, 不存在返回 None\nprint(a.get('href', '/default'))\n\nimg = soup.find('img')\nprint(img.get('src'))` },
      ],
      pitfalls: [
        '<b>e["href"] 不存在时直接 KeyError</b>，爬虫里一律用 e.get("href")。',
        '<code>.string</code> 只有当标签内是<b>唯一一段文本</b>时才有值，否则 None —— 拿不准就用 get_text()。',
        'text 拿到的是拼起来的所有子孙文本，想要"只算直接文本"要用 .find(text=True) 或遍历。',
      ],
      related: ['find-find_all', 'select'],
      tags: ['文本', '属性', 'href'],
    },
    {
      name: '遍历树', sig: 'e.parent / e.children / e.descendants / e.next_sibling / e.find_next() / e.decompose()',
      brief: '在解析树里上下左右移动、删除节点。',
      examples: [
        { title: '', code: `tr = soup.find('tr')\nfor td in tr.children:          # 直接子节点(含文本节点)\n    if td.name:                  # 跳过纯文本节点\n        print(td.text)\n\n# 兄弟节点之间常见 \\n 文本节点, 用 find_next 跳过:\nnext_tr = tr.find_next('tr')\n\n# 删除广告节点再取正文:\nfor ad in soup.select('div.ad'):\n    ad.decompose()` },
      ],
      pitfalls: [
        'children/siblings 会给出换行符等文本节点，判断 <code>node.name</code> 非空再用。',
        'decompose 是破坏性操作，删了就没了（副本 soup 上操作）。',
      ],
      related: ['find-find_all'],
      tags: ['遍历', '兄弟节点', '删除'],
    },
  ],
});

MODULES.push({
  id: 'lxml', name: 'lxml', icon: '⚡', category: '爬虫',
  doc: 'https://lxml.de/',
  desc: '高性能 XML/HTML 处理库，XPath 语法提取数据，速度比 bs4 快。',
  install: 'pip install lxml',
  aliases: ['xpath', 'etree'],
  tips: [
    'XPath 记三条就够用：<code>//标签[@属性="值"]</code> 定位、<code>/text()</code> 取文字、<code>/@href</code> 取属性。',
    'Chrome F12 复制 XPath 可用作起点，但它是绝对路径，改写成稳定的相对路径。',
  ],
  entries: [
    {
      name: 'etree.HTML', sig: "tree = etree.HTML(html_string) / tree.xpath('//div')",
      brief: '把 HTML 解析成可 XPath 的树（自动补全残缺标签）。',
      examples: [
        { title: '', code: `from lxml import etree\n\nhtml = requests.get(url, timeout=10).text\ntree = etree.HTML(html)\nnodes = tree.xpath('//div[@class="item"]')\nprint(len(nodes))\n# 文件直接解析: etree.parse('page.html', etree.HTMLParser())` },
      ],
      pitfalls: [
        'etree.HTML() 返回 None 的情况：传入的是空串或纯注释 —— 先判空。',
        '页面不规范时解析结果与浏览器不同（lxml 按 XML 规则补全），复杂页面对比浏览器 Elements 面板确认。',
      ],
      related: ['xpath语法'],
      tags: ['解析', 'html', '树'],
    },
    {
      name: 'xpath语法', sig: "//div[@class='x']/a/@href / //span/text() / //div[contains(@class, 'item')][1]",
      brief: 'XPath 速查：定位、过滤、取值。',
      params: [
        { n: '// 与 /', t: '-', d: '// 任意层级找，/ 下一级' },
        { n: '[@attr="v"]', t: '-', d: '属性过滤；@href 直接取属性值' },
        { n: '[1] [last()]', t: '-', d: '位置索引 —— <b>从 1 开始</b>！' },
        { n: 'contains() / starts-with()', t: '-', d: '模糊匹配属性' },
        { n: 'text()', t: '-', d: '取文本；string() 取含子节点的整段文字' },
      ],
      examples: [
        { title: '', code: `tree.xpath('//title/text()')                       # 标题文字\nresults = tree.xpath('//div[@class="item"]')\nfor node in results:\n    title = node.xpath('.//a/text()')[0].strip()   # . 表示当前节点往下\n    link  = node.xpath('.//a/@href')[0]\n    price = node.xpath('.//span[@class="price"]/text()')\n    print(title, link, price)\n\ntree.xpath('//a[contains(@href, "detail")]/@href')   # 模糊匹配` },
      ],
      pitfalls: [
        '<b>xpath 返回的是列表</b>，取值要 [0]，先判非空再取， IndexError 是家常便饭。',
        'text() 只取直接文本，文本混在子标签里时用 <code>string(.)</code> 或 itertext()。',
        '位置索引 [1] 是第一个（不是 0），从浏览器思维转过来最容易错。',
      ],
      related: ['etree.HTML', '取值'],
      tags: ['xpath', '语法', '提取'],
    },
    {
      name: '取值', sig: "node.text / node.get('href') / node.itertext() / etree.tostring(node)",
      brief: '节点对象上取文本、属性，或转回字符串。',
      examples: [
        { title: '', code: `node = tree.xpath('//div[@id="main"]')[0]\nprint(node.tag)                       # 标签名\nprint(node.get('class'))              # 属性\nprint(''.join(node.itertext()).strip())   # 所有文本拼起来\nprint(node.text)                      # 仅第一个直接文本(常为None/空白)\n\nhtml_str = etree.tostring(node, encoding='unicode')  # 转回html` },
      ],
      pitfalls: [
        '<code>node.text</code> 是"开标签后紧挨着的那段文字"，被子标签隔开就取不到 —— 拼全文本用 itertext()。',
        'tostring 不传 encoding="unicode" 返回 bytes（带 b\' 前缀）。',
      ],
      related: ['xpath语法'],
      tags: ['文本', '属性', 'tostring'],
    },
  ],
});

MODULES.push({
  id: 'tqdm', name: 'tqdm', icon: '⏳', category: '爬虫',
  doc: 'https://tqdm.github.io/',
  desc: '进度条库：一行代码给循环加进度显示。',
  install: 'pip install tqdm',
  entries: [
    {
      name: 'tqdm', sig: 'tqdm(iterable, desc=, total=) / trange(n)',
      brief: '包住任何可迭代对象就是进度条。',
      params: [
        { n: 'desc', t: 'str', d: '进度条前缀文字' },
        { n: 'total', t: 'int', d: '总步数（生成器等未知长度时手动给）' },
      ],
      examples: [
        { title: '', code: `from tqdm import tqdm, trange\nimport time\n\nfor i in trange(100, desc='处理中'):\n    time.sleep(0.01)\n\nfor url in tqdm(urls, desc='下载'):\n    download(url)\n\n# 手动控制(循环体复杂时):\npbar = tqdm(total=len(files))\nfor f in files:\n    process(f)\n    pbar.update(1)\npbar.close()` },
      ],
      pitfalls: [
        'print 和 tqdm 混用会打乱进度条，用 <code>tqdm.write(text)</code> 输出。',
        'jupyter 里要用 <code>from tqdm.notebook import tqdm</code> 才有图形进度条。',
      ],
      related: ['pandas进度条'],
      tags: ['进度条', '循环'],
    },
    {
      name: 'pandas进度条', sig: 'tqdm.pandas() / df.groupby(...).progress_apply(fn)',
      brief: '给 pandas 的 apply/groupby 加进度条。',
      examples: [
        { title: '', code: `import pandas as pd\nfrom tqdm import tqdm\n\ntqdm.pandas(desc='处理行')\ndf['新列'] = df['文本'].progress_apply(clean_text)\ndf.groupby('城市').progress_apply(lambda g: g['金额'].sum())` },
      ],
      pitfalls: [
        '是 <code>progress_apply</code> 不是 apply —— 只有 import 后调用了 tqdm.pandas() 注册才有这个方法。',
        '向量化能解决的就别 apply（带不带进度条都慢）。',
      ],
      related: ['tqdm'],
      tags: ['pandas', 'apply', '进度条'],
    },
  ],
});

MODULES.push({
  id: 'selenium', name: 'selenium', icon: '🤹', category: '爬虫',
  doc: 'https://www.selenium.dev/zh-cn/documentation/',
  desc: '浏览器自动化老牌框架：驱动真实 Chrome 渲染页面，专治 JS 动态渲染和需要登录的页面。',
  install: 'pip install selenium  (4.6+ 自动管理驱动)',
  aliases: ['webdriver', '浏览器自动化'],
  tips: [
    'Selenium <b>4.6+</b> 自带驱动管理（Selenium Manager），不再需要手动下 chromedriver 配环境变量 —— 老教程的 Service()/驱动路径写法可以扔了。',
    '定位不到元素先怀疑三件事：① 元素在 iframe 里 ② 页面还没渲染完 ③ 在 Shadow DOM 里。',
  ],
  entries: [
    {
      name: '启动', sig: 'driver = webdriver.Chrome(options=opts)',
      brief: '启动浏览器：无头模式、UA、禁图等选项。',
      examples: [
        { title: '', code: `from selenium import webdriver\nfrom selenium.webdriver.chrome.options import Options\n\nopts = Options()\nopts.add_argument('--headless=new')          # 无界面(服务器必开)\nopts.add_argument('--window-size=1920,1080')\nopts.add_argument('user-agent=Mozilla/5.0 ... Chrome/120 ...')\n\ndriver = webdriver.Chrome(options=opts)\ndriver.get('https://www.baidu.com')\nprint(driver.title)\ndriver.quit()          # 用完必须关, 否则 chrome 进程残留` },
      ],
      pitfalls: [
        '无头参数新版是 <code>--headless=new</code>；旧的 --headless 更容易被网站识别为自动化浏览器。',
        'quit() 忘了调，Chrome 进程越积越多吃光内存 —— 用 try/finally 包住。',
        'Chrome 大版本升级后报 session not created：升级 selenium 让它重新管理驱动。',
      ],
      related: ['定位', '等待'],
      tags: ['启动', '无头', 'options'],
    },
    {
      name: '定位', sig: "driver.find_element(By.XPATH, '...') / driver.find_elements(By.CSS_SELECTOR, '...')",
      brief: '元素定位（4.x 唯一写法）：By 枚举 + 选择器。',
      params: [
        { n: 'By.ID / By.NAME', t: '-', d: '按 id / name 属性' },
        { n: 'By.XPATH', t: '-', d: '//div[@class="x"]//a，最灵活' },
        { n: 'By.CSS_SELECTOR', t: '-', d: 'div.item > a.title' },
        { n: 'By.LINK_TEXT / By.PARTIAL_LINK_TEXT', t: '-', d: '按链接文字' },
      ],
      examples: [
        { title: '', code: `from selenium.webdriver.common.by import By\n\nbox = driver.find_element(By.ID, 'kw')\nlinks = driver.find_elements(By.CSS_SELECTOR, 'div.result a')   # 复数返回列表\nel = driver.find_element(By.XPATH, '//input[@name="wd"]')\n\n# 拿信息:\nprint(el.text)                    # 可见文本\nprint(el.get_attribute('href'))   # 属性\nprint(el.tag_name)` },
      ],
      pitfalls: [
        '<b>find_element_by_id() 这类方法在 4.x 已删除</b>，老代码报 AttributeError，统一改 find_element(By.X, 值)。',
        'find_element 找不到立刻抛 NoSuchElementException；元素可能不存在就用 find_elements 判空列表。',
        '<b>元素在 iframe 里必须先 switch_to.frame(iframe元素)</b>，切进去才能定位；出来用 switch_to.default_content()。',
      ],
      related: ['启动', '操作', '等待'],
      tags: ['定位', 'xpath', 'selector', 'iframe'],
    },
    {
      name: '操作', sig: 'el.send_keys() / el.click() / el.clear() / Keys.RETURN / Select(el).select_by_value()',
      brief: '元素操作：输入、点击、下拉框、键盘、悬停。',
      examples: [
        { title: '', code: `from selenium.webdriver.common.keys import Keys\nfrom selenium.webdriver.support.ui import Select\nfrom selenium.webdriver import ActionChains\n\nbox = driver.find_element(By.NAME, 'wd')\nbox.clear()                          # 先清空(输入框常残留旧内容)\nbox.send_keys('python')\nbox.send_keys(Keys.RETURN)           # 回车\n\nSelect(driver.find_element(By.ID, 'city')).select_by_value('021')\n\nActionChains(driver).move_to_element(menu).perform()   # 悬停展开菜单` },
      ],
      pitfalls: [
        'click 报 element click intercepted：元素被浮层遮挡或还没就绪，先等待或关浮层。',
        'ActionChains 最后必须 .perform()，不调用啥都不发生。',
        'send_keys 对文件上传框直接传文件路径即可，不用碰系统弹窗。',
      ],
      related: ['定位', '等待'],
      tags: ['输入', '点击', '下拉', '悬停'],
    },
    {
      name: '等待', sig: "WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, 'x'))) / driver.implicitly_wait(5)",
      brief: '等待机制：显式等待（推荐）与隐式等待。',
      examples: [
        { title: '显式等待模板', code: `from selenium.webdriver.support.ui import WebDriverWait\nfrom selenium.webdriver.support import expected_conditions as EC\nfrom selenium.webdriver.common.by import By\n\nwait = WebDriverWait(driver, 10)\n\nel = wait.until(EC.presence_of_element_located((By.ID, 'content')))\nbtn = wait.until(EC.element_to_be_clickable((By.XPATH, '//button')))\nbtn.click()\n\n# 等 loading 消失:\nwait.until(EC.invisibility_of_element_located((By.CLASS_NAME, 'loading')))` },
      ],
      pitfalls: [
        '<b>time.sleep(3) 是最低级做法</b>：网络慢就取不到、网络快就白等 —— 用显式等待"等到条件成立"。',
        'presence_of_element_located 只要求在 DOM 里（不可见也算）；要点击用 element_to_be_clickable。',
        'implicitly_wait 与显式等待混用会叠加等待时间，二选一。',
      ],
      related: ['定位', '启动'],
      tags: ['等待', '超时', '不稳定'],
    },
    {
      name: '取数据', sig: "driver.page_source / driver.save_screenshot('x.png') / driver.execute_script('window.scrollTo(0, document.body.scrollHeight)')",
      brief: '拿渲染后的页面：源码交给 bs4、滚动触发懒加载、截图。',
      examples: [
        { title: 'selenium + bs4 黄金组合', code: `import time\nfrom bs4 import BeautifulSoup\n\ndriver.get(url)\nWebDriverWait(driver, 10).until(\n    EC.presence_of_element_located((By.CLASS_NAME, 'item')))\n\n# 滚到底触发懒加载:\nfor _ in range(3):\n    driver.execute_script('window.scrollTo(0, document.body.scrollHeight)')\n    time.sleep(1)\n\nsoup = BeautifulSoup(driver.page_source, 'lxml')   # 解析交给 bs4\nitems = soup.select('div.item')\n\ndriver.save_screenshot('page.png')   # 调试留证` },
      ],
      pitfalls: [
        '懒加载页面不滚动永远只有前几条数据。',
        'page_source 是<b>当时那一刻</b>的 DOM，之后页面又变了要重新取。',
        '渲染解析交给 bs4，比在 selenium 里逐个 find_element 抓数据舒服得多。',
      ],
      related: ['等待', '定位'],
      tags: ['截图', '滚动', 'page_source'],
    },
    {
      name: '反检测', sig: 'navigator.webdriver 特征 / undetected-chromedriver',
      brief: '减少被网站识别为自动化浏览器的手段。',
      examples: [
        { title: '', code: `# 检测情况可看: https://bot.sannysoft.com/\n\n# 方案1: 启动参数(基础, 部分站点有效)\nopts.add_argument('--disable-blink-features=AutomationControlled')\n\n# 方案2: undetected-chromedriver(推荐)\n# pip install undetected-chromedriver\nimport undetected_chromedriver as uc\ndriver = uc.Chrome()\ndriver.get(url)` },
      ],
      pitfalls: [
        '别上来就硬刚反爬：多数数据在 F12 Network 里有 XHR 接口，直接 requests 拿更省事。',
        'undetected-chromedriver 要跟随 Chrome 大版本更新，报错先升级它。',
        '遵守目标网站条款与法律边界，控制频率，只爬公开数据。',
      ],
      related: ['启动'],
      tags: ['反爬', '检测', 'undetected'],
    },
  ],
});

MODULES.push({
  id: 'playwright', name: 'playwright', icon: '🎭', category: '爬虫',
  doc: 'https://playwright.dev/python/docs/intro',
  desc: '微软出品的新一代浏览器自动化：比 selenium 快且稳，操作自动等待、可拦截网络接口。',
  install: 'pip install playwright && playwright install chromium',
  tips: [
    '装完库<b>还要装浏览器</b>：<code>playwright install chromium</code>（下载独立浏览器，不依赖系统 Chrome）。',
    '对比 selenium：元素操作<b>自动等待</b>（基本不用手写等待），API 更现代，新项目首选。',
  ],
  entries: [
    {
      name: '启动', sig: 'with sync_playwright() as p: browser = p.chromium.launch(headless=True)',
      brief: '同步 API 启动浏览器与页面。',
      examples: [
        { title: '同步写法(脚本最常用)', code: `from playwright.sync_api import sync_playwright\n\nwith sync_playwright() as p:\n    browser = p.chromium.launch(headless=True)\n    page = browser.new_page(\n        user_agent='Mozilla/5.0 ...',\n        viewport={'width': 1920, 'height': 1080},\n    )\n    page.goto('https://www.baidu.com', wait_until='domcontentloaded')\n    print(page.title())\n    browser.close()      # with 块结束也会清理\n\n# 其它浏览器: p.firefox / p.webkit` },
      ],
      pitfalls: [
        "报 Executable doesn't exist 就是没执行 <code>playwright install chromium</code>。",
        'playwright 分 sync 和 async 两套 API，import 错了报 RuntimeError；爬虫脚本用 sync 最省心。',
        '调试时 launch(headless=False) 开着界面，问题看得见。',
      ],
      related: ['定位操作', '等待'],
      tags: ['启动', 'browser'],
    },
    {
      name: '定位操作', sig: "page.locator('css选择器') / locator.click() / locator.fill('文本') / locator.text_content()",
      brief: '定位与操作元素（locator 是推荐入口）。',
      examples: [
        { title: '', code: `page.goto('https://example.com/login')\n\npage.locator('#username').fill('user1')     # fill = 清空+输入一步到位\npage.locator('#password').fill('pass1')\npage.locator('button:has-text("登录")').click()   # 按文字找按钮\n\npage.wait_for_load_state('networkidle')\n\nprint(page.locator('div.item').first.text_content())   # 第一个\n\nfor el in page.locator('ul > li').all():     # 全部遍历\n    print(el.inner_text())\n\n# xpath 写法: page.locator('xpath=//div[@class="x"]')\n# 常用: get_attribute('href') / count() / nth(2)` },
      ],
      pitfalls: [
        '<b>fill 自动清空再输入</b>，不用先 clear（selenium 迁移过来的肌肉记忆）。',
        'locator 是<b>惰性的</b>：定义时不查找，调用 click/count 时才查找，提前定义不会过期。',
        '严格模式：匹配到多个元素时 click/text_content 直接报错 —— 用 .first / .nth(i) / .all()。',
      ],
      related: ['启动', '等待', '抓取'],
      tags: ['locator', '点击', '输入'],
    },
    {
      name: '等待', sig: "page.wait_for_selector('.item') / page.wait_for_load_state('networkidle') / page.expect_response()",
      brief: '等待：多数场景自动等待，需要显式等的写法在这。',
      examples: [
        { title: '', code: `page.goto(url)\n\npage.wait_for_selector('div.item', timeout=10000)    # 等元素, 毫秒!\npage.wait_for_load_state('networkidle')              # 等网络空闲\n\n# 等接口返回, 直接拿 JSON(比解析页面更稳):\nwith page.expect_response(lambda r: 'api/data' in r.url) as ri:\n    page.locator('button.load').click()\ndata = ri.value.json()` },
      ],
      pitfalls: [
        '<b>timeout 单位是毫秒</b>（selenium 是秒），迁移注意。',
        'networkidle 在长轮询/持续请求的页面永远等不到而超时，改等具体选择器或接口响应。',
      ],
      related: ['定位操作', '抓取'],
      tags: ['等待', '超时', '响应'],
    },
    {
      name: '抓取', sig: "page.content() / page.screenshot(full_page=True) / page.on('response', fn)",
      brief: '拿渲染结果：HTML、整页截图、监听接口数据。',
      examples: [
        { title: 'content + bs4 / 截图 / 接口监听', code: `from bs4 import BeautifulSoup\n\nsoup = BeautifulSoup(page.content(), 'lxml')     # 渲染后的 HTML\nprint(soup.select_one('.title').text)\n\npage.screenshot(path='full.png', full_page=True) # 整页长截图\n\n# 监听所有接口响应:\ndef on_resp(resp):\n    if 'api/list' in resp.url:\n        print(resp.json())\npage.on('response', on_resp)\npage.goto(url)` },
      ],
      pitfalls: [
        '<b>能抓到接口就别解析页面</b>：F12 Network 找到数据接口后用 expect_response 或直接 requests 请求，快一个数量级。',
        'full_page 截图对超长页面（几万 px）可能超时，分段截。',
      ],
      related: ['等待', '定位操作'],
      tags: ['content', '截图', '接口拦截'],
    },
    {
      name: '登录态', sig: "context.storage_state(path='auth.json') / browser.new_context(storage_state='auth.json')",
      brief: '保存/复用登录态，爬需要登录的页面不用每次重登。',
      examples: [
        { title: '', code: `# 第一次: 登录后保存状态\ncontext = browser.new_context()\npage = context.new_page()\n# ...自动/人工登录...\ncontext.storage_state(path='auth.json')\n\n# 之后: 带登录态直接开爬\ncontext = browser.new_context(storage_state='auth.json',\n                              user_agent='Mozilla/5.0 ...')\npage = context.new_page()\npage.goto('https://example.com/user')   # 已是登录态` },
      ],
      pitfalls: [
        'storage_state 存的是 cookie+localStorage；强校验/验证码站点过期就要重新生成。',
        '无头指纹检测严格的站：先试 headless=False + 正常 UA + viewport，再考虑 playwright-stealth。',
      ],
      related: ['启动'],
      tags: ['登录态', 'cookie', '指纹'],
    },
  ],
});
