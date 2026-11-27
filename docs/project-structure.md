# 專案結構

應用程式在 `src/app`。`server/` 提供 Angular 靜態檔，並將公告 API 和登入請求轉給 `noah-core`。

```
src/
├── styles.scss
├── assets/
└── app/
    ├── layout/
    ├── pages/
    └── shared/
```

## layout

每頁都看得到的外框。

## pages

一個畫面一個資料夾，模板和樣式跟畫面放一起。型別、store，以及好幾個畫面一起用的樣式，留在這一層。

## shared

沒有業務、哪個功能都能用的畫面。

## core

全站都要用、又要做判斷的東西。這個資料夾還沒建。

## 樣式

禁止為了排版自己發明 class，也禁止寫 inline style（`style="..."`）。

畫面排版、間距、對齊、文字色、flex／grid 這類樣式，一律用 `@dandy1103/ui` 的 functional CSS（`u-*` utility）。元件外觀優先用套件元件（例如 `noah-button`、`noah-input`），不要在專案裡再寫一套 component SCSS 去蓋樣式。

輸入一律用 `noah-input`（套件已移除 `noahInput` directive）。沒有可見 label 時用 `ariaLabel`；樣式或行為不夠就擴充 library 元件，不要另開捷徑。

`src/styles.scss` 只負責載入套件樣式（含 `reset` 的 body 基底與 `u-*` utility）。缺樣式時先補 library，不要在公告專案開例外 class。

```html
<!-- ❌ -->
<div class="my-toolbar" style="display:flex;gap:8px">...</div>

<!-- ✅ -->
<div class="u-flex u-items-center u-gap-sm">...</div>
```

## 圖

放 `src/assets`。建置只會把這個資料夾送出去。一個功能自己的圖在裡面開子資料夾，全站都用的放根目錄。
