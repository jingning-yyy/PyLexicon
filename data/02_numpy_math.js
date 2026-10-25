/* 数据处理：numpy / math */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'numpy', name: 'numpy', icon: '🧮', category: '数据处理',
  doc: 'https://numpy.org/doc/stable/',
  desc: '数值计算基石：N 维数组、向量化运算、广播机制，pandas/torch 都以它为基础。',
  install: 'pip install numpy',
  aliases: ['np'],
  tips: [
    '约定俗成 <code>import numpy as np</code>。',
    '核心思想：<b>能用向量化就别写 for 循环</b>，速度差几十到几百倍。',
    'numpy 数组里所有元素必须是<b>同一种类型</b>（dtype），混入字符串整列都会变成字符串。',
  ],
  entries: [
    {
      name: 'array', sig: 'np.array(object, dtype=None) / np.asarray(a)',
      brief: '从列表/嵌套列表创建数组，或把别的序列转成数组。',
      params: [
        { n: 'object', t: 'list / tuple / ...', d: '嵌套列表表示二维数组：[[1,2],[3,4]]' },
        { n: 'dtype', t: '类型', d: '显式指定元素类型：int32、float64、str 等', dflt: '自动推断' },
      ],
      examples: [
        { title: '创建数组', code: `import numpy as np\na = np.array([[1, 2, 3], [4, 5, 6]])\nprint(a.shape)   # (2, 3)  两行三列\nprint(a.dtype)   # int64\nb = np.array([1, 2, 3], dtype=np.float64)\nprint(a * 2 + 1) # 向量化运算，无需循环` },
      ],
      pitfalls: [
        '<code>np.array</code> 默认复制数据，<code>np.asarray</code> 已是 ndarray 时<b>不复制</b>（共享内存），改一个另一个也变。',
        '列表里混入 None 或长度不齐，得到 object dtype 或直接报错，计算会变慢甚至出错。',
        '整型数组做除法会自动转浮点，但整型溢出不会提醒（如 int8 超过 127 会回绕），注意 dtype。',
      ],
      related: ['arange-linspace', 'astype'],
      tags: ['创建', '数组', 'dtype'],
    },
    {
      name: 'arange-linspace', sig: 'np.arange(start, stop, step) / np.linspace(start, stop, num)',
      brief: '创建等差数列；arange 按步长（不含终点），linspace 按个数（默认含终点）。',
      examples: [
        { title: '两种等差数列', code: `import numpy as np\nprint(np.arange(0, 10, 2))          # [0 2 4 6 8]  不含 10\nprint(np.arange(5))                 # [0 1 2 3 4]\nprint(np.linspace(0, 1, 5))         # [0.   0.25 0.5  0.75 1. ]  含两端,共 5 个` },
      ],
      pitfalls: [
        '<b>arange 不含 stop，linspace 默认含 stop</b> —— 两个方向相反，最容易混。',
        '浮点步长的 arange 有累积误差（如 np.arange(0, 1, 0.1) 长度可能是 10 也可能 9），浮点场景用 linspace。',
      ],
      related: ['array', 'random'],
      tags: ['等差', '序列', '创建'],
    },
    {
      name: 'zeros-ones', sig: 'np.zeros(shape) / np.ones(shape) / np.empty(shape) / np.full(shape, v) / np.eye(n)',
      brief: '按形状创建全 0、全 1、未初始化、常量、单位矩阵。',
      examples: [
        { title: '', code: `import numpy as np\nnp.zeros((2, 3))          # 2 行 3 列全 0，注意 shape 是元组\nnp.ones(3, dtype=int)     # [1 1 1]\nnp.full((2, 2), 7)        # 全 7\nnp.eye(3)                 # 3x3 单位矩阵\nnp.zeros_like(a)          # 与数组 a 同形状同类型的全 0` },
      ],
      pitfalls: [
        '<code>shape</code> 要写元组 <code>(2, 3)</code>，写成 <code>2, 3</code> 恰好也行但 <code>np.zeros(3)</code> 是一维 3 个。',
        '<code>np.empty</code> 是<b>未初始化的垃圾值</b>不是 0，只用于马上会整体赋值的场合。',
      ],
      related: ['array', 'reshape'],
      tags: ['创建', '初始化', '全零'],
    },
    {
      name: 'reshape', sig: 'a.reshape(rows, cols) / a.reshape(-1) / a.ravel() / a.flatten()',
      brief: '改变数组形状（元素总数不变）；展平用 -1 或 ravel/flatten。',
      examples: [
        { title: '', code: `import numpy as np\na = np.arange(6)          # [0 1 2 3 4 5]\nb = a.reshape(2, 3)       # 2x3\nc = a.reshape(3, -1)      # -1 自动推算该维大小 -> (3, 2)\nd = b.flatten()           # 展平回一维` },
      ],
      pitfalls: [
        'reshape 总元素数必须对得上，<code>(6,)</code> 不能 reshape 成 <code>(4, 2)</code>。',
        '<code>reshape/ravel</code> 尽量返回<b>视图</b>（共享内存，改 b 会改 a）；<code>flatten</code> 总是<b>拷贝</b>。不想联动就先 .copy()。',
        '<code>b.T</code> 是转置，但转置后内存不连续，直接 reshape 可能报错或触发拷贝。',
      ],
      related: ['索引切片', 'broadcast'],
      tags: ['形状', '维度', '展平'],
    },
    {
      name: '索引切片', sig: 'a[i, j] / a[1:3] / a[[0, 2]] / a[a > 5] / a[:, 1]',
      brief: '下标、切片、花式索引（列表下标）、布尔掩码四种取子集方式。',
      examples: [
        { title: '', code: `import numpy as np\na = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])\nprint(a[1, 2])      # 6（第2行第3列）\nprint(a[:, 0])      # [1 4 7]  第一列\nprint(a[a > 5])     # [6 7 8 9] 布尔掩码筛选\na[a > 5] = 0        # 掩码批量赋值，向量化替换的标配\nprint(a[[0, 2]])    # 第 0、2 行，花式索引` },
      ],
      pitfalls: [
        '<b>基本切片是视图</b>（改子数组会影响原数组），<b>花式索引和布尔掩码是副本</b> —— 数据联动 bug 高发区。',
        '多维下标用 <code>a[1, 2]</code> 而不是 <code>a[1][2]</code>（后者多一次中间数组）。',
        '掩码赋值 <code>a[a>5] = 0</code> 是就地修改，要新数组先 copy。',
      ],
      related: ['where', 'reshape'],
      tags: ['索引', '切片', '布尔', '筛选'],
    },
    {
      name: 'axis', sig: 'a.sum(axis=0) / a.mean(axis=1) / a.max(axis=0, keepdims=True)',
      brief: '聚合运算沿哪个轴进行：axis=0 跨行压成一行（按列聚合），axis=1 跨列。',
      examples: [
        { title: '', code: `import numpy as np\na = np.array([[1, 2], [3, 4]])\nprint(a.sum())          # 10  全部求和\nprint(a.sum(axis=0))    # [4 6]  每列求和（行被压掉）\nprint(a.sum(axis=1))    # [3 7]  每行求和（列被压掉）\nprint(a.mean(axis=1, keepdims=True))  # [[1.5],[3.5]] 保留维度便于广播` },
      ],
      pitfalls: [
        '记忆法：<b>axis 指定的轴会被"压扁消失"</b>。axis=0 是把行压掉 → 得到每列的结果。',
        'axis 结果维度少一维，之后想做广播运算报形状错时，加 <code>keepdims=True</code>。',
        'nan 会污染结果（sum/mean 遇 nan 得 nan），用 <code>np.nansum / np.nanmean</code>。',
      ],
      related: ['nan', 'argmax-argsort'],
      tags: ['聚合', '求和', '均值', '维度'],
    },
    {
      name: 'argmax-argsort', sig: 'a.argmax(axis=None) / np.argsort(a) / np.sort(a) / a.sort()',
      brief: '最大值的位置、排序后索引、排序本身。',
      examples: [
        { title: 'Top-K 的标准写法', code: `import numpy as np\na = np.array([30, 10, 40, 20])\nprint(a.argmax())           # 2  最大值位置\nidx = np.argsort(a)[::-1]   # 降序排列的索引 [2 0 3 1]\ntop2 = idx[:2]              # Top-2 的位置\nprint(a[top2])              # [40 30]\nprint(np.sort(a)[::-1])     # [40 30 20 10] 直接拿值` },
      ],
      pitfalls: [
        '<code>np.sort(a)</code> 返回新数组，<code>a.sort()</code> 是就地修改 —— 想保留原数组别用后者。',
        'argsort 默认<b>升序</b>，想要 Top-N 得 <code>[::-1]</code> 反转后再取前 N。',
        '并列最大值时 argmax 只返回<b>第一个</b>位置。',
      ],
      related: ['axis', '索引切片'],
      tags: ['排序', '最大值', 'topk'],
    },
    {
      name: 'broadcast', sig: '形状不同的数组运算时自动扩展',
      brief: '广播机制：形状从尾部对齐，每维相等或其中一边为 1 即可运算。',
      examples: [
        { title: '', code: `import numpy as np\na = np.array([[1, 2, 3], [4, 5, 6]])   # (2, 3)\nb = np.array([10, 20, 30])             # (3,)  -> 视作 (1,3) -> 广播成 (2,3)\nprint(a + b)               # [[11 22 33],[14 25 36]]\nc = a - a.mean(axis=1, keepdims=True)  # (2,3) - (2,1) 每行减自己的均值\nprint(c)` },
      ],
      pitfalls: [
        '规则是<b>从最后一维向前对齐</b>：(3,) 和 (2, 3) 可以；(2, 3) 和 (3, 2) 不行，报 could not be broadcast。',
        '常见的报错 <code>shapes (2,3) and (2,) not broadcastable</code>，多半是想按列加一个长度 2 的向量 —— 需要 reshape 成 (2, 1)。',
        '广播是<b>逻辑扩展不复制数据</b>，所以又快又省内存，写循环前先想想能不能广播。',
      ],
      related: ['reshape', 'axis'],
      tags: ['广播', '形状', '运算'],
    },
    {
      name: 'where', sig: 'np.where(cond, x, y) / np.where(cond)',
      brief: '向量化三目运算：条件成立取 x 否则取 y；只传条件时返回满足条件的坐标。',
      examples: [
        { title: '一函数两用法', code: `import numpy as np\na = np.array([1, -2, 3, -4])\nprint(np.where(a > 0, a, 0))    # [1 0 3 0]  ReLU 的本质\nrows, cols = np.where(a < 0)     # 满足条件的下标 (array([1,3]),)\nprint(rows)` },
      ],
      pitfalls: [
        '<b>一名两用最容易混</b>：三个参数是"替换"，一个参数是"找位置"。',
        '<code>np.where(cond, x, y)</code> 里 x、y 都会被先计算，大数组可用 <code>np.clip / np.maximum</code> 等专函数替代。',
        '嵌套多条件用 <code>&amp; |</code> 且<b>每个条件必须加括号</b>：<code>np.where((a>0) &amp; (a<10), 1, 0)</code>。',
      ],
      related: ['索引切片'],
      tags: ['条件', '替换', '查找'],
    },
    {
      name: 'concatenate', sig: 'np.concatenate([a, b], axis=0) / np.vstack / np.hstack / np.stack',
      brief: '拼接数组：concatenate 沿已有轴拼接，stack 会新建一个轴。',
      examples: [
        { title: '', code: `import numpy as np\na = np.array([[1, 2]])      # (1, 2)\nb = np.array([[3, 4]])      # (1, 2)\nprint(np.concatenate([a, b], axis=0).shape)  # (2, 2) 竖着接\nprint(np.hstack([a, b]).shape)               # (1, 4) 横着接\nprint(np.stack([a, b]).shape)                # (2, 1, 2) 新增了一维!` },
      ],
      pitfalls: [
        '<b>stack 和 concatenate 不同</b>：stack 把数组堆成更高维（比如多个样本堆成 batch），concatenate 只是接长。',
        '一维数组拼接成"列"容易错：先 <code>reshape(-1, 1)</code> 再 hstack，或用 <code>np.column_stack</code>。',
      ],
      related: ['reshape', 'random'],
      tags: ['拼接', '合并', '堆叠'],
    },
    {
      name: 'random', sig: "rng = np.random.default_rng(seed) / rng.random(size) / rng.integers(low, high, size) / rng.normal(loc, scale, size)",
      brief: '生成随机数。新版推荐 Generator API（default_rng），老代码常见 np.random.*。',
      examples: [
        { title: '', code: `import numpy as np\nrng = np.random.default_rng(42)          # 固定种子保证可复现\nprint(rng.random((2, 2)))                # [0,1) 均匀分布\nprint(rng.integers(0, 10, size=5))       # [0,10) 整数，不含 10\nprint(rng.normal(0, 1, size=3))          # 正态分布\nprint(rng.choice(5, size=3, replace=False))  # 不重复抽样` },
      ],
      pitfalls: [
        '<b>integers 的 high 不含</b>，和 Python random.randint（含）行为不同，跨库混用易出 off-by-one。',
        '老接口 <code>np.random.seed(42)</code> + <code>np.random.rand()</code> 仍可用，但全局状态不利于复现；新项目用 default_rng。',
        '<code>rng.random()</code> 默认 [0,1) 浮点，想要整数用 <code>rng.integers</code>。',
      ],
      related: ['arange-linspace', '索引切片'],
      tags: ['随机', '抽样', '种子'],
    },
    {
      name: 'nan', sig: 'np.nan / np.isnan(a) / np.nansum(a) / np.nanmean(a)',
      brief: '缺失值表示与处理：nan 是 float 类型，会传染所有运算。',
      examples: [
        { title: '', code: `import numpy as np\na = np.array([1.0, np.nan, 3.0])\nprint(a.sum())        # nan  被污染\nprint(np.nansum(a))   # 4.0  忽略 nan 求和\nprint(np.isnan(a))    # [False  True False]\na[np.isnan(a)] = np.nanmean(a)   # 用均值填充` },
      ],
      pitfalls: [
        '<code>nan == nan</code> 是 False！判断必须用 <code>np.isnan()</code>。',
        'nan 只能存在于浮点数组；整数数组里塞 nan 会报错或整列变 float。',
        'numpy 的 nan 与 pandas 的 NaT/None 在 object 列里混存时，用 <code>pd.isna</code> 统一判断更稳。',
      ],
      related: ['axis', 'where'],
      tags: ['缺失值', 'nan', '空值'],
    },
    {
      name: 'astype', sig: 'a.astype(dtype)',
      brief: '转换数组类型，返回新数组。',
      examples: [
        { title: '', code: `import numpy as np\na = np.array([1.7, 2.2, 3.9])\nprint(a.astype(int))            # [1 2 3]  直接截断不是四舍五入!\nprint(a.round().astype(int))    # [2 2 4]  先舍入再转\ns = np.array([1, 2]).astype(str)  # ['1' '2']` },
      ],
      pitfalls: [
        'astype 转整型是<b>向零截断</b>（1.9 → 1，-1.9 → -1），不是四舍五入。',
        '浮点转整型遇到 nan/inf 直接报错，先处理缺失。',
        'astype 总是返回副本，大数组频繁转换注意内存。',
      ],
      related: ['array', 'nan'],
      tags: ['类型', '转换'],
    },
    {
      name: 'dot-matmul', sig: 'A @ B / np.dot(A, B) / np.matmul(A, B)',
      brief: '矩阵乘法：注意与逐元素乘法 * 完全不同。',
      examples: [
        { title: '', code: `A = np.array([[1, 2], [3, 4]])
B = np.array([[0, 1], [1, 0]])

print(A * B)      # 逐元素相乘 [[0, 2], [3, 0]]
print(A @ B)      # 矩阵乘法   [[2, 1], [4, 3]]

v = np.array([1, 1])
print(A @ v)      # 矩阵乘向量 -> [3, 7]
print(v @ v)      # 一维@一维 = 内积(标量) 2` },
      ],
      pitfalls: [
        '<b>@ / dot 是矩阵乘法，* 是逐元素乘</b> —— 两者写错不报错但结果全错，肉眼很难发现。',
        '形状规则：(m, n) @ (n, k) 得 (m, k)，中间维必须相等。',
        '一维 @ 一维 得到标量（内积），不会自动变成行/列向量。',
      ],
      related: ['array', 'broadcast'],
      tags: ['矩阵乘法', '内积'],
    },
    {
      name: 'unique-meshgrid', sig: 'np.unique(a, return_counts=True) / np.meshgrid(x, y) / np.median(a) / np.diff(a)',
      brief: '去重计数、网格生成与常用统计补充。',
      examples: [
        { title: '', code: `vals, cnts = np.unique(a, return_counts=True)   # 去重+计数

X, Y = np.meshgrid(np.linspace(0, 4, 5), np.linspace(0, 2, 3))
Z = np.sin(X) + Y          # 二维函数值网格(画3D图/等高线的输入)

print(np.median(a), np.percentile(a, 75))
print(np.cumsum([1, 2, 3]))    # [1 3 6] 累计
print(np.diff([1, 5, 2]))      # [4 -3] 相邻差` },
      ],
      pitfalls: [
        '<b>meshgrid 是画 3D 曲面/等高线的前置步骤</b>，配合 plt.plot_surface / contour 使用。',
        'unique 默认返回排序后的去重结果；return_counts 一起拿频数（等价轻量版 Counter）。',
      ],
      related: ['axis', 'argmax-argsort'],
      tags: ['去重', '网格', '统计'],
    },
    {
      name: 'save-load', sig: "np.save('a.npy', arr) / np.load('a.npy') / np.savez('b.npz', x=x, y=y) / np.savetxt",
      brief: '数组持久化：.npy 单数组、.npz 多数组打包、savetxt 存文本。',
      examples: [
        { title: '', code: `import numpy as np\n\nnp.save('spectrum.npy', spec)            # 单数组, 二进制(保 dtype/shape)\nspec2 = np.load('spectrum.npy')\n\nnp.savez('batch.npz', spec=spec, energy=en)   # 多数组打一个包\nwith np.load('batch.npz') as z:\n    print(z['spec'].shape, z['energy'].shape)\n\nnp.savetxt('spec.txt', spec, fmt='%.4f', delimiter=',')   # 给别的软件用存文本\narr = np.loadtxt('spec.txt', delimiter=',')` },
      ],
      pitfalls: [
        'npy/npz 是二进制且<b>保留 dtype 和 shape</b>，重载无需再指定类型；要给其他软件/人看用 savetxt 存文本。',
        '<b>npz 要按名字取</b>：np.load 返回的是"类字典"，z[\'名字\'] 才是数组本身。',
        'G 级大数据或需要部分读取换 <b>h5py</b>（见「X 射线工具」分类）；savez_compressed 是压缩版。',
      ],
      related: ['array', 'astype'],
      tags: ['保存', 'npy', 'npz', '持久化'],
    },
  ],
});

