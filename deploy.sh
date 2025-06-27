#!/bin/bash

# 部署脚本
echo "🚀 开始部署应用..."

# 设置环境变量
export REGISTRY=ghcr.io
export IMAGE_NAME=yinguzwg-1
export TAG=${1:-latest}

echo "📦 使用镜像: $REGISTRY/$IMAGE_NAME/airbnb-video:$TAG"

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请启动 Docker"
    exit 1
fi

# 检查 docker-compose 是否可用
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose 未安装"
    exit 1
fi

# 停止现有服务
echo "🛑 停止现有服务..."
docker-compose down

# 拉取最新镜像
echo "📥 拉取最新镜像..."
docker-compose pull

# 启动服务
echo "🚀 启动服务..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 15

# 健康检查
echo "🏥 执行健康检查..."
if curl -f http://localhost:8080 > /dev/null 2>&1; then
    echo "✅ 部署成功！"
    echo "🌐 应用地址: http://localhost:8080"
else
    echo "❌ 健康检查失败"
    exit 1
fi

# 清理未使用的镜像
echo "🧹 清理未使用的镜像..."
docker image prune -f

echo "🎉 部署完成！" 