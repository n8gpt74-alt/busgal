/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Netlify supports Next.js natively
  // API чата работает через Cloudflare Worker
  env: {
    NEXT_PUBLIC_CHAT_API_URL: process.env.NEXT_PUBLIC_CHAT_API_URL || 'https://busgal-chat.busgal-n8gpt.workers.dev/chat',
  },
}

module.exports = nextConfig
