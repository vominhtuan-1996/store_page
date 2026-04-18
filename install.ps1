# Task MCP v2 — Claude Code Command Installer (PowerShell)
# Usage: irm "https://raw.githubusercontent.com/vominhtuan-1996/store_page/main/install.ps1" | iex

$Repo   = "vominhtuan-1996/store_page"
$Branch = "main"
$Raw    = "https://raw.githubusercontent.com/$Repo/$Branch"

$Commands = @(
  "task-create"
  "task-update"
  "task-done"
  "task-delete"
  "task-list"
  "task-resume"
  "task-summary"
  "task-mcp-v2"
)

# Target dir: project .claude/commands nếu có, không thì global
if (Test-Path ".claude") {
  $Target = ".claude\commands"
  $Scope  = "project ($PWD)"
} else {
  $Target = "$HOME\.claude\commands"
  $Scope  = "global ($HOME\.claude\commands)"
}

New-Item -ItemType Directory -Force -Path $Target | Out-Null

Write-Host ""
Write-Host "  Task MCP v2 — Claude Code Command Installer" -ForegroundColor Cyan
Write-Host "  Installing to: $Scope" -ForegroundColor DarkGray
Write-Host ""

$Installed = 0
$Failed    = 0

foreach ($Cmd in $Commands) {
  $Url  = "$Raw/.claude/commands/$Cmd.md"
  $Dest = "$Target\$Cmd.md"
  try {
    Invoke-WebRequest -Uri $Url -OutFile $Dest -ErrorAction Stop
    Write-Host "  OK  /$Cmd" -ForegroundColor Green
    $Installed++
  } catch {
    Write-Host "  FAIL  /$Cmd  ($_)" -ForegroundColor Red
    $Failed++
  }
}

Write-Host ""
Write-Host "  Done: $Installed installed, $Failed failed." -ForegroundColor Cyan
Write-Host ""
Write-Host "  Usage:"
Write-Host "    /task-mcp-v2 tao task fix bug login"
Write-Host "    /task-create gap fix crash man hinh home"
Write-Host "    /task-list"
Write-Host ""
