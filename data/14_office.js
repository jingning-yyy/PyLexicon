/* 办公自动化：python-docx / python-pptx / pypdf / pdfplumber / email / schedule */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'docx', name: 'python-docx', icon: '📘', category: '自动化与效率',
  doc: 'https://python-docx.readthedocs.io/',
  desc: 'Word(.docx) 读写：批量生成报告、合同、替换模板内容。',
  install: 'pip install python-docx',
  pkg: 'python-docx',
  aliases: ['docx', 'word'],
  tips: [
    'import 名是 <code>docx</code>：from docx import Document。',
    'Word 的核心概念：Document → Paragraph(段落) → Run(同格式的一段文字)；改字体格式基本都要操作 run。',
  ],
  entries: [
    {
      name: '读文档', sig: "Document('a.docx') / doc.paragraphs / doc.tables",
      brief: '读取段落、表格与样式信息。',
      examples: [
        { title: '', code: `from docx import Document\n\ndoc = Document('报告.docx')\nfor i, p in enumerate(doc.paragraphs):\n    if p.text.strip():\n        print(p.style.name, '|', p.text)   # 样式名(Heading 1等) + 内容\n\nfor table in doc.tables:\n    for row in table.rows:\n        print([c.text for c in row.cells])` },
      ],
      pitfalls: [
        '<b>文本框、图片、页眉页脚里的文字读不到</b>（不在 paragraphs 里），这类需求改用 win32com 或模板替换。',
        'paragraphs 不含表格里的段落，表格走 doc.tables。',
      ],
      related: ['写文档', '表格操作'],
      tags: ['读取', 'word', '段落'],
    },
    {
      name: '写文档', sig: "doc.add_heading / add_paragraph / add_picture / doc.save('out.docx')",
      brief: '生成文档：标题、段落、图片、分页。',
      examples: [
        { title: '', code: `from docx import Document\nfrom docx.shared import Pt, Cm\n\ndoc = Document()\ndoc.add_heading('月度报告', level=1)\np = doc.add_paragraph('本月销售额')\nrun = p.add_run(' 1200 万')\nrun.bold = True\nrun.font.size = Pt(14)\n\ndoc.add_picture('chart.png', width=Cm(15))\ndoc.add_page_break()\ndoc.save('报告_2024-05.docx')     # 必须save!` },
      ],
      pitfalls: [
        '改完不 save 全白干（和 openpyxl 一个毛病）。',
        'add_paragraph 返回段落对象，要"一句话里部分文字变粗"就用 p.add_run 分段设格式。',
      ],
      related: ['读文档', '中文字体'],
      tags: ['生成', '报告', '保存'],
    },
    {
      name: '表格操作', sig: "doc.add_table(rows=3, cols=4, style='Table Grid')",
      brief: '建表、填单元格、遍历。',
      examples: [
        { title: '', code: `table = doc.add_table(rows=1, cols=3, style='Table Grid')   # 带边框\nhdr = table.rows[0].cells\nhdr[0].text, hdr[1].text, hdr[2].text = '城市', '销量', '同比'\n\nfor city, sales, yoy in data:\n    cells = table.add_row().cells\n    cells[0].text, cells[1].text, cells[2].text = city, str(sales), yoy` },
      ],
      pitfalls: [
        "<b>不指定 style 的表格没有边框</b>，一般用 'Table Grid'；模板里没有该样式时报 KeyError，从模板文档创建即可。",
        'cell.text 赋值会清掉原格式；要保格式用 cell.paragraphs[0].add_run()。',
      ],
      related: ['写文档'],
      tags: ['表格'],
    },
    {
      name: '中文字体', sig: "run.font.name + run._element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')",
      brief: '设置中文字体的标准两步（只设 font.name 中文不生效）。',
      examples: [
        { title: '', code: `from docx import Document\nfrom docx.oxml.ns import qn\nfrom docx.shared import Pt\n\ndoc = Document()\nrun = doc.add_paragraph('中文测试').runs[0]\nrun.font.name = 'Times New Roman'                       # 西文字体\nrun._element.rPr.rFonts.set(qn('w:eastAsia'), '微软雅黑')  # 中文字体\nrun.font.size = Pt(12)\ndoc.save('font.docx')` },
      ],
      pitfalls: [
        '<b>Word 中西文字体是分开的</b>：只设 font.name 时中文仍是默认宋体，必须再设 w:eastAsia。',
      ],
      related: ['写文档'],
      tags: ['字体', '中文', '格式'],
    },
  ],
});

