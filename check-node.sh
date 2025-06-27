#!/bin/bash

echo "🔍 检查 Node.js 环境..."

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi

# 检查 npm 是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装"
    exit 1
fi

# 显示版本信息
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)

echo "📦 Node.js 版本: $NODE_VERSION"
echo "📦 npm 版本: $NPM_VERSION"

# 检查版本是否满足要求
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$NODE_MAJOR" -lt 16 ]; then
    echo "❌ Node.js 版本过低，需要 16.x 或更高版本"
    echo "📋 当前版本: $NODE_VERSION"
    echo "📋 建议版本: 18.x 或 20.x"
    exit 1
else
    echo "✅ Node.js 版本满足要求"
fi

echo "🎉 环境检查完成！" 