/* Markdown 语法速查：README / 文档 / issue 写作（「速查」分类） */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'markdown', name: 'Markdown 语法', icon: 'Ⓜ️', category: '速查',
  doc: 'https://markdown.com.cn/',
  desc: '写文档的事实标准：README、GitHub issue、Jupyter 笔记、博客全用它。标题、列表、表格、代码块一页速查。',
  install: false,
  aliases: ['markdown', 'md', 'README', '文档写作', '语法'],
  tips: [
    'README.md、GitHub issue/PR、Jupyter 文本格用的都是 Markdown；GitHub 风格（GFM）是事实标准，本页按 GFM 写。',
    '验证渲染效果：VSCode 里 <b>Ctrl+Shift+V</b> 打开预览，或用任何分栏实时预览的编辑器。',
  ],
  entries: [
    {
      name: '标题与强调', sig: "# 一级标题 / **粗体** / *斜体* / ~~删除线~~ / `行内代码`",
      brief: '标题分级与文字强调：最常用的六件套。',
      examples: [
        { title: '', code: `# 一级标题（文档名, 一篇只用一个）\n## 二级标题（章节）\n### 三级标题（小节）\n\n**加粗** 或 __加粗__\n*斜体* 或 _斜体_\n***粗斜体***\n~~删除线~~\n行内代码 \`pip install pandas\`\n\n上一行末尾两个空格  \n就会强制换行（否则是同一段）\n\n---                       # 分隔线（前后留空行）` },
      ],
      pitfalls: [
        '<code>#</code> 后面必须有空格再写文字，<code>#标题</code> 不会生效。',
        '中文场景 <code>*斜体*</code> 紧贴汉字时部分渲染器不生效——中文文档优先用加粗和行内代码。',
        '<code>---</code> 紧贴文字上一行时会被解析成"把上一行变二级标题"（setext 语法），做分隔线要前后留空行。',
        '行内代码里想显示反引号本身：用双反引号包裹，如 `` ``code`` ``。',
      ],
      related: ['列表与引用', '代码块与表格'],
      tags: ['标题', '加粗', '斜体', '换行'],
    },
    {
      name: '列表与引用', sig: "- 无序列表 / 1. 有序列表 / - [x] 任务列表 / > 引用",
      brief: '清单与引用块：待办、步骤、摘录。',
      examples: [
        { title: '', code: `- 无序项\n  - 子项（缩进 2 空格）\n    - 三级\n\n1. 第一步\n1. 第二步           # 编号全写 1. 也行, 渲染自动递增\n1. 第三步\n\n- [x] 已完成\n- [ ] 待办           # 任务列表(GFM)\n\n> 一级引用\n> > 嵌套引用\n> 引用里也能 **加粗** 和写列表` },
      ],
      pitfalls: [
        '嵌套层级靠缩进，<b>2 空格和 4 空格在不同渲染器表现有差异</b>，同一篇文档保持一种写法。',
        '任务列表 <code>- [ ]</code> 是 GitHub 扩展语法，严格 CommonMark 不认；GitHub/Typora/语雀都支持。',
        '列表项之间插普通段落会把列表"打断"成两截，连续内容写成列表项的缩进段落（缩进对齐文字位置）。',
      ],
      related: ['标题与强调'],
      tags: ['列表', '待办', '引用'],
    },
    {
      name: '代码块与表格', sig: "```语言 ... ``` 围栏代码块 / | 列 | 列 | 表格",
      brief: '带语法高亮的代码块与对齐可控的表格。',
      examples: [
        { title: '代码块', code: `\`\`\`python\ndef smooth(y, k=5):\n    return y.rolling(k).mean()\n\`\`\`\n\n\`\`\`bash\npip install pandas      # 语言名决定高亮\n\`\`\`` },
        { title: '表格', code: `| 参数    | 类型 | 默认值 |\n|:-------|-------:|:-----:|\n| encoding | str  | utf-8 |\n| header   | int  | 0     |\n\n# 冒号位置: :--- 左对齐 / ---: 右对齐 / :---: 居中` },
      ],
      pitfalls: [
        '围栏代码块的<b>语言名决定语法高亮</b>（python / bash / json / sql…），不写也能显示只是没颜色。',
        '表格单元格内不能直接换行，要换行写 <code>&lt;br&gt;</code>；竖线字符本身用 <code>&amp;#124;</code> 表示。',
        '表格和代码块前后各留一个空行，紧贴正文时部分渲染器不识别。',
      ],
      related: ['标题与强调', '链接图片与转义'],
      tags: ['代码块', '语法高亮', '表格'],
    },
    {
      name: '链接图片与转义', sig: "[文字](网址) / ![描述](图片路径) / [^1] 脚注 / \\* 转义",
      brief: '超链接、插图、脚注与特殊字符转义。',
      examples: [
        { title: '', code: `[官方文档](https://docs.python.org)\n<https://docs.python.org>            # 尖括号自动链接\n![谱图](img/spectrum.png)            # 图片 = 链接前面加 !\n\n参考式链接（正文更清爽）:\n详见 [pandas 文档][pd] 与 [NumPy 文档][np]\n\n[pd]: https://pandas.pydata.org\n[np]: https://numpy.org\n\n脚注写法[^1]\n[^1]: 脚注内容放在文末\n\n要显示 Markdown 符号本身, 前面加 \\ 转义: \\*星号\\* \\#井号` },
      ],
      pitfalls: [
        '图片路径以 <b>md 文件所在目录</b>为基准；推到 GitHub 时路径大小写必须与仓库一致（Windows 不区分、区分）。',
        '显示 <code>*</code> <code>#</code> <code>\\</code> 等符号本身用反斜杠转义；显示反引号用不同数量的反引号包裹。',
        '链接文字里的空格和括号没问题，但 URL 里有空格要用 <code>%20</code> 或尖括号包住。',
      ],
      related: ['代码块与表格', '标题与强调'],
      tags: ['链接', '图片', '脚注', '转义'],
    },
  ],
});
