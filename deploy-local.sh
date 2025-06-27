#!/bin/bash

echo "🚀 开始本地构建部署 Next.js 应用..."

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查 npm 是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

echo "📦 Node.js 版本: $(node --version)"
echo "📦 npm 版本: $(npm --version)"

# 停止现有 Docker 服务（如果有）
echo "🛑 停止现有 Docker 服务..."
docker-compose down 2>/dev/null || true

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

# 启动生产服务器
echo "🚀 启动生产服务器..."
echo "🌐 应用将在 http://localhost:3000 启动"
echo "📋 按 Ctrl+C 停止服务器"

# 启动 Next.js 生产服务器
npm start 