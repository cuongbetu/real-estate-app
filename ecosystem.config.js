// PM2 ecosystem config
// Docs: https://pm2.keymetrics.io/docs/usage/application-declaration/
//
// Usage:
//   pm2 start ecosystem.config.js --env production
//   pm2 reload nhadatgiatot24h --update-env

module.exports = {
  apps: [
    {
      name: "nhadatgiatot24h",
      script: "node_modules/.bin/next",
      args: "start",

      // Environment — production
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },

      // Restart if memory exceeds 512 MB
      max_memory_restart: "512M",

      // Keep 10 days of logs
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "logs/error.log",
      out_file: "logs/out.log",
      merge_logs: true,

      // Auto-restart on crash, with exponential back-off
      autorestart: true,
      restart_delay: 3000,
      max_restarts: 10,

      // Zero-downtime reload
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};
