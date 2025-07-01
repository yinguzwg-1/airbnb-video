#!/bin/bash

# 优化的Docker构建脚本 - 兼容Docker Compose v2

echo "🚀 开始优化构建Docker镜像..."

# 设置Docker构建参数
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# 增加构建超时时间
export DOCKER_CLIENT_TIMEOUT=300
export COMPOSE_HTTP_TIMEOUT=300

# 清理旧的构建缓存
echo "🧹 清理旧的构建缓存..."
docker builder prune -f

# 预拉取基础镜像
echo "📥 预拉取基础镜像..."
docker pull node:18 || {
    echo "⚠️ 无法拉取官方镜像，尝试使用国内镜像源..."
    docker pull registry.cn-hangzhou.aliyuncs.com/library/node:18
}

# 构建镜像，使用多阶段构建优化
echo "📦 开始构建镜像..."
if docker compose build --no-cache --parallel; then
    echo "✅ 镜像构建成功！"
    
    # 显示镜像信息
    echo "📊 镜像信息："
    docker images | grep airbnb_nextjs_app
    
    exit 0
else
    echo "❌ 构建失败，尝试使用备用方案..."
    
    # 备用方案：直接使用docker build
    if docker build -t airbnb_nextjs_app .; then
        echo "✅ 备用构建方案成功！"
        exit 0
    else
        echo "💥 所有构建方案都失败了"
        exit 1
    fi
fi 