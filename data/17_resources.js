/* Python 学习资源与案例站点（渲染在 #/learn 学习与案例页）
   定位：只收与 Python 直接相关、质量高且稳定的站点；
   通用网址（导航站/工具站/娱乐站）归独立的网页导航工具。 */
window.RESOURCES = window.RESOURCES || [];

RESOURCES.push({
  group: '📘 学习教程',
  sites: [
    { name: '菜鸟教程 Python3', url: 'https://www.runoob.com/python3/python3-tutorial.html',
      desc: '中文入门首选，例子多、可在线运行，忘了语法就来翻' },
    { name: 'Python 官方中文教程', url: 'https://docs.python.org/zh-cn/3/tutorial/',
      desc: '语言作者写的正统教程，最权威的"第一手资料"' },
    { name: '廖雪峰 Python 教程', url: 'https://www.liaoxuefeng.com/wiki/1016959663602405',
      desc: '中文系统教程，从安装到实战，讲解流畅' },
    { name: 'Real Python', url: 'https://realpython.com/',
      desc: '英文高质量教程站，某个库"讲得最透"的文章常出自这里' },
    { name: 'Python-100-Days', url: 'https://github.com/jackfrued/Python-100-Days',
      desc: 'GitHub 8万+ star 的中文学习路线，100 天从入门到进阶' },
  ],
});

RESOURCES.push({
  group: '🏆 案例与实战（业内普遍推荐）',
  sites: [
    { name: 'Kaggle', url: 'https://www.kaggle.com/',
      desc: '数据竞赛+数据集+公开 Notebook，数据案例的行业标准，看别人怎么完整做一道题' },
    { name: '阿里天池', url: 'https://tianchi.aliyun.com/',
      desc: '中文竞赛平台，新手赛多、业务场景贴近国内，配套教程完善' },
    { name: '和鲸社区 Heywhale', url: 'https://www.heywhale.com/home',
      desc: '中文 Notebook 案例社区，数据分析项目拆解多，可在线运行' },
    { name: 'Datawhale 开源课程', url: 'https://github.com/datawhalechina',
      desc: '中文开源组队学习：数据分析/机器学习教程质量高且全免费' },
    { name: 'Machine Learning Mastery', url: 'https://machinelearningmastery.com/',
      desc: '机器学习实战教程，每篇带完整可跑代码，业内公认的参考站' },
    { name: 'Python Data Science Handbook', url: 'https://jakevdp.github.io/PythonDataScienceHandbook/',
      desc: '免费在线《Python 数据科学手册》，NumPy/pandas/Matplotlib 最佳免费书之一' },
    { name: '动手学深度学习 (d2l)', url: 'https://zh.d2l.ai/',
      desc: '李沐《动手学深度学习》中文免费在线版，理论+可运行代码，深度学习入门公认教材' },
  ],
});

RESOURCES.push({
  group: '🎨 图表案例画廊（照着抄参数）',
  sites: [
    { name: 'Matplotlib 案例库', url: 'https://matplotlib.org/stable/gallery/index.html',
      desc: '官方 Gallery：想要什么图按图搜代码，直接抄改' },
    { name: 'Seaborn 官方案例', url: 'https://seaborn.pydata.org/examples/index.html',
      desc: '统计图示例集，带缩略图一眼选中想要的样式' },
    { name: 'pyecharts 图表库', url: 'https://gallery.pyecharts.org/',
      desc: '官方示例站：每张图配完整可运行的 Python 代码' },
    { name: 'ECharts 官方示例', url: 'https://echarts.apache.org/examples/zh/index.html',
      desc: 'pyecharts 底层就是 ECharts，这里有的配置都能对照翻译成 Python' },
  ],
});

RESOURCES.push({
  group: '📦 资源与生态',
  sites: [
    { name: 'PyPI', url: 'https://pypi.org/',
      desc: '所有第三方包的家，查包的最新版本/文档/源码入口' },
    { name: 'awesome-python', url: 'https://github.com/vinta/awesome-python',
      desc: '精选库大全：找轮子先来这里，按用途分类' },
    { name: 'GitHub Trending (Python)', url: 'https://github.com/trending/python',
      desc: '看 Python 圈最近在火什么项目' },
    { name: 'PEP 索引', url: 'https://peps.python.org/',
      desc: '语言设计提案：新特性（如模式匹配）的第一手出处' },
  ],
});

