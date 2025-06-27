#!/bin/bash

echo "🔍 测试 GitHub Actions 连接..."

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

# 测试 SSH 连接（模拟 GitHub Actions 环境）
echo "🔌 测试 SSH 连接..."
echo "使用参数: -o ConnectTimeout=30 -o StrictHostKeyChecking=no"

if ssh -i "$TEMP_KEY_FILE" -o ConnectTimeout=30 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$USERNAME@$HOST" "echo 'SSH 连接成功'; whoami; pwd" 2>/dev/null; then
    echo "✅ SSH 连接成功"
else
    echo "❌ SSH 连接失败"
    echo "可能的原因:"
    echo "  1. 服务器 IP 地址错误"
    echo "  2. SSH 端口被防火墙阻止"
    echo "  3. SSH 密钥配置错误"
    echo "  4. 服务器 SSH 服务未运行"
    echo "  5. 网络路由问题"
    
    # 尝试诊断
    echo "🔍 诊断信息:"
    echo "  测试端口连通性..."
    if nc -z -w5 "$HOST" "${PORT:-22}" 2>/dev/null; then
        echo "  ✅ 端口 ${PORT:-22} 可访问"
    else
        echo "  ❌ 端口 ${PORT:-22} 不可访问"
    fi
    
    rm -f "$TEMP_KEY_FILE"
    exit 1
fi

# 测试服务器上的基本命令
echo "🐳 测试服务器环境..."
ssh -i "$TEMP_KEY_FILE" -o ConnectTimeout=30 -o StrictHostKeyChecking=no "$USERNAME@$HOST" << 'EOF'
echo "=== 系统信息 ==="
uname -a
echo "=== 磁盘空间 ==="
df -h
echo "=== 内存使用 ==="
free -h
echo "=== 网络连接 ==="
netstat -tlnp | grep :22
echo "=== SSH 服务状态 ==="
systemctl status ssh --no-pager
EOF

# 清理临时文件
rm -f "$TEMP_KEY_FILE"

echo "🎉 连接测试完成！" 