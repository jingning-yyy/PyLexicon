/* 爬虫工具包：urllib.parse / hashlib / base64 / pycryptodome / jsonpath / Pillow / execjs / tenacity */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'urllib.parse', name: 'urllib.parse', icon: '🔗', category: '爬虫',
  doc: 'https://docs.python.org/zh-cn/3/library/urllib.parse.html',
  desc: 'URL 拆解与编解码标准库：quote/unquote/urlencode/urljoin，爬虫拼链接必备。',
  install: false,
  aliases: ['urlencode', 'url编码', 'urlparse'],
  entries: [
    {
      name: 'quote-unquote', sig: "quote('中文') -> '%E4%B8%AD%E6%96%87' / unquote('%E4%B8%AD%E6%96%87') -> '中文'",
      brief: 'URL 编码与解码（搜索词、路径里的中文）。',
      examples: [
        { title: '', code: `from urllib.parse import quote, unquote, quote_plus\n\nquote('数据 分析')          # '%E6%95%B0%E6%8D%AE%20%E5%88%86%E6%9E%90'\nunquote('%E6%95%B0%E6%8D%AE')  # '数据'\nquote_plus('数据 分析')      # 空格变 + (表单风格)\nunquote_plus('a+b')          # 'a b'` },
      ],
      pitfalls: [
        '编码时必须和网站一致：先 <code>.encode("utf-8")</code>；有些老站用 GBK，<code>quote("中文".encode("gbk"))</code>。',
        '<b>quote 默认不编码 /</b>（safe="/"），要编码路径分隔符用 <code>quote(s, safe="")</code>。',
        '解码后还是乱码：说明原编码不是 utf-8，试 unquote(s, encoding="gbk")。',
      ],
      related: ['urlencode', 'urljoin'],
      tags: ['编码', 'url', '中文'],
    },
    {
      name: 'urlencode', sig: "urlencode({'q': 'python', 'page': 1}) -> 'q=python&page=1' / parse_qs('a=1&b=2')",
      brief: '字典 ↔ 查询字符串 互转。',
      examples: [
        { title: '', code: `from urllib.parse import urlencode, parse_qs, parse_qsl\n\nqs = urlencode({'q': '数据', 'page': 1})   # q=%E6%95%B0%E6%8D%AE&page=1\nurl = 'https://s.example.com/search?' + qs\n\nparse_qs('a=1&b=x&b=y')      # {'a': ['1'], 'b': ['x', 'y']}  值是列表!\nparse_qsl('a=1&b=2')         # [('a', '1'), ('b', '2')]  元组列表` },
      ],
      pitfalls: [
        '<b>parse_qs 的值是列表</b>，取单个要用 <code>parse_qs(s)["a"][0]</code>，忘下标是最常见的报错。',
        'requests 里传 params=dict 就够了，urlencode 用在手工拼 URL/分析场景。',
      ],
      related: ['quote-unquote'],
      tags: ['查询参数', '编码'],
    },
    {
      name: 'urljoin', sig: "urljoin('https://x.com/list/1', 'page/2') / urlsplit(url)",
      brief: '相对链接转绝对链接（爬虫翻页/详情页必备），urlsplit 拆解 URL。',
      examples: [
        { title: '', code: `from urllib.parse import urljoin, urlsplit\n\nbase = 'https://x.com/list/index.html'\nurljoin(base, 'page/2.html')     # https://x.com/list/page/2.html\nurljoin(base, '/detail/9')       # https://x.com/detail/9  以 / 开头=从根拼\nurljoin(base, '?page=3')         # https://x.com/list/index.html?page=3\n\ns = urlsplit('https://u:pw@x.com:8080/a/b?q=1')\nprint(s.netloc, s.path, s.query)  # u:pw@x.com:8080 /a/b q=1` },
      ],
      pitfalls: [
        '<b>相对路径以 / 开头是从域名根拼起</b>，不带 / 是相对当前路径 —— 翻页链接拼错多半是这个原因。',
        '从 a 标签拿到的 href 可能是 javascript:; 或空串，先过滤再 urljoin。',
      ],
      related: ['quote-unquote'],
      tags: ['拼接', '翻页', '相对路径'],
    },
  ],
});

