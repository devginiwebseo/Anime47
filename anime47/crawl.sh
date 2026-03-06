#!/bin/bash
# Script mồi để chạy Cron Job - Đã bỏ redirect log bên trong để Cron bên ngoài tự hứng

# Ép chuyển vào đúng thư mục code
cd /home/animeezonline/animeez.online

echo "======================================"
echo "🚀 [CRON] Khởi động crawler lúc: $(date)"

# Chạy lệnh crawl, không redirect bên trong nữa
./node_modules/.bin/tsx scripts/crawl-anime.ts

echo "✅ [CRON] Crawler kết thúc lúc: $(date)"
echo "======================================"
