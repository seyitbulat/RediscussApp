$ProjectRoot = $PSScriptRoot

$IdentityServicePath = Join-Path $ProjectRoot 'Rediscuss.Microservices\services\Rediscuss.IdentityService'

$GatewayServicePath = Join-Path $ProjectRoot 'Rediscuss.Microservices\services\Rediscuss.ApiGateway'


Write-Host "Starting Identity Service..."
Start-Process "dotnet" "run --project `"$IdentityServicePath`"" -NoNewWindow
Start-Sleep -Seconds 5

Write-Host "Starting API Gateway Service..."
Start-Process "dotnet" "run --project `"$GatewayServicePath`"" -NoNewWindow
Write-Host "All services started."
Write-Host "Press Enter to exit and stop all services."
Read-Host
Get-Process dotnet | ForEach-Object { $_.CloseMainWindow() | Out-Null; $_.WaitForExit() }
Write-Host "All services stopped."
