/* ============================================================
   詩雨國日記 — 主程式 (app.jsx)
   ============================================================ */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": ["#ec9429", "#cf7d14"],
  "handFont": "Ma Shan Zheng",
  "bodyFont": "LXGW WenKai TC",
  "paperNoise": 0.5,
  "paperLines": true,
  "radius": 16
}/*EDITMODE-END*/;

const FONT_STACK = {
  "Ma Shan Zheng": '"Ma Shan Zheng", "LXGW WenKai TC", cursive',
  "Long Cang": '"Long Cang", "LXGW WenKai TC", cursive',
  "LXGW WenKai TC": '"LXGW WenKai TC", "Noto Serif TC", serif',
  "Noto Serif TC": '"Noto Serif TC", serif',
  "Noto Sans TC": '"Noto Sans TC", sans-serif',
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [user, setUser] = React.useState(null);
  const [ready, setReady] = React.useState(false);
  const [guest, setGuest] = React.useState(false);
  const [route, setRoute] = React.useState("feed");
  const [showAuth, setShowAuth] = React.useState(false);
  const [reloadKey, setReloadKey] = React.useState(0);
  const [toast, toastNode] = useToast();

  /* 載入登入狀態 */
  React.useEffect(() => {
    DB.getCurrentUser().then((u) => { setUser(u); setReady(true); });
  }, []);

  /* 套用 Tweaks → CSS 變數 */
  React.useEffect(() => {
    const r = document.documentElement.style;
    const [a1, a2] = t.accent;
    r.setProperty("--brown", a1);
    r.setProperty("--brown-deep", a2);
    r.setProperty("--font-hand", FONT_STACK[t.handFont] || FONT_STACK["Ma Shan Zheng"]);
    r.setProperty("--font-body", FONT_STACK[t.bodyFont] || FONT_STACK["LXGW WenKai TC"]);
    r.setProperty("--paper-noise", String(t.paperNoise));
    r.setProperty("--radius", t.radius + "px");
  }, [t]);

  function requireLogin() { setShowAuth(true); }
  function onSignedIn(u) { setUser(u); setShowAuth(false); setGuest(true); }
  async function signOut() { await DB.signOut(); setUser(null); setGuest(false); setRoute("feed"); toast("已登出，下次見 ☂"); }

  function afterPost(d) {
    setReloadKey((k) => k + 1);
    setRoute(d.visibility === "private" ? "profile" : "feed");
    toast(d.visibility === "private" ? "已悄悄寄給 CODA ☂" : "日記已飄進時間軸 ☂");
  }

  if (!ready) {
    return <div className="stage"><div className="app" style={{ justifyContent: "center", alignItems: "center" }}><Loading /></div></div>;
  }

  /* —— 登入歡迎頁（未登入且未選擇先逛逛）—— */
  if (!user && !guest) {
    return (
      <div className="stage">
        <div className="app">
          <LoginView onSignedIn={onSignedIn} />
          <button className="linkish" style={{ position: "absolute", bottom: 28, left: 0, right: 0, margin: "0 auto", width: "fit-content", zIndex: 2 }} onClick={() => setGuest(true)}>
            先到時間軸逛逛 →
          </button>
        </div>
        <TweaksUI t={t} setTweak={setTweak} />
      </div>
    );
  }

  const goBackstage = () => { window.location.href = "%E8%A9%A9%E9%9B%A8%E5%9C%8B%E6%97%A5%E8%A8%98-%E5%BE%8C%E5%8F%B0.html"; };

  return (
    <div className="stage">
      <div className="app">
        {/* 頂部 */}
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark"><I.umbrella width="30" height="30" /></div>
            <div>
              <div className="brand-title">詩雨國日記</div>
              <div className="brand-sub">SHIU DIARY</div>
            </div>
          </div>
          {user ? (
            <button onClick={() => setRoute("profile")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <Avatar name={user.name} size={36} />
            </button>
          ) : (
            <button className="btn btn-ghost" style={{ padding: "8px 14px", fontSize: 14 }} onClick={requireLogin}><GoogleG /> 登入</button>
          )}
        </header>

        {/* 內容 */}
        <main className="scroll">
          {route === "feed" && <FeedView user={user} tweaks={t} reloadKey={reloadKey} onRequireLogin={requireLogin} />}
          {route === "write" && <WriteView user={user} tweaks={t} onRequireLogin={requireLogin} onPosted={afterPost} />}
          {route === "profile" && <ProfileView user={user} tweaks={t} reloadKey={reloadKey} onRequireLogin={requireLogin} onSignOut={signOut} onGoAdmin={goBackstage} />}
        </main>

        {/* 底部導覽 */}
        <nav className="tabbar">
          <button className={"tab" + (route === "feed" ? " active" : "")} onClick={() => setRoute("feed")}>
            <span className="tab-ico"><I.home /></span>時間軸
          </button>
          <button className="tab write-tab" onClick={() => setRoute("write")} aria-label="寫日記">
            <span className="penbtn"><I.pen /></span>
          </button>
          <button className={"tab" + (route === "profile" ? " active" : "")} onClick={() => setRoute("profile")}>
            <span className="tab-ico"><I.user /></span>我的
          </button>
        </nav>

        {showAuth && <GoogleModal onPick={onSignedIn} onClose={() => setShowAuth(false)} />}
        {toastNode}
      </div>
      <TweaksUI t={t} setTweak={setTweak} />
    </div>
  );
}

/* —— Tweaks 面板 —— */
function TweaksUI({ t, setTweak }) {
  return (
    <TweaksPanel>
      <TweakSection label="配色" />
      <TweakColor label="主色調" value={t.accent}
        options={[["#ec9429", "#cf7d14"], ["#5fcecb", "#2fa9a5"], ["#88a53a", "#6f8a2e"], ["#b07a4e", "#8a5a34"], ["#b25d47", "#8a3d2c"]]}
        onChange={(v) => setTweak("accent", v)} />
      <TweakSection label="字體" />
      <TweakSelect label="標題手寫字" value={t.handFont}
        options={["Ma Shan Zheng", "Long Cang", "LXGW WenKai TC"]}
        onChange={(v) => setTweak("handFont", v)} />
      <TweakSelect label="內文字體" value={t.bodyFont}
        options={["LXGW WenKai TC", "Noto Serif TC", "Noto Sans TC"]}
        onChange={(v) => setTweak("bodyFont", v)} />
      <TweakSection label="紙張質感" />
      <TweakSlider label="紙張紋理" value={t.paperNoise} min={0} max={1} step={0.05}
        onChange={(v) => setTweak("paperNoise", v)} />
      <TweakToggle label="日記橫線" value={t.paperLines}
        onChange={(v) => setTweak("paperLines", v)} />
      <TweakSlider label="卡片圓角" value={t.radius} min={4} max={28} step={1} unit="px"
        onChange={(v) => setTweak("radius", v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
