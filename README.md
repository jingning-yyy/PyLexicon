# 📕 Python 模块字典

一个**本地离线**的 Python 常用模块用法查询工具，像查字典一样：搜索关键字（支持中文），即可看到
**用法签名、参数详解、可复制示例、易混淆点**。双击即可使用，无需安装任何环境。

当前版本 v2.1（2026-10-25）：**113 个模块 / 537 条用法 / 13 个分类**（「速查」栏目收 12 个工具/语法参考类模块），
另附报错速查 32 例、特征处理与 XRF 分析流程页、场景选型页。

## 🚀 使用方式

双击 **`打开字典.bat`**（或直接用浏览器打开 `index.html`）。

- 顶部搜索框：支持模块名 / 函数名 / 中文关键字，多关键字用空格隔开（如 `groupby 聚合`、`中文乱码`）；
  支持拼音首字母子序列匹配（如 `gb` → groupby）；报错原文也能直接搜（已进主搜索索引）
- 快捷键：`/` 聚焦搜索，`Esc` 清空，`Enter` 打开第一条结果
- 左侧目录：按类别浏览 113 个模块，分类默认按「文件与系统 → 数据处理 → X 射线工具 → 可视化/图像 →
  机器学习 → 标准库/存储 → 爬虫/Web → 效率」排列，末尾的「速查」栏目收所有工具/语法参考类模块
  （Linux/Git/环境管理/内置函数/并发/压缩包/jupyter/代码模板/Markdown/前端/LLM API/VSCode）；
  拖动分类可自定义，自定义顺序优先；列表/缩略图中可**直接拖动
  模块排序**（分类顺序也能拖），顺序自动记住；**「☑ 编号」**按钮可开关类别内编号
- 侧边栏顶部快捷入口：**🏠 首页 / 📖 文档导航 / 🎓 学习案例 / 🧬 特征 / ☢️ XRF 流程 / 🚨 报错速查 /
  🧭 选型 / 🔖 速查**（速查入口跳转到「速查」分类位置）
- 🌙 按钮切换深色 / 浅色主题；A± 切字号；📌 收藏夹与最近浏览；🖨 打印速查表
- 🔒 顶栏 ⚙「数据保险柜」：浏览器里的编辑/收藏/笔记可导出 JSON 备份、导入恢复，或连接一个
  本地文件夹实时同步（Chrome/Edge 支持），清缓存/换浏览器不丢；也可一键恢复出厂

### 本地服务模式（推荐）

`python server.py` → 打开 http://127.0.0.1:8000 。除静态服务外，**编辑/新增/笔记会直接落盘**到
`pmd_overrides.json`，跨浏览器共享、清缓存也不丢。纯 file:// 方式打开时这些数据只存浏览器
localStorage，可在首页导出 JSON 备份。

## 🧭 专项页面路由

| 路由 | 页面 | 数据来源 |
|---|---|---|
| `#/docs` | 官方文档导航 | 各模块 `doc` 字段 |
| `#/learn` | 学习案例（含书籍推荐） | data/17_resources.js |
| `#/feat` | 特征处理速查（预处理→基线→归一化→峰特征→降维→建模衔接） | data/19_features.js |
| `#/xrfflow` | XRF 分析流程（原始谱→元素分布图流水线） | data/25_xrfflow.js |
| `#/scenes` | 场景选型（"我要做 X"→ 推荐工具，直达模块页） | data/45_scenes.js |
| `#/errors` | 报错速查（32 案例，可按关键字过滤） | data/22_errors.js |
| `#/m/<模块id>` | 模块页 | — |
| `#/e/<模块id>/<条目名>` | 条目页 | — |

## 📂 目录结构

