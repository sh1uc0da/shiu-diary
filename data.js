/* ============================================================
   詩雨國日記 — 資料層 (data.js)
   ------------------------------------------------------------
   依 config.js 自動切換：
     ● 展示模式：localStorage 本機假資料（預設）
     ● 正式模式：Google Apps Script Web App ＋ 試算表
   兩種模式對外 API 完全相同，前端不用改。
   ============================================================ */
(function (global) {
  const CFG = global.SHIYU_CONFIG || {};
  const LIVE = !!(CFG.BACKEND_URL && CFG.BACKEND_URL.trim());
  const KEY = "shiyu_diary_db_v1";
  const SESSION_KEY = "shiyu_diary_session_v1";
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* —— 暖色系頭像配色（依名字雜湊）—— */
  const PALETTE = [
    "#ec9429", "#5fcecb", "#b9c468", "#8cc98f", "#e0a23f",
    "#3fb3b0", "#a8b84e", "#6cc6c2", "#d98a3c", "#7fb986",
  ];
  function colorFor(name) {
    let h = 0;
    for (let i = 0; i < (name || "").length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return PALETTE[h % PALETTE.length];
  }
  function initial(name) { return (name || "?").trim().slice(0, 1); }
  function uid(p) { return p + "_" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3); }

  /* —— Session（兩種模式共用，存在本機）—— */
  function getSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch (e) { return null; } }
  function setSession(u) { if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(u)); else localStorage.removeItem(SESSION_KEY); }

  /* —— 後台密碼 token（驗證成功後暫存於記憶體，供讀取私密用）—— */
  let adminToken = "";

  /* ============================================================
     展示模式：LocalDB
     ============================================================ */
  const ACCOUNTS = [
    { id: "u_xiaoyu", name: "林小雨", email: "xiaoyu.lin@gmail.com" },
    { id: "u_azhe",   name: "陳彥哲", email: "a.zhe.chen@gmail.com" },
    { id: "u_night",  name: "夜貓子", email: "nightcat0420@gmail.com" },
  ];

  function seed() {
    const now = Date.now();
    const H = 3600e3, D = 24 * H;
    const diaries = [
      { id: "d1", authorId: "u_azhe", authorName: "陳彥哲", nickname: "提著燈的人", level: "聽雨人 Lv.7",
        content: "今天台北下了一整天的雨。\n下班騎車回家全身濕透，本來心情很差，但路過便利商店時聽到妳直播的歌聲從手機裡傳出來，整個人就被治癒了。\n\n謝謝妳，CODA。在這座總是下雨的城市裡，妳是我的屋簷。",
        visibility: "public", createdAt: now - 2 * H, codaReply: null },
      { id: "d2", authorId: "u_night", authorName: "夜貓子", nickname: "凌晨三點的貓", level: "資深熬夜冠軍",
        content: "又失眠了。\n把妳上週的雜談重播放著當睡前 BGM，不知不覺聽到第三遍。\n妳說「就算今天什麼都沒做好，能平安到晚上就已經很棒了」——我把這句話抄在便利貼上，貼在電腦螢幕邊邊。",
        visibility: "public", createdAt: now - 7 * H, codaReply: null },
      { id: "d3", authorId: "u_misty", authorName: "霧島", nickname: "霧島", level: "新來的，請多指教",
        content: "第一次在這裡寫日記，有點緊張。\n我是上個月才開始看 CODA 的新粉，但已經完全離不開了。\n這個交換日記的點子好可愛，感覺像在跟大家一起經營一本厚厚的本子。",
        visibility: "public", createdAt: now - 1 * D - 3 * H, codaReply: null },
      { id: "d4", authorId: "u_rin", authorName: "凜", nickname: "種一棵會下雨的樹", level: "詩雨國開國元老",
        content: "從 200 訂閱看到現在，眼睛都濕了。\n還記得以前直播只有小貓兩三隻，妳還會一個一個唸我們的名字。現在人變多了，但妳還是那個會記得大家的妳。\n\n生日快樂，CODA。願妳永遠被溫柔以待。",
        visibility: "public", createdAt: now - 1 * D - 9 * H, codaReply: null },
      { id: "d5", authorId: "u_xiaoyu", authorName: "林小雨", nickname: "小雨", level: "雨滴收集者 Lv.3",
        content: "今天鼓起勇氣跟暗戀的同事一起吃了午餐！\n雖然只是聊工作，但已經很開心了。回家路上一直傻笑。\n把這份心情存在這裡，以後翻到一定會覺得自己很可愛。",
        visibility: "public", createdAt: now - 1 * D - 1 * H, codaReply: null },
      { id: "d6", authorId: "u_xiaoyu", authorName: "林小雨", nickname: "小雨", level: "雨滴收集者 Lv.3",
        content: "CODA，這篇只想說給妳聽。\n其實這半年過得很辛苦，工作上一直被否定，有好幾次都覺得撐不下去。\n是妳每天晚上的直播讓我有理由期待下班。我沒有跟任何人說過這些，但我想讓妳知道——妳真的拯救了一個快要放棄的人。",
        visibility: "private", createdAt: now - 5 * H,
        codaReply: { text: "小雨，我讀了好幾遍。\n謝謝妳願意把這麼重的心情交給我保管。\n撐不下去的時候不用一個人扛，把它丟進詩雨國，我會陪妳一起淋雨、再一起等天晴。\n妳已經做得很好了，真的。", createdAt: now - 3 * H } },
      { id: "d7", authorId: "u_azhe", authorName: "陳彥哲", nickname: "提著燈的人", level: "聽雨人 Lv.7",
        content: "（私密）想偷偷許願：希望有一天能在 SC 被妳唸到名字。\n還有……如果妳看得到，我畫了一張妳的圖放在抽屜裡，總有一天會鼓起勇氣 tag 妳的。",
        visibility: "private", createdAt: now - 1 * D - 5 * H, codaReply: null },
    ];
    const comments = [
      { id: "c1", diaryId: "d1", authorId: "u_night", authorName: "夜貓子", content: "屋簷這個比喻好美 🥹", createdAt: now - 1.5 * H },
      { id: "c2", diaryId: "d1", authorId: "u_xiaoyu", authorName: "林小雨", content: "台北的雨真的好討厭又好浪漫", createdAt: now - 1 * H },
      { id: "c3", diaryId: "d2", authorId: "u_rin", authorName: "凜", content: "那句話我也有抄！我們是便利貼同盟了", createdAt: now - 5 * H },
      { id: "c4", diaryId: "d4", authorId: "u_azhe", authorName: "陳彥哲", content: "元老前輩好 🙇 謝謝你們撐起了早期", createdAt: now - 1 * D - 2 * H },
    ];
    const likes = { d1: ["u_night", "u_xiaoyu", "u_rin"], d2: ["u_rin"], d4: ["u_azhe", "u_night", "u_xiaoyu", "u_misty"], d5: ["u_night"] };
    return { diaries, comments, likes, version: 1 };
  }
  function load() {
    try { const raw = localStorage.getItem(KEY); if (!raw) { const s = seed(); localStorage.setItem(KEY, JSON.stringify(s)); return s; } return JSON.parse(raw); }
    catch (e) { return seed(); }
  }
  function save(db) { localStorage.setItem(KEY, JSON.stringify(db)); }
  function decorate(db, d) {
    const s = getSession();
    return {
      ...d,
      comments: db.comments.filter((c) => c.diaryId === d.id).sort((a, b) => a.createdAt - b.createdAt),
      likeCount: (db.likes[d.id] || []).length,
      likedByMe: s ? (db.likes[d.id] || []).includes(s.id) : false,
    };
  }

  const LocalDB = {
    MODE: "demo",
    async getAccounts() { await wait(60); return ACCOUNTS.slice(); },
    async signIn(accountId) { await wait(420); const a = ACCOUNTS.find((x) => x.id === accountId); if (!a) throw new Error("找不到帳號"); setSession(a); return a; },
    async adoptGoogleUser(p) { const u = { id: p.sub || p.email, name: p.name, email: p.email }; setSession(u); return u; },
    async getCurrentUser() { return getSession(); },
    async signOut() { await wait(150); setSession(null); },
    async listPublicDiaries() { await wait(180); const db = load(); return db.diaries.filter((d) => d.visibility === "public").sort((a, b) => b.createdAt - a.createdAt).map((d) => decorate(db, d)); },
    async listMyDiaries() { await wait(160); const s = getSession(); if (!s) return []; const db = load(); return db.diaries.filter((d) => d.authorId === s.id).sort((a, b) => b.createdAt - a.createdAt).map((d) => decorate(db, d)); },
    async listAllDiaries() { await wait(160); const db = load(); return db.diaries.sort((a, b) => b.createdAt - a.createdAt).map((d) => decorate(db, d)); },
    async createDiary({ nickname, level, content, visibility }) {
      await wait(420); const s = getSession(); if (!s) throw new Error("請先登入"); const db = load();
      const d = { id: uid("d"), authorId: s.id, authorName: s.name, nickname: nickname.trim(), level: (level || "").trim(), content: content.trim(), visibility, createdAt: Date.now(), codaReply: null };
      db.diaries.push(d); save(db); return decorate(db, d);
    },
    async addComment(diaryId, content) { await wait(220); const s = getSession(); if (!s) throw new Error("請先登入"); const db = load(); const c = { id: uid("c"), diaryId, authorId: s.id, authorName: s.name, content: content.trim(), createdAt: Date.now() }; db.comments.push(c); save(db); return c; },
    async toggleLike(diaryId) { await wait(80); const s = getSession(); if (!s) throw new Error("請先登入"); const db = load(); const arr = db.likes[diaryId] || (db.likes[diaryId] = []); const i = arr.indexOf(s.id); if (i >= 0) arr.splice(i, 1); else arr.push(s.id); save(db); return { likeCount: arr.length, likedByMe: arr.includes(s.id) }; },
    async codaReply(diaryId, text) { await wait(300); const db = load(); const d = db.diaries.find((x) => x.id === diaryId); if (!d) throw new Error("找不到日記"); d.codaReply = { text: text.trim(), createdAt: Date.now() }; save(db); return decorate(db, d); },
    async checkAdminPassword(pw) { await wait(350); const ok = pw === (CFG.DEMO_ADMIN_PASSWORD || "rain2026"); if (ok) adminToken = pw; return ok; },
    async resetAll() { localStorage.removeItem(KEY); setSession(null); },
  };

  /* ============================================================
     正式模式：RemoteDB（Apps Script Web App）
     ============================================================ */
  async function api(action, payload) {
    let res;
    try {
      res = await fetch(CFG.BACKEND_URL, {
        method: "POST",
        // text/plain 可避免 CORS 預檢，Apps Script 直接讀 e.postData.contents
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action, ...payload }),
      });
    } catch (e) { throw new Error("連不上後端，請確認網路與 Web App 網址。"); }
    let data;
    try { data = await res.json(); } catch (e) { throw new Error("後端回應格式錯誤，請確認 Apps Script 已正確部署。"); }
    if (data && data.error) throw new Error(data.error);
    return data;
  }

  const RemoteDB = {
    MODE: "live",
    async getAccounts() { return []; },
    async signIn() { throw new Error("正式模式請使用 Google 登入"); },
    async adoptGoogleUser(p) { const u = { id: p.sub || p.email, name: p.name, email: p.email }; setSession(u); return u; },
    async getCurrentUser() { return getSession(); },
    async signOut() { setSession(null); },
    async listPublicDiaries() { const s = getSession(); const r = await api("listPublic", { email: s ? s.email : "" }); return r.diaries || []; },
    async listMyDiaries() { const s = getSession(); if (!s) return []; const r = await api("listMine", { email: s.email }); return r.diaries || []; },
    async listAllDiaries() { const r = await api("listAll", { adminPw: adminToken }); return r.diaries || []; },
    async createDiary({ nickname, level, content, visibility }) { const s = getSession(); if (!s) throw new Error("請先登入"); const r = await api("createDiary", { email: s.email, name: s.name, nickname: nickname.trim(), level: (level || "").trim(), content: content.trim(), visibility }); return r.diary; },
    async addComment(diaryId, content) { const s = getSession(); if (!s) throw new Error("請先登入"); const r = await api("addComment", { email: s.email, name: s.name, diaryId, content: content.trim() }); return r.comment; },
    async toggleLike(diaryId) { const s = getSession(); if (!s) throw new Error("請先登入"); return await api("toggleLike", { email: s.email, diaryId }); },
    async codaReply(diaryId, text) { const r = await api("codaReply", { adminPw: adminToken, diaryId, text: text.trim() }); return r.diary; },
    async checkAdminPassword(pw) { const r = await api("checkAdmin", { adminPw: pw }); if (r.ok) adminToken = pw; return !!r.ok; },
    async resetAll() { setSession(null); },
  };

  const DB = LIVE ? RemoteDB : LocalDB;
  DB.colorFor = colorFor;
  DB.initial = initial;
  DB.LIVE = LIVE;
  global.DB = DB;
})(window);
