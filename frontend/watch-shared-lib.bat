@echo off
title Shared Library - Auto Rebuild
color 0B
echo.
echo =============================================
echo    SHARED LIBRARY AUTO-REBUILD WATCHER
echo =============================================
echo.
echo Este script rebuildeara la libreria compartida
echo automaticamente cuando detecte cambios.
echo.
echo Presiona Ctrl+C para detener el monitoring
echo =============================================
echo.

:rebuild_lib
cd /d "c:\Aure\desarrollos\javascript\workspace-aure\frontend\shared-lib"
echo [%time%] Rebuilding shared library...
call ng build
if errorlevel 1 (
    echo [ERROR] Failed to build shared library
    timeout /t 5 /nobreak >nul
    goto rebuild_lib
)

cd /d "c:\Aure\desarrollos\javascript\workspace-aure\frontend\app-alquiler"
echo [%time%] Installing updated library in app-alquiler...
call npm install ../shared-lib/dist/shared-lib --silent
if errorlevel 1 (
    echo [ERROR] Failed to install library
)

echo [%time%] ✅ Library updated successfully!
echo [%time%] Waiting for changes...
echo.

timeout /t 10 /nobreak >nul
goto rebuild_lib