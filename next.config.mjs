/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // 生产环境错误处理
  experimental: {
    // 启用更详细的错误信息
    serverComponentsExternalPackages: [],
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
    domains: ['localhost'],
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
  // 静态资源优化
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
};

export default nextConfig;
