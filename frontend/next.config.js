/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Для Netlify используем static export
  // API чата работает через Cloudflare Worker
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Переопределяем URL API на Cloudflare Worker
  env: {
    NEXT_PUBLIC_CHAT_API_URL: process.env.NEXT_PUBLIC_CHAT_API_URL || 'https://busgal-chat.busgal-n8gpt.workers.dev/chat',
  },
}

module.exports = nextConfig
