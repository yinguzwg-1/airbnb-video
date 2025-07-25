# 使用官方 Node.js 18 镜像作为基础镜像（使用完整版本避免网络问题）
FROM node:18

# 设置工作目录
WORKDIR /app

# 设置 npm 配置，使用淘宝镜像源
RUN npm config set registry https://registry.npmmirror.com

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装所有依赖（包括开发依赖）
RUN npm ci --no-audit --no-fund

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 删除开发依赖，只保留生产依赖
RUN npm prune --production

# 创建非 root 用户
RUN groupadd -r nodejs && useradd -r -g nodejs nextjs

# 更改文件所有权
RUN chown -R nextjs:nodejs /app
USER nextjs

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080 || exit 1

# 启动应用
CMD ["npm", "start"] 