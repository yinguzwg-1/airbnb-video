#!/bin/bash

echo "🔍 测试服务器连接..."

# 检查必要的环境变量
if [ -z "$HOST" ] || [ -z "$USERNAME" ] || [ -z "$SSH_KEY" ]; then
    echo "❌ 缺少必要的环境变量"
    echo "请设置: HOST, USERNAME, SSH_KEY"
    exit 1
fi

echo "📋 连接信息:"
echo "  HOST: $HOST"
echo "  USERNAME: $USERNAME"
echo "  PORT: ${PORT:-22}"

# 创建临时 SSH 密钥文件
TEMP_KEY_FILE=$(mktemp)
echo "$SSH_KEY" > "$TEMP_KEY_FILE"
chmod 600 "$TEMP_KEY_FILE"

# 测试 SSH 连接
echo "🔌 测试 SSH 连接..."
if ssh -i "$TEMP_KEY_FILE" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$USERNAME@$HOST" "echo 'SSH 连接成功'" 2>/dev/null; then
    echo "✅ SSH 连接成功"
else
    echo "❌ SSH 连接失败"
    echo "可能的原因:"
    echo "  1. 服务器 IP 地址错误"
    echo "  2. SSH 端口被防火墙阻止"
    echo "  3. SSH 密钥配置错误"
    echo "  4. 服务器 SSH 服务未运行"
    rm -f "$TEMP_KEY_FILE"
    exit 1
fi

# 测试服务器上的 Docker
echo "🐳 测试 Docker 服务..."
if ssh -i "$TEMP_KEY_FILE" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$USERNAME@$HOST" "docker --version" 2>/dev/null; then
    echo "✅ Docker 已安装"
else
    echo "❌ Docker 未安装或未运行"
fi

# 测试项目目录
echo "📁 测试项目目录..."
if ssh -i "$TEMP_KEY_FILE" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$USERNAME@$HOST" "ls -la ~/airbnb-video" 2>/dev/null; then
    echo "✅ 项目目录存在"
else
    echo "❌ 项目目录不存在"
    echo "请确保项目已克隆到 ~/airbnb-video"
fi

# 清理临时文件
rm -f "$TEMP_KEY_FILE"

echo "🎉 连接测试完成！" 