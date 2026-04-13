# ============================================================
#  mcp-doc-reader — Install Script (Windows PowerShell)
# ============================================================

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ServerPath = Join-Path $ScriptDir "server.js"
$ClaudeConfig = "$env:APPDATA\Claude\claude_desktop_config.json"

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   mcp-doc-reader — Cai dat MCP Server" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Kiểm tra Node.js ───────────────────────────────────
try {
    $nodeVersion = (node -v 2>&1).ToString().TrimStart('v')
    $major = [int]($nodeVersion.Split('.')[0])
    if ($major -lt 18) {
        Write-Host "❌  Can Node.js >= 18. Hien tai: v$nodeVersion" -ForegroundColor Red
        exit 1
    }
    Write-Host "✔  Node.js v$nodeVersion — OK" -ForegroundColor Green
} catch {
    Write-Host "❌  Node.js khong tim thay." -ForegroundColor Red
    Write-Host "    Cai dat tai: https://nodejs.org (can >= 18)"
    exit 1
}

# ── 2. Cài dependencies ───────────────────────────────────
Write-Host ""
Write-Host "📦 Dang cai dependencies..."
Set-Location $ScriptDir
npm install --silent
Write-Host "✔  Dependencies da cai xong" -ForegroundColor Green

# ── 3. In config snippet ──────────────────────────────────
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "📋  Config can them vao .mcp.json (Claude Code)" -ForegroundColor Yellow
Write-Host "    hoac claude_desktop_config.json (Claude Desktop)" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
$ServerPathEscaped = $ServerPath.Replace('\', '\\')
Write-Host "  `"doc-reader`": {"
Write-Host "    `"command`": `"node`","
Write-Host "    `"args`": [`"$ServerPathEscaped`"]"
Write-Host "  }"
Write-Host ""

# ── 4. Tự động thêm vào Claude Desktop (nếu có) ──────────
if (Test-Path $ClaudeConfig) {
    Write-Host "🔍  Phat hien Claude Desktop config tai:" -ForegroundColor Yellow
    Write-Host "    $ClaudeConfig"
    Write-Host ""
    $confirm = Read-Host "    Tu dong them vao Claude Desktop? (y/N)"
    if ($confirm -match '^[Yy]$') {
        $patchScript = @"
const fs = require('fs');
const configPath = process.argv[2];
const serverPath = process.argv[3];
const raw = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(raw);
if (!config.mcpServers) config.mcpServers = {};
if (config.mcpServers['doc-reader']) {
  console.log('⚠️  "doc-reader" da ton tai trong config — bo qua.');
} else {
  config.mcpServers['doc-reader'] = { command: 'node', args: [serverPath] };
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('✅  Da them "doc-reader" vao Claude Desktop config.');
  console.log('    Vui long RESTART Claude Desktop de ap dung.');
}
"@
        $tempScript = [System.IO.Path]::GetTempFileName() + ".js"
        Set-Content -Path $tempScript -Value $patchScript
        node $tempScript $ClaudeConfig $ServerPath
        Remove-Item $tempScript
    }
} else {
    Write-Host "ℹ️   Khong tim thay Claude Desktop config." -ForegroundColor Yellow
    Write-Host "    Them thu cong vao file config tuong ung (xem README_VN.md)."
}

# ── 5. Cài Claude commands ────────────────────────────────
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "📎  Cai dat Claude slash commands" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Commands /read-doc va /ask-doc can duoc copy vao thu muc"
Write-Host ".claude\commands\ trong project cua ban."
Write-Host ""
$projectDir = Read-Host "    Nhap duong dan project (Enter de bo qua)"

if ($projectDir -ne "") {
    $commandsDest = Join-Path $projectDir ".claude\commands"
    if (Test-Path $projectDir) {
        New-Item -ItemType Directory -Force -Path $commandsDest | Out-Null
        Copy-Item (Join-Path $ScriptDir "commands\read-doc.md") $commandsDest
        Copy-Item (Join-Path $ScriptDir "commands\ask-doc.md") $commandsDest
        Write-Host "✔  Da copy commands vao: $commandsDest" -ForegroundColor Green
        Write-Host "    Dung /read-doc va /ask-doc trong Claude Code."
    } else {
        Write-Host "❌  Khong tim thay thu muc: $projectDir" -ForegroundColor Red
        Write-Host "    Copy thu cong tu: $(Join-Path $ScriptDir 'commands\')"
    }
} else {
    Write-Host "    Bo qua. Copy thu cong tu: $(Join-Path $ScriptDir 'commands\')"
}

Write-Host ""
Write-Host "✅  Cai dat hoan tat!" -ForegroundColor Green
Write-Host ""
