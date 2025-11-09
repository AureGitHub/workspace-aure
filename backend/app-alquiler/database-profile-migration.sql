-- Mejora de la base de datos: Tabla de perfiles
-- Fecha: 2025-11-09
-- Descripción: Crear tabla profiles y migrar user_type a FK

-- 1. Crear la tabla profiles
CREATE TABLE IF NOT EXISTS "app-alquiler".profiles (
    id SERIAL PRIMARY KEY,
    description VARCHAR(50) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Insertar los perfiles básicos
INSERT INTO "app-alquiler".profiles (description) VALUES 
    ('admin'),
    ('owner'), 
    ('tenant')
ON CONFLICT (description) DO NOTHING;

-- 3. Agregar la columna profile_id a la tabla users (temporal, permite NULL)
ALTER TABLE "app-alquiler".users 
ADD COLUMN IF NOT EXISTS profile_id INTEGER REFERENCES "app-alquiler".profiles(id);

-- 4. Migrar datos existentes: mapear user_type a profile_id
UPDATE "app-alquiler".users 
SET profile_id = (
    SELECT id FROM "app-alquiler".profiles 
    WHERE description = users.user_type
)
WHERE profile_id IS NULL;

-- 5. Hacer profile_id obligatorio después de la migración
ALTER TABLE "app-alquiler".users 
ALTER COLUMN profile_id SET NOT NULL;

-- 6. Eliminar la columna user_type (comentado por seguridad, ejecutar después de verificar)
-- ALTER TABLE "app-alquiler".users DROP COLUMN IF EXISTS user_type;

-- 7. Crear índice para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_users_profile_id ON "app-alquiler".users(profile_id);

-- 8. Verificar la migración (consulta de prueba)
SELECT 
    u.id,
    u.username,
    u.email,
    u.first_name,
    u.last_name,
    p.description as profile_name,
    u.user_type as old_user_type -- esto desaparecerá después del paso 6
FROM "app-alquiler".users u
JOIN "app-alquiler".profiles p ON u.profile_id = p.id
ORDER BY u.id;