/* 压缩包处理：zipfile / tarfile 速查（「速查」分类） */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'zipfile', name: '压缩包处理', icon: '🗜️', category: '速查',
  doc: 'https://docs.python.org/zh-cn/3/library/zipfile.html',
  desc: 'zip/tar.gz 读写：只解压指定文件、从内存打包、密码包与中文乱码处理。',
  install: false,
  aliases: ['压缩', '解压', 'zip', 'tar', 'gz', '打包'],
  tips: [
    '只要"把整个文件夹压成包"不挑格式，<b>shutil.make_archive 一行搞定</b>；要挑文件、要内存打包才用 zipfile。',
    'rar 和 7z 格式标准库不支持，装 <code>py7zr</code>(7z) 或调系统命令(unrar)。',
  ],
  entries: [
    {
      name: 'zip-read', sig: "zipfile.ZipFile('a.zip') / zf.namelist() / zf.read('内文件') / zf.extractall(目录)",
      brief: '读 zip：看清单、只读某个文件、整体解压。',
      examples: [
        { title: '', code: `import zipfile\n\nwith zipfile.ZipFile('data.zip') as zf:\n    print(zf.namelist())                 # 包内文件清单\n\n    txt = zf.read('logs/run.log').decode('utf-8')   # 只读一个, 不解压全部\n\n    zf.extract('logs/run.log', 'out')    # 只解压指定文件到 out/\n    zf.extractall('out2')                # 全部解压` },
      ],
      pitfalls: [
        '解压前先 <code>namelist()</code> 看一眼：解压不可信的包有路径穿越风险，Python 3.12+ 建议用数据过滤(见 tar 条目)。',
        '<code>read()</code> 返回 bytes，文本要自己 decode；文本文件直接读出来是 b\' 开头别当 str 用。',
      ],
      related: ['zip-write', 'tar-gz'],
      tags: ['zip', '解压', '读取'],
    },
    {
      name: 'zip-write', sig: "ZipFile('a.zip', 'w', compression=ZIP_DEFLATED) / zf.write(文件, arcname=) / zf.writestr(名字, bytes)",
      brief: '写/追加 zip：控制包内路径、压缩算法、内存直接打包。',
      examples: [
        { title: '', code: `import zipfile\n\nwith zipfile.ZipFile('out.zip', 'w', zipfile.ZIP_DEFLATED) as zf:  # DEFLATED 才真压缩\n    zf.write('result.csv', arcname='数据/result.csv')   # arcname 控制包内路径\n    zf.write('config.ini')                              # 默认放包根\n    zf.writestr('备注.txt', '生成于 2026-09-09'.encode('utf-8'))  # 内存内容直接进包\n\nwith zipfile.ZipFile('out.zip', 'a') as zf:            # 追加模式\n    zf.write('extra.log')` },
      ],
      pitfalls: [
        '不指定 <code>compression=ZIP_DEFLATED</code> 默认只存储不压缩，文件一点不小。',
        '<code>write()</code> 不会递归进子文件夹；整目录打包用 shutil.make_archive 或自己 os.walk 循环 write。',
        "包内中文文件名给 Windows 自带解压用时，老软件可能乱码（历史编码问题），跨平台分发建议文件名用英文。",
      ],
      related: ['zip-read', 'tar-gz'],
      tags: ['zip', '打包', '压缩'],
    },
    {
      name: 'tar-gz', sig: "tarfile.open('x.tar.gz', 'r:gz') / tf.getnames() / tf.extractall(path, filter='data')",
      brief: 'Linux 世界最常见的 tar.gz：解包与打包。',
      examples: [
        { title: '', code: `import tarfile\n\nwith tarfile.open('backup.tar.gz', 'r:gz') as tf:\n    print(tf.getnames())\n    tf.extract('run.log', 'out')                    # 只解一个\n    tf.extractall('out2', filter='data')            # 全解, 3.12+ 建议带 filter\n\nwith tarfile.new('out.tar.gz', 'w:gz') as tf:       # 打包\n    tf.add('result.csv')\n    tf.add('logs', arcname='logs')                  # 目录会递归(与 zip 不同)` },
      ],
      pitfalls: [
        'Python 3.12 起 <code>extractall()</code> 不带 filter 会发 FutureWarning；<b>filter="data"</b> 能防路径穿越/设备文件等安全问题，处理外来包必带。',
        "'r:gz' 与 'r:*' 的区别：前者只认 gzip，后者自动识别 tar.bz2/tar.xz，通用脚本用 'r:*'。",
      ],
      related: ['zip-read', 'zip-write'],
      tags: ['tar', 'gz', 'Linux'],
    },
    {
      name: '密码与乱码', sig: "ZipFile('a.zip').read(名字, pwd=b'密码') / 文件名.encode('cp437').decode('gbk')",
      brief: '带密码的 zip 与中文文件名乱码修复。',
      examples: [
        { title: '', code: `import zipfile\n\n# 传统 ZipCrypto 加密的 zip\nwith zipfile.ZipFile('secret.zip') as zf:\n    data = zf.read('doc.txt', pwd=b'123456')       # pwd 必须是 bytes\n\n# 中文文件名乱码(Windows 压缩包常见): 名字被按 cp437 解码了\nwith zipfile.ZipFile('cn.zip') as zf:\n    for info in zf.infolist():\n        try:\n            name = info.filename.encode('cp437').decode('gbk')\n        except (UnicodeDecodeError, UnicodeEncodeError):\n            name = info.filename                    # 本来就是 UTF-8 的不动\n        print(name)` },
      ],
      pitfalls: [
        '<b>zipfile 只支持传统 ZipCrypto 加密</b>；WinRAR/7-Zip 新版默认的 AES 加密 zip 解不了，改用 py7zr 或让对面用 ZipCrypto。',
        '乱码修复先试 cp437→gbk，不对再试 cp437→utf-8；Python 3.11+ 也可 <code>metadata_encoding="gbk"</code>(打开时指定)。',
      ],
      related: ['zip-read', 'zip-write'],
      tags: ['密码', '乱码', '中文文件名'],
    },
  ],
});
