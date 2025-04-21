# Lấy IP của máy host (thường là IP mạng LAN)
$hostIP = (Get-NetIPAddress -AddressFamily IPv4 `
           | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.*" } `
           | Select-Object -First 1).IPAddress

# Ghi vào file .env
"HOST_IP=$hostIP" | Out-File -Encoding ascii -FilePath ".env"
