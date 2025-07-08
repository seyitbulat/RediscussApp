$ProjectRoot = $PSScriptRoot

$MicroserviceDir = Join-Path -Path $ProjectRoot -ChildPath "Rediscuss.Microservices"

$DockerComposeFile = Join-Path -Path $MicroserviceDir -ChildPath "docker-compose.yml"


$jobNames = "Rediscuss.IdentityService", "Rediscuss.ForumService", "Rediscuss.ApiGateway"
$processToStop = Get-Process | Where-Object {($jobNames -contains $_.ProcessName)}

# ===================================================================================
# SCRIPT'İN ANA BÖLÜMÜ
# ===================================================================================

Write-Host "Rediscuss Mikroservis Sistemi kapatılıyor..." -ForegroundColor Yellow

# 1. Adım: Alakalı tüm dotnet uygulamalarını durdur
if($processToStop){
    $processToStop | ForEach-Object {
        $processId = $_.Id
        try {
                Stop-Process -Id $processId -Force -ErrorAction Stop
                Write-Host "- $($_.Name) servisi (PID: $processId) durduruldu." -ForegroundColor Green
            } catch {
                Write-Warning "PID: $processId ile $($_.Name) servisi durdurulurken bir hata oluştu: $_"
            }
        Write-Host
    }
}else{

}

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