```
PyLexicon/
├── index.html        页面骨架（新增数据文件后需在底部引入）
├── app.js            搜索 / 路由 / 渲染逻辑
├── data-vault.js     数据保险柜：浏览器数据 ↔ 本地文件备份/恢复（页面顶栏 ⚙ 面板）
├── server.py         本地服务（编辑落盘 pmd_overrides.json）+ 静态服务
├── check_data.py     数据校验脚本（python check_data.py）
├── check_updates.py  版本对比：本地已装版本 vs PyPI 最新（python check_updates.py）
├── 打开字典.bat       Windows 双击启动器
├── 交接摘要.md        维护交接文档（AI/新人接手先读）
└── data/             模块数据（纯静态，想改直接编辑）
    ├── 01_os_path.js     os / pathlib / glob / shutil
    ├── 02_numpy_math.js  numpy / math / scipy
    ├── 03_pandas.js      pandas
    ├── 04_viz.js         matplotlib / seaborn / pyecharts / wordcloud
    ├── 05_sklearn.js     sklearn
    ├── 06_boost_stats.js xgboost / lightgbm / statsmodels / joblib
    ├── 07_torch_shap.js  torch (pytorch) / shap / torchsummary
    ├── 08_storage.js     sqlalchemy / openpyxl / pickle / pymysql / pymongo / redis
    ├── 09_stdlib.js      re / json / datetime / time / collections / random
    ├── 10_spider.js      requests / bs4 / lxml / tqdm / selenium / playwright
    ├── 11_automation.js  pyautogui / jupyter / ffmpeg-python
    ├── 12_web.js         flask / jinja2 / streamlit / gradio
    ├── 13_crawler_kit.js urllib.parse / hashlib / base64 / pycryptodome / jsonpath / Pillow / execjs / tenacity
    ├── 14_office.js      python-docx / python-pptx / pypdf / pdfplumber / email / schedule
    ├── 15_tooling.js     loguru / argparse / pyinstaller / optuna / imbalanced-learn
    ├── 16_stdlib2.js     functools / itertools / copy / sys / subprocess / dataclasses / uuid
    ├── 17_resources.js   学习资源站点（渲染在 #/learn 学习与案例页）
    ├── 18_xray.js        X 射线工具：xraylib / xraydb / lmfit / pyFAI / fabio / pymatgen
    ├── 19_features.js    特征处理速查页数据（渲染在 #/feat 页）
    ├── 20_media.js       OpenCV / moviepy / scikit-image / ddddocr / imageio
    ├── 21_xrf.js         PyMca / xraylarch / silx（XRF/XAFS 专业工具）
    ├── 22_errors.js      报错速查 32 案例（渲染在 #/errors 页，报错原文进主搜索索引）
    ├── 23_ops.js         速查：Linux 速查 / Git 速查
    ├── 24_templates.js   速查：代码模板库
    ├── 25_xrfflow.js     XRF 分析流程页数据（渲染在 #/xrfflow 页）
    ├── 26_concurrent.js  并发执行：线程池 / 进程池 / GIL 选型 / 锁
    ├── 27_h5py.js        h5py（HDF5 科研数据，NeXus 底层格式）
    ├── 28_zipfile.js     压缩包处理：zipfile / tar.gz / 密码与中文乱码
    ├── 29_sqlite3.js     sqlite3（零安装本地数据库）
    ├── 30_polars.js      polars（新一代 DataFrame）
    ├── 31_logging.js     logging（标准库日志：轮转/堆栈/模块级 logger）
    ├── 32_envmgmt.js     环境管理速查：venv / pip / uv / conda
    ├── 33_typing.js      typing（类型标注速查）
    ├── 34_pymupdf.js     PyMuPDF / fitz（PDF 渲染转图、取文、改页）
    ├── 35_plotly.js      plotly（交互图表）
    ├── 36_rich.js        rich（终端彩色输出/表格/进度条）
    ├── 37_markdown.js    速查：Markdown 语法（README/文档写作）
    ├── 38_frontend.js    速查：前端页面（HTML / CSS / flex / grid / DOM / fetch / 动画）
    ├── 39_builtins.js    速查：内置函数（遍历 / 排序 / 类型 / 字符串 / f-string / 文件读写）
    ├── 40_pytest.js      pytest（测试：assert / fixture / 参数化）
    ├── 41_xlwings.js     xlwings（驱动真实 Excel：公式/宏/pandas 互转）
    ├── 42_pydantic.js    pydantic（数据校验：BaseModel / Field / JSON 互转）
    ├── 43_llmapi.js      速查：LLM API 调用（openai SDK 兼容：对话/流式/多轮）
    ├── 44_vscode.js      速查：VSCode（快捷键/跳转/调试/设置）
    ├── 45_scenes.js      场景选型页数据（渲染在 #/scenes 页）
    ├── 46_psutil.js      psutil（系统监控 Python 版：CPU/内存/磁盘/进程）
    ├── 47_paramiko.js    paramiko（SSH/SFTP 自动化：远程执行/批量巡检）
    ├── 48_watchdog.js    watchdog（文件监控：数据落盘自动处理/防抖）
    ├── 49_pyyaml.js      pyyaml（YAML 配置：safe_load/语法速查/选型）
    ├── 50_profiling.js   ydata-profiling（一行生成 DataFrame EDA 报告）
    └── 51_paddleocr.js   PaddleOCR（通用中文 OCR：截图/扫描件提字）
```

