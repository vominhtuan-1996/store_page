#!/usr/bin/env bash
# ── MCP Server Installer ──────────────────────────────────────────────────────
# Usage:
#   curl -fsSL "https://raw.githubusercontent.com/vominhtuan-1996/store_page/main/install-mcp.sh" | bash -s -- task-mcp
#   curl -fsSL "..." | bash -s -- doc-reader
#   curl -fsSL "..." | bash -s -- telegram-mcp
#   curl -fsSL "..." | bash -s -- figma-mcp-api
#   curl -fsSL "..." | bash -s -- all       ← cài tất cả
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

BASE_URL="https://vominhtuan-1996.github.io/store_page"
INSTALL_DIR="${HOME}/tools"
MCP_JSON="${HOME}/.mcp.json"

# ── Colors ────────────────────────────────────────────────────────────────────
G='\033[0;32m'; Y='\033[1;33m'; C='\033[0;36m'; R='\033[0;31m'; N='\033[0m'

ok()   { echo -e "${G}  ✔  $1${N}"; }
info() { echo -e "${C}  →  $1${N}"; }
warn() { echo -e "${Y}  !  $1${N}"; }
err()  { echo -e "${R}  ✗  $1${N}"; }
hdr()  { echo -e "\n${C}━━━  $1  ━━━${N}"; }

# ── MCP definitions ───────────────────────────────────────────────────────────
declare -A MCP_ZIP=( [task-mcp]="task-mcp-v1.0.0" [doc-reader]="mcp-doc-reader-v1.0.0" [telegram-mcp]="telegram-mcp-v1.0.0" [figma-mcp-api]="figma-mcp-api-v1.0.0" )
declare -A MCP_DIR=( [task-mcp]="task_mcp" [doc-reader]="mcp_doc_reader" [telegram-mcp]="telegram_mcp" [figma-mcp-api]="figma_mcp_api" )
declare -A MCP_KEY=( [task-mcp]="task-manager" [doc-reader]="doc-reader" [telegram-mcp]="telegram" [figma-mcp-api]="figma-api" )
declare -A MCP_ENV=(
  [task-mcp]="SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY"
  [doc-reader]=""
  [telegram-mcp]="TELEGRAM_BOT_TOKEN TELEGRAM_CHAT_ID"
  [figma-mcp-api]="FIGMA_ACCESS_TOKEN"
)

# ── Helpers ───────────────────────────────────────────────────────────────────
check_deps() {
  for dep in node npm curl unzip; do
    command -v "$dep" &>/dev/null || { err "Thiếu: $dep. Vui lòng cài trước."; exit 1; }
  done
  node_ver=$(node -e "process.exit(parseInt(process.version.slice(1)) < 18 ? 1 : 0)" 2>/dev/null && echo "ok" || echo "old")
  [[ "$node_ver" == "old" ]] && warn "Node.js >= 18 được khuyến nghị"
}

patch_mcp_json() {
  local key="$1" server_path="$2"
  shift 2; local env_pairs=("$@")

  local env_json="{}"
  for pair in "${env_pairs[@]-}"; do
    [[ -z "$pair" ]] && continue
    local k="${pair%%=*}" v="${pair#*=}"
    env_json=$(echo "$env_json" | python3 -c "
import sys,json
d=json.load(sys.stdin)
d['${k}']='${v}'
print(json.dumps(d))")
  done

  python3 - <<PYEOF
import json, os, sys
path = os.path.expanduser('${MCP_JSON}')
cfg = {}
if os.path.exists(path):
    try:
        with open(path) as f: cfg = json.load(f)
    except: pass
cfg.setdefault('mcpServers', {})
cfg['mcpServers']['${key}'] = {
    'command': 'node',
    'args': ['${server_path}'],
    'env': ${env_json}
}
with open(path, 'w') as f: json.dump(cfg, f, indent=2)
print('patched')
PYEOF
}

collect_env() {
  local mcp="$1"
  local vars="${MCP_ENV[$mcp]}"
  local result=()
  [[ -z "$vars" ]] && echo "" && return
  echo ""
  warn "Nhập environment variables cho ${mcp}:"
  for var in $vars; do
    read -r -p "  ${var}= " val </dev/tty
    result+=("${var}=${val}")
  done
  echo "${result[@]}"
}

install_one() {
  local mcp="$1"
  local zip_name="${MCP_ZIP[$mcp]}"
  local dir_name="${MCP_DIR[$mcp]}"
  local mcp_key="${MCP_KEY[$mcp]}"
  local target="${INSTALL_DIR}/${dir_name}"
  local zip_url="${BASE_URL}/downloads/${zip_name}.zip"

  hdr "${mcp}"
  mkdir -p "${INSTALL_DIR}"

  # Download
  info "Downloading ${zip_name}.zip..."
  curl -fsSL "${zip_url}" -o "/tmp/${zip_name}.zip" || { err "Download thất bại: ${zip_url}"; return 1; }
  ok "Downloaded"

  # Extract
  info "Extracting to ${target}..."
  rm -rf "${target}"
  unzip -q "/tmp/${zip_name}.zip" -d "${INSTALL_DIR}"
  # Rename if zip extracts with different name
  if [[ ! -d "${target}" ]]; then
    extracted=$(find "${INSTALL_DIR}" -maxdepth 1 -newer "${INSTALL_DIR}" -type d | head -1)
    [[ -n "$extracted" ]] && mv "$extracted" "${target}"
  fi
  rm -f "/tmp/${zip_name}.zip"
  ok "Extracted → ${target}"

  # npm install
  info "Installing npm dependencies..."
  (cd "${target}" && npm install --silent) || { err "npm install thất bại"; return 1; }
  ok "npm install done"

  # Collect env vars
  local env_pairs
  env_pairs=$(collect_env "$mcp")

  # Patch .mcp.json
  info "Patching ${MCP_JSON}..."
  patch_mcp_json "$mcp_key" "${target}/server.js" $env_pairs && ok "~/.mcp.json updated" || warn "Patch thất bại — thêm thủ công"

  ok "${mcp} installed ✓"
  echo -e "  Server: ${G}${target}/server.js${N}"
  echo -e "  Key:    ${G}${mcp_key}${N}"
}

# ── Main ──────────────────────────────────────────────────────────────────────
TARGET="${1:-}"
if [[ -z "$TARGET" ]]; then
  echo "Usage: bash install-mcp.sh [task-mcp|doc-reader|telegram-mcp|figma-mcp-api|all]"
  exit 1
fi

echo ""
echo -e "${C}  MCP Server Installer${N}"
echo -e "${C}  ─────────────────────────────────────${N}"
check_deps

if [[ "$TARGET" == "all" ]]; then
  for mcp in task-mcp doc-reader telegram-mcp figma-mcp-api; do
    install_one "$mcp"
  done
elif [[ -v "MCP_ZIP[$TARGET]" ]]; then
  install_one "$TARGET"
else
  err "MCP không hợp lệ: ${TARGET}"
  echo "  Các option: task-mcp | doc-reader | telegram-mcp | figma-mcp-api | all"
  exit 1
fi

echo ""
ok "Restart Claude Desktop hoặc reload Claude Code để áp dụng."
echo ""
