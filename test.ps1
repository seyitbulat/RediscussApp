$jobNames = "Rediscuss.IdentityService", "Rediscuss.ForumService", "Rediscuss.ApiGateway"
$processToStop = Get-Process | Where-Object {($jobNames -contains $_.ProcessName)}

if($processToStop){
    $processToStop | ForEach-Object {
        $processId = $_.Id
        try {
                # Stop-Process -Id $processId -Force -ErrorAction Stop
                Write-Host "- $($_.Name) servisi (PID: $processId) durduruldu." -ForegroundColor Green
            } catch {
                Write-Warning "PID: $processId ile $($_.Name) servisi durdurulurken bir hata oluştu: $_"
            }
        Write-Host
    }
}else{

}
