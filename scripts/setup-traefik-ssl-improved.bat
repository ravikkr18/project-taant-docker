@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Setting up Taant Local HTTPS with Traefik
echo ========================================
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo This script requires Administrator privileges for hosts file modification.
    echo Please run as Administrator and try again.
    echo.
    echo Alternative: Manually add these lines to C:\Windows\System32\drivers\etc\hosts:
    echo   127.0.0.1   taant.in
    echo   127.0.0.1   admin.taant.in
    echo   127.0.0.1   supplier.taant.in
    echo   127.0.0.1   backend.taant.in
    echo.
    pause
    exit /b 1
)

echo Step 1: Setting up local domains in hosts file...
echo.

REM Create backup
copy %windir%\System32\drivers\etc\hosts %windir%\System32\drivers\etc\hosts.backup.taant >nul 2>&1

REM Remove existing entries if they exist
findstr /v /c:"taant.in" %windir%\System32\drivers\etc\hosts > %temp%\hosts.tmp 2>nul

REM Add new entries
echo 127.0.0.1   taant.in >> %temp%\hosts.tmp
echo 127.0.0.1   admin.taant.in >> %temp%\hosts.tmp
echo 127.0.0.1   supplier.taant.in >> %temp%\hosts.tmp
echo 127.0.0.1   backend.taant.in >> %temp%\hosts.tmp

REM Replace hosts file
copy %temp%\hosts.tmp %windir%\System32\drivers\etc\hosts >nul 2>&1
del %temp%\hosts.tmp >nul 2>&1

echo ✓ Hosts file updated successfully

echo.
echo Step 2: Checking for OpenSSL...
echo.

REM Check for OpenSSL in different locations
set OPENSSL_CMD=
if exist "C:\Program Files\OpenSSL-Win64\bin\openssl.exe" (
    set OPENSSL_CMD=C:\Program Files\OpenSSL-Win64\bin\openssl.exe
) else if exist "C:\Program Files (x86)\OpenSSL-Win32\bin\openssl.exe" (
    set OPENSSL_CMD=C:\Program Files (x86)\OpenSSL-Win32\bin\openssl.exe
) else (
    openssl version >nul 2>&1
    if !errorlevel! equ 0 (
        set OPENSSL_CMD=openssl
    )
)

if "!OPENSSL_CMD!"=="" (
    echo ✗ OpenSSL not found in system PATH
    echo.
    echo Please install OpenSSL from: https://slproweb.com/products/Win32OpenSSL.html
    echo Or use Git Bash to run the certificate generation script.
    echo.
    echo Skipping certificate generation. You can generate certificates manually later.
) else (
    echo ✓ OpenSSL found: !OPENSSL_CMD!
    echo.
    echo Step 3: Generating SSL certificates...
    echo.

    REM Create directories
    if not exist traefik\ssl mkdir traefik\ssl

    REM Generate CA
    echo Creating Certificate Authority...
    "!OPENSSL_CMD!" genrsa -out traefik\ssl\ca-key.pem 4096 >nul 2>&1
    if !errorlevel! neq 0 (
        echo ✗ Failed to generate CA private key
        goto :skip_certs
    )

    "!OPENSSL_CMD!" req -new -x509 -days 3650 -key traefik\ssl\ca-key.pem -sha256 -out traefik\ssl\ca.pem -subj "/C=US/ST=State/L=City/O=Taant Local CA/CN=Taant Local Development" >nul 2>&1
    if !errorlevel! neq 0 (
        echo ✗ Failed to generate CA certificate
        goto :skip_certs
    )

    echo ✓ Certificate Authority created

    REM Generate wildcard certificate
    echo Creating wildcard certificate...
    "!OPENSSL_CMD!" genrsa -out traefik\ssl\wildcard-key.pem 2048 >nul 2>&1
    if !errorlevel! neq 0 (
        echo ✗ Failed to generate certificate private key
        goto :skip_certs
    )

    "!OPENSSL_CMD!" req -new -sha256 -key traefik\ssl\wildcard-key.pem -subj "/C=US/ST=State/L=City/O=Taant Development/CN=*.taant.in" -out traefik\ssl\wildcard.csr >nul 2>&1
    if !errorlevel! neq 0 (
        echo ✗ Failed to generate certificate request
        goto :skip_certs
    )

    REM Create extension file
    echo authorityKeyIdentifier=keyid,issuer > traefik\ssl\wildcard-ext.cnf
    echo basicConstraints=CA:FALSE >> traefik\ssl\wildcard-ext.cnf
    echo keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment >> traefik\ssl\wildcard-ext.cnf
    echo subjectAltName = @alt_names >> traefik\ssl\wildcard-ext.cnf
    echo [alt_names] >> traefik\ssl\wildcard-ext.cnf
    echo DNS.1 = taant.in >> traefik\ssl\wildcard-ext.cnf
    echo DNS.2 = *.taant.in >> traefik\ssl\wildcard-ext.cnf
    echo DNS.3 = admin.taant.in >> traefik\ssl\wildcard-ext.cnf
    echo DNS.4 = supplier.taant.in >> traefik\ssl\wildcard-ext.cnf
    echo DNS.5 = backend.taant.in >> traefik\ssl\wildcard-ext.cnf

    "!OPENSSL_CMD!" x509 -req -in traefik\ssl\wildcard.csr -CA traefik\ssl\ca.pem -CAkey traefik\ssl\ca-key.pem -CAcreateserial -out traefik\ssl\wildcard.pem -days 3650 -sha256 -extfile traefik\ssl\wildcard-ext.cnf >nul 2>&1
    if !errorlevel! neq 0 (
        echo ✗ Failed to sign certificate
        goto :skip_certs
    )

    echo ✓ SSL certificates generated successfully
    del traefik\ssl\wildcard.csr >nul 2>&1
    del traefik\ssl\wildcard-ext.cnf >nul 2>&1
)

:skip_certs

echo.
echo Step 4: Creating Docker network...
docker network create taant-network 2>nul

echo.
echo ========================================
echo Setup completed!
echo ========================================
echo.
echo NEXT STEPS:
echo.

if exist traefik\ssl\ca.pem (
    echo 1. Install the local CA certificate:
    echo    - Double-click: traefik\ssl\ca.pem
    echo    - Select "Install Certificate"
    echo    - Choose "Current User" or "Local Machine"
    echo    - Select "Trusted Root Certification Authorities"
    echo    - Complete the wizard
    echo.
    echo 2. Start the services:
    echo    docker-compose -f docker-compose.local-ssl.yml up -d
    echo.
    echo 3. Access your applications:
    echo    - Frontend: https://taant.in
    echo    - Admin: https://admin.taant.in
    echo    - Supplier: https://supplier.taant.in
    echo    - Backend: https://backend.taant.in
    echo    - Traefik Dashboard: http://localhost:8080
) else (
    echo 1. Install OpenSSL first: https://slproweb.com/products/Win32OpenSSL.html
    echo 2. Run this script again after installing OpenSSL
    echo 3. OR use Git Bash to run: scripts/generate-local-ca.bat
    echo 4. Then follow the certificate installation steps
)

echo.
echo For cleanup, run: scripts\teardown-traefik-ssl.bat
echo.
pause