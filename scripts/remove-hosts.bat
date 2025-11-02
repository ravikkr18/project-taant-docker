@echo off
echo Removing local domains for Taant project...
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo This script requires Administrator privileges.
    echo Please run as Administrator and try again.
    pause
    exit /b 1
)

echo Removing Taant domains from hosts file...
echo.

REM Create a temporary file without Taant entries
findstr /v /c:"taant.in" %windir%\System32\drivers\etc\hosts > %temp%\hosts.tmp

REM Replace the original hosts file
copy %temp%\hosts.tmp %windir%\System32\drivers\etc\hosts
del %temp%\hosts.tmp

echo.
echo Taant domains removed from hosts file successfully!
echo.
echo If you created a backup, it's still available at:
echo   %windir%\System32\drivers\etc\hosts.backup.taant
echo.
pause