/* VSCode 速查：编辑器效率键与常用设置（「速查」分类） */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'vscode', name: 'VSCode 速查', icon: '🧑‍💻', category: '速查',
  doc: 'https://code.visualstudio.com/docs',
  desc: '写代码的主场：多光标编辑、全局搜索跳转、终端与调试、必改设置。快捷键以 Windows 为准。',
  install: false,
  aliases: ['vscode', '编辑器', '快捷键', 'ide'],
  tips: [
    '只记 5 个就能回本：<b>Ctrl+P</b> 找文件、<b>Ctrl+Shift+F</b> 全局搜、<b>Ctrl+D</b> 连选相同词、<b>Ctrl+`</b> 开终端、<b>F12</b> 跳定义。',
    'Ctrl+Shift+P 命令面板能搜到所有功能（含快捷键修改），忘了快捷键就来这里搜关键词。',
  ],
  entries: [
    {
      name: '编辑快捷键', sig: 'Ctrl+D 多选 / Alt+↑↓ 移行 / Ctrl+/ 注释 / Shift+Alt+F 格式化',
      brief: '高频编辑键：批量改、整行挪、一键注释。',
      examples: [
        { title: '', code: `Ctrl+D              # 选中一个词, 再按依次选中下一个相同词, 同步编辑\nCtrl+Shift+L        # 一次选中全部相同词(和上条配套)\nAlt+↑ / Alt+↓       # 当前行/选中行整体上下移\nShift+Alt+↓         # 向下复制一行\nCtrl+/              # 注释/取消注释当前行或选中块\nShift+Alt+F         # 整篇格式化(Python 需装 black/autopep8 扩展)\nCtrl+X 不选中       # 直接剪切/删除整行\nCtrl+Enter          # 下方新起一行(不动光标位置)` },
      ],
      pitfalls: [
        'Ctrl+D 多选后打字是<b>所有选中处同时改</b>——重命名局部变量最快的办法；改动面大还是用 F2 重命名(全项目安全)。',
        '中文输入法可能吞掉 Alt 系快捷键，冲突时到 文件→首选项→键盘快捷方式 里改键。',
        'Shift+Alt+F 没反应多半是没装对应格式化扩展，Python 装 Black 后在设置里设为默认格式化程序。',
      ],
      related: ['搜索与跳转'],
      tags: ['快捷键', '多光标', '注释'],
    },
    {
      name: '搜索与跳转', sig: 'Ctrl+P 文件 / Ctrl+Shift+F 全局搜 / F12 定义 / Ctrl+点击',
      brief: '在陌生代码库里迷路时，靠这四个键找路。',
      examples: [
        { title: '', code: `Ctrl+P              # 按文件名找文件(输入 dir/文件名 可带路径)\nCtrl+Shift+F        # 全项目搜文本(支持大小写/正则, 点结果直接跳行)\nF12                 # 跳到函数/变量定义处\nAlt+F12             # 原地偷看定义(不跳走)\nShift+F12           # 找所有引用: 这个函数都被谁调了\nCtrl+G              # 跳到指定行号\nCtrl+Tab            # 在最近打开的文件间切换\nCtrl+Shift+O        # 当前文件内按符号(函数/类)跳转` },
      ],
      pitfalls: [
        '读代码路径：F12 跳定义 → Shift+F12 看引用，来回两下就摸清调用关系，比全局搜精准。',
        '全局搜索把 venv/输出目录也扫了很吵：设置里 <code>search.exclude</code> 加排除（.venv、output 等）。',
        'F12 跳不过去说明该语言扩展没装/没生效（Python 扩展 + 选对解释器）。',
      ],
      related: ['编辑快捷键', '运行与终端'],
      tags: ['搜索', '跳转', '引用'],
    },
    {
      name: '运行与终端', sig: 'Ctrl+` 终端 / F5 调试 / 右上角运行按钮 / 断点',
      brief: '跑脚本、打断点、看变量，不用离开编辑器。',
      examples: [
        { title: '', code: `Ctrl+\`              # 开/关内置终端(按默认终端设置, 反引号在 Esc 下方)\n右上角 ▶            # 直接运行当前 .py(用的是右下角所选解释器!)\nF5                  # 调试运行: 需先建 launch 配置或选 Python File\nF9                  # 当前行打断点(红点)\nF10 / F11           # 单步跳过 / 单步进入函数\n调试侧栏            # 看变量值; 调试控制台里随手敲表达式\nCtrl+F5             # 运行但不调试` },
      ],
      pitfalls: [
        '右下角状态栏的<b>解释器</b>决定"▶运行/F5/补全"用哪个 Python：换了 venv 必须重新选（Ctrl+Shift+P → Python: Select Interpreter）。',
        '终端里 python 不是想要的那个：<code>where python</code> 看路径，或养成 <code>python -m pip</code> 的习惯。',
        '断点打在"模块导入时执行"的顶层代码不触发的话，检查是不是调试的入口文件选错了。',
      ],
      related: ['搜索与跳转', '编辑快捷键'],
      tags: ['终端', '调试', '断点', '解释器'],
    },
    {
      name: '必改设置', sig: 'Ctrl+, 设置 / files.autoSave / files.encoding / python.defaultInterpreterPath',
      brief: '装好先改这几项：自动保存、默认编码、中文乱码根治。',
      examples: [
        { title: 'settings.json 常用片段', code: `{\n  "files.autoSave": "afterDelay",          // 自动保存(改完代码忘了 Ctrl+S 的救星)\n  "files.encoding": "utf8",                // 新文件默认 utf-8\n  "files.autoGuessEncoding": true,         // 打开 gbk 老文件自动猜编码\n  "editor.fontSize": 15,\n  "editor.renderWhitespace": "boundary",   // 显示尾随空格\n  "search.exclude": { "**/.venv": true, "**/output": true },\n  "editor.formatOnSave": true              // 保存自动格式化\n}` },
        { title: '中文乱码场景', code: `# 打开老 gbk 文件满屏乱码:\n右下角状态栏点编码 -> Reopen with Encoding -> GBK   # 先正确打开\n-> Save with Encoding -> UTF-8                      # 再转存为新编码\n\n# 终端输出中文乱码: PowerShell 里执行\n[Console]::OutputEncoding = [Text.Encoding]::UTF8` },
      ],
      pitfalls: [
        'autoGuessEncoding 开了也<b>不是万能</b>：gbk/utf-8 都能"猜通"的文件照样猜错，可疑时手动指定重开。',
        'settings 分"用户"(全局)和"工作区"(仅本项目)：项目特殊配置存工作区，随 .vscode/ 目录走，别污染全局。',
        '改了 settings.json 手滑多个/少了逗号会整文件失效——设置界面里改最安全。',
      ],
      related: ['运行与终端'],
      tags: ['设置', '编码', '自动保存'],
    },
  ],
});
