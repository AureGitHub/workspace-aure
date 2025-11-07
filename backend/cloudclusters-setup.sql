-- Script SQL para CloudClusters PostgreSQL
-- Base de datos: workspace-aure
-- Esquema: app-alquiler
-- Servidor: postgresql-118326-0.cloudclusters.net:18718

-- Conectar a la base de datos workspace-aure primero
-- \c workspace-aure;

-- Crear el esquema app-alquiler si no existe
CREATE SCHEMA IF NOT EXISTS "app-alquiler";

-- Crear tabla de usuarios en el esquema app-alquiler
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

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON "app-alquiler".users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON "app-alquiler".users(username);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON "app-alquiler".users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON "app-alquiler".users(is_active);

-- Insertar usuarios de prueba
INSERT INTO "app-alquiler".users (username, email, password_hash, first_name, last_name, phone, user_type, is_active, email_verified) VALUES
-- admin / admin123 (password hashed con SHA-256)
('admin', 'admin@test.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Admin', 'User', '+1234567890', 'admin', true, true),

-- owner1 / owner123
('owner1', 'owner@test.com', 'a17c9aaa61e80a1bf71d0d850af4e5baa9800bbd1a3b1c5fca7b52e7c6c47e29', 'John', 'Owner', '+1234567891', 'owner', true, true),

-- tenant1 / tenant123
('tenant1', 'tenant@test.com', '2aa60a8ff7fcd473d321e0146afd9e26df395147c4d3b4e4a3d03c72c30600b1', 'Jane', 'Tenant', '+1234567892', 'tenant', true, true),

-- usuario_aure / aure123 (usuario específico para ti)
('usuario_aure', 'aure@workspace.com', 'f6f2ea8f45d8a057c9566a33f99474da2e5c6a6604e5a6c6c5e8b5d2c3f1e4a7', 'Aure', 'Workspace', '+34123456789', 'admin', true, true)
ON CONFLICT (username) DO NOTHING;

-- Crear también tabla properties en el esquema para funcionalidades futuras
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

-- Verificar que todo se creó correctamente
SELECT 'Esquema app-alquiler creado exitosamente!' as mensaje;
SELECT 'Tabla users creada en esquema app-alquiler!' as mensaje;
SELECT 'Usuarios disponibles:' as info;
SELECT id, username, email, first_name, last_name, user_type, is_active, email_verified 
FROM "app-alquiler".users 
ORDER BY id;

-- Mostrar el esquema actual para verificar
SELECT 'Esquemas disponibles:' as info;
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'app-alquiler';

-- Mostrar tablas en el esquema
SELECT 'Tablas en esquema app-alquiler:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'app-alquiler';