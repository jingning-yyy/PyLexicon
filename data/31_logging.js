/* logging：标准库日志（读老代码/服务器代码必备） */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'logging', name: 'logging', icon: '📝', category: '标准库',
  doc: 'https://docs.python.org/zh-cn/3/library/logging.html',
  desc: '标准库日志系统：分级输出、落文件、轮转、自动带堆栈。新项目可以用 loguru，但读别人的代码绕不开它。',
  install: false,
  aliases: ['日志', 'log', 'logger'],
  tips: [
    '与 loguru 的分工：<b>loguru 管"写新代码"，logging 管"读老代码"</b>——开源项目、服务器框架全是 logging。',
    '级别从低到高：DEBUG < INFO < WARNING < ERROR < CRITICAL；root 默认只放行 WARNING 以上。',
  ],
  entries: [
    {
      name: 'basicconfig', sig: "logging.basicConfig(level=, format=, filename=, encoding=) / logging.info('...')",
      brief: '一行配置好日志：级别、格式、落盘。',
      examples: [
        { title: '', code: `import logging\n\nlogging.basicConfig(\n    level=logging.INFO,                       # 放行级别(默认 WARNING, info 看不见就查这)\n    format='%(asctime)s %(levelname)s %(name)s: %(message)s',\n    datefmt='%H:%M:%S',\n    filename='run.log', encoding='utf-8')     # 不给 filename 就打到控制台\n\nlogging.debug('调试细节')\nlogging.info('开始处理 %s 个文件', 100)        # 参数化, 别用 f-string 拼日志\nlogging.warning('编码不是 utf-8')\nlogging.error('文件不存在: %s', path)` },
      ],
      pitfalls: [
        '<b>basicConfig 只在第一次调用生效</b>，后面再调是空操作；要重配用 <code>force=True</code>(3.8+)。',
        'logging.info 没输出：九成是 root 级别还停在 WARNING，先 basicConfig(level=logging.INFO)。',
        'filename 落盘时Windows 默认编码是 gbk，<b>encoding="utf-8"</b> 不写中文日志迟早乱码。',
        '日志文案用 <code>%s</code> 参数化而不是 f-string：级别被过滤时字符串拼接不会执行。',
      ],
      related: ['getlogger', 'handler-轮转'],
      tags: ['日志', '级别', '配置'],
    },
    {
      name: 'getlogger', sig: "logger = logging.getLogger(__name__) / logger.info(...) / logger.propagate",
      brief: '模块化项目标准写法：每个模块一个 logger，层级命名。',
      examples: [
        { title: '', code: `# myapp/parse.py —— 每个模块顶部这样写(别用 root 的 logging.info)\nimport logging\nlogger = logging.getLogger(__name__)      # 名字自动是 "myapp.parse"\n\ndef run():\n    logger.info('解析开始')\n\n# 库代码别配置(别调 basicConfig)，配置留给应用入口：\n# 日志按 "." 分层级继承，子 logger 默认 propagate=True 往上交给 root 输出\nlogger.getChild('detail').debug('子 logger')\nlogger.setLevel(logging.DEBUG)            # 只改自己这级` },
      ],
      pitfalls: [
        '库里 <code>getLogger(__name__)</code> 而不是 getLogger()：后者是 root，会污染使用方的日志配置。',
        '重复打印两遍 = 自己 addHandler 了还 propagate 到 root：二选一，常规做法 <code>logger.propagate = False</code>。',
        'effective_level() 可以查实际生效级别，"为什么 debug 没输出"用它定位。',
      ],
      related: ['basicconfig', 'handler-轮转'],
      tags: ['logger', '模块化', 'propagate'],
    },
    {
      name: 'handler-轮转', sig: "RotatingFileHandler('app.log', maxBytes=, backupCount=) / TimedRotatingFileHandler(when='midnight')",
      brief: '日志文件轮转：按大小或按天切割，防止单个文件涨到 GB。',
      examples: [
        { title: '', code: `import logging\nfrom logging.handlers import RotatingFileHandler, TimedRotatingFileHandler\n\nlogger = logging.getLogger('app')\nlogger.setLevel(logging.INFO)\n\nfh = RotatingFileHandler('app.log', maxBytes=10*1024*1024,\n                         backupCount=5, encoding='utf-8')   # 10MB 一个, 留 5 个\nfmt = logging.Formatter('%(asctime)s %(levelname)s %(message)s')\nfh.setFormatter(fmt)\nlogger.addHandler(fh)\n\n# 按天切割: 每天 0 点换文件, 留 30 天\nth = TimedRotatingFileHandler('app.log', when='midnight',\n                              backupCount=30, encoding='utf-8')\nlogger.addHandler(th)` },
      ],
      pitfalls: [
        'formatter 同时挂到 handler 上，只 setLevel(logger) 不够：<b>handler 也有自己的级别</b>，两边都放行才输出。',
        'Windows 上轮转时目标文件被占用可能报错：多进程写同一个日志文件本来就不可靠，各进程写各的文件再汇总。',
        '备份文件名是 app.log.1 / app.log.2 …不会自动加日期后缀，按天切割才是 app.log.2026-09-09。',
      ],
      related: ['basicconfig', 'exception'],
      tags: ['轮转', 'handler', '文件日志'],
    },
    {
      name: 'exception', sig: "logger.exception('...') / logger.error('...', exc_info=True)",
      brief: '自动记录完整堆栈：except 块里的正确姿势。',
      examples: [
        { title: '', code: `import logging\n\ntry:\n    risky()\nexcept Exception:\n    logger.exception('处理 %s 失败', name)    # 自动带完整堆栈, 等价下一行\n\ntry:\n    risky()\nexcept ValueError as e:\n    logger.error('数值有问题: %s', e, exc_info=True)   # 手动要求带堆栈\n    logger.warning('跳过该条继续跑')                     # 兜底后降级提示` },
      ],
      pitfalls: [
        '<code>logger.exception()</code> 只能在 except 块里用(它取的是"当前异常")，放外面没有堆栈可记。',
        '打印异常对象 <code>%s, e</code> 只有最后一行消息，定位问题要 exc_info/exception 的完整堆栈。',
      ],
      related: ['basicconfig'],
      tags: ['异常', '堆栈', '报错'],
    },
  ],
});
