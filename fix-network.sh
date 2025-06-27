#!/bin/bash

echo "🔧 开始解决网络超时问题..."

# 1. 配置 Docker 镜像加速器
echo "📡 配置 Docker 镜像加速器..."
sudo mkdir -p /etc/docker

sudo tee /etc/docker/daemon.json << EOF
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com",
    "https://registry.docker-cn.com"
  ],
  "max-concurrent-downloads": 10,
  "max-concurrent-uploads": 5,
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

# 2. 重启 Docker 服务
echo "🔄 重启 Docker 服务..."
sudo systemctl daemon-reload
sudo systemctl restart docker

# 3. 清理 Docker 缓存
echo "🧹 清理 Docker 缓存..."
docker system prune -f

# 4. 测试网络连接
echo "🌐 测试网络连接..."
echo "测试 Docker Hub 连接..."
if curl -m 10 -I https://registry-1.docker.io > /dev/null 2>&1; then
    echo "✅ Docker Hub 连接正常"
else
    echo "❌ Docker Hub 连接失败，尝试镜像加速器..."
    if curl -m 10 -I https://docker.mirrors.ustc.edu.cn > /dev/null 2>&1; then
        echo "✅ 镜像加速器连接正常"
    else
        echo "❌ 网络连接有问题，请检查网络配置"
    fi
fi

echo "🎉 网络配置完成！" 