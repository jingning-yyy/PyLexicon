/* PyMuPDF (fitz)：PDF 高性能处理（渲染/取文/改页） */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'pymupdf', name: 'PyMuPDF', icon: '🖨️', category: '自动化与效率',
  doc: 'https://pymupdf.readthedocs.io/',
  desc: '最快的 PDF 处理库：提取文本、PDF 转图片、提取内嵌图片、增删页面；与 pypdf(拆合)/pdfplumber(表格) 分工互补。',
  install: 'pip install pymupdf',
  aliases: ['fitz', 'pdf转图片', 'pdf取文'],
  tips: [
    '选型：拆分合并加密用 pypdf、提表格用 pdfplumber、<b>转图片/批量取文/改页面用 PyMuPDF</b>(速度最快)。',
    '老代码 <code>import fitz</code>，新版本两种导入名都行(<code>import pymupdf</code>)，同一个包。',
  ],
  entries: [
    {
      name: 'open-doc', sig: "doc = fitz.open('a.pdf') / doc.page_count / doc.metadata / doc.close()",
      brief: '打开文档与基本信息。',
      examples: [
        { title: '', code: `import fitz\n\ndoc = fitz.open('report.pdf')\nprint(doc.page_count)          # 页数\nprint(doc.metadata)            # 标题/作者/生产工具等\nprint(doc.is_encrypted)        # 是否加密\n\nfor page in doc:               # 可直接迭代页面\n    print(page.number, page.rect)   # 页码与尺寸(单位 pt, 1pt=1/72英寸)\ndoc.close()` },
      ],
      pitfalls: [
        '<code>fitz.open()</code> 也接受 URL、bytes(<code>fitz.open(stream=..., filetype="pdf")</code>)和加密密码参数。',
        '注意许可证：<b>AGPL</b>——自用/内部工具没问题，做成对外分发的商业产品要么开源要么买商业授权。',
      ],
      related: ['get-text', '渲染成图'],
      tags: ['PDF', '打开', '元数据'],
    },
    {
      name: 'get-text', sig: "page.get_text() / page.get_text('words') / page.search_for('关键词')",
      brief: '提取文本：纯文本、带坐标词块、关键词定位。',
      examples: [
        { title: '', code: `import fitz\n\ndoc = fitz.open('report.pdf')\ntext = '\\n'.join(p.get_text() for p in doc)     # 全文(比 pdfplumber 快得多)\n\npage = doc[0]\nwords = page.get_text('words')     # [(x0,y0,x1,y1, 词, 块号, 行号, 词号), ...]\n\n# 找到关键词在哪并高亮坐标\nfor rect in page.search_for('检测限'):\n    print('位置:', rect)` },
      ],
      pitfalls: [
        '扫描件(图片型 PDF)取不出文字，先 OCR；<code>page.get_images()</code> 有图没文字就是扫描件。',
        '双栏/表格布局的文字顺序可能乱，复杂版面用 <code>get_text("blocks")</code> 按块取再自己排序。',
      ],
      related: ['open-doc', '渲染成图'],
      tags: ['文本', '提取', '坐标'],
    },
    {
      name: '渲染成图', sig: "pix = page.get_pixmap(matrix=fitz.Matrix(z, z)) / pix.save('p1.png')",
      brief: 'PDF 页面转图片：预览图、报告配图、批量转档。',
      examples: [
        { title: '', code: `import fitz\n\ndoc = fitz.open('report.pdf')\n\n# 单页转 PNG: Matrix(2,2) 约 144dpi, 默认(1,1) 72dpi 打印会糊\npix = doc[0].get_pixmap(matrix=fitz.Matrix(300/72, 300/72))   # 300dpi\npix.save('page1.png')\n\n# 全部页批量转\nfor i, page in enumerate(doc):\n    page.get_pixmap(dpi=200).save(f'pages/p{i+1:03d}.png')    # 新版直接给 dpi` },
      ],
      pitfalls: [
        '默认 72dpi 的图放进 Word/幻灯明显发虚：正式用途 <b>至少 200dpi</b>(matrix 或 dpi 参数)。',
        '转出来的 PNG 是白底，SVG/透明需求用 <code>pix = page.get_pixmap(alpha=True)</code>。',
      ],
      related: ['open-doc', 'get-text'],
      tags: ['渲染', '转图片', 'dpi'],
    },
    {
      name: '页面操作', sig: "doc.delete_page(n) / doc.insert_pdf(另一doc) / doc.save('新.pdf')",
      brief: '删页、合并、旋转后另存。',
      examples: [
        { title: '', code: `import fitz\n\nout = fitz.open()\nout.insert_pdf(fitz.open('a.pdf'))     # 合并: 把 a.pdf 整个接进来\nout.insert_pdf(fitz.open('b.pdf'), from_page=0, to_page=2)  # 只接前 3 页\nout.delete_page(10)                     # 删第 11 页(从 0 数)\nout.set_rotation(90)                    # 整档旋转\nout.save('merged.pdf', garbage=3)       # garbage=3 顺手清理冗余对象\n\n# 改"原文件": 必须 incremental, 且不能从 file:// 之外的字节流打开\ndoc = fitz.open('report.pdf')\ndoc.delete_page(-1)\ndoc.saveIncr()                          # 增量保存回原文件` },
      ],
      pitfalls: [
        '<b>save() 不能直接覆盖打开中的原文件</b>：存到新路径，或用 saveIncr() 增量保存。',
        '合并后超链接/目录可能丢失，重要文档合并后抽查一下书签。',
      ],
      related: ['open-doc'],
      tags: ['合并', '删页', '保存'],
    },
  ],
});
