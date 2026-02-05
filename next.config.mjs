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
    // 优先使用环境变量，确保开发和生产环境都能正确配置
    const isDev = process.env.NODE_ENV === 'development';
    const backendUrl = process.env.BACKEND_URL || (isDev ? 'http://localhost:3001' : 'http://172.17.0.1:3001');
    
    console.log(`[Next.js] 环境: ${process.env.NODE_ENV}, 后端地址: ${backendUrl}`);
    
    const rewrites = [
      { source: '/api/:path*', destination: `${backendUrl}/api/:path*` },
      { source: '/uploads/:path*', destination: `${backendUrl}/uploads/:path*` }
    ];
    
    // 开发环境：代理微前端，实现同源访问
    if (isDev) {
      // 处理带语言前缀的路由（如 /zh/micro-fe, /en/micro-fe）
      rewrites.push({
        source: '/:lang(zh|en)/micro-fe/:path*',
        destination: 'http://localhost:3002/:path*'
      });
      // 处理不带语言前缀的路由
      rewrites.push({
        source: '/micro-fe/:path*',
        destination: 'http://localhost:3002/:path*'
      });
      console.log('[Next.js] 开发环境：已配置微前端代理');
    }
    
    return rewrites;
  }
};

export default nextConfig;
