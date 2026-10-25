/* 图像与视频处理：opencv / moviepy / skimage / ddddocr */
window.MODULES = window.MODULES || [];

MODULES.push({
  id: 'opencv', name: 'OpenCV', icon: '👁️', category: '图像与视频处理',
  doc: 'https://docs.opencv.org/4.x/',
  desc: '计算机视觉标准库：图像读写、颜色空间、几何变换、找轮廓、模板匹配、视频逐帧处理。',
  install: 'pip install opencv-python',
  pkg: 'opencv-python',
  aliases: ['cv2', 'opencv', '计算机视觉'],
  tips: [
    'pip 装 opencv-python，代码里 <code>import cv2</code>。',
    '<b>OpenCV 用 BGR 通道序</b>（不是 RGB）：拿 matplotlib 显示前要 <code>cv2.cvtColor(img, cv2.COLOR_BGR2RGB)</code>，否则颜色怪异。',
    '<b>imread 读中文路径返回 None</b>（Windows），是第一大坑，见读写条目。',
  ],
  entries: [
    {
      name: 'imread-imwrite', sig: "img = cv2.imread('a.jpg') / cv2.imwrite('b.png', img)",
      brief: '图像读写；中文路径要用 imdecode/imencode 曲线救国。',
      examples: [
        { title: '标准读写', code: `import cv2\n\nimg = cv2.imread('a.jpg')\nprint(img.shape)          # (高, 宽, 3)  BGR!\ncv2.imwrite('b.png', img)` },
        { title: '中文路径专用写法', code: `import cv2\nimport numpy as np\n\n# 读: imdecode + np.fromfile\nimg = cv2.imdecode(np.fromfile('中文图.png', dtype=np.uint8),\n                   cv2.IMREAD_COLOR)\n\n# 写: imencode + tofile\nok, buf = cv2.imencode('.png', img)\nbuf.tofile('中文出.png')` },
      ],
      pitfalls: [
        '<b>imread 失败不报错，静默返回 None</b>，后续用 img.shape 才炸 —— 中文路径/文件不存在都这样。',
        'imread 读出来就是 ndarray (H, W, C)，dtype uint8。',
        '彩色图通道是 <b>BGR</b>：转灰度 cv2.COLOR_BGR2GRAY，转 RGB 用 COLOR_BGR2RGB。',
      ],
      related: ['颜色与二值化', '几何变换'],
      tags: ['读取', '保存', '中文路径'],
    },
    {
      name: '颜色与二值化', sig: 'cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) / cv2.threshold(gray, 0, 255, THRESH_BINARY + THRESH_OTSU)',
      brief: '颜色空间转换与阈值二值化（找轮廓/识别的前置步骤）。',
      params: [
        { n: 'cvtColor', t: '-', d: 'BGR2GRAY 灰度、BGR2HSV 色彩空间（按颜色过滤用 HSV）' },
        { n: 'threshold', t: '-', d: '固定阈值二值化；阈值给 0 并加 THRESH_OTSU 表示自动算最优阈值' },
        { n: 'adaptiveThreshold', t: '-', d: '自适应阈值：光照不均匀的图用它' },
      ],
      examples: [
        { title: '', code: `import cv2\n\ngray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)\nret, binimg = cv2.threshold(gray, 0, 255,\n    cv2.THRESH_BINARY + cv2.THRESH_OTSU)   # ret=自动算出的阈值\nprint('阈值:', ret)\n\n# 光照不均匀用自适应:\nbin2 = cv2.adaptiveThreshold(gray, 255,\n        cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 11, 2)` },
      ],
      pitfalls: [
        'threshold 返回 (阈值, 图) 两个值，别只接一个。',
        '<b>找轮廓的输入必须是二值图</b>，灰度图直接 findContours 结果不可控。',
      ],
      related: ['imread-imwrite', '轮廓与模板匹配'],
      tags: ['灰度', '二值化', 'otsu'],
    },
    {
      name: '几何变换', sig: 'cv2.resize(img, (w, h)) / img[y1:y2, x1:x2] / cv2.flip / warpAffine',
      brief: '缩放、裁剪、翻转、旋转平移。',
      examples: [
        { title: '', code: `h, w = img.shape[:2]\n\nsmall = cv2.resize(img, (w // 2, h // 2),\n                   interpolation=cv2.INTER_AREA)   # 缩小用 AREA\ncrop = img[50:200, 100:400]          # 裁剪 = numpy 切片 [y1:y2, x1:x2]\nflip = cv2.flip(img, 1)              # 1=水平镜像 0=垂直 -1=双向\n\n# 绕中心旋转 30 度:\nM = cv2.getRotationMatrix2D((w / 2, h / 2), 30, 1.0)\nrot = cv2.warpAffine(img, M, (w, h))` },
      ],
      pitfalls: [
        'resize 的尺寸参数是 <b>(宽, 高)</b>，和 shape 的 (高, 宽) 相反。',
        '裁剪就是 numpy 切片，不会复制内存（改 crop 会影响原图）。',
      ],
      related: ['imread-imwrite'],
      tags: ['缩放', '裁剪', '旋转'],
    },
    {
      name: '轮廓与模板匹配', sig: 'cv2.findContours(binimg, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE) / cv2.matchTemplate(img, tpl, TM_CCOEFF_NORMED)',
      brief: '找物体轮廓（位置/面积）与在大图里找小图（找按钮/找缺口）。',
      examples: [
        { title: '找轮廓', code: `contours, hierarchy = cv2.findContours(\n    binimg, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)\n\ncontours = sorted(contours, key=cv2.contourArea, reverse=True)\nfor c in contours[:5]:\n    x, y, w, h = cv2.boundingRect(c)      # 外接矩形\n    print(x, y, w, h, cv2.contourArea(c))\n    cv2.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)` },
        { title: '模板匹配(找小图位置)', code: `res = cv2.matchTemplate(big, tpl, cv2.TM_CCOEFF_NORMED)\nminv, maxv, minloc, maxloc = cv2.minMaxLoc(res)\nif maxv > 0.8:                         # 相似度阈值\n    print('左上角坐标:', maxloc)` },
      ],
      pitfalls: [
        '<b>版本坑</b>：OpenCV 3.x 的 findContours 返回 3 个值，4.x 返回 2 个 —— 网上老代码报 too many values 就是它。',
        'findContours 输入必须是二值图；会修改输入图，传入前 copy() 一份。',
        '模板匹配对<b>缩放/旋转敏感</b>，模板和大图尺寸不一致就找不到 —— 匹配爬虫截图够用。',
      ],
      related: ['颜色与二值化', '绘图标注'],
      tags: ['轮廓', '模板匹配', '找位置'],
    },
    {
      name: '视频逐帧', sig: "cap = cv2.VideoCapture('a.mp4') / ret, frame = cap.read() / cv2.VideoWriter(...)",
      brief: '视频读取与逐帧处理，处理完可写出新视频。',
      examples: [
        { title: '逐帧处理模板', code: `import cv2\n\ncap = cv2.VideoCapture('a.mp4')\nfps = cap.get(cv2.CAP_PROP_FPS)\nw = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))\nh = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))\nwriter = cv2.VideoWriter('out.mp4',\n        cv2.VideoWriter_fourcc(*'mp4v'), fps, (w, h))\n\nwhile True:\n    ret, frame = cap.read()\n    if not ret:                      # 读完/读失败都返回 False\n        break\n    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)\n    writer.write(cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR))\n\ncap.release(); writer.release()      # 必须释放!` },
      ],
      pitfalls: [
        '<b>read() 返回 (是否成功, 帧)</b> 两个值，不判 ret 最后一帧会炸。',
        'VideoWriter 的帧尺寸必须与写入的帧完全一致，不一致静默写不进。',
        'Windows 下 <b>VideoCapture 读中文路径可能打不开</b>，先把文件复制成英文名最省事。',
      ],
      related: ['绘图标注'],
      tags: ['视频', '逐帧', 'videowriter'],
    },
    {
      name: '绘图标注', sig: 'cv2.rectangle(img, pt1, pt2, color, thickness) / cv2.putText(...)',
      brief: '在图上画框、圆、文字（检测结果可视化）。',
      examples: [
        { title: '', code: `cv2.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)\ncv2.circle(img, (cx, cy), 5, (0, 0, 255), -1)     # -1=实心\ncv2.putText(img, 'target', (x, y - 8),\n            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)` },
      ],
      pitfalls: [
        '<b>putText 画不了中文</b>（乱码问号），中文标注要转 PIL 用 ImageDraw 写完再转回来。',
        '线宽 thickness=-1 表示实心填充；颜色是 BGR 元组，红色是 (0, 0, 255)。',
      ],
      related: ['轮廓与模板匹配'],
      tags: ['画框', '标注', '中文'],
    },
    {
      name: '滤波去噪', sig: 'cv2.GaussianBlur(img, (5, 5), 0) / medianBlur(img, 5) / bilateralFilter(img, 9, 75, 75)',
      brief: '三种去噪滤波：高斯、中值、双边（保边去噪）。',
      examples: [
        { title: '', code: `blur = cv2.GaussianBlur(img, (5, 5), 0)      # 高斯: 通用
med = cv2.medianBlur(img, 5)                 # 中值: 去椒盐噪点最强
bi = cv2.bilateralFilter(img, 9, 75, 75)     # 双边: 磨皮, 保边缘` },
      ],
      pitfalls: [
        '高斯/中值的窗口必须是<b>奇数</b>。',
        '双边滤波最慢但能"磨皮不糊边"；找轮廓前的二值化用中值+OTSU 组合最稳。',
      ],
      related: ['颜色与二值化', '边缘检测'],
      tags: ['去噪', '滤波'],
    },
    {
      name: '形态学操作', sig: 'cv2.erode / dilate / morphologyEx(binimg, cv2.MORPH_OPEN, kernel)',
      brief: '腐蚀膨胀、开闭运算：处理二值图的噪点与空洞。',
      params: [
        { n: 'kernel', t: 'ndarray', d: '结构元素，np.ones((5, 5), np.uint8) 常用' },
        { n: 'MORPH_OPEN / CLOSE', t: '-', d: '开=先腐蚀再膨胀(去白噪点)；闭=先膨胀再腐蚀(填小黑洞)' },
      ],
      examples: [
        { title: '', code: `import numpy as np
kernel = np.ones((5, 5), np.uint8)

eroded = cv2.erode(binimg, kernel)           # 腐蚀: 白区变小
dilated = cv2.dilate(binimg, kernel)         # 膨胀: 白区变大
opened = cv2.morphologyEx(binimg, cv2.MORPH_OPEN, kernel)   # 去噪点
closed = cv2.morphologyEx(binimg, cv2.MORPH_CLOSE, kernel)  # 填黑洞` },
      ],
      pitfalls: [
        '形态学只对<b>二值/灰度图</b>有意义；kernel 越大效果越猛。',
        '梯度 = 膨胀-腐蚀(取边缘)，用 morphologyEx 的 MORPH_GRADIENT。',
      ],
      related: ['颜色与二值化', '轮廓与模板匹配'],
      tags: ['形态学', '腐蚀', '膨胀'],
    },
    {
      name: '边缘检测', sig: 'cv2.Canny(gray, 100, 200) / cv2.Sobel(gray, cv2.CV_64F, 1, 0)',
      brief: 'Canny 边缘检测（最常用）与 Sobel 梯度。',
      examples: [
        { title: '', code: `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
blur = cv2.GaussianBlur(gray, (5, 5), 0)     # 先降噪
edges = cv2.Canny(blur, 100, 200)            # 高低阈值约 1:2~1:3

sx = cv2.Sobel(gray, cv2.CV_64F, 1, 0)       # x 方向梯度` },
      ],
      pitfalls: [
        'Canny 的两个阈值是高低门限，低于低门的弱边缘若与强边缘相连会保留；比例取 1:2 到 1:3。',
        '<b>Canny 输入要灰度且先降噪</b>，否则边缘毛刺满天飞。',
      ],
      related: ['滤波去噪', '颜色与二值化'],
      tags: ['边缘', 'canny', 'sobel'],
    },
    {
      name: '直方图均衡', sig: 'cv2.equalizeHist(gray) / cv2.createCLAHE(clipLimit=2.0)',
      brief: '灰度拉伸增强对比：全局均衡与自适应 CLAHE。',
      examples: [
        { title: '', code: `eq = cv2.equalizeHist(gray)                  # 全局均衡(可能过度增强)

clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
cl = clahe.apply(gray)                       # 局部自适应, 效果更自然

# 彩色图只均衡亮度通道(转 LAB 后对 L 通道做)` },
      ],
      pitfalls: [
        '全局 equalizeHist 对光照不均匀的图会放大背景噪声，<b>优先 CLAHE</b>。',
        '彩色图要转 LAB 后只对 L(亮度)通道均衡，否则颜色失真。',
      ],
      related: ['颜色与二值化'],
      tags: ['对比度', 'clahe', '增强'],
    },
    {
      name: '通道与ROI', sig: 'cv2.split(img) / cv2.merge([b, g, r]) / img[y1:y2, x1:x2] = 0',
      brief: '通道拆分合并与 ROI 区域赋值。',
      examples: [
        { title: '', code: `b, g, r = cv2.split(img)
img2 = cv2.merge([b, g, r])

# ROI 区域整体赋值/复制:
roi = img[0:100, 0:200]           # 取区域(视图, 改它原图也变)
img[0:100, 0:200] = 0             # 区域涂黑
img[0:100, 0:200] = roi           # 区域搬运` },
      ],
      pitfalls: [
        'split 拆出的是单通道二维数组；merge 时三个单通道尺寸必须一致。',
        'ROI 是<b>视图不是副本</b>，改 roi 原图跟着变，要独立先 .copy()。',
      ],
      related: ['几何变换'],
      tags: ['通道', 'roi'],
    },
    {
      name: '窗口与鼠标', sig: 'cv2.imshow("win", img) / cv2.waitKey(0) / cv2.setMouseCallback("win", on_mouse)',
      brief: '弹窗显示与鼠标交互（调试标注、手动取坐标）。',
      examples: [
        { title: '显示 + 取鼠标点击坐标', code: `import cv2

pts = []
def on_mouse(event, x, y, flags, param):
    if event == cv2.EVENT_LBUTTONDOWN:      # 左键按下
        pts.append((x, y))
        print(x, y)

cv2.namedWindow('win')
cv2.setMouseCallback('win', on_mouse)

while True:
    cv2.imshow('win', img)
    if cv2.waitKey(20) == 27:               # ESC 退出
        break
cv2.destroyAllWindows()` },
      ],
      pitfalls: [
        '<b>imshow 必须配 waitKey</b> 才会刷新；waitKey(0) 等按键，正数是等待毫秒。',
        '鼠标回调的坐标是 (x, y) = (列, 行)，与 numpy 下标 (行, 列) 相反。',
      ],
      related: ['视频逐帧', '绘图标注'],
      tags: ['显示', '鼠标', '交互'],
    },
  ],
});

