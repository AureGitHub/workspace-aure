# Script de conexión a CloudClusters PostgreSQL
# Configuración específica para tu servidor

$DB_HOST = "postgresql-118326-0.cloudclusters.net"
$DB_PORT = "18718"
$DB_NAME = "workspace-aure"
$DB_USER = "aure"
$DB_PASSWORD = "jas11jas11"

Write-Host "=== CONEXIÓN A CLOUDCLUSTERS POSTGRESQL ===" -ForegroundColor Green
Write-Host "Host: $DB_HOST"
Write-Host "Puerto: $DB_PORT"
Write-Host "Base de datos: $DB_NAME"
Write-Host "Usuario: $DB_USER"
Write-Host "Esquema: app-alquiler"
Write-Host ""

# Verificar si psql está disponible
$psqlAvailable = $false
try {
    $result = & psql --version 2>$null
    if ($result) {
        $psqlAvailable = $true
        Write-Host "✅ Cliente psql disponible" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Cliente psql no disponible" -ForegroundColor Red
    Write-Host "   Necesitas instalar PostgreSQL client desde:" -ForegroundColor Yellow
    Write-Host "   https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== COMANDOS PARA EJECUTAR ===" -ForegroundColor Cyan

if ($psqlAvailable) {
    Write-Host "1. CONECTAR A LA BASE DE DATOS:" -ForegroundColor Yellow
    Write-Host "psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME" -ForegroundColor White
    Write-Host ""
    
    Write-Host "2. EJECUTAR SCRIPT DE CONFIGURACIÓN:" -ForegroundColor Yellow
    $scriptPath = "C:\Aure\desarrollos\javascript\workspace-aure\backend\cloudclusters-setup.sql"
    Write-Host "psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f `"$scriptPath`"" -ForegroundColor White
    Write-Host ""
    
    Write-Host "3. COMANDO TODO EN UNO:" -ForegroundColor Yellow
    Write-Host "PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f `"$scriptPath`"" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "ALTERNATIVA - Usar pgAdmin:" -ForegroundColor Yellow
    Write-Host "1. Instalar pgAdmin: https://www.pgadmin.org/download/" -ForegroundColor White
    Write-Host "2. Crear nueva conexión con estos datos:" -ForegroundColor White
    Write-Host "   - Host: $DB_HOST" -ForegroundColor White
    Write-Host "   - Puerto: $DB_PORT" -ForegroundColor White
    Write-Host "   - Base de datos: $DB_NAME" -ForegroundColor White
    Write-Host "   - Usuario: $DB_USER" -ForegroundColor White
    Write-Host "   - Contraseña: $DB_PASSWORD" -ForegroundColor White
    Write-Host "   - SSL: Require" -ForegroundColor White
    Write-Host "3. Ejecutar el archivo cloudclusters-setup.sql" -ForegroundColor White
    Write-Host ""
}

Write-Host "=== USUARIOS DE PRUEBA QUE SE CREARÁN ===" -ForegroundColor Magenta
Write-Host "admin       | admin@test.com      | admin123"
Write-Host "owner1      | owner@test.com      | owner123"  
Write-Host "tenant1     | tenant@test.com     | tenant123"
Write-Host "usuario_aure| aure@workspace.com  | aure123"
Write-Host ""

Write-Host "=== CONFIGURACIÓN DEL BACKEND ===" -ForegroundColor Green
Write-Host "✅ Archivo .env ya configurado con los datos de CloudClusters"
Write-Host "✅ SSL habilitado para conexión segura"
Write-Host ""

Write-Host "=== PRÓXIMOS PASOS ===" -ForegroundColor Cyan
Write-Host "1. Ejecutar el script SQL para crear las tablas"
Write-Host "2. Reiniciar el backend: npm run start:backend-alquiler"
Write-Host "3. Verificar conexión en: http://localhost:3001/health/db"
Write-Host "4. Probar login con: http://localhost:3001/auth/login"