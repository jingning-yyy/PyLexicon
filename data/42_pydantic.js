/* pydantic：数据校验与设置管理 */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'pydantic', name: 'pydantic', icon: '🪪', category: '存储与序列化',
  doc: 'https://docs.pydantic.dev/',
  desc: '用类型标注做数据校验：来自外部的 JSON/API/配置先过一遍模型，字段类型不对直接报错，脏数据进不了系统。',
  install: 'pip install pydantic',
  aliases: ['校验', '验证', 'model', '配置', 'BaseModel'],
  tips: [
    '分工：typing 的标注只是"提示"，<b>pydantic 是真的校验</b>——构造时就检查并自动转换类型。',
    '典型位置：数据入口（读 JSON/接口响应/配置文件）建模型，入口干净了后面全干净。FastAPI 内置就是它。',
  ],
  entries: [
    {
      name: 'BaseModel', sig: "class Sample(BaseModel): name: str; value: float = 0.0 / Sample(**数据)",
      brief: '定义模型即校验：字段类型不对立刻报错，能转的自动转。',
      examples: [
        { title: '', code: `from pydantic import BaseModel\n\nclass Sample(BaseModel):\n    name: str\n    value: float\n    batch: str = '未知'            # 有默认值 = 可选字段\n\ndata = {'name': 'S1', 'value': '45.7'}    # 注意 value 是字符串\ns = Sample(**data)\nprint(s.value, type(s.value))       # 45.7 <class 'float'>  自动转换!\n\n# 字段类型对不上 -> ValidationError, 并告诉你哪个字段错在哪:\nSample(name='S2', value='很高')     # ValidationError: value\n\nprint(s.model_dump())               # {'name': 'S1', 'value': 45.7, 'batch': '未知'}` },
      ],
      pitfalls: [
        'pydantic v2 的方法名换了：<b>model_dump() / model_dump_json()</b>（v1 是 .dict()/.json()），读老教程注意版本。',
        '自动转换是"能转才转"：\'45.7\'->float 可以，\'很高\'->float 直接 ValidationError，不会静塞 None。',
        '默认值用可变类型（list/dict）要 Field(default_factory=list)，直接 =[] 会所有实例共享同一个。',
      ],
      related: ['校验控制'],
      tags: ['校验', '模型', '类型'],
    },
    {
      name: '校验控制', sig: "Field(ge=0, le=100) / @field_validator('字段') / 约束",
      brief: '字段级规则：范围、长度、自定义校验逻辑。',
      examples: [
        { title: '', code: `from pydantic import BaseModel, Field, field_validator\n\nclass Sample(BaseModel):\n    name: str = Field(min_length=1, max_length=20)\n    value: float = Field(ge=0, description='含量, 不能为负')\n    units: str = 'wt%'\n\n    @field_validator('name')\n    @classmethod\n    def name_not_blank(cls, v: str) -> str:\n        if not v.strip():\n            raise ValueError('名字不能是纯空格')\n        return v.strip()          # 可以顺手清洗, 返回值才是存进去的\n\nSample(name='  ', value=-1)   # 两个错一起报, 逐字段定位` },
      ],
      pitfalls: [
        '<code>@field_validator</code> 下面要叠 <b>@classmethod</b>（忘了会警告）；方法里必须 return 处理后的值。',
        '数值范围用 <code>ge/le</code>(含端点)、<code>gt/lt</code>(不含)；字符串长度是 <code>min_length/max_length</code>，不是 v1 的 min_items。',
        '校验错误想一次收集全部而不是抛第一个：找 ValidationError 的 errors() 列表，或异常处理里打印 e.errors()。',
      ],
      related: ['BaseModel'],
      tags: ['Field', 'validator', '约束'],
    },
    {
      name: 'json互转', sig: "Sample.model_validate(字典) / m.model_dump() / m.model_dump_json() / model_validate_json(s)",
      brief: '与 dict/JSON 字符串互转：接口数据和配置文件的入口关卡。',
      examples: [
        { title: '', code: `from pydantic import BaseModel\n\nclass Result(BaseModel):\n    sample: str\n    peaks: list[float]\n\n# 从 dict / JSON 字符串构造(都会校验):\nr1 = Result.model_validate({'sample': 'S1', 'peaks': [10.2, 12.4]})\nr2 = Result.model_validate_json('{"sample": "S2", "peaks": [8.1]}')\n\n# 反向导出:\nr1.model_dump()          # {'sample': 'S1', 'peaks': [10.2, 12.4]}  -> dict\nr1.model_dump_json()     # '{"sample":"S1","peaks":[10.2,12.4]}'    -> str\nr1.model_dump(exclude={'peaks'})                  # 不要某些字段\n\n# 配置文件加载惯用法:\nimport json\ncfg = Config.model_validate(json.load(open('cfg.json', encoding='utf-8')))` },
      ],
      pitfalls: [
        '<b>model_validate 才校验</b>；直接 Sample(**d) 也校验，但 JSON 字符串必须先 model_validate_json 或 json.loads 再来。',
        'model_dump 后再 json.dumps 也行，但 datetime/路径等类型要先转字符串（mode="json" 参数可代劳）。',
        '配置里"多的键"默认忽略不报错；想严格拒绝多余字段加 model_config = ConfigDict(extra="forbid")。',
      ],
      related: ['BaseModel', '校验控制'],
      tags: ['JSON', '序列化', '配置'],
    },
  ],
});
