# Comprehensive HTTPS Fix Script
# Run as: powershell -ExecutionPolicy Bypass -File scripts\fix-https.ps1

param(
    [switch]$Force
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Comprehensive HTTPS Fix for Taant" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Administrator privileges
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ This script requires Administrator privileges" -ForegroundColor Red
    Write-Host "Right-click PowerShell and 'Run as Administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

function Write-Status {
    param($Message, $Status = "Info")

    switch ($Status) {
        "Success" { Write-Host "✅ $Message" -ForegroundColor Green }
        "Error"   { Write-Host "❌ $Message" -ForegroundColor Red }
        "Warning" { Write-Host "⚠️  $Message" -ForegroundColor Yellow }
        "Info"    { Write-Host "ℹ️  $Message" -ForegroundColor Blue }
        default   { Write-Host $Message }
    }
}

try {
    # Step 1: Stop all services
    Write-Status "Step 1: Stopping all Docker services..." -Info
    docker-compose -f docker-compose.local-ssl.yml down 2>$null
    docker-compose -f docker-compose.mkcert.yml down 2>$null
    docker-compose -f docker-compose.traefik.yml down 2>$null
    Write-Status "Services stopped" -Success

    # Step 2: Recreate network
    Write-Status "Step 2: Recreating Docker network..." -Info
    docker network rm taant-network 2>$null
    docker network create taant-network 2>$null
    Write-Status "Docker network recreated" -Success

    # Step 3: Setup hosts file
    Write-Status "Step 3: Configuring hosts file..." -Info
    $hostsPath = "$env:windir\System32\drivers\etc\hosts"
    $backupPath = "$env:windir\System32\drivers\etc\hosts.backup.taant"

    Copy-Item $hostsPath $backupPath -Force
    $hostsContent = Get-Content $hostsPath | Where-Object { $_ -notmatch "taant\.in" }
    $newEntries = @(
        "127.0.0.1   taant.in",
        "127.0.0.1   admin.taant.in",
        "127.0.0.1   supplier.taant.in",
        "127.0.0.1   backend.taant.in"
    )
    $hostsContent += $newEntries
    $hostsContent | Set-Content $hostsPath -Force
    Write-Status "Hosts file configured" -Success

    # Step 4: Install Chocolatey if needed
    Write-Status "Step 4: Checking Chocolatey..." -Info
    $chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue

    if (-not $chocoInstalled) {
        Write-Status "Installing Chocolatey..." -Info
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

        # Refresh environment
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        Start-Sleep -Seconds 5
        Write-Status "Chocolatey installed" -Success
    } else {
        Write-Status "Chocolatey already installed" -Success
    }

    # Step 5: Install mkcert
    Write-Status "Step 5: Installing mkcert..." -Info
    $result = choco install mkcert -y
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to install mkcert"
    }
    Write-Status "mkcert installed" -Success

    # Step 6: Create local CA
    Write-Status "Step 6: Creating local Certificate Authority..." -Info
    $result = mkcert -install
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create local CA"
    }
    Write-Status "Local CA created and trusted" -Success

    # Step 7: Generate certificates
    Write-Status "Step 7: Generating SSL certificates..." -Info
    New-Item -ItemType Directory -Path "traefik\ssl" -Force | Out-Null

    $domains = "*.taant.in", "taant.in", "admin.taant.in", "supplier.taant.in", "backend.taant.in", "*.localhost", "localhost"
    $domainsStr = $domains -join '" "'

    $result = mkcert -cert-file "traefik\ssl\wildcard.pem" -key-file "traefik\ssl\wildcard-key.pem" $domains
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to generate certificates"
    }
    Write-Status "SSL certificates generated" -Success

    # Step 8: Verify certificates
    Write-Status "Step 8: Verifying certificates..." -Info
    if ((Test-Path "traefik\ssl\wildcard.pem") -and (Test-Path "traefik\ssl\wildcard-key.pem")) {
        Write-Status "Certificates verified" -Success
    } else {
        throw "Certificate files not found"
    }

    # Step 9: Check port conflicts
    Write-Status "Step 9: Checking for port conflicts..." -Info
    $port443 = Get-NetTCPConnection -LocalPort 443 -ErrorAction SilentlyContinue
    if ($port443) {
        Write-Status "Port 443 is in use. Attempting to free it..." -Warning

        # Stop common conflicting services
        Stop-Service -Name "W3SVC" -ErrorAction SilentlyContinue -Force
        Stop-Process -Name "skype" -ErrorAction SilentlyContinue -Force
        Stop-Process -Name "vmware-hostd" -ErrorAction SilentlyContinue -Force

        Write-Status "Attempted to free port 443" -Info
    } else {
        Write-Status "Port 443 is available" -Success
    }

    # Step 10: Start services
    Write-Status "Step 10: Starting Docker services..." -Info
    if (Test-Path "docker-compose.mkcert.yml") {
        $result = docker-compose -f docker-compose.mkcert.yml up -d
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to start Docker services"
        }
        Write-Status "Docker services started" -Success
    } else {
        throw "docker-compose.mkcert.yml not found"
    }

    # Step 11: Wait for services
    Write-Status "Step 11: Waiting for services to initialize..." -Info
    Start-Sleep -Seconds 10

    # Step 12: Check service status
    Write-Status "Step 12: Checking service status..." -Info
    $services = docker-compose -f docker-compose.mkcert.yml ps
    Write-Host $services

    # Step 13: Test connectivity
    Write-Status "Step 13: Testing HTTPS connectivity..." -Info
    try {
        $response = Invoke-WebRequest -Uri "https://taant.in" -SkipCertificateCheck -TimeoutSec 5 -ErrorAction Stop
        Write-Status "HTTPS connection successful" -Success
    } catch {
        Write-Status "HTTPS connection test failed (this might be normal)" -Warning
    }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "🎉 HTTPS Setup Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your applications are now available:" -ForegroundColor Cyan
    Write-Host "🌐 Frontend:      https://taant.in" -ForegroundColor White
    Write-Host "🛡️  Admin Panel:  https://admin.taant.in" -ForegroundColor White
    Write-Host "📦 Supplier:      https://supplier.taant.in" -ForegroundColor White
    Write-Host "⚙️  Backend API:  https://backend.taant.in" -ForegroundColor White
    Write-Host "📊 Traefik:       http://localhost:8080" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Open your browser and try the URLs above" -ForegroundColor Gray
    Write-Host "2. If you see errors, run: docker-compose -f docker-compose.mkcert.yml logs" -ForegroundColor Gray
    Write-Host "3. Restart your browser if needed" -ForegroundColor Gray
    Write-Host "4. Clear browser cache (Ctrl+F5)" -ForegroundColor Gray

} catch {
    Write-Host ""
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. Make sure Docker Desktop is running" -ForegroundColor Gray
    Write-Host "2. Check if ports 80, 443, 8080 are available" -ForegroundColor Gray
    Write-Host "3. Run: scripts\diagnose-https.bat" -ForegroundColor Gray
    Write-Host "4. Try restarting your computer" -ForegroundColor Gray
}

Read-Host "Press Enter to exit"