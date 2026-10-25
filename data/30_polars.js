/* polars：新一代 DataFrame，pandas 的高速替代 */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'polars', name: 'polars', icon: '🐻', category: '数据处理',
  doc: 'https://docs.pola.rs/',
  desc: 'Rust 实现的 DataFrame 库：读大 CSV 明显快于 pandas、内存占用低、懒执行自动优化；语法与 pandas 相近但更严格。',
  install: 'pip install polars',
  aliases: ['polar', 'DataFrame加速', '大数据'],
  tips: [
    '和 pandas 什么关系：不是替代是互补——几十 MB 小表格继续 pandas(生态全)，几百 MB 起或嫌 pandas 慢时换 polars。',
    '懒执行 <b>scan_csv → filter → collect</b> 才是性能大头：谓词下推+只读需要的列，比 read_csv 再筛选快好几倍。',
  ],
  entries: [
    {
      name: 'read-csv', sig: "pl.read_csv('x.csv') / pl.scan_csv('x.csv').collect() / df.head() / df.glimpse()",
      brief: '读取表格与快速预览。',
      examples: [
        { title: '', code: `import polars as pl, io, pathlib\n\n# polars 只认 utf-8, gbk 文件要先解码(与 pandas 不同!)\nraw = pathlib.Path('data.csv').read_bytes()\ndf = pl.read_csv(io.StringIO(raw.decode('gbk')))\nprint(df.head())\ndf.glimpse()                                       # 横向预览每列类型+样例, 比 info 直观\n\n# 大文件推荐懒加载: 只收集需要的行和列\nout = (pl.scan_csv('big.csv')\n          .filter(pl.col('year') == 2026)\n          .select(['year', 'value'])\n          .collect())` },
      ],
      pitfalls: [
        '<code>read_csv</code> 是立即全量读；<b>scan_csv 懒加载</b>配合 collect 才会做谓词下推优化，大文件别用错入口。',
        '读 excel 需要 <code>pip install fastexcel</code>；写 excel 需要 xlsxwriter。',
        '<b>read_csv 的 encoding 只支持 utf-8</b>(utf8-lossy 忽略坏字节)；gbk 文件要自己 decode 后喂 StringIO——这点和 pandas 直接给 encoding="gbk" 不同。',
      ],
      related: ['表达式核心', 'pandas互转'],
      tags: ['读取', 'csv', '懒加载'],
    },
    {
      name: '表达式核心', sig: "df.select(pl.col('a') * 2) / df.filter(条件) / df.with_columns(新列=...)",
      brief: 'polars 的灵魂：一切变换都是 pl.col 表达式。',
      examples: [
        { title: '', code: `import polars as pl\n\n# 选列+变换: 返回新 df, 不改原 df\nsub = df.select('name', (pl.col('value') * 2).alias('value2'))\n\n# 行过滤: 多条件 & | 记得给每个条件套括号\nbig = df.filter((pl.col('value') > 5) & (pl.col('year') == 2026))\n\n# 加新列/改列: with_columns\nout = (df.with_columns(pl.col('value').log10().alias('log_v'))\n         .with_columns(is_hot = pl.col('value') > df['value'].median())\n         .sort('value', descending=True))` },
      ],
      pitfalls: [
        '条件组合用 <code>&amp;</code> <code>|</code> 且每个条件必须加括号，写成 and/or 会报错(和 pandas 一样)。',
        'polars 没有 set_index/行索引概念：按标签取行不存在，按位置用 <code>df[10:20]</code>。',
        '字符串列转数值：<code>pl.col("v").cast(pl.Float64, strict=False)</code>，strict=False 相当于 to_numeric 的 errors="coerce"。',
      ],
      related: ['read-csv', 'groupby-agg', 'pandas互转'],
      tags: ['表达式', 'filter', 'select'],
    },
    {
      name: 'groupby-agg', sig: "df.group_by('k').agg(pl.col('v').sum().alias('总')) / df.group_by(['k1','k2']).agg(...)",
      brief: '分组聚合：多种聚合一次出。',
      examples: [
        { title: '', code: `import polars as pl\n\nout = (df.group_by('city')\n         .agg(pl.col('amount').sum().alias('总金额'),\n              pl.col('amount').mean().round(2).alias('均值'),\n              pl.len().alias('单数'),                # 计数用 pl.len()\n              pl.col('ts').max().alias('最近时间'))\n         .sort('总金额', descending=True))` },
      ],
      pitfalls: [
        '是 <b>group_by</b>（带下划线），pandas 是 groupby——互相抄代码最常见的报错点。',
        '计数不是 .count()（那是非空计数语义），行数用 <code>pl.len()</code>。',
        'agg 里没提到的列不会像 pandas 那样被丢掉报错，polars 默认只保留 key 和 agg 结果。',
      ],
      related: ['表达式核心'],
      tags: ['分组', '聚合', 'groupby'],
    },
    {
      name: 'pandas互转', sig: "df.to_pandas() / pl.from_pandas(pdf) / 写库 to_dict('records')",
      brief: '与 pandas 无缝互转 + 语法对照速查。',
      examples: [
        { title: '互转', code: `import polars as pl\n\npdf = df.to_pandas()          # polars -> pandas(喂 sklearn/matplotlib)\ndf2 = pl.from_pandas(pdf)     # pandas -> polars\nrows = df.to_dict('records')  # -> [{列: 值}, ...]` },
        { title: '语法对照', code: `# pandas                          # polars\ndf[['a','b']]                     df.select('a', 'b')\ndf[df.a > 1]                      df.filter(pl.col('a') > 1)\ndf['new'] = ...                   df.with_columns(new=...)\ndf.groupby('k')['v'].sum()        df.group_by('k').agg(pl.col('v').sum())\ndf.sort_values('a')               df.sort('a')\ndf.rename(columns={'a':'b'})      df.rename({'a': 'b'})\ndf.dropna()                       df.drop_nulls()\ndf.value_counts()                 df['a'].value_counts()` },
      ],
      pitfalls: [
        'to_pandas 需要 pandas 已安装；喂老代码（sklearn 旧版、matplotlib 某些接口）前先转过去，polars 对象直接塞会报错。',
        '两边 NaN/None 语义有差异（polars 区分 null 与 NaN），转完跑断言别慌。',
      ],
      related: ['read-csv', '表达式核心'],
      tags: ['pandas', '互转', '对照'],
    },
  ],
});
