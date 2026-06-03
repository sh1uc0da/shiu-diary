# 詩雨國日記 ☂

以 VTuber **CODA** 為核心的交換日記社群。粉絲可以寫公開日記給大家看，或寫私密日記只給 CODA。

## 檔案說明

| 檔案 | 用途 |
|---|---|
| `index.html` | 首頁（自動轉到 `詩雨國日記.html`） |
| `詩雨國日記.html` | 前台：時間軸、寫日記、個人頁、留言 |
| `詩雨國日記-後台.html` | CODA 後台：密碼保護，看所有投稿、回覆私密日記 |
| `詩雨國日記-串接教學.html` | 接上 Google 後端的圖文步驟 |
| `config.js` | **你要填的設定**：後端網址、Google 登入金鑰 |
| `Code.gs` | Google Apps Script 後端程式（貼到 Apps Script，不是放網站） |
| 其餘 `.js / .jsx / .css` | 程式與樣式，原樣放著即可 |

## 兩種模式

- **展示模式**：`config.js` 兩個值留空。資料存本機、模擬登入，適合預覽。
- **正式模式**：填好 `BACKEND_URL` 與 `GOOGLE_CLIENT_ID` 後，改用 Google 試算表存資料、真實 Google 登入。

## 上線（GitHub Pages）

1. 把這個資料夾的內容上傳到 GitHub repo。
2. repo → **Settings → Pages**，Source 選 `main` 分支、`/ (root)`，儲存。
3. 等幾分鐘，網站會在 `https://你的帳號.github.io/repo名稱/` 上線。
4. 把這個網址加進 Google Cloud Console 的「已授權的 JavaScript 來源」，Google 登入才能運作。

詳細後端設定請打開 `詩雨國日記-串接教學.html`。

> 注意：`Code.gs` 是貼到 Google Apps Script 用的，**不需要**也不應該靠它提供網站服務。