MODULES.push({
  id: 'moviepy', name: 'moviepy', icon: '🎬', category: '图像与视频处理',
  desc: 'Pythonic 视频剪辑：裁剪/拼接/加字幕/变速/导出 GIF，比 ffmpeg 命令好写得多。',
  install: 'pip install moviepy',
  doc: 'https://moviepy.readthedocs.io/',
  aliases: ['视频剪辑', 'gif'],
  tips: [
    '<b>2.0 版本 API 大改</b>：subclip 改名 subclipped、resize 改名 resized、导入从 moviepy.editor 改为 moviepy —— 网上老教程报错多半是这个。',
    '底层仍依赖 ffmpeg（pip 装 moviepy 会自带镜像），导出速度慢是正常的。',
  ],
  entries: [
    {
      name: '基础剪辑', sig: "clip = VideoFileClip('a.mp4') / clip.subclipped(3, 8).write_videofile('out.mp4')",
      brief: '读视频、截取片段、导出文件三步走。',
      examples: [
        { title: '', code: `from moviepy import VideoFileClip\n\nclip = VideoFileClip('a.mp4')\nprint(clip.duration, clip.size)      # 时长秒数 与 [宽, 高]\n\nclip2 = clip.subclipped(3, 8)        # 截取 3~8 秒\nclip2.write_videofile('out.mp4', logger=None)   # logger=None 关进度条` },
      ],
      pitfalls: [
        '<b>2.x 里 subclip 已改名 subclipped</b>，老代码报 AttributeError 先查版本。',
        'write_videofile 输出尺寸/编码由原片段决定；转格式直接改输出文件扩展名。',
      ],
      related: ['拼接与合成', '音频与字幕'],
      tags: ['剪辑', '裁剪'],
    },
    {
      name: '拼接与合成', sig: 'concatenate_videoclips([c1, c2]) / CompositeVideoClip(...)',
      brief: '多段顺序拼接，或多层画面叠加合成。',
      examples: [
        { title: '', code: `from moviepy import VideoFileClip, concatenate_videoclips, CompositeVideoClip\n\nc1 = VideoFileClip('a.mp4').subclipped(0, 3)\nc2 = VideoFileClip('b.mp4').subclipped(0, 3)\n\nconcat = concatenate_videoclips([c1, c2])          # 顺序拼接\n\n# 合成: 小窗画中画\nbase = VideoFileClip('背景.mp4')\nmini = c1.resized(0.3).with_position(('right', 'bottom'))\ncomp = CompositeVideoClip([base, mini])` },
      ],
      pitfalls: [
        '拼接的两段<b>分辨率不同</b>时加 <code>method="compose"</code>，否则按第一段尺寸硬裁。',
        'CompositeVideoClip 的图层顺序 = 列表顺序，后面的盖在上面。',
      ],
      related: ['基础剪辑', '音频与字幕'],
      tags: ['拼接', '画中画', '合成'],
    },
    {
      name: '音频与字幕', sig: "clip.with_audio(AudioFileClip('m.mp3')) / TextClip(font=, text=)",
      brief: '替换背景音乐、烧录字幕。',
      examples: [
        { title: '', code: `from moviepy import VideoFileClip, AudioFileClip, TextClip\n\nvideo = VideoFileClip('a.mp4')\nmusic = AudioFileClip('bgm.mp3').subclipped(0, video.duration)\nvideo = video.with_audio(music)               # 换背景音乐\n\n# 字幕(2.x 必须指定字体文件):\ntxt = TextClip(font='C:/Windows/Fonts/msyh.ttc', text='你好世界',\n               font_size=48, color='white')\ntxt = txt.with_position(('center', 0.8)).with_start(0).with_end(3)\nvideo = CompositeVideoClip([video, txt])` },
      ],
      pitfalls: [
        '<b>TextClip 的 font 必须是字体文件路径</b>（.ttf/.ttc），只写"微软雅黑"会报错。',
        '音频比视频长时导出会以音频为准截断，先 subclipped 对齐时长。',
      ],
      related: ['基础剪辑'],
      tags: ['音频', '字幕', 'textclip'],
    },
    {
      name: '变速与GIF', sig: 'clip.with_effects([vfx.MultiplySpeed(2)]) / clip.write_gif("a.gif", fps=12)',
      brief: '变速、缩放与导出 GIF 表情包。',
      examples: [
        { title: '', code: `from moviepy import VideoFileClip, vfx\n\nclip = VideoFileClip('a.mp4').subclipped(0, 3)\nfast = clip.with_effects([vfx.MultiplySpeed(2)])     # 2倍速\nsmall = clip.resized(0.5)                            # 缩小一半\n\nsmall.write_gif('表情包.gif', fps=12)` },
      ],
      pitfalls: [
        '特效是 <code>with_effects([vfx.XXX])</code> 列表写法；缩放直接用 <code>.resized()</code> 方法。',
        'GIF 只有 256 色，画面复杂时会花 —— fps 降到 10~12 体积小很多。',
      ],
      related: ['基础剪辑'],
      tags: ['变速', 'gif', '缩放'],
    },
    {
      name: '转场特效', sig: 'clip.with_effects([vfx.FadeIn(1), vfx.FadeOut(1)])',
      brief: '淡入淡出与交叉转场。',
      examples: [
        { title: '', code: `from moviepy import vfx

c1 = c1.with_effects([vfx.FadeIn(1), vfx.FadeOut(1)])   # 首尾各1秒淡入淡出

# 交叉溶解: 第二段提前开始 + CrossFadeIn
c2 = c2.with_start(c1.duration - 1).with_effects([vfx.CrossFadeIn(1)])
comp = CompositeVideoClip([c1, c2])` },
      ],
      pitfalls: [
        '交叉转场要配合 <b>with_start</b> 让两段时间上重叠，才叠得起来。',
        'with_effects 返回新对象，要接住返回值。',
      ],
      related: ['基础剪辑', '拼接与合成'],
      tags: ['转场', '淡入淡出'],
    },
    {
      name: '常见问题', sig: '导出无声 / 卡住 / 编码错误',
      brief: 'moviepy 高频故障速查。',
      examples: [
        { title: '', code: `# 1. 导出的视频没有声音:
#    原片段本来就没音轨; 或中途 with_audio 前忘了挂回
# 2. 报 Couldnt find ffmpeg:
#    pip install imageio-ffmpeg
# 3. 导出巨慢: 预览调试用低码率
#    clip.write_videofile('t.mp4', bitrate='500k', logger=None)
# 4. 大项目内存涨: 用完的 clip 及时 .close()` },
      ],
      pitfalls: [
        'write_videofile 的 <code>logger=None</code> 关闭进度条输出，批处理时防刷屏。',
        '导出参数 codec="libx264" / audio_codec="aac" 可手动指定，兼容性更好。',
      ],
      related: ['基础剪辑'],
      tags: ['排查', '编码'],
    },
  ],
});

