/* 场景选型速查页数据（渲染在 #/scenes 页：遇到任务 → 用哪个工具） */
window.SCENES = window.SCENES || [];

SCENES.push({
  group: '① 表格与数据文件',
  items: [
    { name: '读 CSV / Excel 做分析', tool: 'pandas', desc: '表格分析的默认答案；读 .xlsx 需要引擎（自动用 openpyxl）。', link: '#/m/pandas' },
    { name: '几百 MB 的大 CSV', tool: 'polars', desc: '懒加载 + 多核，读得快省内存；语法与 pandas 相近。', link: '#/m/polars' },
    { name: '生成带格式/公式的 Excel', tool: 'openpyxl', desc: '写样式、公式、批注；纯数据导出用 df.to_excel 就够。', link: '#/m/openpyxl' },
    { name: '操控开着公式的 Excel / 调宏', tool: 'xlwings', desc: '驱动真实 Excel 程序：重算、格式、VBA；本机需装 Excel。', link: '#/m/xlwings' },
    { name: '存配置 / 小数据交换', tool: 'json', desc: '人类可读、全平台通用；中文记得 ensure_ascii=False。', link: '#/m/json' },
    { name: '配置还要类型校验', tool: 'pydantic', desc: '字段类型/范围在构造时就查，脏配置进不了系统。', link: '#/m/pydantic' },
    { name: '数组落盘 / 谱数据批量存', tool: 'numpy', desc: 'npy/npz 二进制保 dtype 和形状；文本交换用 savetxt。', link: '#/m/numpy' },
    { name: '超大数据部分读取', tool: 'h5py', desc: 'HDF5 切片读不爆内存；同步辐射 NeXus 就是它。', link: '#/m/h5py' },
  ],
});

SCENES.push({
  group: '② 数据处理与计算',
  items: [
    { name: '清洗 / 合并 / 透视表格', tool: 'pandas', desc: '缺失、去重、merge、pivot_table、melt 一条龙。', link: '#/m/pandas' },
    { name: '谱线滤波 / 找峰 / 插值', tool: 'scipy', desc: 'savgol 滤波、find_peaks 找峰、interpolate 插值。', link: '#/m/scipy' },
    { name: '复杂峰形拟合', tool: 'lmfit', desc: '多峰复合、参数约束、拟合报告，比裸 curve_fit 省心。', link: '#/m/lmfit' },
    { name: '标量数学（单个数）', tool: 'math', desc: '开方、对数、阶乘；数组运算用 numpy 别用 math。', link: '#/m/math' },
    { name: '批量重命名/移动文件', tool: 'pathlib', desc: 'Path.glob 遍历 + rename；文件夹整理写十行搞定。', link: '#/m/pathlib' },
  ],
});

SCENES.push({
  group: '③ 可视化',
  items: [
    { name: '论文/报告静态图', tool: 'matplotlib', desc: '出版级控制力，期刊默认格式随便导。', link: '#/m/matplotlib' },
    { name: '统计图快速看一眼', tool: 'seaborn', desc: '直方/箱线/热力图一行出，吃 DataFrame 长表。', link: '#/m/seaborn' },
    { name: '交互图（悬停缩放）', tool: 'plotly', desc: '导出 HTML 自带交互；国内习惯用 pyecharts 也行。', link: '#/m/plotly' },
    { name: '词云图', tool: 'wordcloud', desc: '中文先 jieba 分词再 generate。', link: '#/m/wordcloud' },
    { name: '给数据做个带界面的小应用', tool: 'streamlit', desc: '纯 Python 写网页应用；模型 demo 用 gradio 更快。', link: '#/m/streamlit' },
  ],
});

SCENES.push({
  group: '④ 机器学习',
  items: [
    { name: '表格数据分类/回归', tool: 'sklearn', desc: '先线性/随机森林打基线，再上梯度提升。', link: '#/m/sklearn' },
    { name: '表格竞赛级精度', tool: 'xgboost', desc: 'xgboost / lightgbm 二选一，精度通常最好。', link: '#/m/xgboost' },
    { name: '超参数搜索', tool: 'optuna', desc: '自动试参 + 提前剪枝，比手搓网格搜索省时。', link: '#/m/optuna' },
    { name: '类别不平衡', tool: 'imblearn', desc: 'SMOTE 过采样，Pipeline 里和 sklearn 无缝接。', link: '#/m/imblearn' },
    { name: '解释模型为什么这么判', tool: 'shap', desc: '特征贡献逐样本可视化，汇报利器。', link: '#/m/shap' },
    { name: '图像/序列/深度模型', tool: 'torch', desc: '研究与自定义模型事实标准。', link: '#/m/torch' },
  ],
});

