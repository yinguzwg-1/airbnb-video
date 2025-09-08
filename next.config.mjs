/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // 生产环境错误处理
  experimental: {
    optimizeCss: false, // 禁用 CSS 优化（生产构建可能因此失败）
    // 启用更详细的错误信息
    serverComponentsExternalPackages: [],
  },
  // 静态资源配置
  async headers() {
    return [
      {
        source: '/favicon.svg',
        headers: [
          {
            key: 'Content-Type',
            value: 'image/svg+xml',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Content-Type',
            value: 'image/x-icon',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // 图片配置
  images: {
    remotePatterns: [
      {
        hostname: "avatars.githubusercontent.com",
      },
      {
        hostname: "res.cloudinary.com",
        protocol: "https",
      },
    ],
    // 添加更多图片域名
    domains: ['localhost', '223.4.248.176'],
  },
  // 环境变量处理
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // 构建优化
  swcMinify: true,
  // 压缩配置
  compress: true,
  // 生产环境优化
  poweredByHeader: false,
  productionBrowserSourceMaps: false, // 禁用源码映射
  compress: true, // 启用Gzip压缩
  
  // 自定义分包策略
  webpack: (config, { isServer }) => {
    // 添加路径别名解析
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
              // 安全处理路径解析
              const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
              if (!match) return 'vendor';
              
              const packageName = match[1];
              return `npm.${packageName.replace('@', '')}`;
            },
            priority: 10 // 确保vendor分组优先级
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
    return [
      {
        source: "/api/:path*",
        destination: process.env.NODE_ENV === "development" ? "http://localhost:3000/api/:path*" : "http://223.4.248.176/api/:path*" // 转发到 NestJS 端口
      },
      {
        source: "/music_files/:path*",
        destination: process.env.NODE_ENV === "development" ? "http://localhost:3000/music_files/:path*" : "http://223.4.248.176/music_files/:path*" // 转发音乐文件
      },
      {
        source: "/cover_files/:path*",
        destination: process.env.NODE_ENV === "development" ? "http://localhost:3000/cover_files/:path*" : "http://223.4.248.176/cover_files/:path*" // 转发封面文件
      }
    ];
  }
};

export default nextConfig;
