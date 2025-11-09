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

echo [INFO] Iniciando entorno de desarrollo completo...
echo [INFO] Este script abrira 3 ventanas:
echo        1. Backend (Puerto 3001)
echo        2. Frontend Ionic (Puerto 8100)
echo        3. Watcher de libreria compartida
echo.

pause

echo [STEP 1/3] Iniciando Backend...
start "Backend App-Alquiler" cmd /k "cd /d c:\Aure\desarrollos\javascript\workspace-aure\backend\app-alquiler && echo Iniciando Backend en puerto 3001... && deno run --allow-all src/main.ts"

timeout /t 3 /nobreak >nul

echo [STEP 2/3] Iniciando Frontend con Ionic...
start "Frontend Ionic App-Alquiler" cmd /k "cd /d c:\Aure\desarrollos\javascript\workspace-aure\frontend\app-alquiler && echo Iniciando Frontend Ionic en puerto 8100... && ionic serve --port=8100 --host=0.0.0.0"

timeout /t 3 /nobreak >nul

echo [STEP 3/3] Iniciando Watcher de Libreria Compartida...
start "Shared Library Watcher" cmd /k "cd /d c:\Aure\desarrollos\javascript\workspace-aure\frontend && echo Iniciando watcher de libreria compartida... && call watch-shared-lib-ionic.bat"

echo.
echo ✅ Entorno de desarrollo iniciado exitosamente!
echo.
echo 🌐 URLs disponibles:
echo    Backend API:     http://localhost:3001
echo    Frontend Ionic:  http://localhost:8100
echo.
echo 📝 Ventanas abiertas:
echo    - Backend: Servidor Deno en puerto 3001
echo    - Frontend: Servidor Ionic en puerto 8100  
echo    - Watcher: Monitoreo de cambios en libreria
echo.
echo 💡 Consejos:
echo    - Los cambios en el frontend se reflejan automaticamente
echo    - Los cambios en la libreria compartida triggerearan rebuild
echo    - El backend se reinicia automaticamente con cambios
echo.
echo ⏹️  Para detener todo: Cierra las 3 ventanas que se abrieron
echo.
pause