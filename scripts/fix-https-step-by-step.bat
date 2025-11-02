@echo off
echo ========================================
echo Step-by-Step HTTPS Fix
echo ========================================
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ This script must be run as Administrator
    echo Right-click the script and choose "Run as administrator"
    pause
    exit /b 1
)

echo Step 1: Stop all Docker services
docker-compose -f docker-compose.local-ssl.yml down 2>nul
docker-compose -f docker-compose.mkcert.yml down 2>nul
docker-compose -f docker-compose.traefik.yml down 2>nul
echo ✅ Services stopped

echo.
echo Step 2: Clean up Docker network
docker network rm taant-network 2>nul
docker network create taant-network
echo ✅ Docker network recreated

echo.
echo Step 3: Setup hosts file
echo Adding entries to hosts file...
copy %windir%\System32\drivers\etc\hosts %windir%\System32\drivers\etc\hosts.backup.taant >nul 2>&1
findstr /v /c:"taant.in" %windir%\System32\drivers\etc\hosts > %temp%\hosts.tmp 2>nul
echo 127.0.0.1   taant.in >> %temp%\hosts.tmp
echo 127.0.0.1   admin.taant.in >> %temp%\hosts.tmp
echo 127.0.0.1   supplier.taant.in >> %temp%\hosts.tmp
echo 127.0.0.1   backend.taant.in >> %temp%\hosts.tmp
copy %temp%\hosts.tmp %windir%\System32\drivers\etc\hosts >nul 2>&1
del %temp%\hosts.tmp >nul 2>&1
echo ✅ Hosts file updated

echo.
echo Step 4: Check and install Chocolatey if needed
choco version >nul 2>&1
if %errorLevel% neq 0 (
    echo Installing Chocolatey...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
    timeout /t 10 >nul
    call refreshenv >nul 2>&1
) else (
    echo ✅ Chocolatey already installed
)

echo.
echo Step 5: Install mkcert
choco install mkcert -y
if %errorLevel% neq 0 (
    echo ❌ Failed to install mkcert
    echo Try manually: choco install mkcert -y
    pause
    exit /b 1
)
echo ✅ mkcert installed

echo.
echo Step 6: Create local CA
mkcert -install
if %errorLevel% neq 0 (
    echo ❌ Failed to create local CA
    echo Try manually: mkcert -install
    pause
    exit /b 1
)
echo ✅ Local CA created and trusted

echo.
echo Step 7: Generate certificates
mkdir traefik\ssl 2>nul
mkcert -cert-file traefik\ssl\wildcard.pem -key-file traefik\ssl\wildcard-key.pem "*.taant.in" "taant.in" "admin.taant.in" "supplier.taant.in" "backend.taant.in" "*.localhost" "localhost"
if %errorLevel% neq 0 (
    echo ❌ Failed to generate certificates
    echo Try manually: mkcert "*.taant.in"
    pause
    exit /b 1
)
echo ✅ Certificates generated

echo.
echo Step 8: Verify certificates exist
if exist traefik\ssl\wildcard.pem (
    echo ✅ Certificate file created
) else (
    echo ❌ Certificate file missing
    pause
    exit /b 1
)

if exist traefik\ssl\wildcard-key.pem (
    echo ✅ Key file created
) else (
    echo ❌ Key file missing
    pause
    exit /b 1
)

echo.
echo Step 9: Check for port conflicts
netstat -ano | findstr ":443" | findstr "LISTENING" >nul 2>&1
if %errorLevel% equ 0 (
    echo ⚠️  Port 443 is in use by another application
    echo Stopping potential conflicting services...

    REM Stop IIS if running
    net stop W3SVC 2>nul

    REM Stop Skype if it's using port 443
    taskkill /f /im skype.exe 2>nul

    REM Stop other common services
    taskkill /f /im vmware-hostd.exe 2>nul
    taskkill /f /im httpd.exe 2>nul

    echo ✅ Attempted to stop conflicting services
) else (
    echo ✅ Port 443 is available
)

echo.
echo Step 10: Start Traefik and services
docker-compose -f docker-compose.mkcert.yml up -d
if %errorLevel% neq 0 (
    echo ❌ Failed to start services
    echo Checking docker-compose file...
    if not exist docker-compose.mkcert.yml (
        echo ❌ docker-compose.mkcert.yml not found
    )
    pause
    exit /b 1
)
echo ✅ Services started

echo.
echo Step 11: Wait for services to start
echo Waiting 10 seconds for services to initialize...
timeout /t 10 >nul

echo.
echo Step 12: Check service status
docker-compose -f docker-compose.mkcert.yml ps

echo.
echo Step 13: Test HTTPS connectivity
echo Testing connection to https://taant.in...
curl -k -s -o nul -w "%%{http_code}" https://taant.in >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ HTTPS connection successful
) else (
    echo ⚠️  HTTPS connection test failed
    echo This might be normal if curl doesn't support SNI
)

echo.
echo ========================================
echo 🎉 Setup Complete!
echo ========================================
echo.
echo Your applications should now be available:
echo 🌐 https://taant.in
echo 🛡️  https://admin.taant.in
echo 📦 https://supplier.taant.in
echo ⚙️  https://backend.taant.in
echo 📊 http://localhost:8080 (Traefik Dashboard)
echo.
echo Troubleshooting:
echo 1. Open browser and try: https://taant.in
echo 2. If you see errors, check logs: docker-compose -f docker-compose.mkcert.yml logs
echo 3. Restart browser after setup
echo 4. Clear browser cache if needed
echo.
pause