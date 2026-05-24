@echo off
setlocal

:: ==============================================================================
:: Olympiad App - Production Packager (Windows PowerShell Wrapper)
:: ==============================================================================
:: Creates a ZIP archive with source code for deployment, skipping heavy folders

:: Get current date in format YYYYMMDD_HHMM
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set ARCHIVE_NAME=diplom-prod-%datetime:~0,8%_%datetime:~8,4%.zip

echo Deleting old archives (if any)...
del diplom-prod-*.zip 2>nul

echo Creating archive %ARCHIVE_NAME%...
echo Please wait (this may take a few seconds)...

:: We use PowerShell to create the zip archive via Compress-Archive
:: Since PowerShell 5.1 Compress-Archive does not support complex -Exclude patterns natively,
:: we will first copy the required files to a temporary directory.

set TEMP_DIR=%TEMP%\diplom_pack_%RANDOM%
mkdir "%TEMP_DIR%"

:: Copying folders (add or remove as needed)
echo Copying app...
xcopy "app" "%TEMP_DIR%\app\" /E /I /Q /Y >nul
echo Copying components...
xcopy "components" "%TEMP_DIR%\components\" /E /I /Q /Y >nul
echo Copying lib...
xcopy "lib" "%TEMP_DIR%\lib\" /E /I /Q /Y >nul
echo Copying prisma...
xcopy "prisma" "%TEMP_DIR%\prisma\" /E /I /Q /Y >nul
echo Copying public...
xcopy "public" "%TEMP_DIR%\public\" /E /I /Q /Y >nul
echo Copying docs...
xcopy "docs" "%TEMP_DIR%\docs\" /E /I /Q /Y >nul

:: Copying root files
echo Copying configuration files...
copy "package.json" "%TEMP_DIR%\" >nul
copy "package-lock.json" "%TEMP_DIR%\" >nul
copy "next.config.ts" "%TEMP_DIR%\" >nul
copy "tsconfig.json" "%TEMP_DIR%\" >nul
copy "tailwind.config.ts" "%TEMP_DIR%\" 2>nul
copy "postcss.config.mjs" "%TEMP_DIR%\" 2>nul
copy "components.json" "%TEMP_DIR%\" 2>nul
copy "Dockerfile" "%TEMP_DIR%\" >nul
copy "docker-compose.prod.yml" "%TEMP_DIR%\" >nul
copy "setup-prod.sh" "%TEMP_DIR%\" >nul
copy "start-prod.sh" "%TEMP_DIR%\" >nul
copy "start-prod.bat" "%TEMP_DIR%\" >nul
copy ".env.example" "%TEMP_DIR%\" >nul
copy ".dockerignore" "%TEMP_DIR%\" >nul
copy "middleware.ts" "%TEMP_DIR%\" 2>nul
copy "eslint.config.mjs" "%TEMP_DIR%\" 2>nul

echo Compressing files...
:: Archive the folder
powershell -Command "Compress-Archive -Path '%TEMP_DIR%\*' -DestinationPath '%cd%\%ARCHIVE_NAME%' -Force"

:: Delete temporary directory
rmdir /S /Q "%TEMP_DIR%"

echo.
echo ==========================================
echo [OK] Done!
echo Archive created: %ARCHIVE_NAME%
echo Select this file to transfer to your server.
echo ==========================================
pause
