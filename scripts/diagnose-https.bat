@echo off
echo ========================================
echo Diagnosing HTTPS Setup Issues
echo ========================================
echo.

echo Step 1: Checking if running as Administrator...
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Not running as Administrator
    echo Please run this script as Administrator
    echo.
    goto :continue
) else (
    echo ✅ Running as Administrator
)

:continue
echo.

echo Step 2: Checking mkcert installation...
mkcert -version >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ mkcert not found or not in PATH
    echo.
    echo Please install mkcert first:
    echo choco install mkcert -y
    echo.
    goto :skip_mkcert
) else (
    echo ✅ mkcert is installed
    mkcert -version
)

echo.
echo Step 3: Checking if local CA exists...
mkcert -CAROOT >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Local CA not found
    echo Run: mkcert -install
    goto :skip_mkcert
) else (
    echo ✅ Local CA exists
    echo CA Root:
    mkcert -CAROOT
)

echo.
echo Step 4: Checking certificate files...
if exist traefik\ssl\wildcard.pem (
    echo ✅ Certificate file exists: traefik\ssl\wildcard.pem
    certutil -f -dump traefik\ssl\wildcard.pem | findstr "Issuer\|Subject\|Not After\|Not Before"
) else (
    echo ❌ Certificate file missing: traefik\ssl\wildcard.pem
)

if exist traefik\ssl\wildcard-key.pem (
    echo ✅ Key file exists: traefik\ssl\wildcard-key.pem
) else (
    echo ❌ Key file missing: traefik\ssl\wildcard-key.pem
)

:skip_mkcert
echo.
echo Step 5: Checking hosts file entries...
findstr "taant.in" %windir%\System32\drivers\etc\hosts
if %errorLevel% neq 0 (
    echo ❌ No taant.in entries found in hosts file
    echo Please run: scripts\setup-hosts.bat
) else (
    echo ✅ Hosts file entries found
)

echo.
echo Step 6: Checking Docker network...
docker network inspect taant-network >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Docker network 'taant-network' not found
    echo Run: docker network create taant-network
) else (
    echo ✅ Docker network exists
)

echo.
echo Step 7: Checking if ports are available...
netstat -ano | findstr ":443" | findstr "LISTENING"
if %errorLevel% equ 0 (
    echo ⚠️  Port 443 is already in use:
    netstat -ano | findstr ":443" | findstr "LISTENING"
    echo.
    echo You may need to stop the service using this port:
    tasklist | findstr "PID"
    echo Then run: taskkill /PID [PID] /F
) else (
    echo ✅ Port 443 is available
)

echo.
echo Step 8: Testing domain resolution...
ping -n 1 taant.in >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ taant.in resolves to localhost
) else (
    echo ❌ taant.in does not resolve to localhost
)

echo.
echo Step 9: Checking Docker containers...
cd /d "%~dp0\.."
if exist docker-compose.mkcert.yml (
    docker-compose -f docker-compose.mkcert.yml ps
) else (
    echo ❌ docker-compose.mkcert.yml not found in current directory
    echo Current directory: %CD%
)

echo.
echo ========================================
echo Diagnosis Complete!
echo ========================================
echo.
echo Based on the results above, here's what to do next:
echo.

REM Check for common issues and provide solutions
if not exist traefik\ssl\wildcard.pem (
    echo 📝 CERTIFICATES MISSING:
    echo    Run: scripts\install-mkcert.bat
    echo.
)

findstr "taant.in" %windir%\System32\drivers\etc\hosts >nul 2>&1
if %errorLevel% neq 0 (
    echo 📝 HOSTS FILE MISSING ENTRIES:
    echo    Run: scripts\setup-hosts.bat
    echo.
)

netstat -ano | findstr ":443" | findstr "LISTENING" >nul 2>&1
if %errorLevel% equ 0 (
    echo 📝 PORT 443 CONFLICT:
    echo    Stop the service using port 443 or use different ports
    echo.
)

docker network inspect taant-network >nul 2>&1
if %errorLevel% neq 0 (
    echo 📝 DOCKER NETWORK MISSING:
    echo    Run: docker network create taant-network
    echo.
)

echo If all checks pass, try starting services:
echo    docker-compose -f docker-compose.mkcert.yml up -d
echo.
echo Then check logs:
echo    docker-compose -f docker-compose.mkcert.yml logs
echo.
pause