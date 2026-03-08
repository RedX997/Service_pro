@echo off
echo ========================================
echo Fixing Prisma Client
echo ========================================
echo.

cd server

echo Step 1: Deleting old Prisma client...
if exist "node_modules\.prisma" (
    rmdir /s /q "node_modules\.prisma"
    echo Deleted old client.
)

if exist "node_modules\@prisma\client" (
    rmdir /s /q "node_modules\@prisma\client"
    echo Deleted old @prisma/client.
)

echo.
echo Step 2: Generating new Prisma client...
call npx prisma generate

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to generate Prisma client!
    pause
    exit /b 1
)

echo.
echo Step 3: Running migrations...
call npx prisma migrate dev --name init

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Migration failed!
    echo Check your DATABASE_URL in server\.env
    pause
    exit /b 1
)

echo.
echo ========================================
echo Prisma Fixed!
echo ========================================
echo.
echo Now you can start the servers:
echo 1. Double-click: start-backend.bat
echo 2. Double-click: start-frontend.bat
echo.
pause
