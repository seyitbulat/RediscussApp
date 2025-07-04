$ProjectRoot = $PSScriptRoot

$MicroserviceDir = Join-Path -Path $ProjectRoot -ChildPath "Rediscuss.Microservices"
$ServiceDir = Join-Path -Path $MicroserviceDir -ChildPath "services"


$ForumServiceDir = Join-Path -Path $ServiceDir -ChildPath "Rediscuss.ForumService"
$IdentityServiceDir = Join-Path -Path $ServiceDir -ChildPath "Rediscuss.IdentityService"
$GatewayDir = Join-Path -Path $ServiceDir -ChildPath "Rediscuss.ApiGateway"

$DockerComposeFile = Join-Path -Path $MicroserviceDir -ChildPath "docker-compose.yml"
$SolutionFile = Join-Path -Path $MicroserviceDir -ChildPath "Rediscuss.sln"


# ===================================================================================
# SCRIPT'İN ANA BÖLÜMÜ
# ===================================================================================

Write-Host "Rediscuss Mikroservis Sistemi kapatılıyor..." -ForegroundColor Yellow

# 1. Adım: Tüm dotnet uygulamalarını durdur
# 'dotnet' adıyla çalışan tüm süreçleri bulur ve zorla kapatır.
Write-Host "Tüm dotnet uygulamaları durduruluyor..." -ForegroundColor Cyan
Get-Process dotnet | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "Dotnet uygulamaları durduruldu." -ForegroundColor Green


# 2. Adım: Docker Konteynerlerini Durdur
# 'docker compose down' komutu, 'up' ile oluşturulan konteynerleri durdurur ve network'ü kaldırır.
Write-Host "Docker konteynerleri '$($DockerComposeFile)' dosyasına göre durduruluyor..." -ForegroundColor Cyan
docker compose --file $DockerComposeFile --project-directory $MicroserviceDir down

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker konteynerleri durdurulamadı." -ForegroundColor Red
    exit
}

Write-Host "Docker konteynerleri başarıyla durduruldu." -ForegroundColor Green
Write-Host "`nSistem tamamen kapatıldı.`n" -ForegroundColor Yellow