/* watchdog：文件监控自动化（数据落盘自动处理） */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'watchdog', name: 'watchdog', icon: '👀', category: '自动化与效率',
  doc: 'https://python-watchdog.readthedocs.io/',
  desc: '监听文件夹变化：新文件一落盘自动触发处理——数据到达即处理、下载完自动整理，不用反复轮询。',
  install: 'pip install watchdog',
  aliases: ['文件监控', '监听', '自动处理', '文件夹'],
  tips: [
    '典型场景：谱仪/仪器把数据写进某个目录，watchdog 检测到新文件自动跑处理流水线——把"人盯着"换成"脚本盯着"。',
    'watchdog 只报"发生了什么"，<b>文件是否写完要自己判断</b>（见防抖条目）。',
  ],
  entries: [
    {
      name: 'monitor基础', sig: "Observer() + FileSystemEventHandler 子类 on_created/on_modified / observer.start() / observer.join()",
      brief: '最小监听器：文件夹里新建/修改文件时执行你的函数。',
      examples: [
        { title: '', code: `from watchdog.observers import Observer\nfrom watchdog.events import FileSystemEventHandler\n\nclass NewData(FileSystemEventHandler):\n    def on_created(self, event):\n        if event.is_directory:\n            return\n        print('新文件:', event.src_path)\n        # process(event.src_path)     # 这里接你的处理函数\n\n    def on_deleted(self, event):\n        print('被删除:', event.src_path)\n\nobs = Observer()\nobs.schedule(NewData(), path='D:/data_in', recursive=False)  # recursive=True 监听子目录\nobs.start()\ntry:\n    obs.join()                 # 主线程停在这里一直监听\nfinally:\n    obs.stop()\n    obs.join()` },
      ],
      pitfalls: [
        '<b>保存文件会同时触发 on_modified 两次</b>（文件本身 + 所在目录），用 event.is_directory 过滤目录事件。',
        'Observer 是后台线程，主线程直接结束监听就停了：脚本式监听用 <code>obs.join()</code> 挂住。',
        'recursive=True 才监听子目录；默认只看 path 这一层。',
      ],
      related: ['防抖等写完'],
      tags: ['文件监控', '事件', '自动处理'],
    },
    {
      name: '防抖等写完', sig: "on_created 里启动 threading.Timer(秒数, 处理)，新事件到来就重置计时",
      brief: '等文件写完再处理：延迟 + 重置的经典防抖模式。',
      examples: [
        { title: '防抖模板', code: `import time, threading\nfrom watchdog.observers import Observer\nfrom watchdog.events import FileSystemEventHandler\n\nclass DebounceHandler(FileSystemEventHandler):\n    def __init__(self, delay=2.0):\n        self.delay = delay\n        self.timers = {}\n\n    def on_created(self, event):\n        if event.is_directory:\n            return\n        path = event.src_path\n        old = self.timers.get(path)\n        if old:\n            old.cancel()                       # 又有动静, 推迟处理\n        t = threading.Timer(self.delay, self.process, args=[path])\n        self.timers[path] = t\n        t.start()\n\n    def process(self, path):\n        print('稳定了, 开始处理:', path)\n\n# 用法同 monitor基础: Observer().schedule(DebounceHandler(2.0), path=...)` },
      ],
      pitfalls: [
        '<b>on_created 触发时大文件往往还没复制完</b>（复制开始就报事件），防抖 2 秒是经验值，超大文件改"大小连续两次不变才算稳定"。',
        'timers 字典会积累已完成任务，长期运行定期清理已结束的 Timer。',
        '处理函数里抛异常不会打断监听（在线程里跑），但会静默消失——里面要自己 try 并记日志。',
      ],
      related: ['monitor基础', '批量扫描兜底'],
      tags: ['防抖', '写完检测', '线程'],
    },
    {
      name: '批量扫描兜底', sig: "启动时 glob 扫描存量文件 + watchdog 只管新事件 / 手写 mtime 轮询",
      brief: '补齐盲区：程序没在跑的时段产生的文件也要处理。',
      examples: [
        { title: '', code: `import glob, os, time\n\nDONE = 'done.txt'                     # 记录已处理文件, 重启不重复\n\ndef already(path):\n    if not os.path.exists(DONE):\n        return False\n    return path in open(DONE, encoding='utf-8').read().splitlines()\n\n# 1) 启动先把存量文件处理一遍:\nfor f in sorted(glob.glob('D:/data_in/*.raw')):\n    if not already(f):\n        print('补处理:', f)\n\n# 2) 再启动 watchdog 管新文件(防抖模板)\n# ...\n\n# 网络盘(NAS/SMB)事件不可靠时的保底方案: 每 30 秒对比 mtime\nwhile True:\n    for f in glob.glob('Z:/share/*.csv'):\n        if time.time() - os.path.getmtime(f) < 60 and not already(f):\n            print('发现新文件:', f)\n    time.sleep(30)` },
      ],
      pitfalls: [
        '<b>watchdog 只报"监听期间"的事件</b>：停机/崩溃期间落盘的文件它不知道——启动时必须先扫一遍存量。',
        'Windows 映射的网络盘、部分 NAS 上事件通知不可靠甚至完全收不到，这种场景直接用 mtime 轮询更稳。',
        '"处理过没有"要自己记账（done 列表/改后缀/挪目录），否则每次重启都重头处理。',
      ],
      related: ['monitor基础', '防抖等写完'],
      tags: ['存量扫描', '轮询', '网络盘'],
    },
  ],
});
