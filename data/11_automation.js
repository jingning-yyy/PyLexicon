/* 自动化与效率：pyautogui / jupyter / ffmpeg-python */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'pyautogui', name: 'pyautogui', icon: '🖱️', category: '自动化与效率',
  doc: 'https://pyautogui.readthedocs.io/en/latest/',
  desc: '桌面 GUI 自动化：控制鼠标键盘，操作任何没有接口的软件（老客户端、桌面程序、游戏脚本）。',
  install: 'pip install pyautogui pillow opencv-python',
  tips: [
    '<b>安全开关记牢</b>：鼠标快速甩到屏幕左上角可强制中止脚本（FAILSAFE 机制）；<code>pyautogui.PAUSE = 1</code> 让每步之间自动停 1 秒。',
    '它操作的是<b>真实屏幕</b>：脚本运行时不能动鼠标键盘；远程服务器无显示器跑不了。',
  ],
  entries: [
    {
      name: '坐标移动', sig: 'pyautogui.size() / pyautogui.position() / pyautogui.moveTo(x, y, duration=0.5) / pyautogui.moveRel(x, y)',
      brief: '屏幕坐标体系与鼠标移动。',
      examples: [
        { title: '', code: `import pyautogui\n\nprint(pyautogui.size())        # 屏幕分辨率 (1920, 1080)\nprint(pyautogui.position())    # 当前鼠标坐标\n\npyautogui.moveTo(500, 500, duration=0.5)   # 带时长移动(肉眼可见)\npyautogui.moveRel(0, 100)                  # 相对当前位置移动\n\n# 原点在左上角(0,0), y 向下为正 —— 和数学坐标系相反!` },
      ],
      pitfalls: [
        '<b>y 轴向下</b>：想让鼠标"往上"要减小 y。',
        'moveTo 不带 duration 是瞬移，目标程序反应不过来 —— 养成永远带 duration 的习惯。',
        'Windows 显示缩放不是 100% 时（如 125%），截图坐标会错位，涉及图像定位时先把缩放调回 100%。',
      ],
      related: ['鼠标', '键盘'],
      tags: ['坐标', '鼠标'],
    },
    {
      name: '鼠标', sig: "pyautogui.click(x, y, button='left'/'right') / doubleClick() / dragTo(x, y, duration=) / scroll(格数)",
      brief: '点击、拖拽、滚轮。',
      examples: [
        { title: '', code: `pyautogui.click(500, 300)                    # 左键单击\npyautogui.click(button='right')              # 右键(当前位置)\npyautogui.doubleClick(interval=0.1)\n\npyautogui.dragTo(800, 400, duration=1)       # 按住左键拖动\npyautogui.scroll(-300)                       # 负数向下滚\n\n# 找到按钮再点(见"图像定位"):\npos = pyautogui.locateCenterOnScreen('btn.png', confidence=0.8)\nif pos:\n    pyautogui.click(pos)` },
      ],
      pitfalls: [
        'dragTo 不给 duration 瞬间完成，很多软件识别不了这次拖拽 —— 必须 duration。',
        'scroll 的"格数"在不同系统上幅度不同，实际试出来记下。',
      ],
      related: ['坐标移动', '图像定位'],
      tags: ['点击', '拖拽', '滚轮'],
    },
    {
      name: '键盘', sig: "pyautogui.write('abc', interval=0.05) / pyautogui.press('enter') / pyautogui.hotkey('ctrl', 's')",
      brief: '打字、按键、组合键。',
      examples: [
        { title: '', code: `import pyautogui, pyperclip, time\n\npyautogui.write('hello123', interval=0.05)   # 只支持英文/数字/符号\npyautogui.press('enter')\npyautogui.press(['down', 'down', 'tab'])     # 依次按多个键\npyautogui.hotkey('ctrl', 's')                # 组合键\n\n# 中文输入标准方案: 剪贴板\npyperclip.copy('你好，世界')\npyautogui.hotkey('ctrl', 'v')\ntime.sleep(0.2)` },
      ],
      pitfalls: [
        '<b>write/typewrite 无法输入中文</b>（只会敲键盘码），中文一律走 pyperclip 剪贴板 + ctrl+v。',
        '输入前先 click 目标输入框拿到焦点，否则字打到别处。',
        '按住不放的动作用 keyDown/keyUp 严格配对，漏一个 keyUp 键就"卡住"了。',
      ],
      related: ['鼠标', '图像定位'],
      tags: ['键盘', '中文输入', '快捷键'],
    },
    {
      name: '图像定位', sig: 'pyautogui.locateOnScreen("btn.png", confidence=0.8) / locateCenterOnScreen()',
      brief: '截屏找图定位：用按钮截图在屏幕上找坐标，比写死坐标靠谱得多。',
      examples: [
        { title: '', code: `# confidence 参数需要 opencv: pip install opencv-python\npos = pyautogui.locateCenterOnScreen('submit_btn.png', confidence=0.8)\nif pos:\n    pyautogui.click(pos)\nelse:\n    print('屏幕上没找到按钮')\n\n# 找屏幕上全部目标:\nfor box in pyautogui.locateAllOnScreen('icon.png', confidence=0.85):\n    print(box)     # (left, top, width, height)` },
      ],
      pitfalls: [
        '<b>confidence 需要 opencv-python</b>；不装只能 100% 像素匹配，实际几乎必失败。',
        '按钮截图要和运行时同分辨率、同缩放、同主题，界面一变就要重新截。',
        '全屏找图一次约 1~2 秒，别放高频循环里。',
      ],
      related: ['鼠标'],
      tags: ['找图', '识别', 'confidence'],
    },
  ],
});

