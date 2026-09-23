@echo off
title Nexus Agent v3 - Installer
echo.
echo =====================================================
echo   NEXUS AGENT v3 - Windows x64
echo   Autonomous AI Software Engineering Platform
echo =====================================================
echo.
set "DEST=%LOCALAPPDATA%\NexusAgent"
echo Installing to: %DEST%
if not exist "%DEST%" mkdir "%DEST%"
xcopy /E /I /Y "%~dp0win-unpacked\*" "%DEST%\" >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo ERROR: Copy failed. Try right-click Run As Administrator.
  pause & exit /b 1
)
powershell -Command "$ws=New-Object -ComObject WScript.Shell;$s=$ws.CreateShortcut('%USERPROFILE%\Desktop\Nexus Agent.lnk');$s.TargetPath='%DEST%\Nexus Agent.exe';$s.WorkingDirectory='%DEST%';$s.Save()" 2>nul
echo.
echo Done! Desktop shortcut created.
echo.
echo FIRST RUN: Settings > Providers > add API key > Save
echo LOCAL AI:  Settings > Local/Ollama > Full Ollama Setup
echo.
start "" "%DEST%\Nexus Agent.exe"
exit /b 0
