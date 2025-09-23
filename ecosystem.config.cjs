module.exports = {
  apps: [
    {
      name: 'tikio-backend',
      script: 'backend/server.ts',
      interpreter: 'bun',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        BE_PORT: 3001,
        HOST: '0.0.0.0'
      },
      log_file: './logs/backend.log',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      restart_delay: 1000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'tikio-frontend',
      script: 'dist/server/entry.mjs',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        FE_PORT: 3000,
        HOST: '0.0.0.0'
      },
      log_file: './logs/frontend.log',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      restart_delay: 1000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};