MODULES.push({
  id: 'pptx', name: 'python-pptx', icon: '📊', category: '自动化与效率',
  doc: 'https://python-pptx.readthedocs.io/',
  desc: '生成/修改 PowerPoint(.pptx)：周报、批量出图、往模板里填内容。',
  install: 'pip install python-pptx',
  pkg: 'python-pptx',
  aliases: ['ppt', 'powerpoint'],
  entries: [
    {
      name: '创建与版式', sig: "Presentation() / prs.slide_layouts[1] / slide.shapes.title",
      brief: '新建演示文稿并按版式加页。',
      examples: [
        { title: '', code: `from pptx import Presentation\n\nprs = Presentation()\nlayout = prs.slide_layouts[1]          # 1=标题+内容(随模板不同)\nslide = prs.slides.add_slide(layout)\n\nslide.shapes.title.text = '2024 年度总结'\nbody = slide.placeholders[1]\nbody.text = '第一点\\n第二点'\n\nprs.save('demo.pptx')` },
      ],
      pitfalls: [
        '<b>placeholders 的编号取决于模板</b>（正文常是 1），不确定就遍历 <code>for ph in slide.placeholders: print(ph.placeholder_format.idx, ph.name)</code>。',
        '用模板文件改：<code>Presentation("模板.pptx")</code>，样式直接继承。',
      ],
      related: ['文本与图片'],
      tags: ['ppt', '生成', '版式'],
    },
    {
      name: '文本与图片', sig: "slide.shapes.add_textbox / add_picture('a.png', left, top, width)",
      brief: '自由添加文本框和图片（单位 Inches/Pt/Cm）。',
      examples: [
        { title: '', code: `from pptx import Presentation\nfrom pptx.util import Inches, Pt\n\nprs = Presentation()\nslide = prs.slides.add_slide(prs.slide_layouts[6])   # 6=空白版式\n\ntb = slide.shapes.add_textbox(Inches(1), Inches(1), Inches(5), Inches(1))\np = tb.text_frame.paragraphs[0]\nrun = p.add_run()\nrun.text = '自动生成的标题'\nrun.font.size = Pt(32)\nrun.font.bold = True\n\nslide.shapes.add_picture('chart.png', Inches(1), Inches(2), width=Inches(8))\nprs.save('out.pptx')` },
      ],
      pitfalls: [
        '<b>位置和尺寸必须用 Inches/Pt/Cm 对象</b>，直接传数字报错。',
        'text_frame 有默认空段落，往 paragraphs[0] 里 add_run 即可，不要先 add_paragraph（会多个空行）。',
      ],
      related: ['创建与版式'],
      tags: ['文本框', '图片', '字体'],
    },
    {
      name: '读取已有ppt', sig: 'Presentation("已有.pptx") / slide.shapes 遍历 / 替换文本',
      brief: '打开模板改内容：报表自动化最常用的姿势。',
      examples: [
        { title: '', code: `from pptx import Presentation\n\nprs = Presentation('模板.pptx')\nfor slide in prs.slides:\n    for shape in slide.shapes:\n        if shape.has_text_frame:\n            for para in shape.text_frame.paragraphs:\n                for run in para.runs:\n                    if '{{月份}}' in run.text:\n                        run.text = run.text.replace('{{月份}}', '2024-05')\nprs.save('成稿.pptx')` },
      ],
      pitfalls: [
        '文字可能被拆成多个 run（输入时改过格式），<b>占位符跨 run 就匹配不到</b> —— 模板里占位符要一次性输入不中途改样式。',
        '图表数据修改走 shape.chart.replace_data(CategoryChartData(...))，比改文本复杂得多，先确认真需要。',
      ],
      related: ['创建与版式'],
      tags: ['模板', '替换', '批量'],
    },
  ],
});