MODULES.push({
  id: 'skimage', name: 'scikit-image', icon: '🔬', category: '图像与视频处理',
  desc: '科研图像处理库：滤波、阈值分割、形态学、区域测量（面积/质心），和 numpy 无缝配合做定量分析。',
  install: 'pip install scikit-image',
  pkg: 'scikit-image',
  doc: 'https://scikit-image.org/',
  aliases: ['skimage', '图像分析'],
  tips: [
    '与 OpenCV 分工：OpenCV 快、偏工程；scikit-image 算法全、偏科研定量（测颗粒面积/数量用它）。',
    '读进来的图像就是 numpy 数组且是 <b>RGB 通道序</b>（与 OpenCV 的 BGR 相反）。',
  ],
  entries: [
    {
      name: 'io 读写', sig: "from skimage import io / img = io.imread('a.png') / io.imsave('b.png', img)",
      brief: '图像读写，直接返回 RGB ndarray。',
      examples: [
        { title: '', code: `from skimage import io\nimport matplotlib.pyplot as plt\n\nimg = io.imread('a.png')      # RGB\nprint(img.shape, img.dtype)   # (H, W, 3) uint8\nio.imsave('copy.png', img)\n\n# 配 matplotlib 显示:\nplt.imshow(img); plt.axis('off')` },
      ],
      pitfalls: [
        'io.imread 是 <b>RGB</b>，cv2.imread 是 BGR —— 两个库混用必须 cvtColor 转一次。',
        'imsave 对 float 图像假定 0~1 范围，uint8 图像不会有问题。',
      ],
      related: ['filters 滤波'],
      tags: ['读取', 'rgb'],
    },
    {
      name: 'filters 滤波', sig: "filters.threshold_otsu(gray) / filters.sobel(gray) / filters.gaussian(img, 2)",
      brief: '自动阈值、边缘检测、模糊滤波。',
      examples: [
        { title: '', code: `from skimage import io, filters\nimport numpy as np\n\ngray = io.imread('a.png', as_gray=True)     # 直接读成灰度 float\nt = filters.threshold_otsu(gray)            # 自动阈值\nbinary = gray > t                           # 布尔二值图\n\nedges = filters.sobel(gray)                 # 边缘强度图\nsmooth = filters.gaussian(gray, sigma=2)` },
      ],
      pitfalls: [
        'threshold_otsu 只对<b>双峰直方图</b>效果好；多峰用 threshold_multiotsu。',
        'gaussian 输出是 float(0~1)，要存 uint8 先 <code>(img * 255).astype(np.uint8)</code>。',
      ],
      related: ['区域测量'],
      tags: ['阈值', '边缘', '滤波'],
    },
    {
      name: '区域测量', sig: 'measure.label(binimg) / measure.regionprops(labels)',
      brief: '连通域标记与批量测量（面积/质心/外接框）——定量分析利器。',
      examples: [
        { title: '数颗粒并测量', code: `from skimage import measure, morphology\nimport numpy as np\n\nbinimg = gray > filters.threshold_otsu(gray)\nclean = morphology.remove_small_objects(binimg, min_size=64)  # 去小噪点\nlabels = measure.label(clean)               # 连通域编号\nprops = measure.regionprops(labels)\n\nfor p in props:\n    print('面积', p.area, '质心', p.centroid, '外接框', p.bbox)\nareas = np.array([p.area for p in props])\nprint('颗粒数:', len(props), '平均面积:', areas.mean())` },
      ],
      pitfalls: [
        '<b>remove_small_objects 要 bool 数组</b>，传入 0/255 的图会报错或无效，先 `binimg.astype(bool)`。',
        'regionprops 的 centroid/bbox 坐标是 (行, 列) = (y, x) 顺序。',
      ],
      related: ['filters 滤波'],
      tags: ['连通域', '测量', '定量'],
    },
    {
      name: '边缘与霍夫变换', sig: 'feature.canny(gray, sigma=2) / transform.hough_circle(...) / probabilistic_hough_line',
      brief: '边缘检测与霍夫变换（找直线/圆，断层与颗粒图像常用）。',
      examples: [
        { title: '', code: `from skimage import feature, transform, color

edges = feature.canny(color.rgb2gray(img), sigma=2)

# 霍夫圆检测(已知大致半径范围):
radii = np.arange(15, 40)
h = transform.hough_circle(edges, radii)
accums, cx, cy, rad = transform.hough_circle_peaks(h, radii, total_num_peaks=5)
for a, x, y, r in zip(accums, cx, cy, rad):
    print(f'圆 心=({x},{y}) 半径={r} 累计={a:.2f}')` },
      ],
      pitfalls: [
        'canny 输入要灰度且先 sigma 轻微降噪；sigma 越大边缘越少越干净。',
        '霍夫圆的半径范围给得越准，误检越少；total_num_peaks 限制返回个数。',
      ],
      related: ['filters 滤波', '区域测量'],
      tags: ['边缘', '霍夫', '圆检测'],
    },
    {
      name: 'transform 几何变换', sig: 'transform.rescale(img, 0.5) / transform.rotate(img, 30) / transform.warp(img, inverse_map)',
      brief: '缩放、旋转、仿射变换（自动处理插值与画布）。',
      examples: [
        { title: '', code: `from skimage import transform

small = transform.rescale(img, 0.5)              # 缩放, 默认输出 float
rot = transform.rotate(img, 30, resize=True)     # 旋转并自动扩画布

# 仿射: 平移+缩放组合
t = transform.AffineTransform(translation=(20, 10), scale=(1.2, 1.2))
warped = transform.warp(img, t.inverse)` },
      ],
      pitfalls: [
        '<b>rescale/rotate 输出是 float(0~1)</b>，存图前 astype(uint8) 或用 io.imsave(自动处理)。',
        'rotate 默认不扩画布，角落会被裁掉，加 resize=True。',
      ],
      related: ['io 读写'],
      tags: ['缩放', '旋转', '仿射'],
    },
    {
      name: 'exposure 灰度增强', sig: 'exposure.equalize_hist(gray) / equalize_adapthist(gray) / rescale_intensity(gray)',
      brief: '直方图均衡、CLAHE 与灰度拉伸（X 光片对比度增强直接可用）。',
      examples: [
        { title: '', code: `from skimage import exposure

eq = exposure.equalize_hist(gray)                # 全局均衡 (0~1)
cl = exposure.equalize_adapthist(gray, clip_limit=0.03)   # 局部自适应, 更自然

# 灰度拉伸: 把 50~200 的范围拉满 0~255
stretched = exposure.rescale_intensity(gray, in_range=(50, 200))` },
      ],
      pitfalls: [
        '<b>equalize_adapthist 输出 0~1 的 float</b>，imshow 直接能看，存 uint8 要乘 255 转换。',
        'X 光片对比度差时，CLAHE 的 clip_limit 取 0.01~0.05 之间多试几档。',
      ],
      related: ['filters 滤波', 'io 读写'],
      tags: ['均衡', 'clahe', '对比度'],
    },
  ],
});

