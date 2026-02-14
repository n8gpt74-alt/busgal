/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    POLZA_API_KEY: process.env.POLZA_API_KEY,
    POLZA_API_URL: process.env.POLZA_API_URL,
    POLZA_MODEL: process.env.POLZA_MODEL,
  },
}

module.exports = nextConfig
