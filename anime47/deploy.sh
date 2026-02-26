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

# Check if .env.production exists (commented out due to macOS permission issue)
# if [ ! -f .env.production ]; then
#   echo -e "${RED}ERROR: .env.production file not found!${NC}"
#   echo "Please create .env.production with your production environment variables."
#   exit 1
# fi

# Check SSH connection
echo "  ├─ Testing SSH connection..."
if ! ssh -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_HOST} "echo 'SSH connection OK'; ls -d /home/*/ | xargs -n 1 basename" > /dev/null 2>&1; then
  echo -e "${RED}ERROR: Cannot connect to server!${NC}"
  exit 1
fi
echo -e "  └─ ${GREEN}✓ SSH connection successful${NC}"
echo -e "  └─ ${BLUE}Available users on server:${NC}"
ssh ${SERVER_USER}@${SERVER_HOST} "ls /home"

# ───────────────────────────────────────────────────────────────
# Step 2: Install dependencies and type check
# ───────────────────────────────────────────────────────────────
echo -e "\n${BLUE}[2/7]${NC} Installing dependencies..."
npm install
# npm run type-check  # Skip type check for now
echo -e "  └─ ${GREEN}✓ Dependencies installed${NC}"

# ───────────────────────────────────────────────────────────────
# Step 3: Sync files to server (no local build)
# ───────────────────────────────────────────────────────────────
echo -e "\n${BLUE}[3/7]${NC} Syncing files to production server (using tar over ssh)..."
# Create directory if it doesn't exist
ssh -o ServerAliveInterval=30 -o ServerAliveCountMax=5 ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${SERVER_PATH}"

# Compress locally, send via ssh, and extract directly into the target folder
# This avoids needing rsync installed on Windows. 
# We delete existing folders to ensure deleted local files are also removed from server.
tar $EXCLUDE_OPTS -czf - . | ssh -o ServerAliveInterval=30 -o ServerAliveCountMax=5 ${SERVER_USER}@${SERVER_HOST} "cd ${SERVER_PATH} && rm -rf scripts modules app lib services types && tar -xzf -"
echo -e "  └─ ${GREEN}✓ Files synced and cleaned${NC}"

# ───────────────────────────────────────────────────────────────
# Step 3.5: Upload Environment Variables
# ───────────────────────────────────────────────────────────────
echo -e "\n${BLUE}[3.5/7]${NC} Uploading production environment variables..."
if [ -f .env.production ]; then
  cat .env.production | ssh ${SERVER_USER}@${SERVER_HOST} "cat > ${SERVER_PATH}/.env"
  echo -e "  └─ ${GREEN}✓ .env.production uploaded as .env${NC}"
else
  echo -e "  └─ ${YELLOW}⚠ .env.production not found, skipping (ensure it exists on server)${NC}"
fi

# ───────────────────────────────────────────────────────────────
# Step 4: Build and deploy on server
# ───────────────────────────────────────────────────────────────
ssh ${SERVER_USER}@${SERVER_HOST} bash << ENDSSH
set -e

# Navigate to project directory
cd ${SERVER_PATH}

echo "  ├─ Stopping existing PM2 processes to free up DB connections..."
pm2 stop ecosystem.production.config.js > /dev/null 2>&1 || true
pm2 stop ecosystem.crawler.config.json > /dev/null 2>&1 || true

echo "  ├─ Installing all dependencies (needed for build)..."
npm install

echo "  ├─ Syncing database schema (db push)..."
npx prisma db push --accept-data-loss

echo "  ├─ Generating Prisma Client..."
npx prisma generate

echo "  ├─ Seeding homepage components (if not exists)..."
npm run seed:homepage || echo "     Homepage seed skipped (may already exist)"

echo "  ├─ Building Next.js application..."
npm run build

echo "  ├─ Setting permissions for upload directory..."
mkdir -p public/upload
chmod -R 777 public/upload

echo "  └─ Production deployment completed"
ENDSSH

echo -e "  └─ ${GREEN}✓ Server-side deployment completed${NC}"

# ───────────────────────────────────────────────────────────────
# Step 6: Restart PM2 processes
# ───────────────────────────────────────────────────────────────
echo -e "\n${BLUE}[6/7]${NC} Restarting application..."

ssh ${SERVER_USER}@${SERVER_HOST} bash << ENDSSH
set -e
cd ${SERVER_PATH}

# Ensure logs directory exists
mkdir -p logs

# Stop and delete old processes to ensure clean config
echo "  ├─ Resetting PM2 processes..."
pm2 delete ecosystem.production.config.js > /dev/null 2>&1 || true
pm2 delete ${APP_NAME} > /dev/null 2>&1 || true
pm2 delete crawler-animeez > /dev/null 2>&1 || true

echo "  ├─ Starting ecosystem with PM2..."
pm2 start ecosystem.production.config.js --update-env
pm2 save

echo "  └─ Application restarted"
ENDSSH

echo -e "  └─ ${GREEN}✓ Application restarted${NC}"

# ───────────────────────────────────────────────────────────────
# Step 7: Verify deployment
# ───────────────────────────────────────────────────────────────
echo -e "\n${BLUE}[7/7]${NC} Verifying deployment..."

ssh ${SERVER_USER}@${SERVER_HOST} bash << ENDSSH
cd ${SERVER_PATH}
echo "  ├─ PM2 Status:"
pm2 list | grep animeez || echo "     No PM2 process found"
ENDSSH

echo -e "  └─ ${GREEN}✓ Deployment verification completed${NC}"

# ───────────────────────────────────────────────────────────────
# Deployment Summary
# ───────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETED SUCCESSFULLY!${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Check application status: ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 status'"
echo "  2. View logs: ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 logs ${APP_NAME}'"
echo "  3. Monitor: ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 monit'"
echo ""

# Optional: Display recent PM2 logs
read -p "Do you want to view recent PM2 logs? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  ssh ${SERVER_USER}@${SERVER_HOST} "pm2 logs ${APP_NAME} --lines 50 --nostream"
fi