MODULES.push({
  id: 'math', name: 'math', icon: '📐', category: '数据处理',
  doc: 'https://docs.python.org/zh-cn/3/library/math.html',
  desc: '标准库数学函数：取整、幂、对数、阶乘等标量运算（处理单个数，不是数组）。',
  install: false,
  tips: [
    'math 处理<b>单个数字</b>；对整个列表/数组做数学运算请用 numpy，否则要写循环或 map。',
    '约定 <code>import math</code>，不要起名 math.py，会把自己 import 进去。',
  ],
  entries: [
    {
      name: '常量', sig: 'math.pi / math.e / math.inf / math.nan / math.tau',
      brief: 'π、自然常数、无穷大、非数等常量。',
      examples: [
        { title: '', code: `import math\nprint(math.pi)      # 3.141592653589793\nprint(math.inf > 1e308)   # True\nprint(-math.inf)    # 负无穷，初始化求最小值常用\nprint(math.nan != math.nan)  # True, nan 不等于自身` },
      ],
      pitfalls: [
        '判断无穷/非数用 <code>math.isinf / math.isnan</code>，别用 == 比较。',
        'inf 参与运算可能得到 nan（如 inf - inf）。',
      ],
      related: ['舍入'],
      tags: ['常量', 'pi', 'inf'],
    },
    {
      name: '舍入', sig: 'math.ceil(x) / math.floor(x) / math.trunc(x) / round(x, n)',
      brief: '向上取整、向下取整、向零取整；round 是内置函数但常一起比较。',
      examples: [
        { title: '', code: `import math\nprint(math.ceil(2.1))    # 3   向上\nprint(math.floor(2.9))   # 2   向下\nprint(math.trunc(-2.9))  # -2  向零截断\nprint(round(2.5))        # 2 !!! 银行家舍入\nprint(round(3.5))        # 4\nprint(round(2.675, 2))   # 2.67 浮点表示误差` },
      ],
      pitfalls: [
        '<b>round 是"四舍六入五成双"</b>（银行家舍入），round(2.5)=2、round(3.5)=4，不是想象中的四舍五入！',
        '对金额要求精确时用 <code>decimal.Decimal</code>。',
        'ceil/floor/trunc 返回 int，round 带第二个参数时返回 float。',
      ],
      related: ['常量', '对数指数'],
      tags: ['取整', '舍入', 'round'],
    },
    {
      name: '幂与开方', sig: 'math.sqrt(x) / math.pow(x, y) / math.isqrt(n)',
      brief: '平方根、浮点幂、整数平方根。',
      examples: [
        { title: '', code: `import math\nprint(math.sqrt(16))    # 4.0  浮点\nprint(math.isqrt(17))   # 4    整数平方根(向下), 无精度问题\nprint(math.pow(2, 10))  # 1024.0\nprint(2 ** 10)          # 1024 内置幂运算符, 整数时更推荐` },
      ],
      pitfalls: [
        '<code>sqrt(-1)</code> 直接 ValueError，复数用 <code>cmath.sqrt</code>。',
        '判断完全平方数用 <code>math.isqrt(n) ** 2 == n</code>，用 <code>sqrt</code> 浮点比较有精度坑。',
        '<code>math.pow</code> 总返回 float，大整数运算用内置 <code>**</code>。',
      ],
      related: ['舍入'],
      tags: ['平方根', '幂'],
    },
    {
      name: '对数指数', sig: 'math.log(x, base) / math.log2(x) / math.log10(x) / math.exp(x)',
      brief: '对数（log 默认是自然对数 ln！）与 e 的幂。',
      examples: [
        { title: '', code: `import math\nprint(math.log(math.e))     # 1.0  默认自然对数 ln\nprint(math.log(8, 2))       # 3.0  以 2 为底\nprint(math.log2(8))         # 3.0  整数次幂时更精确\nprint(math.log10(1000))     # 3.0\nprint(math.exp(1))          # 2.718...  e^x` },
      ],
      pitfalls: [
        '<b>math.log(x) 是 ln 不是 log10</b>！从其他语言转来的人最常踩。',
        '以 2/10 为底优先用 log2/log10，比 log(x, 2) 精度更好。',
        'log(0)、log(负数) 直接 ValueError。',
      ],
      related: ['舍入'],
      tags: ['对数', '指数', 'ln'],
    },
    {
      name: '整数工具', sig: 'math.gcd(a, b) / math.lcm(a, b) / math.factorial(n) / math.comb(n, k) / math.degrees(x) / math.radians(x)',
      brief: '最大公约数、最小公倍数、阶乘、组合数、角度弧度互转。',
      examples: [
        { title: '', code: `import math\nprint(math.gcd(12, 18))       # 6\nprint(math.lcm(4, 6))         # 12 (3.9+)\nprint(math.factorial(5))      # 120\nprint(math.comb(5, 2))        # 10  组合数 C(5,2)\nprint(math.degrees(math.pi))  # 180.0\nprint(math.radians(180))      # 3.14159...` },
      ],
      pitfalls: [
        '<code>factorial</code> 参数必须是非负整数，负数/小数报 ValueError；很大时用 <code>math.lgamma</code> 或直接 comb。',
        '三角函数全部吃<b>弧度</b>不吃角度，传角度前先 <code>math.radians</code>。',
        '3.8 之前没有 comb/lcm，老环境注意兼容。',
      ],
      related: ['常量'],
      tags: ['公约数', '阶乘', '组合', '角度'],
    },
  ],
});

