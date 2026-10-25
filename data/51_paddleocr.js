/* PaddleOCR：通用中文 OCR（截图/扫描件提字） */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'paddleocr', name: 'PaddleOCR', icon: '👓', category: '图像与视频处理',
  doc: 'https://paddlepaddle.github.io/PaddleOCR/',
  desc: '百度开源的OCR套件，中文识别效果好：截图、扫描件、仪器照片提取文字；ddddocr 只管验证码，正经提字用这个。',
  install: 'pip install paddleocr',
  aliases: ['ocr', '文字识别', '扫描件', '截图提字'],
  tips: [
    '选型：验证码用 ddddocr（轻、快）；<b>文档/报告/照片里的成段文字用 PaddleOCR</b>（准、支持版面）。',
    'PDF 先用 PyMupdf 转图片再 OCR（见自动化与效率分类的渲染成图条目）。',
  ],
  entries: [
    {
      name: '基础识别', sig: "PaddleOCR() / ocr.predict('img.png') / res.json['res']['rec_texts']",
      brief: '识别一张图里的所有文字（默认中文+英文）。',
      examples: [
        { title: '', code: `from paddleocr import PaddleOCR\n\nocr = PaddleOCR(\n    use_doc_orientation_classify=False,   # 关掉用不到的方向矫正, 提速\n    use_doc_unwarping=False,\n    use_textline_orientation=False,\n)\n\nresult = ocr.predict('scan_page.png')\nfor res in result:\n    data = res.json['res']\n    for text, score in zip(data['rec_texts'], data['rec_scores']):\n        print(f'{score:.2f}  {text}')     # 置信度 + 文字\n\n# res.print() 控制台预览; res.save_to_json('out') 存结果` },
      ],
      pitfalls: [
        '<b>3.x 起 API 大改</b>：老教程的 <code>ocr.ocr(img, cls=True)</code> 和返回结构 [[框,(文字,分)]...] 已换代，现在用 predict() + rec_texts 字段；网上代码先看版本再抄。',
        '<b>首次运行自动下载模型</b>（上百 MB，存用户目录下），要在有网的机器先跑一次；内网机器把模型目录拷过去。',
        '纯 CPU 推理一张图几秒是正常的，批量多图慢属正常；要快装 GPU 版 paddlepaddle-gpu。',
      ],
      related: ['批量提取'],
      tags: ['ocr', '文字识别', '中文'],
    },
    {
      name: '批量提取', sig: "for f in glob(图片): result = ocr.predict(f) -> 汇总到 DataFrame",
      brief: '整个文件夹的图片批量提字，汇成表格。',
      examples: [
        { title: '', code: `from paddleocr import PaddleOCR\nimport glob, pandas as pd\n\nocr = PaddleOCR(use_doc_orientation_classify=False,\n                use_doc_unwarping=False, use_textline_orientation=False)\n\nrows = []\nfor f in sorted(glob.glob('scans/*.png')):\n    for res in ocr.predict(f):\n        d = res.json['res']\n        rows.append({'文件': f, '行数': len(d['rec_texts']),\n                     '全文': ' '.join(d['rec_texts'])})\n\ndf = pd.DataFrame(rows)\ndf.to_csv('ocr_result.csv', index=False, encoding='utf-8-sig')   # excel 打开不乱码` },
      ],
      pitfalls: [
        'OCR 实例全局建一个复用（构造时要加载模型，反复建非常慢）。',
        '整页文字默认按"检测框"打散成行，想要阅读顺序全文 join 即可；要还原版面用 PP-StructureV3 版面分析管线。',
        '结果存 CSV 给 Excel 看用 <b>utf-8-sig</b> 编码，纯 utf-8 直接开会乱码。',
      ],
      related: ['基础识别'],
      tags: ['批量', '扫描件', '汇总'],
    },
    {
      name: '效果与加速', sig: 'use_textline_orientation / text_rec_score_thresh / 图像预处理',
      brief: '识别率不行时的排查清单与提速手段。',
      examples: [
        { title: '', code: `ocr = PaddleOCR(\n    use_textline_orientation=True,   # 文字有旋转/倒置时打开\n    text_rec_score_thresh=0.5,       # 过滤低置信度结果, 少出乱码\n)\n\n# 识别差的常见原因与对策:\n#   图片太小 -> 放大 2 倍再喂(小字场景立竿见影)\n#   倾斜/倒置 -> 开上面的方向矫正, 或先 opencv 旋转摆正\n#   手写/艺术字 ->OCR 弱项, 换专门模型或人工\n#   只要某些区域 -> 先用坐标裁剪, 别整页识别` },
      ],
      pitfalls: [
        '置信度 <code>rec_scores</code> 低于 0.5 的结果多半是误识别，直接按阈值过滤比人工挑快。',
        '手机拍照的透视变形（近大远小）OCR 不抗，重要文档尽量平扫；必须用照片先做矫正。',
        '数据合规：涉密截图/文档别随便传第三方在线 OCR，本地跑 PaddleOCR 就是没有数据外发风险的方案。',
      ],
      related: ['基础识别', '批量提取'],
      tags: ['识别率', '加速', '排查'],
    },
  ],
});
