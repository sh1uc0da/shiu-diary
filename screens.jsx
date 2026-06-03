/* ============================================================
   詩雨國日記 — 主要畫面 (screens.jsx)
   登入 / 首頁時間軸 / 寫日記 / 個人頁
   ============================================================ */

/* —————————————— Google 帳號選擇彈窗 —————————————— */
function GoogleModal({ onPick, onClose }) {
  const CFG = window.SHIYU_CONFIG || {};
  const useReal = !!(CFG.GOOGLE_CLIENT_ID && CFG.GOOGLE_CLIENT_ID.trim());
  const btnRef = React.useRef(null);
  const [accts, setAccts] = React.useState([]);
  const [loadingId, setLoadingId] = React.useState(null);
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    if (useReal) {
      const g = window.google;
      if (!g || !g.accounts || !g.accounts.id) { setErr("Google 登入元件尚未載入，請稍候再試一次。"); return; }
      try {
        g.accounts.id.initialize({
          client_id: CFG.GOOGLE_CLIENT_ID.trim(),
          callback: async (resp) => {
            const p = decodeJwt(resp.credential);
            if (!p || !p.email) { setErr("登入失敗，請再試一次。"); return; }
            const u = await DB.adoptGoogleUser({ sub: p.sub, name: p.name || p.email, email: p.email });
            onPick(u);
          },
        });
        if (btnRef.current) g.accounts.id.renderButton(btnRef.current, { theme: "outline", size: "large", text: "signin_with", shape: "pill", logo_alignment: "left", width: 280 });
      } catch (e) { setErr("Google 登入初始化失敗：" + e.message); }
    } else {
      DB.getAccounts().then(setAccts);
    }
  }, [useReal]);

  async function pick(a) {
    if (loadingId) return;
    setLoadingId(a.id);
    const u = await DB.signIn(a.id);
    onPick(u);
  }
  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="gmodal" onClick={(e) => e.stopPropagation()}>
        <div className="gmodal-head">
          <div className="glogo"><span style={{ color: "#4285F4" }}>G</span><span style={{ color: "#EA4335" }}>o</span><span style={{ color: "#FBBC05" }}>o</span><span style={{ color: "#4285F4" }}>g</span><span style={{ color: "#34A853" }}>l</span><span style={{ color: "#EA4335" }}>e</span></div>
          <div className="gtitle">{useReal ? "使用 Google 登入" : "選擇帳戶"}</div>
          <div className="gsub">以繼續使用「詩雨國日記」</div>
        </div>
        {useReal ? (
          <div style={{ padding: "26px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, minHeight: 90 }}>
            <div ref={btnRef}></div>
            {err && <div style={{ color: "#EA4335", fontSize: 13, textAlign: "center", lineHeight: 1.6 }}>{err}</div>}
          </div>
        ) : (
          accts.map((a) => (
            <div className="gacct" key={a.id} onClick={() => pick(a)} style={{ opacity: loadingId && loadingId !== a.id ? 0.4 : 1 }}>
              <div className="gav" style={{ background: DB.colorFor(a.name) }}>{DB.initial(a.name)}</div>
              <div style={{ flex: 1 }}>
                <div className="gnm">{a.name}</div>
                <div className="gem">{a.email}</div>
              </div>
              {loadingId === a.id && <div className="mini-spin" />}
            </div>
          ))
        )}
        <div className="gmodal-foot">{useReal ? "使用你的 Google 帳號登入詩雨國日記，你的真實姓名與信箱不會公開給其他人。" : "這是示範用的模擬登入。實際上線時，這裡會換成真正的 Google 帳號授權。"}</div>
      </div>
      <style>{`.mini-spin{width:18px;height:18px;border:2.5px solid #ddd;border-top-color:#4285F4;border-radius:50%;animation:spin .7s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* —————————————— 登入頁 —————————————— */
function LoginView({ onSignedIn }) {
  const [modal, setModal] = React.useState(false);
  return (
    <div className="login-wrap">
      <RainBackdrop count={18} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div className="login-logo"><I.umbrella width="60" height="60" /></div>
        <div className="login-tag">SHIU&nbsp;&nbsp;DIARY</div>
        <h1 className="login-title">詩雨國日記</h1>
        <p className="login-desc">
          在這座總是下著雨的國度裡，<br />
          寫一頁日記給 CODA。<br />
          也讀讀其他旅人留下的雨聲。
        </p>
        <button className="gbtn" onClick={() => setModal(true)}>
          <GoogleG /> 使用 Google 登入
        </button>
        <p className="hint" style={{ marginTop: 18, maxWidth: 260 }}>登入後即可投稿、留言，並收到 CODA 的悄悄話回覆。</p>
      </div>
      {modal && <GoogleModal onPick={onSignedIn} onClose={() => setModal(false)} />}
    </div>
  );
}

/* —————————————— 首頁・共同時間軸 —————————————— */
function FeedView({ user, onRequireLogin, tweaks, reloadKey }) {
  const [diaries, setDiaries] = React.useState(null);
  const load = React.useCallback(() => { DB.listPublicDiaries().then(setDiaries); }, []);
  React.useEffect(() => { load(); }, [load, reloadKey]);

  return (
    <div className="view">
      <div className="section-title"><I.drop width="20" height="20" style={{ color: "var(--rain)" }} /> 今天的雨聲</div>
      <p className="section-sub">大家寫給 CODA 的公開日記，依時間排列。</p>
      {diaries === null ? (
        <Loading />
      ) : diaries.length === 0 ? (
        <Empty icon={<I.umbrella width="46" height="46" />} title="還沒有人寫日記" sub="成為第一個在詩雨國留下雨聲的人吧。" />
      ) : (
        diaries.map((d) => (
          <DiaryCard key={d.id} diary={d} user={user} tweaks={tweaks}
            onRequireLogin={onRequireLogin} />
        ))
      )}
    </div>
  );
}

/* —————————————— 寫日記 —————————————— */
const PREF_KEY = "shiyu_diary_pref";
function WriteView({ user, onRequireLogin, onPosted, tweaks }) {
  const pref = React.useMemo(() => { try { return JSON.parse(localStorage.getItem(PREF_KEY) || "{}"); } catch { return {}; } }, []);
  const [nickname, setNickname] = React.useState(pref.nickname || "");
  const [level, setLevel] = React.useState(pref.level || "");
  const [content, setContent] = React.useState("");
  const [vis, setVis] = React.useState("public");
  const [busy, setBusy] = React.useState(false);

  if (!user) {
    return (
      <div className="view">
        <NeedLogin onRequireLogin={onRequireLogin} what="投稿日記" />
      </div>
    );
  }

  const canPost = nickname.trim() && content.trim() && !busy;
  async function post() {
    if (!canPost) return;
    setBusy(true);
    localStorage.setItem(PREF_KEY, JSON.stringify({ nickname: nickname.trim(), level: level.trim() }));
    const d = await DB.createDiary({ nickname, level, content, visibility: vis });
    setBusy(false);
    onPosted(d);
  }

  return (
    <div className="view">
      <div className="section-title"><I.pen width="20" height="20" style={{ color: "var(--brown)" }} /> 寫一頁日記</div>
      <p className="section-sub">寫給 CODA，也寫給這一刻的自己。</p>

      <div style={{ height: 8 }} />
      <div className="field">
        <label className="label">暱稱 <span className="req">＊</span></label>
        <input className="input" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="想用什麼名字署名呢？" maxLength={24} />
      </div>
      <div className="field">
        <label className="label">標籤 <span className="muted" style={{ fontSize: 12 }}>（自由填寫）</span></label>
        <input className="input" value={level} onChange={(e) => setLevel(e.target.value)} placeholder="例如：聽雨人、資深熬夜冠軍、CODA 頭號粉…" maxLength={24} />
        <p className="hint">給自己一個小標籤，這是你在詩雨國的身分喔。</p>
      </div>
      <div className="field">
        <label className="label">日記內容 <span className="req">＊</span></label>
        <textarea className="textarea" value={content} onChange={(e) => setContent(e.target.value)} placeholder="今天過得怎麼樣？有什麼想對 CODA 說的……" maxLength={1500} />
        <p className="hint">{content.length} / 1500</p>
      </div>
      <div className="field">
        <label className="label">這頁日記要給誰看？</label>
        <div className="choice">
          <label className={vis === "public" ? "sel-public" : ""}>
            <input type="radio" name="vis" checked={vis === "public"} onChange={() => setVis("public")} />
            <span className="ic"><I.globe width="22" height="22" style={{ color: vis === "public" ? "var(--rain-deep)" : "var(--ink-faint)" }} /></span>
            <div><div className="t1">公開</div><div className="t2">出現在共同時間軸，大家都能讀、能留言。</div></div>
          </label>
          <label className={vis === "private" ? "sel-private" : ""}>
            <input type="radio" name="vis" checked={vis === "private"} onChange={() => setVis("private")} />
            <span className="ic"><I.lock width="22" height="22" style={{ color: vis === "private" ? "var(--seal)" : "var(--ink-faint)" }} /></span>
            <div><div className="t1">私密</div><div className="t2">只有 CODA 看得到，並可能收到本人回覆。</div></div>
          </label>
        </div>
      </div>

      <button className="btn btn-primary btn-block" style={{ marginTop: 6 }} disabled={!canPost} onClick={post}>
        {busy ? "寄出中…" : (vis === "private" ? <span><I.lock width="17" height="17" style={{ marginRight: 6, verticalAlign: "-3px" }} />悄悄寄給 CODA</span> : <span><I.drop width="16" height="16" style={{ marginRight: 6, verticalAlign: "-2px" }} />投進時間軸</span>)}
      </button>
      <div style={{ height: 20 }} />
    </div>
  );
}

/* —————————————— 個人頁 —————————————— */
function ProfileView({ user, onRequireLogin, onSignOut, onGoAdmin, tweaks, reloadKey }) {
  const [diaries, setDiaries] = React.useState(null);
  const [filter, setFilter] = React.useState("all");
  React.useEffect(() => { if (user) DB.listMyDiaries().then(setDiaries); }, [user, reloadKey]);

  if (!user) return <div className="view"><NeedLogin onRequireLogin={onRequireLogin} what="查看個人頁" /></div>;

  const all = diaries || [];
  const pub = all.filter((d) => d.visibility === "public");
  const priv = all.filter((d) => d.visibility === "private");
  const shown = filter === "all" ? all : filter === "public" ? pub : priv;

  return (
    <div className="view">
      <div className="profile-hero">
        <div className="pav" style={{ background: DB.colorFor(user.name) }}>{DB.initial(user.name)}</div>
        <div className="pnm">{user.name}</div>
        <div className="pem">{user.email}</div>
        <div className="pstats">
          <div className="ps"><div className="n">{all.length}</div><div className="l">總日記</div></div>
          <div className="ps"><div className="n">{pub.length}</div><div className="l">公開</div></div>
          <div className="ps"><div className="n">{priv.length}</div><div className="l">私密</div></div>
        </div>
      </div>

      <div className="seg">
        <button className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>全部</button>
        <button className={filter === "public" ? "on" : ""} onClick={() => setFilter("public")}>公開</button>
        <button className={filter === "private" ? "on" : ""} onClick={() => setFilter("private")}>私密</button>
      </div>

      {diaries === null ? <Loading /> : shown.length === 0 ? (
        <Empty icon={<I.pen width="42" height="42" />} title="這裡還空空的" sub="去寫下第一頁日記吧。" />
      ) : (
        shown.map((d) => (
          <DiaryCard key={d.id} diary={d} user={user} tweaks={tweaks} onRequireLogin={onRequireLogin} />
        ))
      )}

      <hr className="divider" />
      <div style={{ padding: "0 2px 30px", textAlign: "center" }}>
        <button className="signout" onClick={onSignOut}>登出</button>
      </div>
    </div>
  );
}

/* —————————————— 小工具畫面 —————————————— */
function Loading() {
  return (
    <div className="empty">
      <div className="loaddrop"><I.drop width="34" height="34" style={{ color: "var(--rain)" }} /></div>
      <div className="em-s">正在收集雨滴…</div>
      <style>{`.loaddrop{animation:bob 1.1s ease-in-out infinite}@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(7px)}}`}</style>
    </div>
  );
}
function Empty({ icon, title, sub }) {
  return (
    <div className="empty">
      <div className="em-ic">{icon}</div>
      <div className="em-t">{title}</div>
      <div className="em-s">{sub}</div>
    </div>
  );
}
function NeedLogin({ onRequireLogin, what }) {
  return (
    <div style={{ paddingTop: 40 }}>
      <Empty icon={<I.lock width="44" height="44" />} title={`登入後即可${what}`} sub="用 Google 帳號登入詩雨國，留下屬於你的雨聲。" />
      <div style={{ textAlign: "center" }}>
        <button className="btn btn-primary" onClick={onRequireLogin}><GoogleG /> 使用 Google 登入</button>
      </div>
    </div>
  );
}

Object.assign(window, { GoogleModal, LoginView, FeedView, WriteView, ProfileView, Loading, Empty, NeedLogin });
