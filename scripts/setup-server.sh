#!/bin/bash
# =============================================================================
# setup-server.sh
# One-time server initialisation for a fresh Ubuntu EC2 instance.
# Run as the default ubuntu user (not root):
#   chmod +x scripts/setup-server.sh
#   ./scripts/setup-server.sh
# =============================================================================
set -e

CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

step() { echo -e "\n${CYAN}=== $1 ===${NC}"; }
ok()   { echo -e "${GREEN}✔ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠  $1${NC}"; }

# ── 1. System update ─────────────────────────────────────────────────────────
step "1. Updating system packages"
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y curl git unzip
ok "System updated"

# ── 2. Node.js 20 (LTS) ──────────────────────────────────────────────────────
step "2. Installing Node.js 20"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v && npm -v
ok "Node.js installed: $(node -v)"

# ── 3. Docker ─────────────────────────────────────────────────────────────────
step "3. Installing Docker"
sudo apt-get install -y ca-certificates curl gnupg lsb-release
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin docker-compose
sudo usermod -aG docker "$USER"
ok "Docker installed: $(docker --version)"

# ── 4. PM2 ────────────────────────────────────────────────────────────────────
step "4. Installing PM2"
sudo npm install -g pm2
pm2 startup systemd -u "$USER" --hp "$HOME" | tail -1 | sudo bash
ok "PM2 installed: $(pm2 -v)"

# ── 5. Nginx ──────────────────────────────────────────────────────────────────
step "5. Installing Nginx"
sudo apt-get install -y nginx
sudo systemctl enable nginx
ok "Nginx installed"

# ── 6. Firewall ───────────────────────────────────────────────────────────────
step "6. Configuring UFW firewall"
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'   # ports 80 + 443
sudo ufw --force enable
ok "Firewall active"

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  Server setup complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
warn "IMPORTANT: Log out and log back in so Docker group changes take effect."
echo ""
echo "Next steps:"
echo "  1. Log out & SSH back in"
echo "  2. cd ~  &&  git clone <your-repo-url>"
echo "  3. cd real-estate-app"
echo "  4. Create .env.local  (see README)"
echo "  5. ./scripts/deploy.sh"
echo "  6. sudo cp scripts/nginx.conf /etc/nginx/sites-available/nhadatgiatot247"
echo "     sudo ln -s /etc/nginx/sites-available/nhadatgiatot247 /etc/nginx/sites-enabled/"
echo "     sudo nginx -t && sudo systemctl reload nginx"
echo "  7. (Optional SSL) sudo certbot --nginx -d nhadatgiatot247.com -d www.nhadatgiatot247.com"
