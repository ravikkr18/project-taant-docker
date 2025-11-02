# PowerShell script to install mkcert (Laravel Herd style setup)
# Run as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing mkcert for Local HTTPS" -ForegroundColor Cyan
Write-Host "(Laravel Herd style setup)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script requires Administrator privileges." -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

try {
    # Check if Chocolatey is installed
    $chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue

    if (-not $chocoInstalled) {
        Write-Host "Installing Chocolatey..." -ForegroundColor Yellow

        # Install Chocolatey
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

        # Refresh environment
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

        Write-Host "✓ Chocolatey installed" -ForegroundColor Green
    } else {
        Write-Host "✓ Chocolatey already installed" -ForegroundColor Green
    }

    # Install mkcert
    Write-Host "Installing mkcert..." -ForegroundColor Blue
    choco install mkcert -y

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to install mkcert"
    }

    Write-Host "✓ mkcert installed" -ForegroundColor Green

    # Create local CA
    Write-Host "Creating local CA..." -ForegroundColor Blue
    mkcert -install

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create local CA"
    }

    Write-Host "✓ Local CA created and trusted by your system" -ForegroundColor Green

    # Create certificates directory
    New-Item -ItemType Directory -Path "traefik\ssl" -Force | Out-Null

    # Generate certificates
    Write-Host "Generating certificates for *.taant.in..." -ForegroundColor Blue
    mkcert -pkcs12 -p12-file "traefik\ssl\wildcard.p12" -cert-file "traefik\ssl\wildcard.pem" -key-file "traefik\ssl\wildcard-key.pem" "*.taant.in" "taant.in" "*.localhost" "localhost"

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to generate certificates"
    }

    Write-Host "✓ Certificates generated successfully" -ForegroundColor Green

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Setup Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🎉 Your browser will now trust HTTPS certificates automatically!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "1. Run: docker-compose -f docker-compose.local-ssl.yml up -d" -ForegroundColor Cyan
    Write-Host "2. Access: https://taant.in" -ForegroundColor Green
    Write-Host ""
    Write-Host "No certificate installation needed - mkcert handles everything!" -ForegroundColor Gray

} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please try manually:" -ForegroundColor Yellow
    Write-Host "1. Install mkcert: choco install mkcert -y" -ForegroundColor Gray
    Write-Host "2. Create CA: mkcert -install" -ForegroundColor Gray
    Write-Host "3. Generate certs: mkcert '*.taant.in'" -ForegroundColor Gray
}

Read-Host "Press Enter to exit"