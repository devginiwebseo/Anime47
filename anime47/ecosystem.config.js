module.exports = {
  apps: [
    {
      name: "animeez",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: "/home/flashpanel/animeez.online",
      instances: 2, // Dùng 2 instances thay vì max để tránh overload
      exec_mode: "cluster",
      env_file: ".env", // Load file .env
      env: {
        NODE_ENV: "production",
        PORT: 3007,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3007,
      },
      max_memory_restart: "500M",
      error_file: "/home/flashpanel/animeez.online/logs/error.log",
      out_file: "/home/flashpanel/animeez.online/logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],
};
