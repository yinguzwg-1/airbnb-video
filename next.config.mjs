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
        // 全局安全和性能头
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
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
      {
        // 静态资源长缓存
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // 图片和视频资源缓存
        source: '/uploads/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
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
  
  webpack: (config, { isServer, dev }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': process.cwd(),
    };

    // Windows 下 fs.watch 可能不可靠，启用轮询确保文件变更能被及时检测
    if (dev) {
      config.watchOptions = {
        poll: 1000,        // 每秒轮询一次
        aggregateTimeout: 300, // 聚合 300ms 内的连续改动
      };
    }
    
    // 保留 Next.js 默认拆包策略，仅将大型非首屏关键库单独拆出
    if (!isServer && config.optimization.splitChunks) {
      const existingCacheGroups = config.optimization.splitChunks.cacheGroups || {};
      config.optimization.splitChunks.cacheGroups = {
        ...existingCacheGroups,
        // framer-motion (~130KB) 非首屏关键，单独拆出利于缓存
        animation: {
          test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
          name: 'animation',
          chunks: 'all',
          priority: 30,
        },
        // wujie 微前端运行时，仅打开抽屉时需要
        wujie: {
          test: /[\\/]node_modules[\\/](wujie|wujie-react)[\\/]/,
          name: 'wujie',
          chunks: 'all',
          priority: 30,
        },
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
