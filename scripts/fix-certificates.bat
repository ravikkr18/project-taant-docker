@echo off
echo ========================================
echo Fixing Certificate Issues
echo ========================================
echo.

REM Navigate to project root
cd /d "%~dp0\.."

echo Current directory: %CD%
echo.

echo Step 1: Verifying mkcert installation...
mkcert -version >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ mkcert not found
    echo Installing mkcert...
    choco install mkcert -y
    if %errorLevel% neq 0 (
        echo ❌ Failed to install mkcert
        echo Please run: choco install mkcert -y
        pause
        exit /b 1
    )
)

echo ✅ mkcert is available
mkcert -version
echo.

echo Step 2: Verifying local CA...
mkcert -CAROOT >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Local CA not found
    echo Creating local CA...
    mkcert -install
    if %errorLevel% neq 0 (
        echo ❌ Failed to create local CA
        pause
        exit /b 1
    )
)

echo ✅ Local CA exists
echo CA location:
mkcert -CAROOT
echo.

echo Step 3: Creating SSL directory...
if not exist traefik\ssl mkdir traefik\ssl
echo ✅ SSL directory ready

echo.
echo Step 4: Generating certificates...
mkcert -cert-file traefik\ssl\wildcard.pem -key-file traefik\ssl\wildcard-key.pem "*.taant.in" "taant.in" "admin.taant.in" "supplier.taant.in" "backend.taant.in" "*.localhost" "localhost"

if %errorLevel% neq 0 (
    echo ❌ Failed to generate certificates
    echo.
    echo Trying alternative command...
    mkcert "*.taant.in"
    if %errorLevel% neq 0 (
        echo ❌ Still failed. Please check mkcert installation.
        pause
        exit /b 1
    )
)

echo.
echo Step 5: Verifying certificate files...
if exist traefik\ssl\wildcard.pem (
    echo ✅ Certificate file exists: traefik\ssl\wildcard.pem
) else (
    echo ❌ Certificate file missing
)

if exist traefik\ssl\wildcard-key.pem (
    echo ✅ Key file exists: traefik\ssl\wildcard-key.pem
) else (
    echo ❌ Key file missing
)

echo.
echo Step 6: Checking certificate details...
if exist traefik\ssl\wildcard.pem (
    echo Certificate info:
    openssl x509 -in traefik\ssl\wildcard.pem -text -noout | findstr /C:"Subject:" /C:"Issuer:" /C:"Not After:"
)

echo.
echo ========================================
echo 🎉 Certificate Setup Complete!
echo ========================================
echo.
echo Now starting services...
docker-compose -f docker-compose.mkcert.yml up -d

if %errorLevel% neq 0 (
    echo ❌ Failed to start services
    echo Check if docker-compose.mkcert.yml exists
    pause
    exit /b 1
)

echo.
echo Waiting 10 seconds for services to start...
timeout /t 10 >nul

echo.
echo Service status:
docker-compose -f docker-compose.mkcert.yml ps

echo.
echo Your applications should now be available:
echo 🌐 https://taant.in
echo 🛡️  https://admin.taant.in
echo 📦 https://supplier.taant.in
echo ⚙️  https://backend.taant.in
echo 📊 http://localhost:8080 (Traefik Dashboard)
echo.
echo If you still see certificate errors:
echo 1. Restart your browser
echo 2. Clear browser cache (Ctrl+F5)
echo 3. Try a different browser
echo.
pause