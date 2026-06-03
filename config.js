/* ============================================================
   詩雨國日記 — 設定檔 (config.js)
   ------------------------------------------------------------
   兩種模式，靠這個檔切換，程式碼完全不用改：

   ● 展示模式（兩個值都留空）
       資料存在「這台瀏覽器」，登入是模擬的。
       適合預覽、試玩、給朋友看樣子。

   ● 正式模式（兩個值都填好）
       資料存在「Google 試算表」，跨使用者共用，
       並使用「真正的 Google 登入」。

   ▼ 部署步驟請看「詩雨國日記-串接教學.html」
   ============================================================ */
window.SHIYU_CONFIG = {

  // 1) Apps Script Web App 網址（部署後得到的 https://script.google.com/macros/s/..../exec）
  //    留空 = 展示模式
  BACKEND_URL: "",

  // 2) Google OAuth 用戶端 ID（在 Google Cloud Console 建立，結尾是 .apps.googleusercontent.com）
  //    留空 = 用模擬登入（展示模式）
  GOOGLE_CLIENT_ID: "",

  // 3) 後台密碼（僅「展示模式」使用；正式模式的密碼放在 Apps Script 後端，不會外洩）
  DEMO_ADMIN_PASSWORD: "rain2026",
};
