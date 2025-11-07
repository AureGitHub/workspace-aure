# App Alquiler Backend

Backend API para la aplicación de alquiler desarrollado con Deno.js y Oak framework.

## Características

- 🦕 **Deno.js 2.0.5+** - Runtime moderno y seguro
- 🌳 **Oak** - Framework web minimalista
- 🔐 **JWT Authentication** - Autenticación con tokens JWT
- 🐘 **PostgreSQL** - Base de datos relacional
- 📦 **Arquitectura Modular** - Librería común reutilizable
- 🛡️ **TypeScript** - Tipado estático
- 🔄 **Hot Reload** - Recarga automática en desarrollo

## Estructura del Proyecto

```
backend/
├── common-lib/                 # Librería común
│   ├── src/
│   │   ├── server/            # Servidor Oak común
│   │   ├── auth/              # Autenticación JWT
│   │   ├── database/          # Acceso a PostgreSQL
│   │   └── utils/             # Utilidades
│   ├── deno.json
│   └── mod.ts
└── app-alquiler/              # Aplicación de alquiler
    ├── src/
    │   ├── controllers/       # Controladores HTTP
    │   ├── models/           # Modelos y repositorios
    │   ├── routes/           # Definición de rutas
    │   ├── services/         # Lógica de negocio
    │   └── main.ts           # Punto de entrada
    ├── deno.json
    └── .env.example
```

## Instalación y Configuración

### Prerequisitos

- Deno.js 2.0.5 o superior
- PostgreSQL 12 o superior

### 1. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura las variables:

```bash
cd backend/app-alquiler
cp .env.example .env
```

Edita `.env` con tus configuraciones:

```env
# Server Configuration
PORT=3001
HOST=localhost

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=app_alquiler_db
DB_USER=postgres
DB_PASSWORD=tu_password_aqui
DB_SSL=false
DB_POOL_SIZE=10

# JWT Configuration
JWT_SECRET=tu-clave-secreta-jwt-aqui
JWT_EXPIRATION=3600

# Environment
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:8101
```

### 2. Configurar Base de Datos

Crea la base de datos en PostgreSQL:

```sql
CREATE DATABASE app_alquiler_db;

-- Tablas principales
CREATE TABLE users (
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

CREATE TABLE properties (
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
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_property_type ON properties(property_type);
CREATE INDEX idx_properties_availability ON properties(availability_status);
CREATE INDEX idx_properties_owner ON properties(owner_id);
```

## Comandos Disponibles

### Desarrollo

```bash
# Iniciar en modo desarrollo con hot reload
deno task dev

# Verificar tipos TypeScript
deno task check

# Formatear código
deno task fmt

# Lint del código
deno task lint

# Ejecutar tests
deno task test
```

### Producción

```bash
# Iniciar servidor
deno task start
```

## API Endpoints

### Información General

- `GET /api/info` - Información de la API
- `GET /health` - Health check del servidor
- `GET /health/db` - Health check de la base de datos

### Autenticación

- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión
- `GET /auth/profile` - Obtener perfil (requiere autenticación)
- `PUT /auth/profile` - Actualizar perfil (requiere autenticación)
- `PUT /auth/change-password` - Cambiar contraseña (requiere autenticación)

### Ejemplo de Registro

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "usuario_test",
    "email": "test@example.com",
    "password": "MiPassword123!",
    "first_name": "Usuario",
    "last_name": "Test",
    "user_type": "tenant"
  }'
```

### Ejemplo de Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "MiPassword123!"
  }'
```

## Librería Común

La librería común (`common-lib`) proporciona:

### Server Module
- Configuración de servidor Oak
- Middleware común (CORS, logging, error handling)
- Health checks

### Auth Module
- Generación y verificación de JWT tokens
- Middleware de autenticación
- Hash de contraseñas

### Database Module
- Pool de conexiones PostgreSQL
- Clase base Repository para CRUD operations
- Soporte para transacciones

### Utils Module
- Helpers para respuestas HTTP
- Validaciones comunes
- Logger
- Manejo de errores personalizado

## Desarrollo

Para agregar nuevas funcionalidades:

1. **Modelos**: Agregar interfaces en `src/models/types.ts`
2. **Repositorios**: Crear repositorios que extiendan `BaseRepository`
3. **Servicios**: Implementar lógica de negocio
4. **Controladores**: Manejar requests HTTP
5. **Rutas**: Definir endpoints

## Arquitectura Multi-Aplicación

El backend está diseñado para soportar múltiples aplicaciones:

- `common-lib/` - Funcionalidad compartida
- `app-alquiler/` - Aplicación de alquiler
- `app-otras/` - Otras aplicaciones futuras

Cada aplicación puede usar la librería común para funcionalidades base como autenticación, base de datos y servidor.

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

MIT