param(
    [string]$EnvFile = ".env.moodle",
    [string]$BaseUrl = "https://cet.iitp.ac.in/moodle"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (-not (Test-Path $EnvFile)) {
    if (Test-Path ".env.moodle.example") {
        Copy-Item ".env.moodle.example" $EnvFile
        Write-Host "Created $EnvFile from template. Update secrets before production use." -ForegroundColor Yellow
    } else {
        throw "Missing .env.moodle.example"
    }
}

docker compose --env-file $EnvFile -f docker-compose.moodle.yml pull
docker compose --env-file $EnvFile -f docker-compose.moodle.yml up -d

# Apply base URL and reverse proxy settings for sub-path deployment.
docker exec moodlesecurity-moodle php /opt/bitnami/moodle/admin/cli/cfg.php --name=wwwroot --set="$BaseUrl"
docker exec moodlesecurity-moodle php /opt/bitnami/moodle/admin/cli/cfg.php --name=reverseproxy --set=1
docker exec moodlesecurity-moodle php /opt/bitnami/moodle/admin/cli/cfg.php --name=sslproxy --set=1

docker compose --env-file $EnvFile -f docker-compose.moodle.yml restart moodle

Write-Host "Moodle deployment finished. Verify at $BaseUrl" -ForegroundColor Green
