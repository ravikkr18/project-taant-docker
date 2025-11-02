@echo off
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
    echo For non-admin setup, please manually add the following to your hosts file:
    echo   127.0.0.1   taant.in
    echo   127.0.0.1   admin.taant.in
    echo   127.0.0.1   supplier.taant.in
    echo   127.0.0.1   backend.taant.in
    echo.
    pause
    exit /b 1
)

echo Step 1: Setting up local domains in hosts file...
call scripts\setup-hosts.bat

echo.
echo Step 2: Generating SSL certificates...
call scripts\generate-local-ca.bat

echo.
echo Step 3: Creating Docker network...
docker network create taant-network 2>nul

echo.
echo ========================================
echo Setup completed successfully!
echo ========================================
echo.
echo IMPORTANT: Install the local CA certificate in your system:
echo 1. Open: traefik\ssl\ca.pem
echo 2. Right-click and select "Install Certificate"
echo 3. Choose "Current User" or "Local Machine"
echo 4. Select "Trusted Root Certification Authorities"
echo 5. Complete the installation
echo.
echo After installing the CA certificate:
echo 1. Run: docker-compose -f docker-compose.local-ssl.yml up -d
echo 2. Access your applications:
echo    - Frontend: https://taant.in
echo    - Admin Panel: https://admin.taant.in
echo    - Supplier Panel: https://supplier.taant.in
echo    - Backend API: https://backend.taant.in
echo    - Traefik Dashboard: http://localhost:8080
echo.
echo Note: Use docker-compose.traefik.yml for Let's Encrypt certificates
echo       (requires real domains and internet connectivity)
echo.
pause