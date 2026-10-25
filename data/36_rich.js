/* rich：终端彩色输出/表格/进度条 */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'rich', name: 'rich', icon: '🌈', category: '自动化与效率',
  doc: 'https://rich.readthedocs.io/',
  desc: '让命令行工具好看好用：彩色文本、自动对齐的表格、多任务进度条、异常美化。',
  install: 'pip install rich',
  aliases: ['终端', '彩色输出', '控制台', '美化'],
  tips: [
    '最省事的用法：<code>from rich import print</code>，一行不改直接替换内置 print，列表/字典自动彩色缩进。',
    'import rich 之后，未捕获异常的堆栈会自动变成彩色高亮版，调试体验立刻提升。',
  ],
  entries: [
    {
      name: 'print-console', sig: "from rich import print / from rich.console import Console; c.print('[bold red]...[/]')",
      brief: '彩色文本与数据结构美化输出。',
      examples: [
        { title: '', code: `from rich import print\n\nprint('[bold green]完成[/]: 处理 128 个文件')      # [标记]...[/] 上色\nprint('[italic]耗时[/]:', 3.27, '秒')\nprint({'peak': [ (10.21, 3562), (12.44, 891) ]})   # dict/list 自动彩色缩进\n\n# 长期使用建议显式建 Console(可控宽度和输出目标)\nfrom rich.console import Console\nc = Console()\nc.print('[yellow]警告[/]: 编码不是 utf-8', style='on #333')` },
      ],
      pitfalls: [
        '文本里的 <b>[方括号]会被当标记解析</b>(打印路径/正则时)：转义 <code>\\[abc]</code> 或 <code>Console().print(..., markup=False)</code>。',
        '颜色/表情符号在老 cmd 里支持差，用 Windows Terminal、VSCode 终端体验最佳；输出重定向到文件时 rich 自动降级为纯文本。',
      ],
      related: ['table', 'progress'],
      tags: ['彩色', 'print', '终端'],
    },
    {
      name: 'table', sig: "from rich.table import Table; t = Table(title=); t.add_column(); t.add_row(); c.print(t)",
      brief: '自动对齐的命令行表格。',
      examples: [
        { title: '', code: `from rich.console import Console\nfrom rich.table import Table\n\nt = Table(title='样品计数结果', show_lines=False)\nt.add_column('样品', style='cyan')\nt.add_column('计数', justify='right')\nt.add_column('合格', justify='center')\n\nfor row in results:\n    t.add_row(row.name, f'{row.count:,}', '[green]✓[/]' if row.ok else '[red]✗[/]')\n\nConsole().print(t)      # 自动算列宽、加边框, 汉字对齐也正常` },
      ],
      pitfalls: [
        '对齐按"显示宽度"处理，中英混排基本不用管；但终端窗口太窄时 rich 会截断列，重要数字列放前面。',
      ],
      related: ['print-console'],
      tags: ['表格', '对齐', '报表'],
    },
    {
      name: 'progress', sig: "from rich.progress import track / with Progress() as p: p.add_task(...)",
      brief: '进度条：一行式 track 与多任务面板。',
      examples: [
        { title: '一行加进度条', code: `from rich.progress import track\n\nfor path in track(files, description='处理中'):\n    process(path)          # track 自动算速度/剩余时间` },
        { title: '多任务面板', code: `from rich.progress import Progress\n\nwith Progress() as p:\n    t1 = p.add_task('下载', total=len(urls))\n    t2 = p.add_task('解析', total=len(files))\n    for u in urls:\n        download(u); p.advance(t1)\n        parse(u);    p.advance(t2)   # 多条进度条同屏各自推进` },
      ],
      pitfalls: [
        '与 tqdm 二选一即可：rich 进度条适合"终端报告"，tqdm 更轻、pandas 集成更熟；同一个脚本混用两个进度条会刷屏打架。',
        '进度条在重定向/CI 日志里没意义：rich 检测到非终端会自动禁用，逻辑不用写两套。',
      ],
      related: ['print-console', 'table'],
      tags: ['进度条', 'track', '批量任务'],
    },
  ],
});
