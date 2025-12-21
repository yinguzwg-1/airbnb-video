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
        hostname: "zwg.autos",
        protocol: "https",
      },
      {
        hostname: "picsum.photos",
        protocol: "https",
      },
      {
        hostname: "avatars.githubusercontent.com",
      },
      {
        hostname: "res.cloudinary.com",
        protocol: "https",
      },
    ],
    // 允许本地开发和服务器内部访问
    domains: ['localhost', '127.0.0.1', 'zwg.autos'],
  },
  // 环境变量处理
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    NEXT_PUBLIC_DEPLOY_TIME: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
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
    // 关键优化：如果是生产环境，后端地址建议使用内网 IP 或通过环境变量配置
    // 默认回退到 https://zwg.autos 仅用于浏览器端重写
    const backendUrl = process.env.BACKEND_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3001" : "https://zwg.autos");
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`
      },
      {
        source: "/uploads/:path*",
        destination: `${backendUrl}/uploads/:path*`
      }
    ];
  }
};

export default nextConfig;
