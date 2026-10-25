/* pyyaml：YAML 配置读写 */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'pyyaml', name: 'pyyaml', icon: '📜', category: '存储与序列化',
  doc: 'https://pyyaml.org/wiki/PyYAMLDocumentation',
  desc: '读写 YAML：人类好编辑的配置文件格式（conda、GitHub Actions、docker-compose 都是它）；支持注释、多行文本。',
  install: 'pip install pyyaml',
  aliases: ['yaml', '配置文件', 'yml'],
  tips: [
    '记一条就避开 90% 的坑：<b>读取永远用 safe_load，不要用 load</b>；导出中文加 allow_unicode=True。',
    '和 JSON 的分工：给人改的配置用 YAML（能写注释、能多行），程序间交换数据用 JSON。',
  ],
  entries: [
    {
      name: 'load-dump', sig: "yaml.safe_load(open('cfg.yaml', encoding='utf-8')) / yaml.dump(data, allow_unicode=True, sort_keys=False)",
      brief: '读取与导出：YAML 文本 ↔ Python 字典/列表。',
      examples: [
        { title: '', code: `import yaml\n\n# 读(文件必须给 encoding!):\nwith open('cfg.yaml', encoding='utf-8') as f:\n    cfg = yaml.safe_load(f)\nprint(cfg['仪器']['探测器'])         # 像字典一样取\n\n# 写(手动编辑过的配置建议保留原样改文件, 代码生成才用 dump):\ndata = {'样品': 'S1', '峰位': [10.2, 12.4], '备注': '含中文'}\nwith open('out.yaml', 'w', encoding='utf-8') as f:\n    yaml.dump(data, f, allow_unicode=True,   # 不加就变 \\uXXXX 转义\n              sort_keys=False,               # 保持键的书写顺序\n              default_flow_style=False)` },
      ],
      pitfalls: [
        '<b>yaml.load 能执行 YAML 里嵌入的任意 Python 对象</b>，读到来路不明的文件等于交出权限——一律 safe_load。',
        'dump 不加 <code>allow_unicode=True</code>，所有中文变 \\u 转义；不加 <code>sort_keys=False</code>，键会按字母重排。',
        '和 json 不同，YAML 文件里可以写 # 注释——但 dump 出去的文件注释会丢，所以"人工维护的配置"别用代码重写它。',
      ],
      related: ['语法速查'],
      tags: ['yaml', '配置', 'safe_load'],
    },
    {
      name: '语法速查', sig: '键: 值 / - 列表项 / 缩进嵌套 / | 多行文本 / # 注释',
      brief: 'YAML 书写速查：缩进结构、类型坑、多行文本。',
      examples: [
        { title: 'cfg.yaml', code: `# 仪器配置示例\n仪器:\n  探测器: Si-PIN          # 冒号后必须有空格\n  通道数: 4096            # 自动转成整数\n  增益: 2.5\n标样:\n  - SiO2\n  - CaO\n备注: |\n  这是一段多行文本,\n  换行会保留。\n开关: on                  # 小心! 会转成 True` },
        { title: '读取结果', code: `cfg = yaml.safe_load(open('cfg.yaml', encoding='utf-8'))\n# {'仪器': {'探测器': 'Si-PIN', '通道数': 4096, '增益': 2.5},\n#  '标样': ['SiO2', 'CaO'],\n#  '备注': '这是一段多行文本,\\n换行会保留。\\n',\n#  '开关': True}` },
      ],
      pitfalls: [
        '<b>缩进只能用空格不能用 Tab</b>，混入直接报错；同级必须对齐。',
        '自动类型转换的坑：<code>on/off/yes/no</code> 变布尔，<code>版本号 1.20</code> 变浮点 1.2——要当字符串就加引号。',
        '重复的键不报错且后者悄悄覆盖前者，配置文件变诡异先查重键。',
      ],
      related: ['load-dump', 'yaml-vs-json'],
      tags: ['语法', '缩进', '类型转换'],
    },
    {
      name: 'yaml-vs-json', sig: 'YAML: 人写配置 / JSON: 程序交换 / yaml + pydantic 组合',
      brief: '选型与组合：配置文件格式怎么选、怎么加校验。',
      examples: [
        { title: '', code: `# 选型速查:\n#   人要经常手改、需要注释、多行文本     -> YAML\n#   程序对程序交换、要严格语法            -> JSON\n#   Python 项目元数据(pyproject.toml)     -> TOML (3.11+ 内置 tomllib 读)\n#   键值简单、要跨语言、易发布            -> INI/toml 或 json\n\n# 惯用组合: YAML 读入 + pydantic 校验, 脏配置进不了系统:\nimport yaml\nfrom pydantic import BaseModel\n\nclass Config(BaseModel):\n    探测器: str\n    通道数: int\n\ncfg = Config.model_validate(yaml.safe_load(open('cfg.yaml', encoding='utf-8')))` },
      ],
      pitfalls: [
        'YAML 有多文档语法(--- 分隔)，用 <code>safe_load_all</code> 读全部；safe_load 只读第一个。',
        '同一份配置被多处 import 时读一次缓存成模块级变量，别每处都 open 一遍。',
        'Windows 记事本存 YAML 易带 BOM 导致首行解析失败：用 VSCode 存 UTF-8（无 BOM）。',
      ],
      related: ['load-dump', '语法速查'],
      tags: ['选型', 'pydantic', '配置'],
    },
  ],
});
