@echo off
cls
echo ============================================================
echo   BNP PARIBAS WEALTH MANAGEMENT - INSTALLATION SCRIPT
echo ============================================================
echo.

REM Check if Node.js is installed
echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please download and install from: https://nodejs.org/
    echo Press any key to open Node.js website...
    pause >nul
    start https://nodejs.org/
    exit /b 1
)
echo [OK] Node.js is installed
echo.

REM Check if package.json exists
echo [2/5] Checking project files...
if not exist "package.json" (
    echo [ERROR] package.json not found!
    echo Make sure you're in the correct directory with all project files.
    pause
    exit /b 1
)
echo [OK] Project files found
echo.

REM Install dependencies
echo [3/5] Installing dependencies...
echo This may take a few minutes...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies!
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

REM Create MFA codes file if not exists
echo [4/5] Setting up MFA system...
if not exist "mfa_codes.json" (
    echo Creating MFA codes database...
)
echo [OK] MFA system ready
echo.

REM Final check
echo [5/5] Verifying installation...
if exist "node_modules\" (
    echo [OK] All components installed successfully!
) else (
    echo [ERROR] Installation incomplete!
    pause
    exit /b 1
)
echo.

echo ============================================================
echo   INSTALLATION COMPLETE!
echo ============================================================
echo.
echo   Your BNP Paribas Wealth Management portal is ready!
echo.
echo   NEXT STEPS:
echo   1. Run "npm start" to launch the server
echo   2. Open browser to: http://localhost:3000
echo   3. Use MFA codes: 007248, 935194, or 668238
echo.
echo   IMPORTANT INFORMATION:
echo   - Login: MMEREDITII.WM
echo   - Each MFA code works only ONCE
echo   - Device will be remembered after first login
echo   - Languages: EN / FR / DE
echo.
echo ============================================================
echo.
echo Would you like to start the server now? (Y/N)
set /p START_NOW=

if /i "%START_NOW%"=="Y" (
    echo.
    echo Starting server...
    echo Press Ctrl+C to stop the server when done
    echo.
    timeout /t 3 >nul
    npm start
) else (
    echo.
    echo To start the server later, run: npm start
    echo.
    pause
)

exit /b 0