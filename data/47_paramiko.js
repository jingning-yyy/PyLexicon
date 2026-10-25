/* paramiko：SSH/SFTP 自动化（服务器批量操作） */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'paramiko', name: 'paramiko', icon: '🔐', category: '自动化与效率',
  doc: 'https://docs.paramiko.org/',
  desc: 'Python 里的 SSH 客户端：远程执行命令、SFTP 上传下载、批量巡检多台服务器；Linux 速查里 ssh/scp 的代码版。',
  install: 'pip install paramiko',
  aliases: ['ssh', 'sftp', '远程', '服务器', 'scp'],
  tips: [
    '选型：偶尔传文件直接 ssh/scp 命令；<b>批量、定时、要把输出接进 Python 逻辑</b>时用 paramiko。',
    '生产环境优先用密钥登录（key_filename），密码方式仅限内网工具脚本。',
  ],
  entries: [
    {
      name: 'ssh-exec', sig: "SSHClient() -> set_missing_host_key_policy(AutoAddPolicy) -> connect(...) -> exec_command('ls')",
      brief: '连接服务器并执行命令，取回输出。',
      examples: [
        { title: '', code: `import paramiko\n\nclient = paramiko.SSHClient()\nclient.set_missing_host_key_policy(paramiko.AutoAddPolicy())  # 跳过首次确认\nclient.connect('192.168.1.10', username='me', password='***',\n               timeout=10)\n\nstdin, stdout, stderr = client.exec_command('df -h /data')\nprint(stdout.read().decode('utf-8'))       # 标准输出\nerr = stderr.read().decode('utf-8')        # 报错别丢\nif err:\n    print('ERR:', err)\n\nclient.close()                              # 用完关连接` },
      ],
      pitfalls: [
        '<b>每次 exec_command 都是独立会话</b>，上一条 cd 下一条不延续：写进同一条 <code>"cd /data &amp;&amp; python run.py"</code>。',
        'AutoAddPolicy 等于跳过 host key 校验，仅限内网/自家机器；生产用 <code>load_system_host_keys()</code>。',
        '必须 close()（try/finally 包住），泄漏的连接会占满服务器 sshd 会话数。',
      ],
      related: ['sftp上传下载', '密钥与批量'],
      tags: ['ssh', '远程执行', '服务器'],
    },
    {
      name: 'sftp上传下载', sig: "sftp = client.open_sftp() / sftp.put(本地, 远程) / sftp.get(远程, 本地) / sftp.listdir_attr(目录)",
      brief: 'SFTP 传文件：单个、批量、看远程目录。',
      examples: [
        { title: '', code: `import paramiko, os\n\nclient = paramiko.SSHClient()\nclient.set_missing_host_key_policy(paramiko.AutoAddPolicy())\nclient.connect('192.168.1.10', username='me', key_filename='id_rsa')\nsftp = client.open_sftp()\n\nsftp.put('result.csv', '/data/result.csv')      # 上传\nsftp.get('/data/result.csv', 'back.csv')        # 下载\n\n# 进度回调(大文件):\ndef prog(sent, total):\n    print(f'\\r{sent/total:.0%}', end='')\nsftp.put('big.zip', '/tmp/big.zip', callback=prog)\n\n# 远程目录列表(带大小/时间):\nfor f in sftp.listdir_attr('/data'):\n    print(f.filename, f.st_size, f.st_mtime)\n\nsftp.close(); client.close()` },
      ],
      pitfalls: [
        'put/get <b>不递归目录</b>：整个文件夹要自己 os.walk 逐个 put，并先在远程建好目录（sftp.mkdir）。',
        'Windows 本地路径反斜杠照常写，<b>远程路径永远是正斜杠</b>。',
        '判"远程文件传完了没"看 sftp.stat(远程路径).st_size 和本地大小是否一致——大文件中断不会报错到你预期的那样。',
      ],
      related: ['ssh-exec', '密钥与批量'],
      tags: ['sftp', '上传', '下载', '传输'],
    },
    {
      name: '密钥与批量', sig: "connect(key_filename='id_rsa', passphrase=) / for host in 列表: 循环执行",
      brief: '密钥免密登录 + 多台服务器批量巡检。',
      examples: [
        { title: '', code: `import paramiko\n\nHOSTS = [\n    ('192.168.1.10', 'me'),\n    ('192.168.1.11', 'me'),\n]\nCMDS = ['df -h /data', 'free -m', 'uptime']\n\nfor host, user in HOSTS:\n    client = paramiko.SSHClient()\n    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())\n    try:\n        client.connect(host, username=user,\n                       key_filename='C:/keys/id_rsa',   # 私钥文件\n                       timeout=8)\n        for cmd in CMDS:\n            _, out, err = client.exec_command(cmd, timeout=15)\n            print(f'== {host} $ {cmd}')\n            print(out.read().decode())\n    except Exception as e:\n        print(host, '连接失败:', e)\n    finally:\n        client.close()` },
      ],
      pitfalls: [
        'Permission denied 三连查：用户名对不对、私钥和服务器 authorized_keys 是不是一对、远程 <code>~/.ssh</code> 权限（700/600）。',
        '<b>timeout 参数一定要给</b>，否则某台机器网络不通会卡死整个批量脚本。',
        '密钥带口令用 passphrase 参数；私钥别提交进代码库，路径写在配置或环境变量里。',
      ],
      related: ['ssh-exec', 'sftp上传下载'],
      tags: ['密钥', '批量', '巡检'],
    },
  ],
});