MODULES.push({
  id: 'hashlib', name: 'hashlib', icon: '🔏', category: '爬虫',
  doc: 'https://docs.python.org/zh-cn/3/library/hashlib.html',
  desc: '哈希摘要标准库：MD5/SHA256/HMAC，接口参数签名、密码校验、文件去重。',
  install: false,
  aliases: ['md5', 'sha256', 'hmac', '哈希', '签名'],
  tips: [
    '哈希是<b>单向的</b>（不能还原）；MD5 用于校验/缓存键还行，用于密码已不安全（ collision + 彩虹表）。',
    '爬虫里最常见的套路：把参数按规则排序拼接 → HMAC-SHA256 → hex/base64 放进请求头，和网页 JS 里的加密函数对齐。',
  ],
  entries: [
    {
      name: '摘要算法', sig: "hashlib.md5(b'data').hexdigest() / hashlib.sha256(b'data').hexdigest()",
      brief: 'MD5 / SHA1 / SHA256 摘要。',
      examples: [
        { title: '', code: `import hashlib\n\nh = hashlib.md5('你好'.encode('utf-8'))   # 必须 bytes!\nprint(h.hexdigest())                       # 32位十六进制字符串\n\n# 分段喂大数据:\nsha = hashlib.sha256()\nsha.update(b'part1-')\nsha.update(b'part2')\nprint(sha.hexdigest())\n\nprint(hashlib.sha256(b'x').digest())       # 原始 bytes (16进制外的形态)` },
      ],
      pitfalls: [
        '<b>输入必须是 bytes</b>：字符串先 .encode("utf-8")，传 str 直接 TypeError —— 第一大坑。',
        '同一个内容不管分几次 update，结果和一次喂入相同。',
        'hexdigest() 是十六进制字符串，digest() 是 bytes，接口要哪种看文档。',
      ],
      related: ['hmac'],
      tags: ['md5', 'sha256', '摘要', '哈希'],
    },
    {
      name: 'hmac', sig: "hmac.new(key, msg, hashlib.sha256).hexdigest()",
      brief: '带密钥的哈希（HMAC），接口签名的事实标准。',
      examples: [
        { title: '', code: `import hmac, hashlib\n\nkey = b'my-secret-key'\nmsg  = 'timestamp=1699999999&symbol=BTC'.encode()\nsign = hmac.new(key, msg, hashlib.sha256).hexdigest()\n# 有些接口要 base64:\nimport base64\nsign_b64 = base64.b64encode(\n    hmac.new(key, msg, hashlib.sha256).digest()).decode()` },
      ],
      pitfalls: [
        'key 和 msg 都要是 bytes；hexdigest/digest 选哪个、签名放 header 还是 body，一切以对方文档/JS 为准。',
        '拼参数的<b>顺序和分隔符</b>必须和对方算法完全一致（常按 key 排序后 & 拼接）。',
      ],
      related: ['摘要算法'],
      tags: ['hmac', '签名', '加密'],
    },
    {
      name: '文件哈希', sig: '分块读取大文件计算 md5/sha256',
      brief: '大文件校验/去重的标准写法（不全量进内存）。',
      examples: [
        { title: '', code: `import hashlib\n\ndef file_md5(path, chunk=1024 * 1024):\n    h = hashlib.md5()\n    with open(path, 'rb') as f:      # 注意 rb\n        while True:\n            data = f.read(chunk)\n            if not data:\n                break\n            h.update(data)\n    return h.hexdigest()` },
      ],
      pitfalls: [
        'open 必须 "rb" 二进制模式，文本模式会把 \\r\\n 做转换导致哈希对不上。',
      ],
      related: ['摘要算法'],
      tags: ['文件', '校验', '去重'],
    },
  ],
});

