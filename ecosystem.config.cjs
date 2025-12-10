module.exports = {
  apps: [
    {
      name: 'taant-backend',
      cwd: '/www/ravi/project-taant-docker/taant-backend',
      script: 'npm',
      args: 'run start:dev',
      env: {
        NODE_ENV: 'development',
        PORT: 4000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_file: '/root/.pm2/logs/taant-backend.log',
      out_file: '/root/.pm2/logs/taant-backend-out.log',
      error_file: '/root/.pm2/logs/taant-backend-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'taant-admin',
      cwd: '/www/ravi/project-taant-docker/taant-admin',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_file: '/root/.pm2/logs/taant-admin.log',
      out_file: '/root/.pm2/logs/taant-admin-out.log',
      error_file: '/root/.pm2/logs/taant-admin-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'taant-front',
      cwd: '/www/ravi/project-taant-docker/taant-front',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
        PORT: 3007
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_file: '/root/.pm2/logs/taant-front.log',
      out_file: '/root/.pm2/logs/taant-front-out.log',
      error_file: '/root/.pm2/logs/taant-front-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'taant-supplier',
      cwd: '/www/ravi/project-taant-docker/taant-supplier',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
        PORT: 3002
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_file: '/root/.pm2/logs/taant-supplier.log',
      out_file: '/root/.pm2/logs/taant-supplier-out.log',
      error_file: '/root/.pm2/logs/taant-supplier-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'taant-store',
      cwd: '/www/ravi/project-taant-docker/taant-store',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
        PORT: 3008
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_file: '/root/.pm2/logs/taant-store.log',
      out_file: '/root/.pm2/logs/taant-store-out.log',
      error_file: '/root/.pm2/logs/taant-store-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};