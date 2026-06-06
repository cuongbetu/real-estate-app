#!/bin/bash
# =============================================================================
# deploy.sh
# Build and (re)start the Next.js app using PM2.
# Run from the project root every time you want to deploy a new version:
#   chmod +x scripts/deploy.sh
#   ./scripts/deploy.sh
# =============================================================================
set -e

CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

step() { echo -e "\n${CYAN}=== $1 ===${NC}"; }
ok()   { echo -e "${GREEN}✔ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠  $1${NC}"; }
err()  { echo -e "${RED}✘ $1${NC}"; exit 1; }

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_NAME="nhadatgiatot24h"

cd "$APP_DIR"
echo -e "${CYAN}Deploying from: $APP_DIR${NC}"

# ── Guard: .env.local must exist ─────────────────────────────────────────────
if [ ! -f ".env.local" ] && [ ! -f ".env" ]; then
  err ".env.local not found. Create it first:\n  echo 'DATABASE_URL=\"postgresql://...\"' > .env.local"
fi

# ── 1. Pull latest code ───────────────────────────────────────────────────────
step "1. Pulling latest code"
git pull origin main
ok "Code up to date"

# ── 2. Start / ensure PostgreSQL container is running ────────────────────────
step "2. Starting PostgreSQL (Docker)"
docker compose up -d
# Wait until Postgres is ready
echo "Waiting for PostgreSQL to be ready..."
for i in {1..20}; do
  if docker compose exec -T postgres pg_isready -U realestate -d realestate > /dev/null 2>&1; then
    ok "PostgreSQL is ready"
    break
  fi
  echo "  ($i/20) Not ready yet, waiting 3s..."
  sleep 3
  if [ "$i" -eq 20 ]; then
    err "PostgreSQL did not become ready in time"
  fi
done

# ── 3. Install / update npm dependencies ─────────────────────────────────────
step "3. Installing dependencies"
npm ci
ok "Dependencies installed"

# ── 4. Prisma: generate client + push schema ─────────────────────────────────
step "4. Running Prisma migrations"
npm run db:generate
npm run db:push
ok "Database schema up to date"

# ── 5. Ensure uploads directory exists ───────────────────────────────────────
step "5. Creating uploads directory"
mkdir -p public/uploads
ok "public/uploads ready"

# ── 6. Build Next.js ─────────────────────────────────────────────────────────
step "6. Building Next.js (production)"
npm run build
ok "Build complete"

# ── 7. Start / restart with PM2 ──────────────────────────────────────────────
step "7. Starting app with PM2"
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
  pm2 reload "$APP_NAME" --update-env
  ok "PM2 process reloaded"
else
  pm2 start ecosystem.config.js --env production
  ok "PM2 process started"
fi
pm2 save
ok "PM2 process list saved"

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  Deployment complete!${NC}"
echo -e "${GREEN}  App running at http://localhost:3000${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Useful commands:"
echo "  pm2 logs $APP_NAME      # View live logs"
echo "  pm2 status              # Process status"
echo "  pm2 restart $APP_NAME   # Restart app"