MODULES.push({
  id: 'base64', name: 'base64', icon: '🔠', category: '爬虫',
  doc: 'https://docs.python.org/zh-cn/3/library/base64.html',
  desc: 'Base64 编解码标准库：图片内嵌、密文传输的"外衣"（注意它是编码不是加密）。',
  install: false,
  aliases: ['b64', '编码'],
  entries: [
    {
      name: 'b64encode', sig: "base64.b64encode(b'...') -> bytes / base64.b64decode(b'...')",
      brief: '标准 Base64 编解码（输入输出都是 bytes）。',
      examples: [
        { title: '', code: `import base64\n\ns = '你好'\nb = base64.b64encode(s.encode('utf-8'))   # b'5L2g5aW9'\nprint(b.decode())                          # '5L2g5aW9' 转成 str\n\nraw = base64.b64decode('5L2g5aW9').decode('utf-8')\nprint(raw)                                 # '你好'` },
      ],
      pitfalls: [
        '<b>输入输出都是 bytes</b>：str 进去前 encode，出来后 decode —— 忘了就 b"..." 满屏。',
        'b64decode 遇到长度不对（没补位 =）报 binascii.Error；网页里抠出来的串先 strip() 去空白。',
        'Base64 不是加密，别拿来"保密"。',
      ],
      related: ['urlsafe', '图片dataURI'],
      tags: ['编码', 'base64'],
    },
    {
      name: 'urlsafe', sig: "base64.urlsafe_b64encode(b) / urlsafe_b64decode(b)",
      brief: 'URL 安全版：把 + / 换成 - _（JWT、部分接口签名用）。',
      examples: [
        { title: '', code: `import base64\ntoken = base64.urlsafe_b64encode(b'payload').decode().rstrip('=')\n# 解码时补回 padding:\npadded = token + '=' * (-len(token) % 4)\nbase64.urlsafe_b64decode(padded)` },
      ],
      pitfalls: [
        'JWT 的段把 padding（=）去掉了，解码前要按上面方式补齐，否则 binascii.Error。',
        '标准版和 urlsafe 版不通用，确认对方用的是哪种。',
      ],
      related: ['b64encode'],
      tags: ['jwt', 'url安全'],
    },
    {
      name: '图片dataURI', sig: "'data:image/png;base64,' + b64encode(图片bytes)",
      brief: '图片转 base64 内嵌网页/接口互传。',
      examples: [
        { title: '', code: `import base64\n\nwith open('chart.png', 'rb') as f:\n    b64 = base64.b64encode(f.read()).decode()\n\nhtml = f'<img src="data:image/png;base64,{b64}">'\n# 反向: 从 dataURI 还原图片\ndata = 'data:image/png;base64,iVBORw0KG...'\nraw = base64.b64decode(data.split(',')[1])\nopen('out.png', 'wb').write(raw)` },
      ],
      pitfalls: [
        'dataURI 前缀后的才是纯 base64，解码前 <b>split(",") 取后半段</b>。',
        'base64 会让体积涨 ~1/3，大图别内嵌。',
      ],
      related: ['b64encode'],
      tags: ['图片', '内嵌', 'html'],
    },
  ],
});

