$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Test-Path ".env.moodle")) {
    if (Test-Path ".env.moodle.example") {
        Copy-Item ".env.moodle.example" ".env.moodle"
        Write-Host "Created .env.moodle from template. Update passwords before production use." -ForegroundColor Yellow
    } else {
        throw "Missing .env.moodle.example."
    }
}

docker compose --env-file .env.moodle -f docker-compose.moodle.yml up -d
Write-Host "Moodle is starting on http://localhost:8080" -ForegroundColor Green
