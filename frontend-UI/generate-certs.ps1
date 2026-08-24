# Regenerates the self-signed development certificates used to serve this
# app over HTTPS. Browsers only expose getUserMedia (face scanning) and
# geolocation (attendance radius check) in secure contexts — see
# vite.config.js / server.js.
#
# Usage:  npm run certs     (requires openssl on PATH; Git for Windows ships one)

$openssl = (Get-Command openssl -ErrorAction SilentlyContinue).Source
if (-not $openssl) {
    $candidates = @(
        "C:\Program Files\Git\usr\bin\openssl.exe",
        "C:\Program Files\Git\mingw64\bin\openssl.exe"
    )
    $openssl = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
}
if (-not $openssl) {
    Write-Error "openssl.exe not found. Install Git for Windows or OpenSSL, then re-run."
    exit 1
}

New-Item -ItemType Directory -Force -Path "$PSScriptRoot\certs" | Out-Null

& $openssl req -x509 -newkey rsa:2048 -sha256 -nodes `
    -days 825 `
    -keyout "$PSScriptRoot\certs\key.pem" `
    -out "$PSScriptRoot\certs\cert.pem" `
    -subj "/C=IN/ST=State/L=City/O=FaceAttendance/OU=Dev/CN=localhost" `
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

Write-Host "`nDev certificates written to $PSScriptRoot\certs"
Write-Host "Restart the dev server / 'npm start' to serve over https://"