MODULES.push({
  id: 'pycryptodome', name: 'pycryptodome', icon: '🛡️', category: '爬虫',
  doc: 'https://pycryptodome.readthedocs.io/',
  desc: 'AES/DES/RSA 加解密库：解密网页接口的加密参数（导入名是 Crypto）。',
  install: 'pip install pycryptodome',
  pkg: 'pycryptodome',
  aliases: ['Crypto', 'AES', '解密', '加密'],
  tips: [
    '<b>pip 装 pycryptodome，代码里 import 的是 Crypto</b>（from Crypto.Cipher import AES）；网上教程写的 pycrypto 是废弃老包，别装。',
    '解密网页参数三步：F12 找到加密 JS → 确认算法/模式/key/iv → Python 复现；key/iv 通常是 16 字节字符串或 base64/hex。',
  ],
  entries: [
    {
      name: 'AES-ECB', sig: "AES.new(key.encode(), AES.MODE_ECB) / cipher.encrypt(pad(data, 16))",
      brief: 'ECB 模式加解密（无 IV，很多网站在用）。',
      examples: [
        { title: '', code: `from Crypto.Cipher import AES\nfrom Crypto.Util.Padding import pad, unpad\nimport base64\n\nkey = b'0123456789abcdef'                    # 16字节(AES-128)\ndata = '要加密的内容'.encode()\n\ncipher = AES.new(key, AES.MODE_ECB)\nct = cipher.encrypt(pad(data, 16))\nprint(base64.b64encode(ct).decode())         # 常见的传输形态\n\n# 解密\ncipher2 = AES.new(key, AES.MODE_ECB)\npt = unpad(cipher2.decrypt(base64.b64decode(ct)), 16)\nprint(pt.decode())` },
      ],
      pitfalls: [
        '<b>key 长度必须是 16/24/32 字节</b>（对应 AES-128/192/256），短了长了都 ValueError —— 数一数。',
        '明文长度不是 16 的倍数必须先 pad，直接 encrypt 报错。',
        'ECB 安全性差但网站常用；同一段明文密文相同是它的特征。',
      ],
      related: ['AES-CBC', 'Padding'],
      tags: ['aes', 'ecb', '解密'],
    },
    {
      name: 'AES-CBC', sig: "AES.new(key, AES.MODE_CBC, iv) / cipher.encrypt(pad(data, 16))",
      brief: 'CBC 模式（带 IV 偏移量）加解密。',
      examples: [
        { title: '', code: `from Crypto.Cipher import AES\nfrom Crypto.Util.Padding import pad, unpad\n\nkey = b'1234567890abcdef'\niv  = b'abcdef0987654321'                    # 初始向量, 16字节\n\ncipher = AES.new(key, AES.MODE_CBC, iv)\nct = cipher.encrypt(pad(b'hello', 16))\n\n# 解密要用同一个 key 和 iv:\ncipher2 = AES.new(key, AES.MODE_CBC, iv)\nprint(unpad(cipher2.decrypt(ct), 16))` },
      ],
      pitfalls: [
        '<b>解密必须用加密时同一个 IV</b>；网页场景 IV 常写死在 JS 里（搜 "iv"），或取密文前 16 字节。',
        'mode 名字对照网页 JS：CBC/ECB/CFB/CTR，Python 对应 AES.MODE_xxx，模式对不上解出来是乱码。',
      ],
      related: ['AES-ECB', 'Padding'],
      tags: ['aes', 'cbc', 'iv'],
    },
    {
      name: 'Padding', sig: "pad(data, 16, style='pkcs7') / unpad(data, 16)",
      brief: '块填充与去填充（块密码要求明文是块大小的整数倍）。',
      examples: [
        { title: '', code: `from Crypto.Util.Padding import pad, unpad\n\npad(b'abc', 16)        # b'abc\\x0d\\x0d...\\x0d' 补到16字节\nunpad(pad(b'abc', 16), 16)   # b'abc'` },
      ],
      pitfalls: [
        '<b>解密后 unpad 报错基本等于 key/iv/模式错了</b>（解出的不是合法填充），别纠结 padding 本身。',
        'DES 用 8 字节块，DES3 是 8 的倍数，块大小跟着算法走。',
      ],
      related: ['AES-ECB', 'AES-CBC'],
      tags: ['填充', 'pkcs7'],
    },
    {
      name: '套路速查', sig: '密文形态: base64 / hex / bytes',
      brief: '实战中密文的几种"包装"与排查顺序。',
      examples: [
        { title: '', code: `# 网页给到的密文通常有外衣, 先剥掉:\nimport base64, binascii\n\nraw_b64 = base64.b64decode('UmF3RGF0YQ==')     # base64 型\nraw_hex = binascii.unhexlify('52617744617461')  # hex 型(16进制字符串)\n\n# 排查顺序: 1.算法(AES?DES?) 2.模式(CBC/ECB) 3.key 4.iv 5.外衣(base64/hex)\n# key 若是字符串形式给出, 记得 .encode(); 若是 hex 字符串, bytes.fromhex(key)` },
      ],
      pitfalls: [
        'key 明明看着对还解不开：多半 key 本身是 hex/base64 编码的，先转 bytes 再用。',
        'DES 的 key 是 8 字节、3DES 是 24 字节，别拿 AES 的 16 字节套。',
      ],
      related: ['AES-CBC', 'AES-ECB'],
      tags: ['排查', 'hex', 'base64'],
    },
  ],
});