## ✏️ 修改 / 新增内容

每条数据的格式（在 `data/*.js` 中）：

```js
{
  name: 'read_csv',                 // 条目名(不带模块前缀, 不要含 / 和 |)
  sig: 'pd.read_csv(...)',          // 用法签名
  brief: '一句话用途',               // 显示在搜索结果里
  aliases: ['读csv'],               // 可选: 搜索别名
  params: [                         // 可选: 参数表
    { n: 'encoding', t: 'str', d: '说明', dflt: 'None' },
  ],
  returns: 'DataFrame',             // 可选: 返回值
  examples: [                       // 示例(可多个)
    { title: '基础读取', code: `df = pd.read_csv('data.csv')` },
  ],
  pitfalls: ['易混淆点/坑, 支持 <b><code> 标签'],   // 可选
  related: ['to_csv'],              // 可选: 相关条目(同模块内)
  tags: ['csv', '读取'],
}
```

模块级还有两个维护字段（写在模块对象里，`id:` 那行下方）：

```js
doc: 'https://pandas.pydata.org/docs/',   // 官方文档链接: 模块页"打开官方文档"+ 文档导航页
pkg: 'scikit-learn',                       // 可选: PyPI 包名(默认=install 命令里的包名), 供安装命令与 check_updates.py 使用
```

- **改内容**：直接编辑对应 `data/*.js`，保存后刷新浏览器即生效（server 模式已禁缓存）
- **加模块**：在 `data/` 下仿照现有文件新增一个 `.js`（开头写
  `window.MODULES = window.MODULES || [];`，然后 `MODULES.push({...})`，带上 `doc` 链接），
  并在 `index.html` 底部按顺序加一行 `<script src="data/xx.js"></script>`
- **校验**：改完跑一下 `python check_data.py`，能查出括号不配平、related 引用失效、文件漏引入、缺 doc 链接等问题
- **个人编辑与永久入库**：界面里的编辑/新增/删除/笔记/收藏优先存覆盖层（localStorage 或
  server 模式的 pmd_overrides.json），不改动 data/ 原文件；想永久入库，把首页导出的 JSON
  内容合并进对应 data 文件即可

## 🔁 版本更新工作流（库出新版后怎么维护）

内容是人工精选的，无法自动重写，但可以**半自动跟进**：

1. **发现更新**：`python check_updates.py` —— 一键对比 76 个第三方库的
   本地已装版本 vs PyPI 最新版本（可传关键字过滤，如 `python check_updates.py xgb pandas`；
   标准库不参与）
2. **查变化**：点开对应库的官方文档 / 更新日志（模块页右上角"打开官方文档"，或文档导航页 `#/docs`），
   重点关注 Breaking changes（API 改名、参数移位，如 xgboost 2.0 把早停参数从 fit() 挪进了构造函数）
3. **改条目**：编辑 `data/` 对应 `.js` 修订受影响条目，必要时在 `pitfalls` 里补一条版本差异说明
4. **校验收工**：`python check_data.py` → 刷新浏览器

标准库随 Python 版本走（文档链接指向 docs.python.org 中文版），不参与版本对比。

## 🧭 后续迭代方向（v3 候选）

- 数据拆分为纯 JSON，方便程序化生成（当前为 JS 文件，模板字符串里的反斜杠需双写）
- 覆盖层一键合并入库的辅助命令（目前靠手动把导出 JSON 合并进 data 文件）
- 收录模块继续扩充（候选：httpx）
