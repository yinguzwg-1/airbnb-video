#!/bin/bash

echo "🧹 开始清理并重新安装..."

# 停止 PM2 服务
echo "🛑 停止 PM2 服务..."
pm2 stop airbnb-video 2>/dev/null || true
pm2 delete airbnb-video 2>/dev/null || true

# 清理 node_modules 和缓存
echo "🗑️  清理 node_modules 和缓存..."
rm -rf node_modules
rm -rf package-lock.json
rm -rf .next
npm cache clean --force

# 清理 npm 全局缓存
echo "🧹 清理 npm 缓存..."
npm cache verify

# 重新安装依赖
echo "📦 重新安装依赖..."
npm install

# 检查安装结果
if [ -d "node_modules" ]; then
    echo "✅ 依赖安装成功！"
else
    echo "❌ 依赖安装失败！"
    exit 1
fi

# 构建应用
echo "🔨 构建应用..."
npm run build

# 检查构建结果
if [ -d ".next" ]; then
    echo "✅ 构建成功！"
else
    echo "❌ 构建失败！"
    exit 1
fi

echo "🎉 清理并重新安装完成！" 