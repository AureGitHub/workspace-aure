# Script para conectar a PostgreSQL remoto y crear tabla de usuarios
# Configuración de conexión remota

# Parámetros de conexión (modifica estos valores con los de tu servidor)
$DB_HOST = "IP_DE_TU_SERVIDOR"          # Ejemplo: "192.168.1.100" o "servidor.ejemplo.com"
$DB_PORT = "5432"                       # Puerto por defecto de PostgreSQL
$DB_NAME = "app_alquiler_db"            # Nombre de la base de datos
$DB_USER = "postgres"                   # Usuario de PostgreSQL
$DB_PASSWORD = "tu_password"            # Contraseña del usuario

# Mostrar información de conexión
Write-Host "=== CONFIGURACIÓN DE CONEXIÓN POSTGRESQL ===" -ForegroundColor Green
Write-Host "Host: $DB_HOST"
Write-Host "Puerto: $DB_PORT"
Write-Host "Base de datos: $DB_NAME"
Write-Host "Usuario: $DB_USER"
Write-Host ""

# Comando para conectar manualmente (copia y pega en tu terminal)
Write-Host "=== COMANDO PARA CONECTAR MANUALMENTE ===" -ForegroundColor Yellow
Write-Host "psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres"
Write-Host ""

# Comando para crear la base de datos
Write-Host "=== CREAR BASE DE DATOS ===" -ForegroundColor Yellow
Write-Host "psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c `"CREATE DATABASE $DB_NAME;`""
Write-Host ""

# Comando para ejecutar el script de creación de tabla
Write-Host "=== EJECUTAR SCRIPT DE USUARIOS ===" -ForegroundColor Yellow
$scriptPath = "C:\Aure\desarrollos\javascript\workspace-aure\backend\users-table-setup.sql"
Write-Host "psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f `"$scriptPath`""
Write-Host ""

# Comando todo en uno
Write-Host "=== COMANDO TODO EN UNO ===" -ForegroundColor Cyan
Write-Host "psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c `"CREATE DATABASE $DB_NAME;`" && psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f `"$scriptPath`""
Write-Host ""

Write-Host "=== INSTRUCCIONES ===" -ForegroundColor Magenta
Write-Host "1. Modifica las variables al inicio de este script con los datos de tu servidor"
Write-Host "2. Asegúrate de que PostgreSQL esté instalado localmente (cliente psql)"
Write-Host "3. Verifica que tu servidor PostgreSQL permita conexiones remotas"
Write-Host "4. Ejecuta los comandos mostrados arriba"
Write-Host ""

# Verificar si psql está disponible
try {
    $psqlVersion = psql --version 2>$null
    Write-Host "✅ psql está disponible: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ psql no está disponible. Necesitas instalar PostgreSQL client." -ForegroundColor Red
    Write-Host "   Descarga desde: https://www.postgresql.org/download/windows/"
}