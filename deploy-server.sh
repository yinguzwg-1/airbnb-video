#!/bin/bash

echo "🚀 开始服务器本地部署..."

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "📦 安装 Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo "📦 安装 PM2..."
    sudo npm install -g pm2
fi

echo "📦 Node.js 版本: $(node --version)"
echo "📦 npm 版本: $(npm --version)"

# 停止现有服务
echo "🛑 停止现有服务..."
pm2 stop airbnb-video 2>/dev/null || true
pm2 delete airbnb-video 2>/dev/null || true
docker-compose down 2>/dev/null || true

# 清理并重新安装
echo "🧹 清理并重新安装..."
rm -rf node_modules package-lock.json .next
npm cache clean --force

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
      PORT: 8080
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

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 健康检查
echo "🏥 执行健康检查..."
if curl -f http://localhost:8080 > /dev/null 2>&1; then
    echo "✅ 部署成功！"
    echo "🌐 应用地址: http://localhost:8080"
    echo "🌐 外部访问: http://$(curl -s ifconfig.me):8080"
else
    echo "⚠️  健康检查失败，但服务可能仍在启动中..."
    echo "📋 查看日志: pm2 logs airbnb-video"
fi

echo "🎉 服务器部署完成！"
echo "📋 常用命令:"
echo "  查看日志: pm2 logs airbnb-video"
echo "  重启服务: pm2 restart airbnb-video"
echo "  停止服务: pm2 stop airbnb-video"
echo "  查看状态: pm2 status" 