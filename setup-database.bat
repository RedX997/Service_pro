@echo off
echo ========================================
echo ServicePro MySQL Setup
echo ========================================
echo.

echo NOTE: If you get 'mysql is not recognized' error,
echo please use setup-database-simple.bat instead
echo.
pause

echo Step 1: Creating database 'servicepro'...
mysql -u root -ppassword12345 -e "CREATE DATABASE IF NOT EXISTS servicepro;"
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Cannot run mysql command!
    echo.
    echo Please use one of these methods instead:
    echo 1. Double-click: setup-database-simple.bat
    echo 2. Open MySQL Workbench and run: CREATE DATABASE servicepro;
    echo.
    pause
    exit /b 1
)

echo Database created successfully!

echo.
echo Step 2: Deleting old migrations (if any)...
if exist "server\prisma\migrations" (
    rmdir /s /q "server\prisma\migrations"
    echo Old migrations deleted.
)

echo.
echo Step 3: Running Prisma migrations...
cd server
call npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo ERROR: Migration failed!
    echo Please check your DATABASE_URL in server/.env
    pause
    exit /b 1
)

echo.
echo Step 4: Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERROR: Prisma generate failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start backend:  Double-click start-backend.bat
echo 2. Start frontend: Double-click start-frontend.bat
echo 3. Open browser:   http://localhost:8080
echo.
pause
