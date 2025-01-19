/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Advanced Performance Optimizations
  experimental: {
    optimizePackageImports: ['@radix-ui', 'lucide-react'],
    serverActions: true,
    typedRoutes: true
  },
  
  // Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { 
            key: 'Content-Security-Policy', 
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
          }
        ]
      }
    ];
  },
  
  // Webpack Configuration
  webpack: (config, { isServer }) => {
    // XRPL and Web3 Optimizations
    config.resolve.fallback = { 
      fs: false,
      net: false,
      tls: false 
    };
    
    return config;
  },
  
  // Environment Configuration
  env: {
    NEXT_PUBLIC_XRPL_NETWORK: process.env.XRPL_NETWORK || 'testnet',
    NEXT_PUBLIC_SENTRY_DSN: process.env.SENTRY_DSN
  },
  
  // Performance Monitoring
  productionBrowserSourceMaps: true
};

module.exports = withPWA(nextConfig);
