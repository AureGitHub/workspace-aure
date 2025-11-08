# Script para desarrollo con auto-rebuild de la librería compartida
# Autor: Workspace Aure
# Fecha: 2025-11-08

Write-Host "🚀 === CONFIGURACIÓN DE DESARROLLO AUTO-REBUILD ===" -ForegroundColor Cyan
Write-Host ""

# Configuración de rutas
$WORKSPACE_ROOT = "c:\Aure\desarrollos\javascript\workspace-aure\frontend"
$SHARED_LIB_PATH = "$WORKSPACE_ROOT\shared-lib"
$APP_ALQUILER_PATH = "$WORKSPACE_ROOT\app-alquiler"

Write-Host "📁 Rutas configuradas:" -ForegroundColor Yellow
Write-Host "   Librería compartida: $SHARED_LIB_PATH" -ForegroundColor White
Write-Host "   App Alquiler: $APP_ALQUILER_PATH" -ForegroundColor White
Write-Host ""

# Función para rebuild de la librería
function Rebuild-SharedLib {
    Write-Host "🔄 Rebuilding shared library..." -ForegroundColor Blue
    
    Set-Location $SHARED_LIB_PATH
    $buildResult = ng build 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Librería compilada exitosamente" -ForegroundColor Green
        
        # Instalar la librería actualizada en app-alquiler
        Write-Host "📦 Instalando librería actualizada..." -ForegroundColor Blue
        Set-Location $APP_ALQUILER_PATH
        npm install ../shared-lib/dist/shared-lib --silent
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Librería instalada en app-alquiler" -ForegroundColor Green
            Write-Host "🔄 La aplicación se recargará automáticamente..." -ForegroundColor Cyan
        } else {
            Write-Host "❌ Error instalando la librería" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Error compilando la librería:" -ForegroundColor Red
        Write-Host $buildResult -ForegroundColor Red
    }
    
    Write-Host "────────────────────────────────────────" -ForegroundColor Gray
}

# Configurar el watcher de archivos
Write-Host "👀 Configurando watcher para cambios en la librería..." -ForegroundColor Yellow

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = "$SHARED_LIB_PATH\src"
$watcher.Filter = "*.ts"
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

# Crear un timer para evitar múltiples rebuilds
$timer = New-Object System.Timers.Timer
$timer.Interval = 2000  # 2 segundos de delay
$timer.AutoReset = $false

# Evento cuando se detectan cambios
$action = {
    $timer.Stop()
    $timer.Start()
}

# Evento del timer para hacer el rebuild
$timerAction = {
    Rebuild-SharedLib
}

# Registrar eventos
Register-ObjectEvent -InputObject $watcher -EventName "Changed" -Action $action
Register-ObjectEvent -InputObject $watcher -EventName "Created" -Action $action
Register-ObjectEvent -InputObject $watcher -EventName "Deleted" -Action $action
Register-ObjectEvent -InputObject $timer -EventName "Elapsed" -Action $timerAction

Write-Host "✅ Watcher configurado exitosamente" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 === INSTRUCCIONES DE USO ===" -ForegroundColor Cyan
Write-Host "1. ✅ Esta ventana monitoreará cambios en la librería compartida" -ForegroundColor White
Write-Host "2. 🔄 Cuando detecte cambios, rebuildeará automáticamente" -ForegroundColor White
Write-Host "3. 📱 La aplicación en http://localhost:4200 se recargará sola" -ForegroundColor White
Write-Host "4. ⏹️  Presiona Ctrl+C para detener el monitoring" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Aplicación disponible en: http://localhost:4200" -ForegroundColor Green
Write-Host "👨‍💻 ¡Feliz desarrollo!" -ForegroundColor Magenta
Write-Host ""

# Hacer un rebuild inicial
Write-Host "🚀 Haciendo rebuild inicial..." -ForegroundColor Cyan
Rebuild-SharedLib

Write-Host "⏳ Monitoring activo... (Presiona Ctrl+C para salir)" -ForegroundColor Yellow

# Mantener el script ejecutándose
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    # Cleanup
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    $timer.Dispose()
    Write-Host "🛑 Monitoring detenido" -ForegroundColor Red
}