MODULES.push({
  id: 'jsonpath', name: 'jsonpath', icon: '🧭', category: '爬虫',
  doc: 'https://pypi.org/project/jsonpath/',
  desc: '类 XPath 的 JSON 取值语法：一行取深层字段，接口数据分析利器。',
  install: 'pip install jsonpath',
  entries: [
    {
      name: '基础', sig: "from jsonpath import jsonpath / jsonpath(data, '$..name')",
      brief: '用表达式从嵌套 dict/list 里取值。',
      examples: [
        { title: '', code: `from jsonpath import jsonpath\n\ndata = {'store': {'book': [\n    {'title': 'a', 'price': 10},\n    {'title': 'b', 'price': 25},\n]}}\n\njsonpath(data, '$.store.book[*].title')   # ['a', 'b']\njsonpath(data, '$..price')                # [10, 25]  .. 任意层级\njsonpath(data, '$..book[?(@.price<15)]')  # 条件过滤\n\nres = jsonpath(data, '$..name')           # 找不到时返回 False!\nif res:\n    print(res[0])` },
      ],
      pitfalls: [
        '<b>找不到返回 False 而不是 None/[]</b>，判断用 if res:，直接 len(res) 会 TypeError。',
        '返回永远是<b>列表</b>（哪怕只有一个结果），取值 [0]。',
      ],
      related: ['常用表达式'],
      tags: ['json', '提取', 'xpath'],
    },
    {
      name: '常用表达式', sig: '$ 根 / . 子 / .. 递归 / [n] 索引 / [*] 全部 / ?() 过滤',
      brief: 'jsonpath 语法速查表。',
      params: [
        { n: '$', t: '-', d: '根节点，表达式都从它开始' },
        { n: '. / ..', t: '-', d: '下一级 / 任意层级递归' },
        { n: '[0] / [-1]', t: '-', d: '索引（负数从后）' },
        { n: '[*] / [*]', t: '-', d: '全部元素' },
        { n: '[?(@.price<10)]', t: '-', d: '按字段条件过滤，@ 是当前元素' },
      ],
      examples: [
        { title: '', code: `from jsonpath import jsonpath\njsonpath(d, '$.data.list[0].id')            # 精确路径\njsonpath(d, '$..id')                        # 所有叫 id 的字段\njsonpath(d, '$..items[?(@.status=="on")]')  # status 为 on 的项\njsonpath(d, '$..book[(@.length-1)]')        # 最后一个` },
      ],
      pitfalls: [
        '字符串条件里的引号用双引号 <code>?(@.k=="v")</code>，单引号部分版本不认。',
        '路径写错不报错只返回 False —— 表达式调试先从短的写起，一层层加。',
      ],
      related: ['基础'],
      tags: ['语法', '速查'],
    },
  ],
});

