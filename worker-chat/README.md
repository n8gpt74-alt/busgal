# busgal-chat worker

POST `/chat`

## Deploy
```bash
cd worker-chat
npm i
npx wrangler login
npx wrangler secret put POLZA_API_KEY
npx wrangler deploy
```

Optional vars in `wrangler.toml`:
- `POLZA_API_URL`
- `POLZA_MODEL`
- `CHAT_TIMEOUT_MS`
