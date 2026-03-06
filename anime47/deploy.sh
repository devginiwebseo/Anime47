#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# ANIMEEZ DEPLOYMENT SCRIPT
# ═══════════════════════════════════════════════════════════════

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Server Configuration
SERVER_USER="root"
SERVER_HOST="116.118.47.193"
SERVER_PATH="/home/animeezonline/animeez.online"
APP_NAME="animeez"

# Excludes
EXCLUDES=(
  ".git"
  "node_modules"
  ".next"
  ".env"
  ".env.local"
  ".env.development"
  "*.log"
  ".DS_Store"
  "coverage"
  ".vscode"
  ".idea"
  "public/upload"
  "public/uploads"
)

# Build exclude options for tar
EXCLUDE_OPTS=""
for exclude in "${EXCLUDES[@]}"; do
  EXCLUDE_OPTS="$EXCLUDE_OPTS --exclude=$exclude"
done

echo -e "${CYAN}"
echo "═══════════════════════════════════════════════════════════════"
echo "  DEPLOYING ANIMEEZ.ONLINE TO PRODUCTION"
echo "═══════════════════════════════════════════════════════════════"
echo -e "${NC}"
echo -e "${YELLOW}Server:${NC} ${SERVER_USER}@${SERVER_HOST}"
echo -e "${YELLOW}Path:${NC} ${SERVER_PATH}"
echo ""

# ───────────────────────────────────────────────────────────────
# Step 1: Pre-deployment checks
# ───────────────────────────────────────────────────────────────
echo -e "${BLUE}[1/7]${NC} Running pre-deployment checks..."

# Check SSH connection
echo "  ├─ Testing SSH connection..."
if ! ssh -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_HOST} "echo 'SSH connection OK'" > /dev/null 2>&1; then
  echo -e "${RED}ERROR: Cannot connect to server!${NC}"
  exit 1
fi
echo -e "  └─ ${GREEN}✓ SSH connection successful${NC}"

# ───────────────────────────────────────────────────────────────
# Step 2: Install dependencies
# ───────────────────────────────────────────────────────────────
echo -e "\n${BLUE}[2/7]${NC} Installing dependencies..."
npm install
echo -e "  └─ ${GREEN}✓ Dependencies installed${NC}"

# ───────────────────────────────────────────────────────────────
# Step 3: Sync files to server
# ───────────────────────────────────────────────────────────────
echo -e "\n${BLUE}[3/7]${NC} Syncing files to production server..."
ssh -o ServerAliveInterval=30 -o ServerAliveCountMax=5 ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${SERVER_PATH}"

# Compress locally, send via ssh, and extract
tar $EXCLUDE_OPTS -czf - . | ssh -o ServerAliveInterval=30 -o ServerAliveCountMax=5 ${SERVER_USER}@${SERVER_HOST} "cd ${SERVER_PATH} && rm -rf scripts modules app lib services types && tar -xzf -"
echo -e "  └─ ${GREEN}✓ Files synced and cleaned${NC}"

# ───────────────────────────────────────────────────────────────
# Step 3.5: Upload Environment Variables
# ───────────────────────────────────────────────────────────────
echo -e "\n${BLUE}[3.5/7]${NC} Uploading production environment variables..."
if [ -f .env.production ]; then
  cat .env.production | ssh ${SERVER_USER}@${SERVER_HOST} "cat > ${SERVER_PATH}/.env"
  echo -e "  └─ ${GREEN}✓ .env.production uploaded as .env${NC}"
fi

# ───────────────────────────────────────────────────────────────
# Step 4: Build and deploy on server
# ───────────────────────────────────────────────────────────────
ssh ${SERVER_USER}@${SERVER_HOST} bash << 'ENDSSH'
set -e
cd /home/animeezonline/animeez.online

echo "  ├─ Stopping existing PM2 processes..."
pm2 stop ecosystem.production.config.js > /dev/null 2>&1 || true

echo "  ├─ Installing dependencies (server)..."
npm install

echo "  ├─ Generating Prisma Client..."
npx prisma generate

echo "  ├─ Syncing database schema..."
npx prisma db push --accept-data-loss

echo "  ├─ Building Next.js application..."
npm run build

echo "  ├─ Setting permissions for upload directory..."
mkdir -p public/upload/logo
mkdir -p public/upload/image
chmod -R 777 public/upload
chmod +x crawl.sh
chown -R animeezonline:animeezonline /home/animeezonline/animeez.online

echo "  └─ Production deployment completed"
ENDSSH

echo -e "  └─ ${GREEN}✓ Server-side deployment completed${NC}"

# ───────────────────────────────────────────────────────────────
# Step 6: Restart PM2 processes
# ───────────────────────────────────────────────────────────────
echo -e "\n${BLUE}[6/7]${NC} Restarting application..."

ssh ${SERVER_USER}@${SERVER_HOST} bash << 'ENDSSH'
set -e
cd /home/animeezonline/animeez.online
mkdir -p logs

echo "  ├─ Resetting PM2 processes..."
pm2 delete animeez > /dev/null 2>&1 || true
pm2 start ecosystem.production.config.js --update-env
pm2 save

echo "  └─ Application restarted"
ENDSSH

echo -e "  └─ ${GREEN}✓ Application restarted${NC}"

# ───────────────────────────────────────────────────────────────
# Step 7: Verify deployment
# ───────────────────────────────────────────────────────────────
echo -e "\n${BLUE}[7/7]${NC} Verifying deployment..."
ssh ${SERVER_USER}@${SERVER_HOST} "pm2 list | grep animeez"
echo -e "  └─ ${GREEN}✓ Deployment verification completed${NC}"

echo -e "\n${GREEN}✅ DEPLOYMENT COMPLETED SUCCESSFULLY!${NC}\n"
