#!/usr/bin/env bash
# ============================================================
#  task-mcp — Install Script (Mac / Linux)
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_PATH="$SCRIPT_DIR/server.js"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo "=================================================="
echo "   task-mcp — Cài đặt MCP Server"
echo "=================================================="
echo ""

# ── 1. Kiểm tra Node.js ───────────────────────────────────
if ! command -v node &>/dev/null; then
  echo -e "${RED}❌  Node.js không tìm thấy.${NC}"
  echo "    Cài đặt tại: https://nodejs.org (cần >= 18)"
  exit 1
fi

NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VER" -lt 18 ]; then
  echo -e "${RED}❌  Cần Node.js >= 18. Hiện tại: $(node -v)${NC}"
  exit 1
fi
echo -e "${GREEN}✔  Node.js $(node -v) — OK${NC}"

# ── 2. Cài dependencies ───────────────────────────────────
echo ""
echo "📦 Đang cài dependencies..."
cd "$SCRIPT_DIR"
npm install --silent
echo -e "${GREEN}✔  Dependencies đã cài xong${NC}"

# ── 3. Cấu hình Supabase (.env) ───────────────────────────
echo ""
echo "=================================================="
echo -e "${CYAN}🔑  Cấu hình Supabase${NC}"
echo "=================================================="
echo ""
echo "task-mcp dùng Supabase để lưu tasks."
echo "Lấy thông tin tại: Supabase Dashboard → Project Settings → API"
echo ""

# Tìm .env hiện có (ưu tiên thư mục cha, rồi thư mục server)
ENV_FILE=""
if [ -f "$SCRIPT_DIR/../.env" ]; then
  ENV_FILE="$SCRIPT_DIR/../.env"
elif [ -f "$SCRIPT_DIR/.env" ]; then
  ENV_FILE="$SCRIPT_DIR/.env"
fi

if [ -n "$ENV_FILE" ]; then
  # Kiểm tra đã có key chưa
  if grep -q "SUPABASE_URL" "$ENV_FILE" 2>/dev/null && grep -q "SUPABASE_SERVICE_ROLE_KEY" "$ENV_FILE" 2>/dev/null; then
    echo -e "${GREEN}✔  Đã tìm thấy Supabase config trong: $ENV_FILE${NC}"
  else
    echo -e "${YELLOW}⚠️  File .env tồn tại nhưng thiếu Supabase keys.${NC}"
    echo "    File: $ENV_FILE"
    _ask_supabase "$ENV_FILE"
  fi
else
  echo "Chưa có file .env. Nhập thông tin Supabase:"
  echo ""
  read -p "  SUPABASE_URL (https://xxx.supabase.co): " SB_URL
  read -p "  SUPABASE_SERVICE_ROLE_KEY: " SB_KEY
  echo ""
  if [ -n "$SB_URL" ] && [ -n "$SB_KEY" ]; then
    ENV_TARGET="$SCRIPT_DIR/../.env"
    # Append hoặc tạo mới
    {
      echo ""
      echo "# task-mcp Supabase config"
      echo "SUPABASE_URL=$SB_URL"
      echo "SUPABASE_SERVICE_ROLE_KEY=$SB_KEY"
    } >> "$ENV_TARGET"
    echo -e "${GREEN}✔  Đã lưu vào: $ENV_TARGET${NC}"
  else
    echo -e "${YELLOW}⚠️  Bỏ qua — nhớ tự thêm vào .env sau.${NC}"
  fi
fi

echo ""
echo -e "${YELLOW}📊  Lưu ý: Cần tạo bảng tasks trong Supabase.${NC}"
echo "    Chạy nội dung file schema.sql trong:"
echo "    Supabase Dashboard → SQL Editor"
echo ""

# ── 4. In config snippet ──────────────────────────────────
echo "=================================================="
echo -e "${CYAN}📋  Config cần thêm vào .mcp.json (Claude Code)${NC}"
echo "    hoặc claude_desktop_config.json (Claude Desktop)"
echo "=================================================="
echo ""
cat <<EOF
  "task-manager": {
    "command": "node",
    "args": ["$SERVER_PATH"]
  }
EOF
echo ""
echo "  (Đảm bảo file .env chứa SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY"
echo "   nằm trong thư mục cha của task_mcp/)"
echo ""

# ── 5. Tự động thêm vào Claude Desktop (nếu có) ──────────
CLAUDE_DESKTOP_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
if [ -f "$CLAUDE_DESKTOP_CONFIG" ]; then
  echo -e "${YELLOW}🔍  Phát hiện Claude Desktop config tại:${NC}"
  echo "    $CLAUDE_DESKTOP_CONFIG"
  echo ""
  read -p "    Tự động thêm vào Claude Desktop? (y/N): " CONFIRM
  if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
    node - "$CLAUDE_DESKTOP_CONFIG" "$SERVER_PATH" <<'NODE_SCRIPT'
const fs = require('fs');
const configPath = process.argv[2];
const serverPath = process.argv[3];
const raw = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(raw);
if (!config.mcpServers) config.mcpServers = {};
if (config.mcpServers['task-manager']) {
  console.log('⚠️  "task-manager" đã tồn tại trong config — bỏ qua.');
} else {
  config.mcpServers['task-manager'] = { command: 'node', args: [serverPath] };
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('✅  Đã thêm "task-manager" vào Claude Desktop config.');
  console.log('    Vui lòng RESTART Claude Desktop để áp dụng.');
}
NODE_SCRIPT
  fi
else
  echo -e "${YELLOW}ℹ️   Không tìm thấy Claude Desktop config.${NC}"
  echo "    Thêm thủ công vào file config tương ứng (xem README_VN.md)."
fi

# ── 6. Cài Claude commands ────────────────────────────────
echo ""
echo "=================================================="
echo -e "${CYAN}📎  Cài đặt Claude slash commands${NC}"
echo "=================================================="
echo ""
echo "7 commands: /task-create /task-list /task-done /task-update"
echo "            /task-delete /task-resume /task-summary"
echo ""
read -p "    Nhập đường dẫn project (Enter để bỏ qua): " PROJECT_DIR

if [ -n "$PROJECT_DIR" ]; then
  PROJECT_DIR="${PROJECT_DIR/#\~/$HOME}"
  COMMANDS_DEST="$PROJECT_DIR/.claude/commands"
  if [ -d "$PROJECT_DIR" ]; then
    mkdir -p "$COMMANDS_DEST"
    cp "$SCRIPT_DIR/commands/"*.md "$COMMANDS_DEST/"
    echo -e "${GREEN}✔  Đã copy 7 commands vào: $COMMANDS_DEST${NC}"
  else
    echo -e "${RED}❌  Không tìm thấy thư mục: $PROJECT_DIR${NC}"
    echo "    Copy thủ công từ: $SCRIPT_DIR/commands/"
  fi
else
  echo "    Bỏ qua. Copy thủ công từ: $SCRIPT_DIR/commands/"
fi

echo ""
echo -e "${GREEN}✅  Cài đặt hoàn tất!${NC}"
echo ""