MODULES.push({
  id: 'jupyter', name: 'jupyter', icon: '📓', category: '速查',
  doc: 'https://docs.jupyter.org/en/latest/',
  desc: '交互式 Notebook：边写边看结果，数据分析探索的主战场（jupyter notebook / jupyterlab）。',
  install: 'pip install notebook jupyterlab  (装 Anaconda 则自带)',
  aliases: ['notebook', 'jupyterlab', 'ipython'],
  tips: [
    '<b>内核（Kernel）是活着的 Python 进程</b>：重启内核 = 所有变量清空；.ipynb 文件和内核是两回事。',
    'cell 乱序运行会出诡异 bug（用到了上面的旧变量）—— 交付前用 Restart & Run All 从头跑一遍验证。',
  ],
  entries: [
    {
      name: '启动', sig: 'jupyter notebook / jupyter lab',
      brief: '两种界面的启动与选择。',
      examples: [
        { title: '', code: `# 经典界面\njupyter notebook\n# 新一代界面(推荐, 更现代):\njupyter lab\n\n# 服务器上用(不自动开浏览器, 端口转发访问):\njupyter lab --port 8889 --no-browser\n\n# 生成配置文件:\njupyter lab --generate-config` },
      ],
      pitfalls: [
        '启动后要求 token：浏览器打开的链接里自带 token；远程部署用 <code>jupyter lab password</code> 设密码。',
        '在某个虚拟环境里装的包 notebook 里 import 不到 —— 内核挂在了别的环境：该环境装 ipykernel 并注册为内核。',
      ],
      related: ['魔法命令', '快捷键'],
      tags: ['启动', 'notebook', 'lab'],
    },
    {
      name: '魔法命令', sig: '%matplotlib inline / %time / %%timeit / %run / %load / %who / !命令',
      brief: 'notebook 专属增强命令：% 开头单行、%% 开头整格。',
      examples: [
        { title: '', code: `%matplotlib inline        # 图表内嵌显示\n%time df = pd.read_csv('big.csv')       # 单行计时\n\n%%timeit                  # 整格计时(自动多次取平均)\ndf['a'].sum()\n\n%run utils.py             # 运行外部脚本(函数进入当前空间)\n%load utils.py            # 把脚本内容载入 cell\n%whos                     # 列出全部变量及类型形状\n\n!pip install requests     # ! 直接执行 shell 命令\n!dir                      # Windows 下看目录` },
      ],
      pitfalls: [
        '%timeit 会把你的代码<b>运行很多遍</b>：cell 里有副作用（写文件、发请求、改数据）别用它。',
        '<b>%matplotlib inline 的图是静态的</b>；要缩放/联动换 <code>%matplotlib widget</code>（需 pip install ipympl）。',
        '魔法命令只在 notebook 有效，整段复制回 .py 脚本会语法报错。',
      ],
      related: ['快捷键', '常见坑'],
      tags: ['魔法命令', '计时', 'shell'],
    },
    {
      name: '快捷键', sig: 'Shift+Enter / A B / DD / M Y / Tab / Shift+Tab',
      brief: '必会快捷键（Esc 进入命令模式后按）。',
      examples: [
        { title: '', code: `Shift+Enter   运行本格并到下一格(最常用)\nCtrl+Enter    运行本格但不移动\nA / B         在上方/下方插入 cell\nDD(连按两次D) 删除本 cell\nM / Y         切换 Markdown / Code\nZ             撤销删除的 cell\nTab           代码补全\nShift+Tab     查看函数文档签名(超好用)\nEsc / Enter   切换 命令模式 / 编辑模式` },
      ],
      pitfalls: [
        '快捷键要在<b>命令模式</b>（cell 边框蓝色）下按，编辑状态按 DD 只会打出两个 d。',
        'Shift+Tab 看函数签名是数据分析提效最快的习惯，比切浏览器查文档快得多。',
      ],
      related: ['魔法命令'],
      tags: ['快捷键', '效率'],
    },
    {
      name: '常见坑', sig: '内核重启丢变量 / 进度条 / 导出 / 中文显示',
      brief: 'notebook 环境高频坑清单。',
      examples: [
        { title: '', code: `# 1. 重启内核变量全没 -> 从头 Run All; 或跨内核存取:\n%store df     # 存\n%store -r df  # 取\n\n# 2. 进度条用 notebook 版:\nfrom tqdm.notebook import tqdm\n\n# 3. 导出(命令行执行):\n#    jupyter nbconvert --to html 报告.ipynb\n#    jupyter nbconvert --to script 分析.ipynb   # 转成 py\n\n# 4. matplotlib 中文同脚本:\n#    plt.rcParams['font.sans-serif'] = ['SimHei']` },
      ],
      pitfalls: [
        '<b>变量全局共享</b>：cell 之间没有隔离，重名悄悄覆盖，排查半天多半是它。',
        '.ipynb 本质是 JSON，交付代码用 nbconvert 转 .py，汇报用 html。',
        '关掉浏览器页面 cell 还在跑（内核活着），回来还能看结果；想真正停止要关内核。',
      ],
      related: ['魔法命令', '快捷键'],
      tags: ['内核', '导出', '坑'],
    },
  ],
});

