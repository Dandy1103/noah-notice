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

跟使用它的資料夾放一起。一個畫面自己的樣式放在該畫面，好幾個畫面一起用的留在 `pages`。外框的放 `layout`，共用畫面的放 `shared`。全站的顏色、字型放 `src/styles.scss`。

## 圖

放 `src/assets`。建置只會把這個資料夾送出去。一個功能自己的圖在裡面開子資料夾，全站都用的放根目錄。
