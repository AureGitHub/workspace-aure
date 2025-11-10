@echo off
title Entorno de Desarrollo Completo - Alquiler ZarZa
color 0A
cls

echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║              ENTORNO DE DESARROLLO ALQUILER ZARZA                ║
echo ║                        Setup Completo                            ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.

echo [INFO] Detectando IPs disponibles...
ipconfig | findstr "IPv4"
echo.
echo [INFO] Seleccionando IP principal del equipo...

rem Priorizar 192.168.1.x que suele ser la red doméstica principal
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4" ^| findstr "192.168.1\."') do (
    for /f "tokens=1" %%b in ("%%a") do (
        set LOCAL_IP=%%b
        goto :found_ip
    )
)
rem Si no hay 192.168.1.x, buscar otras redes comunes pero excluir virtuales conocidas
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        echo %%b | findstr /v "127\.\|192\.168\.142\.\|192\.168\.80\.\|172\.21\.\|169\.254\." >nul
        if not errorlevel 1 (
            set LOCAL_IP=%%b
            goto :found_ip
        )
    )
)
rem Como último recurso, usar localhost
:found_ip
if "%LOCAL_IP%"=="" set LOCAL_IP=localhost
rem Limpiar todos los espacios (inicio, medio, final) y dos puntos en la IP detectada
setlocal enabledelayedexpansion
set IP_CLEAN=%LOCAL_IP%
:clean_spaces
set IP_CLEAN=!IP_CLEAN: =!
if not "!IP_CLEAN!" == "!IP_CLEAN: =!" goto clean_spaces
set IP_CLEAN=!IP_CLEAN::=!
endlocal & set LOCAL_IP=%IP_CLEAN%

@REM set LOCAL_IP=192.168.1.24
echo [INFO] IP forzada manualmente: %LOCAL_IP%
echo [INFO] Iniciando entorno de desarrollo completo...
echo [INFO] Este script abrira 3 ventanas:
echo        1. Backend con Watch (Puerto 3001)
echo        2. Frontend Ionic (Puerto 8100)
echo        3. Watcher de libreria compartida
echo.

pause

echo [STEP 1/3] Iniciando Backend con Watch...
start "Backend App-Alquiler" cmd /k "cd /d c:\Aure\desarrollos\javascript\workspace-aure\backend\app-alquiler && echo Iniciando Backend con Watch en puerto 3001... && set HOST=%LOCAL_IP% && deno run --allow-all --watch src/main.ts"

timeout /t 3 /nobreak >nul

echo [STEP 2/3] Iniciando Frontend con Ionic...
start "Frontend Ionic App-Alquiler" cmd /k "cd /d c:\Aure\desarrollos\javascript\workspace-aure\frontend\app-alquiler && echo Iniciando Frontend Ionic en puerto 8100... && ionic serve --port=8100 --host=%LOCAL_IP%"

timeout /t 3 /nobreak >nul

echo [STEP 3/3] Iniciando Watcher de Libreria Compartida...
start "Shared Library Watcher" cmd /k "cd /d c:\Aure\desarrollos\javascript\workspace-aure\frontend && echo Iniciando watcher de libreria compartida... && call watch-shared-lib-ionic.bat"

echo.
echo ✅ Entorno de desarrollo iniciado exitosamente!
echo.
echo 🌐 URLs disponibles:
echo    Backend API:     http://%LOCAL_IP%:3001
echo    Frontend Ionic:  http://%LOCAL_IP%:8100
echo.
echo 📝 Ventanas abiertas:
echo    - Backend: Servidor Deno con Watch en puerto 3001
echo    - Frontend: Servidor Ionic en puerto 8100  
echo    - Watcher: Monitoreo de cambios en libreria
echo.
echo 💡 Consejos:
echo    - Los cambios en el frontend se reflejan automaticamente
echo    - Los cambios en la libreria compartida triggerearan rebuild
echo    - El backend se reinicia automaticamente con cambios (Watch mode)
echo    - Accesible desde otros dispositivos en la red local
echo.
echo ⏹️  Para detener todo: Cierra las 3 ventanas que se abrieron
echo.
pause