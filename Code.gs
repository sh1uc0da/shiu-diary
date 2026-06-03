/*****************************************************************
 * 詩雨國日記 — Google Apps Script 後端 (Code.gs)
 * ---------------------------------------------------------------
 * 用一份 Google 試算表當資料庫，部署成 Web App 後即為後端 API。
 *
 * 安裝步驟（詳見「詩雨國日記-串接教學.html」）：
 *   1. 建立一份 Google 試算表
 *   2. 在試算表上方選單：擴充功能 → Apps Script
 *   3. 把這整個檔案內容貼進去，覆蓋原本的 myFunction
 *   4. 改下面的 ADMIN_PASSWORD 成你自己的密碼
 *   5. 執行一次 setup（建立工作表與標題列）
 *   6. 部署 → 新增部署作業 → 類型「網頁應用程式」
 *        - 執行身分：我
 *        - 誰可以存取：任何人
 *   7. 複製產生的 /exec 網址，貼到前端的 config.js → BACKEND_URL
 *****************************************************************/

const ADMIN_PASSWORD = 'rain2026';   // ← 改成你自己的後台密碼

const SHEETS = {
  diaries:  { name: 'Diaries',  headers: ['id','createdAt','authorEmail','authorName','nickname','level','content','visibility','codaReplyText','codaReplyAt'] },
  comments: { name: 'Comments', headers: ['id','diaryId','createdAt','authorEmail','authorName','content'] },
  likes:    { name: 'Likes',    headers: ['diaryId','email','createdAt'] },
};

/* —— 第一次手動執行：建立工作表與標題列 —— */
function setup() {
  const ss = SpreadsheetApp.getActive();
  Object.keys(SHEETS).forEach(function (k) {
    const def = SHEETS[k];
    let sh = ss.getSheetByName(def.name);
    if (!sh) sh = ss.insertSheet(def.name);
    if (sh.getLastRow() === 0) sh.appendRow(def.headers);
  });
  // 移除預設的「工作表1 / Sheet1」（若為空）
  const first = ss.getSheets()[0];
  if (['工作表1','Sheet1'].indexOf(first.getName()) >= 0 && first.getLastRow() === 0 && ss.getSheets().length > 1) {
    ss.deleteSheet(first);
  }
  return 'setup done';
}

/* ===================== 路由 ===================== */
function doGet() {
  return json({ ok: true, service: '詩雨國日記 API', time: Date.now() });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const a = body.action;
    let out;
    switch (a) {
      case 'listPublic':  out = { diaries: listPublic(body.email || '') }; break;
      case 'listMine':    out = { diaries: listMine(body.email || '') }; break;
      case 'listAll':     requireAdmin(body.adminPw); out = { diaries: listAll() }; break;
      case 'createDiary': out = { diary: createDiary(body) }; break;
      case 'addComment':  out = { comment: addComment(body) }; break;
      case 'toggleLike':  out = toggleLike(body.email, body.diaryId); break;
      case 'codaReply':   requireAdmin(body.adminPw); out = { diary: codaReply(body.diaryId, body.text) }; break;
      case 'checkAdmin':  out = { ok: body.adminPw === ADMIN_PASSWORD }; break;
      default: out = { error: '未知的 action：' + a };
    }
    return json(out);
  } catch (err) {
    return json({ error: String(err && err.message || err) });
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

function requireAdmin(pw) { if (pw !== ADMIN_PASSWORD) throw new Error('後台密碼錯誤'); }

/* ===================== 資料存取 ===================== */
function sheet(key) {
  const ss = SpreadsheetApp.getActive();
  const def = SHEETS[key];
  let sh = ss.getSheetByName(def.name);
  if (!sh) { sh = ss.insertSheet(def.name); sh.appendRow(def.headers); }
  return sh;
}
function rows(key) {
  const sh = sheet(key);
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).map(function (r, i) {
    const o = { _row: i + 2 };
    headers.forEach(function (h, c) { o[h] = r[c]; });
    return o;
  });
}
function uid(p) { return p + '_' + Utilities.getUuid().slice(0, 8); }

