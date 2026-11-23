# 公告

公告由 `noah-core` 提供 API 和登入。先依 `noah-core` 的 README 啟動後端，再啟動前端。

```bash
npm install
npm start
```

開啟 http://localhost:4203/

部署時，在前端服務設定 `CORE_URL` 指向 Core 的私有網址。公告、登入和回呼請求透過前端服務轉送。

`main` 是穩定版，`develop` 是開發分支。
