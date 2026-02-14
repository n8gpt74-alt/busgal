# Netlify + Cloudflare Worker (Polza) setup

Сайт на Netlify — статический export (без Next API). Для работы чата нужен backend. Самый простой вариант без карты — Cloudflare Worker.

## 1) Deploy Cloudflare Worker

```bash
cd worker-chat
npm i
npx wrangler login
npx wrangler secret put POLZA_API_KEY
npx wrangler deploy
```

После деплоя получишь URL вида:
`https://busgal-chat.<your-account>.workers.dev`

Endpoint чата:
`POST https://busgal-chat.<your-account>.workers.dev/chat`

### Опциональные переменные
В `worker-chat/wrangler.toml` уже есть дефолты:
- `POLZA_API_URL=https://api.polza.ai/api/v1`
- `POLZA_MODEL=openai/gpt-4o`
- `CHAT_TIMEOUT_MS=25000`

Если хочешь изменить их без коммита — можно через `wrangler secret put`, но обычно достаточно дефолтов.

## 2) Настроить Netlify

Netlify → Site settings → Environment variables:

- `NEXT_PUBLIC_CHAT_API_URL` = `https://busgal-chat.<your-account>.workers.dev/chat`

После изменения env — Trigger deploy / Redeploy.

## 3) Проверка

1) Открой сайт на Netlify
2) Отправь сообщение в чат
3) Если Worker не настроен, будет ошибка (POLZA_API_KEY is not set).

## Безопасность
- `POLZA_API_KEY` хранится только в Cloudflare Secrets.
- В Netlify НЕ добавляй `POLZA_API_KEY`.
