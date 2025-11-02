@echo off
echo ========================================
echo Setting up Taant HTTPS with mkcert
echo (Laravel Herd style setup)
echo ========================================
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo This script requires Administrator privileges.
    echo Please run as Administrator and try again.
    pause
    exit /b 1
)

echo Step 1: Setting up local domains...
call scripts\setup-hosts.bat

echo.
echo Step 2: Installing mkcert and generating certificates...
call scripts\install-mkcert.bat

echo.
echo Step 3: Creating Docker network...
docker network create taant-network 2>nul

echo.
echo Step 4: Starting services with HTTPS...
docker-compose -f docker-compose.mkcert.yml up -d

echo.
echo ========================================
echo 🎉 Setup Complete!
echo ========================================
echo.
echo Your applications are now available with trusted HTTPS:
echo.
echo 🌐 Frontend:      https://taant.in
echo 🛡️  Admin Panel:  https://admin.taant.in
echo 📦 Supplier:      https://supplier.taant.in
echo ⚙️  Backend API:  https://backend.taant.in
echo 📊 Traefik:       http://localhost:8080
echo.
echo ✅ No SSL warnings in browser!
echo ✅ Certificates are automatically trusted!
echo ✅ Just like Laravel Herd!
echo.
echo To stop services: docker-compose -f docker-compose.mkcert.yml down
echo To restart: docker-compose -f docker-compose.mkcert.yml restart
echo.
pause