# ============================================================
#  task-mcp — Install Script (Windows PowerShell)
# ============================================================

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ServerPath = Join-Path $ScriptDir "server.js"
$ClaudeConfig = "$env:APPDATA\Claude\claude_desktop_config.json"

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   task-mcp — Cai dat MCP Server" -ForegroundColor Cyan
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

# ── 3. Cấu hình Supabase (.env) ───────────────────────────
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🔑  Cau hinh Supabase" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Lay thong tin tai: Supabase Dashboard -> Project Settings -> API"
Write-Host ""

$parentEnv = Join-Path (Split-Path $ScriptDir -Parent) ".env"
$localEnv  = Join-Path $ScriptDir ".env"
$envFile   = $null
if (Test-Path $parentEnv) { $envFile = $parentEnv }
elseif (Test-Path $localEnv) { $envFile = $localEnv }

if ($envFile) {
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match "SUPABASE_URL" -and $envContent -match "SUPABASE_SERVICE_ROLE_KEY") {
        Write-Host "✔  Da tim thay Supabase config trong: $envFile" -ForegroundColor Green
    } else {
        Write-Host "⚠️  File .env ton tai nhung thieu Supabase keys." -ForegroundColor Yellow
        $sbUrl = Read-Host "  SUPABASE_URL (https://xxx.supabase.co)"
        $sbKey = Read-Host "  SUPABASE_SERVICE_ROLE_KEY"
        if ($sbUrl -and $sbKey) {
            Add-Content $envFile "`n# task-mcp Supabase config`nSUPABASE_URL=$sbUrl`nSUPABASE_SERVICE_ROLE_KEY=$sbKey"
            Write-Host "✔  Da luu vao: $envFile" -ForegroundColor Green
        }
    }
} else {
    $sbUrl = Read-Host "  SUPABASE_URL (https://xxx.supabase.co)"
    $sbKey = Read-Host "  SUPABASE_SERVICE_ROLE_KEY"
    if ($sbUrl -and $sbKey) {
        $envTarget = Join-Path (Split-Path $ScriptDir -Parent) ".env"
        Set-Content $envTarget "# task-mcp Supabase config`nSUPABASE_URL=$sbUrl`nSUPABASE_SERVICE_ROLE_KEY=$sbKey"
        Write-Host "✔  Da luu vao: $envTarget" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Bo qua — nho tu them vao .env sau." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "📊  Luu y: Can tao bang tasks trong Supabase." -ForegroundColor Yellow
Write-Host "    Chay noi dung file schema.sql trong:"
Write-Host "    Supabase Dashboard -> SQL Editor"
Write-Host ""

# ── 4. In config snippet ──────────────────────────────────
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "📋  Config can them vao .mcp.json (Claude Code)" -ForegroundColor Yellow
Write-Host "    hoac claude_desktop_config.json (Claude Desktop)" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
$ServerPathEscaped = $ServerPath.Replace('\', '\\')
Write-Host "  `"task-manager`": {"
Write-Host "    `"command`": `"node`","
Write-Host "    `"args`": [`"$ServerPathEscaped`"]"
Write-Host "  }"
Write-Host ""

# ── 5. Tự động thêm vào Claude Desktop (nếu có) ──────────
if (Test-Path $ClaudeConfig) {
    Write-Host "🔍  Phat hien Claude Desktop config tai:" -ForegroundColor Yellow
    Write-Host "    $ClaudeConfig"
    $confirm = Read-Host "    Tu dong them vao Claude Desktop? (y/N)"
    if ($confirm -match '^[Yy]$') {
        $patchScript = @"
const fs = require('fs');
const configPath = process.argv[2];
const serverPath = process.argv[3];
const raw = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(raw);
if (!config.mcpServers) config.mcpServers = {};
if (config.mcpServers['task-manager']) {
  console.log('⚠️  "task-manager" da ton tai trong config — bo qua.');
} else {
  config.mcpServers['task-manager'] = { command: 'node', args: [serverPath] };
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('✅  Da them "task-manager" vao Claude Desktop config.');
  console.log('    Vui long RESTART Claude Desktop de ap dung.');
}
"@
        $tempScript = [System.IO.Path]::GetTempFileName() + ".js"
        Set-Content -Path $tempScript -Value $patchScript
        node $tempScript $ClaudeConfig $ServerPath
        Remove-Item $tempScript
    }
}

# ── 6. Cài Claude commands ────────────────────────────────
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "📎  Cai dat Claude slash commands" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "7 commands: /task-create /task-list /task-done /task-update"
Write-Host "            /task-delete /task-resume /task-summary"
Write-Host ""
$projectDir = Read-Host "    Nhap duong dan project (Enter de bo qua)"

if ($projectDir -ne "") {
    $commandsDest = Join-Path $projectDir ".claude\commands"
    if (Test-Path $projectDir) {
        New-Item -ItemType Directory -Force -Path $commandsDest | Out-Null
        Get-ChildItem (Join-Path $ScriptDir "commands\*.md") | Copy-Item -Destination $commandsDest
        Write-Host "✔  Da copy 7 commands vao: $commandsDest" -ForegroundColor Green
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
