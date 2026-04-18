#!/usr/bin/env bash
set -euo pipefail

# ── Config ───────────────────────────────────────────────────────────────────
REPO="vominhtuan-1996/store_page"
BRANCH="main"
RAW="https://raw.githubusercontent.com/${REPO}/${BRANCH}"

COMMANDS=(
  "task-create"
  "task-update"
  "task-done"
  "task-delete"
  "task-list"
  "task-resume"
  "task-summary"
  "task-mcp-v2"
)

# ── Target dir ────────────────────────────────────────────────────────────────
# Nếu đang đứng trong project có .claude/ → cài vào project
# Ngược lại → cài global vào ~/.claude/commands/
if [ -d ".claude" ]; then
  TARGET=".claude/commands"
  SCOPE="project ($(pwd))"
else
  TARGET="$HOME/.claude/commands"
  SCOPE="global (~/.claude/commands)"
fi

mkdir -p "$TARGET"

# ── Install ───────────────────────────────────────────────────────────────────
echo ""
echo "  🔧 Task MCP v2 — Claude Code Command Installer"
echo "  Installing to: $SCOPE"
echo ""

INSTALLED=0
FAILED=0

for cmd in "${COMMANDS[@]}"; do
  FILE="${cmd}.md"
  URL="${RAW}/.claude/commands/${FILE}"
  DEST="${TARGET}/${FILE}"

  if curl -fsSL "$URL" -o "$DEST" 2>/dev/null; then
    echo "  ✅  /${cmd}"
    INSTALLED=$((INSTALLED + 1))
  else
    echo "  ❌  /${cmd}  (failed to fetch)"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "  Done: ${INSTALLED} installed, ${FAILED} failed."
echo ""
echo "  Usage:"
echo "    /task-mcp-v2 tạo task fix bug login"
echo "    /task-create gấp fix crash màn hình home"
echo "    /task-list"
echo "    /task-resume"
echo ""
