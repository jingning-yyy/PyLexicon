/* psutil：系统监控的 Python 版（CPU/内存/磁盘/进程） */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'psutil', name: 'psutil', icon: '🩺', category: '自动化与效率',
  doc: 'https://psutil.readthedocs.io/',
  desc: '跨平台获取系统信息：CPU 占用、内存磁盘、进程管理；Linux 速查里 top/df/kill 的 Python 版，监控报警脚本必备。',
  install: 'pip install psutil',
  aliases: ['系统监控', 'cpu', '内存', '进程', '运维'],
  tips: [
    '跨平台通用：Windows/Linux/macOS 同一套代码；配合 loguru 和 schedule 就是现成的服务器监控小工具。',
    '所有 percent 字段都是 0~100 的浮点数，直接和阈值比较就能做报警。',
  ],
  entries: [
    {
      name: 'cpu-memory', sig: "psutil.cpu_percent(interval=1) / psutil.cpu_count() / psutil.virtual_memory().percent",
      brief: 'CPU 占用与内存水位：监控脚本的第一行数据。',
      examples: [
        { title: '', code: `import psutil, time\n\npsutil.cpu_percent(interval=1)      # 阻塞 1 秒返回这段时间的占用率\npsutil.cpu_count(logical=True)      # 逻辑核数\n\nmem = psutil.virtual_memory()\nprint(mem.percent, '%')             # 内存使用率\nprint(mem.used / 1024**3, 'GB 已用')  # 字节换算 GB\nprint(psutil.swap_memory().percent) # 交换分区/虚拟内存\n\n# 每 5 秒记一次, 内存超 85% 提醒:\nwhile True:\n    if psutil.virtual_memory().percent > 85:\n        print('⚠️ 内存吃紧')\n    time.sleep(5)` },
      ],
      pitfalls: [
        '<b>cpu_percent() 不带参数第一次调用返回 0</b>（没有参照时间窗），传 interval=1 或调两次取第二次。',
        'Linux 上 virtual_memory().percent 的算法和 free 命令不完全一致（算上去掉了可回收缓存），做报警别和 free 输出硬对数。',
        '字节单位的字段全是 bytes，除 1024**3 换 GB；磁盘用 disk_usage 同理。',
      ],
      related: ['disk-process'],
      tags: ['cpu', '内存', '监控'],
    },
    {
      name: 'disk-process', sig: "psutil.disk_usage('/') / psutil.process_iter(['pid','name']) / p.terminate()",
      brief: '磁盘水位与进程管理：找吃资源的进程、按名杀进程。',
      examples: [
        { title: '', code: `import psutil\n\n# 磁盘剩余（Windows 换 'C:\\\\'）\ndu = psutil.disk_usage('/')\nprint(du.percent, '%', du.free / 1024**3, 'GB 剩余')\n\n# 吃内存最多的前 5 个进程:\nprocs = []\nfor p in psutil.process_iter(['pid', 'name', 'memory_percent']):\n    try:\n        procs.append(p.info)\n    except psutil.NoSuchProcess:\n        pass                       # 遍历途中进程退出了, 跳过\nfor p in sorted(procs, key=lambda x: -x['memory_percent'] or 0)[:5]:\n    print(p['pid'], p['name'], round(p['memory_percent'], 1), '%')\n\n# 按名字找到并终止:\nfor p in psutil.process_iter(['name']):\n    if p.info['name'] == 'job.py':\n        p.terminate()` },
      ],
      pitfalls: [
        'process_iter 遍历时进程可能恰好退出抛 <b>NoSuchProcess</b>，逐个 try 跳过是标准写法。',
        'terminate() 是温和终止（SIGTERM），杀不掉再 <code>kill()</code>；Windows 上两者效果接近。',
        'memory_percent 可能返回 None（进程太短命），排序时 <code>-x["memory_percent"] or 0</code> 兜底防 TypeError。',
      ],
      related: ['cpu-memory', '监控脚本'],
      tags: ['磁盘', '进程', 'kill'],
    },
    {
      name: '监控脚本', sig: "psutil + while True + time.sleep 组合 / psutil.boot_time() / psutil.users()",
      brief: '组合实战：定时记录 CPU/内存到日志，阈值报警。',
      examples: [
        { title: '', code: `import psutil, time\nfrom datetime import datetime\n\nLOG = 'monitor.csv'\nwhile True:\n    cpu = psutil.cpu_percent(interval=5)     # 顺带等 5 秒\n    mem = psutil.virtual_memory().percent\n    line = f'{datetime.now():%Y-%m-%d %H:%M:%S},{cpu},{mem}\\n'\n    open(LOG, 'a', encoding='utf-8').write(line)\n    if cpu > 90 or mem > 90:\n        print(f'⚠️ 高负载: cpu {cpu}% mem {mem}%')   # 这里可换 loguru 推送\n\n# 其他常用:\npsutil.boot_time()        # 开机时间戳 -> datetime.fromtimestamp()\npsutil.users()            # 当前登录用户\npsutil.net_io_counters()  # 网卡收发字节累计` },
      ],
      pitfalls: [
        '死循环脚本记得 <code>try/except KeyboardInterrupt</code> 优雅退出，并保证日志文件每次写完就关（上面用 with 更稳）。',
        'cpu_percent(interval=5) 会阻塞 5 秒——本身就是休眠，别再 sleep 一次。',
        '长期跑建议配合 loguru 轮转日志（见自动化与效率分类），csv 用 pandas.read_csv 直接回读分析。',
      ],
      related: ['cpu-memory', 'disk-process'],
      tags: ['监控', '报警', '巡检'],
    },
  ],
});
