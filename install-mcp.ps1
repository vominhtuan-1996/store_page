# ── MCP Server Installer (PowerShell) ────────────────────────────────────────
# Usage:
#   irm "https://raw.githubusercontent.com/vominhtuan-1996/store_page/main/install-mcp.ps1" | iex
#   (Sau đó nhập tên MCP khi được hỏi)
#
# Hoặc truyền thẳng:
#   $env:MCP_TARGET="task-mcp"; irm "..." | iex
# ─────────────────────────────────────────────────────────────────────────────
param([string]$Target = $env:MCP_TARGET)

$BaseUrl    = "https://vominhtuan-1996.github.io/store_page"
$InstallDir = "$HOME\tools"
$McpJson    = "$HOME\.mcp.json"

$McpDefs = @{
  "task-mcp"     = @{ zip="task-mcp-v1.0.0";       dir="task_mcp";        key="task-manager"; env=@("SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY") }
  "doc-reader"   = @{ zip="mcp-doc-reader-v1.0.0"; dir="mcp_doc_reader";  key="doc-reader";   env=@() }
  "telegram-mcp" = @{ zip="telegram-mcp-v1.0.0";   dir="telegram_mcp";   key="telegram";     env=@("TELEGRAM_BOT_TOKEN","TELEGRAM_CHAT_ID") }
  "figma-mcp-api"= @{ zip="figma-mcp-api-v1.0.0";  dir="figma_mcp_api";  key="figma-api";    env=@("FIGMA_ACCESS_TOKEN") }
}

function Write-Ok($msg)   { Write-Host "  OK  $msg" -ForegroundColor Green }
function Write-Info($msg) { Write-Host "  ->  $msg" -ForegroundColor Cyan }
function Write-Warn($msg) { Write-Host "  !   $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "  X   $msg" -ForegroundColor Red }

function Check-Deps {
  foreach ($dep in @("node","npm")) {
    if (-not (Get-Command $dep -ErrorAction SilentlyContinue)) {
      Write-Err "Thieu: $dep — vui long cai truoc"
      exit 1
    }
  }
}

function Patch-McpJson($key, $serverPath, $envVars) {
  $cfg = @{ mcpServers = @{} }
  if (Test-Path $McpJson) {
    try { $cfg = Get-Content $McpJson -Raw | ConvertFrom-Json -AsHashtable } catch {}
  }
  if (-not $cfg.ContainsKey('mcpServers')) { $cfg['mcpServers'] = @{} }
  $cfg['mcpServers'][$key] = @{
    command = "node"
    args    = @($serverPath)
    env     = $envVars
  }
  $cfg | ConvertTo-Json -Depth 10 | Set-Content $McpJson -Encoding UTF8
}

function Install-Mcp($mcpName) {
  $def = $McpDefs[$mcpName]
  $target = "$InstallDir\$($def.dir)"
  $zipUrl = "$BaseUrl/downloads/$($def.zip).zip"
  $zipTmp = "$env:TEMP\$($def.zip).zip"

  Write-Host ""
  Write-Host "  === $mcpName ===" -ForegroundColor Cyan

  New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

  # Download
  Write-Info "Downloading $($def.zip).zip..."
  try {
    Invoke-WebRequest -Uri $zipUrl -OutFile $zipTmp -ErrorAction Stop
    Write-Ok "Downloaded"
  } catch {
    Write-Err "Download that bai: $zipUrl"
    return
  }

  # Extract
  Write-Info "Extracting to $target..."
  if (Test-Path $target) { Remove-Item $target -Recurse -Force }
  Expand-Archive -Path $zipTmp -DestinationPath $InstallDir -Force
  Remove-Item $zipTmp -Force
  Write-Ok "Extracted -> $target"

  # npm install
  Write-Info "Installing npm dependencies..."
  Push-Location $target
  npm install --silent
  Pop-Location
  Write-Ok "npm install done"

  # Collect env vars
  $envVars = @{}
  foreach ($var in $def.env) {
    $val = Read-Host "  $var"
    $envVars[$var] = $val
  }

  # Patch .mcp.json
  Write-Info "Patching $McpJson..."
  try {
    Patch-McpJson $def.key "$target\server.js" $envVars
    Write-Ok "~/.mcp.json updated"
  } catch {
    Write-Warn "Patch that bai — them thu cong"
  }

  Write-Ok "$mcpName installed!"
  Write-Host "  Server: $target\server.js" -ForegroundColor Green
}

# ── Main ──────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  MCP Server Installer (PowerShell)" -ForegroundColor Cyan
Write-Host "  ─────────────────────────────────────" -ForegroundColor DarkGray

if (-not $Target) {
  Write-Host "  Chon MCP de cai:" -ForegroundColor Yellow
  $i = 1
  $keys = @("task-mcp","doc-reader","telegram-mcp","figma-mcp-api","all")
  foreach ($k in $keys) { Write-Host "  [$i] $k"; $i++ }
  $choice = Read-Host "  Nhap so"
  $Target = $keys[[int]$choice - 1]
}

Check-Deps

if ($Target -eq "all") {
  foreach ($mcp in @("task-mcp","doc-reader","telegram-mcp","figma-mcp-api")) {
    Install-Mcp $mcp
  }
} elseif ($McpDefs.ContainsKey($Target)) {
  Install-Mcp $Target
} else {
  Write-Err "MCP khong hop le: $Target"
  Write-Host "  Option: task-mcp | doc-reader | telegram-mcp | figma-mcp-api | all"
  exit 1
}

Write-Host ""
Write-Ok "Restart Claude Desktop hoac reload Claude Code de ap dung."
Write-Host ""
