/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    optimizeCss: false,
    serverComponentsExternalPackages: [],
  },
  async headers() {
    return [
      {
        source: '/favicon.svg',
        headers: [
          { key: 'Content-Type', value: 'image/svg+xml' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          { key: 'Content-Type', value: 'image/x-icon' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { hostname: "zwg.autos", protocol: "https" },
      { hostname: "picsum.photos", protocol: "https" },
      { hostname: "avatars.githubusercontent.com" },
      { hostname: "res.cloudinary.com", protocol: "https" },
    ],
    domains: ['localhost', '127.0.0.1', 'zwg.autos', '172.17.0.1'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    NEXT_PUBLIC_DEPLOY_TIME: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
  },
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': process.cwd(),
    };
    
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
              if (!match) return 'vendor';
              const packageName = match[1];
              return `npm.${packageName.replace('@', '')}`;
            },
            priority: 10
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          }
        }
      };
    }
    return config;
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3001" : "https://zwg.autos");
    return [
      { source: "/api/:path*", destination: `${backendUrl}/api/:path*` },
      { source: "/uploads/:path*", destination: `${backendUrl}/uploads/:path*` }
    ];
  }
};

export default nextConfig;
