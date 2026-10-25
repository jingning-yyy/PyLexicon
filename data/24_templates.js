/* 速查：代码模板库 */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'templates', name: '代码模板库', icon: '📋', category: '速查',
  doc: 'https://docs.python.org/zh-cn/3/tutorial/stdlib2.html',
  desc: '五个拿来就改的成品脚本骨架：命令行工具、批量处理、带重试下载、数据流水线、定时任务。',
  install: false,
  aliases: ['模板', '脚手架', '脚本'],
  entries: [
    {
      name: '脚本骨架', sig: 'argparse + logging + main() + if __name__ == "__main__"',
      brief: '命令行工具标准骨架：参数、日志、入口齐全。',
      examples: [
        { title: 'tool.py', code: `import argparse\nimport logging\n\nlogging.basicConfig(level=logging.INFO,\n                    format='%(asctime)s %(levelname)s %(message)s')\nlog = logging.getLogger('tool')\n\ndef run(date, limit):\n    log.info('处理 %s (limit=%s)', date, limit)\n    # ... 主逻辑\n\ndef main():\n    p = argparse.ArgumentParser(description='数据跑批工具')\n    p.add_argument('--date', required=True, help='日期 YYYY-MM-DD')\n    p.add_argument('--limit', type=int, default=100)\n    args = p.parse_args()\n    run(args.date, args.limit)\n\nif __name__ == '__main__':\n    main()\n# 用法: python tool.py --date 2024-05-01 --limit 50` },
      ],
      pitfalls: [
        '日志写文件比 print 靠谱：接入 loguru 或 logging.FileHandler（见 loguru 条目）。',
        '参数含默认值的用 --key，必填的 required=True，运行方式打印在 -h 里。',
      ],
      related: [],
      tags: ['模板', 'argparse', '骨架'],
    },
    {
      name: '批量文件处理', sig: 'glob 收集 → 循环处理 → 异常跳过 → 结果汇总',
      brief: '批量读写文件的健壮写法：单个失败不中断，最后给汇总。',
      examples: [
        { title: '批量处理 + 汇总', code: `import glob\nimport pandas as pd\n\nfiles = sorted(glob.glob('data/*.csv'))\nresults, errors = [], []\nfor f in files:\n    try:\n        df = pd.read_csv(f)\n        results.append({'文件': f, '行数': len(df), '合计': df['金额'].sum()})\n    except Exception as e:\n        errors.append({'文件': f, '错误': str(e)})\n\nprint(pd.DataFrame(results))\nif errors:\n    print('失败清单:', errors)   # 单独记录, 别静默吞掉` },
      ],
      pitfalls: [
        '<b>try 里必须收集失败清单</b>，静默 except 会让你以为全部成功。',
        '文件名排序 sorted() 后处理，保证顺序可复现。',
      ],
      related: [],
      tags: ['批量', '异常', '汇总'],
    },
    {
      name: '带重试的下载', sig: 'requests + 循环重试 + 退避等待',
      brief: '网络下载的标准健壮写法（超时、重试、校验）。',
      examples: [
        { title: '', code: `import requests, time\n\ndef download(url, path, retries=3):\n    for i in range(1, retries + 1):\n        try:\n            r = requests.get(url, timeout=(5, 60),\n                             headers={'User-Agent': 'Mozilla/5.0'})\n            r.raise_for_status()\n            with open(path, 'wb') as f:\n                f.write(r.content)\n            return True\n        except Exception as e:\n            print(f'第{i}次失败: {e}')\n            time.sleep(2 * i)       # 退避: 越失败等越久\n    return False\n\nif not download(url, 'out.zip'):\n    print('最终失败, 人工检查')` },
      ],
      pitfalls: [
        'timeout 必设（见 requests 条目）；raise_for_status 让 4xx/5xx 也走异常分支。',
        '更省事用 tenacity 装饰器（字典有条目），原理相同。',
      ],
      related: [],
      tags: ['下载', '重试', '网络'],
    },
    {
      name: '数据流水线', sig: '读取 → 清洗 → 特征 → 校验 → 保存，每步日志',
      brief: '一次分析任务的标准流水线结构，步骤可追踪可复跑。',
      examples: [
        { title: 'pipeline.py', code: `import pandas as pd\n\n\ndef load(path):\n    df = pd.read_csv(path, parse_dates=['日期'])\n    return df\n\n\ndef clean(df):\n    df = df.dropna(subset=['金额'])\n    df = df[df['金额'] > 0]\n    return df\n\n\ndef main(path, out):\n    df = load(path)\n    n0 = len(df)\n    df = clean(df)\n    print(f'清洗: {n0} -> {len(df)} 行')\n    pivot = df.pivot_table(index='城市', values='金额', aggfunc='sum')\n    pivot.to_csv(out, encoding='utf-8-sig')\n\n\nif __name__ == '__main__':\n    main('raw.csv', '报表.csv')` },
      ],
      pitfalls: [
        '每个函数只做一件事并返回新表，出错时能立刻定位是哪一步。',
        '清洗前后行数打印出来，"数据悄悄变少"是流水线最常见事故。',
      ],
      related: [],
      tags: ['流水线', '清洗', '结构'],
    },
    {
      name: '定时报表', sig: '读 Excel → 处理 → 输出新表（配合 crontab/schedule）',
      brief: '每天自动生成报表的完整小脚本。',
      examples: [
        { title: 'daily_report.py', code: `import pandas as pd\nfrom datetime import date\n\nSRC = 'D:/data/销售.xlsx'\nOUT = f'D:/report/日报_{date.today():%Y%m%d}.xlsx'\n\n\ndef make_report():\n    df = pd.read_excel(SRC)\n    today = df[df['日期'] == pd.Timestamp.today().normalize()]\n    summary = today.groupby('城市')['金额'].sum()\n    with pd.ExcelWriter(OUT) as w:\n        summary.to_excel(w, sheet_name='汇总')\n        today.to_excel(w, sheet_name='明细', index=False)\n    print('已生成', OUT)\n\n\nif __name__ == '__main__':\n    make_report()\n# 配合 crontab/schedule 每天 9 点自动跑` },
      ],
      pitfalls: [
        '输出文件名带日期避免互相覆盖；目录不存在先 os.makedirs。',
        '源文件被同事占用时读取会报 PermissionError，捕获后改读副本。',
      ],
      related: [],
      tags: ['报表', 'excel', '定时'],
    },
  ],
});
