/* 环境管理速查：venv / pip / uv / conda（「速查」分类） */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'envmgmt', name: '环境管理速查', icon: '🛠️', category: '速查',
  doc: 'https://docs.python.org/zh-cn/3/library/venv.html',
  desc: '虚拟环境与包管理：建环境、装包、导依赖、换源；每个项目一个环境，互不打架。',
  install: false,
  aliases: ['venv', 'pip', 'uv', 'conda', '虚拟环境', '换源', '依赖'],
  tips: [
    '黄金法则：<b>一个项目一个 .venv</b>，别往全局 Python 里装包；换电脑 = requirements.txt + 一条命令复原。',
    '装包慢/超时先换国内源：<code>pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple</code> 一次设置永久生效。',
  ],
  entries: [
    {
      name: 'venv', sig: "python -m venv .venv → 激活 → deactivate",
      brief: '标准库虚拟环境：建、激活、退出。',
      examples: [
        { title: '', code: `python -m venv .venv                 # 在项目根建环境(只需一次)\n\n# 激活 —— 三种终端命令不同:\n.venv\\Scripts\\activate               # cmd\n.venv\\Scripts\\Activate.ps1           # PowerShell\nsource .venv/Scripts/activate        # Git Bash\n\npip install pandas                    # 激活后装的就是这个环境的\npython train.py                       # 运行也用这个环境的 python\ndeactivate                            # 退出环境` },
      ],
      pitfalls: [
        '激活成功看提示符前的 <b>(.venv)</b> 前缀；不确定就用 <code>python -c "import sys; print(sys.executable)"</code> 看当前是哪个 python。',
        'PowerShell 激活报"禁止运行脚本"：<code>Set-ExecutionPolicy -Scope CurrentUser RemoteSigned</code> 放开(一次性)。',
        '拷贝项目到别的机器要重建：<code>python -m venv .venv</code> + 装依赖，.venv 文件夹本身不要拷贝(路径写死了)。',
      ],
      related: ['pip'],
      tags: ['虚拟环境', 'venv', '隔离'],
    },
    {
      name: 'pip', sig: "pip install 包 / pip install -r requirements.txt / pip freeze > requirements.txt",
      brief: '包管理主力：装、卸、导依赖、查过期。',
      examples: [
        { title: '', code: `pip install pandas                    # 装最新\npip install "numpy<2"                 # 装指定版本范围\npip install -r requirements.txt       # 按清单装(复现环境)\n\npip freeze > requirements.txt         # 导出当前环境全部依赖\npip list --outdated                   # 看哪些包有新版\npip uninstall pandas                  # 卸载\npip cache purge                       # 清下载缓存(磁盘紧张时)` },
      ],
      pitfalls: [
        '在哪个环境跑 pip 就装到哪：系统里多 python 时用 <code>python -m pip install</code> 最稳，保证装到当前 python。',
        'freeze 导出的是"全部依赖展开"，只想要自己装的那几个用 <code>pip install pipreqs</code> 后 <code>pipreqs ./</code> 按代码扫描。',
        'Windows 下 freeze 出的清单可能带 <code>@ file:///</code> 本地路径，拿到 Linux 会装失败，手工删掉 @ 后面部分。',
      ],
      related: ['venv', 'uv'],
      tags: ['pip', '安装', 'requirements'],
    },
    {
      name: 'uv', sig: "uv venv / uv pip install 包 / uv add 包",
      brief: 'Rust 写的新一代工具：pip/venv 的超高速替代。',
      examples: [
        { title: '', code: `pip install uv                        # 先装 uv 本身\n\nuv venv                               # 建环境(.venv), 秒级\nuv pip install pandas polars          # 装包, 比 pip 快 10~100 倍\nuv pip install -r requirements.txt    # 兼容 pip 用法\n\n# 项目模式(自动管理依赖到 pyproject.toml):\nuv init                               # 初始化项目\nuv add requests                       # 加依赖并写锁文件\nuv run python train.py                # 在项目环境里运行` },
      ],
      pitfalls: [
        'uv 下载快是因为有全局缓存+并行下载，第一次装某包依然要走网络，别和 pip 的速度搞混。',
        '团队协作约定好要么全 uv 要么全 pip：uv.lock 与 requirements.txt 并存时容易装出不同版本。',
      ],
      related: ['pip', 'venv'],
      tags: ['uv', '提速', '现代工具'],
    },
    {
      name: 'conda', sig: "conda create -n 环境名 python=3.12 / conda activate 环境名 / conda env list",
      brief: '科学计算常用：环境与 Python 版本一起管。',
      examples: [
        { title: '', code: `conda create -n xrf python=3.12       # 建环境并指定 python 版本\nconda activate xrf                    # 激活(cmd/PowerShell/Win 终端通用)\nconda install numpy matplotlib        # conda 源装包(二进制, 不用编译)\nconda list                            # 看装了什么\nconda env export > env.yml            # 导出环境\nconda env remove -n xrf               # 删环境\nconda deactivate                      # 退出` },
      ],
      pitfalls: [
        '<b>conda 与 pip 混装的坑</b>：先用 conda 装能装的(numpy/scipy 等)，再用 pip 补 conda 源没有的；同一个包两边来回装卸最容易把环境搞坏。',
        'conda 和 venv 环境不通用：.venv 是 venv 建的就用 pip 装，别在 conda 环境里 pip install -r 混着来。',
        'PyTorch 等 GPU 包优先按官方命令装(conda 或 pip 带索引地址)，conda 默认源的版本经常滞后。',
      ],
      related: ['venv', 'pip'],
      tags: ['conda', '环境', '科学计算'],
    },
  ],
});