MODULES.push({
  id: 'pypdf', name: 'pypdf', icon: '📕', category: '自动化与效率',
  doc: 'https://pypdf.readthedocs.io/',
  desc: 'PDF 页面级操作：合并、拆分、提取页面、加密解密、旋转。',
  install: 'pip install pypdf',
  pkg: 'pypdf',
  aliases: ['pdf', 'PyPDF2'],
  tips: [
    '<b>PyPDF2 已更名为 pypdf</b>（from pypdf import ...），新代码用 pypdf，老教程的 PyPDF2 写法基本兼容。',
    'pypdf 管"页面"；要提取文字/表格用 pdfplumber，各干各的。',
  ],
  entries: [
    {
      name: '合并', sig: "PdfWriter() / writer.append('a.pdf') / writer.write('out.pdf')",
      brief: '多个 PDF 合成一个。',
      examples: [
        { title: '', code: `from pypdf import PdfWriter, PdfReader\n\nwriter = PdfWriter()\nfor f in ['第一章.pdf', '第二章.pdf', '第三章.pdf']:\n    writer.append(f)            # 整本追加\n# writer.append(f, pages=(0, 3))  # 只取第1~3页\n\nwith open('合并.pdf', 'wb') as out:\n    writer.write(out)` },
      ],
      pitfalls: [
        '有密码的源文件要先 <code>PdfReader(f, password="xx")</code> 解密，否则 append 报错。',
        'writer.write 目标用 "wb" 二进制模式。',
      ],
      related: ['拆分提取'],
      tags: ['pdf', '合并'],
    },
    {
      name: '拆分提取', sig: "reader.pages[i] / writer.add_page(page)",
      brief: '取出指定页另存为新 PDF。',
      examples: [
        { title: '', code: `from pypdf import PdfReader, PdfWriter\n\nreader = PdfReader('全书.pdf')\nprint(len(reader.pages), '页')\n\nwriter = PdfWriter()\nfor i in [0, 5, 9]:               # 取第1、6、10页\n    writer.add_page(reader.pages[i])\nwith open('摘录.pdf', 'wb') as f:\n    writer.write(f)` },
      ],
      pitfalls: [
        '<b>pages 索引从 0 开始</b>，和阅读器显示的页码差 1。',
        'page 对象可以旋转：page.rotate(90)。',
      ],
      related: ['合并'],
      tags: ['拆分', '页面'],
    },
    {
      name: '加密与元数据', sig: "writer.encrypt('密码') / writer.add_metadata({'/Title': 'x'})",
      brief: '给 PDF 加密码和文档信息。',
      examples: [
        { title: '', code: `from pypdf import PdfWriter, PdfReader\n\nwriter = PdfWriter(clone_from='原始.pdf')   # 一行克隆整个文档\nwriter.add_metadata({'/Title': '内部资料', '/Author': '张三'})\nwriter.encrypt('123456')                    # 打开密码\nwith open('加密版.pdf', 'wb') as f:\n    writer.write(f)\n\n# 解密已有文件:\nreader = PdfReader('加密版.pdf', password='123456')` },
      ],
      pitfalls: [
        '<b>encrypt 只是打开口令</b>（权限口令/owner password 是另一个参数，按需设置）。',
        'encrypted PDF 提取文字时记得先传 password。',
      ],
      related: ['合并'],
      tags: ['加密', '元数据'],
    },
  ],
});

