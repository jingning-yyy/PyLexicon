/* sqlite3：标准库自带的本地数据库 */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'sqlite3', name: 'sqlite3', icon: '🪶', category: '存储与序列化',
  doc: 'https://docs.python.org/zh-cn/3/library/sqlite3.html',
  desc: '零安装的本地 SQL 数据库：一个文件就是一张库，轻量脚本存结果、做缓存的首选。',
  install: false,
  aliases: ['sqlite', '数据库', 'sql', '本地存储'],
  tips: [
    '选型：单机单脚本用 sqlite3；要跨进程共享/多进程写/上服务器，再上 MySQL(sqlalchemy/pymysql 条目)。',
    '数据库就是一个 .db 文件，备份 = 复制文件；连接串 <code>":memory:"</code> 是内存库，连接一关就没了。',
  ],
  entries: [
    {
      name: 'connect-execute', sig: "sqlite3.connect('app.db') / conn.execute(SQL) / conn.commit() / cur.fetchall()",
      brief: '最小流程：连接、建表、插入、查询。',
      examples: [
        { title: '', code: `import sqlite3\n\nconn = sqlite3.connect('app.db')\nconn.execute('''CREATE TABLE IF NOT EXISTS sample (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    name TEXT NOT NULL,\n    value REAL)''')\nconn.execute("INSERT INTO sample(name, value) VALUES ('SiO2', 45.7)")\nconn.commit()                                  # 写操作必须 commit!\n\nrows = conn.execute("SELECT * FROM sample").fetchall()\nprint(rows)                                    # [(1, 'SiO2', 45.7)]\nconn.close()` },
      ],
      pitfalls: [
        '忘 <code>commit()</code> 是头号坑：插入不报错、本连接能查到，重开程序数据全没。',
        '<code>fetchall()</code> 全取，大表用 <code>fetchmany(100)</code> 或直接 for row in cur 迭代。',
      ],
      related: ['占位符', 'pandas结合'],
      tags: ['数据库', 'SQL', '本地存储'],
    },
    {
      name: '占位符', sig: "conn.execute('... WHERE id = ?', (值,)) / conn.executemany(SQL, 列表)",
      brief: '参数化查询防注入，批量插入提速。',
      examples: [
        { title: '', code: `import sqlite3\n\nconn = sqlite3.connect('app.db')\n# ? 占位, 参数用元组传入(防 SQL 注入, 处理引号)\nconn.execute("INSERT INTO sample(name, value) VALUES (?, ?)", ('CaO', 8.3))\n\n# 批量插入: 比循环 execute 快一个量级\ndata = [('Fe2O3', 3.1), ('Al2O3', 12.2), ('MgO', 1.5)]\nconn.executemany("INSERT INTO sample(name, value) VALUES (?, ?)", data)\nconn.commit()\n\nrows = conn.execute("SELECT name FROM sample WHERE value > ?", (5.0,)).fetchall()` },
      ],
      pitfalls: [
        '<code>?</code> 占位只能替代<b>值</b>，不能替代表名/列名；表名动态拼时用白名单校验。',
        '参数必须是元组/列表：单参数写 <code>(5.0,)</code> 带逗号，写成 (5.0) 会报"Incorrect number of bindings"。',
        'executemany 后同样要 commit。',
      ],
      related: ['connect-execute'],
      tags: ['注入', '批量插入', '占位符'],
    },
    {
      name: 'row与事务', sig: "conn.row_factory = sqlite3.Row / conn.rollback() / with conn:",
      brief: '按列名取值 + 事务回滚。',
      examples: [
        { title: '', code: `import sqlite3\n\nconn = sqlite3.connect('app.db')\nconn.row_factory = sqlite3.Row              # 行变"类字典"\nrow = conn.execute("SELECT * FROM sample WHERE id = 1").fetchone()\nprint(row['name'], row['value'])            # 按列名取, 可读性好\nprint(dict(row))                            # 转 dict\n\ntry:\n    conn.execute("UPDATE sample SET value = 0 WHERE id = 1")\n    conn.execute("一条会出错的 SQL")\n    conn.commit()\nexcept sqlite3.Error:\n    conn.rollback()                          # 两条一起撤销\n\n# 简写: with conn 自动提交(出错自动回滚), 不用管 commit\nwith conn:\n    conn.execute("INSERT INTO sample(name, value) VALUES (?, ?)", ('K2O', 0.6))` },
      ],
      pitfalls: [
        '<code>with conn:</code> 只管事务(提交/回滚)，<b>不负责关闭连接</b>，长期脚本还是要 conn.close()。',
        'Row 对象不是真 dict，要序列化先 dict(row)。',
      ],
      related: ['connect-execute', '占位符'],
      tags: ['事务', '回滚', 'row_factory'],
    },
    {
      name: 'pandas结合', sig: "pd.read_sql(SQL, conn) / df.to_sql('表名', conn, if_exists='append')",
      brief: 'DataFrame 与 SQLite 互转：查询结果直接进分析流程。',
      examples: [
        { title: '', code: `import sqlite3, pandas as pd\n\nconn = sqlite3.connect('app.db')\n\ndf = pd.read_sql("SELECT * FROM sample WHERE value > ?", conn, params=(1.0,))\nprint(df.dtypes)                      # 列类型自动映射\n\nnew = pd.DataFrame({'name': ['Na2O'], 'value': [2.4]})\nnew.to_sql('sample', conn, if_exists='append', index=False)  # index 别存进去\nconn.close()` },
      ],
      pitfalls: [
        "<code>if_exists</code> 三种取值看清再写：<b>'fail'</b> 表存在就报错(默认)、'append' 追加、'replace' 清表重建——手一抖 replace 就把老数据洗了。",
        'to_sql 大 DataFrame 慢的话加 <code>method="multi"</code> + 调大 chunksize；超大再换 executemany。',
        '列名带中文/特殊字符能存，但查询时要用双引号包列名。',
      ],
      related: ['connect-execute', '占位符'],
      tags: ['pandas', 'DataFrame', 'read_sql'],
    },
  ],
});
