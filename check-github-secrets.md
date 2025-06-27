# GitHub Secrets 配置检查指南

## 需要配置的 Secrets

在 GitHub 仓库的 Settings > Secrets and variables > Actions 中配置：

### 1. HOST
- **描述**: 服务器 IP 地址
- **示例**: `192.168.1.100` 或 `your-server.com`
- **检查**: 确保 IP 地址正确且服务器可访问

### 2. USERNAME
- **描述**: SSH 用户名
- **示例**: `root` 或 `ubuntu`
- **检查**: 确保用户存在且有权限

### 3. SSH_KEY
- **描述**: SSH 私钥内容
- **获取方法**:
  ```bash
  # 在本地生成 SSH 密钥对
  ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
  
  # 查看私钥内容
  cat ~/.ssh/id_rsa
  
  # 将公钥添加到服务器
  ssh-copy-id username@your-server-ip
  ```

### 4. PORT
- **描述**: SSH 端口
- **默认值**: `22`
- **检查**: 确保端口开放且可访问

## 测试连接

在本地测试 SSH 连接：
```bash
ssh -i ~/.ssh/id_rsa username@your-server-ip
```

## 常见问题

1. **权限问题**: 确保 SSH 私钥权限为 600
2. **防火墙**: 确保服务器防火墙允许 SSH 连接
3. **SSH 配置**: 确保服务器 SSH 服务正常运行 