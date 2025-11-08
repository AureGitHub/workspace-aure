@echo off
title Detener Entorno de Desarrollo
color 0C
cls

echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║               DETENER ENTORNO DEV                     ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

echo [INFO] Deteniendo todos los procesos de desarrollo...
echo.

echo [STOP] Deteniendo Deno (Puerto 8080)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do (
    echo [KILL] Matando proceso %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo [STOP] Deteniendo Ionic (Puerto 8100)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8100') do (
    echo [KILL] Matando proceso %%a  
    taskkill /f /pid %%a >nul 2>&1
)

echo [STOP] Deteniendo procesos Node.js restantes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im deno.exe >nul 2>&1

echo.
echo [SUCCESS] ✅ Todos los procesos detenidos
echo [INFO] Puedes cerrar las ventanas manualmente si siguen abiertas
echo.

pause