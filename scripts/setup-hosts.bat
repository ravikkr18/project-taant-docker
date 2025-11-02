@echo off
echo Setting up local domains for Taant project...
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo This script requires Administrator privileges.
    echo Please run as Administrator and try again.
    pause
    exit /b 1
)

echo Adding Taant domains to hosts file...
echo.

REM Backup the original hosts file
copy %windir%\System32\drivers\etc\hosts %windir%\System32\drivers\etc\hosts.backup.taant

REM Add entries to hosts file
echo 127.0.0.1   taant.in >> %windir%\System32\drivers\etc\hosts
echo 127.0.0.1   admin.taant.in >> %windir%\System32\drivers\etc\hosts
echo 127.0.0.1   supplier.taant.in >> %windir%\System32\drivers\etc\hosts
echo 127.0.0.1   backend.taant.in >> %windir%\System32\drivers\etc\hosts
echo ::1         taant.in >> %windir%\System32\drivers\etc\hosts
echo ::1         admin.taant.in >> %windir%\System32\drivers\etc\hosts
echo ::1         supplier.taant.in >> %windir%\System32\drivers\etc\hosts
echo ::1         backend.taant.in >> %windir%\System32\drivers\etc\hosts

echo.
echo Hosts file updated successfully!
echo.
echo The following domains now point to localhost:
echo   - taant.in (frontend)
echo   - admin.taant.in (admin panel)
echo   - supplier.taant.in (supplier panel)
echo   - backend.taant.in (backend API)
echo.
echo A backup of your original hosts file has been created as:
echo   %windir%\System32\drivers\etc\hosts.backup.taant
echo.
pause