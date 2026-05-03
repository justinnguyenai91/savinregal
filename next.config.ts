import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: standalone chỉ dùng khi build Docker (VPS), Vercel tự bỏ qua
  ...(process.env.STANDALONE === 'true' ? { output: 'standalone' } : {}),
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  images: {
    remotePatterns: [
      {
        // VPS upload server - Next.js Image sẽ proxy HTTP→HTTPS tự động
        protocol: 'http',
        hostname: '180.93.113.12',
        port: '8080',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
