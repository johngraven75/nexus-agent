@echo off
title Nexus Agent — Build Script
echo.
echo =====================================================
echo   NEXUS AGENT — Windows Build
echo =====================================================
echo.

:: Check Node.js
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo ERROR: Node.js not found. Install from https://nodejs.org
  pause & exit /b 1
)

:: Check npm
npm --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo ERROR: npm not found.
  pause & exit /b 1
)

echo Installing dependencies...
call npm ci
if %ERRORLEVEL% neq 0 (echo npm ci failed & pause & exit /b 1)

echo.
echo Building Windows app...
set CSC_IDENTITY_AUTO_DISCOVERY=false
call npm run build
if %ERRORLEVEL% neq 0 (echo Build failed & pause & exit /b 1)

echo.
echo =====================================================
echo   Build complete! Check the dist/ folder.
echo =====================================================
dir dist\*.zip 2>nul
dir dist\*.exe 2>nul
echo.
pause
