#!/bin/bash

echo "🚀 开始升级 Node.js..."

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    echo "❌ 请使用 sudo 运行此脚本"
    exit 1
fi

# 备份当前版本信息
echo "📋 当前版本信息:"
node --version 2>/dev/null || echo "Node.js 未安装"
npm --version 2>/dev/null || echo "npm 未安装"

# 卸载旧版本 Node.js
echo "🗑️  卸载旧版本 Node.js..."
if command -v apt &> /dev/null; then
    # Ubuntu/Debian
    apt remove -y nodejs npm
    apt autoremove -y
elif command -v yum &> /dev/null; then
    # CentOS/RHEL
    yum remove -y nodejs npm
elif command -v dnf &> /dev/null; then
    # Fedora
    dnf remove -y nodejs npm
fi

# 清理 npm 缓存
echo "🧹 清理 npm 缓存..."
rm -rf ~/.npm
rm -rf /usr/local/lib/node_modules
rm -rf /usr/local/bin/npm

# 安装 Node.js 18.x
echo "📦 安装 Node.js 18.x..."

# 添加 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -

# 安装 Node.js
apt-get install -y nodejs

# 验证安装
echo "✅ 安装完成！"
echo "📦 Node.js 版本: $(node --version)"
echo "📦 npm 版本: $(npm --version)"

# 配置 npm
echo "⚙️  配置 npm..."
npm config set registry https://registry.npmmirror.com
npm config set cache ~/.npm

echo "🎉 Node.js 升级完成！" 