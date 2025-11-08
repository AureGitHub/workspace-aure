@echo off
title App Alquiler - Servidor Ionic
color 0A
echo.
echo ==========================================
echo    SERVIDOR DE DESARROLLO IONIC APP-ALQUILER
echo ==========================================
echo.
echo Iniciando servidor Ionic en puerto 4200...
echo Aplicacion estara disponible en:
echo http://localhost:4200
echo.
echo Presiona Ctrl+C para detener el servidor
echo ==========================================
echo.
cd /d "c:\Aure\desarrollos\javascript\workspace-aure\frontend\app-alquiler"
ionic serve --host 0.0.0.0 --port 4200
pause