MODULES.push({
  id: 'scipy', name: 'scipy', icon: '🔬', category: '数据处理',
  desc: '科学计算工具箱：信号平滑、找峰、曲线拟合、积分、统计，谱图处理的标配。',
  install: 'pip install scipy',
  doc: 'https://docs.scipy.org/doc/scipy/',
  aliases: ['signal', '找峰', '平滑', '拟合'],
  entries: [
    {
      name: 'savgol-medfilt', sig: 'savgol_filter(y, window_length=11, polyorder=3) / medfilt(y, 5)',
      brief: '两种平滑：Savitzky–Golay 保峰形去噪；中值滤波去尖峰毛刺。',
      params: [
        { n: 'window_length', t: 'int', d: '滑动窗口长度，<b>必须奇数</b>' },
        { n: 'polyorder', t: 'int', d: '拟合多项式阶数，必须小于窗口长度', dflt: '2~3' },
      ],
      examples: [
        { title: '', code: `from scipy.signal import savgol_filter, medfilt\n\nys = savgol_filter(y, window_length=11, polyorder=3)  # 平滑但保峰\nspike_free = medfilt(y, 5)                            # 去掉宇宙射线类尖峰\n\n# 组合拳: 先中值去尖峰, 再 SG 平滑\nys = savgol_filter(medfilt(y, 5), 11, 3)` },
      ],
      pitfalls: [
        '窗口越大越平滑但峰越矮越宽；<b>窗口必须是奇数</b>且大于 polyorder，否则直接报错。',
        '平缓的基线漂移用大窗口 SG 也能压，但认真的基线扣除见「特征处理速查」页。',
      ],
      related: ['find_peaks'],
      tags: ['平滑', '滤波', '去噪'],
    },
    {
      name: 'find_peaks', sig: "find_peaks(y, height=None, distance=None, prominence=None, width=None)",
      brief: '找峰并按条件筛选，返回峰索引与属性（谱图特征提取核心）。',
      params: [
        { n: 'height', t: 'float / 区间', d: '峰高筛选，如 100 或 (50, 500)' },
        { n: 'distance', t: 'int', d: '相邻峰最小间隔（点数），防一个峰拆成两个' },
        { n: 'prominence', t: 'float', d: '显著度：峰高出周围背景的程度，<b>抗噪声最好用的条件</b>' },
        { n: 'width', t: 'float', d: '峰宽（点数）筛选' },
      ],
      examples: [
        { title: '', code: `from scipy.signal import find_peaks, peak_widths\n\npeaks, props = find_peaks(ys, height=100, distance=20, prominence=50)\nprint(x[peaks])                       # 峰位(能量/角度)\nprint(props['peak_heights'])          # 峰高\n\nfwhm_pts = peak_widths(ys, peaks, rel_height=0.5)[0]\nprint(fwhm_pts * (x[1] - x[0]))       # 换算成实际单位的 FWHM` },
      ],
      pitfalls: [
        '<b>先平滑再找峰</b>，否则噪声毛刺全被当峰；配合 prominence 过滤最稳。',
        '返回的是<b>索引</b>不是坐标，取物理量要 x[peaks]。',
        'peak_widths 给的是"点数"宽度，乘 dx 换算成 eV 或 2θ。',
      ],
      related: ['savgol-medfilt'],
      tags: ['找峰', '峰位', 'fwhm'],
    },
    {
      name: 'curve_fit', sig: 'curve_fit(f, x, y, p0=[初值]) -> (popt, pcov)',
      brief: '自定义函数非线性最小二乘拟合（简单场景比 lmfit 轻）。',
      examples: [
        { title: '', code: `from scipy.optimize import curve_fit\n\ndef gauss(x, a, mu, sig):\n    return a * np.exp(-(x - mu) ** 2 / (2 * sig ** 2))\n\npopt, pcov = curve_fit(gauss, x, y, p0=[100, 10, 1])\nperr = np.sqrt(np.diag(pcov))         # 参数标准误差\nprint(popt, perr)                     # 最优值 ± 不确定度` },
      ],
      pitfalls: [
        '<b>p0 初值几乎决定成败</b>：多峰拟合给错初值直接不收敛或掉进局部解；从 find_peaks 结果生成初值是标准套路。',
        '参数多了（&gt;5 个）建议直接用 lmfit：参数边界、约束、报告更完善。',
      ],
      related: ['savgol-medfilt'],
      tags: ['拟合', '高斯', 'curvefit'],
    },
    {
      name: '积分', sig: 'trapezoid(y, x) / simpson(y, x=x)',
      brief: '数值积分：求峰面积、归一化用。',
      examples: [
        { title: '', code: `from scipy.integrate import trapezoid\n\narea = trapezoid(ys, x)                       # 全谱面积\nm = (x > 9.5) & (x < 10.5)                    # 峰附近窗口\npeak_area = trapezoid(ys[m], x[m])            # 峰面积\n\nnorm = ys / trapezoid(ys, x)                  # 面积归一化` },
      ],
      pitfalls: [
        'numpy 的 <code>np.trapz</code> 已改名 <code>np.trapezoid</code>（numpy 2.0），用 scipy.integrate.trapezoid 最稳。',
        '面积单位 = y 单位 × x 单位，归一化前想清楚除的是全谱还是窗口。',
      ],
      related: ['find_peaks'],
      tags: ['积分', '峰面积', '归一化'],
    },
    {
      name: 'detrend-stats', sig: 'detrend(y) / stats.zscore(a) / stats.pearsonr(x, y)',
      brief: '去趋势与常用统计速查。',
      examples: [
        { title: '', code: `from scipy.signal import detrend\nfrom scipy.stats import zscore, pearsonr, binned_statistic\n\ny_flat = detrend(y)                 # 去线性漂移\nz = zscore(a)                       # 标准化 (x-mean)/std\nr, p = pearsonr(spec1, spec2)       # 相关系数与p值\n\n# 分箱统计: 把谱按能量段求均值\nbin_mean, edges = binned_statistic(x, y, bins=50, statistic='mean')` },
      ],
      pitfalls: [
        'detrend 默认只去线性项，type="polynomial" 可配阶数。',
        'pearsonr 返回 (r, p) 两个值，解包接收。',
      ],
      related: ['savgol-medfilt', '积分'],
      tags: ['去趋势', '统计', '相关', '分箱'],
    },
    {
      name: 'io-loadmat', sig: "from scipy.io import loadmat / m = loadmat('data.mat')",
      brief: '读取 MATLAB .mat 文件（科研数据交换常见格式）。',
      examples: [
        { title: '', code: `from scipy.io import loadmat

m = loadmat('data.mat')
print(m.keys())               # 含 __header__ 等系统键
arr = m['spectrum']           # 按变量名取, 通常是 ndarray

# 注意: v7.3 格式(大文件)是 HDF5, 要用 h5py:
# import h5py
# f = h5py.File('data.mat')
# arr = f['spectrum'][:]` },
      ],
      pitfalls: [
        '返回 dict，混着 <b>__header__/__version__ 等系统键</b>，取数时按变量名。',
        'MATLAB 下标从 1 开始，存出来的索引数据转 Python 后记得减 1。',
        '<b>新版 MATLAB 默认存 v7.3(HDF5)</b>，scipy 读不了，改用 h5py 或让对方存成 v7。',
      ],
      related: ['savgol-medfilt'],
      tags: ['matlab', 'mat', '读取'],
    },
    {
      name: 'interpolate 插值', sig: "from scipy.interpolate import CubicSpline / np.interp(x_new, x, y)",
      brief: '插值：把数据换到统一网格或加密采样。',
      examples: [
        { title: '', code: `import numpy as np
from scipy.interpolate import CubicSpline

y_new = np.interp(x_new, x, y)          # 线性插值(简单稳)
cs = CubicSpline(x, y)                  # 三次样条(平滑)
y_smooth = cs(x_new)` },
      ],
      pitfalls: [
        '<b>插值不是拟合</b>：插值过原数据点，带噪声的数据先平滑再插值。',
        '样条在数据稀疏处可能过冲(振铃)，先画出来看；简单场景 np.interp 够用。',
      ],
      related: ['savgol-medfilt', '积分'],
      tags: ['插值', '重采样'],
    },
  ],
});
