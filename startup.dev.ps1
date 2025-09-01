$ProjectRoot = $PSScriptRoot
$MicroserviceDir = Join-Path -Path $ProjectRoot -ChildPath "Rediscuss.Microservices"
$ServiceDir = Join-Path -Path $MicroserviceDir -ChildPath "services"
$ForumService = Join-Path -Path $ServiceDir -ChildPath "Rediscuss.ForumService"
$IdentityServiceDir = Join-Path -Path $ServiceDir -ChildPath "Rediscuss.IdentityService"
$GatewayDir = Join-Path -Path $ServiceDir -ChildPath "Rediscuss.ApiGateway"

# Önceki job'ları temizle (eğer varsa)
Get-Job | Where-Object { $_.Name -like "Rediscuss.*" } | Remove-Job -Force

Write-Host "Servisleri sıralı olarak başlatılıyor..." -ForegroundColor Cyan

# 1. Identity Service'i başlat
Write-Host "`n[1/3] Identity Service başlatılıyor..." -ForegroundColor Green
$identityJob = Start-Job -Name "Rediscuss.IdentityService" -ScriptBlock {
    param($projectPath)
    Set-Location $projectPath
    dotnet run
} -ArgumentList $IdentityServiceDir

# Identity Service'in başlamasını bekle
Write-Host "Identity Service'in başlaması bekleniyor (15 saniye)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Identity Service'in durumunu kontrol et
$identityState = Get-Job -Name "Rediscuss.IdentityService" | Select-Object -ExpandProperty State
if ($identityState -eq "Failed") {
    Write-Host "❌ Identity Service başlatılamadı!" -ForegroundColor Red
    Receive-Job -Name "Rediscuss.IdentityService"
    exit 1
} else {
    Write-Host "✅ Identity Service başlatıldı" -ForegroundColor Green
}

# 2. Forum Service'i başlat
Write-Host "`n[2/3] Forum Service başlatılıyor..." -ForegroundColor Green
$forumJob = Start-Job -Name "Rediscuss.ForumService" -ScriptBlock {
    param($projectPath)
    Set-Location $projectPath
    dotnet run
} -ArgumentList $ForumService

# Forum Service'in başlamasını bekle
Write-Host "Forum Service'in başlaması bekleniyor (15 saniye)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Forum Service'in durumunu kontrol et
$forumState = Get-Job -Name "Rediscuss.ForumService" | Select-Object -ExpandProperty State
if ($forumState -eq "Failed") {
    Write-Host "❌ Forum Service başlatılamadı!" -ForegroundColor Red
    Receive-Job -Name "Rediscuss.ForumService"
    exit 1
} else {
    Write-Host "✅ Forum Service başlatıldı" -ForegroundColor Green
}

# 3. Gateway'i başlat
Write-Host "`n[3/3] API Gateway başlatılıyor..." -ForegroundColor Green
$gatewayJob = Start-Job -Name "Rediscuss.Gateway" -ScriptBlock {
    param($projectPath)
    Set-Location $projectPath
    dotnet run
} -ArgumentList $GatewayDir

# Gateway'in başlamasını bekle
Write-Host "Gateway'in başlaması bekleniyor (10 saniye)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Gateway'in durumunu kontrol et
$gatewayState = Get-Job -Name "Rediscuss.Gateway" | Select-Object -ExpandProperty State
if ($gatewayState -eq "Failed") {
    Write-Host "❌ Gateway başlatılamadı!" -ForegroundColor Red
    Receive-Job -Name "Rediscuss.Gateway"
    exit 1
} else {
    Write-Host "✅ Gateway başlatıldı" -ForegroundColor Green
}

Write-Host "`n🚀 Tüm servisler başarıyla başlatıldı!" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "📋 Çalışan Servisler:" -ForegroundColor White
Write-Host "   • Identity Service: http://localhost:5213" -ForegroundColor Gray
Write-Host "   • Forum Service:    http://localhost:5012" -ForegroundColor Gray  
Write-Host "   • API Gateway:      http://localhost:5000" -ForegroundColor Gray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host "`n💡 Servisleri durdurmak için: " -NoNewline -ForegroundColor Yellow
Write-Host "Get-Job | Where-Object { `$_.Name -like 'Rediscuss.*' } | Stop-Job; Get-Job | Where-Object { `$_.Name -like 'Rediscuss.*' } | Remove-Job -Force" -ForegroundColor White

Write-Host "`n📊 Job durumlarını görmek için: " -NoNewline -ForegroundColor Yellow
Write-Host "Get-Job | Where-Object { `$_.Name -like 'Rediscuss.*' }" -ForegroundColor White

Write-Host "`n🔍 Hata loglarını görmek için: " -NoNewline -ForegroundColor Yellow
Write-Host "Receive-Job -Name 'Rediscuss.IdentityService'" -ForegroundColor White

# İsteğe bağlı: Job'ları sürekli monitoring
$monitor = Read-Host "`nJob'ların durumunu sürekli izlemek istiyor musunuz? (y/n)"
if ($monitor -eq "y" -or $monitor -eq "Y") {
    Write-Host "`nJob monitoring başlatıldı. Çıkmak için Ctrl+C basın.`n" -ForegroundColor Cyan
    
    while ($true) {
        Clear-Host
        Write-Host "🔄 Servis Durumları ($(Get-Date -Format 'HH:mm:ss')):" -ForegroundColor Cyan
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
        
        $jobs = Get-Job | Where-Object { $_.Name -like "Rediscuss.*" }
        foreach ($job in $jobs) {
            $status = switch ($job.State) {
                "Running" { "🟢 Aktif" }
                "Failed" { "🔴 Hata" }
                "Stopped" { "🟡 Durduruldu" }
                "Completed" { "🔵 Tamamlandı" }
                default { "⚪ $($job.State)" }
            }
            Write-Host "   $($job.Name): $status" -ForegroundColor White
        }
        
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
        Write-Host "Çıkmak için Ctrl+C basın..." -ForegroundColor Yellow
        
        Start-Sleep -Seconds 5
    }
}