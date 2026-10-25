/* 速查：linux / git */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'linux', name: 'Linux 速查', icon: '🐧', category: '速查',
  doc: 'https://wangdoc.com/linux/',
  desc: '服务器常用命令：远程登录、文件查找、文本处理、权限压缩、后台运行、定时任务。',
  install: false,
  aliases: ['命令行', 'shell', 'bash', 'ssh', '服务器'],
  tips: [
    '服务器上跑长任务用 <b>tmux/nohup</b>，断开 SSH 不中断；定时用 crontab（字典 schedule 条目是 Python 版）。',
    'Windows 下这些命令在 PowerShell 里部分可用，完整体验建议 WSL 或 Git Bash。',
  ],
  entries: [
    {
      name: 'ssh-scp', sig: 'ssh user@host / scp 本地文件 user@host:/远程路径',
      brief: '远程登录与文件传输；配密钥免密；-X 转发图形界面。',
      examples: [
        { title: '', code: `ssh user@192.168.1.10               # 登录\nssh -X user@host                     # 带图形转发(服务器上 silx view 可弹窗)\nscp data.csv user@host:/home/me/     # 上传\nscp user@host:/out/result.zip ./     # 下载\n\n# 免密登录(一次性配置):\nssh-keygen                           # 一路回车生成密钥\nssh-copy-id user@host                # 把公钥装到服务器` },
      ],
      pitfalls: [
        '配了密钥还要密码：检查服务器 ~/.ssh 权限（.ssh 700、authorized_keys 600）。',
        'Windows 10+ 自带 OpenSSH 客户端，PowerShell 直接 ssh/scp 可用。',
      ],
      related: [],
      tags: ['ssh', '远程', '传输'],
    },
    {
      name: 'find-grep', sig: 'find . -name "*.csv" / grep -rn "关键字" ./',
      brief: '按名字找文件、按内容搜文本、看磁盘占用。',
      examples: [
        { title: '', code: `find . -name '*.csv'                 # 当前目录递归找 csv\nfind /data -name '*.raw' -mtime -1   # 最近1天修改的文件\ngrep -rn '异常退出' ./logs           # 递归搜文件内容(-n 带行号)\n\ndu -sh *                             # 各目录占用大小(排序加 | sort -h)\ndf -h                                # 磁盘剩余空间` },
      ],
      pitfalls: [
        'grep 搜中文正常，但 Windows 记事本存的 UTF-8 BOM 文件首行会带隐藏字符。',
        'find 结果接 -exec 可直接批量操作：find . -name "*.tmp" -delete。',
      ],
      related: [],
      tags: ['查找', '搜索', '磁盘'],
    },
    {
      name: '文本三件套', sig: 'cat / less / head -n / tail -f / wc -l / awk \'{print $1}\'',
      brief: '看文件、追日志、取列、计数的最小命令集。',
      examples: [
        { title: '', code: `head -20 big.log             # 前 20 行\ntail -f app.log              # 实时追踪日志(排查神器)\nwc -l data.csv               # 行数\nawk '{print $1, $3}' a.txt   # 取第1、3列\nsort u.txt | uniq -c | sort -rn   # 频数统计降序` },
      ],
      pitfalls: [
        '大文件永远用 less/head 看，别 cat 全量刷屏。',
        'awk 默认按空白分列；分隔符不同的用 -F"," 指定。',
      ],
      related: [],
      tags: ['日志', '文本', '统计'],
    },
    {
      name: '权限与压缩', sig: 'chmod +x run.sh / tar -czvf pack.tar.gz dir/',
      brief: '执行权限、权限数字、打包与解压。',
      examples: [
        { title: '', code: `chmod +x run.sh              # 加执行权限(不然 ./run.sh 不行)\nchmod 644 a.txt              # rw-r--r--\ntar -czvf pack.tar.gz dir/   # 打包压缩\ntar -xzvf pack.tar.gz        # 解压\nunzip pack.zip -d out/       # zip 解压到 out/` },
      ],
      pitfalls: [
        '<b>Windows 下载的脚本没有执行权限</b>是常态，chmod +x 一下。',
        'zip 跨系统中文文件名易乱码，跨平台打包用 tar.gz。',
      ],
      related: [],
      tags: ['权限', 'tar', '压缩'],
    },
    {
      name: '后台运行', sig: 'nohup python job.py > job.log 2>&1 & / tmux new -s job',
      brief: '让任务在断开 SSH 后继续运行。',
      examples: [
        { title: 'nohup 方式', code: `nohup python job.py > job.log 2>&1 &   # 后台跑, 输出全进 job.log\njobs                                   # 看当前后台任务\nkill %1                                # 结束 1 号任务` },
        { title: 'tmux 方式(推荐, 断线可恢复)', code: `tmux new -s job          # 新建名为 job 的会话\npython long_task.py      # 在里面正常跑\n# Ctrl+B 再按 D 脱离(任务继续)\ntmux attach -t job       # 随时回来\ntmux kill-session -t job # 结束` },
      ],
      pitfalls: [
        '<b>nohup 的任务断线后仍在跑，但你回不去了</b>，只能看日志；tmux 能"回到现场"。',
        '确认任务还活着：ps aux | grep job.py。',
      ],
      related: [],
      tags: ['后台', 'nohup', 'tmux'],
    },
    {
      name: '系统监控', sig: 'top / htop / df -h / free -h / ps aux | grep 名 / kill PID',
      brief: '看负载、磁盘、内存、找进程杀进程——服务器巡检四件套。',
      examples: [
        { title: '', code: `top                        # 实时负载(Press 1 看每核, q 退出); 装了 htop 更好用\ndf -h                      # 各磁盘剩余空间(满了服务先挂)\nfree -h                    # 内存占用(-h 人类可读单位)\nps aux | grep python       # 找 python 进程 PID\nkill 12345                 # 温和终止; 杀不掉再 kill -9 12345\nuptime                     # 开机多久 + 1/5/15 分钟负载` },
      ],
      pitfalls: [
        '判断负载看 <b>load 平均值 vs CPU 核数</b>：4 核机器 load 常年 >4 就是过载；单核飙高先 ps 找是谁。',
        '磁盘 100% 时连日志都写不进：先 <code>du -sh /var/log/* | sort -h</code> 找大文件，别急着重启。',
        'kill -9 是强杀(进程没机会保存)，数据类进程先普通 kill 等几秒不行再加 -9。',
      ],
      related: ['后台运行', 'find-grep'],
      tags: ['top', 'df', '内存', '进程'],
    },
    {
      name: 'crontab', sig: 'crontab -e    # 30 9 * * * /usr/bin/python3 /opt/job.py',
      brief: '系统级定时任务：到点自动执行脚本。',
      examples: [
        { title: '', code: `crontab -e\n# 每天 9:30 跑(分 时 日 月 周):\n30 9 * * * /usr/bin/python3 /opt/job.py >> /opt/job.log 2>&1\n# 每 10 分钟:\n*/10 * * * * /opt/job.py\ncrontab -l      # 查看已有任务` },
      ],
      pitfalls: [
        'cron 的 PATH 极短且<b>不加载你的环境</b>，python 用绝对路径（which python3 查）。',
        '任务输出不重定向的话会被丢进邮件，务必 >> 日志 2>&1。',
        '服务器时区可能不是北京时间，date 命令确认后再定时间。',
      ],
      related: [],
      tags: ['定时', 'cron', '服务器'],
    },
  ],
});