MODULES.push({
  id: 'ffmpeg-python', name: 'ffmpeg-python', icon: '🎬', category: '图像与视频处理',
  doc: 'https://kkroening.github.io/ffmpeg-python/',
  desc: 'ffmpeg 的 Python 绑定：视频转码、抽帧、剪辑、提取音频、压缩，用链式调用拼 ffmpeg 命令。',
  install: 'pip install ffmpeg-python  (还必须安装 ffmpeg.exe 并加入 PATH)',
  aliases: ['ffmpeg', '视频处理'],
  tips: [
    '<b>ffmpeg-python 只是命令生成器</b>，底层调用 ffmpeg 程序 —— 不装 ffmpeg.exe 一切白搭（官网下载加 PATH，cmd 里 ffmpeg -version 能出版本号才算好）。',
    '参数映射规则：命令行 -b:v 1M → <code>output(**{"b:v": "1M"})</code>；-vf scale → <code>.filter("scale", ...)</code>，去掉横杠就是参数名。',
  ],
  entries: [
    {
      name: '基础流程', sig: "ffmpeg.input('in.mp4').output('out.mp4').run() / ffmpeg.probe('file')",
      brief: '输入→输出→run 三步走；probe 查看媒体信息。',
      examples: [
        { title: '', code: `import ffmpeg\n\n# 转格式(最简用法):\nffmpeg.input('a.avi').output('a.mp4').overwrite_output().run()\n\n# 查看信息(时长/分辨率/编码):\ninfo = ffmpeg.probe('a.mp4')\nstream = info['streams'][0]\nprint(stream['width'], stream['height'], stream['codec_name'])\nprint(float(info['format']['duration']), '秒')` },
      ],
      pitfalls: [
        '<b>报 FileNotFoundError [WinError 2] 就是 ffmpeg.exe 没装或不在 PATH</b>，和 pip 无关。',
        '输出文件已存在时 run() 报错，加 <code>.overwrite_output()</code>（相当于命令行的 -y）。',
        'run() 抛 ffmpeg.Error 时用 <code>e.stderr.decode()</code> 看详细日志。',
      ],
      related: ['常用操作', '参数映射'],
      tags: ['视频', '转码', 'probe'],
    },
    {
      name: '常用操作', sig: '提取音频 / 截取片段 / 压缩 / 抽帧',
      brief: '高频视频操作配方合集。',
      examples: [
        { title: '配方合集', code: `import ffmpeg\n\n# 1. 提取音频为 mp3(vn=不要视频流):\nffmpeg.input('a.mp4').output('a.mp3', vn=None).run()\n\n# 2. 截取 10s 起 20s 长的片段:\n(\n    ffmpeg.input('a.mp4', ss=10, t=20)\n    .output('clip.mp4', c='copy')     # c=copy 不重编码, 秒级完成\n    .run()\n)\n\n# 3. 压缩(crf 越小越清晰, 18~28 实用):\n(\n    ffmpeg.input('big.mp4')\n    .output('small.mp4', **{'vcodec': 'libx264', 'crf': 23})\n    .run()\n)\n\n# 4. 每 5 秒抽一帧存图:\n(\n    ffmpeg.input('a.mp4')\n    .filter('fps', fps=1 / 5)\n    .output('frame_%04d.png')\n    .run()\n)` },
      ],
      pitfalls: [
        '截片段优先 <code>c="copy"</code>（不重编码快百倍），但切点对齐关键帧不精确；要精确到秒就别用 copy。',
        '滤镜类功能（-vf）用 <code>.filter("名称", 参数)</code> 链式添加，连续调用可叠加多个滤镜。',
        'input() 里只放输入侧参数（ss/t），编码参数一律放 output()，放错位置命令语义就变了。',
      ],
      related: ['基础流程', '参数映射'],
      tags: ['抽帧', '剪辑', '压缩', '音频'],
    },
    {
      name: '参数映射', sig: 'input(文件, ss=, t=) / output(文件, **{...}) / .filter() / .global_args()',
      brief: 'ffmpeg 命令行参数如何映射到 Python 调用。',
      examples: [
        { title: '', code: `import ffmpeg\n\n# 等价命令行: ffmpeg -ss 10 -i in.mp4 -vf scale=1280:-2 -an -y out.mp4\n(\n    ffmpeg.input('in.mp4', ss=10)       # 输入侧参数\n    .filter('scale', 1280, -2)          # -vf 的内容\n    .output('out.mp4', an=None)         # 布尔开关参数传 None\n    .global_args('-y')                  # 全局参数\n    .run()\n)\n\n# 带冒号的参数名用 ** 字典兜底:\n.output('out.mp4', **{'b:v': '1M', 'maxrate': '2M'})\n\n# 只生成命令不执行, 检查对不对:\nprint(ffmpeg.input('a.mp4').output('b.mp4').compile())` },
      ],
      pitfalls: [
        '<b>调不通先 .compile() 打印等价命令行</b>，丢到 cmd 里跑，报错信息友好得多。',
        "带冒号的参数名（b:v）不能当关键字参数，必须 **{'b:v': '1M'}。",
        '布尔开关（如 -an 不要音频）传 None：<code>output("x.mp4", an=None)</code>。',
      ],
      related: ['基础流程', '常用操作'],
      tags: ['参数', 'filter', '调试'],
    },
  ],
});
