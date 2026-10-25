/* Python 模块字典 - 搜索 / 路由 / 渲染逻辑（数据来自 data/*.js 注册到 window.MODULES） */
(function () {
  'use strict';

  var MODULES = window.MODULES || [];

  /* ---------- 用户自定义覆盖层(编辑/新增/删除, 存浏览器本地) ---------- */
  function loadJSON(key, dft) {
    try { return JSON.parse(localStorage.getItem(key) || '') || dft; }
    catch (e) { return dft; }
  }
  function saveJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { }
  }
  var edits = loadJSON('pmd_edits', {});
  var news = loadJSON('pmd_new', {});
  var dels = loadJSON('pmd_deleted', []);
  var notes = loadJSON('pmd_notes', {});
  var favs = loadJSON('pmd_fav', []);
  var recent = loadJSON('pmd_recent', []);
  var SERVER = (location.protocol === 'http:' || location.protocol === 'https:');
  if (SERVER) {   // 本地服务版: 以 pmd_overrides.json 为准(跨浏览器共享)
    try {
      var sxhr = new XMLHttpRequest();
      sxhr.open('GET', 'pmd_overrides.json', false);
      sxhr.send(null);
      if (sxhr.status === 200) {
        var sd = JSON.parse(sxhr.responseText);
        if (sd.edits) edits = sd.edits;
        if (sd.news) news = sd.news;
        if (sd.notes) notes = sd.notes;
        if (sd.deleted) dels = sd.deleted;
        if (sd.favs) favs = sd.favs;
        if (sd.recent) recent = sd.recent;
      }
    } catch (e) { }
  }
  function pushToServer() {
    if (!SERVER) return;
    try {
      var px = new XMLHttpRequest();
      px.open('POST', '/api/save', false);
      px.setRequestHeader('Content-Type', 'application/json');
      px.send(JSON.stringify({ edits: edits, news: news, notes: notes, deleted: dels, favs: favs, recent: recent }));
    } catch (e) { }
  }
  function overridesCount() {
    var n = Object.keys(edits).length + dels.length;
    Object.keys(news).forEach(function (k) { n += (news[k] || []).length; });
    return n;
  }
  function newsCount() {
    return Object.keys(news).reduce(function (a, k) { return a + (news[k] || []).length; }, 0);
  }
  (function applyOverrides() {
    MODULES.forEach(function (m) {
      m.entries = (m.entries || []).filter(function (e) {
        return dels.indexOf(m.id + '::' + e.name) < 0;
      });
      m.entries.forEach(function (e) {
        var ov = edits[m.id + '::' + e.name];
        if (ov) { for (var k in ov) e[k] = ov[k]; e._edited = true; }
      });
      (news[m.id] || []).forEach(function (ne) { ne._new = true; m.entries.push(ne); });
    });
  })();
  var $ = function (s) { return document.querySelector(s); };
  var main = $('#main'), input = $('#search');

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function escRe(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function norm(s) { return String(s == null ? '' : s).toLowerCase(); }
  function subseq(q, text) {   // 子序列匹配: q 的字符按顺序出现在 text 中
    if (!q || !text) return false;
    var i = 0;
    for (var j = 0; j < text.length && i < q.length; j++) {
      if (text.charAt(j) === q.charAt(i)) i++;
    }
    return i === q.length;
  }
  function allErrors() {
    var out = [];
    (window.ERRORS || []).forEach(function (g) {
      (g.items || []).forEach(function (it) { out.push({ g: g.group, it: it }); });
    });
    return out;
  }

  /* ---------- 索引 ---------- */
  var BYID = {}, ENTRIES = [], CATS = [];
  MODULES.forEach(function (m) {
    BYID[m.id] = m;
    if (CATS.indexOf(m.category) < 0) CATS.push(m.category);
    (m.entries || []).forEach(function (e) {
      ENTRIES.push({ m: m, e: e, full: m.name + '.' + e.name });
    });
  });

  var state = { q: '' };
  var COPYBUF = [];
  var route = { view: 'home' };

  function entryURL(mid, ename) { return '#/e/' + mid + '/' + encodeURIComponent(ename); }

  /* ---------- 路由解析 ---------- */
  function parseRoute() {
    var h = location.hash.replace(/^#\/?/, '');
    if (!h) return { view: 'home' };
    var p = h.split('/').map(function (x) {
      try { return decodeURIComponent(x); } catch (e) { return x; }
    });
    if (p[0] === 'm' && BYID[p[1]]) return { view: 'm', mid: p[1] };
    if (p[0] === 'docs') return { view: 'docs' };
    if (p[0] === 'learn') return { view: 'learn' };
    if (p[0] === 'feat') return { view: 'feat' };
    if (p[0] === 'errors') return { view: 'errors' };
    if (p[0] === 'xrfflow') return { view: 'xrfflow' };
    if (p[0] === 'scenes') return { view: 'scenes' };
    if (p[0] === 'cat' && p[1]) return { view: 'cat', cat: p[1] };
    if (p[0] === 'e' && BYID[p[1]]) {
      var e = BYID[p[1]].entries.filter(function (x) { return x.name === p.slice(2).join('/'); })[0];
      if (e) return { view: 'e', mid: p[1], entry: e };
    }
    return { view: 'home' };
  }

  /* ---------- 搜索 ---------- */
  function searchAll(q) {
    var terms = norm(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return { modHits: [], entryHits: [], errs: [], total: 0 };
    var modHits = [], entryHits = [], total = 0;

    MODULES.forEach(function (m) {
      var hay = norm(m.name + ' ' + m.id + ' ' + (m.aliases || []).join(' ') + ' ' + m.desc + ' ' + m.category);
      var ok = terms.every(function (t) { return hay.indexOf(t) >= 0; });
      if (ok) modHits.push(m);
    });

    ENTRIES.forEach(function (it) {
      var e = it.e;
      var parts = [it.full, e.name]
        .concat(e.aliases || [])
        .concat([e.brief, e.returns])
        .concat(e.tags || [])
        .concat((e.params || []).map(function (p) { return p.n + ' ' + p.t + ' ' + p.d; }))
        .concat(e.pitfalls || []);
      var hay = norm(parts.join(' '));
      var ok = terms.every(function (t) { return hay.indexOf(t) >= 0; });
      if (!ok && terms.length === 1 && terms[0].length >= 2) {
        ok = subseq(terms[0], en) || subseq(terms[0], norm(it.m.name)) ||
             (e.aliases || []).some(function (a) { return subseq(terms[0], norm(a)); });
      }
      if (!ok) return;
      total++;

      var nq = norm(q.trim());
      var fn = norm(it.full), en = norm(e.name), mn = norm(it.m.name);
      var s = 0;
      if (fn === nq || en === nq) s += 100;
      else if (en.indexOf(nq) === 0) s += 80;
      else if (en.indexOf(nq) >= 0) s += 60;
      if (mn === nq) s += 70; else if (mn.indexOf(nq) >= 0) s += 40;
      var al = (e.aliases || []).map(norm);
      if (al.indexOf(nq) >= 0) s += 55;
      else if (al.some(function (a) { return a.indexOf(nq) >= 0; })) s += 30;
      if (norm(e.brief).indexOf(nq) >= 0) s += 25;
      (e.tags || []).forEach(function (t) {
        var nt = norm(t);
        if (nt === nq) s += 20; else if (nt.indexOf(nq) >= 0) s += 10;
      });
      (e.params || []).forEach(function (p) {
        if (norm(p.n).indexOf(nq) >= 0) s += 12;
        if (norm(p.d).indexOf(nq) >= 0) s += 4;
      });
      (e.pitfalls || []).some(function (p) { return norm(p).indexOf(nq) >= 0; }) && (s += 8);
      var subq = terms.length === 1 && terms[0].length >= 2 &&
        (subseq(terms[0], en) || subseq(terms[0], fn) ||
         (e.aliases || []).some(function (a) { return subseq(terms[0], norm(a)); }));
      if (subq && s < 50) s += 35;
      it.score = s;
      entryHits.push(it);
    });

    entryHits.sort(function (a, b) {
      return b.score - a.score || a.full.localeCompare(b.full);
    });
    var errs = [];
    allErrors().forEach(function (e2) {
      var hay = norm([e2.it.err, e2.it.cause, e2.it.fix, (e2.it.tags || []).join(' ')].join(' '));
      var ok = terms.every(function (t) { return hay.indexOf(t) >= 0; });
      if (ok) errs.push({ g: e2.g, it: e2.it });
    });

    return { modHits: modHits, entryHits: entryHits.slice(0, 100), errs: errs.slice(0, 20), total: total };
  }

  function hl(text, q) {
    text = String(text == null ? '' : text);
    var terms = q.trim().split(/\s+/).filter(Boolean).map(escRe);
    if (!terms.length) return esc(text);
    var re = new RegExp('(' + terms.join('|') + ')', 'gi');
    var out = '', last = 0, m;
    while ((m = re.exec(text))) {
      if (m[0].length === 0) { re.lastIndex++; continue; }
      out += esc(text.slice(last, m.index)) + '<mark>' + esc(m[0]) + '</mark>';
      last = m.index + m[0].length;
    }
    return out + esc(text.slice(last));
  }

  /* ---------- 复制按钮 ---------- */
  function copyBtn(code) {
    COPYBUF.push(code);
    return '<button class="copy" data-ci="' + (COPYBUF.length - 1) + '">复制</button>';
  }

  /* ---------- 侧边栏 ---------- */
  var sideView = 'list';
  var showNum = true;
  try {
    if (localStorage.getItem('pmd_sideview') === 'thumb') sideView = 'thumb';
    if (localStorage.getItem('pmd_shownum') === '0') showNum = false;
  } catch (e) { }

  function thumbOn(m) {
    return (route.view === 'm' || route.view === 'e') && route.mid === m.id;
  }

  function syncToolButtons() {
    var vv = $('#v-view');
    if (vv) {
      vv.textContent = sideView === 'list' ? '☰' : '▦';
      vv.title = sideView === 'list' ? '当前：列表视图，点击切换到缩略图' : '当前：缩略图视图，点击切换到列表';
    }
    var vn = $('#v-num');
    if (vn) {
      vn.textContent = showNum ? '☑' : '☐';
      vn.title = showNum ? '编号已显示，点击隐藏' : '编号已隐藏，点击显示';
      vn.classList.toggle('on', showNum);
    }
  }

  var customOrder = {};
  try {
    customOrder = JSON.parse(localStorage.getItem('pmd_order') || '{}') || {};
  } catch (e) { customOrder = {}; }

  function saveCustomOrder() {
    try { localStorage.setItem('pmd_order', JSON.stringify(customOrder)); } catch (e) { }
  }

  var catOrder = [];
  try {
    var co = JSON.parse(localStorage.getItem('pmd_catorder_v2') || '[]');
    if (Object.prototype.toString.call(co) === '[object Array]') catOrder = co;
  } catch (e) { catOrder = []; }

  function saveCatOrder() {
    try { localStorage.setItem('pmd_catorder_v2', JSON.stringify(catOrder)); } catch (e) { }
  }

  /* 默认分类顺序（用户拖动过的顺序存在 pmd_catorder_v2 里，优先于它） */
  var DEFAULT_CAT_ORDER = [
    '文件与系统', '数据处理', 'X 射线工具', '数据可视化', '图像与视频处理',
    '机器学习', '深度学习与模型解释', '标准库', '存储与序列化',
    '爬虫', 'Web 与页面', '自动化与效率', '速查',
  ];

  function orderedCats() {
    var rank = {};
    DEFAULT_CAT_ORDER.forEach(function (c, i) { rank[c] = i; });
    catOrder.forEach(function (c, i) { rank[c] = i; });
    return CATS.slice().sort(function (a, b) {
      var ra = (rank[a] === undefined) ? 9999 : rank[a];
      var rb = (rank[b] === undefined) ? 9999 : rank[b];
      return ra - rb;
    });
  }

  /* 「速查」栏目内部默认顺序（用户拖动顺序 customOrder 优先） */
  var DEFAULT_QCAT_ORDER = ['builtins', 'concurrent', 'zipfile', 'jupyter', 'envmgmt',
    'linux', 'git', 'templates', 'markdown', 'frontend', 'llmapi', 'vscode'];

  function orderedModules(cat) {
    var mods = [];
    MODULES.forEach(function (m) { if (m.category === cat) mods.push(m); });
    var order = customOrder[cat] || DEFAULT_QCAT_ORDER || [];
    var rank = {};
    order.forEach(function (id, i) { rank[id] = i; });
    mods.sort(function (a, b) {
      var ra = (rank[a.id] === undefined) ? 9999 : rank[a.id];
      var rb = (rank[b.id] === undefined) ? 9999 : rank[b.id];
      return ra - rb;
    });
    return mods;
  }

  function renderSidebar() {
    var el = $('#side-list');
    Array.prototype.forEach.call(document.querySelectorAll('.side-toolbar a'), function (a) {
      var href = a.getAttribute('href');
      var on = (href === '#/' && route.view === 'home') ||
               (href === '#/docs' && route.view === 'docs') ||
               (href === '#/learn' && route.view === 'learn') ||
               (href === '#/feat' && route.view === 'feat') ||
               (href === '#/errors' && route.view === 'errors') ||
               (href === '#/xrfflow' && route.view === 'xrfflow') ||
               (href === '#/scenes' && route.view === 'scenes') ||
               (href === '#/cat/' + route.cat && route.view === 'cat');
      a.classList.toggle('on', on);
    });
    syncToolButtons();
    if (sideView === 'thumb') {
      var th = '';
      orderedCats().forEach(function (cat) {
        var idx = 0;
        th += '<div class="cat-name" draggable="true" data-dcat="' + esc(cat) + '" title="拖动可调整分类顺序" style="margin:10px 8px 2px">' + esc(cat) + '</div>' +
              '<div class="thumb-grid" data-cat="' + esc(cat) + '">';
        orderedModules(cat).forEach(function (m) {
          idx++;
          th += '<a class="thumb' + (thumbOn(m) ? ' on' : '') + '" draggable="true" data-mid="' + esc(m.id) +
            '" data-cat="' + esc(cat) + '" href="#/m/' + m.id + '" title="' +
            esc(m.name) + '（' + (m.entries || []).length + ' 条）">' +
            (showNum ? '<span class="t-num">' + idx + '</span>' : '') +
            '<span class="t-icon">' + m.icon + '</span><span class="t-name">' + esc(m.name) + '</span></a>';
        });
        th += '</div>';
      });
      el.innerHTML = th;
      return;
    }
    var html = '';
    if (favs.length) {
      html += '<div class="cat-name">⭐ 收藏</div>';
      favs.forEach(function (key) {
        var pp = key.split('::');
        var fm = BYID[pp[0]];
        if (!fm) return;
        var fe = fm.entries.filter(function (x) { return x.name === pp[1]; })[0];
        if (!fe) return;
        html += '<a class="mod" href="' + entryURL(fm.id, fe.name) + '"><span>★ ' + fm.icon + ' ' + esc(fm.name) + '.' + esc(fe.name) + '</span></a>';
      });
    }
    orderedCats().forEach(function (cat) {
      var idx = 0;
      html += '<div class="cat" data-cat="' + esc(cat) + '"><div class="cat-name" draggable="true" data-dcat="' + esc(cat) + '" title="拖动可调整分类顺序">' + esc(cat) + '</div>';
      orderedModules(cat).forEach(function (m) {
        idx++;
        html += '<a class="mod' + (route.view === 'm' && route.mid === m.id ? ' on' : '') +
          (route.view === 'e' && route.mid === m.id ? ' on' : '') +
          '" draggable="true" data-mid="' + esc(m.id) + '" data-cat="' + esc(cat) +
          '" href="#/m/' + m.id + '">' +
          (showNum ? '<span class="num">' + idx + '.</span>' : '') +
          '<span>' + m.icon + ' ' + esc(m.name) + '</span><span class="cnt">' +
          (m.entries || []).length + '</span></a>';
      });
      html += '</div>';
    });
    el.innerHTML = html;
  }

  /* ---------- 模块拖动排序（同类别内, 顺序自动保存） ---------- */
  var dragMid = null, dragCat = null;

  var dragCatName = null;

  $('#side-list').addEventListener('dragstart', function (ev) {
    var item = ev.target.closest ? ev.target.closest('[data-mid]') : null;
    if (item) {                                            // 模块拖拽
      dragMid = item.getAttribute('data-mid');
      dragCat = item.getAttribute('data-cat');
      item.classList.add('dragging');
      try { ev.dataTransfer.setData('text/plain', dragMid); } catch (e) { }
      ev.dataTransfer.effectAllowed = 'move';
      return;
    }
    var head = ev.target.closest ? ev.target.closest('[data-dcat]') : null;
    if (head) {                                            // 分类拖拽
      dragCatName = head.getAttribute('data-dcat');
      head.classList.add('dragging');
      try { ev.dataTransfer.setData('text/plain', dragCatName); } catch (e) { }
      ev.dataTransfer.effectAllowed = 'move';
    }
  });

  $('#side-list').addEventListener('dragover', function (ev) {
    var item = ev.target.closest ? ev.target.closest('[data-mid], [data-dcat]') : null;
    if (!item) return;
    if (dragMid) {                                         // 模块: 仅同类别内
      if (item.getAttribute('data-mid') === dragMid) return;
      if (item.getAttribute('data-cat') !== dragCat) return;
      ev.preventDefault();
      ev.dataTransfer.dropEffect = 'move';
    } else if (dragCatName) {                              // 分类: 任意分类之间
      if (item.getAttribute('data-dcat') === dragCatName) return;
      ev.preventDefault();
      ev.dataTransfer.dropEffect = 'move';
    }
  });

  $('#side-list').addEventListener('drop', function (ev) {
    var item = ev.target.closest ? ev.target.closest('[data-mid], [data-dcat]') : null;
    if (!item) return;

    if (dragMid) {                                         // 模块排序
      var overMid = item.getAttribute('data-mid');
      var cat = item.getAttribute('data-cat');
      if (!overMid || overMid === dragMid || cat !== dragCat) return;
      ev.preventDefault();
      var container = item.parentNode;
      var ids = Array.prototype.map.call(container.querySelectorAll('[data-mid]'),
        function (n) { return n.getAttribute('data-mid'); });
      ids.splice(ids.indexOf(dragMid), 1);
      var rect = item.getBoundingClientRect();
      var isGrid = (' ' + container.className + ' ').indexOf(' thumb-grid ') >= 0;
      var to = ids.indexOf(overMid);
      var after = isGrid ? (ev.clientX > rect.left + rect.width / 2)
                         : (ev.clientY > rect.top + rect.height / 2);
      ids.splice(after ? to + 1 : to, 0, dragMid);
      customOrder[cat] = ids;
      saveCustomOrder();
      renderSidebar();
      return;
    }

    if (dragCatName) {                                     // 分类排序
      var head = item.getAttribute('data-dcat') ? item
        : (item.querySelector ? item.querySelector('[data-dcat]') : null);
      if (!head) return;
      var overCat = head.getAttribute('data-dcat');
      if (overCat === dragCatName) return;
      ev.preventDefault();
      var names = Array.prototype.map.call(
        document.querySelectorAll('#side-list [data-dcat]'),
        function (n) { return n.getAttribute('data-dcat'); });
      names.splice(names.indexOf(dragCatName), 1);
      var r = head.getBoundingClientRect();
      var to2 = names.indexOf(overCat);
      var after2 = ev.clientY > r.top + r.height / 2;
      names.splice(after2 ? to2 + 1 : to2, 0, dragCatName);
      catOrder = names;
      saveCatOrder();
      renderSidebar();
    }
  });

  $('#side-list').addEventListener('dragend', function () {
    dragMid = null; dragCat = null; dragCatName = null;
    Array.prototype.forEach.call(document.querySelectorAll('.dragging'), function (n) {
      n.classList.remove('dragging');
    });
  });

  /* ---------- 首页 ---------- */
  function renderHome() {
    document.title = 'Python 模块字典';
    var hot = ['groupby', 'merge', '中文乱码', 'train_test_split', '保存模型', 'loc iloc', '正则', 'Excel', 'GPU', 'axis'];
    var html =
      '<div class="hero"><h1>📕 Python 模块字典</h1>' +
      '<p>像查字典一样查 Python 模块用法：搜索函数名或<b>中文关键字</b>，即可看到用法说明、参数详解、可复制示例和易混淆点。</p>' +
      '<p>按 <kbd>/</kbd> 聚焦搜索框，多个关键字用空格隔开（如 <code>groupby 聚合</code>）。</p>' +
      '<div class="stats"><span>📦 ' + MODULES.length + ' 个模块</span><span>🔧 ' + ENTRIES.length + ' 条用法</span>' +
      '<span>⚠️ 每条含示例 + 易混淆点</span><span>📴 本地离线可用</span></div>' +
      '<p style="margin-top:12px;font-size:14px">📖 <a href="#/docs">官方文档导航</a> &nbsp;·&nbsp; 🎓 <a href="#/learn">学习与案例</a> &nbsp;·&nbsp; 🧬 <a href="#/feat">特征处理速查</a> &nbsp;·&nbsp; ☢️ <a href="#/xrfflow">XRF 流程</a> &nbsp;·&nbsp; 🚨 <a href="#/errors">报错速查</a> &nbsp;·&nbsp; 🔄 版本检查：<code>python check_updates.py</code></p>' +
      '<p style="margin-top:14px">🔥 热门搜索：<span class="hot-tags">' +
      hot.map(function (t) { return '<span class="hot-tag" data-q="' + esc(t) + '">' + esc(t) + '</span>'; }).join('') +
      '</span></p></div>';

    if (ENTRIES.length) {
      var dayN = Math.floor(Date.now() / 86400000);
      var pick = ENTRIES[(dayN * 7919 + 13) % ENTRIES.length];
      html += '<div class="tips-box" style="margin-bottom:18px"><b>📌 今日一条</b> &nbsp;<a href="' + entryURL(pick.m.id, pick.e.name) + '"><code>' + esc(pick.full) + '</code></a>' +
        '<span style="font-size:13px;color:var(--muted)"> — ' + esc(pick.e.brief || '') + '</span></div>';
    }
    if (recent.length) {
      html += '<div class="tips-box" style="margin-bottom:18px"><b>🕘 最近浏览</b><div class="rel-chips" style="margin-top:8px">' +
        recent.slice(0, 10).map(function (r) {
          return '<a href="' + entryURL(r.mid, r.name) + '"><code>' + esc(r.mid) + '.' + esc(r.name) + '</code></a>';
        }).join('') + '</div></div>';
    }
    orderedCats().forEach(function (cat) {
      html += '<h2 class="cat-h">' + esc(cat) + '</h2><div class="mod-grid">';
      MODULES.forEach(function (m) {
        if (m.category !== cat) return;
        html += '<a class="mod-card" href="#/m/' + m.id + '"><div class="mc-top">' +
          '<span class="mc-icon">' + m.icon + '</span><span class="mc-name">' + esc(m.name) + '</span>' +
          '<span class="mc-cnt">' + (m.entries || []).length + ' 条</span></div>' +
          '<div class="mc-desc">' + esc(m.desc) + '</div></a>';
      });
      html += '</div>';
    });

    html += '<div class="tips-box"><b>💡 使用说明（第一版）</b><ul>' +
      '<li>顶部搜索框支持模块名、函数名、中文关键字；多关键字空格隔开，取交集。</li>' +
      '<li>左侧目录按类别浏览；点击条目查看参数表、示例与易混淆点，示例代码可一键复制。</li>' +
      '<li>所有内容是 <code>data/</code> 目录下的本地数据文件，想改直接编辑对应 <code>.js</code>，刷新即生效。</li>' +
      '</ul></div>' +
      '<div class="tips-box"><b>✏️ 自定义条目管理</b>' +
      '<p style="margin:6px 0 0">当前自定义：<b>' + overridesCount() + '</b> 条（编辑 ' + Object.keys(edits).length +
      ' · 新增 ' + newsCount() + ' · 删除 ' + dels.length + ' · 笔记 ' + Object.keys(notes).length + '）。' +
      '条目页点「✏️ 编辑」、模块页点「➕ 新增条目」即可修改，保存在浏览器本地；<b>不会改动 data/ 目录原文件</b>。</p>' +
      '<div class="dm-row"><button id="dm-export">⬇ 导出 JSON</button>' +
      '<button id="dm-import">⬆ 导入 JSON</button>' +
      '<button id="dm-clear">🗑 清空全部自定义</button>' +
      '<input type="file" id="dm-file" accept=".json,application/json" style="display:none"></div>' +
      '<p style="font-size:12px;color:var(--muted);margin:8px 0 0">想把自定义内容永久并入 data/ 文件：导出 JSON 后发给我或手动合并；清空自定义不影响已导出的文件。</p></div>';
    main.innerHTML = html;
  }

  /* ---------- 模块页 ---------- */
  function modCard(m) {
    return '<a class="mod-card" href="#/m/' + m.id + '"><div class="mc-top">' +
      '<span class="mc-icon">' + m.icon + '</span><span class="mc-name">' + esc(m.name) + '</span>' +
      '<span class="mc-cnt">' + (m.entries || []).length + ' 条</span></div>' +
      '<div class="mc-desc">' + esc(m.desc) + '</div></a>';
  }

  function renderModule(mid) {
    var m = BYID[mid];
    document.title = m.name + ' - Python 模块字典';
    var html = '<a class="crumb" href="#/">← 全部模块</a>' +
      '<div class="mod-head"><h1>' + m.icon + ' ' + esc(m.name) + '</h1>' +
      '<span class="chip">' + esc(m.category) + '</span>' +
      '<span class="chip">' + (m.entries || []).length + ' 条用法</span>' +
      (m.install ? '<code class="install" data-copy="pip install ' + esc(m.pkg || m.name) + '" title="点击复制">pip install ' + esc(m.pkg || m.name) + '</code>' : '') +
      '</div><p class="mod-desc">' + m.desc + '</p>' +
      '<div class="e-actions"><button class="act-btn" data-add="' + m.id + '">➕ 新增条目</button>' +
      ((news[m.id] && news[m.id].length) ? '<span class="chip">🆕 自定义 ' + news[m.id].length + ' 条</span>' : '') +
      '<button class="act-btn" data-print>🖨 打印</button></div>';

    if (m.aliases && m.aliases.length) {
      html += '<p style="font-size:13px;color:var(--muted)">别名：' + m.aliases.map(esc).join('、') + '</p>';
    }
    if (m.tips && m.tips.length) {
      html += '<div class="sec"><div class="warn-box"><b>⚠️ 模块级易混淆点</b><ul>' +
        m.tips.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul></div></div>';
    }
    html += '<div class="sec entry-list">' + m.entries.map(function (e) {
      var rt = (e.thumb && CHART_THUMBS[e.thumb]) ? '<span class="rt">' + CHART_THUMBS[e.thumb]() + '</span>' : '';
      var nm = notes[m.id + '::' + e.name] ? ' <span title="有笔记">📝</span>' : '';
      return '<a class="entry-row" href="' + entryURL(m.id, e.name) + '">' + rt + '<code>' + esc(m.name) + '.' + esc(e.name) + nm +
        '</code><span>' + esc(e.brief || '') + '</span></a>';
    }).join('') + '</div>';

    if (m.doc) html += '<p style="margin-top:18px"><a class="doclink" href="' + m.doc + '" target="_blank" rel="noopener">📘 打开官方文档</a></p>';
    main.innerHTML = html;
  }

  /* ---------- 官方文档导航页 ---------- */
  function renderDocs() {
    document.title = '官方文档导航 - Python 模块字典';
    var html = '<a class="crumb" href="#/">← 全部模块</a>' +
      '<div class="mod-head"><h1>📖 官方文档导航</h1>' +
      '<span class="chip">' + MODULES.length + ' 个模块</span></div>' +
      '<p class="mod-desc">各模块官方文档直达链接（点击在新标签页打开）。标准库为 Python 官方中文文档。库升级后：先查官方文档/更新日志，再回来修订 data/ 里对应条目；用 <code>python check_updates.py</code> 可一键对比本地与 PyPI 最新版本。</p>' +
      tocHtml(orderedCats().map(function (c, i) { return { id: 'dsec' + i, label: c }; }));
    orderedCats().forEach(function (cat, ci) {
      html += '<h2 class="cat-h" id="dsec' + ci + '">' + esc(cat) + '</h2><div class="entry-list">';
      MODULES.forEach(function (m) {
        if (m.category !== cat) return;
        html += '<a class="entry-row" href="' + (m.doc || '#/m/' + m.id) + '"' +
          (m.doc ? ' target="_blank" rel="noopener" title="在新标签页打开官方文档"' : '') +
          '><code>' + m.icon + ' ' + esc(m.name) + '</code><span>' +
          esc(m.desc) + '</span></a>';
      });
      html += '</div>';
    });
    html += '<p style="margin-top:22px"><a class="doclink" href="#/learn">🎓 学习教程与案例站点 →</a></p>';
    main.innerHTML = html;
  }

  /* ---------- 学习与案例页 ---------- */
  function resGroupsHtml(idPrefix) {
    idPrefix = idPrefix || 'lsec';
    var groups = window.RESOURCES || [];
    var html = tocHtml(groups.map(function (g, i) { return { id: idPrefix + i, label: g.group }; }));
    groups.forEach(function (g, gi) {
      html += '<h2 class="cat-h" id="' + idPrefix + gi + '">' + esc(g.group) + '</h2><div class="entry-list">';
      (g.sites || []).forEach(function (s) {
        var stars = '';
        if (s.stars) {
          stars = '<span class="stars">' + '★'.repeat(s.stars) + '☆'.repeat(5 - s.stars) + '</span>';
        }
        var lv = s.level ? '<span class="lv">' + esc(s.level) + '</span>' : '';
        var au = s.author ? '<span class="author">' + esc(s.author) + '</span>' : '';
        html += '<a class="entry-row" href="' + s.url + '" target="_blank" rel="noopener" title="在新标签页打开">' +
          '<code>🔗 ' + esc(s.name) + '</code>' + stars + lv + au +
          '<span>' + esc(s.desc) + '</span></a>';
      });
      html += '</div>';
    });
    return html;
  }

  function renderLearn() {
    document.title = '学习与案例 - Python 模块字典';
    var html = '<a class="crumb" href="#/">← 全部模块</a>' +
      '<div class="mod-head"><h1>🎓 学习与案例</h1>' +
      '<span class="chip">精选站点</span></div>' +
      '<p class="mod-desc">业内普遍推荐的学习教程、实战案例与图表画廊（免费/有免费部分）。只收与 Python 直接相关的站点；通用网址导航由独立的导航工具承担。</p>' +
      resGroupsHtml();
    main.innerHTML = html;
  }

  /* ---------- 特征处理速查页 ---------- */
  function renderFeat() {
    document.title = '特征处理速查 - Python 模块字典';
    var html = '<a class="crumb" href="#/">← 全部模块</a>' +
      '<div class="mod-head"><h1>🧬 特征处理速查</h1>' +
      '<span class="chip">谱图 / 数据 → 特征</span></div>' +
      '<p class="mod-desc">把原始谱图/数据变成可建模特征的完整流水线：预处理 → 基线扣除 → 归一化 → 峰特征 → 降维筛选 → 建模衔接。代码可直接复制；依赖的模块用法见左侧对应条目（scipy / lmfit / sklearn 等）。</p>';
    var groups = window.FEATURES || [];
    html += tocHtml(groups.map(function (g, i) { return { id: 'fsec' + i, label: g.group }; }));
    groups.forEach(function (g, gi) {
      html += '<h2 class="cat-h" id="fsec' + gi + '">' + esc(g.group) + '</h2>';
      (g.steps || []).forEach(function (st) {
        html += '<div class="card" style="padding:14px 18px;margin-bottom:12px">' +
          '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' +
          '<b style="font-size:15px">' + esc(st.name) + '</b>' +
          (st.tool ? '<span class="chip" style="font-family:Consolas,monospace">' + esc(st.tool) + '</span>' : '') +
          '</div>' +
          '<p style="margin:8px 0 2px;font-size:13.5px;color:var(--muted)">' + esc(st.desc) + '</p>' +
          '<div class="codeblock"><pre class="code">' + esc(st.code) + copyBtn(st.code) + '</pre></div>' +
          '</div>';
      });
    });
    main.innerHTML = html;
  }

  /* ---------- 报错速查页 ---------- */
  var errFilter = '';
  function renderErrors() {
    document.title = '报错速查 - Python 模块字典';
    var html = '<a class="crumb" href="#/">← 全部模块</a>' +
      '<div class="mod-head"><h1>🚨 报错速查</h1>' +
      '<span class="chip">报错原文 → 原因 → 解法</span></div>' +
      '<p class="mod-desc">把报错原文粘进顶部搜索框也能全库检索；本页可按关键字实时过滤。</p>' +
      '<div class="search-wrap" style="max-width:420px;margin:10px 0 4px"><span>🔍</span>' +
      '<input id="err-q" placeholder="过滤报错关键字，如 NaN / gbk / CUDA" value="' + esc(errFilter) + '"></div>' +
      '<div id="err-list"></div>';
    main.innerHTML = html;
    fillErrList();
    var q = $('#err-q');
    if (q) {
      q.addEventListener('input', function () {
        errFilter = q.value.trim();
        fillErrList();
      });
      if (errFilter) q.focus();
    }
  }
  function fillErrList() {
    var box = $('#err-list');
    if (!box) return;
    var f = norm(errFilter);
    var html = '';
    (window.ERRORS || []).forEach(function (g) {
      var items = (g.items || []).filter(function (it) {
        return !f || norm(it.err + ' ' + it.cause + ' ' + it.fix).indexOf(f) >= 0;
      });
      if (!items.length) return;
      html += '<h2 class="cat-h">' + esc(g.group) + '</h2><div class="entry-list">' +
        items.map(function (it) {
          return '<div class="card" style="padding:12px 16px;margin-bottom:10px">' +
            '<b style="font-family:Consolas,monospace;font-size:13px;color:#d4695e">' + esc(it.err) + '</b>' +
            '<div style="font-size:13px;margin-top:4px"><b>原因：</b>' + esc(it.cause) + '</div>' +
            '<div style="font-size:13px"><b>解法：</b>' + esc(it.fix) + '</div></div>';
        }).join('') + '</div>';
    });
    box.innerHTML = html || '<div class="empty" style="margin-top:12px">没有匹配的报错。</div>';
  }

  /* ---------- XRF 分析流程页 ---------- */
  function renderXrfflow() {
    document.title = 'XRF 分析流程 - Python 模块字典';
    var html = '<a class="crumb" href="#/">← 全部模块</a>' +
      '<div class="mod-head"><h1>☢️ XRF 分析流程</h1>' +
      '<span class="chip">原始谱 → 定量 → 成像</span></div>' +
      '<p class="mod-desc">X 射线荧光数据从原始谱到元素分布图的完整流水线。依赖模块见左侧「X 射线工具」分类（PyMca / xraylib / silx 等）。</p>';
    var groups = window.XRFFLOW || [];
    html += tocHtml(groups.map(function (g, i) { return { id: 'xsec' + i, label: g.group }; }));
    groups.forEach(function (g, gi) {
      html += '<h2 class="cat-h" id="xsec' + gi + '">' + esc(g.group) + '</h2>';
      (g.steps || []).forEach(function (st) {
        html += '<div class="card" style="padding:14px 18px;margin-bottom:12px">' +
          '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' +
          '<b style="font-size:15px">' + esc(st.name) + '</b>' +
          (st.tool ? '<span class="chip" style="font-family:Consolas,monospace">' + esc(st.tool) + '</span>' : '') +
          '</div>' +
          '<p style="margin:8px 0 2px;font-size:13.5px;color:var(--muted)">' + esc(st.desc) + '</p>' +
          '<div class="codeblock"><pre class="code">' + esc(st.code) + copyBtn(st.code) + '</pre></div>' +
          '</div>';
      });
    });
    main.innerHTML = html;
  }

  /* ---------- 场景选型页 ---------- */
  function renderScenes() {
    document.title = '场景选型 - Python 模块字典';
    var html = '<a class="crumb" href="#/">← 全部模块</a>' +
      '<div class="mod-head"><h1>🧭 场景选型</h1>' +
      '<span class="chip">遇到任务 → 用哪个工具</span></div>' +
      '<p class="mod-desc">按"我要做什么"索引：先找任务，再点工具名直达模块页。也可把任务关键词输入顶部搜索框全库检索。</p>';
    var groups = window.SCENES || [];
    html += tocHtml(groups.map(function (g, i) { return { id: 'scsec' + i, label: g.group }; }));
    groups.forEach(function (g, gi) {
      html += '<h2 class="cat-h" id="scsec' + gi + '">' + esc(g.group) + '</h2><div class="entry-list">';
      (g.items || []).forEach(function (it) {
        html += '<div class="card" style="padding:12px 16px;margin-bottom:10px">' +
          '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' +
          '<b style="font-size:14.5px">' + esc(it.name) + '</b>' +
          (it.tool ? '<span class="chip" style="font-family:Consolas,monospace">' + esc(it.tool) + '</span>' : '') +
          (it.link ? '<a class="chip" href="' + it.link + '" style="text-decoration:none;cursor:pointer">→ 模块页</a>' : '') +
          '</div>' +
          '<p style="margin:8px 0 0;font-size:13.5px;color:var(--muted)">' + esc(it.desc) + '</p>' +
          '</div>';
      });
      html += '</div>';
    });
    main.innerHTML = html;
  }

  /* ---------- 条目详情页 ---------- */
  function renderEntry(mid, e) {
    var m = BYID[mid];
    document.title = m.name + '.' + e.name + ' - Python 模块字典';
    var html = '<a class="crumb" href="#/">← 全部模块</a> / ' +
      '<a class="crumb" href="#/m/' + m.id + '">' + m.icon + ' ' + esc(m.name) + '</a>';

    html += '<div class="e-head"><h1>' + esc(m.name) + '.' + esc(e.name) + '</h1>' +
      '<span class="chip">' + esc(m.category) + '</span>' +
      (e._edited ? '<span class="chip" style="background:var(--warn-bg);color:inherit">✏️ 已编辑</span>' : '') +
      (e._new ? '<span class="chip" style="background:#e6ffec;color:#1a7f37">🆕 自定义</span>' : '') +
      (e.aliases || []).map(function (a) { return '<span class="chip">' + esc(a) + '</span>'; }).join('') +
      '</div>';
      var favKey = m.id + '::' + e.name;
      var isFav = favs.indexOf(favKey) >= 0;
      html += '<div class="e-actions"><button class="act-btn" data-fav="' + favKey + '">' + (isFav ? '★ 已收藏' : '☆ 收藏') + '</button>' +
      '<button class="act-btn" data-edit="' + m.id + '|' + esc(e.name) + '">✏️ 编辑</button>' +
      '<button class="act-btn" data-del="' + m.id + '|' + esc(e.name) + '">🗑 删除</button></div>';
      recent = recent.filter(function (x) { return x.key !== favKey; });
      recent.unshift({ key: favKey, mid: m.id, name: e.name, t: Date.now() });
      recent = recent.slice(0, 12);
      saveJSON('pmd_recent', recent);

    if (e.sig) {
      html += '<div class="sec"><h2>🧾 用法签名</h2><pre class="sig">' + esc(e.sig) + copyBtn(e.sig) + '</pre></div>';
    }
    if (e.brief) {
      html += '<div class="sec"><h2>📌 用途</h2><div>' + esc(e.brief) + '</div></div>';
    }
    if (e.thumb && CHART_THUMBS[e.thumb]) {
      html += '<div class="sec"><h2>🖼 图样示意</h2>' +
        '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">' +
        '<div class="card" style="padding:10px;width:170px">' + CHART_THUMBS[e.thumb]() + '</div>' +
        '<span style="font-size:12px;color:var(--muted)">示意图，表达图形大意；真实效果见官方图库（学习案例页有链接）。</span>' +
        '</div></div>';
    }
    if (e.params && e.params.length) {
      html += '<div class="sec"><h2>⚙️ 参数详解</h2><div class="card"><table class="params">' +
        '<thead><tr><th style="width:24%">参数</th><th style="width:18%">类型</th><th>说明</th></tr></thead><tbody>' +
        e.params.map(function (p) {
          return '<tr><td><code>' + esc(p.n) + '</code></td><td class="tp">' + esc(p.t || '') + '</td><td>' +
            (p.d || '') + (p.dflt ? ' <span class="tp">（默认 ' + esc(p.dflt) + '）</span>' : '') + '</td></tr>';
        }).join('') + '</tbody></table></div></div>';
    }
    if (e.returns) {
      html += '<div class="sec"><h2>↩️ 返回值</h2><div>' + e.returns + '</div></div>';
    }
    if (e.examples && e.examples.length) {
      html += '<div class="sec"><h2>💻 用法示例</h2>' + e.examples.map(function (ex) {
        return '<div class="codeblock">' + (ex.title ? '<div class="cb-title">' + esc(ex.title) + '</div>' : '') +
          '<pre class="code">' + esc(ex.code) + copyBtn(ex.code) + '</pre></div>';
      }).join('') + '</div>';
    }
    if (e.pitfalls && e.pitfalls.length) {
      html += '<div class="sec"><div class="warn-box"><b>⚠️ 易混淆点 / 常见坑</b><ul>' +
        e.pitfalls.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul></div></div>';
    }
    var noteKey = m.id + '::' + e.name;
    var noteText = notes[noteKey] || '';
    html += '<div class="sec"><h2>📝 我的笔记</h2>';
    if (noteText) {
      html += '<div class="card" style="padding:12px 16px"><div style="white-space:pre-wrap;font-size:13.5px">' + esc(noteText) + '</div>' +
        '<div class="e-actions" style="margin:10px 0 0"><button class="act-btn" data-note="' + esc(noteKey) + '">✏️ 编辑笔记</button></div></div>';
    } else {
      html += '<button class="act-btn" data-note="' + esc(noteKey) + '">📝 添加笔记</button>';
    }
    html += '</div>';
    if (e.related && e.related.length) {
      html += '<div class="sec"><h2>🔗 相关用法</h2><div class="rel-chips">' +
        e.related.map(function (r) {
          var target = m.entries.filter(function (x) { return x.name === r; })[0];
          return target
            ? '<a href="' + entryURL(m.id, r) + '">' + esc(m.name) + '.' + esc(r) + '</a>'
            : '<span class="chip">' + esc(r) + '</span>';
        }).join('') + '</div></div>';
    }
    if (e.tags && e.tags.length) {
      html += '<div class="sec" style="color:var(--muted);font-size:12.5px">🏷 ' +
        e.tags.map(function (t) { return '<span class="chip" style="background:var(--bg);color:var(--muted)">' + esc(t) + '</span>'; }).join(' ') + '</div>';
    }
    main.innerHTML = html;
  }

  /* ---------- 搜索结果页 ---------- */
  function renderSearch(q) {
    document.title = '搜索: ' + q + ' - Python 模块字典';
    var r = searchAll(q);
    var html = '<div class="res-head">搜索 “<b>' + esc(q) + '</b>” ：命中模块 ' + r.modHits.length +
      ' 个 · 用法 ' + r.total + ' 条' + (r.total > 100 ? '（仅显示前 100 条）' : '') + '</div>';

    if (r.errs && r.errs.length) {
      html += '<h2 class="cat-h" style="margin-top:0">🚨 报错速查</h2>';
      html += r.errs.map(function (e2) {
        return '<div class="card" style="padding:12px 16px;margin-bottom:10px">' +
          '<b style="font-family:Consolas,monospace;font-size:13px;color:#d4695e">' + esc(e2.it.err) + '</b>' +
          '<div style="font-size:13px;margin-top:4px"><b>原因：</b>' + esc(e2.it.cause) + '</div>' +
          '<div style="font-size:13px"><b>解法：</b>' + esc(e2.it.fix) + '</div>' +
          '<div style="font-size:11.5px;color:var(--muted);margin-top:4px">分类：' + esc(e2.g) + ' · 完整列表见 <a href="#/errors">报错速查页</a></div></div>';
      }).join('');
    }
    if (r.modHits.length) {
      html += '<h2 class="cat-h" style="margin-top:0">📦 模块</h2><div class="mod-grid">' +
        r.modHits.map(modCard).join('') + '</div>';
    }
    if (r.entryHits.length) {
      html += '<h2 class="cat-h">🔧 用法</h2>';
      html += r.entryHits.map(function (it) {
        return '<a class="hit" href="' + entryURL(it.m.id, it.e.name) + '"><code>' + hl(it.full, q) + '</code>' +
          '<span class="h-mod">' + it.m.icon + ' ' + esc(it.m.name) + '</span>' +
          '<span class="brief">' + hl(it.e.brief || '', q) + '</span></a>';
      }).join('');
    }
    if (!r.modHits.length && !r.entryHits.length) {
      html += '<div class="empty">没有找到 “' + esc(q) + '”。<br>试试别的关键字：中文（乱码、合并、保存）、函数名（groupby）、模块名（pandas）。</div>';
    }
    main.innerHTML = html;
  }

  /* ---------- 总渲染 ---------- */
  function scrollToSec(el) {
    if (!el) return;
    var y0 = window.scrollY || 0;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // 部分环境禁用平滑滚动(如系统开启"减弱动态效果"), 250ms 后没动就瞬时定位兜底
    setTimeout(function () {
      if (Math.abs((window.scrollY || 0) - y0) < 2) el.scrollIntoView({ block: 'start' });
    }, 260);
  }

  function render() {
    COPYBUF = [];
    route = parseRoute();
    renderSidebar();
    if (state.q) renderSearch(state.q);
    else if (route.view === 'm') renderModule(route.mid);
    else if (route.view === 'e') renderEntry(route.mid, route.entry);
    else if (route.view === 'docs') renderDocs();
    else if (route.view === 'learn') renderLearn();
    else if (route.view === 'feat') renderFeat();
    else if (route.view === 'errors') renderErrors();
    else if (route.view === 'xrfflow') renderXrfflow();
    else if (route.view === 'scenes') renderScenes();
    else if (route.view === 'cat') {
      renderHome();
      var sec = null, hs = document.querySelectorAll('#main h2.cat-h');
      for (var i = 0; i < hs.length; i++) {
        if (hs[i].textContent.trim() === route.cat) { sec = hs[i]; break; }
      }
      scrollToSec(sec);
    }
    else renderHome();
    if (route.view !== 'cat') window.scrollTo(0, 0);
  }

  /* ---------- 事件 ---------- */
  var tmr = null;
  input.addEventListener('input', function () {
    clearTimeout(tmr);
    tmr = setTimeout(function () {
      state.q = input.value.trim();
      render();
    }, 130);
  });
  input.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter') {
      var first = main.querySelector('.hit, .mod-card');
      if (first) { first.click(); input.blur(); }
    }
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === '/' && document.activeElement !== input) {
      ev.preventDefault(); input.focus(); input.select();
    } else if (ev.key === 'Escape' && document.activeElement === input) {
      input.value = ''; state.q = ''; input.blur(); render();
    }
  });

  /* ---------- 图型 SVG 示意图 ---------- */
  var _pc = { a: '#5b9bd5', o: '#e8974a', g: '#6aa86e', r: '#d4695e', m: '#9a7ab5', n: '#98a0a8' };
  function _svgWrap(inner) {
    return '<svg viewBox="0 0 120 72" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="display:block">' + inner + '</svg>';
  }
  function _pax() {
    return '<path d="M14 6 V62 H112" stroke="#98a0a8" stroke-width="1.2" fill="none" opacity="0.55"/>';
  }
  function _poly(pts, color, w, fill) {
    return '<polyline points="' + pts + '" fill="' + (fill || 'none') + '" stroke="' + color + '" stroke-width="' + (w || 2) + '"/>';
  }
  function _dots(list, color, r) {
    return list.map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (r || 2.4) + '" fill="' + color + '"/>'; }).join('');
  }
  var CHART_THUMBS = {
    pie: function () {
      function arc(cx, cy, r, a0, a1) {
        var x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
        var x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
        var la = (a1 - a0) > Math.PI ? 1 : 0;
        return 'M' + cx + ',' + cy + ' L' + x0 + ',' + y0 + ' A' + r + ',' + r + ' 0 ' + la + ' 1 ' + x1 + ',' + y1 + ' Z';
      }
      var inner = '', a0 = -Math.PI / 2, cs = [_pc.a, _pc.o, _pc.g], spans = [2.2, 1.6, 2.1];
      spans.forEach(function (sp, i) {
        inner += '<path d="' + arc(60, 38, 24, a0, a0 + sp) + '" fill="' + cs[i] + '" stroke="#808080" stroke-width="0.8"/>';
        a0 += sp;
      });
      return _svgWrap(inner);
    },
    line: function () { return _svgWrap(_pax() + _poly('20,50 34,28 48,40 62,18 76,32 92,14 108,24', _pc.a)); },
    scatterline: function () {
      return _svgWrap(_pax() + _dots([[24, 48], [34, 40], [46, 44], [58, 30], [72, 34], [86, 22], [100, 26]], _pc.a) +
        _poly('22,50 100,24', _pc.r, 1.6));
    },
    scatter: function () {
      return _svgWrap(_pax() + _dots([[30, 24], [38, 18], [46, 30], [42, 40], [30, 34]], _pc.a) +
        _dots([[76, 46], [84, 40], [92, 50], [100, 42], [88, 56], [74, 52]], _pc.o));
    },
    bar: function () {
      var hs = [28, 42, 20, 48, 34];
      return _svgWrap(_pax() + hs.map(function (h, i) {
        return '<rect x="' + (24 + i * 18) + '" y="' + (58 - h) + '" width="12" height="' + h + '" fill="' + (i % 2 ? _pc.o : _pc.a) + '"/>';
      }).join(''));
    },
    hist: function () {
      var hs = [8, 18, 34, 48, 32, 18, 8];
      return _svgWrap(_pax() + hs.map(function (h, i) {
        return '<rect x="' + (20 + i * 13) + '" y="' + (58 - h) + '" width="13" height="' + h + '" fill="' + _pc.a + '" opacity="0.85" stroke="var(--card)"/>';
      }).join(''));
    },
    box: function () {
      var b = function (x) {
        return '<rect x="' + x + '" y="24" width="20" height="22" fill="' + _pc.a + '" opacity="0.5"/>' +
          '<line x1="' + (x + 10) + '" y1="12" x2="' + (x + 10) + '" y2="24" stroke="' + _pc.n + '"/>' +
          '<line x1="' + (x + 10) + '" y1="46" x2="' + (x + 10) + '" y2="58" stroke="' + _pc.n + '"/>' +
          '<line x1="' + x + '" y1="35" x2="' + (x + 20) + '" y2="35" stroke="' + _pc.r + '" stroke-width="2"/>';
      };
      return _svgWrap(b(34) + b(74));
    },
    violin: function () {
      return _svgWrap('<ellipse cx="44" cy="38" rx="14" ry="24" fill="' + _pc.a + '" opacity="0.45"/>' +
        '<line x1="30" y1="38" x2="58" y2="38" stroke="' + _pc.r + '" stroke-width="2"/>' +
        '<ellipse cx="86" cy="38" rx="11" ry="18" fill="' + _pc.g + '" opacity="0.45"/>');
    },
    errorline: function () {
      var pts = [[28, 40], [56, 26], [84, 34], [106, 20]];
      return _svgWrap(_pax() + _poly('28,40 56,26 84,34 106,20', _pc.a) +
        pts.map(function (p) {
          return '<line x1="' + p[0] + '" y1="' + (p[1] - 8) + '" x2="' + p[0] + '" y2="' + (p[1] + 8) + '" stroke="' + _pc.r + '"/>' +
            '<line x1="' + (p[0] - 4) + '" y1="' + (p[1] - 8) + '" x2="' + (p[0] + 4) + '" y2="' + (p[1] - 8) + '" stroke="' + _pc.r + '"/>' +
            '<line x1="' + (p[0] - 4) + '" y1="' + (p[1] + 8) + '" x2="' + (p[0] + 4) + '" y2="' + (p[1] + 8) + '" stroke="' + _pc.r + '"/>';
        }).join(''));
    },
    stack: function () {
      var p1 = '16,46 48,42 80,46 112,42 112,62 16,62';
      var p2 = '16,34 48,30 80,34 112,28 112,42 80,46 48,42 16,46';
      var p3 = '16,20 48,16 80,22 112,14 112,28 80,34 48,30 16,34';
      return _svgWrap('<polygon points="' + p1 + '" fill="' + _pc.a + '" opacity="0.85"/>' +
        '<polygon points="' + p2 + '" fill="' + _pc.o + '" opacity="0.85"/>' +
        '<polygon points="' + p3 + '" fill="' + _pc.g + '" opacity="0.85"/>');
    },
    heatmap: function () {
      var cs = [_pc.a, _pc.o, _pc.g, _pc.r];
      var inner = '';
      for (var r = 0; r < 4; r++)
        for (var c = 0; c < 9; c++)
          inner += '<rect x="' + (18 + c * 11) + '" y="' + (10 + r * 13) + '" width="10" height="12" fill="' + cs[(r + c) % 4] + '" opacity="0.85"/>';
      return _svgWrap(inner);
    },
    contour: function () {
      return _svgWrap('<ellipse cx="60" cy="38" rx="12" ry="8" fill="none" stroke="' + _pc.a + '"/>' +
        '<ellipse cx="60" cy="38" rx="24" ry="17" fill="none" stroke="' + _pc.a + '" opacity="0.7"/>' +
        '<ellipse cx="60" cy="38" rx="36" ry="26" fill="none" stroke="' + _pc.a + '" opacity="0.45"/>');
    },
    dots2d: function () {
      var d = [];
      for (var i = 0; i < 40; i++) {
        var a = (i * 137) % 90, b = (i * 61) % 48;
        d.push([20 + a, 10 + b]);
      }
      return _svgWrap(_dots(d, _pc.a, 1.8));
    },
    surface3d: function () {
      var inner = '';
      [0, 1, 2, 3, 4].forEach(function (i) {
        inner += _poly((20 + i * 6) + ',' + (52 - i * 6) + ' ' + (44 + i * 4) + ',' + (20 - i * 2) + ' ' + (78 + i * 3) + ',' + (34 - i * 3) + ' ' + (104 - i * 4) + ',' + (50 - i * 5), _pc.a, 1.4);
      });
      return _svgWrap(inner);
    },
    radar: function () {
      var web = '60,10 86,29 76,60 44,60 34,29';
      var data = '60,22 77,32 71,54 49,54 43,32';
      var spokes = [[60, 38, 60, 10], [60, 38, 86, 29], [60, 38, 76, 60], [60, 38, 44, 60], [60, 38, 34, 29]];
      return _svgWrap('<polygon points="' + web + '" fill="none" stroke="#98a0a8"/>' +
        spokes.map(function (sp) { return '<line x1="' + sp[0] + '" y1="' + sp[1] + '" x2="' + sp[2] + '" y2="' + sp[3] + '" stroke="#98a0a8" opacity="0.5"/>'; }).join('') +
        '<polygon points="' + data + '" fill="' + _pc.a + '" opacity="0.4" stroke="' + _pc.a + '" stroke-width="2"/>');
    },
    funnel: function () {
      return _svgWrap('<path d="M30,6 H90 L74,26 H46 Z" fill="' + _pc.a + '"/>' +
        '<path d="M46,26 H74 L64,46 H56 Z" fill="' + _pc.o + '"/>' +
        '<path d="M56,46 H64 L60,66 H60 Z" fill="' + _pc.g + '"/>');
    },
    gauge: function () {
      return _svgWrap('<path d="M24,56 A36,36 0 0 1 96,56" fill="none" stroke="#98a0a8" stroke-width="7"/>' +
        '<path d="M24,56 A36,36 0 0 1 60,20" fill="none" stroke="' + _pc.g + '" stroke-width="7"/>' +
        '<line x1="60" y1="56" x2="82" y2="34" stroke="' + _pc.r + '" stroke-width="2.5"/>' +
        '<circle cx="60" cy="56" r="3.5" fill="' + _pc.r + '"/>');
    },
    map: function () {
      return _svgWrap('<path d="M28,20 C46,6 78,10 96,22 C104,34 92,52 74,58 C56,66 34,60 24,46 C16,36 18,26 28,20 Z" fill="' + _pc.a + '" opacity="0.35" stroke="' + _pc.a + '"/>' +
        _dots([[44, 30], [66, 26], [58, 44], [80, 40]], _pc.r, 3));
    },
    wcloud: function () {
      return _svgWrap('<text x="10" y="30" font-size="20" fill="' + _pc.a + '" font-weight="bold">数据</text>' +
        '<text x="52" y="24" font-size="13" fill="' + _pc.o + '">谱图</text>' +
        '<text x="12" y="52" font-size="14" fill="' + _pc.g + '">X射线</text>' +
        '<text x="64" y="50" font-size="17" fill="' + _pc.m + '">拟合</text>' +
        '<text x="88" y="64" font-size="11" fill="' + _pc.n + '">峰位</text>');
    },
    joint: function () {
      var hs = [6, 14, 22, 14, 6];
      var inner = hs.map(function (h, i) {
        return '<rect x="' + (34 + i * 12) + '" y="' + (12 - h) + '" width="12" height="' + h + '" fill="' + _pc.a + '" opacity="0.7"/>';
      }).join('');
      inner += _dots([[40, 30], [52, 40], [64, 34], [58, 48], [72, 44], [46, 52], [76, 52]], _pc.a);
      [12, 26, 40, 54].forEach(function (y, i) {
        inner += '<rect x="106" y="' + y + '" width="' + [10, 16, 8, 4][i] + '" height="9" fill="' + _pc.a + '" opacity="0.7"/>';
      });
      return _svgWrap(inner);
    },
    dotrows: function () {
      var rows = [[24, 34, 44, 54, 66, 78], [30, 42, 56, 68], [26, 40, 52, 64, 76]];
      var cs = [_pc.a, _pc.o, _pc.g];
      var inner = '';
      rows.forEach(function (row, r) {
        inner += _dots(row.map(function (x) { return [x, 16 + r * 20]; }), cs[r], 2.6);
      });
      return _svgWrap(inner);
    },
    grid: function () {
      var mini = function (x, y) {
        return '<rect x="' + x + '" y="' + y + '" width="44" height="26" fill="none" stroke="#98a0a8"/>' +
          _poly((x + 4) + ',' + (y + 18) + ' ' + (x + 16) + ',' + (y + 8) + ' ' + (x + 28) + ',' + (y + 14) + ' ' + (x + 40) + ',' + (y + 6), _pc.a, 1.4);
      };
      return _svgWrap(mini(14, 6) + mini(62, 6) + mini(14, 40) + mini(62, 40));
    },
  };

  function tocHtml(items) {
    if (!items || !items.length) return '';
    return '<div class="toc-row"><span class="toc-label">本页目录</span>' +
      items.map(function (it) {
        return '<button class="toc-chip" data-tid="' + it.id + '">' + esc(it.label) + '</button>';
      }).join('') + '</div>';
  }

  function setSideView(v) {
    sideView = v;
    try { localStorage.setItem('pmd_sideview', v); } catch (e) { }
    renderSidebar();
  }
  $('#v-view').addEventListener('click', function () {
    setSideView(sideView === 'list' ? 'thumb' : 'list');
  });
  $('#v-num').addEventListener('click', function () {
    showNum = !showNum;
    try { localStorage.setItem('pmd_shownum', showNum ? '1' : '0'); } catch (e) { }
    renderSidebar();
  });

  /* ---------- 条目编辑器 ---------- */
  var editorMid = null, editorOrig = null;

  function ensureEditorDom() {
    if ($('#editor-mask')) return;
    var mask = document.createElement('div');
    mask.id = 'editor-mask';
    var dlg = document.createElement('div');
    dlg.id = 'editor-dialog';
    dlg.innerHTML =
      '<div class="ed-head"><b id="ed-title">编辑条目</b><button id="ed-close" title="关闭">✕</button></div>' +
      '<label>条目名 <input id="e_name"></label>' +
      '<label>用法签名 sig <input id="e_sig"></label>' +
      '<label>用途 brief <input id="e_brief"></label>' +
      '<label>示例标题（可选） <input id="e_codetitle"></label>' +
      '<label>示例代码（编辑第一段；条目原有的其他段会保留）<textarea id="e_code" rows="8"></textarea></label>' +
      '<label>易混淆点（一行一条）<textarea id="e_pitfalls" rows="4"></textarea></label>' +
      '<label>相关条目（逗号分隔）<input id="e_related"></label>' +
      '<label>标签（逗号分隔）<input id="e_tags"></label>' +
      '<div class="ed-foot"><button id="ed-save">💾 保存</button><button id="ed-cancel">取消</button></div>' +
      '<p style="font-size:11.5px;color:var(--muted);margin:8px 0 0">保存到浏览器本地，刷新不丢；不会改动 data/ 目录原文件。要永久入库请到首页"自定义条目管理"导出 JSON。</p>';
    document.body.appendChild(mask);
    document.body.appendChild(dlg);
    mask.addEventListener('click', closeEditor);
    $('#ed-close').addEventListener('click', closeEditor);
    $('#ed-cancel').addEventListener('click', closeEditor);
    $('#ed-save').addEventListener('click', saveEditor);
  }
  function closeEditor() {
    $('#editor-mask').classList.remove('open');
    $('#editor-dialog').classList.remove('open');
  }
  function openEditor(mid, entry) {
    ensureEditorDom();
    editorMid = mid;
    editorOrig = entry ? JSON.parse(JSON.stringify(entry)) : null;
    $('#ed-title').textContent = entry ? ('编辑条目：' + mid + '.' + entry.name) : ('新增条目到：' + mid);
    $('#e_name').value = entry ? entry.name : '';
    $('#e_name').disabled = !!entry;
    $('#e_sig').value = entry ? (entry.sig || '') : '';
    $('#e_brief').value = entry ? (entry.brief || '') : '';
    var ex = (entry && entry.examples && entry.examples[0]) || { title: '', code: '' };
    $('#e_codetitle').value = ex.title || '';
    $('#e_code').value = ex.code || '';
    $('#e_pitfalls').value = ((entry && entry.pitfalls) || []).join('\n');
    $('#e_related').value = ((entry && entry.related) || []).join(', ');
    $('#e_tags').value = ((entry && entry.tags) || []).join(', ');
    $('#editor-mask').classList.add('open');
    $('#editor-dialog').classList.add('open');
  }
  function saveEditor() {
    var name = $('#e_name').value.trim();
    if (!name) { alert('条目名不能为空'); return; }
    if (name.indexOf('|') >= 0 || name.indexOf('/') >= 0) { alert('条目名不能含 | 或 /'); return; }
    var entry = {
      name: name,
      sig: $('#e_sig').value.trim(),
      brief: $('#e_brief').value.trim(),
      examples: [],
      pitfalls: $('#e_pitfalls').value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean),
      related: $('#e_related').value.split(/[,，]/).map(function (x) { return x.trim(); }).filter(Boolean),
      tags: $('#e_tags').value.split(/[,，]/).map(function (x) { return x.trim(); }).filter(Boolean)
    };
    var code = $('#e_code').value;
    if (code.trim() !== '') entry.examples.push({ title: $('#e_codetitle').value, code: code });
    var base = editorOrig ? Object.assign({}, editorOrig) : {};
    ['sig', 'brief', 'pitfalls', 'related', 'tags', 'examples'].forEach(function (k) {
      if (entry[k] !== undefined) base[k] = entry[k];
    });
    base.name = name;
    if (editorOrig) {
      edits[editorMid + '::' + editorOrig.name] = base;
      saveJSON('pmd_edits', edits);
    } else {
      base._new = true;
      if (!news[editorMid]) news[editorMid] = [];
      if (news[editorMid].some(function (x) { return x.name === name; })) { alert('该模块下已有同名自定义条目'); return; }
      news[editorMid].push(base);
      saveJSON('pmd_new', news);
    }
    closeEditor();
    location.reload();     // 重新应用覆盖层
  }
  function deleteEntry(mid, name) {
    if (!confirm('确定删除 ' + mid + '.' + name + ' ?（可用首页"清空全部自定义"恢复）')) return;
    dels.push(mid + '::' + name);
    saveJSON('pmd_deleted', dels);
    delete edits[mid + '::' + name];
    saveJSON('pmd_edits', edits);
    if (news[mid]) {
      news[mid] = news[mid].filter(function (x) { return x.name !== name; });
      saveJSON('pmd_new', news);
    }
    location.reload();
  }
  function exportOverrides() {
    var data = { edits: edits, news: news, notes: notes, deleted: dels, favs: favs,
      _note: 'Python模块字典 自定义条目；可导入回浏览器，或发给我并入 data 文件' };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'pmd_overrides.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  /* ---------- 我的笔记 ---------- */
  var noteKeyActive = null;
  function ensureNoteDom() {
    if ($('#note-mask')) return;
    var mask = document.createElement('div');
    mask.id = 'note-mask';
    var dlg = document.createElement('div');
    dlg.id = 'note-dialog';
    dlg.innerHTML =
      '<div class="ed-head"><b id="note-title">我的笔记</b><button id="note-close" title="关闭">✕</button></div>' +
      '<textarea id="note-text" placeholder="记录踩坑、心得、参数备忘…（自动保存到浏览器本地）"></textarea>' +
      '<div class="ed-foot"><button id="note-save">💾 保存</button><button id="note-cancel">取消</button></div>';
    document.body.appendChild(mask);
    document.body.appendChild(dlg);
    mask.addEventListener('click', closeNote);
    $('#note-close').addEventListener('click', closeNote);
    $('#note-cancel').addEventListener('click', closeNote);
    $('#note-save').addEventListener('click', function () {
      var t = $('#note-text').value;
      if (t.trim() === '') delete notes[noteKeyActive]; else notes[noteKeyActive] = t;
      saveJSON('pmd_notes', notes);
      closeNote();
      render();
    });
  }
  function openNote(key) {
    ensureNoteDom();
    noteKeyActive = key;
    $('#note-title').textContent = '我的笔记：' + key;
    $('#note-text').value = notes[key] || '';
    $('#note-mask').classList.add('open');
    $('#note-dialog').classList.add('open');
  }
  function closeNote() {
    $('#note-mask').classList.remove('open');
    $('#note-dialog').classList.remove('open');
  }

  main.addEventListener('click', function (ev) {
    var ab;
    if ((ab = ev.target.closest('[data-add]'))) { openEditor(ab.getAttribute('data-add'), null); return; }
    if ((ab = ev.target.closest('[data-edit]'))) {
      var pp = ab.getAttribute('data-edit').split('|');
      var mod = BYID[pp[0]];
      var ent = mod && mod.entries.filter(function (x) { return x.name === pp.slice(1).join('|'); })[0];
      if (ent) openEditor(pp[0], ent);
      return;
    }
    if ((ab = ev.target.closest('[data-del]'))) {
      var dp = ab.getAttribute('data-del').split('|');
      deleteEntry(dp[0], dp.slice(1).join('|'));
      return;
    }
    if ((ab = ev.target.closest('#dm-export'))) { exportOverrides(); return; }
    if ((ab = ev.target.closest('#dm-import'))) { $('#dm-file').click(); return; }
    if ((ab = ev.target.closest('#dm-clear'))) {
      if (confirm('确定清空全部自定义内容？（data/ 目录原文件不受影响）')) {
        saveJSON('pmd_edits', {}); saveJSON('pmd_new', {}); saveJSON('pmd_deleted', []);
        location.reload();
      }
      return;
    }
    var nb = ev.target.closest ? ev.target.closest('[data-note]') : null;
    if (nb) { openNote(nb.getAttribute('data-note')); return; }
    var tchip = ev.target.closest ? ev.target.closest('[data-tid]') : null;
    if (tchip) {
      scrollToSec(document.getElementById(tchip.getAttribute('data-tid')));
      return;
    }
    var b = ev.target.closest ? ev.target.closest('button.copy, code.install') : null;
    if (b) {
      var txt = b.hasAttribute('data-ci') ? (COPYBUF[+b.getAttribute('data-ci')] || '')
        : (b.getAttribute('data-copy') || '');
      var done = function () {
        b.textContent = '✅ 已复制';
        setTimeout(function () { b.textContent = '复制'; }, 1200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(done, function () { fallbackCopy(txt); done(); });
      } else { fallbackCopy(txt); done(); }
    }
    var tag = ev.target.closest ? ev.target.closest('.hot-tag') : null;
    if (tag) {
      input.value = tag.getAttribute('data-q');
      state.q = input.value;
      render();
    }
  });

  main.addEventListener('change', function (ev) {
    if (ev.target.id !== 'dm-file') return;
    var f = ev.target.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var d = JSON.parse(r.result);
        if (d.edits) { edits = d.edits; saveJSON('pmd_edits', edits); }
        if (d.news) { news = d.news; saveJSON('pmd_new', news); }
        if (d.deleted) { dels = d.deleted; saveJSON('pmd_deleted', dels); }
        if (d.notes) { notes = d.notes; saveJSON('pmd_notes', notes); }
        if (d.favs) { favs = d.favs; saveJSON('pmd_fav', favs); }
        alert('导入成功，即将刷新');
        location.reload();
      } catch (e) { alert('文件解析失败：' + e.message); }
    };
    r.readAsText(f);
  });

  function fallbackCopy(txt) {
    var ta = document.createElement('textarea');
    ta.value = txt;
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { }
    document.body.removeChild(ta);
  }

  $('#theme-btn').addEventListener('click', function () {
    var dark = document.documentElement.classList.toggle('dark');
    this.textContent = dark ? '☀️' : '🌙';
    try { localStorage.setItem('pmd_theme', dark ? 'dark' : 'light'); } catch (e) { }
  });
  (function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem('pmd_theme'); } catch (e) { }
    var dark = saved ? saved === 'dark'
      : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
    $('#theme-btn').textContent = dark ? '☀️' : '🌙';
  })();

  /* ---------- 字号切换（A±：100% → 115% → 130% → 90% 循环，记忆在 pmd_fscale） ---------- */
  var FS_STEPS = [1, 1.15, 1.3, 0.9], fsIdx = 0;
  function applyFscale() {
    var s = FS_STEPS[fsIdx];
    document.documentElement.style.setProperty('--fscale', s);
    $('#font-btn').title = '字号 ' + Math.round(s * 100) + '%，点击切换';
  }
  $('#font-btn').addEventListener('click', function () {
    fsIdx = (fsIdx + 1) % FS_STEPS.length;
    applyFscale();
    try { localStorage.setItem('pmd_fscale', String(FS_STEPS[fsIdx])); } catch (e) { }
  });
  (function initFscale() {
    var saved = NaN;
    try { saved = parseFloat(localStorage.getItem('pmd_fscale')); } catch (e) { }
    var i = FS_STEPS.indexOf(saved);
    if (i >= 0) fsIdx = i;
    applyFscale();
  })();

  /* ---------- 阅读模式（📖 隐藏侧栏加宽正文，记忆在 pmd_focus） ---------- */
  function applyFocus(on) {
    document.body.classList.toggle('focus', on);
    $('#focus-btn').title = on ? '退出阅读模式' : '阅读模式（隐藏侧栏）';
  }
  $('#focus-btn').addEventListener('click', function () {
    var on = !document.body.classList.contains('focus');
    applyFocus(on);
    try { localStorage.setItem('pmd_focus', on ? '1' : ''); } catch (e) { }
  });
  (function initFocus() {
    var on = false;
    try { on = localStorage.getItem('pmd_focus') === '1'; } catch (e) { }
    applyFocus(on);
  })();

  $('#menu-btn').addEventListener('click', function () { document.body.classList.toggle('side-open'); });
  $('#mask').addEventListener('click', function () { document.body.classList.remove('side-open'); });

  main.addEventListener('click', function (ev) {
    if (ev.target.closest && ev.target.closest('a')) document.body.classList.remove('side-open');
  });

  var backTop = $('#back-top');
  if (backTop) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      backTop.classList.toggle('show', y > 240);
    });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  window.addEventListener('hashchange', function () {
    state.q = ''; input.value = '';
    render();
  });

  // 支持 index.html?q=关键字 直达搜索结果（可收藏/分享）
  (function initFromQuery() {
    var m = /[?&]q=([^&]*)/.exec(location.search);
    if (m) {
      try { input.value = decodeURIComponent(m[1].replace(/\+/g, ' ')); }
      catch (e) { input.value = m[1]; }
      state.q = input.value.trim();
    }
  })();

  render();
})();
