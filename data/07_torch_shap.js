/* 深度学习与模型解释：torch / shap */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'torch', name: 'torch', icon: '🔥', category: '深度学习与模型解释',
  doc: 'https://pytorch.org/docs/stable/index.html',
  desc: 'PyTorch 深度学习框架：张量运算、自动求导、nn 模块、DataLoader，深度学习事实标准。',
  install: '按官网命令装对应 CUDA 版本，CPU 版: pip install torch',
  aliases: ['pytorch'],
  tips: [
    '<b>CPU 张量和 GPU 张量不能直接运算</b>，报 device 错误时把两边都 .to(device)。',
    '训练四步曲固定顺序：<code>optimizer.zero_grad() → loss.backward() → optimizer.step()</code>，忘了 zero_grad 梯度会累积。',
    '安装版本不对是最大门槛：CUDA 版本去 pytorch.org 选对应命令，别盲目 pip install torch。',
  ],
  entries: [
    {
      name: 'tensor', sig: 'torch.tensor(data, dtype=None, requires_grad=False) / torch.from_numpy(arr)',
      brief: '从 Python 列表 / numpy 数组创建张量。',
      params: [
        { n: 'dtype', t: 'torch.float32 等', d: '显式指定类型；默认整数 int64、浮点 float32（numpy 默认 float64！）' },
        { n: 'requires_grad', t: 'bool', d: 'True 时记录梯度（训练参数必须开）' },
      ],
      examples: [
        { title: '', code: `import torch, numpy as np\nt = torch.tensor([[1., 2.], [3., 4.]])\nprint(t.shape, t.dtype)          # torch.Size([2, 2]) torch.float32\n\narr = np.ones((2, 2))\na = torch.from_numpy(arr)        # 与 arr 共享内存!\nb = torch.tensor(arr)            # 拷贝一份` },
      ],
      pitfalls: [
        '<b>from_numpy 共享内存</b>：改 numpy 数组张量也变；torch.tensor 是拷贝 —— 联动 bug 高发。',
        'numpy 默认 float64、torch 默认 float32，混算报 dtype 错，统一 <code>.float()</code>。',
        '<code>torch.tensor(3.14, requires_grad=True)</code> 是叶子张量可以直接求导；对已有张量要 <code>t.requires_grad_(True)</code>。',
      ],
      related: ['device', '创建'],
      tags: ['张量', '创建', 'numpy'],
    },
    {
      name: '创建', sig: 'torch.zeros/ones/empty/full / torch.arange / torch.linspace / torch.rand / torch.randn / torch.randint',
      brief: '常用初始化函数，与 numpy 高度对应。',
      examples: [
        { title: '', code: `import torch\ntorch.manual_seed(42)                      # 固定随机种子\ntorch.zeros(2, 3)\ntorch.arange(0, 10, 2)                     # [0,2,4,6,8]\ntorch.rand(2, 2)                           # [0,1) 均匀\ntorch.randn(2, 2)                          # 标准正态, 权重初始化常用\ntorch.randint(0, 10, (3,))                 # 整数, high 不含\ntorch.zeros_like(x)                        # 同形状` },
      ],
      pitfalls: [
        'rand 是均匀分布、<b>randn 是正态分布</b>，差一个字母差很多。',
        'randint 的 high 不含（与 numpy 一致，与 Python random.randint 不同）。',
        '复现实验除了 manual_seed，还要固定 cudnn：<code>torch.backends.cudnn.deterministic = True</code>。',
      ],
      related: ['tensor'],
      tags: ['初始化', '随机', '种子'],
    },
    {
      name: '形状', sig: 'x.view(2, 3) / x.reshape(-1) / x.unsqueeze(0) / x.squeeze() / x.permute(2,0,1) / x.flatten()',
      brief: '改变张量形状；unsqueeze 加维、squeeze 压维、permute 换轴。',
      examples: [
        { title: '', code: `x = torch.arange(6)            # shape (6,)\nx.view(2, 3)                   # (2,3)\nx.view(-1, 2)                  # -1 自动推算 -> (3,2)\nimg = torch.rand(3, 224, 224)          # C,H,W\nbatch = img.unsqueeze(0)               # (1,3,224,224) 加 batch 维\nchw = batch.squeeze(0).permute(1, 2, 0)  # (224,224,3) HWC, 画图用` },
      ],
      pitfalls: [
        '<b>view 要求内存连续</b>，transpose/permute 后的 张量直接 view 报错，先 <code>.contiguous()</code> 或直接用 reshape。',
        'unsqueeze 的参数是"插入位置"：<code>unsqueeze(0)</code> 在最前面加维。',
        'batch 维忘了加是新手最常见报错（Expected 4 dimensions got 3），unsqueeze(0) 解决。',
      ],
      related: ['tensor', 'cat-stack'],
      tags: ['形状', '维度', 'view'],
    },
    {
      name: 'cat-stack', sig: 'torch.cat([a, b], dim=0) / torch.stack([a, b], dim=0)',
      brief: '拼接张量：cat 沿已有维度接长，stack 新增一个维度。',
      examples: [
        { title: '', code: `a = torch.ones(2, 3)\nb = torch.zeros(2, 3)\ntorch.cat([a, b], dim=0).shape    # (4,3) 竖接\ntorch.cat([a, b], dim=1).shape    # (2,6) 横接\ntorch.stack([a, b], dim=0).shape  # (2,2,3) 新维度! 打包样本常用` },
      ],
      pitfalls: [
        '多个张量做 stack 形状必须完全相同；cat 只要求非拼接维相同。',
        'dim 从 0 数起；负数表示从后往前（dim=-1 是最后一维）。',
      ],
      related: ['形状'],
      tags: ['拼接', '合并'],
    },
    {
      name: 'device', sig: "device = torch.device('cuda' if torch.cuda.is_available() else 'cpu') / x.to(device) / model.to(device)",
      brief: '把张量和模型搬到 GPU/CPU；跨设备运算必须先统一。',
      examples: [
        { title: '标准写法', code: `device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')\nprint(device, torch.cuda.get_device_name(0) if device.type == 'cuda' else '')\n\nmodel = MyModel().to(device)          # 模型先搬\nfor x, y in loader:\n    x, y = x.to(device), y.to(device)  # 数据每个 batch 都要搬\n    ...\n\n# 预测/保存前可以搬回 CPU: x.cpu(), model.cpu()` },
      ],
      pitfalls: [
        '<code>.to(device)</code> 返回新对象不是就地修改！必须 <code>x = x.to(device)</code>，只写 x.to(device) 什么都没发生。',
        '模型在 GPU、数据在 CPU 报 "Expected all tensors to be on the same device"。',
        '加载 GPU 训练的模型到无 GPU 机器：<code>torch.load(path, map_location="cpu")</code>。',
      ],
      related: ['save-load', 'train-loop'],
      tags: ['gpu', 'cuda', '设备'],
    },
    {
      name: 'autograd', sig: "x = torch.tensor(..., requires_grad=True) / loss.backward() / x.grad / with torch.no_grad():",
      brief: '自动求导：前向记录计算图，backward 反传梯度。',
      examples: [
        { title: '', code: `x = torch.tensor(2.0, requires_grad=True)\ny = x ** 3 + 2 * x\ny.backward()               # 求 dy/dx\nprint(x.grad)              # 3x^2+2 = 14\n\n# 推理阶段不需要梯度(省显存加速):\nwith torch.no_grad():\n    out = model(x_batch)\n# 或: out = model(x_batch).detach()` },
      ],
      pitfalls: [
        '<b>梯度是累积的</b>：连续两次 backward，x.grad 会相加；训练循环里必须先 zero_grad。',
        '只有<b>标量</b>才能直接 backward()；输出是向量要传 gradient 参数或先 .sum()/.mean()。',
        '在 no_grad 外做推理会白白构建计算图占显存，甚至触发 "backward through the graph a second time"。',
      ],
      related: ['train-loop'],
      tags: ['梯度', '反向传播', 'no_grad'],
    },
    {
      name: 'nn.Module', sig: 'class Net(nn.Module): def __init__(self): super().__init__() ... def forward(self, x): ...',
      brief: '自定义模型骨架：__init__ 定义层，forward 定义前向计算。',
      examples: [
        { title: '全连接模板', code: `import torch.nn as nn\n\nclass MLP(nn.Module):\n    def __init__(self, in_dim, hidden=64, out_dim=1):\n        super().__init__()                       # 必须第一行!\n        self.net = nn.Sequential(\n            nn.Linear(in_dim, hidden),\n            nn.ReLU(),\n            nn.Dropout(0.2),\n            nn.Linear(hidden, out_dim),\n        )\n\n    def forward(self, x):\n        return self.net(x)\n\nmodel = MLP(in_dim=10)\nprint(sum(p.numel() for p in model.parameters()))   # 参数量` },
      ],
      pitfalls: [
        '忘写 <code>super().__init__()</code> 报 "module not initialized" 类错误。',
        'forward 里不要用 nn.ReLU() 之外的非模块函数乱来；F.relu 与 nn.ReLU 等价，选一种风格。',
        'model(x) 自动调 forward，<b>不要</b>手写 model.forward(x)（会绕过 hook 机制）。',
      ],
      related: ['train-loop', 'save-load'],
      tags: ['模型', '网络', 'sequential'],
    },
    {
      name: 'DataLoader', sig: 'DataLoader(dataset, batch_size=32, shuffle=True, num_workers=0, drop_last=False)',
      brief: '把 Dataset 打包成可迭代的 mini-batch。',
      params: [
        { n: 'batch_size', t: 'int', d: '每批样本数' },
        { n: 'shuffle', t: 'bool', d: '训练集 True 打乱，验证/测试集 False' },
        { n: 'num_workers', t: 'int', d: '多进程加载数据，Windows 下 >0 需 main 保护' },
        { n: 'drop_last', t: 'bool', d: '丢掉不满一个 batch 的尾批（BN 场景常用）' },
      ],
      examples: [
        { title: '', code: `from torch.utils.data import DataLoader, TensorDataset\nimport torch\n\nX = torch.randn(1000, 10)\ny = torch.randint(0, 2, (1000,)).float()\ndataset = TensorDataset(X, y)              # 现成打包\nloader = DataLoader(dataset, batch_size=32, shuffle=True)\n\nfor xb, yb in loader:\n    print(xb.shape, yb.shape)   # torch.Size([32, 10]) ...\n    break` },
      ],
      pitfalls: [
        '<b>Windows + num_workers>0</b> 必须把训练代码放进 <code>if __name__ == "__main__":</code>，否则报 freeze_support 错误。',
        '自定义 Dataset 要实现 <code>__getitem__</code> 和 <code>__len__</code> 两个方法。',
        'shuffle 在验证集上要关，否则评估结果不可比。',
      ],
      related: ['nn.Module', 'train-loop'],
      tags: ['dataloader', 'batch', '数据集'],
    },
    {
      name: 'train-loop', sig: 'optimizer.zero_grad() → outputs = model(x) → loss = criterion(...) → loss.backward() → optimizer.step()',
      brief: '训练循环模板 + train/eval 模式切换。',
      examples: [
        { title: '可直接套用的模板', code: `import torch.nn as nn\ncriterion = nn.BCEWithLogitsLoss()\noptimizer = torch.optim.Adam(model.parameters(), lr=1e-3)\n\nfor epoch in range(20):\n    model.train()                        # 训练模式(Dropout/BN 生效)\n    for xb, yb in train_loader:\n        xb, yb = xb.to(device), yb.to(device)\n        optimizer.zero_grad()            # 1.清梯度\n        logits = model(xb)               # 2.前向\n        loss = criterion(logits.squeeze(-1), yb)  # 3.算损失\n        loss.backward()                  # 4.反向\n        optimizer.step()                 # 5.更新\n    print(epoch, loss.item())\n\n    model.eval()                         # 评估模式\n    with torch.no_grad():\n        for xb, yb in val_loader:\n            ...` },
      ],
      pitfalls: [
        '<b>zero_grad 在 backward 之前</b>，顺序错了梯度累积、loss 不降反升（最经典的 bug）。',
        '验证/测试前必须 <code>model.eval()</code> + <code>torch.no_grad()</code>，否则 Dropout 随机失活导致结果每次不一样。',
        '<code>loss.item()</code> 把张量转 Python 数字，直接累加 loss 张量会内存泄漏。',
        '学习率调度器：每个 batch step 一次（OneCycle）或每个 epoch scheduler.step()，别放错位置。',
      ],
      related: ['autograd', 'DataLoader', 'device'],
      tags: ['训练', 'optimizer', '模板'],
    },
    {
      name: 'save-load', sig: "torch.save(model.state_dict(), 'ckpt.pt') / model.load_state_dict(torch.load('ckpt.pt'))",
      brief: '模型保存与加载：推荐只存 state_dict（参数字典）。',
      examples: [
        { title: '', code: `# 保存(推荐): 只存参数\nmodel.to('cpu')\ntorch.save(model.state_dict(), 'model.pt')\n\n# 完整 checkpoint(恢复训练用):\ntorch.save({\n    'epoch': epoch,\n    'model_state': model.state_dict(),\n    'optimizer_state': optimizer.state_dict(),\n    'loss': loss,\n}, 'ckpt.pt')\n\n# 加载\nmodel = MLP(10)\nmodel.load_state_dict(torch.load('model.pt', map_location='cpu'))\nmodel.eval()` },
      ],
      pitfalls: [
        '存整个 model 对象（torch.save(model)）依赖类定义路径，换环境就挂 —— <b>state_dict 是标准做法</b>。',
        'load_state_dict 返回缺键报告，配合 <code>strict=False</code> 可加载部分层（迁移学习）。',
        '加载后记得 <code>model.eval()</code>，否则 Dropout 还开着。',
      ],
      related: ['nn.Module', 'device'],
      tags: ['保存', '加载', 'checkpoint'],
    },
    {
      name: '常见loss', sig: 'nn.MSELoss() / nn.CrossEntropyLoss() / nn.BCEWithLogitsLoss()',
      brief: '损失函数速查：回归、多分类、二分类各用什么。',
      params: [
        { n: 'MSELoss', t: '回归', d: '均方误差；L1Loss 更抗离群' },
        { n: 'CrossEntropyLoss', t: '多分类', d: '输入是<b>原始 logits</b>（不 softmax！），y 是类别索引（long）' },
        { n: 'BCEWithLogitsLoss', t: '二分类/多标签', d: '输入也是 logits，自带 sigmoid 数值更稳' },
      ],
      examples: [
        { title: '', code: `criterion = nn.CrossEntropyLoss()\nlogits = model(xb)          # (B, num_classes), 未 softmax\nloss = criterion(logits, yb) # yb 是 (B,) 的类别索引, dtype=long\n\n# 二分类\ncrit2 = nn.BCEWithLogitsLoss()\nloss2 = crit2(model(xb).squeeze(-1), yb.float())   # yb 要 float` },
      ],
      pitfalls: [
        '<b>CrossEntropyLoss 不要自己先 softmax</b>，它内部含 log_softmax，重复 softmax 训练不动。',
        'CrossEntropy 的标签是整数索引不是 one-hot，dtype 必须 long。',
        'BCE 系列标签必须是 float 且与输出形状一致，形状差一维报错最多。',
      ],
      related: ['train-loop', 'nn.Module'],
      tags: ['损失', 'crossentropy', 'bce'],
    },
  ],
});

