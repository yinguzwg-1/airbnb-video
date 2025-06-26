# GitHub Actions 工作流配置指南

## 当前工作流配置

为了避免一次提交触发多个流水线，我们优化了工作流配置：

### 🚀 主要部署工作流

**文件：** `direct-deploy.yml`  
**名称：** 🚀 Deploy Next.js Application

**触发条件：**
- 推送到 `main` 或 `master` 分支时自动触发
- 支持手动触发（可选择环境）

**功能：**
- ✅ 完整的构建和部署流程
- ✅ 代码检查（linting）
- ✅ Docker 镜像构建和推送
- ✅ 自动部署到服务器
- ✅ 健康检查
- ✅ 详细的调试信息

### 🔧 快速部署工作流

**文件：** `quick-deploy.yml`  
**名称：** Quick Deploy Next.js

**触发条件：**
- 仅手动触发（workflow_dispatch）

**功能：**
- ✅ 快速部署（不构建 Docker 镜像）
- ✅ 支持环境选择
- ✅ 适合测试和快速迭代

## 已禁用的工作流

为了避免冲突，以下工作流已被禁用：

- `deploy.yml.bak` - 原来的 artifacts 工作流
- `simple-deploy.yml.bak` - 重复的部署工作流

## 使用方式

### 1. 自动部署

推送代码到 `main` 或 `master` 分支时，会自动触发部署：

```bash
git add .
git commit -m "feat: 新功能"
git push origin main
```

### 2. 手动部署

在 GitHub Actions 页面手动触发部署：

1. 进入 GitHub 仓库
2. 点击 "Actions" 标签
3. 选择 "🚀 Deploy Next.js Application"
4. 点击 "Run workflow"
5. 选择分支和环境
6. 点击 "Run workflow"

### 3. 快速部署

对于快速测试，使用快速部署工作流：

1. 在 Actions 页面选择 "Quick Deploy Next.js"
2. 选择环境（production/staging）
3. 点击 "Run workflow"

## 工作流步骤详解

### 🚀 Deploy Next.js Application

1. **📥 Checkout code** - 检出代码
2. **🔧 Setup Node.js** - 设置 Node.js 环境
3. **📦 Install dependencies** - 安装依赖
4. **🔍 Run linting** - 代码检查
5. **🏗️ Build Next.js application** - 构建应用
6. **✅ Verify build output** - 验证构建结果
7. **🐳 Set up Docker Buildx** - 设置 Docker 构建环境
8. **🔐 Log in to Container Registry** - 登录容器仓库
9. **🐳 Build and push Docker image** - 构建并推送 Docker 镜像
10. **🚀 Deploy to server** - 部署到服务器

### Quick Deploy Next.js

1. **📥 Checkout code** - 检出代码
2. **🚀 Deploy to server** - 直接部署到服务器

## 环境变量配置

确保在 GitHub Secrets 中配置以下变量：

| Secret 名称 | 描述 | 示例值 |
|------------|------|--------|
| `HOST` | 服务器 IP 地址 | `192.168.1.100` |
| `USERNAME` | SSH 用户名 | `ubuntu` |
| `SSH_KEY` | SSH 私钥 | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `PORT` | SSH 端口 | `22` |

## 故障排除

### 1. 工作流未触发

检查：
- 分支名称是否正确（main 或 master）
- 工作流文件是否在 `.github/workflows/` 目录下
- 文件语法是否正确

### 2. 构建失败

检查：
- Node.js 版本兼容性
- 依赖安装是否成功
- 构建日志中的错误信息

### 3. 部署失败

检查：
- GitHub Secrets 配置
- 服务器 SSH 连接
- Docker 和 Docker Compose 状态

## 最佳实践

1. **使用主工作流**：日常开发使用 "🚀 Deploy Next.js Application"
2. **快速测试**：使用 "Quick Deploy Next.js" 进行快速测试
3. **代码质量**：确保代码通过 linting 检查
4. **监控部署**：关注 GitHub Actions 的执行状态
5. **日志分析**：查看详细的构建和部署日志

## 恢复禁用的工作流

如果需要恢复某个工作流：

```bash
# 恢复 simple-deploy.yml
mv .github/workflows/simple-deploy.yml.bak .github/workflows/simple-deploy.yml

# 恢复 deploy.yml
mv .github/workflows/deploy.yml.bak .github/workflows/deploy.yml
```

**注意：** 恢复后需要修改触发条件以避免冲突。 