MODULES.push({
  id: 'Pillow', name: 'Pillow', icon: '🖼️', category: '图像与视频处理',
  doc: 'https://pillow.readthedocs.io/',
  desc: '图片处理标准库（PIL 的现代版）：读写、缩放、裁剪、验证码预处理。',
  install: 'pip install pillow',
  pkg: 'pillow',
  aliases: ['PIL', 'pillow', '图片'],
  tips: [
    '<b>import 名是 PIL</b>，pip 装的是 pillow：from PIL import Image。',
    '注意坐标体系：原点左上角，y 向下；box 顺序是 (左, 上, 右, 下)。',
  ],
  entries: [
    {
      name: 'open-save', sig: "Image.open('a.webp').convert('RGB').save('a.jpg', quality=90)",
      brief: '打开、格式转换、保存。',
      examples: [
        { title: '', code: `from PIL import Image\n\nimg = Image.open('a.webp')\nprint(img.size, img.mode)        # (1920, 1080) RGB\nimg.convert('RGB').save('a.jpg', quality=90)   # webp->jpg\n\nimg2 = Image.new('RGB', (800, 600), 'white')   # 新建白底画布\nimg2.save('blank.png')` },
      ],
      pitfalls: [
        '<b>PNG 转 JPG 必须 convert("RGB")</b>（PNG 可能带透明通道 RGBA），否则报 cannot write mode RGBA。',
        'save 的 quality 只对 jpg 有效；文件被占用时 save 报 PermissionError（Windows 打开着图片看）。',
      ],
      related: ['缩放裁剪', 'numpy互转'],
      tags: ['图片', '格式转换', '保存'],
    },
    {
      name: '缩放裁剪', sig: 'img.resize((w, h)) / img.crop((l, t, r, b)) / img.thumbnail((200, 200))',
      brief: '缩放、裁剪、等比缩略图。',
      examples: [
        { title: '', code: `from PIL import Image\nimg = Image.open('a.jpg')\n\nimg.resize((800, 600))                 # 强制拉伸到指定尺寸\nimg.crop((100, 50, 500, 350))          # 裁剪 (左,上,右,下)\n\nsmall = img.copy()\nsmall.thumbnail((200, 200))            # 等比缩到不超过200x200, 原地修改\nsmall.save('thumb.jpg')\n\nimg.rotate(90, expand=True)            # 旋转` },
      ],
      pitfalls: [
        'crop 的 box 是 (左, 上, 右, 下)，右和下是<b>开区间边界</b>，取反了裁出来是空/错位。',
        '<b>thumbnail 是原地修改</b>且只缩小不放大，返回 None；resize 返回新图。',
      ],
      related: ['open-save'],
      tags: ['缩放', '裁剪', 'thumbnail'],
    },
    {
      name: '验证码预处理', sig: "img.convert('L') / img.point(lambda x: 0 if x < 140 else 255)",
      brief: '灰度化、二值化 —— 打码/OCR 前的常规操作。',
      examples: [
        { title: '', code: `from PIL import Image\n\ncode = Image.open('captcha.png').convert('L')      # 灰度\n# 二值化: 阈值以下的点变黑, 其余变白\nbw = code.point(lambda x: 0 if x < 140 else 255)\nbw = bw.resize((bw.width * 2, bw.height * 2))      # 放大提高识别率\nbw.save('bw.png')\n\n# 加噪线/干扰点:\nfrom PIL import ImageFilter\nbw.filter(ImageFilter.MedianFilter())              # 中值滤波去噪点` },
      ],
      pitfalls: [
        '阈值 140 不是万能的，不同验证码试 100~200；放大 2 倍常能明显提升 OCR 命中率。',
        '别花太多时间手搓预处理，通用验证码直接上 ddddocr（pip install ddddocr）更快。',
      ],
      related: ['numpy互转', '缩放裁剪'],
      tags: ['验证码', '二值化', 'ocr'],
    },
    {
      name: 'numpy互转', sig: 'np.array(img) / Image.fromarray(arr)',
      brief: '图片 ↔ numpy 数组（配合 cv2/模型）。',
      examples: [
        { title: '', code: `import numpy as np\nfrom PIL import Image\n\nimg = Image.open('a.jpg')\narr = np.array(img)            # (H, W, 3) uint8\nprint(arr.shape)\narr[..., 0] = 0                # 干掉红色通道\nImage.fromarray(arr).save('no_red.jpg')` },
      ],
      pitfalls: [
        'PIL 是 (W, H)，numpy 数组是 (H, W, C) —— shape 的前两位和 size 是反的。',
        'fromarray 要求数组是 uint8 且连续，float 数组先 astype(np.uint8)。',
      ],
      related: ['open-save'],
      tags: ['numpy', '数组'],
    },
  ],
});