MODULES.push({
  id: 'git', name: 'Git 速查', icon: '🌱', category: '速查',
  doc: 'https://git-scm.com/book/zh/v2',
  desc: '版本控制最小集：提交、分支、撤销、远程协作，够日常个人项目使用。',
  install: false,
  aliases: ['版本控制', 'github'],
  tips: [
    '先配身份：git config --global user.name / user.email。',
    '改动只在你电脑上，<b>push 之后才到远程</b>；每次 push 前先 status 看一眼。',
  ],
  entries: [
    {
      name: '基础工作流', sig: 'git status / git add . / git commit -m "说明"',
      brief: '查看改动 → 暂存 → 提交 的日常循环。',
      examples: [
        { title: '', code: `git status                  # 哪些文件改了/加了\ngit add .                   # 全部暂存(或 git add 指定文件)\ngit commit -m "完成数据清洗"\ngit log --oneline           # 一行式历史\n\necho '__pycache__/' >> .gitignore   # 忽略不想提交的文件` },
      ],
      pitfalls: [
        '新建仓库先 <code>git init</code>；克隆下来的不用。',
        'commit 了一次还想补文件：改完 <code>git add</code> 后 <code>git commit --amend --no-edit</code> 追加进上次提交。',
      ],
      related: ['分支'],
      tags: ['提交', '基础'],
    },
    {
      name: '分支', sig: 'git switch -c feature-x / git merge feature-x',
      brief: '开分支开发，完成后合并回主线。',
      examples: [
        { title: '', code: `git switch -c feature-x     # 新建并切换到分支\ngit add . && git commit -m "功能"\ngit switch main             # 回主线\ngit merge feature-x         # 合并\n\ngit branch -d feature-x     # 删分支\ngit branch -a               # 看所有分支` },
      ],
      pitfalls: [
        '合并报 CONFLICT：文件里搜 <<<<<<< 标记，手工保留正确内容后 add + commit。',
        '实验性想法就开分支，main 永远保持能跑。',
      ],
      related: ['基础工作流'],
      tags: ['分支', '合并', '冲突'],
    },
    {
      name: '撤销与回退', sig: 'git restore a.py / git reset --soft HEAD~1 / git revert <hash>',
      brief: '三层撤销：工作区、暂存区、已提交。',
      examples: [
        { title: '', code: `git restore a.py               # 丢弃工作区未暂存的修改(不可恢复!)\ngit restore --staged a.py      # 取消暂存(文件内容保留)\ngit reset --soft HEAD~1        # 撤销上次 commit, 改动保留在暂存\ngit revert <hash>              # 用一个反向提交抵消某次提交(已推送时用)` },
      ],
      pitfalls: [
        '<b>restore 丢弃的修改找不回来</b>；reset --hard 会连提交带改动全删，新手远离。',
        '已经 push 的提交用 revert（安全），不要 reset 后强推。',
      ],
      related: ['基础工作流'],
      tags: ['撤销', '回退'],
    },
    {
      name: 'stash', sig: 'git stash / git stash pop / git stash list / git stash apply',
      brief: '临时收纳改动：写到一半要切分支/拉代码，先塞抽屉。',
      examples: [
        { title: '', code: `git stash                 # 当前未提交改动全部收起, 工作区变干净\ngit stash list            # 看抽屉里有什么: stash@{0}, stash@{1}...\ngit stash pop             # 取回最近一次(并从抽屉删除)\ngit stash apply stash@{1} # 取指定某次但保留在抽屉\n\ngit stash -u              # 连新建的未跟踪文件一起收(默认只收已跟踪)` },
      ],
      pitfalls: [
        '<b>stash 不收未跟踪的新文件</b>，切分支它们还裸露在工作区——加 -u 才连新文件一起收。',
        'pop 时如果目标分支同位置也有改动会冲突：先解决冲突再 <code>git stash drop</code> 手动清。',
        'stash 是栈不是分支，长期不取会忘；写完代码该 commit 就 commit，stash 只当临时抽屉。',
      ],
      related: ['撤销与回退', '分支'],
      tags: ['stash', '暂存', '切分支'],
    },
    {
      name: '远程协作', sig: 'git clone URL / git pull --rebase / git push -u origin main',
      brief: '克隆、拉取、推送，与 GitHub/Gitee 配合。',
      examples: [
        { title: '', code: `git clone https://github.com/user/repo.git\ngit remote -v                # 查看远程\n\ngit pull --rebase            # 拉取并把本地提交放到最前(历史干净)\ngit push -u origin main      # 首次推送并建立跟踪\ngit push                     # 之后直接推` },
      ],
      pitfalls: [
        'push 被拒(rejected)：远程有新提交，先 <code>pull --rebase</code> 再推。',
        'HTTPS 推送要令牌不是密码（GitHub 已强制）；用 SSH 密钥一劳永逸。',
      ],
      related: ['基础工作流'],
      tags: ['远程', 'github', 'push'],
    },
  ],
});
