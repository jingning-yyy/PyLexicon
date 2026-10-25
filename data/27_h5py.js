/* h5py：HDF5 科研数据读写（NeXus 底层格式） */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'h5py', name: 'h5py', icon: '🧊', category: 'X 射线工具',
  doc: 'https://docs.h5py.org/en/stable/',
  desc: '读写 HDF5 科学数据文件：层级结构、超大数组切片读写、元数据；NeXus(.nxs) 底层就是它。',
  install: 'pip install h5py',
  aliases: ['HDF5', 'NeXus', 'nxs', 'h5'],
  tips: [
    '同步辐射线站的 NeXus 文件(/entry/instrument/detector 结构)就是 HDF5，直接用 h5py 打开浏览。',
    '大数组<b>永远切片读</b>，h5py 只把要的那段载入内存，这是它比 np.save 适合大数据的根本原因。',
  ],
  entries: [
    {
      name: 'file-open', sig: "h5py.File('data.h5', 'r'/'w'/'a') / with h5py.File(...) as f:",
      brief: '打开/创建 HDF5 文件；模式与 open 类似但行为有差异。',
      examples: [
        { title: '', code: `import h5py\n\nwith h5py.File('scan_001.h5', 'r') as f:      # 读(只读最安全)\n    print(list(f.keys()))                     # 顶层有哪些组\n\nwith h5py.File('out.h5', 'w') as f:           # 新建(清空已有文件!)\n    pass\nwith h5py.File('out.h5', 'a') as f:           # 追加/修改\n    pass` },
      ],
      pitfalls: [
        "<b>'w' 一打开就清空整个文件</b>；想「不存在才新建」用 'w-'，读文件永远用 'r'。",
        'Windows 下文件被 h5py 句柄占住时删不掉：确保 File 已 close(with 块最稳)；程序崩溃残留锁要重启 Python。',
        'pandas 的 <code>to_hdf</code> 走的是 PyTables，与 h5py 写的文件键结构不同，但都是标准 HDF5，可互读。',
      ],
      related: ['dataset-group', '切片读写'],
      tags: ['HDF5', 'NeXus', '科研数据'],
    },
    {
      name: 'dataset-group', sig: "f.create_dataset('名字', data=数组) / f.create_group('目录') / f['/路径/名字']",
      brief: '建数据集与分组；层级像文件系统，用 / 路径访问。',
      examples: [
        { title: '', code: `import h5py, numpy as np\n\nwith h5py.File('out.h5', 'w') as f:\n    g = f.create_group('scan01')              # 相当于建目录\n    g.create_dataset('spectrum', data=np.arange(1000))\n    f['scan01/meta'].create_dataset('energy', data=[10.0, 10.5])\n\n# 读取: 路径直达\nwith h5py.File('out.h5', 'r') as f:\n    d = f['/scan01/spectrum']\n    print(d.shape, d.dtype)` },
      ],
      pitfalls: [
        'dataset 一经创建<b>形状不能变</b>，要追加数据就在创建时给 maxshape 并开 chunks，或一次写对。',
        '组名/路径写错不报 KeyError 之外的提示，先 <code>list(f.keys())</code> 或用 h5dump/h5ls 命令看结构。',
      ],
      related: ['file-open', '切片读写'],
      tags: ['数据集', '分组', '层级'],
    },
    {
      name: '切片读写', sig: "dset[0:1000] / dset[()] / dset[10:20, :] = 值",
      brief: '按切片读写大数组：只加载需要的那段，不全进内存。',
      examples: [
        { title: '', code: `import h5py, numpy as np\n\nwith h5py.File('big.h5', 'r') as f:\n    d = f['/scan01/spectrum']\n    part = d[100:200]          # 只读 100 个点, 内存友好\n    last = d[-1]               # 单个元素\n    whole = d[()]              # 全部读出(确认数组不大再用)\n\nwith h5py.File('big.h5', 'a') as f:\n    f['/scan01/spectrum'][0:10] = np.zeros(10)   # 切片写回` },
      ],
      pitfalls: [
        '<code>d[()]</code> 是全部读入，几 GB 的数据集直接撑爆内存；先 <code>d.shape</code> 看大小。',
        '读取返回的是 numpy 数组副本，改它不影响文件；写回要用切片赋值。',
      ],
      related: ['dataset-group', 'file-open'],
      tags: ['切片', '大文件', '内存'],
    },
    {
      name: 'attrs-压缩', sig: "dset.attrs['单位'] = 'keV' / f.create_dataset(..., compression='gzip')",
      brief: '元数据属性与透明压缩：给数据贴标签、省磁盘。',
      examples: [
        { title: '', code: `import h5py, numpy as np\n\nwith h5py.File('out.h5', 'w') as f:\n    d = f.create_dataset('scan01/spectrum', data=np.random.rand(100000),\n                         compression='gzip', compression_opts=4)   # 创建时指定\n    d.attrs['energy_start'] = 10.0\n    d.attrs['energy_stop'] = 22.0\n    d.attrs['units'] = 'keV'\n\nwith h5py.File('out.h5', 'r') as f:\n    print(dict(f['scan01/spectrum'].attrs))    # 读属性` },
      ],
      pitfalls: [
        '压缩要在 <b>create_dataset 时</b>声明，事后没法补；gzip 压缩读的时候透明解压，代码不用改。',
        'attrs 的值不能是嵌套 dict/list 混合结构，复杂元数据存成字符串 JSON 或单独 dataset。',
      ],
      related: ['dataset-group', '切片读写'],
      tags: ['元数据', '压缩', 'attrs'],
    },
  ],
});
