#!/usr/bin/env bash
# ============================================================
#  mcp-doc-reader — Install Script (Mac / Linux)
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_PATH="$SCRIPT_DIR/server.js"
CLAUDE_DESKTOP_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo "=================================================="
echo "   mcp-doc-reader — Cài đặt MCP Server"
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

# ── 3. In config snippet ──────────────────────────────────
echo ""
echo "=================================================="
echo -e "${CYAN}📋  Config cần thêm vào .mcp.json (Claude Code)${NC}"
echo "    hoặc claude_desktop_config.json (Claude Desktop)"
echo "=================================================="
echo ""
cat <<EOF
  "doc-reader": {
    "command": "node",
    "args": ["$SERVER_PATH"]
  }
EOF
echo ""

# ── 4. Tự động thêm vào Claude Desktop (nếu có) ──────────
if [ -f "$CLAUDE_DESKTOP_CONFIG" ]; then
  echo -e "${YELLOW}🔍  Phát hiện Claude Desktop config tại:${NC}"
  echo "    $CLAUDE_DESKTOP_CONFIG"
  echo ""
  read -p "    Tự động thêm vào Claude Desktop? (y/N): " CONFIRM
  if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
    # Dùng node để patch JSON an toàn
    node - "$CLAUDE_DESKTOP_CONFIG" "$SERVER_PATH" <<'NODE_SCRIPT'
const fs = require('fs');
const configPath = process.argv[2];
const serverPath = process.argv[3];
const raw = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(raw);
if (!config.mcpServers) config.mcpServers = {};
if (config.mcpServers['doc-reader']) {
  console.log('⚠️  "doc-reader" đã tồn tại trong config — bỏ qua.');
} else {
  config.mcpServers['doc-reader'] = { command: 'node', args: [serverPath] };
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('✅  Đã thêm "doc-reader" vào Claude Desktop config.');
  console.log('    Vui lòng RESTART Claude Desktop để áp dụng.');
}
NODE_SCRIPT
  fi
else
  echo -e "${YELLOW}ℹ️   Không tìm thấy Claude Desktop config.${NC}"
  echo "    Thêm thủ công vào file config tương ứng (xem README_VN.md)."
fi

# ── 5. Cài Claude commands ────────────────────────────────
echo ""
echo "=================================================="
echo -e "${CYAN}📎  Cài đặt Claude slash commands${NC}"
echo "=================================================="
echo ""
echo "Commands /read-doc và /ask-doc cần được copy vào thư mục"
echo ".claude/commands/ trong project của bạn."
echo ""
read -p "    Nhập đường dẫn project (Enter để bỏ qua): " PROJECT_DIR

if [ -n "$PROJECT_DIR" ]; then
  PROJECT_DIR="${PROJECT_DIR/#\~/$HOME}"  # expand ~
  COMMANDS_DEST="$PROJECT_DIR/.claude/commands"
  if [ -d "$PROJECT_DIR" ]; then
    mkdir -p "$COMMANDS_DEST"
    cp "$SCRIPT_DIR/commands/read-doc.md" "$COMMANDS_DEST/"
    cp "$SCRIPT_DIR/commands/ask-doc.md" "$COMMANDS_DEST/"
    echo -e "${GREEN}✔  Đã copy commands vào: $COMMANDS_DEST${NC}"
    echo "    Dùng /read-doc và /ask-doc trong Claude Code."
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
