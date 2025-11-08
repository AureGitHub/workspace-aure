@echo off
title Shared Library Watcher para Ionic
color 0B
cls

echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║        WATCHER DE LIBRERIA COMPARTIDA (IONIC)         ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

echo [INFO] Monitoreando cambios en la libreria compartida...
echo [INFO] Cuando detecte cambios, rebuildeara automaticamente
echo [INFO] El frontend Ionic se recargara automaticamente
echo.
echo [INFO] Presiona Ctrl+C para detener el monitoring
echo.

:wait_and_rebuild
echo [%date% %time%] Haciendo rebuild inicial de la libreria...

cd /d "c:\Aure\desarrollos\javascript\workspace-aure\frontend\shared-lib"
echo [BUILD] Compilando libreria compartida...
call ng build >nul 2>&1

if errorlevel 1 (
    echo [ERROR] ❌ Fallo la compilacion de la libreria
    echo [ERROR] Revisa los errores en la libreria compartida
) else (
    echo [BUILD] ✅ Libreria compilada exitosamente
)

cd /d "c:\Aure\desarrollos\javascript\workspace-aure\frontend\app-alquiler"
echo [INSTALL] Instalando libreria actualizada...
call npm install ../shared-lib --force --silent >nul 2>&1

if errorlevel 1 (
    echo [ERROR] ❌ Fallo la instalacion de la libreria
) else (
    echo [INSTALL] ✅ Libreria instalada correctamente
    echo [INFO] 🔄 El frontend Ionic se recargara automaticamente
)

echo.
echo [WAITING] ⏳ Esperando cambios en la libreria... (30 segundos)
echo [INFO] 📁 Monitoring: c:\Aure\desarrollos\javascript\workspace-aure\frontend\shared-lib\src\
echo ────────────────────────────────────────────────────────────────────
echo.

timeout /t 30 /nobreak >nul
goto wait_and_rebuild