@echo off
echo ========================================
echo Final Supabase Setup
echo ========================================
echo.

echo IMPORTANT: Update your password in server\.env
echo Replace [YOUR-PASSWORD] with your actual Supabase password
echo.
pause

cd server

echo Step 1: Cleaning up...
if exist "node_modules\.prisma" rmdir /s /q "node_modules\.prisma"
if exist "node_modules\@prisma\client" rmdir /s /q "node_modules\@prisma\client"
if exist "prisma\migrations" rmdir /s /q "prisma\migrations"

echo.
echo Step 2: Generating Prisma client...
call npx prisma generate

echo.
echo Step 3: Pushing schema to database...
call npx prisma db push

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to push schema!
    echo Check your DATABASE_URL in server\.env
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Tables created in Supabase!
echo.
echo Next steps:
echo 1. Double-click: start-backend.bat
echo 2. Double-click: start-frontend.bat
echo 3. Open: http://localhost:8080
echo.
pause
