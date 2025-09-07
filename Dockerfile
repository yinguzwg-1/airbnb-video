# 阶段1：构建 Next.js 应用
FROM node:18-alpine AS builder
WORKDIR /
# 复制依赖文件并安装
COPY ./package*.json ./
RUN npm ci
# 复制项目代码
COPY . .
# 构建应用（使用构建参数）
ARG NODE_ENV=production
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_LOCAL_HOST
ARG NEXT_PUBLIC_APP_ID
# 注入环境变量（构建时生效）
ENV NODE_ENV=$NODE_ENV
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_LOCAL_HOST=$NEXT_PUBLIC_LOCAL_HOST
ENV NEXT_PUBLIC_APP_ID=$NEXT_PUBLIC_APP_ID
# 执行构建
RUN npm run build

# 阶段2：生产环境运行（轻量化镜像）
FROM node:18-alpine AS runner
WORKDIR /airbnb-video
# 复制构建产物和依赖（仅复制必要文件，减小镜像体积）
COPY --from=builder ./next.config.mjs ./
COPY --from=builder ./public ./public
COPY --from=builder ./.next ./.next
COPY --from=builder ./node_modules ./node_modules
COPY --from=builder ./package.json ./package.json
# 暴露应用内部端口（需与部署配置中的 `-p $PORT:3000` 中的 `3000` 一致）
EXPOSE 8080
# 启动命令（Next.js 生产环境启动命令）
CMD ["npm", "start"]