MODULES.push({
  id: 'execjs', name: 'execjs', icon: '⚙️', category: '爬虫',
  doc: 'https://pypi.org/project/PyExecJS/',
  desc: '在 Python 里执行 JavaScript：直接复用网页里的加密函数，爬虫解参数利器。',
  install: 'pip install PyExecJS  (还需本机安装 Node.js)',
  pkg: 'PyExecJS',
  aliases: ['js', 'node'],
  tips: [
    '<b>本机必须装 Node.js</b>（node -v 能出版本号），execjs 只是桥接器。',
    '复制网页加密 JS 时把整个自包含的函数（含依赖函数）一起抠出来存成 .js 文件。',
  ],
  entries: [
    {
      name: 'compile-call', sig: "ctx = execjs.compile(open('a.js', encoding='utf-8').read()) / ctx.call('函数名', 参数)",
      brief: '加载 JS 并调用其中的函数。',
      examples: [
        { title: '', code: `import execjs\n\n# sign.js 内容: function getSign(t, e) { return t + e; }\nwith open('sign.js', encoding='utf-8') as f:\n    ctx = execjs.compile(f.read())\n\nresult = ctx.call('getSign', 'abc', '123')   # 函数名, 参数...\nprint(result)   # 'abc123'` },
      ],
      pitfalls: [
        "报 <code>Couldn't find Node.js</code>：没装 Node 或没进 PATH。",
        'JS 里的函数必须<b>有名字</b>（不是匿名箭头函数赋值给 window.xx 的也要能取到），必要时在文件末尾加 function 包装。',
        'compile 会执行 JS 顶层代码，JS 语法错误在这一步就抛异常。',
      ],
      related: ['常见坑'],
      tags: ['js', '加密', '签名'],
    },
    {
      name: '传参与返回', sig: "ctx.call('fn', str, 123, {'a': 1}, [1, 2])",
      brief: 'Python ↔ JS 的数据类型转换。',
      examples: [
        { title: '', code: `import json, execjs\n\n# 基本类型/dict/list 自动互转\nctx.call('fn', 'text', 123, {'k': [1, 2]})\n\n# 复杂嵌套/大对象: 建议传 JSON 字符串, JS 里 JSON.parse\npayload = json.dumps({'ts': 1699999999, 'data': [1, 2, 3]})\nctx.call('fn2', payload)` },
      ],
      pitfalls: [
        'dict/list 可以直接传（内部走 JSON），但 JS 侧收到的是普通对象不是 Python 对象。',
        '返回 undefined 在 Python 里是 None；JS 抛异常会原样转成 Python 异常。',
      ],
      related: ['compile-call'],
      tags: ['类型', 'json'],
    },
    {
      name: '常见坑', sig: 'window/document 缺失 / 性能 / 调试',
      brief: '复刻网页加密 JS 的三大高频问题。',
      examples: [
        { title: '', code: `# 1. 报 window/document/navigator is not defined:\n#    浏览器专属对象在 Node 里没有 -> 在 js 文件开头补空壳:\n#    var window = this; var document = {};\n\n# 2. 报某函数未定义: 抠 JS 时漏了依赖函数, 按报错函数名回网页 Sources 里继续找\n\n# 3. 大量调用慢: execjs 每次调用起一个 node 进程\n#    高频场景改成: node 单独写个 http 服务, Python 用 requests 调` },
      ],
      pitfalls: [
        '先看加密 JS 是不是 webpack 打包的 —— 打包过的要连加载器一起抠，或直接补环境跑整个文件。',
        '有的站点加密就在请求头 cookie 里做文章，先确认哪个参数在变、怎么变，再决定抠不抠 JS。',
      ],
      related: ['compile-call'],
      tags: ['报错', '调试', '补环境'],
    },
  ],
});

