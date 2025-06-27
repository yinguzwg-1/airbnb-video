#!/bin/bash

echo "🔧 修复服务器防火墙配置..."

# 检查防火墙状态
echo "📊 检查防火墙状态..."
if command -v ufw &> /dev/null; then
    echo "UFW 防火墙状态:"
    sudo ufw status
    
    # 确保 SSH 端口开放
    echo "🔓 确保 SSH 端口开放..."
    sudo ufw allow 22/tcp
    sudo ufw allow 8080/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    
    echo "✅ UFW 防火墙配置完成"
elif command -v firewall-cmd &> /dev/null; then
    echo "Firewalld 防火墙状态:"
    sudo firewall-cmd --state
    
    # 确保 SSH 端口开放
    echo "🔓 确保 SSH 端口开放..."
    sudo firewall-cmd --permanent --add-service=ssh
    sudo firewall-cmd --permanent --add-port=8080/tcp
    sudo firewall-cmd --permanent --add-port=80/tcp
    sudo firewall-cmd --permanent --add-port=443/tcp
    sudo firewall-cmd --reload
    
    echo "✅ Firewalld 防火墙配置完成"
else
    echo "⚠️  未检测到防火墙，跳过配置"
fi

# 检查 SSH 服务状态
echo "🔌 检查 SSH 服务状态..."
sudo systemctl status ssh

# 确保 SSH 服务运行
echo "🚀 确保 SSH 服务运行..."
sudo systemctl start ssh
sudo systemctl enable ssh

# 检查 SSH 配置
echo "📝 检查 SSH 配置..."
sudo grep -E "^(Port|PermitRootLogin|PasswordAuthentication)" /etc/ssh/sshd_config

echo "🎉 防火墙和 SSH 配置完成！" 