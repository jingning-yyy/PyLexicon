/* 数据处理：pandas */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'pandas', name: 'pandas', icon: '🐼', category: '数据处理',
  doc: 'https://pandas.pydata.org/docs/',
  desc: '表格数据处理核心库：读取清洗、筛选变换、分组聚合、多表合并，数据分析主战场。',
  install: 'pip install pandas',
  aliases: ['pd', 'dataframe'],
  tips: [
    '约定 <code>import pandas as pd</code>；DataFrame 是二维表，Series 是一列。',
    'pandas 绝大多数操作<b>返回副本不修改原表</b>，但链式索引赋值会触发 SettingWithCopyWarning 且可能不生效 —— 赋值统一用 <code>df.loc[条件, 列] = 值</code>。',
    '看不懂报错时先 <code>df.info()</code> 和 <code>df.head()</code>：dtype 和数据长什么样，90% 的问题出在这。',
  ],
  entries: [
    {
      name: 'DataFrame', sig: "pd.DataFrame(data, columns=None, index=None)",
      brief: '从字典、列表、numpy 数组构造表格；Series 是它的一列。',
      examples: [
        { title: '三种常见构造', code: `import pandas as pd\n# 字典: 键=列名\ndf = pd.DataFrame({'姓名': ['张三', '李四'], '年龄': [25, 30]})\n# 列表套字典: 每个字典是一行\nrows = [{'a': 1, 'b': 2}, {'a': 3, 'b': 4}]\ndf2 = pd.DataFrame(rows)\n# numpy 数组 + 列名\nimport numpy as np\ndf3 = pd.DataFrame(np.arange(6).reshape(2, 3), columns=list('abc'))` },
      ],
      pitfalls: [
        '从列表套字典构造时，某个字典缺键会自动填 NaN。',
        '空 DataFrame 建议直接从带列名的列表构造，别用 <code>pd.DataFrame(columns=[...])</code> 后追加（慢且易错）。',
      ],
      related: ['read_csv', 'loc-iloc'],
      tags: ['构造', '创建', 'series'],
    },
    {
      name: 'read_csv', sig: "pd.read_csv(filepath_or_buffer, sep=',', header='infer', encoding=None, dtype=None, usecols=None, parse_dates=None, nrows=None, chunksize=None)",
      brief: '读取 CSV 文件为 DataFrame，数据分析第一步。',
      params: [
        { n: 'sep', t: 'str', d: '分隔符', dflt: "','；TSV 文件用 '\\t'" },
        { n: 'header', t: 'int / None', d: '第几行是表头；无表头文件设 header=None', dflt: "'infer'" },
        { n: 'names', t: 'list', d: '自定义列名（常配合 header=None）' },
        { n: 'usecols', t: 'list', d: '只读指定列，大文件提速' },
        { n: 'dtype', t: 'dict', d: "指定列类型，如 {'id': str} 防止编号被读成数字丢前导零" },
        { n: 'parse_dates', t: 'list', d: "读入时直接解析为时间，如 ['下单时间']" },
        { n: 'encoding', t: 'str', d: "文件编码；中文乱码时试 'gbk' 或 'utf-8-sig'" },
        { n: 'nrows', t: 'int', d: '只读前 N 行，快速试数据' },
        { n: 'chunksize', t: 'int', d: '分块读取，返回迭代器，处理超大文件' },
      ],
      examples: [
        { title: '日常读取模板', code: `import pandas as pd\ndf = pd.read_csv(\n    'data.csv',\n    encoding='utf-8-sig',        # 乱码先换 gbk / gbk18030 / utf-8-sig\n    dtype={'订单号': str},        # 编号类列读成字符串, 防止丢前导零\n    parse_dates=['下单时间'],\n    usecols=['订单号', '金额', '下单时间'],\n)\nprint(df.head())` },
        { title: '超大文件分块读', code: `chunks = pd.read_csv('big.csv', chunksize=100_000)\ntotal = 0\nfor c in chunks:\n    total += c['金额'].sum()\nprint(total)` },
      ],
      pitfalls: [
        '<b>中文乱码</b>是第一坑：依次试 <code>utf-8-sig → gbk → gb18030</code>；用记事本另存为看右下角编码也行。',
        '首列莫名变成 index：文件把行号也存进去了，加 <code>index_col=0</code>。',
        '默认会把 NA、null、空串等识别为 NaN；不想被转的字段用 <code>keep_default_na=False</code>。',
        '大文件先 <code>nrows=1000</code> 试读，确认格式再全量。',
      ],
      related: ['to_csv', 'read_excel', '缺失处理'],
      tags: ['读取', 'csv', 'io', '乱码'],
    },
    {
      name: 'to_csv', sig: "df.to_csv(path_or_buf, index=True, encoding=None, sep=',', float_format=None)",
      brief: 'DataFrame 写出为 CSV 文件。',
      examples: [
        { title: '', code: `df.to_csv('out.csv', index=False, encoding='utf-8-sig')\n# index=False: 不把行索引写进去(最常忘的参数)\n# utf-8-sig:  带 BOM, Excel 直接打开中文不乱码\n# 追加写: 先以 'a' 模式打开文件句柄\nwith open('out.csv', 'a', encoding='utf-8-sig') as f:\n    df.to_csv(f, index=False, header=f.tell() == 0)` },
      ],
      pitfalls: [
        '忘写 <code>index=False</code>，打开文件多出一列无名列。',
        '给 Excel 用户看的文件用 <code>encoding="utf-8-sig"</code>，纯 utf-8 在 Excel 双击打开中文乱码。',
      ],
      related: ['read_csv', 'read_excel'],
      tags: ['写出', 'csv', '保存'],
    },
    {
      name: 'read_excel', sig: "pd.read_excel(io, sheet_name=0, engine=None, usecols=None, dtype=None, skiprows=None)",
      brief: '读取 Excel（xlsx 用 openpyxl 引擎，xls 用 xlrd）。',
      params: [
        { n: 'sheet_name', t: 'int / str / None', d: '工作表；None 返回 {表名: DataFrame} 字典（全部表）', dflt: '0（第一张）' },
        { n: 'usecols', t: 'str / list', d: "选列，如 'A:C' 或 ['姓名','金额']" },
        { n: 'skiprows', t: 'int / list', d: '跳过开头说明行，如报表有标题行时 skiprows=2' },
        { n: 'header', t: 'int / None', d: '表头所在行；复杂表头可设 None 后自己指定 names' },
      ],
      examples: [
        { title: '', code: `import pandas as pd\ndf = pd.read_excel('报表.xlsx', sheet_name='销售明细', skiprows=1)\n# 读所有工作表\nsheets = pd.read_excel('报表.xlsx', sheet_name=None)\nfor name, df in sheets.items():\n    print(name, df.shape)` },
      ],
      pitfalls: [
        '读 xlsx 需要 <code>pip install openpyxl</code>；读老格式 .xls 需要 <code>xlrd&lt;2.0</code>。',
        '合并单元格只有左上角有值，其余是 NaN，读入后常需要 <code>ffill</code>。',
        '报表第一行是大标题时，表头会错位 —— 用 <code>header=1</code> 或 <code>skiprows</code>。',
      ],
      related: ['read_csv', 'to_csv'],
      tags: ['读取', 'excel', 'io'],
    },
    {
      name: 'head-info-describe', sig: 'df.head(n) / df.tail(n) / df.sample(n) / df.info() / df.describe()',
      brief: '数据体检五件套：看前几行、结构、缺失、统计概览。',
      examples: [
        { title: '拿到数据先跑一遍', code: `df.head()          # 前 5 行\ndf.sample(5)       # 随机 5 行, 防止数据有排序偏差\ndf.info()          # 有多少行、每列类型、非空数量 -> 判断缺失\ndf.describe()      # 数值列统计; df.describe(include='all') 含文本列\ndf.shape           # (行数, 列数)` },
      ],
      pitfalls: [
        '<code>info()</code> 显示的非空数 < 总行数 ⇒ 该列有缺失，比 <code>isna().sum()</code> 更快发现。',
        '<code>describe()</code> 默认只统计数值列，字符串列要 <code>include="all"</code>。',
        '某列本该是数字却是 object：说明混了脏数据（如 "1,000"、空格），数字列悄悄变字符串的排查入口。',
      ],
      related: ['缺失处理', 'value_counts'],
      tags: ['探查', '体检', 'info'],
    },
    {
      name: 'corr', sig: "df.corr(numeric_only=True) / df['a'].corr(df['b']) / df.corrwith(s)",
      brief: '相关系数：看哪些列和目标有关系，EDA 第一步。',
      examples: [
        { title: '', code: `df.corr(numeric_only=True)              # 全表数值列两两相关系数矩阵\n\ndf['含量'].corr(df['强度'])              # 两列相关系数(-1~1)\ndf.corr()['强度'].sort_values()          # 谁和"强度"最相关(排序)\n\n# 配热力图一眼看出强相关块:\nsns.heatmap(df.corr(numeric_only=True), annot=True, fmt='.2f', cmap='RdBu_r')` },
      ],
      pitfalls: [
        '<b>相关不等于因果</b>；相关系数只抓线性关系，0 相关也可能有非线性关系(画散点图确认)。',
        '新版本 pandas 全表 corr 遇到文本列会报错或告警，<b>numeric_only=True</b> 显式写上最稳。',
        ' Pearson 是默认方法；有序类别/非线性单调关系用 <code>method="spearman"</code>。',
      ],
      related: ['head-info-describe', 'pivot_table', 'groupby'],
      tags: ['相关系数', 'EDA', '热力图'],
    },
    {
      name: 'loc-iloc', sig: 'df.loc[行标签, 列名] / df.iloc[行位置, 列位置]',
      brief: '两大取数器：loc 按标签（切片含端点），iloc 按位置序号（切片不含端点）。',
      examples: [
        { title: '', code: `df.loc[0, '姓名']                    # 索引为 0 的行、姓名列\ndf.loc[df['年龄'] > 25, ['姓名', '年龄']]   # 条件筛选 + 选列\ndf.iloc[0:3, 0:2]                    # 前 3 行前 2 列(不含端点)\ndf.loc[df['金额'].idxmax()]          # 金额最大的那一行\n# 条件赋值的标准写法(避免 SettingWithCopyWarning):\ndf.loc[df['年龄'] > 25, '标签'] = '中年'` },
      ],
      pitfalls: [
        '<b>loc 切片含端点、iloc 不含</b>：df.loc[0:3] 是 4 行，df.iloc[0:3] 是 3 行。',
        '<code>df[df.a>1]["b"] = 1</code> 这种链式赋值<b>经常不生效</b>还弹警告；条件赋值唯一正解 <code>df.loc[mask, "b"] = 1</code>。',
        '索引经过 concat/筛选后可能重复，<code>df.loc[2]</code> 会取出多行 —— 需要"第 2 行"用 iloc。',
      ],
      related: ['loc-iloc', '列操作'],
      tags: ['取数', '索引', '筛选', '赋值'],
    },
    {
      name: '列操作', sig: "df['col'] / df[['a','b']] / df.rename(columns={...}) / df.drop(columns=[...]) / df['new'] = ...",
      brief: '选列、加列、改名、删列。',
      examples: [
        { title: '', code: `s = df['金额']                 # 取一列 -> Series\ndf2 = df[['金额', '数量']]     # 取多列 -> DataFrame(双层中括号)\ndf['总额'] = df['金额'] * df['数量']            # 加新列\ndf = df.rename(columns={'金额': 'sales'})      # 改名\ndf = df.drop(columns=['备注'])                 # 删列\ndf.insert(0, '序号', range(len(df)))           # 在指定位置插列` },
      ],
      pitfalls: [
        '<code>df[["a","b"]]</code> 双层括号取多列；单层 <code>df["a","b"]</code> 会当元组键报 KeyError。',
        '<code>df.金额</code> 点语法能取列但列名有空格/与方法同名时会出错，统一用中括号写法。',
        'rename/drop 都返回新表，<b>必须重新赋值</b> <code>df = df.drop(...)</code> 才生效。',
      ],
      related: ['loc-iloc', 'sort_values'],
      tags: ['列', '改名', '删除'],
    },
    {
      name: '筛选', sig: "df[mask] / df.query('a > 1 and b == 2') / df['a'].isin([...]) / df['s'].str.contains('x', na=False)",
      brief: '条件筛选行：布尔表达式、query、isin、字符串包含。',
      examples: [
        { title: '', code: `# 多条件: & | ~ 代替 and or not, 每个条件必须加括号!\nm = (df['城市'] == '北京') & (df['金额'] > 100)\ndf2 = df[m]\ndf3 = df[~m]                              # 取反\ndf4 = df[df['城市'].isin(['北京', '上海'])]  # 在列表中\ndf5 = df.query('金额 > 100 and 城市 == "北京"')  # query 写法\ndf6 = df[df['备注'].str.contains('退货', na=False)]  # 文本包含` },
      ],
      pitfalls: [
        '<b>&amp; | 两边条件必须加括号</b>，否则运算优先级错误报 ValueError。',
        '<code>and / or</code> 用在 pandas 条件里会报 "truth value ambiguous"，必须用 <code>&amp; |</code>。',
        '<code>str.contains</code> 遇到 NaN 返回 NaN，筛选时加 <code>na=False</code>，否则报错或丢行。',
      ],
      related: ['筛选', '列操作'],
      tags: ['筛选', '条件', '过滤'],
    },
    {
      name: 'groupby', sig: "df.groupby('key')['val'].agg(['mean', 'count']) / df.groupby('key').agg(新列=('val', 'sum'))",
      brief: '分组聚合：拆分-应用-合并，"每个 X 的 Y 统计" 都靠它。',
      params: [
        { n: 'by', t: '列名 / 列名列表', d: '分组键，可多列' },
        { n: 'as_index', t: 'bool', d: 'False 时分组键变回普通列（方便再写 Excel）', dflt: 'True' },
        { n: 'dropna', t: 'bool', d: '分组键为 NaN 的组是否丢弃', dflt: 'True' },
      ],
      examples: [
        { title: '', code: `g = df.groupby('城市')['金额']\ng.sum()                       # 每城市总金额\ng.agg(['sum', 'mean', 'count'])   # 一次算多个指标\n\n# 命名聚合(推荐, 列名清晰):\ndf.groupby('城市').agg(\n    总金额=('金额', 'sum'),\n    平均金额=('金额', 'mean'),\n    订单数=('订单号', 'nunique'),\n).reset_index()` },
      ],
      pitfalls: [
        '<code>groupby 默认 as_index=True</code>，分组键变成索引；要"还是普通列"就 <code>reset_index()</code> 或 as_index=False。',
        '聚合多列时 <code>df.groupby("k").mean()</code> 会把所有数值列都算了；只挑列 <code>df.groupby("k")["v"].mean()</code>。',
        '<b>transform 与 apply 区别</b>：transform 返回与原表等长的结果（组内均值打回每行），apply 随意；<code>df["城市均值"] = df.groupby("城市")["金额"].transform("mean")</code> 是超常用技巧。',
      ],
      related: ['pivot_table', 'apply-map'],
      tags: ['分组', '聚合', '统计', 'groupby'],
    },
    {
      name: 'merge', sig: "pd.merge(left, right, on=None, how='inner', left_on=None, right_on=None, validate=None)",
      brief: '表连接（SQL join）：按键把两张表横向拼起来。',
      params: [
        { n: 'on', t: '列名', d: '两表键列同名时用；不同名用 left_on/right_on' },
        { n: 'how', t: 'str', d: "连接方式：'inner'交集 / 'left'左全 / 'right' / 'outer'并集", dflt: "'inner'" },
        { n: 'suffixes', t: 'tuple', d: '重名列后缀', dflt: "('_x','_y')" },
        { n: 'validate', t: 'str', d: "校验键唯一性，如 '1:1'、'm:1'，防事故" },
      ],
      examples: [
        { title: '', code: `orders = pd.DataFrame({'uid': [1, 2, 2], 'amt': [100, 200, 50]})\nusers = pd.DataFrame({'uid': [1, 2, 3], 'name': ['张三', '李四', '王五']})\n\ndf = pd.merge(orders, users, on='uid', how='left', validate='m:1')\n# how='left' 保住左表全部行, 没匹配上的 name 为 NaN` },
      ],
      pitfalls: [
        '<b>键在右表有重复 → 行数爆炸（笛卡尔积）</b>，merge 前检查右表键唯一：<code>right["uid"].is_unique</code>。',
        'left join 后如何知道有没有匹配上：<code>df["name"].isna().sum()</code>，或加 <code>indicator=True</code> 看来源列。',
        '两表有同名列会自动加 _x/_y 后缀，想明确指定用 suffixes=("_o", "_u")。',
        'merge 是横向连接；纵向追加用 concat。',
      ],
      related: ['concat', 'groupby'],
      tags: ['连接', 'join', '合并', '匹配'],
    },
    {
      name: 'concat', sig: "pd.concat(objs, axis=0, ignore_index=False, join='outer')",
      brief: '纵向/横向堆叠多个 DataFrame。',
      examples: [
        { title: '', code: `import pandas as pd\nparts = [pd.read_csv(f) for f in ['jan.csv', 'feb.csv']]\ndf = pd.concat(parts, ignore_index=True)   # 纵向拼接并重排索引\n\n# 横向拼接(对齐索引):\ndf2 = pd.concat([df1, df3], axis=1)` },
      ],
      pitfalls: [
        '<b>不写 ignore_index=True 会出现重复索引</b>，之后 df.loc[0] 取出多行、sample 等行为诡异。',
        '列名不完全一致时 concat 会自动对齐补 NaN —— 静默产生缺失列，拼之前核对列名集合。',
        '大量 DataFrame 循环逐个 concat 是 O(n²)，先攒 list 最后 concat 一次。',
      ],
      related: ['merge'],
      tags: ['拼接', '追加', '堆叠'],
    },
    {
      name: 'sort_values', sig: "df.sort_values(by, ascending=True, na_position='last') / df.sort_index()",
      brief: '按列值排序；多列混排用列表。',
      examples: [
        { title: '', code: `df.sort_values('金额', ascending=False).head(10)      # 金额 Top10\ndf.sort_values(['城市', '金额'], ascending=[True, False])  # 城市升序内金额降序\ndf.sort_values('金额', na_position='first')           # 缺失排最前` },
      ],
      pitfalls: [
        '返回新表，要 <code>df = df.sort_values(...)</code>；想就地加 <code>inplace=True</code>（不推荐，pandas 未来会弱化 inplace）。',
        '分组内排序先 groupby 再 sort 不行，应 <code>df.sort_values(["k","v"])</code> 再 <code>groupby("k").head(3)</code> 取各组 Top3。',
      ],
      related: ['groupby', '列操作'],
      tags: ['排序', 'top'],
    },
    {
      name: '缺失处理', sig: "df.isna() / df.fillna(value) / df.dropna(subset=None, how='any') / df.ffill()",
      brief: '缺失值三件套：找出来、填掉、删掉。',
      examples: [
        { title: '', code: `df.isna().sum()                        # 每列缺失数(必会)\ndf['金额'] = df['金额'].fillna(0)       # 填 0\ndf['城市'] = df['城市'].fillna('未知')\ndf['价格'] = df['价格'].fillna(df['价格'].median())  # 填中位数\ndf2 = df.dropna(subset=['金额', '数量'])   # 关键列有缺失的行删掉\ndf['库存'] = df['库存'].ffill()            # 向下填充(时间序列常用)` },
      ],
      pitfalls: [
        '<b>fillna 返回新 Series/DataFrame</b>，必须重新赋值，直接写 df.fillna(0) 什么都不改。',
        '<code>fillna(method="ffill")</code> 已废弃，新版用 <code>df.ffill()</code> / <code>df.bfill()</code>。',
        '删除行前想清楚比例：<code>df.dropna()</code> 默认 any（有一列缺失就删整行），杀伤力很大，常配合 subset。',
        'pandas 的 NaN 和 None 在数值列都会被判 isna，但 object 列混存时用 <code>pd.isna</code> 统一判断。',
      ],
      related: ['head-info-describe', 'read_csv'],
      tags: ['缺失', 'fillna', 'dropna', '空值'],
    },
    {
      name: 'drop_duplicates', sig: "df.drop_duplicates(subset=None, keep='first', inplace=False)",
      brief: '按整行或指定列去重。',
      examples: [
        { title: '', code: `df.drop_duplicates()                          # 整行完全相同才去重\ndf.drop_duplicates(subset=['手机号'])          # 手机号只留第一次出现\ndf.drop_duplicates(subset=['uid'], keep='last')  # 留最后一次\n# 查看重复情况:\ndf.duplicated(subset=['手机号']).sum()         # 有多少条重复` },
      ],
      pitfalls: [
        '不传 subset 只去"整行一模一样"的；按业务键去重要显式传 subset。',
        '去重后索引有洞，接 <code>reset_index(drop=True)</code>。',
      ],
      related: ['concat', '缺失处理'],
      tags: ['去重', '重复'],
    },
    {
      name: 'apply-map', sig: "Series.map(func_or_dict) / df.apply(func, axis=0/1) / df.map(func)  # 旧版 applymap",
      brief: '三个"逐元素/逐行"自定义函数入口，vectorization 不够用时上。',
      examples: [
        { title: '', code: `# map: Series 逐元素, 传函数或字典\ndf['等级'] = df['分数'].map(lambda x: '及格' if x >= 60 else '不及格')\ndf['城市码'] = df['城市'].map({'北京': 1, '上海': 2})   # 没映射上的变 NaN\n\n# apply: DataFrame 上逐行(axis=1)/逐列(axis=0)\ndf['标签'] = df.apply(lambda r: f"{r['城市']}-{r['等级']}", axis=1)\n\n# 逐元素改整张表(2.1+ 推荐 df.map, 老版本 applymap):\ndf2 = df.map(lambda x: round(x, 2) if isinstance(x, float) else x)` },
      ],
      pitfalls: [
        '<b>map 是 Series 方法</b>，DataFrame 上没有（2.1 后 df.map 是逐元素，语义不同）。',
        'apply(axis=1) 逐行很慢，能用向量化（np.where、map 字典）就别用 apply；千万行数据差距是分钟级 vs 毫秒级。',
        'map 用字典映射时，字典里没有的值会变 NaN —— 是特性也是坑。',
      ],
      related: ['groupby', '筛选'],
      tags: ['apply', 'map', '自定义函数'],
    },
    {
      name: 'value_counts', sig: "s.value_counts(normalize=False, bins=None, ascending=False, dropna=True)",
      brief: '一列的频数统计（分类数据必会），比 groupby+count 快一步到位。',
      examples: [
        { title: '', code: `df['城市'].value_counts()               # 每个城市出现次数(默认降序)\ndf['城市'].value_counts(normalize=True) # 占比\ndf['年龄'].value_counts(bins=[0, 18, 30, 50, 100])  # 按区间分段计数\n# 只看出现超过 10 次的:\nvc = df['城市'].value_counts()\nvc[vc > 10]` },
      ],
      pitfalls: [
        '是 <b>Series 方法</b>，DataFrame 上没有；多列交叉频数用 <code>pd.crosstab(df["a"], df["b"])</code>。',
        '默认丢弃 NaN（dropna=True），统计"有多少空值"要用 <code>df["col"].isna().sum()</code>。',
      ],
      related: ['groupby', 'head-info-describe'],
      tags: ['频数', '计数', '分布'],
    },
    {
      name: 'to_datetime', sig: "pd.to_datetime(s, format=None, errors='raise') / s.dt.year / s.dt.month",
      brief: '字符串转时间类型 + dt 访问器提取年月日星期。',
      examples: [
        { title: '', code: `df['时间'] = pd.to_datetime(df['时间'])                       # 自动解析\ndf['时间'] = pd.to_datetime(df['时间'], format='%Y/%m/%d')    # 指定格式更快更稳\ndf['年'] = df['时间'].dt.year\ndf['月'] = df['时间'].dt.month\ndf['星期'] = df['时间'].dt.dayofweek        # 0=周一\ndf['日期'] = df['时间'].dt.date             # 转 date 对象(注意类型变 object)` },
      ],
      pitfalls: [
        '列是 object 类型时 <code>.dt</code> 访问器直接报错 —— 说明还没转成 datetime64。',
        '混有多种格式/有脏数据时加 <code>errors="coerce"</code>，解析失败的变 NaT 而不是中断整个转换。',
        '中文格式如 "2024年5月1日" 先 replace 再转；日月在前的字符串必须显式 format，否则 03/04 是 3月4日还是4月3日全靠猜。',
      ],
      related: ['groupby', '缺失处理'],
      tags: ['时间', '日期', 'datetime'],
    },
    {
      name: 'to_numeric-astype', sig: "pd.to_numeric(s, errors='raise'/'coerce') / df['col'].astype('int64'/'float')",
      brief: '列类型转数值：字符串/混杂列安全转数字；astype 强转类型。',
      examples: [
        { title: '', code: `df.dtypes                                       # 先看各列类型(object 多半是字符串)\ndf['数量'] = pd.to_numeric(df['数量'])                # 纯数字字符串 -> 数值\ndf['金额'] = pd.to_numeric(df['金额'], errors='coerce')  # 转不了的(如 '无') 变 NaN 不报错\ndf['数量'] = df['数量'].astype('int64')               # 确认无空值后再强转整数\nnum_cols = df.select_dtypes('number').columns         # 挑出所有数值列\ndf[num_cols] = df[num_cols].apply(pd.to_numeric, errors='coerce')   # 多列批量转` },
      ],
      pitfalls: [
        '<code>to_numeric</code> 只收一列(Series)；多列要 <code>df.apply(pd.to_numeric, errors="coerce")</code> 逐列转。',
        '<code>astype</code> 是强转，碰到 NaN / 非数字直接抛 ValueError；float 列有 NaN 也不能 astype(int)，先 fillna 或 to_numeric(coerce) 清洗。',
        '"1,000" 带千分位、"¥99" 带符号、全角数字都要先 <code>str.replace</code> 清洗再转，否则 coerce 后整列变 NaN。',
        '和 <code>to_datetime</code> 分工：日期列用 to_datetime，数值列用 to_numeric；只是想改类型(数值↔字符串)用 astype。',
      ],
      related: ['to_datetime', 'apply-map', '缺失处理'],
      tags: ['数值', '类型转换', 'astype'],
    },
    {
      name: 'pivot_table', sig: "pd.pivot_table(df, values, index, columns, aggfunc='mean', fill_value=0, margins=True)",
      brief: '数据透视表：行×列交叉汇总，Excel 透视表的代码版。',
      examples: [
        { title: '', code: `pd.pivot_table(df,\n    values='金额',\n    index='城市',            # 行\n    columns='季度',          # 列\n    aggfunc='sum',           # 聚合方式: sum/mean/count 或列表\n    fill_value=0,            # 空组合填 0\n    margins=True, margins_name='合计',   # 加总计行/列\n)` },
      ],
      pitfalls: [
        'pivot_table 默认 aggfunc 是 <b>mean 不是 sum</b>，金额类汇总忘改就全错了。',
        '默认会丢弃组合缺失的行（dropna=True），透视结果行数变少时检查这个。',
        '只是交叉计数用 <code>pd.crosstab(index, columns)</code> 更简洁。',
      ],
      related: ['groupby'],
      tags: ['透视表', '交叉', '汇总'],
    },
    {
      name: 'melt', sig: "df.melt(id_vars='标识列', var_name='变量名', value_name='值')",
      brief: '宽表变长表：多列揉成"变量+值"两列，画图前必备。',
      examples: [
        { title: '', code: `df = pd.DataFrame({\n    '样品': ['S1', 'S2'],\n    'SiO2': [45.7, 44.1],\n    'CaO':  [8.3, 9.0],\n})\nlong = df.melt(id_vars='样品', var_name='成分', value_name='含量')\n#    样品   成分   含量\n# 0  S1   SiO2  45.7\n# 1  S2   SiO2  44.1\n# 2  S1    CaO   8.3   <- 多列变成一列分类+一列数值\n\n# seaborn/plotly 的"长表"输入就是它产出的:\nsns.barplot(long, x='样品', y='含量', hue='成分')` },
      ],
      pitfalls: [
        'melt 是 pivot_table 的<b>逆操作</b>：宽变长用 melt，长变宽用 pivot/pivot_table，方向别搞反。',
        '<code>id_vars</code> 是保持不动的标识列，其余列全部被"揉掉"——列名进 var_name 列、数值进 value_name 列。',
        '多个标识列传列表：id_vars=[\'样品\', \'批次\']；结果行数 = 原行数 × 被揉列数，数据量大时注意。',
      ],
      related: ['pivot_table', 'groupby'],
      tags: ['宽变长', 'melt', '长表', '画图'],
    },
    {
      name: 'set_index-reset_index', sig: "df.set_index('列') / df.reset_index(drop=False)",
      brief: '行索引设置与还原：把某列变索引、索引变回列。',
      examples: [
        { title: '', code: `df = df.set_index('订单号')            # 订单号列变成行索引
# 此时 df.loc['SO2024001'] 按标签直接取行

df = df.reset_index()                  # 索引变回普通列
df = df.reset_index(drop=True)         # 丢弃原索引(拼接/去重后常用)

# 日期列设为索引后, 切片/重采样才方便:
df = df.set_index('日期').sort_index()
df['2024-05':'2024-06']                # 按日期切片` },
      ],
      pitfalls: [
        'set_index 之后 <code>loc[值]</code> 是按索引标签取行，不再是"第几行"；按位置仍用 iloc。',
        'reset_index 不加 drop=True 时旧索引会变成一列；不想要就 drop。',
        '数据清洗完通常 <code>reset_index(drop=True)</code> 收尾，避免索引有洞。',
      ],
      related: ['sort_values', 'groupby'],
      tags: ['索引', 'index'],
    },
    {
      name: 'rolling-shift', sig: "df['v'].rolling(7).mean() / df['v'].shift(1) / pct_change() / diff()",
      brief: '滚动统计与错位对比：移动平均、昨日值、环比、增量。',
      examples: [
        { title: '', code: `df['7日均值'] = df['销量'].rolling(7).mean()      # 移动平均
df['昨日'] = df['销量'].shift(1)                  # 整体下移一行
df['环比'] = df['销量'].pct_change() * 100        # 相邻变化率%
df['增量'] = df['销量'].diff()                    # 相邻差值

# 时间序列先按日期排好序再算:
df = df.sort_values('日期')` },
      ],
      pitfalls: [
        'rolling 前 n-1 个结果为 <b>NaN</b>（窗口不满），不是 bug。',
        '<b>shift(1) 是环比/同比类特征的基础</b>，但必须先按时间排序，否则对比错行。',
        'rolling 默认只看当前行往前 n 行；expanding 是"从头累计"版。',
      ],
      related: ['sort_values', 'groupby', 'to_datetime'],
      tags: ['滚动', '移动平均', '环比', '时间序列'],
    },
    {
      name: 'resample', sig: "df.set_index('日期').resample('D'/'M'/'h').mean() / .sum() / .agg(['mean','count'])",
      brief: '时间序列重采样：按天/周/月聚合，高频降采样或低频补齐。',
      examples: [
        { title: '', code: `# 前提: 时间列先变索引(或用 on='日期' 参数)\ndf = df.set_index('时间')\n\nmonthly = df['销量'].resample('M').sum()      # 按月求和: D天 W周 M月 h时\nhourly  = df['温度'].resample('h').mean()     # 按小时平均(降采样)\n\n# 降采样多个指标一次出:\nagg = df.resample('W').agg({'销量': 'sum', '温度': 'mean'})\n\n# 低频数据补齐成连续时间轴(缺的给 NaN):\nfull = df.resample('D').asfreq()` },
      ],
      pitfalls: [
        '<b>必须先把时间列 set_index</b>(或 resample(on="日期"))，普通整数索引直接报 TypeError。',
        '规则字符串大小写有讲究：<code>D/W/M/h</code>——月是 <b>大写 M</b>，分钟是小写 min（旧写法 M 已改名）。',
        'resample 只负责"切桶"，切完必须接聚合(sum/mean/agg)；降采样时 <code>label=\'left\', closed=\'left\'</code> 控制桶归属。',
      ],
      related: ['rolling-shift', 'to_datetime', 'groupby'],
      tags: ['重采样', '时间序列', '按月汇总'],
    },
    {
      name: 'sample-nlargest-cut', sig: "df.sample(100) / df.nlargest(10, '列') / pd.cut(s, bins=) / df.explode('列')",
      brief: '抽样、取 Top N、分箱、列表拆行 四个小而常用操作。',
      examples: [
        { title: '', code: `df.sample(100, random_state=42)             # 随机抽100行(可复现)
df.nlargest(10, '金额')                       # 金额最大的10行
df.nsmallest(5, '年龄')

# 等宽分箱: 每箱宽度相同
pd.cut(df['年龄'], bins=[0, 18, 35, 60, 100], labels=['未成年', '青年', '中年', '老年'])
# 等频分箱: 每箱样本数相同
pd.qcut(df['消费'], q=4, labels=['低', '中', '高', '超高'])

# 列里存了列表 -> 拆成多行
df.explode('标签列')` },
      ],
      pitfalls: [
        'sample 记得 random_state 固定，否则每次抽样不同。',
        '<b>cut 是等宽、qcut 是等频</b>，别混；labels 给好可读名，后续画图建模都方便。',
        'explode 之前的列必须真的是 list 类型，字符串 "1,2" 要先 str.split。',
      ],
      related: ['sort_values', 'value_counts'],
      tags: ['抽样', 'top', '分箱'],
    },
  ],
});