MODULES.push({
  id: 'tenacity', name: 'tenacity', icon: '🔁', category: '爬虫',
  doc: 'https://tenacity.readthedocs.io/',
  desc: '重试装饰器：一行注解让函数失败自动重试，配合条件停止/退避策略。',
  install: 'pip install tenacity',
  entries: [
    {
      name: 'retry基础', sig: '@retry(stop=stop_after_attempt(3), wait=wait_fixed(2))',
      brief: '失败自动重试的最小配置。',
      examples: [
        { title: '', code: `from tenacity import retry, stop_after_attempt, wait_fixed\n\n@retry(stop=stop_after_attempt(3), wait=wait_fixed(2))\ndef fetch(url):\n    r = requests.get(url, timeout=10)\n    r.raise_for_status()\n    return r.text\n\n# 3 次都失败会抛 RetryError(默认把最后异常包在里面)` },
      ],
      pitfalls: [
        '<b>裸 @retry() 是无限重试</b>！网络挂了会死循环，永远写上 stop。',
        '重试后还失败默认抛 tenacity.RetryError（不是原始异常），想抛原始异常加 <code>reraise=True</code>。',
      ],
      related: ['策略组合'],
      tags: ['重试', '装饰器', '稳定性'],
    },
    {
      name: '策略组合', sig: 'stop_after_attempt / stop_after_delay / wait_exponential / retry_if_exception_type',
      brief: '何时停、间隔多久、哪些异常才重试。',
      examples: [
        { title: '', code: `from tenacity import (retry, stop_after_attempt, stop_after_delay,\n                      wait_exponential, retry_if_exception_type)\nimport requests\n\n@retry(\n    stop=(stop_after_attempt(5) | stop_after_delay(30)),   # 任一满足就停\n    wait=wait_exponential(multiplier=1, max=10),           # 1,2,4,8,10 秒退避\n    retry=retry_if_exception_type(requests.Timeout),       # 只有超时才重试\n    reraise=True,\n)\ndef fetch(url):\n    return requests.get(url, timeout=5).text` },
      ],
      pitfalls: [
        'wait_exponential 指数退避是对付限流的标配，比固定间隔礼貌得多。',
        '4xx 类错误（参数错）重试没有意义，用 retry_if_exception_type 只重试超时/5xx。',
      ],
      related: ['retry基础', '返回条件'],
      tags: ['退避', '策略'],
    },
    {
      name: '返回条件', sig: "@retry(retry=retry_if_result(lambda r: r is None)) / before_sleep_log",
      brief: '按返回值重试（拿到空结果也算失败）与重试日志。',
      examples: [
        { title: '', code: `from tenacity import retry, retry_if_result, retry_if_not_result, before_sleep_log\nimport logging\n\nlogger = logging.getLogger(__name__)\n\n@retry(retry=retry_if_result(lambda r: r is None or r == ''),\n       stop=stop_after_attempt(3),\n       before_sleep=before_sleep_log(logger, logging.WARNING))\ndef parse(html):\n    ...  # 解析失败返回 None 会触发重试` },
      ],
      pitfalls: [
        'retry_if_result 和 retry_if_exception_type 可以用 | 组合：结果不对或抛异常都重试。',
        '重试日志建议一定加，不然线上静默重试 30 次你都不知道。',
      ],
      related: ['策略组合'],
      tags: ['结果重试', '日志'],
    },
  ],
});
