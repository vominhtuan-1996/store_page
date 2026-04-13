#!/usr/bin/env bash
# ============================================================
#  Tạo file zip để chia sẻ nội bộ
#  Chạy từ thư mục gốc project: bash task_mcp/create-package.sh
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="$(dirname "$SCRIPT_DIR")"
PACKAGE_NAME="task_mcp"
VERSION=$(node -p "require('$SCRIPT_DIR/package.json').version" 2>/dev/null || echo "1.0.0")
ZIP_NAME="task-mcp-v${VERSION}.zip"
ZIP_PATH="$OUTPUT_DIR/$ZIP_NAME"

echo ""
echo "📦 Đóng gói task-mcp v$VERSION..."
echo ""

[ -f "$ZIP_PATH" ] && rm "$ZIP_PATH"

cd "$OUTPUT_DIR"
zip -r "$ZIP_PATH" "$PACKAGE_NAME" \
  --exclude "*node_modules*" \
  --exclude "*/.DS_Store" \
  --exclude "*/create-package.sh" \
  --exclude "*/.env" \
  --exclude "*migration_add_context.sql"

SIZE=$(du -sh "$ZIP_PATH" | cut -f1)

echo "✅  Đóng gói xong!"
echo "    📁 File: $ZIP_PATH"
echo "    📏 Size: $SIZE"
echo ""
echo "📋 Hướng dẫn chia sẻ:"
echo "    1. Gửi file $ZIP_NAME cho thành viên team"
echo "    2. Họ giải nén vào thư mục tùy chọn"
echo "    3. Chạy: bash task_mcp/install.sh (Mac/Linux)"
echo "             hoặc: powershell task_mcp/install.ps1 (Windows)"
echo ""
