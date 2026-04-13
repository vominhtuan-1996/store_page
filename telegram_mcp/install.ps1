# telegram-mcp install script (Windows PowerShell)
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "=== telegram-mcp install ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Node.js
Write-Host "1/5  Kiểm tra Node.js..."
try {
    $nodeVer = node --version
    Write-Host "     Node.js $nodeVer" -ForegroundColor Green
} catch {
    Write-Host "     Node.js chua cai. Tai tai https://nodejs.org (can >= 18)" -ForegroundColor Red
    exit 1
}

# Step 2: Install dependencies
Write-Host "2/5  Cai dependencies (npm install)..."
Set-Location $ScriptDir
npm install --silent
Write-Host "     Dependencies da cai" -ForegroundColor Green

# Step 3: Setup .env
Write-Host "3/5  Cau hinh Telegram credentials..."
$EnvFile = Join-Path (Split-Path -Parent $ScriptDir) ".env"

$BotToken = Read-Host "     Nhap TELEGRAM_BOT_TOKEN (Enter de bo qua)"
$ChatId = Read-Host "     Nhap TELEGRAM_CHAT_ID (Enter de bo qua)"

if ($BotToken -or $ChatId) {
    if (Test-Path $EnvFile) {
        $content = Get-Content $EnvFile -Raw
        if ($BotToken) {
            if ($content -match "TELEGRAM_BOT_TOKEN=") {
                $content = $content -replace "TELEGRAM_BOT_TOKEN=.*", "TELEGRAM_BOT_TOKEN=$BotToken"
            } else {
                $content += "`nTELEGRAM_BOT_TOKEN=$BotToken"
            }
        }
        if ($ChatId) {
            if ($content -match "TELEGRAM_CHAT_ID=") {
                $content = $content -replace "TELEGRAM_CHAT_ID=.*", "TELEGRAM_CHAT_ID=$ChatId"
            } else {
                $content += "`nTELEGRAM_CHAT_ID=$ChatId"
            }
        }
        Set-Content $EnvFile $content
    } else {
        "TELEGRAM_BOT_TOKEN=$BotToken`nTELEGRAM_CHAT_ID=$ChatId" | Set-Content $EnvFile
    }
    Write-Host "     Credentials da luu vao $EnvFile" -ForegroundColor Green
} else {
    Write-Host "     Bo qua (them vao .env thu cong sau)"
}

# Step 4: Print config snippet
$ServerPath = Join-Path $ScriptDir "server.js"
Write-Host ""
Write-Host "4/5  Config snippet cho .mcp.json:" -ForegroundColor Yellow
Write-Host @"
{
  "mcpServers": {
    "telegram": {
      "command": "node",
      "args": ["$($ServerPath -replace '\\','\\\\')"]
    }
  }
}
"@ -ForegroundColor Yellow
Write-Host ""

# Step 5: Auto-patch Claude Desktop
$ClaudeConfig = "$env:APPDATA\Claude\claude_desktop_config.json"
$DoPatch = Read-Host "5/5  Tu dong them vao Claude Desktop config? (y/N)"
if ($DoPatch -match "^[Yy]") {
    if (Get-Command python3 -ErrorAction SilentlyContinue) {
        $py = @"
import json,sys,os
p=sys.argv[1]; s=sys.argv[2]+'/server.js'
os.makedirs(os.path.dirname(p),exist_ok=True)
c={}
if os.path.exists(p):
    with open(p) as f: c=json.load(f)
c.setdefault('mcpServers',{})
c['mcpServers']['telegram']={'command':'node','args':[s]}
with open(p,'w') as f: json.dump(c,f,indent=2)
print('Patched')
"@
        python3 -c $py $ClaudeConfig ($ScriptDir -replace '\\','/')
        Write-Host "     Da patch Claude Desktop config" -ForegroundColor Green
    } else {
        Write-Host "     python3 khong co san, hay them thu cong" -ForegroundColor Yellow
    }
}

# Step 6: Copy slash commands
Write-Host ""
$ProjectPath = Read-Host "Copy slash commands vao project? Nhap duong dan project (Enter de bo qua)"
if ($ProjectPath -and (Test-Path $ProjectPath)) {
    $Dest = Join-Path $ProjectPath ".claude\commands"
    New-Item -ItemType Directory -Force -Path $Dest | Out-Null
    Copy-Item "$ScriptDir\commands\*.md" $Dest -Force
    Write-Host "     Da copy commands vao $Dest" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Cai dat hoan tat! ===" -ForegroundColor Green
Write-Host "Restart Claude Desktop hoac reload Claude Code de dung:"
Write-Host "  Tools: send_telegram_notification, send_telegram_photo"
Write-Host "  Commands: /telegram-notify, /telegram-photo"
Write-Host ""
