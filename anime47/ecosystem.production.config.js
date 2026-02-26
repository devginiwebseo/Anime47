module.exports = {
  apps: [
    {
      name: 'animeez',
      cwd: '/home/animeezonline/animeez.online',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3008
      },
      error_file: '/home/animeezonline/animeez.online/logs/error.log',
      out_file: '/home/animeezonline/animeez.online/logs/out.log',
      log_file: '/home/animeezonline/animeez.online/logs/combined.log',
      time: true
    }
  ]
};
