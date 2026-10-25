/* 并发执行：concurrent.futures / threading / 多进程速查（「速查」分类） */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'concurrent', name: '并发执行', icon: '🧵', category: '速查',
  doc: 'https://docs.python.org/zh-cn/3/library/concurrent.futures.html',
  desc: '线程池/进程池并发提速：批量下载、批量请求、CPU 密集计算一把梭。',
  install: false,
  aliases: ['并发', '多线程', '多进程', '线程池', '进程池', '提速', 'GIL'],
  tips: [
    '选型口诀：<b>IO 密集(下载/请求接口/读文件)用线程池，CPU 密集(数值计算)用进程池</b>；线程池覆盖 90% 场景。',
    'max_workers 不是越大越快：IO 型给到几十常见；打满带宽或被对方限流就到顶了。',
  ],
  entries: [
    {
      name: 'thread-pool', sig: "ThreadPoolExecutor(max_workers=8) / ex.map(fn, 列表) / ex.submit(fn, 参数).result()",
      brief: '线程池并发跑 IO 任务：批量下载、批量请求接口提速数倍。',
      examples: [
        { title: '批量并发(结果按输入顺序)', code: `from concurrent.futures import ThreadPoolExecutor\nimport requests\n\nurls = ['https://a.com/1.csv', 'https://a.com/2.csv']\n\ndef fetch(url):\n    r = requests.get(url, timeout=10)\n    return r.content\n\nwith ThreadPoolExecutor(max_workers=8) as ex:\n    results = list(ex.map(fetch, urls))   # 顺序与 urls 一致\n# with 块结束自动等全部线程收工` },
        { title: '谁先完成先处理谁', code: `from concurrent.futures import as_completed\n\nwith ThreadPoolExecutor(8) as ex:\n    futs = {ex.submit(fetch, u): u for u in urls}\n    for fut in as_completed(futs):\n        url = futs[fut]\n        try:\n            data = fut.result()\n        except Exception as e:\n            print(url, '失败:', e)         # 单个失败不影响其他` },
      ],
      pitfalls: [
        '<code>map()</code> 按输入顺序取结果，中途一个抛异常整体中断；要"单个失败不拖累全部"用 submit + as_completed。',
        '多个线程共享 list/dict 的追加操作要加锁；requests.Session 的连接池线程安全，可全局共用一个。',
        '打网站太快会被封 IP/限流：加 <code>time.sleep</code> 或把 max_workers 降到个位数。',
      ],
      related: ['process-pool', '选型-线程vs进程', 'thread-lock'],
      tags: ['并发', '线程池', '下载提速'],
    },
    {
      name: 'process-pool', sig: "ProcessPoolExecutor(max_workers=4) / multiprocessing.Pool",
      brief: '进程池跑 CPU 密集任务：绕过 GIL 实现真并行。',
      examples: [
        { title: 'CPU 密集计算', code: `from concurrent.futures import ProcessPoolExecutor\n\ndef heavy_calc(n):            # 必须是模块顶层函数(要能被 pickle)\n    return sum(i * i for i in range(n))\n\nif __name__ == '__main__':    # Windows/macOS 必须有这行!\n    with ProcessPoolExecutor(max_workers=4) as ex:\n        results = list(ex.map(heavy_calc, [10**7] * 8))\n    print(results)` },
      ],
      pitfalls: [
        'Windows 是 spawn 方式启动子进程：主逻辑必须放在 <code>if __name__ == "__main__":</code> 里，否则子进程 import 主模块时无限开进程直接报错。',
        '任务函数和参数必须能 pickle：顶层函数/简单类型可以，lambda、闭包、实例方法会报 PicklingError。',
        '每个子进程要完整复制一份解释器，启动开销大：毫秒级小任务用进程池反而比串行慢。',
      ],
      related: ['thread-pool', '选型-线程vs进程'],
      tags: ['多进程', 'GIL', 'CPU密集'],
    },
    {
      name: '选型-线程vs进程', sig: 'threading / multiprocessing / asyncio 三选一',
      brief: '并发选型速查：看任务是等 IO 还是算 CPU。',
      examples: [
        { title: '', code: `# IO 密集(网络请求/文件/数据库) -> 线程池或 asyncio\nThreadPoolExecutor(20).map(fetch, urls)   # 简单直接, 同步代码就能用\nasyncio.run(main())                        # 上千并发连接才需要, 要配 aiohttp 等 async 库\n\n# CPU 密集(数值计算/图像处理) -> 进程池\nProcessPoolExecutor(4).map(calc, chunks)   # 绕过 GIL, 真并行\n\n# numpy/pandas 大数组运算底层已是 C 多线程, 能向量化就别开进程池` },
      ],
      pitfalls: [
        'GIL：同一时刻只有一个线程在执行 Python 字节码，多线程<b>不会</b>让纯计算变快；但线程等 IO 时会释放 GIL，所以 IO 并发有效。',
        'numpy 大矩阵运算已吃满多核，再套进程池会互相抢核变慢，先看任务是不是已经在向量化执行。',
      ],
      related: ['thread-pool', 'process-pool'],
      tags: ['选型', 'GIL', 'asyncio'],
    },
    {
      name: 'thread-lock', sig: "threading.Thread(target=fn) / lock = Lock(); with lock: ...",
      brief: '裸线程与互斥锁：共享变量被并发改坏时的解法。',
      examples: [
        { title: '', code: `import threading\n\ncount = 0\nlock = threading.Lock()\n\ndef add():\n    global count\n    for _ in range(100000):\n        with lock:             # 不加锁结果几乎必错\n            count += 1\n\nts = [threading.Thread(target=add) for _ in range(4)]\n[t.start() for t in ts]\n[t.join() for t in ts]\nprint(count)                   # 400000` },
      ],
      pitfalls: [
        '<code>count += 1</code> 不是原子操作(读-加-写三步)，不加锁多线程跑完结果偏小且每次不一样。',
        '锁粒度要小：<code>with lock:</code> 里只放操作共享变量的那几行，下载/计算放锁外，否则并发退化成串行。',
      ],
      related: ['thread-pool'],
      tags: ['线程', '锁', '竞态'],
    },
  ],
});
