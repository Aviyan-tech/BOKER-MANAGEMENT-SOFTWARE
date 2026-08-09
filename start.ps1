# TerraFlow - Start All Services
Write-Host "Starting TerraFlow..." -ForegroundColor Cyan

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root "apps\backend"
$frontend = Join-Path $root "apps\web"

# --- Backend Setup & Start ---
Write-Host "`n[1/4] Installing Python dependencies..." -ForegroundColor Yellow
pip install -r "$backend\requirements.txt" --quiet

Write-Host "[2/4] Running database migrations..." -ForegroundColor Yellow
Set-Location $backend
alembic upgrade head

Write-Host "[3/4] Seeding database..." -ForegroundColor Yellow
python seed.py

Write-Host "[4/4] Starting backend + frontend in new windows..." -ForegroundColor Yellow

# Start backend in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backend'; Write-Host 'Backend running on http://localhost:8000' -ForegroundColor Green; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

# Start frontend in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontend'; npm install; Write-Host 'Frontend running on http://localhost:3000' -ForegroundColor Green; npm run dev"

Write-Host "`nAll services starting!" -ForegroundColor Green
Write-Host "  Frontend  -> http://localhost:3000" -ForegroundColor Cyan
Write-Host "  API Docs  -> http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "`nTest accounts (password: 'password'):" -ForegroundColor White
Write-Host "  Customer  -> customer@terraflow.com" -ForegroundColor Gray
Write-Host "  Agent     -> agent@terraflow.com" -ForegroundColor Gray
Write-Host "  Admin     -> admin@terraflow.com" -ForegroundColor Gray

Set-Location $root
