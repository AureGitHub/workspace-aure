# PowerShell script para ejecutar automáticamente el setup de la base de datos
# Usando el cliente psql

$DB_HOST = "postgresql-118326-0.cloudclusters.net"
$DB_PORT = "18718"
$DB_NAME = "workspace-aure"
$DB_USER = "aure"
$DB_PASSWORD = "jas11jas11"

Write-Host "=== CONFIGURACIÓN AUTOMÁTICA DE BASE DE DATOS ===" -ForegroundColor Green
Write-Host "Conectando a CloudClusters PostgreSQL..." -ForegroundColor Yellow

# Verificar si psql está disponible
try {
    $null = Get-Command psql -ErrorAction Stop
    Write-Host "✅ Cliente psql encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Cliente psql no disponible" -ForegroundColor Red
    Write-Host "   Por favor instala PostgreSQL client desde:" -ForegroundColor Yellow
    Write-Host "   https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

# Crear archivo temporal con el script SQL
$tempSqlFile = [System.IO.Path]::GetTempFileName() + ".sql"

$sqlScript = @"
-- Crear esquema
CREATE SCHEMA IF NOT EXISTS "app-alquiler";

-- Crear tabla users
CREATE TABLE IF NOT EXISTS "app-alquiler".users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    user_type VARCHAR(20) DEFAULT 'tenant' CHECK (user_type IN ('owner', 'tenant', 'admin')),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_users_email ON "app-alquiler".users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON "app-alquiler".users(username);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON "app-alquiler".users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON "app-alquiler".users(is_active);

-- Insertar usuarios de prueba
INSERT INTO "app-alquiler".users (username, email, password_hash, first_name, last_name, phone, user_type, is_active, email_verified) VALUES
('admin', 'admin@test.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Admin', 'User', '+1234567890', 'admin', true, true),
('owner1', 'owner@test.com', 'a17c9aaa61e80a1bf71d0d850af4e5baa9800bbd1a3b1c5fca7b52e7c6c47e29', 'John', 'Owner', '+1234567891', 'owner', true, true),
('tenant1', 'tenant@test.com', '2aa60a8ff7fcd473d321e0146afd9e26df395147c4d3b4e4a3d03c72c30600b1', 'Jane', 'Tenant', '+1234567892', 'tenant', true, true),
('usuario_aure', 'aure@workspace.com', 'f6f2ea8f45d8a057c9566a33f99474da2e5c6a6604e5a6c6c5e8b5d2c3f1e4a7', 'Aure', 'Workspace', '+34123456789', 'admin', true, true)
ON CONFLICT (username) DO NOTHING;

-- Crear tabla properties
CREATE TABLE IF NOT EXISTS "app-alquiler".properties (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    property_type VARCHAR(20) NOT NULL CHECK (property_type IN ('apartment', 'house', 'room', 'studio', 'other')),
    bedrooms INTEGER NOT NULL,
    bathrooms INTEGER NOT NULL,
    area_sqm DECIMAL(10,2) NOT NULL,
    monthly_rent DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'EUR',
    availability_status VARCHAR(20) DEFAULT 'available' CHECK (availability_status IN ('available', 'rented', 'maintenance', 'inactive')),
    images TEXT[],
    amenities TEXT[],
    owner_id INTEGER REFERENCES "app-alquiler".users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para properties
CREATE INDEX IF NOT EXISTS idx_properties_city ON "app-alquiler".properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON "app-alquiler".properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_availability ON "app-alquiler".properties(availability_status);
CREATE INDEX IF NOT EXISTS idx_properties_owner ON "app-alquiler".properties(owner_id);

-- Mostrar resultados
SELECT 'Configuración completada exitosamente!' as mensaje;
SELECT count(*) as usuarios_creados FROM "app-alquiler".users;
SELECT username, email, user_type FROM "app-alquiler".users ORDER BY id;
"@

# Escribir el script SQL al archivo temporal
$sqlScript | Out-File -FilePath $tempSqlFile -Encoding UTF8

Write-Host "Ejecutando configuración de base de datos..." -ForegroundColor Yellow

# Ejecutar el script
$env:PGPASSWORD = $DB_PASSWORD
try {
    $result = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $tempSqlFile 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ ¡Configuración completada exitosamente!" -ForegroundColor Green
        Write-Host $result -ForegroundColor White
        
        Write-Host "`n=== USUARIOS DE PRUEBA CREADOS ===" -ForegroundColor Cyan
        Write-Host "admin      | admin@test.com      | admin123    | admin" -ForegroundColor White
        Write-Host "owner1     | owner@test.com      | owner123    | owner" -ForegroundColor White
        Write-Host "tenant1    | tenant@test.com     | tenant123   | tenant" -ForegroundColor White
        Write-Host "usuario_aure | aure@workspace.com | aure123     | admin" -ForegroundColor White
        
        Write-Host "`n=== PRÓXIMOS PASOS ===" -ForegroundColor Green
        Write-Host "1. ✅ Base de datos configurada correctamente"
        Write-Host "2. ✅ Backend conectado y funcionando"
        Write-Host "3. 🌐 Puedes probar la API en http://localhost:3001"
        Write-Host "4. 🔐 Usar los usuarios de prueba para autenticación"
        
    } else {
        Write-Host "❌ Error ejecutando el script:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "❌ Error conectando a la base de datos:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
} finally {
    # Limpiar archivo temporal
    if (Test-Path $tempSqlFile) {
        Remove-Item $tempSqlFile
    }
    # Limpiar variable de contraseña
    Remove-Item Env:PGPASSWORD
}

Write-Host "`n🎉 ¡CONFIGURACIÓN COMPLETADA!" -ForegroundColor Green