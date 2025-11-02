# PowerShell script for setting up Taant Local HTTPS with Traefik
# Run as: powershell -ExecutionPolicy Bypass -File scripts\setup-traefik-ssl.ps1

param(
    [switch]$SkipCerts
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setting up Taant Local HTTPS with Traefik" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script requires Administrator privileges for hosts file modification." -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Manually add these lines to C:\Windows\System32\drivers\etc\hosts:" -ForegroundColor Yellow
    Write-Host "  127.0.0.1   taant.in"
    Write-Host "  127.0.0.1   admin.taant.in"
    Write-Host "  127.0.0.1   supplier.taant.in"
    Write-Host "  127.0.0.1   backend.taant.in"
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

try {
    # Step 1: Setup hosts file
    Write-Host "Step 1: Setting up local domains in hosts file..." -ForegroundColor Green
    Write-Host ""

    $hostsPath = "$env:windir\System32\drivers\etc\hosts"
    $backupPath = "$env:windir\System32\drivers\etc\hosts.backup.taant"

    # Create backup
    Copy-Item $hostsPath $backupPath -Force

    # Read current hosts file
    $hostsContent = Get-Content $hostsPath

    # Remove existing taant.in entries
    $hostsContent = $hostsContent | Where-Object { $_ -notmatch "taant\.in" }

    # Add new entries
    $newEntries = @(
        "127.0.0.1   taant.in",
        "127.0.0.1   admin.taant.in",
        "127.0.0.1   supplier.taant.in",
        "127.0.0.1   backend.taant.in"
    )

    $hostsContent += $newEntries

    # Write back to hosts file
    $hostsContent | Set-Content $hostsPath -Force

    Write-Host "✓ Hosts file updated successfully" -ForegroundColor Green

    # Step 2: Generate certificates
    if (-not $SkipCerts) {
        Write-Host ""
        Write-Host "Step 2: Generating SSL certificates..." -ForegroundColor Green
        Write-Host ""

        # Check for OpenSSL
        $opensslPaths = @(
            "C:\Program Files\OpenSSL-Win64\bin\openssl.exe",
            "C:\Program Files (x86)\OpenSSL-Win32\bin\openssl.exe",
            "openssl.exe"
        )

        $opensslCmd = $null
        foreach ($path in $opensslPaths) {
            if (Get-Command $path -ErrorAction SilentlyContinue) {
                $opensslCmd = $path
                break
            }
        }

        if (-not $opensslCmd) {
            Write-Host "⚠ OpenSSL not found. Skipping certificate generation." -ForegroundColor Yellow
            Write-Host "Please install OpenSSL from: https://slproweb.com/products/Win32OpenSSL.html" -ForegroundColor Yellow
        } else {
            Write-Host "✓ OpenSSL found: $opensslCmd" -ForegroundColor Green

            # Create directories
            New-Item -ItemType Directory -Path "traefik\ssl" -Force | Out-Null

            # Generate CA
            Write-Host "Creating Certificate Authority..." -ForegroundColor Blue
            & $opensslCmd genrsa -out "traefik\ssl\ca-key.pem" 4096
            if ($LASTEXITCODE -eq 0) {
                & $opensslCmd req -new -x509 -days 3650 -key "traefik\ssl\ca-key.pem" -sha256 -out "traefik\ssl\ca.pem" -subj "/C=US/ST=State/L=City/O=Taant Local CA/CN=Taant Local Development"

                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✓ Certificate Authority created" -ForegroundColor Green

                    # Generate wildcard certificate
                    Write-Host "Creating wildcard certificate..." -ForegroundColor Blue
                    & $opensslCmd genrsa -out "traefik\ssl\wildcard-key.pem" 2048

                    if ($LASTEXITCODE -eq 0) {
                        & $opensslCmd req -new -sha256 -key "traefik\ssl\wildcard-key.pem" -subj "/C=US/ST=State/L=City/O=Taant Development/CN=*.taant.in" -out "traefik\ssl\wildcard.csr"

                        # Create extension file
                        $extContent = @"
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names
[alt_names]
DNS.1 = taant.in
DNS.2 = *.taant.in
DNS.3 = admin.taant.in
DNS.4 = supplier.taant.in
DNS.5 = backend.taant.in
"@
                        $extContent | Set-Content "traefik\ssl\wildcard-ext.cnf" -Force

                        & $opensslCmd x509 -req -in "traefik\ssl\wildcard.csr" -CA "traefik\ssl\ca.pem" -CAkey "traefik\ssl\ca-key.pem" -CAcreateserial -out "traefik\ssl\wildcard.pem" -days 3650 -sha256 -extfile "traefik\ssl\wildcard-ext.cnf"

                        if ($LASTEXITCODE -eq 0) {
                            Write-Host "✓ SSL certificates generated successfully" -ForegroundColor Green

                            # Cleanup temporary files
                            Remove-Item "traefik\ssl\wildcard.csr" -ErrorAction SilentlyContinue
                            Remove-Item "traefik\ssl\wildcard-ext.cnf" -ErrorAction SilentlyContinue
                        } else {
                            Write-Host "✗ Failed to sign certificate" -ForegroundColor Red
                        }
                    } else {
                        Write-Host "✗ Failed to generate certificate private key" -ForegroundColor Red
                    }
                } else {
                    Write-Host "✗ Failed to generate CA certificate" -ForegroundColor Red
                }
            } else {
                Write-Host "✗ Failed to generate CA private key" -ForegroundColor Red
            }
        }
    }

    # Step 3: Create Docker network
    Write-Host ""
    Write-Host "Step 3: Creating Docker network..." -ForegroundColor Green
    docker network create taant-network 2>$null

    # Summary
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Setup completed!" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    if (Test-Path "traefik\ssl\ca.pem") {
        Write-Host "NEXT STEPS:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. Install the local CA certificate:" -ForegroundColor White
        Write-Host "   - Double-click: traefik\ssl\ca.pem" -ForegroundColor Gray
        Write-Host "   - Select 'Install Certificate'" -ForegroundColor Gray
        Write-Host "   - Choose 'Current User' or 'Local Machine'" -ForegroundColor Gray
        Write-Host "   - Select 'Trusted Root Certification Authorities'" -ForegroundColor Gray
        Write-Host "   - Complete the wizard" -ForegroundColor Gray
        Write-Host ""
        Write-Host "2. Start the services:" -ForegroundColor White
        Write-Host "   docker-compose -f docker-compose.local-ssl.yml up -d" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "3. Access your applications:" -ForegroundColor White
        Write-Host "   - Frontend: https://taant.in" -ForegroundColor Green
        Write-Host "   - Admin: https://admin.taant.in" -ForegroundColor Green
        Write-Host "   - Supplier: https://supplier.taant.in" -ForegroundColor Green
        Write-Host "   - Backend: https://backend.taant.in" -ForegroundColor Green
        Write-Host "   - Traefik Dashboard: http://localhost:8080" -ForegroundColor Green
    } else {
        Write-Host "Certificate generation was skipped or failed." -ForegroundColor Yellow
        Write-Host "Please install OpenSSL and run the script again." -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "For cleanup, run: scripts\teardown-traefik-ssl.bat" -ForegroundColor Gray
    Write-Host ""

} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Setup failed. Please check the error above and try again." -ForegroundColor Red
}

Read-Host "Press Enter to exit"