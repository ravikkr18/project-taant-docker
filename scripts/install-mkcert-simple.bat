@echo off
echo Generating mkcert certificates...
echo.

REM Navigate to project root
cd /d "%~dp0\.."

echo Current directory: %CD%
echo.

REM Create SSL directory
if not exist traefik\ssl mkdir traefik\ssl

echo Generating certificates for *.taant.in domains...
mkcert -cert-file traefik\ssl\wildcard.pem -key-file traefik\ssl\wildcard-key.pem "*.taant.in" "taant.in" "admin.taant.in" "supplier.taant.in" "backend.taant.in" "*.localhost" "localhost"

if %errorLevel% neq 0 (
    echo ❌ Failed to generate certificates
    echo.
    echo Make sure mkcert is installed: choco install mkcert -y
    echo Make sure local CA exists: mkcert -install
    pause
    exit /b 1
)

echo.
echo ✅ Certificates generated successfully!
echo.
echo Files created:
echo - traefik\ssl\wildcard.pem
echo - traefik\ssl\wildcard-key.pem
echo.
pause