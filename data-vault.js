/* ============================================================
 * data-vault.js —— 纯前端工具通用「数据保险柜」
 * 解决: localStorage 清浏览器缓存就没了的问题。
 *
 * 引入方式(body 末尾):
 *   <script src="data-vault.js" data-keys="pmd_" data-name="Python模块字典"></script>
 *   data-keys: 本工具 localStorage 键的前缀(逗号分隔多个)；data-name: 工具名
 *
 * 提供(右下角 ⚙ 面板):
 *   1. 首次访问提示条 —— 告知数据在浏览器本地、清理会丢
 *   2. 连接数据文件夹 —— Chrome/Edge 支持: 选一个真实文件夹, 数据实时
 *      写成里面的 *.json 文件, 清缓存/换浏览器不丢(换浏览器需重新连接选择同文件夹)
 *   3. 导出/导入备份 —— 所有浏览器通吃的 JSON 文件备份
 *   4. 恢复默认 —— 清空本工具全部数据, 回到出厂状态
 *
 * 存储规则:
 *   - 未连接文件夹: 与原来完全一样, 只用 localStorage
 *   - 已连接: 打开页面时【文件夹内容为准】载入; 之后本地改动约 3 秒内自动写回文件夹
 *   - 文件夹里每个键一个文件: encodeURIComponent(键名).json, 内容为 JSON 字符串
 * ============================================================ */
"use strict";

