module.exports = {
  apps: [
    {
      name: 'nextjs-app',  // 进程名称
      script: 'npm',
      args: 'run start',
      cwd: './',  // 使用相对路径
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 8080,
        NEXT_PUBLIC_NODE_ENV: 'production',
        NEXT_PUBLIC_API_URL: 'http://223.4.248.176:3001',
        NEXT_PUBLIC_LOCAL_HOST: 'http://223.4.248.176:3001',
        NEXT_PUBLIC_APP_ID: '9527'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8080,
        NEXT_PUBLIC_NODE_ENV: 'production',
        NEXT_PUBLIC_API_URL: 'http://223.4.248.176:3001',
        NEXT_PUBLIC_LOCAL_HOST: 'http://223.4.248.176:3001',
        NEXT_PUBLIC_APP_ID: '9527'
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 8080,
        NEXT_PUBLIC_NODE_ENV: 'staging',
        NEXT_PUBLIC_API_URL: 'http://223.4.248.176:3001',
        NEXT_PUBLIC_LOCAL_HOST: 'http://223.4.248.176:3001',
        NEXT_PUBLIC_APP_ID: '9527'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_restarts: 3
    }
  ]
};
