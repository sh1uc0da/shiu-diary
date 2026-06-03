/* ============================================================
   詩雨國日記 — 共用元件 (components.jsx)
   ============================================================ */

/* —— 線稿圖示 —— */
const I = {
  home: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9.5h14V10"/><path d="M9.5 19.5v-5h5v5"/></svg>),
  user: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="8" r="3.6"/><path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5"/></svg>),
  pen: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M15.5 5.5 18.5 8.5"/><path d="M4 20l1-4L16 5a2.1 2.1 0 0 1 3 3L8 19l-4 1Z"/></svg>),
  mail: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5.5" width="18" height="13" rx="2.2"/><path d="m4 7 8 6 8-6"/></svg>),
  heart: ({ filled, ...rest }) => (<svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...rest}><path d="M12 20s-7-4.4-9.2-9C1.3 8 2.6 5 5.6 5 7.6 5 9 6.3 12 9c3-2.7 4.4-4 6.4-4 3 0 4.3 3 2.8 6-2.2 4.6-9.2 9-9.2 9Z"/></svg>),
  chat: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 5.5h16v10H9l-4 3.5v-3.5H4Z"/></svg>),
  lock: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="5" y="10.5" width="14" height="9.5" rx="2.2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><circle cx="12" cy="15" r="1.1" fill="currentColor" stroke="none"/></svg>),
  globe: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="8.2"/><path d="M3.8 12h16.4M12 3.8c2.5 2.3 2.5 13.9 0 16.4M12 3.8c-2.5 2.3-2.5 13.9 0 16.4"/></svg>),
  send: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 12 20 4l-5 16-3.5-6L4 12Z"/></svg>),
  back: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M15 5l-7 7 7 7"/></svg>),
  check: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12.5 10 17 19 6.5"/></svg>),
  drop: (p) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2.5c3.4 4.3 6.5 8 6.5 11.6A6.5 6.5 0 0 1 5.5 14.1C5.5 10.5 8.6 6.8 12 2.5Z"/></svg>),
  umbrella: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3v2"/><path d="M3.2 11.5a8.8 8.8 0 0 1 17.6 0c-1.6-1.2-2.9-1.2-4.4 0-1.5-1.2-2.8-1.2-4.4 0-1.6-1.2-2.9-1.2-4.4 0-1.5-1.2-2.8-1.2-4 0Z"/><path d="M12 11.5V19a2.4 2.4 0 0 1-4.8 0"/></svg>),
  sparkle: (p) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3Z"/></svg>),
  trash: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 7h14M10 7V5h4v2M6.5 7l.8 12h9.4l.8-12"/></svg>),
};

function GoogleG(p) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" {...p}>
      <path fill="#4285F4" d="M22.5 12.2c0-.7-.06-1.4-.18-2.05H12v3.9h5.9a5.05 5.05 0 0 1-2.19 3.32v2.75h3.54c2.07-1.9 3.25-4.72 3.25-7.92Z"/>
      <path fill="#34A853" d="M12 23c2.95 0 5.43-.98 7.24-2.65l-3.54-2.75c-.98.66-2.24 1.05-3.7 1.05-2.85 0-5.26-1.92-6.12-4.5H2.23v2.84A11 11 0 0 0 12 23Z"/>
      <path fill="#FBBC05" d="M5.88 14.15a6.6 6.6 0 0 1 0-4.3V7.01H2.23a11 11 0 0 0 0 9.98l3.65-2.84Z"/>
      <path fill="#EA4335" d="M12 5.5c1.6 0 3.04.55 4.17 1.63l3.13-3.13C17.43 2.18 14.95 1 12 1A11 11 0 0 0 2.23 7.01l3.65 2.84C6.74 7.42 9.15 5.5 12 5.5Z"/>
    </svg>
  );
}

/* —— 頭像 —— */
function Avatar({ name, size, cls }) {
  const bg = DB.colorFor(name);
  return (
    <div className={"avatar " + (cls || "")} style={{ background: bg, width: size, height: size, fontSize: size ? size * 0.46 : undefined }}>
      {DB.initial(name)}
    </div>
  );
}

/* —— 相對時間 —— */
function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "剛剛";
  const m = Math.floor(s / 60); if (m < 60) return m + " 分鐘前";
  const h = Math.floor(m / 60); if (h < 24) return h + " 小時前";
  const d = Math.floor(h / 24); if (d < 7) return d + " 天前";
  const dt = new Date(ts);
  return `${dt.getMonth() + 1} 月 ${dt.getDate()} 日`;
}
function fullTime(ts) {
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/* —— 飄落雨絲背景 —— */
function RainBackdrop({ count = 14, tone = "rgba(111,143,153,.20)" }) {
  const drops = React.useMemo(() =>
    Array.from({ length: count }).map((_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 6,
      dur: 3.6 + Math.random() * 3,
      len: 28 + Math.random() * 36,
      op: 0.25 + Math.random() * 0.5,
    })), [count]);
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {drops.map((d, i) => (
        <span key={i} style={{
          position: "absolute", top: "-12%", left: d.left + "%",
          width: 1.5, height: d.len, opacity: d.op,
          background: `linear-gradient(${tone}, transparent)`,
          animation: `rainfall ${d.dur}s linear ${d.delay}s infinite`,
        }} />
      ))}
      <style>{`@keyframes rainfall{0%{transform:translateY(-10vh)}100%{transform:translateY(120vh)}}`}</style>
    </div>
  );
}

/* —— 小提示 toast —— */
function useToast() {
  const [msg, setMsg] = React.useState(null);
  const ref = React.useRef();
  const show = React.useCallback((m) => {
    setMsg(m); clearTimeout(ref.current);
    ref.current = setTimeout(() => setMsg(null), 2200);
  }, []);
  const node = <div className={"toast" + (msg ? " show" : "")}>{msg}</div>;
  return [show, node];
}

/* —— 解析 Google 登入回傳的 JWT —— */
function decodeJwt(token) {
  try {
    const p = token.split(".")[1];
    const json = decodeURIComponent(
      atob(p.replace(/-/g, "+").replace(/_/g, "/"))
        .split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
    );
    return JSON.parse(json);
  } catch (e) { return null; }
}

Object.assign(window, { I, GoogleG, Avatar, timeAgo, fullTime, RainBackdrop, useToast, decodeJwt });