/* —— 組裝成前端要的格式 —— */
function commentsFor(diaryId) {
  return rows('comments')
    .filter(function (c) { return String(c.diaryId) === String(diaryId); })
    .sort(function (a, b) { return Number(a.createdAt) - Number(b.createdAt); })
    .map(function (c) { return { id: c.id, authorName: c.authorName, content: c.content, createdAt: Number(c.createdAt) }; });
}
function likeRowsFor(diaryId, allLikes) {
  return allLikes.filter(function (l) { return String(l.diaryId) === String(diaryId); });
}
function decorate(d, email, allLikes) {
  const likes = likeRowsFor(d.id, allLikes);
  return {
    id: d.id,
    authorId: d.authorEmail,
    authorName: d.authorName,
    nickname: d.nickname,
    level: d.level,
    content: d.content,
    visibility: d.visibility,
    createdAt: Number(d.createdAt),
    codaReply: d.codaReplyText ? { text: d.codaReplyText, createdAt: Number(d.codaReplyAt) || Number(d.createdAt) } : null,
    comments: commentsFor(d.id),
    likeCount: likes.length,
    likedByMe: email ? likes.some(function (l) { return String(l.email) === String(email); }) : false,
  };
}

/* ===================== 各功能 ===================== */
function listPublic(email) {
  const allLikes = rows('likes');
  return rows('diaries')
    .filter(function (d) { return d.visibility === 'public'; })
    .sort(function (a, b) { return Number(b.createdAt) - Number(a.createdAt); })
    .map(function (d) { return decorate(d, email, allLikes); });
}
function listMine(email) {
  const allLikes = rows('likes');
  return rows('diaries')
    .filter(function (d) { return String(d.authorEmail) === String(email); })
    .sort(function (a, b) { return Number(b.createdAt) - Number(a.createdAt); })
    .map(function (d) { return decorate(d, email, allLikes); });
}
function listAll() {
  const allLikes = rows('likes');
  return rows('diaries')
    .sort(function (a, b) { return Number(b.createdAt) - Number(a.createdAt); })
    .map(function (d) { return decorate(d, '', allLikes); });
}
function createDiary(b) {
  if (!b.email) throw new Error('請先登入');
  if (!b.nickname || !b.content) throw new Error('暱稱與內容必填');
  const id = uid('d');
  const now = Date.now();
  const vis = b.visibility === 'private' ? 'private' : 'public';
  sheet('diaries').appendRow([id, now, b.email, b.name || '', String(b.nickname).slice(0,40), String(b.level||'').slice(0,40), b.content, vis, '', '']);
  const d = { id: id, createdAt: now, authorEmail: b.email, authorName: b.name||'', nickname: b.nickname, level: b.level||'', content: b.content, visibility: vis, codaReplyText: '', codaReplyAt: '' };
  return decorate(d, b.email, rows('likes'));
}
function addComment(b) {
  if (!b.email) throw new Error('請先登入');
  if (!b.content) throw new Error('留言不可空白');
  const id = uid('c');
  const now = Date.now();
  sheet('comments').appendRow([id, b.diaryId, now, b.email, b.name || '', b.content]);
  return { id: id, authorName: b.name || '', content: b.content, createdAt: now };
}
function toggleLike(email, diaryId) {
  if (!email) throw new Error('請先登入');
  const sh = sheet('likes');
  const all = rows('likes');
  const mine = all.filter(function (l) { return String(l.diaryId) === String(diaryId) && String(l.email) === String(email); });
  if (mine.length) {
    // 取消讚：刪除該列（由下往上刪避免位移）
    mine.map(function (m) { return m._row; }).sort(function (a, b) { return b - a; }).forEach(function (r) { sh.deleteRow(r); });
    const cnt = all.filter(function (l) { return String(l.diaryId) === String(diaryId); }).length - mine.length;
    return { likeCount: cnt, likedByMe: false };
  } else {
    sh.appendRow([diaryId, email, Date.now()]);
    const cnt = all.filter(function (l) { return String(l.diaryId) === String(diaryId); }).length + 1;
    return { likeCount: cnt, likedByMe: true };
  }
}
function codaReply(diaryId, text) {
  if (!text) throw new Error('回覆不可空白');
  const sh = sheet('diaries');
  const all = rows('diaries');
  const target = all.filter(function (d) { return String(d.id) === String(diaryId); })[0];
  if (!target) throw new Error('找不到日記');
  const headers = SHEETS.diaries.headers;
  const colReplyText = headers.indexOf('codaReplyText') + 1;
  const colReplyAt = headers.indexOf('codaReplyAt') + 1;
  const now = Date.now();
  sh.getRange(target._row, colReplyText).setValue(text);
  sh.getRange(target._row, colReplyAt).setValue(now);
  target.codaReplyText = text; target.codaReplyAt = now;
  return decorate(target, '', rows('likes'));
}

/* ===================== 工具 ===================== */
function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
