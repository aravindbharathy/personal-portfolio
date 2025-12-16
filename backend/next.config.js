/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Configure allowed domains for next/image
  images: {
    domains: [
      'cdn.medium.com',
      'miro.medium.com',
      'substackcdn.com',
      'localhost',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.medium.com',
      },
      {
        protocol: 'https',
        hostname: '**.substack.com',
      },
    ],
  },

  // API routes configuration - CORS handled in middleware for dynamic origin support
  async headers() {
    return [];
  },

  // Rewrites for API versioning (optional)
  async rewrites() {
    return [
      // Example: /api/v1/projects -> /api/projects
      // {
      //   source: '/api/v1/:path*',
      //   destination: '/api/:path*',
      // },
    ];
  },

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Experimental features (if needed in the future)
  // experimental: {},

  // Output configuration for deployment
  output: 'standalone', // For Docker/container deployments

  // Compression
  compress: true,

  // Power by header
  poweredByHeader: false,
};

module.exports = nextConfig;