SCENES.push({
  group: '⑤ 存储与数据库',
  items: [
    { name: '本地轻量数据库（零安装）', tool: 'sqlite3', desc: '一个文件就是库；单机脚本存结果首选。', link: '#/m/sqlite3' },
    { name: '公司 MySQL 服务器', tool: 'pymysql', desc: '配 sqlalchemy 用 pandas.read_sql 直接出表。', link: '#/m/pymysql' },
    { name: '文档型 / 嵌套 JSON 数据', tool: 'pymongo', desc: 'MongoDB 的 Python 驱动。', link: '#/m/pymongo' },
    { name: '缓存 / 计数器 / 队列', tool: 'redis', desc: '内存级速度，过期时间自带。', link: '#/m/redis' },
    { name: 'Python 对象直接存取', tool: 'pickle', desc: '任意对象序列化；只信得过自己写的文件，跨模型用 joblib。', link: '#/m/pickle' },
  ],
});

SCENES.push({
  group: '⑥ 自动化办公',
  items: [
    { name: '批量生成/读取 Word', tool: 'docx', desc: '报告模板填充、表格写入、中文字体设置。', link: '#/m/docx' },
    { name: '批量生成 PPT', tool: 'pptx', desc: '版式占位符填内容，周报月报自动化。', link: '#/m/pptx' },
    { name: 'PDF 拆分合并加密', tool: 'pypdf', desc: '页面级操作轻量够用。', link: '#/m/pypdf' },
    { name: 'PDF 提文字 / 转图片', tool: 'pymupdf', desc: '提取文字 pdfplumber 也行；转图片/改页面 PyMuPDF 最快。', link: '#/m/pymupdf' },
    { name: '自动发邮件（带附件）', tool: 'email', desc: 'smtplib + email 组合，日报定时发。', link: '#/m/email' },
    { name: '定时跑脚本', tool: 'schedule', desc: '进程内轮询；系统级定时用 crontab/任务计划更可靠。', link: '#/m/schedule' },
  ],
});

SCENES.push({
  group: '⑦ 网页与接口',
  items: [
    { name: '调 HTTP 接口 / 下载', tool: 'requests', desc: 'get/post/session；重试代理见其条目。', link: '#/m/requests' },
    { name: 'JS 渲染的页面抓取', tool: 'playwright', desc: '真实浏览器自动化；老项目常见 selenium。', link: '#/m/playwright' },
    { name: '解析 HTML 提数据', tool: 'bs4', desc: 'CSS 选择器取元素；追求速度用 lxml。', link: '#/m/bs4' },
    { name: '识别验证码', tool: 'ddddocr', desc: '通用点选/滑块检测一行调用。', link: '#/m/ddddocr' },
    { name: '调大模型 API', tool: 'llmapi', desc: 'openai SDK 兼容格式，换厂商改 base_url。', link: '#/m/llmapi' },
  ],
});

SCENES.push({
  group: '⑧ 工程与效率',
  items: [
    { name: '新项目建环境 / 装包慢', tool: 'envmgmt', desc: 'venv/uv/conda 全流程 + 国内换源。', link: '#/m/envmgmt' },
    { name: '验证代码对不对', tool: 'pytest', desc: 'test_ 函数 + assert 起步，回归靠它。', link: '#/m/pytest' },
    { name: '脚本加日志', tool: 'loguru', desc: '新项目零配置；读老代码的 logging 见同分类。', link: '#/m/loguru' },
    { name: '发给别人的 exe', tool: 'pyinstaller', desc: '一键打包；体积/误报见其常见坑。', link: '#/m/pyinstaller' },
    { name: '写 README / 文档', tool: 'markdown', desc: 'Markdown 语法速查，GitHub 事实标准。', link: '#/m/markdown' },
    { name: '并发提速批量任务', tool: 'concurrent', desc: 'IO 用线程池，CPU 用进程池。', link: '#/m/concurrent' },
    { name: '改前端页面样式', tool: 'frontend', desc: 'HTML/CSS/JS + F12 最小技能集。', link: '#/m/frontend' },
  ],
});
