#!/bin/bash

echo "🚀 开始优化部署 Next.js 应用..."

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请启动 Docker"
    exit 1
fi

# 停止现有服务
echo "🛑 停止现有服务..."
docker-compose down

# 清理未使用的镜像和容器
echo "🧹 清理 Docker 缓存..."
docker system prune -f

# 设置构建超时和重试
echo "🔨 开始构建 Next.js 应用..."
MAX_RETRIES=3
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    echo "尝试构建 (第 $((RETRY_COUNT + 1)) 次)..."
    
    if docker-compose build --no-cache nextjs-app; then
        echo "✅ 构建成功！"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo "❌ 构建失败，等待 30 秒后重试..."
            sleep 30
        else
            echo "❌ 构建失败，已达到最大重试次数"
            exit 1
        fi
    fi
done

# 启动服务
echo "🚀 启动 Next.js 应用..."
docker-compose up -d nextjs-app

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 20

# 检查服务状态
echo "📊 检查服务状态..."
docker-compose ps

# 健康检查
echo "🏥 执行健康检查..."
MAX_HEALTH_RETRIES=5
HEALTH_RETRY_COUNT=0

while [ $HEALTH_RETRY_COUNT -lt $MAX_HEALTH_RETRIES ]; do
    if curl -f http://localhost:8080 > /dev/null 2>&1; then
        echo "✅ 部署成功！"
        echo "🌐 应用地址: http://localhost:8080"
        break
    else
        HEALTH_RETRY_COUNT=$((HEALTH_RETRY_COUNT + 1))
        if [ $HEALTH_RETRY_COUNT -lt $MAX_HEALTH_RETRIES ]; then
            echo "⚠️  健康检查失败，等待 10 秒后重试... (第 $HEALTH_RETRY_COUNT 次)"
            sleep 10
        else
            echo "❌ 健康检查失败，但服务可能仍在启动中..."
            echo "📋 查看日志: docker-compose logs -f nextjs-app"
        fi
    fi
done

echo "�� Next.js 应用部署完成！" 