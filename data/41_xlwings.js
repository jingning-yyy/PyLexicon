/* xlwings：驱动真实 Excel 的自动化 */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'xlwings', name: 'xlwings', icon: '📥', category: '自动化与效率',
  doc: 'https://docs.xlwings.org/',
  desc: '直接操控打开着的 Excel：公式、格式、宏都能碰，适合"Excel 流程重度"的办公自动化；读写数据用 openpyxl/pandas 就够。',
  install: 'pip install xlwings',
  aliases: ['excel', '表格自动化', '宏'],
  tips: [
    '选型：只要<b>读写数据</b>用 pandas/openpyxl（快、无需装 Excel）；要<b>公式重算/格式/图表/VBA 宏</b>才上 xlwings（要求本机装了 Excel）。',
    'xlwings 能把 Python 函数暴露成 Excel 自定义函数（UDF），表格里直接 =py函数() 调用。',
  ],
  entries: [
    {
      name: 'open-读写', sig: "import xlwings as xw / app = xw.App() / wb = xw.Book('a.xlsx') / wb.sheets[0].range('A1').value",
      brief: '打开工作簿与读写单元格/区域。',
      examples: [
        { title: '', code: `import xlwings as xw\n\nwb = xw.Book('data.xlsx')\nsht = wb.sheets['Sheet1']\n\nsht.range('A1').value = '样品'              # 写单元格\nsht.range('A2').value = [['S1', 45.7], ['S2', 8.3]]   # 写区域(嵌套列表)\n\nvals = sht.range('A1').expand().value       # 读整个连续区域 -> 嵌套列表\nprint(vals[0], vals[1])\n\nwb.save('out.xlsx')\nwb.close()\napp = xw.apps.active\nif app: app.quit()` },
      ],
      pitfalls: [
        '<b>必须本机安装 Excel</b>（Mac 是 Numbers 不行）；服务器/无 Excel 环境直接用 openpyxl。',
        '读写区域用嵌套列表：<code>range(\'A1:B2\').value</code> 返回二维列表；单个数会少一层，取值先看形状。',
        '忘了 close/quit，Excel 进程会残留在后台（任务管理器里一排EXCEL.EXE）：用 with 或 finally 收尾。',
      ],
      related: ['pandas结合'],
      tags: ['excel', '工作簿', '单元格'],
    },
    {
      name: 'pandas结合', sig: "sht.range('A1').options(pd.DataFrame, expand='table').value / sht.range('A1').options(index=False).value = df",
      brief: 'DataFrame 与 Excel 互转：分析流程无缝衔接。',
      examples: [
        { title: '', code: `import xlwings as xw\nimport pandas as pd\n\nwb = xw.Book('data.xlsx')\nsht = wb.sheets[0]\n\n# Excel -> DataFrame(首行做表头, 自动扩到整表)\ndf = sht.range('A1').options(pd.DataFrame, expand='table').value\nprint(df.head())\n\n# DataFrame -> Excel(不写索引)\nout = df.groupby('成分')['含量'].mean().reset_index()\nsht.range('E1').options(index=False).value = out\n\n# 顺手让 Excel 把公式重算完再取数:\nwb.app.calculate()` },
      ],
      pitfalls: [
        'expand="table" 会从起点自动扩到整个连续区域，起点上方/右侧有空行有空列就断——表要"干净"。',
        '写 DataFrame 默认带索引列，难看又碍事：<b>options(index=False)</b>。',
        '大数据量(十万行+)走 xlwings 很慢(逐格过 COM 接口)：先 pandas 算完、openpyxl 写入，xlwings 只做最后一步格式。',
      ],
      related: ['open-读写'],
      tags: ['DataFrame', '互转', 'groupby'],
    },
    {
      name: '公式与宏', sig: "sht.range('B1').formula = '=SUM(B2:B10)' / wb.macro('宏名')()",
      brief: '写公式、调 VBA 宏：老表格流程的 Python 化。',
      examples: [
        { title: '', code: `import xlwings as xw\n\nwb = xw.Book('report.xlsx')\nsht = wb.sheets[0]\n\nsht.range('D1').formula = '=AVERAGE(B2:B13)'      # 写公式, Excel 负责算\nsht.range('D2').value = '=IF(C2>90,"合格","复测")'\n\nwb.app.screen_updating = False    # 批量写时关刷新, 快好几倍\nfor row in range(2, 500):\n    sht.range(f'B{row}').formula = f'=C{row}*0.01'\nwb.app.screen_updating = True\n\n# 调工作簿里已有的 VBA 宏(文件需为 .xlsm):\n# wb.macro('刷新透视表')()` },
      ],
      pitfalls: [
        'formula 写的是<b>英文公式</b>且函数名逗号都是英文版语法；本地 Excel 显示中文公式不影响。',
        'screen_updating / calculation 关掉后忘了开，Excel 表现为"不动了"——用 try/finally 保证恢复。',
        '宏文件必须是 .xlsm 且信任中心允许宏；只想"跑一遍 VBA 的活"，长期看不如直接用 Python 重写流程。',
      ],
      related: ['open-读写', 'pandas结合'],
      tags: ['公式', 'VBA', '宏', '批量'],
    },
  ],
});