MODULES.push({
  id: 'ddddocr', name: 'ddddocr', icon: '🤖', category: '图像与视频处理',
  doc: 'https://github.com/sml2h3/ddddocr',
  desc: '带内置模型的验证码识别：一行代码识别数字/字母验证码，也能检测文字位置和滑块缺口。',
  install: 'pip install ddddocr',
  pkg: 'ddddocr',
  aliases: ['验证码识别', 'ocr', '滑块'],
  tips: [
    '<b>输入是图片的 bytes</b>，不是路径也不是 PIL 对象 —— 文件用 rb 读，PIL 图用 BytesIO 转。',
    '首次创建实例要加载内置模型，稍慢；全局建一个复用。',
  ],
  entries: [
    {
      name: '验证码识别', sig: "ocr = ddddocr.DdddOcr() / ocr.classification(img_bytes)",
      brief: '识别数字/字母/简单汉字验证码，一行出结果。',
      examples: [
        { title: '', code: `import ddddocr\nimport io\nfrom PIL import Image\n\nocr = ddddocr.DdddOcr()\n\n# 从文件:\nwith open('code.png', 'rb') as f:\n    print(ocr.classification(f.read()))\n\n# 从 PIL Image / requests 下载的内容:\nbuf = io.BytesIO()\npil_img.save(buf, format='PNG')\nprint(ocr.classification(buf.getvalue()))` },
      ],
      pitfalls: [
        'classification 接收 <b>bytes</b>；传文件路径或 PIL 对象直接报错。',
        '对常见数字+字母验证码命中率很高；扭曲/干扰线强的先做二值化预处理，或换打码平台。',
      ],
      related: ['滑块与检测'],
      tags: ['验证码', 'ocr', '识别'],
    },
    {
      name: '滑块与检测', sig: "det = ddddocr.DdddOcr(det=True) / det.detection(img) / slide_match(滑块, 背景)",
      brief: '检测图中文字位置、计算滑块验证码缺口坐标。',
      examples: [
        { title: '', code: `import ddddocr\n\n# 目标检测: 返回图中所有文字框\ndet = ddddocr.DdddOcr(det=True)\nboxes = det.detection(img_bytes)          # [[x1,y1,x2,y2], ...]\n\n# 滑块验证码: 算缺口位置\nslider = ddddocr.DdddOcr(det=False, ocr=False)\nmatch = slider.slide_match(slide_bytes, bg_bytes)\nprint(match['target'])                    # 缺口坐标 [x1,y1,x2,y2]` },
      ],
      pitfalls: [
        'detection 返回的是<b>像素坐标框</b>，滑块要拖动的距离通常是缺口的 x1 减去滑块初始 x。',
        '识别失败率高的站点，验证码往往是动态渲染的，先确认拿到的是完整图片。',
      ],
      related: ['验证码识别'],
      tags: ['滑块', '缺口', '目标检测'],
    },
    {
      name: '输入与批量', sig: "ocr.classification(data, png_fix=True) / DdddOcr(beta=True)",
      brief: '各种来源的图片输入、批量识别与模型选择。',
      examples: [
        { title: 'bytes 的四种来源', code: `import ddddocr, io, cv2

ocr = ddddocr.DdddOcr(beta=True)        # 旧版模型, 部分验证码更准

# 1. 文件: rb 读取
# 2. requests: r.content
# 3. PIL Image -> bytes:
import io
buf = io.BytesIO()
pil_img.save(buf, format='PNG')
data = buf.getvalue()

# 4. numpy/cv2 图 -> bytes:
ok, buf = cv2.imencode('.png', img)
print(ocr.classification(buf.tobytes(), png_fix=True))   # png 带透明通道时` },
      ],
      pitfalls: [
        '<b>png_fix=True</b> 用于带透明通道的 PNG，普通 jpg 不用。',
        '批量识别时复用同一个 ocr 实例（模型只加载一次），循环里别反复创建。',
        'beta 模型与默认模型结果不同，实测哪个好用用哪个。',
      ],
      related: ['验证码识别'],
      tags: ['批量', 'bytes', '模型'],
    },
  ],
});