MODULES.push({
  id: 'pdfplumber', name: 'pdfplumber', icon: '🔍', category: '自动化与效率',
  doc: 'https://pypi.org/project/pdfplumber/',
  desc: '从 PDF 提取文字和表格：数据党把 PDF 变 DataFrame 的首选。',
  install: 'pip install pdfplumber',
  entries: [
    {
      name: '提取文字', sig: "with pdfplumber.open('a.pdf') as pdf: pdf.pages[0].extract_text()",
      brief: '按页提取文本。',
      examples: [
        { title: '', code: `import pdfplumber\n\nwith pdfplumber.open('报告.pdf') as pdf:\n    print(len(pdf.pages))\n    text = pdf.pages[0].extract_text()   # 整页文字(含换行)\n    print(text[:200])\n\n# 全文提取:\nall_text = '\\n'.join(p.extract_text() or '' for p in pdf.pages)` },
      ],
      pitfalls: [
        '<b>扫描件/图片型 PDF 提不出文字</b>（extract_text 返回 None）—— 那是图片，需要 OCR（ddddocr/paddleocr）。',
        '提取文字顺序偶尔乱（双栏排版），要精确版面用 extract_words 按坐标处理。',
      ],
      related: ['提取表格', '坐标定位'],
      tags: ['pdf', '文字', '提取'],
    },
    {
      name: '提取表格', sig: 'page.extract_tables() -> [[cell, ...], ...]',
      brief: '提取表格，一步变 DataFrame（PDF 数据分析核心用法）。',
      examples: [
        { title: '', code: `import pdfplumber\nimport pandas as pd\n\nwith pdfplumber.open('报表.pdf') as pdf:\n    all_rows = []\n    for page in pdf.pages:\n        for table in page.extract_tables():\n            all_rows.extend(table)\n\ndf = pd.DataFrame(all_rows[1:], columns=all_rows[0])   # 第一行做表头\nprint(df.head())` },
      ],
      pitfalls: [
        '返回结构是<b>列表套列表（保留 None 单元格）</b>，单元格可能有 \\n，清洗一下：[[ (c or "").replace("\\n","") for c in row] for row in rows]。',
        '无边框的"视觉表格"可能提取不到或错位 —— table_settings 可调，但复杂表格调参时间成本高，数据少不如手动。',
      ],
      related: ['提取文字'],
      tags: ['表格', 'dataframe', '提取'],
    },
    {
      name: '坐标定位', sig: 'page.width / page.height / page.extract_words() / page.crop((x0, y0, x1, y1))',
      brief: '按坐标精确取局部内容（版式固定的报表神器）。',
      examples: [
        { title: '', code: `import pdfplumber\n\nwith pdfplumber.open('票证.pdf') as pdf:\n    page = pdf.pages[0]\n    print(page.width, page.height)          # 页面尺寸(pt)\n\n    for w in page.extract_words()[:10]:\n        print(w['text'], round(w['x0']), round(w['top']))\n\n    # 只取右上角区域:\n    region = page.crop((page.width * 0.6, 0, page.width, 120))\n    print(region.extract_text())` },
      ],
      pitfalls: [
        '坐标原点在<b>左上角</b>，单位是 pt（1/72 英寸）；crop 的框是 (x0, top, x1, bottom)。',
        '先 extract_words 打印坐标，再定 crop 范围，别盲猜。',
      ],
      related: ['提取文字'],
      tags: ['坐标', 'crop', '定位'],
    },
  ],
});

