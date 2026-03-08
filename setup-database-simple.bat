@echo off
echo ========================================
echo ServicePro Database Setup (Simple)
echo ========================================
echo.

echo IMPORTANT: Make sure MySQL Workbench or phpMyAdmin is open
echo.
echo Step 1: Create Database Manually
echo ---------------------------------
echo Open MySQL Workbench or phpMyAdmin and run this SQL:
echo.
echo     CREATE DATABASE IF NOT EXISTS servicepro;
echo.
echo Press any key after you've created the database...
pause >nul

echo.
echo Step 2: Running Prisma Migrations...
echo ---------------------------------
cd server

echo Deleting old migrations...
if exist "prisma\migrations" (
    rmdir /s /q "prisma\migrations"
)

echo Running migrations...
call npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Migration failed!
    echo.
    echo Please check:
    echo 1. MySQL is running
    echo 2. Database 'servicepro' exists
    echo 3. Password in server\.env is correct
    echo.
    pause
    exit /b 1
)

echo.
echo Step 3: Generating Prisma Client...
echo ---------------------------------
call npx prisma generate

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Double-click: start-backend.bat
echo 2. Double-click: start-frontend.bat
echo 3. Open browser: http://localhost:8080
echo.
pause
