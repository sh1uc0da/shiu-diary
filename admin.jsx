/* ============================================================
   詩雨國日記 — 後台 (admin.jsx)
   密碼保護 / 全部投稿 / 私密日記回覆
   ============================================================ */

function AdminGate({ onPass, onExit }) {
  const [pw, setPw] = React.useState("");
  const [err, setErr] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr("");
    const ok = await DB.checkAdminPassword(pw);
    setBusy(false);
    if (ok) onPass(); else { setErr("密碼不對，再試一次。"); setPw(""); }
  }
  return (
    <div className="pwwrap">
      <RainBackdrop count={16} tone="rgba(111,143,153,.30)" />
      <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div className="lock"><I.lock width="50" height="50" /></div>
        <h2>CODA 後台</h2>
        <p>請輸入管理密碼，進入收信箱。</p>
        <form onSubmit={submit} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="• • • • • •" autoFocus />
          <div className="pwerr">{err}</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={onExit} style={{ background: "transparent", color: "#a98a66", borderColor: "#43321f" }}>返回</button>
            <button type="submit" className="btn btn-rain" disabled={busy || !pw}>{busy ? "驗證中…" : "進入後台"}</button>
          </div>
        </form>
        <div className="pwhint">示範密碼：<b style={{ color: "#c9ad88" }}>rain2026</b></div>
      </div>
    </div>
  );
}

function ReplyBox({ diary, onReplied }) {
  const [text, setText] = React.useState(diary.codaReply ? diary.codaReply.text : "");
  const [busy, setBusy] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  async function send() {
    if (!text.trim() || busy) return;
    setBusy(true);
    const d = await DB.codaReply(diary.id, text);
    setBusy(false); setSaved(true);
    setTimeout(() => setSaved(false), 1800);
    onReplied(d);
  }
  return (
    <div className="acard-reply">
      <div className="arh"><I.drop width="14" height="14" /> {diary.codaReply ? "已回覆（可修改）" : "回覆這封悄悄話"}</div>
      {diary.codaReply && <div className="existing">{diary.codaReply.text}</div>}
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="以 CODA 的身分，溫柔地回覆…" />
      <div className="arow">
        {saved && <span style={{ color: "var(--rain)", fontSize: 13 }}><I.check width="15" height="15" style={{ verticalAlign: "-2px" }} /> 已送出</span>}
        <button className="btn btn-rain" style={{ padding: "9px 18px", fontSize: 14 }} disabled={!text.trim() || busy} onClick={send}>
          {busy ? "送出中…" : diary.codaReply ? "更新回覆" : "送出回覆"}
        </button>
      </div>
    </div>
  );
}

function AdminCard({ diary, onReplied }) {
  const isPrivate = diary.visibility === "private";
  return (
    <div className={"acard" + (isPrivate ? " priv" : "")}>
      <div className="acard-head">
        <div className="aav" style={{ background: DB.colorFor(diary.nickname) }}>{DB.initial(diary.nickname)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="anm">
            {diary.nickname}
            {diary.level ? <span className="alvl">{diary.level}</span> : null}
          </div>
          <div className="atime">{fullTime(diary.createdAt)}・帳號：{diary.authorName}</div>
        </div>
        {isPrivate
          ? <span className="tag tag-private" style={{ flex: "none" }}><I.lock width="12" height="12" /> 私密</span>
          : <span className="tag tag-public" style={{ flex: "none" }}><I.globe width="12" height="12" /> 公開</span>}
      </div>
      <div className="acard-body">{diary.content}</div>
      {!isPrivate && (
        <div className="acard-meta">
          <span className="tag" style={{ background: "#3e2f20", color: "#c9ad88", border: "1px solid #4a3520" }}><I.heart width="12" height="12" /> {diary.likeCount}</span>
          <span className="tag" style={{ background: "#3e2f20", color: "#c9ad88", border: "1px solid #4a3520" }}><I.chat width="12" height="12" /> {diary.comments.length} 留言</span>
        </div>
      )}
      {isPrivate && <ReplyBox diary={diary} onReplied={onReplied} />}
    </div>
  );
}

function AdminDashboard({ onExit }) {
  const [diaries, setDiaries] = React.useState(null);
  const [filter, setFilter] = React.useState("private");
  const load = React.useCallback(() => DB.listAllDiaries().then(setDiaries), []);
  React.useEffect(() => { load(); }, [load]);

  const all = diaries || [];
  const priv = all.filter((d) => d.visibility === "private");
  const pub = all.filter((d) => d.visibility === "public");
  const waiting = priv.filter((d) => !d.codaReply);

  const shown = filter === "all" ? all : filter === "private" ? priv : filter === "public" ? pub : waiting;

  function onReplied(updated) {
    setDiaries((prev) => prev.map((d) => (d.id === updated.id ? { ...d, codaReply: updated.codaReply } : d)));
  }

  const chips = [
    ["private", `私密信箱 ${priv.length}`],
    ["waiting", `待回覆 ${waiting.length}`],
    ["public", `公開 ${pub.length}`],
    ["all", `全部 ${all.length}`],
  ];

  return (
    <div className="admin">
      <div className="admin-top">
        <div className="at-title"><I.umbrella width="24" height="24" className="dot" style={{ color: "var(--rain)" }} /> CODA 後台</div>
        <button className="signout" style={{ color: "#a98a66" }} onClick={onExit}>離開後台</button>
      </div>
      <div className="scroll" style={{ paddingBottom: 50 }}>
        <div className="admin-stat">
          <div className="stat"><div className="n">{all.length}</div><div className="l">總投稿</div></div>
          <div className="stat"><div className="n" style={{ color: "var(--seal)" }}>{priv.length}</div><div className="l">私密悄悄話</div></div>
          <div className="stat"><div className="n" style={{ color: "var(--rain)" }}>{waiting.length}</div><div className="l">等你回覆</div></div>
        </div>
        <div className="admin-filter">
          {chips.map(([k, label]) => (
            <button key={k} className={"chip" + (filter === k ? " on" : "")} onClick={() => setFilter(k)}>{label}</button>
          ))}
        </div>
        {diaries === null ? (
          <div className="empty" style={{ color: "#a98a66" }}><div className="em-s">載入投稿中…</div></div>
        ) : shown.length === 0 ? (
          <div className="empty" style={{ color: "#a98a66" }}><div className="em-t" style={{ color: "#c9ad88" }}>沒有投稿</div><div className="em-s">這個分類目前是空的。</div></div>
        ) : (
          shown.map((d) => <AdminCard key={d.id} diary={d} onReplied={onReplied} />)
        )}
      </div>
    </div>
  );
}

function AdminApp({ onExit }) {
  const [authed, setAuthed] = React.useState(false);
  return authed
    ? <AdminDashboard onExit={onExit} />
    : <AdminGate onPass={() => setAuthed(true)} onExit={onExit} />;
}

Object.assign(window, { AdminApp, AdminGate, AdminDashboard, AdminCard, ReplyBox });
