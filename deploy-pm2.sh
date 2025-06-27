#!/bin/bash

echo "🚀 开始 PM2 生产环境部署..."

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo "📦 安装 PM2..."
    npm install -g pm2
fi

# 停止现有服务
echo "🛑 停止现有服务..."
pm2 stop airbnb-video 2>/dev/null || true
pm2 delete airbnb-video 2>/dev/null || true

# 清理 node_modules（如果需要重新安装）
if [ "$1" = "--clean" ]; then
    echo "🧹 清理 node_modules..."
    rm -rf node_modules package-lock.json
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建应用
echo "🔨 构建 Next.js 应用..."
npm run build

# 检查构建结果
if [ ! -d ".next" ]; then
    echo "❌ 构建失败，.next 目录不存在"
    exit 1
fi

echo "✅ 构建成功！"

# 创建 PM2 配置文件
echo "📝 创建 PM2 配置..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'airbnb-video',
    script: 'npm',
    args: 'start',
    cwd: __dirname,
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# 创建日志目录
mkdir -p logs

# 启动 PM2 服务
echo "🚀 启动 PM2 服务..."
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup

# 检查服务状态
echo "📊 检查服务状态..."
pm2 status

echo "✅ 部署完成！"
echo "🌐 应用地址: http://localhost:3000"
echo "📋 查看日志: pm2 logs airbnb-video"
echo "📋 重启服务: pm2 restart airbnb-video"
echo "📋 停止服务: pm2 stop airbnb-video" 