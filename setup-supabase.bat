@echo off
echo ========================================
echo ServicePro - Supabase Setup
echo ========================================
echo.

echo IMPORTANT: Before running this script
echo ----------------------------------------
echo 1. Go to: https://app.supabase.com
echo 2. Open your project
echo 3. Go to Settings ^> Database
echo 4. Copy the Connection String (URI format)
echo 5. Update server\.env with your connection string
echo.
echo Press any key when you've updated server\.env...
pause >nul

echo.
echo Step 1: Deleting old migrations...
cd server
if exist "prisma\migrations" (
    rmdir /s /q "prisma\migrations"
    echo Old migrations deleted.
)

echo.
echo Step 2: Running Prisma migrations...
echo This will create tables in your Supabase database...
call npx prisma migrate dev --name init
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Migration failed!
    echo.
    echo Please check:
    echo 1. Your internet connection
    echo 2. DATABASE_URL in server\.env is correct
    echo 3. You replaced [YOUR-PASSWORD] with actual password
    echo.
    pause
    exit /b 1
)

echo.
echo Step 3: Generating Prisma client...
call npx prisma generate

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Your database is now in the cloud!
echo.
echo Next steps:
echo 1. Double-click: start-backend.bat
echo 2. Double-click: start-frontend.bat
echo 3. Open browser: http://localhost:8080
echo.
echo View your data at: https://app.supabase.com
echo.
pause