RESOURCES.push({
  group: '💬 问答与练习',
  sites: [
    { name: 'Stack Overflow', url: 'https://stackoverflow.com/questions/tagged/python',
      desc: '报错直接搜英文原文，命中率远高于中文' },
    { name: 'SegmentFault 思否', url: 'https://segmentfault.com/t/python',
      desc: '中文问答社区，配合搜索使用' },
    { name: 'LeetCode 中国', url: 'https://leetcode.cn/',
      desc: '算法练习，Python 题解资源丰富' },
    { name: 'pandas_exercises', url: 'https://github.com/guipsamora/pandas_exercises',
      desc: 'DataFrame 分级练习题，pandas 熟练度全靠练' },
    { name: 'Kaggle Learn', url: 'https://www.kaggle.com/learn',
      desc: '免费的数据科学微课，边学边在真实数据上练' },
  ],
});

RESOURCES.push({
  group: '📚 书籍推荐',
  sites: [
    { name: '《Python编程：从入门到实践》', author: 'Eric Matthes',
      url: 'https://www.douban.com/search?q=Python编程从入门到实践', stars: 5, level: '入门首选',
      desc: '公认最友好的入门书：半本语法讲透基础，半本带做三个实战项目，零基础照着敲完就能写程序。纸书需购买。' },
    { name: 'Automate the Boring Stuff with Python', author: 'Al Sweigart',
      url: 'https://automatetheboringstuff.com/', stars: 5, level: '免费正版',
      desc: '办公自动化神书，官方免费在线阅读：批量重命名、处理表格、爬虫、鼠标键盘自动化，和字典里的 pyautogui/openpyxl 完美互补。' },
    { name: '《Python Cookbook（第3版）》', author: 'David Beazley',
      url: 'https://python3-cookbook.readthedocs.io/zh-cn/latest/', stars: 5, level: '免费正版',
      desc: '中文版官方免费在线：全是可直接套用的代码配方，数据结构/函数/类/IO 一网打尽，进阶必读。' },
    { name: '《流畅的Python（第2版）》', author: 'Luciano Ramalho',
      url: 'https://www.douban.com/search?q=流畅的Python', stars: 5, level: '进阶神作',
      desc: '豆瓣 9.4：把语言设计讲透（魔法方法/装饰器/生成器），读完才算真正"懂" Python；有一定基础后读收获最大。纸书需购买。' },
    { name: '《Effective Python（第2版）》', author: 'Brett Slatkin',
      url: 'https://www.douban.com/search?q=Effective+Python', stars: 4, level: '习惯改造',
      desc: '90 条实战建议逐条讲透 WHY，适合写了一年代码后复盘纠偏。纸书需购买。' },
    { name: '《利用Python进行数据分析（第3版）》', author: 'Wes McKinney',
      url: 'https://wesmckinney.com/book/', stars: 5, level: '免费正版',
      desc: 'pandas 作者亲写的"正统教材"，NumPy/pandas 讲得最深正；第 3 版官方免费在线阅读，数据分析方向首选。' },
    { name: '《Python网络数据采集（第2版）》', author: 'Ryan Mitchell',
      url: 'https://www.douban.com/search?q=Python网络数据采集', stars: 4, level: '爬虫系统化',
      desc: '把字典里 requests/bs4/selenium 的散件知识串成完整方法论，含反爬与合规讨论。纸书需购买。' },
    { name: '《图解HTTP》', author: '上野宣',
      url: 'https://www.douban.com/search?q=图解HTTP', stars: 4, level: '爬虫前置',
      desc: '爬虫的本质是 HTTP：图解版两晚读完，报文/Cookie/缓存/HTTPS 一清二楚。纸书需购买。' },
    { name: '《机器学习（西瓜书）》', author: '周志华',
      url: 'https://datawhalechina.github.io/pumpkin-book/', stars: 5, level: 'ML理论主线',
      desc: '国内机器学习教材标杆；公式看不懂配 Datawhale《南瓜书》免费在线逐章推导（链接即南瓜书）。' },
    { name: '《统计学习方法（第2版）》', author: '李航',
      url: 'https://www.douban.com/search?q=统计学习方法+李航', stars: 4, level: 'ML理论进阶',
      desc: '短小精悍的算法推导经典，与西瓜书互补；配套课件网上可搜到。纸书需购买。' },
  ],
});