MODULES.push({
  id: 'shap', name: 'shap', icon: '🔍', category: '深度学习与模型解释',
  doc: 'https://shap.readthedocs.io/en/latest/',
  desc: '基于博弈论的模型解释库：每个特征对每次预测贡献多少，全局+局部解释都行。',
  install: 'pip install shap',
  aliases: ['shapley'],
  tips: [
    '<b>选对 Explainer</b>：树模型（XGB/LGBM/RF）用 TreeExplainer（快），深度学习用 DeepExplainer/GradientExplainer，其他任意模型用 KernelExplainer（慢，只能抽样解释）。',
    'shap 值单位是<b>模型输出的尺度</b>：回归是预测值本身，分类是 log-odds（想看概率差异需另行换算）。',
  ],
  entries: [
    {
      name: 'TreeExplainer', sig: 'explainer = shap.TreeExplainer(model) / shap_values = explainer.shap_values(X)',
      brief: '树模型的 shap 值计算入口（最常用）。',
      params: [
        { n: 'model', t: '拟合好的模型', d: 'XGBClassifier、LGBMClassifier、RandomForest 等都支持' },
        { n: 'X', t: 'DataFrame', d: '要解释的样本，建议用测试集（几百到几千行）' },
      ],
      examples: [
        { title: '经典写法', code: `import shap\nexplainer = shap.TreeExplainer(model)\nshap_values = explainer.shap_values(X_test)   # (n_samples, n_features)\nprint(explainer.expected_value)               # 基准值 base value\n\n# 新版统一 API (推荐):\nexplainer2 = shap.Explainer(model)\nsv = explainer2(X_test)        # Explanation 对象\nprint(sv.values.shape)\nshap.plots.beeswarm(sv)` },
      ],
      pitfalls: [
        '<b>新版 XGBoost 二分类</b>的 shap_values 可能是 (n, f, 2) 三维（两个类别各一份），取 <code>[..., 1]</code> 或用新 API。',
        '解释用的 X 必须与训练时<b>相同的预处理</b>（缩放/编码之后的数据）。',
        '样本量大时 TreeExplainer 也慢，传 <code>shap.sample(X, 1000)</code>。',
      ],
      related: ['summary-plot', 'waterfall-force'],
      tags: ['解释', 'shap值', 'explainer'],
    },
    {
      name: 'summary-plot', sig: "shap.summary_plot(shap_values, X) / shap.plots.bar(sv)",
      brief: '全局重要性图：蜂群图（beeswarm）看重要性+方向，条形图看平均绝对值。',
      examples: [
        { title: '', code: `shap.summary_plot(shap_values, X_test)          # 蜂群图\n# 解读: 每行一个特征; 点越红该特征取值越高;\n#      点在右侧=推高预测\nshap.summary_plot(shap_values, X_test, plot_type='bar')  # 重要性条形\nshap.plots.bar(sv, max_display=12)              # 新API写法` },
      ],
      pitfalls: [
        '蜂群图颜色 = 特征值高低（红高蓝低），x 位置 = 对预测的推动方向；横轴刻度是 shap 值不是特征值。',
        'shap_values 与 X 的行必须一一对应，传反/错位图完全失真。',
        '中文特征名乱码先设 matplotlib 字体。',
      ],
      related: ['TreeExplainer', 'waterfall-force', 'dependence'],
      tags: ['重要性', '蜂群图', '全局解释'],
    },
    {
      name: 'waterfall-force', sig: 'shap.plots.waterfall(explanation[i]) / shap.force_plot(base_value, shap_values[i], X.iloc[i])',
      brief: '单样本局部解释：这个预测是怎么被各特征推上/推下的。',
      examples: [
        { title: '', code: `# 旧 API:\nshap.initjs()                                    # notebook 里必须先执行\nshap.force_plot(explainer.expected_value,\n                shap_values[0], X_test.iloc[0])\n\n# 新 API waterfall (更清晰):\nsv = explainer(X_test)\nshap.plots.waterfall(sv[0])   # 从 base value 到该样本预测值的全过程` },
      ],
      pitfalls: [
        'force_plot 在新版 JupyterLab 常白屏，改用 <code>shap.plots.force</code> 或直接用 waterfall。',
        'waterfall 的新 API 需要的是 <b>Explanation 对象</b>（explainer(X) 的返回值），传裸数组报错。',
      ],
      related: ['summary-plot', 'TreeExplainer'],
      tags: ['单样本', '局部解释', 'waterfall'],
    },
    {
      name: 'dependence', sig: "shap.dependence_plot('特征名', shap_values, X, interaction_index='auto')",
      brief: '单特征 shap 值散点图 + 自动找交互特征，看非线性关系。',
      examples: [
        { title: '', code: `shap.dependence_plot('年龄', shap_values, X_test)\n# 点的颜色是自动选出的交互特征\n# 新 API:\nshap.plots.scatter(sv[:, '年龄'], color=sv)` },
      ],
      pitfalls: [
        '特征名必须存在于 X 中（字符串完全匹配），从 DataFrame 取列时别多空格。',
        '看交互时先跑 summary_plot 再挑重要特征画 dependence，别全画。',
      ],
      related: ['summary-plot'],
      tags: ['依赖图', '交互', '非线性'],
    },
  ],
});

