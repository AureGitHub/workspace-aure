# API Endpoints - App Alquiler Backend

## 🔗 Base URL
```
http://localhost:3001/app-alquiler
```

## 📋 Endpoints Disponibles

### ⚡ Health & Info
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/app-alquiler/health` | Health check general |
| GET | `/app-alquiler/health/db` | Health check de base de datos |
| GET | `/app-alquiler/api/info` | Información de la API |

### 🔐 Autenticación
| Método | Endpoint | Descripción | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/app-alquiler/auth/register` | Registrar nuevo usuario | ❌ |
| POST | `/app-alquiler/auth/login` | Iniciar sesión | ❌ |
| GET | `/app-alquiler/auth/profile` | Obtener perfil de usuario | ✅ |
| PUT | `/app-alquiler/auth/profile` | Actualizar perfil | ✅ |
| PUT | `/app-alquiler/auth/change-password` | Cambiar contraseña | ✅ |

### 🛠️ Debug (Temporal - Solo Desarrollo)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/app-alquiler/auth/debug/users` | Listar todos los usuarios |
| GET | `/app-alquiler/auth/debug/login-admin` | Login automático como admin |

## 📝 Ejemplos de Uso

### Login
```bash
curl -X POST http://localhost:3001/app-alquiler/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'
```

### Health Check
```bash
curl http://localhost:3001/app-alquiler/health
```

### API Info
```bash
curl http://localhost:3001/app-alquiler/api/info
```

## 🔧 Testing
Ejecutar el script de prueba:
```bash
deno run --allow-net test-api-prefix.ts
```

## 🚀 Cambios Implementados

✅ **Todas las rutas ahora tienen el prefijo `/app-alquiler/`**
- Permite distinguir entre diferentes APIs
- Facilita el proxy y routing en producción
- Mejor organización de servicios

✅ **Frontend actualizado**
- AuthService ahora usa las rutas con prefijo
- Todas las llamadas apuntan a `/app-alquiler/auth/*`

✅ **Backward compatibility**
- El servidor común soporta tanto con prefijo como sin prefijo
- Otros servicios no se ven afectados

## 🌐 Configuración de Proxy (Ejemplo)

En producción puedes usar un proxy como Nginx:
```nginx
location /app-alquiler/ {
    proxy_pass http://backend-alquiler:3001/app-alquiler/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

location /app2/ {
    proxy_pass http://backend-app2:3002/app2/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

Esto permite tener múltiples APIs en el mismo dominio con diferentes prefijos.