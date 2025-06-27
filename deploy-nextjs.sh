#!/bin/bash

echo "🚀 开始部署 Next.js 应用..."

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请启动 Docker"
    exit 1
fi

# 停止现有服务
echo "🛑 停止现有服务..."
docker-compose down

# 构建并启动 Next.js 应用
echo "🔨 构建并启动 Next.js 应用..."
docker-compose up --build -d nextjs-app

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 15

# 检查服务状态
echo "📊 检查服务状态..."
docker-compose ps

# 健康检查
echo "🏥 执行健康检查..."
if curl -f http://localhost:8080 > /dev/null 2>&1; then
    echo "✅ 部署成功！"
    echo "🌐 应用地址: http://localhost:8080"
else
    echo "⚠️  健康检查失败，但服务可能仍在启动中..."
    echo "📋 查看日志: docker-compose logs -f nextjs-app"
fi

echo "�� Next.js 应用部署完成！" 