$ProjectRoot = $PSScriptRoot

$MicroserviceDir = Join-Path -Path $ProjectRoot -ChildPath "Rediscuss.Microservices"
$ServiceDir = Join-Path -Path $MicroserviceDir -ChildPath "services"


$ForumService = Join-Path -Path $ServiceDir -ChildPath "Rediscuss.ForumService"
$IdentityServiceDir = Join-Path -Path $ServiceDir -ChildPath "Rediscuss.IdentityService"
$GatewayDir = Join-Path -Path $ServiceDir -ChildPath "Rediscuss.ApiGateway"

$DockerComposeFile = Join-Path -Path $MicroserviceDir -ChildPath "docker-compose.yml"
$SolutionFile = Join-Path -Path $MicroserviceDir -ChildPath "Rediscuss.sln"


Write-Host "Docker konteynerleri '$($DockerComposeFile)' dosyasından başlatılıyor..." -ForegroundColor Cyan
docker compose --file $DockerComposeFile --project-directory $MicroserviceDir up -d


if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker konteynerleri başlatılamadı. Lütfen Docker Desktop'ın çalıştığından emin olun." -ForegroundColor Red
    exit
}

Write-Host "Veritabanlarının hazır olması için 20 saniye bekleniyor..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

Write-Host "Solution '$($SolutionFile)' derleniyor..." -ForegroundColor Cyan
dotnet build $SolutionFile

if ($LASTEXITCODE -ne 0) {
    Write-Host "Derleme başarısız oldu. Hataları kontrol edin." -ForegroundColor Red
    exit
}

# IdentityService'i başlat
Start-Job -Name "Rediscuss.IdentityService" -ScriptBlock {dotnet run --project $using:IdentityServiceDir}
# Start-Process powershell -ArgumentList "-NoExit -Command `$host.ui.RawUI.WindowTitle = 'IdentityService'; dotnet run --project '$IdentityServiceDir'"

# ForumService'i başlat
Start-Job -Name "Rediscuss.ForumService" -ScriptBlock {dotnet run --project $using:ForumService}
# Start-Process powershell -ArgumentList "-NoExit -Command `$host.ui.RawUI.WindowTitle = 'ForumService'; dotnet run --project '$ForumServiceDir'"

# ApiGateway'i başlat
Start-Job -Name "Rediscuss.Gateway" -ScriptBlock {dotnet run --project $using:GatewayDir}
# Start-Process powershell -ArgumentList "-NoExit -Command `$host.ui.RawUI.WindowTitle = 'ApiGateway'; dotnet run --project '$GatewayDir'"

Write-Host "`nTüm servisler başlatıldı.`n" -ForegroundColor Green