MODULES.push({
  id: 'email', name: 'email', icon: '📧', category: '自动化与效率',
  doc: 'https://docs.python.org/zh-cn/3/library/smtplib.html',
  desc: 'smtplib + email 标准库组合：自动发文本/HTML 邮件、带附件、群发通知。',
  install: false,
  aliases: ['smtplib', '邮件', '发信'],
  tips: [
    '<b>QQ/163 邮箱要用"授权码"不是登录密码</b>：网页邮箱设置里开启 SMTP 服务后生成授权码。',
    '固定套路：MIMEMultipart 组装（正文+附件）→ smtplib 发送，两个库配合用。',
  ],
  entries: [
    {
      name: '发送文本邮件', sig: "SMTP_SSL('smtp.qq.com', 465) / server.login(user, 授权码) / server.sendmail(frm, [to], msg)",
      brief: '最小可用的发信流程。',
      examples: [
        { title: '', code: `import smtplib\nfrom email.mime.text import MIMEText\nfrom email.header import Header\n\nmsg = MIMEText('今日数据已跑完，请查收。', 'plain', 'utf-8')\nmsg['From'] = Header('数据机器人', 'utf-8')\nmsg['To'] = Header('张三', 'utf-8')\nmsg['Subject'] = Header('每日报告 2024-05-20', 'utf-8')\n\nserver = smtplib.SMTP_SSL('smtp.qq.com', 465)\nserver.login('me@qq.com', '授权码')\nserver.sendmail('me@qq.com', ['you@qq.com'], msg.as_string())\nserver.quit()` },
      ],
      pitfalls: [
        '<b>SMTP_SSL(465端口)</b> 与 SMTP+starttls(587端口) 二选一，别混着配。',
        'login 的密码是授权码；授权码错误报 (535, Authentication failed)。',
        '主题/发件人中文必须用 Header(..., "utf-8") 包一层，否则乱码。',
      ],
      related: ['HTML与附件'],
      tags: ['邮件', 'smtplib', '发送'],
    },
    {
      name: 'HTML与附件', sig: "MIMEMultipart() / MIMEText(html, 'html', 'utf-8') / add_attachment(bytes, maintype, filename)",
      brief: '发 HTML 正文与附件（报表自动投递的标准形态）。',
      examples: [
        { title: '发送HTML报表+附件', code: `import smtplib\nfrom email.mime.multipart import MIMEMultipart\nfrom email.mime.text import MIMEText\nfrom email.mime.application import MIMEApplication\n\nmsg = MIMEMultipart()\nmsg['Subject'] = '周报'\nmsg['From'] = 'me@qq.com'\nmsg['To'] = 'you@qq.com'\n\nmsg.attach(MIMEText(df.to_html(border=0), 'html', 'utf-8'))   # 表格直出正文\nwith open('明细.xlsx', 'rb') as f:\n    att = MIMEApplication(f.read())\n    att.add_header('Content-Disposition', 'attachment',\n                   filename=('utf-8', '', '明细.xlsx'))        # 中文文件名\n    msg.attach(att)\n\nserver = smtplib.SMTP_SSL('smtp.qq.com', 465)\nserver.login('me@qq.com', '授权码')\nserver.sendmail('me@qq.com', ['you@qq.com'], msg.as_string())\nserver.quit()` },
      ],
      pitfalls: [
        '<b>中文附件名要显式编码</b>（add_header 的 filename 三元组写法），否则显示 base64 乱码。',
        '图片内嵌正文用 MIMEImage + Content-ID，正文里 <code>&lt;img src="cid:img1"&gt;</code> 引用。',
      ],
      related: ['发送文本邮件', '常见坑'],
      tags: ['附件', 'html', '报表'],
    },
    {
      name: '群发与抄送', sig: "sendmail(from, [收件人列表], msg) / msg['Cc']",
      brief: '多收件人、抄送、密送的正确写法。',
      examples: [
        { title: '', code: `to_list = ['a@qq.com', 'b@qq.com']\ncc_list = ['boss@qq.com']\n\nmsg['To'] = ','.join(to_list)     # 头部只是"显示"\nmsg['Cc'] = ','.join(cc_list)\n\n# 真正投递要把 To+Cc 都给 sendmail:\nserver.sendmail(FROM, to_list + cc_list, msg.as_string())` },
      ],
      pitfalls: [
        '<b>msg["To"] 只是显示用的头部</b>，实际发给谁由 sendmail 第二个参数决定 —— 两者不同步就会出现"有人看不到自己该在的名单"。',
        '群发量大别循环 sendmail 一封封发，直接列表一次发；被反垃圾拦截时降频、换企业邮箱。',
      ],
      related: ['发送文本邮件'],
      tags: ['群发', '抄送'],
    },
    {
      name: '常见坑', sig: '535 授权码 / 554 垃圾邮件 / 连接超时',
      brief: '发信失败排查清单。',
      examples: [
        { title: '', code: `# 535 Authentication failed -> 用的是登录密码/授权码过期\n#     邮箱设置里重新生成授权码\n# 554 DT:SPM -> 被判垃圾邮件: 标题太广告、无正文、发送太频繁\n#     加正文、降频、换主题再试\n# 连接超时 -> 465 端口被公司网络封, 试 587 + starttls:\nserver = smtplib.SMTP('smtp.qq.com', 587)\nserver.starttls()\nserver.login(user, pwd)\n\n# 脚本里发信务必 try/except + 日志, 别让报告失败弄崩主流程` },
      ],
      pitfalls: [
        '定时任务里发邮件，失败要重试并落日志，否则"默默没发出去"比报错更可怕。',
      ],
      related: ['发送文本邮件', 'HTML与附件'],
      tags: ['报错', '排查', '反垃圾'],
    },
  ],
});

