/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: 'http://localhost:5001/api',
    NEXT_PUBLIC_PORTAL: 'CUSTOMER',
  },
};

module.exports = nextConfig;
