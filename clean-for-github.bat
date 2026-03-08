@echo off
echo ========================================
echo Cleaning Project for GitHub Upload
echo ========================================
echo.

echo This will delete:
echo - node_modules folders
echo - dist/build folders
echo - database files
echo - zip files
echo - log files
echo.
echo These can be recreated after cloning.
echo.
pause

echo.
echo Deleting node_modules...
if exist "node_modules" (
    rmdir /s /q "node_modules"
    echo ✓ Deleted root node_modules
)
if exist "server\node_modules" (
    rmdir /s /q "server\node_modules"
    echo ✓ Deleted server node_modules
)

echo.
echo Deleting build folders...
if exist "dist" (
    rmdir /s /q "dist"
    echo ✓ Deleted dist folder
)
if exist "server\dist" (
    rmdir /s /q "server\dist"
    echo ✓ Deleted server dist folder
)

echo.
echo Deleting database files...
if exist "server\dev.db" (
    del "server\dev.db"
    echo ✓ Deleted dev.db
)
if exist "server\prisma\dev.db" (
    del "server\prisma\dev.db"
    echo ✓ Deleted prisma dev.db
)

echo.
echo Deleting zip files...
if exist "servicepro-build.zip" (
    del "servicepro-build.zip"
    echo ✓ Deleted servicepro-build.zip
)

echo.
echo Deleting log files...
del /s /q *.log 2>nul

echo.
echo Deleting Prisma migrations...
if exist "server\prisma\migrations" (
    rmdir /s /q "server\prisma\migrations"
    echo ✓ Deleted migrations folder
)

echo.
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo Your project is now ready for GitHub!
echo.
echo Estimated size: ~5-10 MB (was ~500 MB)
echo.
echo Next steps:
echo 1. git init
echo 2. git add .
echo 3. git commit -m "Initial commit"
echo 4. git remote add origin YOUR-REPO-URL
echo 5. git push -u origin main
echo.
echo See GITHUB-UPLOAD-GUIDE.md for detailed instructions.
echo.
pause