MODULES.push({
  id: 'schedule', name: 'schedule', icon: '⏰', category: '自动化与效率',
  doc: 'https://schedule.readthedocs.io/',
  desc: '轻量定时任务：几行代码让函数每天/每 N 分钟跑一次（单机小任务够用）。',
  install: 'pip install schedule',
  entries: [
    {
      name: '基础循环', sig: "schedule.every(10).minutes.do(job) / schedule.run_pending()",
      brief: '注册任务 + 循环检查，标准模板。',
      examples: [
        { title: '', code: `import schedule, time\n\ndef job():\n    print('跑报表...', time.ctime())\n\nschedule.every(10).minutes.do(job)      # 每10分钟\nschedule.every().day.at('09:30').do(job)  # 每天9:30\nschedule.every().monday.at('08:00').do(job)\n\nwhile True:\n    schedule.run_pending()     # 检查到点的任务并执行\n    time.sleep(1)` },
      ],
      pitfalls: [
        '<b>它不会后台运行</b>：这个 while 循环就是"进程活着"的全部 —— 脚本关了任务就没了，挂到服务器/开机自启才靠谱。',
        'do(job) 传函数名不带括号；带参数 <code>do(job, "参数")</code>。',
      ],
      related: ['时间表达'],
      tags: ['定时', '任务', '调度'],
    },
    {
      name: '时间表达', sig: 'every().day.at("HH:MM") / every().hour / every().week / every(3).days',
      brief: '各种周期写法速查。',
      examples: [
        { title: '', code: `schedule.every().day.at('10:30').do(job)\nschedule.every(5).hours.do(job)\nschedule.every().saturday.at('13:15').do(job)\nschedule.every().day.at('10:30:59').do(job)   # 支持秒\n\n# 取消: 返回值保存后 cancel()\nj = schedule.every().day.at('00:00').do(job)\nschedule.cancel_job(j)\nschedule.clear()      # 清空全部` },
      ],
      pitfalls: [
        'at() 用的是<b>本机时间</b>，服务器在 UTC 时区的话时间全错（date 命令看一眼）。',
        'every().day.at() 的时间格式必须 HH:MM 或 HH:MM:SS，写 "9:30" 可以但 "9：30"（中文冒号）不行。',
      ],
      related: ['基础循环'],
      tags: ['周期', '取消'],
    },
    {
      name: '常见坑', sig: '任务阻塞 / 重叠执行 / 报错吞掉',
      brief: 'schedule 的三个结构性限制。',
      examples: [
        { title: '', code: `# 1. 任务执行时会卡住调度循环(单线程):\n#    任务耗时 > 间隔会"迟到", 用 next_run() 观察\n# 2. 报错会中断 run_pending -> 任务里自己 try/except:\ndef job():\n    try:\n        run_report()\n    except Exception as e:\n        logger.exception('任务失败')\n\n# 3. 要并行/精确/持久化 -> 上 APScheduler 或系统 crontab(推荐)\n#    crontab -e: 30 9 * * * /usr/bin/python3 /opt/job.py` },
      ],
      pitfalls: [
        '生产环境优先用<b>系统级定时</b>（Windows 任务计划 / Linux crontab）直接跑脚本，schedule 适合"脚本本身常驻"的场景。',
      ],
      related: ['基础循环'],
      tags: ['坑', 'crontab', '阻塞'],
    },
  ],
});
