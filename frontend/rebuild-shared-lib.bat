@echo off
title Manual Rebuild - Shared Library
color 0E
echo.
echo ==========================================
echo    REBUILD MANUAL DE LIBRERIA COMPARTIDA
echo ==========================================
echo.

cd /d "c:\Aure\desarrollos\javascript\workspace-aure\frontend\shared-lib"
echo Compilando libreria compartida...
call ng build

if errorlevel 1 (
    echo.
    echo ❌ ERROR: Fallo la compilacion de la libreria
    echo Revisa los errores arriba
    echo.
    pause
    exit /b 1
)

echo ✅ Libreria compilada exitosamente
echo.

cd /d "c:\Aure\desarrollos\javascript\workspace-aure\frontend\app-alquiler"
echo Instalando libreria actualizada en app-alquiler...
call npm install ../shared-lib --force

if errorlevel 1 (
    echo.
    echo ❌ ERROR: Fallo la instalacion de la libreria
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ EXITO: Libreria compartida actualizada!
echo.
echo La aplicacion en http://localhost:4200 se recargara automaticamente
echo si el servidor de desarrollo esta ejecutandose.
echo.
pause