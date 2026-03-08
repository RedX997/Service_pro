@echo off
color 0A
echo.
echo ========================================
echo   ServicePro - Quick Start Guide
echo ========================================
echo.
echo STEP 1: Update MySQL Password
echo --------------------------------
echo 1. Open: server\.env
echo 2. Find: DATABASE_URL="mysql://root:password@localhost:3306/servicepro"
echo 3. Replace 'password' with your MySQL password
echo.
pause
echo.
echo STEP 2: Setup Database
echo --------------------------------
echo Running setup script...
call setup-database.bat
echo.
pause
echo.
echo STEP 3: Start Servers
echo --------------------------------
echo.
echo Opening Backend Server...
start "Backend Server" cmd /k "cd server && npm run dev"
timeout /t 5 /nobreak >nul
echo.
echo Opening Frontend Server...
start "Frontend Server" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
echo.
echo ========================================
echo   Servers Starting...
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:8080
echo.
echo Wait 10 seconds, then open your browser to:
echo http://localhost:8080
echo.
echo Press any key to open browser...
pause >nul
start http://localhost:8080
echo.
echo Done! Both servers are running.
echo Close this window when you're done.
pause