(() => {
  const me = document.currentScript;
  const PREFIX = (me.dataset.keys || "").split(",").map(s => s.trim()).filter(Boolean);
  const NAME = me.dataset.name || document.title;
  const STORE_KEY = "vault:" + PREFIX.join("|");
  const HAS_FS = ("showDirectoryPicker" in window) && window.isSecureContext !== false;

  const match = (k) => PREFIX.some(p => k === p || k.startsWith(p));
  const myKeys = () => Object.keys(localStorage).filter(match);
  const enc = encodeURIComponent, dec = decodeURIComponent;

  /* ---------------- IndexedDB: 记住选过的文件夹 ---------------- */
  const idb = () => new Promise((res, rej) => {
    const rq = indexedDB.open("data-vault", 1);
    rq.onupgradeneeded = () => rq.result.createObjectStore("handles");
    rq.onsuccess = () => res(rq.result);
    rq.onerror = () => rej(rq.error);
  });
  const idbSet = async (k, v) => {
    const db = await idb();
    return new Promise((res, rej) => {
      const tx = db.transaction("handles", "readwrite");
      tx.objectStore("handles").put(v, k);
      tx.oncomplete = res; tx.onerror = () => rej(tx.error);
    });
  };
  const idbGet = async (k) => {
    const db = await idb();
    return new Promise((res, rej) => {
      const rq = db.transaction("handles").objectStore("handles").get(k);
      rq.onsuccess = () => res(rq.result); rq.onerror = () => rej(rq.error);
    });
  };
  const idbDel = async (k) => {
    const db = await idb();
    return new Promise((res, rej) => {
      const tx = db.transaction("handles", "readwrite");
      tx.objectStore("handles").delete(k);
      tx.oncomplete = res; tx.onerror = () => rej(tx.error);
    });
  };

  /* ---------------- 文件夹同步引擎 ---------------- */
  let dir = null;                  // 当前连接的目录句柄
  let lastSnap = new Map();        // 已写盘的 值 快照
  const dirty = new Set();         // 待写盘的键

  const fileName = (k) => enc(k) + ".json";

  async function writeFile(key, val) {
    const fh = await dir.getFileHandle(fileName(key), { create: true });
    const w = await fh.createWritable();
    await w.write(JSON.stringify(val));
    await w.close();
  }
  async function removeFile(key) {
    try { await dir.removeEntry(fileName(key)); } catch (e) { /* 本来就没有 */ }
  }

  async function flush() {
    if (!dir) return;
    for (const k of [...dirty]) {
      dirty.delete(k);
      try {
        const cur = localStorage.getItem(k);
        if (cur === null) await removeFile(k);
        else if (cur !== lastSnap.get(k)) await writeFile(k, cur);
        lastSnap.set(k, cur);
      } catch (e) { dirty.add(k); }   // 失败留在队列里下轮重试
    }
  }

  // 文件夹为准, 载入到 localStorage; 返回被还原的键
  async function loadFromFolder() {
    const restored = [];
    for await (const entry of dir.values()) {
      if (entry.kind !== "file" || !entry.name.endsWith(".json")) continue;
      const key = dec(entry.name.slice(0, -5));
      if (!match(key)) continue;
      let val;
      try { val = JSON.parse(await (await entry.getFile()).text()); }
      catch (e) { continue; }                      // 脏文件跳过
      if (typeof val !== "string") continue;
      if (localStorage.getItem(key) !== val) {
        localStorage.setItem(key, val);
        restored.push(key);
      }
      lastSnap.set(key, val);
    }
    return restored;
  }

  // 把本地现有数据整体记为待写盘(首次连接时作为文件夹初值)
  function snapshotAll() {
    lastSnap = new Map(myKeys().map(k => [k, localStorage.getItem(k)]));
    for (const k of lastSnap.keys()) dirty.add(k);
  }

  // 拦截写入, 标记脏键
  const _set = Storage.prototype.setItem, _rem = Storage.prototype.removeItem;
  Storage.prototype.setItem = function (k, v) {
    _set.call(this, k, v);
    if (dir && match(String(k))) dirty.add(String(k));
  };
  Storage.prototype.removeItem = function (k) {
    _rem.call(this, k);
    if (dir && match(String(k))) dirty.add(String(k));
  };

  /* ---------------- 连接 / 断开 ---------------- */
  async function connect(handle, { fresh } = {}) {
    dir = handle;
    await idbSet(STORE_KEY, handle);
    if (fresh) { await snapshotAll(); }            // 首次: 本地数据作为初值
    else { await loadFromFolder(); }               // 重连: 文件夹为准
    await flush();
    setStatus();
  }
  async function connectNew() {
    try {
      const handle = await window.showDirectoryPicker({ mode: "readwrite" });
      await connect(handle, { fresh: true });
    } catch (e) { /* 用户取消选择 */ }
  }
  async function reconnect() {                     // 重新授权已记住的文件夹
    const h = await idbGet(STORE_KEY);
    if (!h) return;
    const p = await h.requestPermission({ mode: "readwrite" });
    if (p === "granted") await connect(h);
    else setStatus("没有获得文件夹读写权限");
  }
  async function disconnect() {
    await flush().catch(() => {});
    dir = null; lastSnap = new Map(); dirty.clear();
    await idbDel(STORE_KEY);
    setStatus();
  }

  /* ---------------- 备份 / 恢复 ---------------- */
  function buildBackup() {
    const data = {};
    for (const k of myKeys()) data[k] = localStorage.getItem(k);
    const blob = new Blob(
      [JSON.stringify({ tool: NAME, time: new Date().toISOString(), data }, null, 1)],
      { type: "application/json" });
    return { blob, filename: `${NAME}-数据备份-${new Date().toISOString().slice(0, 10)}.json` };
  }
  const LS_BACKUP = STORE_KEY + ":lastBackup";
  const LS_REMIND = STORE_KEY + ":remindAt";
  const LS_FIRST = STORE_KEY + ":firstData";
  const lastBackupAt = () => Number(localStorage.getItem(LS_BACKUP)) || 0;
  const backupAgeDays = () => Math.floor((Date.now() - lastBackupAt()) / 864e5);
  function markBackup() { _set.call(localStorage, LS_BACKUP, String(Date.now())); renderBk(); updateBadge(); }
  function exportBackup() {
    const { blob, filename } = buildBackup();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    markBackup();
  }
  async function shareBackup() {   // 手机: 通过系统分享把备份存进文件管理器/iCloud
    const { blob, filename } = buildBackup();
    const file = new File([blob], filename, { type: "application/json" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: filename }); markBackup(); }
      catch (e) { /* 用户取消分享 */ }
    }
  }
  function importBackup(file) {
    const rd = new FileReader();
    rd.onload = () => {
      let obj;
      try { obj = JSON.parse(rd.result); } catch (e) { alert("备份文件格式不对"); return; }
      const d = obj && obj.data ? obj.data : obj;
      let n = 0;
      for (const [k, v] of Object.entries(d)) {
        if (match(k) && typeof v === "string") { _set.call(localStorage, k, v); n++; }
      }
      if (dir) flush();
      markBackup();
      if (confirm(`已导入 ${n} 项, 刷新页面生效。立即刷新?`)) location.reload();
    };
    rd.readAsText(file);
  }
  function resetAll() {
    if (!confirm(`确定清空 ${NAME} 的全部本地数据(含已连接文件夹里的)? 此操作不可恢复!`)) return;
    for (const k of myKeys()) _rem.call(localStorage, k);
    _rem.call(localStorage, LS_FIRST);   // 重置后重新计算"从没备份"冷静期
    if (dir) {
      dir.values().then(async (it) => {
        for await (const entry of it) {
          if (entry.kind === "file" && entry.name.endsWith(".json")) {
            const key = dec(entry.name.slice(0, -5));
            if (match(key)) { try { await dir.removeEntry(entry.name); } catch (e) {} }
          }
        }
        lastSnap = new Map();
      });
    }
    location.reload();
  }

  /* ---------------- 界面 ---------------- */
  const css = document.createElement("style");
  css.textContent = `
#vault-btn{position:fixed;right:14px;bottom:14px;z-index:99999;width:38px;height:38px;
  border-radius:50%;border:1px solid #d5dcea;background:#fff;color:#5a6a8f;font-size:17px;
  cursor:pointer;box-shadow:0 3px 12px rgba(40,60,120,.18);}
#vault-btn:hover{color:#3b6cff;border-color:#9db4ff;}
#vault-btn .dot{position:absolute;top:-3px;right:-3px;width:11px;height:11px;border-radius:50%;
  background:#e5484d;border:2px solid #fff;display:none;}
#vault-btn.badge .dot{display:block;}
#vault-panel{position:fixed;right:14px;bottom:60px;z-index:99999;width:300px;display:none;
  background:#fff;border:1px solid #dfe5f2;border-radius:14px;padding:16px;
  font:13px/1.7 "Microsoft YaHei",system-ui,sans-serif;color:#333;
  box-shadow:0 10px 30px rgba(30,50,110,.22);}
#vault-panel.open{display:block;}
#vault-panel h4{margin:0 0 8px;font-size:14px;color:#24304d;}
#vault-status{color:#7a86a3;margin-bottom:10px;}
#vault-panel .row{display:flex;gap:8px;margin-bottom:8px;}
#vault-panel button.vb{flex:1;padding:7px 4px;border:1px solid #c9d4ee;border-radius:8px;
  background:#f6f8ff;color:#2c4a9e;cursor:pointer;font-size:12.5px;}
#vault-panel button.vb:hover{background:#eef2ff;}
#vault-panel button.vb.warn{color:#b03030;border-color:#e5c4c4;background:#fff7f7;}
#vault-panel .hint{font-size:11.5px;color:#98a3bd;line-height:1.7;margin-top:6px;}
#vault-banner{position:fixed;top:0;left:0;right:0;z-index:99998;display:flex;gap:10px;
  justify-content:center;align-items:center;flex-wrap:wrap;padding:9px 12px;font-size:13px;
  color:#fff;background:linear-gradient(135deg,#3b6cff,#22c3ee);
  box-shadow:0 4px 14px rgba(0,0,0,.2);}
#vault-banner button{border:none;border-radius:999px;padding:4px 14px;cursor:pointer;
  font-size:12.5px;font-weight:600;background:#fff;color:#3b6cff;}
`;
  document.head.appendChild(css);

  const btn = document.createElement("button");
  btn.id = "vault-btn"; btn.title = "数据存储管理"; btn.textContent = "⚙";
  const dot = document.createElement("span");
  dot.className = "dot";
  btn.appendChild(dot);
  document.body.appendChild(btn);
  const updateBadge = () => btn.classList.toggle("badge", needRemind());

  const panel = document.createElement("div");
  panel.id = "vault-panel";
  panel.innerHTML = `
    <h4>🗄 数据存储 · ${NAME}</h4>
    <div id="vault-status"></div>
    <div id="vault-bk"></div>
    ${HAS_FS ? `<div class="row">
        <button class="vb" id="vault-connect">📁 连接数据文件夹</button>
        <button class="vb" id="vault-disconnect">断开</button>
      </div>` : ""}
    <div class="row">
      <button class="vb" id="vault-export">⬇ 导出备份</button>
      <button class="vb" id="vault-import">⬆ 导入备份</button>
    </div>
    <div class="row" id="vault-share-row" style="display:none">
      <button class="vb" id="vault-share">📤 分享备份(可存到手机文件/iCloud)</button>
    </div>
    <div class="row"><button class="vb warn" id="vault-reset">恢复默认(清空数据)</button></div>
    <div class="hint">${
      HAS_FS
        ? "连接文件夹后, 数据会自动写成里面的 json 文件(几秒内落盘), 清缓存/重装浏览器都不丢。换电脑时把文件夹拷过去, 重新连接即可。仅 Chrome / Edge 支持。"
        : "当前浏览器不支持连接文件夹(需电脑版 Chrome/Edge)。兜底方案: 定期点「导出备份」存一份 json 文件, 数据丢失后「导入备份」一键恢复; 手机上可用「分享备份」存进文件管理器/iCloud。普通清缓存不会丢数据, 但「清除网站数据/Cookie」或 Safari 的「清除历史记录与网站数据」会。"
    }</div>
    <input type="file" id="vault-file" accept=".json,application/json" style="display:none">`;
  document.body.appendChild(panel);

  const $ = (id) => document.getElementById(id);
  const statusEl = $("vault-status");
  function renderBk() {
    const el = $("vault-bk");
    if (!el) return;
    if (!myKeys().length) { el.textContent = "上次备份: (暂无数据)"; return; }
    const last = lastBackupAt();
    el.textContent = "上次备份: " + (!last ? "从未备份" :
      backupAgeDays() === 0 ? "今天" : backupAgeDays() + " 天前");
  }
  async function setStatus(msg) {
    if (msg) { statusEl.textContent = "状态: " + msg; return; }
    if (!dir) { statusEl.textContent = "状态: 数据保存在当前浏览器(未连接文件夹)"; return; }
    statusEl.textContent = "状态: 已连接文件夹「" + dir.name + "」, 改动自动写入";
  }

  btn.onclick = () => panel.classList.toggle("open");
  document.addEventListener("click", (e) => {
    if (panel.classList.contains("open") && !panel.contains(e.target) && e.target !== btn)
      panel.classList.remove("open");
  });
  if (HAS_FS) {
    $("vault-connect").onclick = () => {
      const h = idbGet(STORE_KEY).then(got => got && got.queryPermission ?
        reconnect() : connectNew());
    };
    $("vault-disconnect").onclick = disconnect;
  }
  $("vault-export").onclick = exportBackup;
  $("vault-import").onclick = () => $("vault-file").click();
  if (navigator.canShare) {
    $("vault-share-row").style.display = "";
    $("vault-share").onclick = shareBackup;
  }
  $("vault-file").onchange = (e) => { if (e.target.files[0]) importBackup(e.target.files[0]); e.target.value = ""; };
  $("vault-reset").onclick = resetAll;

  /* ---------------- 首次访问提示 ---------------- */
  if (!localStorage.getItem("vault_notice_ok")) {
    const bar = document.createElement("div");
    bar.id = "vault-banner";
    bar.innerHTML = `<span>💡 ${NAME}的数据保存在当前浏览器里, 清理浏览器数据会丢失。` +
      (HAS_FS ? "可点右下角 ⚙ 连接数据文件夹(清缓存不丢)或导出备份。" : "可点右下角 ⚙ 导出备份。") +
      `</span><button>知道了</button>`;
    bar.querySelector("button").onclick = () => {
      _set.call(localStorage, "vault_notice_ok", "1");
      bar.remove();
    };
    document.body.appendChild(bar);
  }

  /* ---------------- 备份提醒(未连接文件夹时的自动兜底) ---------------- */
  function needRemind() {
    if (dir || !myKeys().length) return false;             // 连着文件夹或没数据就不用提醒
    if (!localStorage.getItem("vault_notice_ok")) return false;
    const due = Date.now() >= (Number(localStorage.getItem(LS_REMIND)) || 0);
    const last = lastBackupAt();
    if (last) return Date.now() - last >= 14 * 864e5 && due;
    // 从未备份: 数据存在满 3 天才提醒, 避免刚用一次就警告
    const first = Number(localStorage.getItem(LS_FIRST)) || Date.now();
    return Date.now() - first >= 3 * 864e5 && due;
  }
  function showRemindBar() {
    const bar = document.createElement("div");
    bar.id = "vault-banner";
    const desc = lastBackupAt() ? `距上次备份已 ${backupAgeDays()} 天` : "还从未备份过";
    bar.innerHTML = `<span>⚠ ${desc}, 浏览器数据一旦被清理就找不回了, 建议先导出一份。</span>` +
      `<button id="vault-bk-now">⬇ 立即导出</button><button id="vault-bk-later">14 天内不再提醒</button>`;
    bar.querySelector("#vault-bk-now").onclick = () => { exportBackup(); bar.remove(); updateBadge(); };
    bar.querySelector("#vault-bk-later").onclick = () => {
      _set.call(localStorage, LS_REMIND, String(Date.now() + 14 * 864e5));
      bar.remove(); updateBadge();
    };
    document.body.appendChild(bar);
  }
  if (needRemind()) showRemindBar();
  if (myKeys().length && !localStorage.getItem(LS_FIRST))
    _set.call(localStorage, LS_FIRST, String(Date.now()));   // 记下首次产生数据的时间
  updateBadge();
  renderBk();

  /* ---------------- 启动: 恢复已记住的文件夹 ---------------- */
  (async () => {
    try {   // 申请持久化存储: 防止浏览器在磁盘紧张时自动清理本站数据(全浏览器通用)
      if (navigator.storage && navigator.storage.persist) await navigator.storage.persist();
    } catch (e) { }
    const h = await idbGet(STORE_KEY).catch(() => null);
    if (!h) { setStatus(); return; }
    try {
      const p = await h.queryPermission({ mode: "readwrite" });
      if (p === "granted") await connect(h);
      else setStatus("已记住文件夹「" + h.name + "」, 点「📁 连接数据文件夹」重新授权");
    } catch (e) { setStatus(); }
  })();

  setInterval(flush, 3000);
  document.addEventListener("visibilitychange", () => { if (document.hidden) flush(); });
  window.addEventListener("beforeunload", () => { flush(); });

  /* 测试钩子(不影响正常使用) */
  window.__vault = { flush, status: () => ({ connected: !!dir, name: dir && dir.name, keys: myKeys(), lastBackupAt: lastBackupAt() }), adopt: (h) => connect(h), disconnect, needRemind };
})();