MODULES.push({
  id: 'torchsummary', name: 'torchsummary', icon: '📋', category: '深度学习与模型解释',
  doc: 'https://pypi.org/project/torchsummary/',
  desc: '打印 PyTorch 模型结构总览：每层输出形状、参数量，替代手算和 print(model)。',
  install: 'pip install torchsummary  (新项目推荐维护更活跃的 torchinfo)',
  aliases: ['summary', 'torchinfo'],
  entries: [
    {
      name: 'summary', sig: "summary(model, input_size=(3, 224, 224), device='cpu')",
      brief: '打印模型每层的输出形状与参数量（Keras 风格总览）。',
      params: [
        { n: 'model', t: 'nn.Module', d: '模型实例（不需要训练过）' },
        { n: 'input_size', t: 'tuple', d: '<b>不含 batch 维</b>的输入形状：CNN 传 (3, 224, 224)，全连接传 (10,)' },
        { n: 'device', t: 'str', d: "模型 .cuda() 后必须传 device='cuda'，否则报 device 不匹配", dflt: "'cpu'" },
      ],
      examples: [
        { title: '', code: `from torchsummary import summary\n\nmodel = MLP(in_dim=10)\nsummary(model, input_size=(10,))               # 全连接\nsummary(cnn, input_size=(3, 224, 224))         # CNN\nsummary(model.cuda(), (10,), device='cuda')    # GPU 模型\n# 输出: 每层名称/类型/输出形状/参数量 + Total params` },
      ],
      pitfalls: [
        '<b>input_size 不含 batch 维</b>！写成 (32, 3, 224, 224) 会让整张表的形状全错。',
        '模型在 GPU 上而 summary 不传 device="cuda"（或反过来）直接报错 —— 两者必须在同一设备。',
        '多输入模型传列表：<code>summary(model, [(3, 224, 224), (10,)])</code>（torchinfo 支持更完善）。',
      ],
      tags: ['模型结构', '参数量', '调试'],
    },
    {
      name: 'torchinfo', sig: 'from torchinfo import summary / summary(model, input_size=..., col_names=[...])',
      brief: 'torchsummary 的活跃维护分支，功能更全（新项目建议直接用它）。',
      examples: [
        { title: '', code: `# pip install torchinfo   (包名/导入名都不一样!)\nfrom torchinfo import summary\n\ninfo = summary(model,\n               input_size=(10,),\n               col_names=['input_size', 'output_size', 'num_params'],\n               depth=4)                 # 展开嵌套子模块\nprint(info)\nprint(info.total_params, info.trainable_params)   # 拿到数值` },
      ],
      pitfalls: [
        'pip 装的是 <code>torchinfo</code>；PyPI 上还有个 torch-summary 是另一个包，别装混。',
        'torchinfo 对 input_size 是否带 batch 的口径更宽松（可配合 batch_size= 参数），但一个项目内保持统一。',
      ],
      tags: ['模型结构', '参数量'],
    },
  ],
});
