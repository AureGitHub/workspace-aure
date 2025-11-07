# Database Setup Instructions for App Alquiler Backend

## Opción 1: Usando psql (Command Line)

```bash
# 1. Conectar a PostgreSQL como superusuario
psql -U postgres

# 2. Crear la base de datos
CREATE DATABASE app_alquiler_db;

# 3. Conectar a la nueva base de datos
\c app_alquiler_db;

# 4. Ejecutar el script SQL
\i C:/Aure/desarrollos/javascript/workspace-aure/backend/users-table-setup.sql

# 5. Verificar que funcionó
SELECT * FROM users;

# 6. Salir de psql
\q
```

## Opción 2: Usando pgAdmin

1. Abrir pgAdmin
2. Conectar a tu servidor PostgreSQL
3. Click derecho en "Databases" > "Create" > "Database"
4. Nombre: `app_alquiler_db`
5. Click en la base de datos creada
6. Abrir "Query Tool" 
7. Copiar y pegar el contenido de `users-table-setup.sql`
8. Ejecutar (F5)

## Opción 3: Un solo comando

```bash
# Ejecutar todo en una línea (ajusta la ruta según tu instalación)
psql -U postgres -c "CREATE DATABASE app_alquiler_db;" && psql -U postgres -d app_alquiler_db -f "C:/Aure/desarrollos/javascript/workspace-aure/backend/users-table-setup.sql"
```

## Usuarios de Prueba Creados

Una vez ejecutado el script, tendrás estos usuarios disponibles:

| Username | Email | Password | Tipo | Activo |
|----------|-------|----------|------|--------|
| admin | admin@test.com | admin123 | admin | ✅ |
| owner1 | owner@test.com | owner123 | owner | ✅ |
| tenant1 | tenant@test.com | tenant123 | tenant | ✅ |

## Configuración del Backend

Asegúrate de que tu archivo `.env` tenga estas configuraciones:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=app_alquiler_db
DB_USER=postgres
DB_PASSWORD=tu_password_aqui
DB_SSL=false
```

## Verificar Conexión

Una vez configurado, reinicia el backend y deberías ver:

```
[INFO] Database connected successfully
```

## Probar la API

```bash
# Registrar nuevo usuario
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com", 
    "password": "password123",
    "first_name": "Test",
    "last_name": "User",
    "user_type": "tenant"
  }'

# Login con usuario existente
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'
```