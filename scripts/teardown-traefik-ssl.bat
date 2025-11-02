@echo off
echo ========================================
echo Removing Taant Local HTTPS Setup
echo ========================================
echo.

echo Step 1: Stopping and removing Docker containers...
docker-compose -f docker-compose.local-ssl.yml down 2>nul
docker-compose -f docker-compose.traefik.yml down 2>nul

echo.
echo Step 2: Removing local domains from hosts file...
call scripts\remove-hosts.bat

echo.
echo Step 3: Optional: Remove generated certificates
echo The SSL certificates in traefik\ssl\ can be kept for future use.
echo If you want to remove them, delete the traefik\ssl\ folder manually.
echo.

echo ========================================
echo Teardown completed!
echo ========================================
echo.
pause