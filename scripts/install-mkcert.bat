@echo off
echo Installing mkcert for local HTTPS development...
echo.

REM Check if Chocolatey is installed
choco version >nul 2>&1
if %errorLevel% neq 0 (
    echo Chocolatey not found. Installing Chocolatey first...
    echo.

    REM Check if running as Administrator
    net session >nul 2>&1
    if %errorLevel% neq 0 (
        echo This script requires Administrator privileges to install Chocolatey.
        echo Please run as Administrator and try again.
        pause
        exit /b 1
    )

    REM Install Chocolatey
    powershell -NoProfile -ExecutionPolicy Bypass -Command "[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"

    if %errorLevel% neq 0 (
        echo Failed to install Chocolatey. Please install it manually from https://chocolatey.org/install
        pause
        exit /b 1
    )

    echo Refreshing environment variables...
    call refreshenv
    timeout /t 5 >nul
)

echo Installing mkcert using Chocolatey...
choco install mkcert -y

if %errorLevel% neq 0 (
    echo Failed to install mkcert. Please try manually: choco install mkcert -y
    pause
    exit /b 1
)

echo.
echo Creating local CA...
mkcert -install

if %errorLevel% neq 0 (
    echo Failed to create local CA. Please run: mkcert -install
    pause
    exit /b 1
)

echo.
echo Generating certificates for *.taant.in...
mkdir traefik\ssl 2>nul
mkcert -pkcs12 -p12-file traefik\ssl\wildcard.p12 -cert-file traefik\ssl\wildcard.pem -key-file traefik\ssl\wildcard-key.pem "*.taant.in" "taant.in" "*.localhost" "localhost"

if %errorLevel% neq 0 (
    echo Failed to generate certificates. Please run: mkcert "*.taant.in"
    pause
    exit /b 1
)

echo.
echo ✓ mkcert installed successfully!
echo ✓ Local CA created and trusted by your system
echo ✓ Certificates generated for *.taant.in
echo.
echo Your browser will now trust the HTTPS certificates automatically!
echo.
pause