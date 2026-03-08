@echo off
echo ========================================
echo   MySQL Connection Test
echo ========================================
echo.

echo Testing MySQL connection...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] MySQL is not installed or not in PATH
    echo.
    echo Please install MySQL from:
    echo https://dev.mysql.com/downloads/installer/
    pause
    exit /b 1
)

echo [OK] MySQL is installed
mysql --version
echo.

echo Testing MySQL server connection...
mysql -u root -p -e "SELECT 'Connection successful!' AS Status;"
if %errorlevel% neq 0 (
    echo [ERROR] Cannot connect to MySQL server
    echo.
    echo Possible issues:
    echo 1. MySQL service is not running
    echo 2. Wrong password
    echo 3. User 'root' doesn't exist
    echo.
    echo Try starting MySQL service:
    echo   net start MySQL80
    pause
    exit /b 1
)

echo [OK] MySQL server is running
echo.

echo Checking if database exists...
mysql -u root -p -e "SHOW DATABASES LIKE 'servicepro';" | findstr servicepro >nul
if %errorlevel% equ 0 (
    echo [OK] Database 'servicepro' exists
    echo.
    echo Checking tables...
    mysql -u root -p servicepro -e "SHOW TABLES;"
) else (
    echo [INFO] Database 'servicepro' does not exist yet
    echo Run setup-database.bat to create it
)

echo.
echo ========================================
echo   Test Complete
echo ========================================
pause