MODULES.push({
  id: 'imageio', name: 'imageio', icon: '🎞️', category: '图像与视频处理',
  desc: '统一图像/视频/多帧数据读写：PNG/JPG/GIF/MP4/TIFF 堆栈一行搞定，科研多帧数据常用。',
  install: 'pip install imageio imageio-ffmpeg',
  pkg: 'imageio',
  doc: 'https://imageio.readthedocs.io/',
  aliases: ['imageio-ffmpeg', 'gif读写'],
  tips: [
    '老教程用 <code>imageio.v2</code>，新项目推荐 v3 API：<code>import imageio.v3 as iio</code>。',
    '读写 MP4 依赖 imageio-ffmpeg（<code>pip install imageio[ffmpeg]</code> 一次装齐）。',
  ],
  entries: [
    {
      name: 'imread-imsave', sig: "imageio.imread('a.png') / imageio.imsave('b.png', img)",
      brief: '单张图像读写，返回 RGB ndarray。',
      examples: [
        { title: '', code: `import imageio

img = imageio.imread('a.png')      # RGB uint8
imageio.imsave('copy.png', img)

# v3 API (新):
import imageio.v3 as iio
img = iio.imread('a.png')` },
      ],
      pitfalls: [
        '返回 <b>RGB</b>，与 cv2 的 BGR 相反；两库混用记得转换。',
        '旧代码写 <code>import imageio</code> 直接用 imread 会有弃用提示，显式 v2 或 v3 消除。',
      ],
      related: ['GIF 读写', '视频写入'],
      tags: ['读取', '保存'],
    },
    {
      name: 'GIF 读写', sig: "imageio.mimread('a.gif') / imageio.mimsave('a.gif', frames, fps=12)",
      brief: 'GIF 拆帧与合成（表情包制作/动图分析）。',
      examples: [
        { title: '拆帧与合成', code: `import imageio

frames = imageio.mimread('a.gif')      # 每帧都是 ndarray 的列表
print(len(frames), frames[0].shape)

# 多张图片合成 GIF:
imgs = [imageio.imread(f'{i}.png') for i in range(5)]
imageio.mimsave('out.gif', imgs, fps=10, loop=0)   # loop=0 无限循环` },
      ],
      pitfalls: [
        'mimread 把所有帧读进内存，大 GIF 先 mimread 第一页或用 get_reader 流式。',
        'GIF 只有 256 色且无声音；fps 越大越流畅体积越大。',
      ],
      related: ['imread-imsave', '视频写入'],
      tags: ['gif', '拆帧', '合成'],
    },
    {
      name: '视频写入', sig: "w = imageio.get_writer('out.mp4', fps=30) / w.append_data(frame)",
      brief: '逐帧写出视频：渲染循环/仿真输出/批量帧合成视频。',
      examples: [
        { title: '', code: `import imageio

writer = imageio.get_writer('out.mp4', fps=30)
for frame in render_frames():          # 你的帧生成器 (RGB ndarray)
    writer.append_data(frame)
writer.close()                          # 必须 close 才能正常播放

# 也可用 with:
# with imageio.get_writer('out.mp4', fps=30) as w: ...` },
      ],
      pitfalls: [
        '<b>不 close() 视频尾帧/索引写不完整</b>，文件打不开或时长不对。',
        '帧必须是 uint8 且尺寸一致；首帧决定视频尺寸。',
      ],
      related: ['GIF 读写'],
      tags: ['视频', '逐帧', 'writer'],
    },
    {
      name: '多帧与科研数据', sig: "iio.volread('stack.tif') / imageio.mimread('stack.tif')",
      brief: 'TIFF 堆栈/三维体数据读写（断层扫描、延时成像、z 轴切片）。',
      examples: [
        { title: '', code: `import imageio
import imageio.v3 as iio

vol = iio.volread('stack.tif')     # (层数, H, W) 三维数组
print(vol.shape)

# 逐层导出成 png:
for i, layer in enumerate(vol):
    imageio.imwrite(f'slice_{i:03d}.png', layer)` },
      ],
      pitfalls: [
        '科研 TIFF 可能是多通道/浮点/带元数据，复杂场景配合 tifffile 库更全。',
        'volread 一次读入全部层，超大堆栈用 v3 的 imiter 流式逐层。',
      ],
      related: ['GIF 读写', 'imread-imsave'],
      tags: ['tiff', '堆栈', '三维'],
    },
  ],
});