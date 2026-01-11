Param(
  [switch]$Electron
)

function Test-OllamaUp {
  try {
    $resp = Invoke-WebRequest -Uri http://localhost:11434/api/tags -TimeoutSec 2 -UseBasicParsing
    return $resp.StatusCode -eq 200
  } catch {
    return $false
  }
}

Write-Host "[EstudIA] Checking Ollama service..." -ForegroundColor Cyan
if (-not (Test-OllamaUp)) {
  Write-Host "[EstudIA] Ollama not running. Starting..." -ForegroundColor Yellow
  try {
    Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden -PassThru | Out-Null
    Start-Sleep -Seconds 2
  } catch {
    Write-Host "[EstudIA] Failed to start Ollama: $_" -ForegroundColor Red
  }
} else {
  Write-Host "[EstudIA] Ollama already running." -ForegroundColor Green
}

# Wait until Ollama responds or timeout
$maxWait = 15
$elapsed = 0
while (-not (Test-OllamaUp) -and $elapsed -lt $maxWait) {
  Start-Sleep -Seconds 1
  $elapsed++
  Write-Host "[EstudIA] Waiting Ollama ($elapsed s)..." -NoNewline
}
if (-not (Test-OllamaUp)) { Write-Host "[EstudIA] Ollama did not become ready (continuing anyway)." -ForegroundColor Yellow }

Write-Host "[EstudIA] Starting Vite dev server..." -ForegroundColor Cyan
$viteJob = Start-Process -FilePath "npm" -ArgumentList "run","dev" -PassThru

if ($Electron) {
  Write-Host "[EstudIA] Will launch Electron after Vite is reachable..." -ForegroundColor Cyan
  npm exec wait-on http://localhost:5173
  Write-Host "[EstudIA] Launching Electron..." -ForegroundColor Cyan
  Start-Process -FilePath "npx" -ArgumentList "electron","." -PassThru | Out-Null
}
