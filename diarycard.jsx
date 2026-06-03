/* ============================================================
   詩雨國日記 — 日記卡片 (diarycard.jsx)
   ============================================================ */

function CodaReplyBlock({ reply }) {
  return (
    <div className="coda-reply">
      <div className="crh">
        <I.drop width="15" height="15" style={{ color: "var(--rain-deep)" }} />
        <span className="cn">CODA</span>
        <span className="cb">本人回覆</span>
      </div>
      <div className="crtext">{reply.text}</div>
      <div className="crtime">{fullTime(reply.createdAt)}</div>
    </div>
  );
}

function DiaryCard({ diary, user, onRequireLogin, onLiked, onCommented, tweaks }) {
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [local, setLocal] = React.useState(diary);
  React.useEffect(() => setLocal(diary), [diary.id, diary.likeCount, diary.comments.length, diary.codaReply]);

  const isPrivate = local.visibility === "private";

  async function like() {
    if (!user) return onRequireLogin();
    const r = await DB.toggleLike(local.id);
    setLocal((p) => ({ ...p, ...r }));
    onLiked && onLiked();
  }
  async function submit(e) {
    e.preventDefault();
    if (!user) return onRequireLogin();
    if (!text.trim() || busy) return;
    setBusy(true);
    const c = await DB.addComment(local.id, text);
    setLocal((p) => ({ ...p, comments: [...p.comments, c] }));
    setText(""); setBusy(false);
    onCommented && onCommented();
  }

  return (
    <article className={"diary" + (isPrivate ? " private" : "") + (tweaks && !tweaks.paperLines ? " no-lines" : "")}>
      <div className="diary-head">
        <Avatar name={local.nickname} size={42} />
        <div className="who" style={{ flex: 1 }}>
          <div className="who-name">
            {local.nickname}
            {local.level ? <span className="lvl">{local.level}</span> : null}
          </div>
          <div className="who-time">{timeAgo(local.createdAt)}</div>
        </div>
        {isPrivate
          ? <span className="tag tag-private"><I.lock width="13" height="13" /> 只給 CODA</span>
          : <span className="tag tag-public"><I.globe width="13" height="13" /> 公開</span>}
      </div>

      <div className="diary-body">{local.content}</div>

      {isPrivate ? (
        local.codaReply
          ? <CodaReplyBlock reply={local.codaReply} />
          : (
            <div className="coda-reply" style={{ background: "var(--paper-deep)", borderColor: "var(--line)" }}>
              <div className="crtext muted" style={{ fontSize: 14, display: "flex", gap: 8, alignItems: "center" }}>
                <I.umbrella width="17" height="17" style={{ color: "var(--ink-faint)" }} />
                靜靜等待 CODA 撐傘走來……
              </div>
            </div>
          )
      ) : (
        <div className="diary-foot">
          <div className="foot-actions">
            <button className={"act" + (local.likedByMe ? " on" : "")} onClick={like}>
              <I.heart filled={local.likedByMe} /> {local.likeCount > 0 ? local.likeCount : "喜歡"}
            </button>
            <button className="act" onClick={() => setOpen((o) => !o)}>
              <I.chat /> {local.comments.length > 0 ? `${local.comments.length} 則留言` : "留言"}
            </button>
          </div>

          {(open || local.comments.length > 0) && (
            <div className="comments">
              {local.comments.map((c) => (
                <div className="comment" key={c.id}>
                  <Avatar name={c.authorName} size={30} cls="sm" />
                  <div className="bubble">
                    <span className="cname">{c.authorName}</span>
                    <span className="ctime">{timeAgo(c.createdAt)}</span>
                    <div>{c.content}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {user ? (
            <form className="comment-input" onSubmit={submit}>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`以 ${user.name} 的身分留言…`} maxLength={200} />
              <button className="send" type="submit" disabled={!text.trim() || busy}><I.send width="18" height="18" /></button>
            </form>
          ) : (
            <button className="linkish" style={{ marginTop: 10, display: "block" }} onClick={onRequireLogin}>登入後即可留言 →</button>
          )}
        </div>
      )}
    </article>
  );
}

Object.assign(window, { DiaryCard, CodaReplyBlock });
