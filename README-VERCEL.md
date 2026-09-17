# PROXIMA — публикация на Vercel

1. Загрузите **всю эту папку** в GitHub или импортируйте её в Vercel.
2. В Vercel откройте проект: **Settings → Environment Variables**.
3. Добавьте секрет `MILLIDA_API_KEY` со значением ключа Millida `mtk_live_...` для Production.
4. Нажмите **Redeploy**.

Vercel сам создаст API-адреса `/api/create-invoice` и `/api/server-status`. В браузере сайт открывается по вашему домену Vercel; `server.mjs` для Vercel не нужен — он оставлен только для запуска на обычном компьютере.

Не публикуйте API-ключ в GitHub, HTML, JavaScript или `.env` файле.
