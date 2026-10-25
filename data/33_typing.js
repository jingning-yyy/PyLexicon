/* typing：类型标注速查（读懂现代 Python 代码） */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'typing', name: 'typing', icon: '🏷️', category: '标准库',
  doc: 'https://docs.python.org/zh-cn/3/library/typing.html',
  desc: '类型标注：函数签名、容器元素类型、Optional/Union；标注不影响运行，但 IDE 补全和静态检查全靠它。',
  install: false,
  aliases: ['类型', '标注', 'type hints', '注解'],
  tips: [
    '标注是给人和工具看的，<b>运行时不强制</b>：标了 int 传 str 程序照样跑，查错靠 IDE 灰色提示或 mypy/pyright。',
    '读现代开源代码最常见的三个：<code>list[int]</code>、<code>str | None</code>、<code>Optional[X]</code>。',
  ],
  entries: [
    {
      name: '基础标注', sig: "def f(x: int, y: str = 'a') -> bool: / count: int = 0 / names: list[str] = []",
      brief: '变量、函数参数、返回值的标注写法。',
      examples: [
        { title: '', code: `def find_peak(y: list[float],\n              window: int = 5,\n              strict: bool = True) -> int | None:\n    ...\n\nx: int = 3                        # 变量标注(通常可省, 初始化已表明类型)\nnames: list[str] = []             # 容器带元素类型(3.9+)\nconcs: dict[str, float] = {}      # 键 str 值 float\n\nclass Sample:\n    name: str                     # 类属性标注\n    counts: list[int]` },
      ],
      pitfalls: [
        '标注在运行时<b>不检查不报错</b>，它只是元数据；想真的抓类型错误跑 <code>mypy 文件.py</code> 或装 pyright 插件。',
        '<code>list[int]</code> 是 Python 3.9+ 写法；3.8 及更老要 <code>from typing import List</code> 用 List[int]——老代码两种都要认识。',
      ],
      related: ['optional-union', 'any-callable'],
      tags: ['类型', '标注', '函数签名'],
    },
    {
      name: 'optional-union', sig: "def f(pid: str) -> dict | None: / Optional[X] / Union[A, B]",
      brief: '可能为 None / 多种类型的标注。',
      examples: [
        { title: '', code: `def find_sample(sid: str) -> dict | None:     # 3.10+ 写法: 可能返回 dict 或 None\n    ...\n\nfrom typing import Optional, Union\n\ndef g(sid: str) -> Optional[dict]: ...        # 老写法, 与 dict | None 完全等价\ndef h(x: Union[int, str]) -> int: ...         # 多类型之一; 3.10+ 写作 int | str\n\ndef load(path: str | None = None) -> None:    # "参数可以不传"靠默认值, 不是靠 Optional\n    ...` },
      ],
      pitfalls: [
        '<b>Optional[X] 不是「参数可省略」</b>，它就是 X | None（值可以是 None）；可省略靠默认值 =。',
        '返回 X | None 的函数，用之前先判空，否则 IDE 会黄线警告、运行时炸 AttributeError。',
      ],
      related: ['基础标注'],
      tags: ['Optional', 'Union', 'None'],
    },
    {
      name: 'any-callable', sig: "Callable[[int, str], bool] / Any / TypeAlias / npt.NDArray",
      brief: '回调函数、任意类型、数组等进阶标注。',
      examples: [
        { title: '', code: `from typing import Any, Callable, TypeAlias\n\n# 回调: 参数类型列表 + 返回类型\ndef apply_all(nums: list[int], fn: Callable[[int], int]) -> list[int]:\n    return [fn(n) for n in nums]\n\nconfig: dict[str, Any] = {}        # 任意类型值(比 object 标注更"宽容")\n\nVector: TypeAlias = list[float]    # 起别名, 复杂类型可读性(3.12+ 可写 type Vector)\n\ndef smooth(y: Vector, k: int = 5) -> Vector: ...\n\n# numpy 数组标注(科学计算常见):\n#   import numpy.typing as npt\n#   def fit(x: npt.NDArray[np.float64]) -> float: ...` },
      ],
      pitfalls: [
        '<code>Any</code> 等于关掉检查，能用具体类型就别 Any；区分 Any(双方都不查)与 object(只进不出的最底层类型)。',
        '标注复杂嵌套如 dict[str, list[tuple[int, str]]] 不如起 TypeAlias 别名，工具提示也更友好。',
      ],
      related: ['基础标注'],
      tags: ['Callable', 'Any', '别名'],
    },
  ],
});
