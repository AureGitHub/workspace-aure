# Configuración de Shared Library

## 🔧 Nueva Arquitectura Configurable

La librería compartida ahora es completamente configurable, permitiendo que cada aplicación frontend especifique su propio backend.

## 📋 Configuración por Aplicación

### 1. App Alquiler
```typescript
// main.ts
import { provideSharedLibConfig } from 'shared-lib';

bootstrapApplication(AppComponent, {
  providers: [
    // ... otros providers ...
    provideSharedLibConfig('app-alquiler'), // ← Configuración automática
  ],
});
```

### 2. App2 (Ejemplo)
```typescript
// main.ts
import { provideSharedLibConfig } from 'shared-lib';

bootstrapApplication(AppComponent, {
  providers: [
    // ... otros providers ...
    provideSharedLibConfig('app2'), // ← Configuración para app2
  ],
});
```

### 3. Configuración Personalizada
```typescript
// main.ts
import { provideSharedLibBackend } from 'shared-lib';

bootstrapApplication(AppComponent, {
  providers: [
    // ... otros providers ...
    provideSharedLibBackend(
      'http://localhost:3001',    // baseUrl
      '/app-alquiler',            // apiPrefix
      {
        timeout: 30000,           // opcional
        retryAttempts: 2          // opcional
      }
    ),
  ],
});
```

## 🛠️ Configuraciones Predefinidas

### App Alquiler
```javascript
{
  backend: {
    baseUrl: 'http://localhost:3001',
    apiPrefix: '/app-alquiler',
    timeout: 30000,
    retryAttempts: 2
  }
}
```

### App2
```javascript
{
  backend: {
    baseUrl: 'http://localhost:3002',
    apiPrefix: '/app2',
    timeout: 30000,
    retryAttempts: 2
  }
}
```

### Portal
```javascript
{
  backend: {
    baseUrl: 'http://localhost:3003',
    apiPrefix: '/portal',
    timeout: 30000,
    retryAttempts: 2
  }
}
```

## 🚀 URLs Generadas Automáticamente

Con la configuración de `app-alquiler`, los endpoints se generan así:

| Método | Endpoint Relativo | URL Final |
|--------|------------------|-----------|
| POST | `/auth/login` | `http://localhost:3001/app-alquiler/auth/login` |
| POST | `/auth/register` | `http://localhost:3001/app-alquiler/auth/register` |
| GET | `/auth/profile` | `http://localhost:3001/app-alquiler/auth/profile` |
| PUT | `/auth/profile` | `http://localhost:3001/app-alquiler/auth/profile` |
| PUT | `/auth/change-password` | `http://localhost:3001/app-alquiler/auth/change-password` |

## 💡 Ventajas del Nuevo Sistema

✅ **Flexibilidad:** Cada app puede usar su propio backend  
✅ **Escalabilidad:** Fácil agregar nuevas aplicaciones  
✅ **Mantenimiento:** Configuración centralizada pero flexible  
✅ **Desarrollo:** Diferentes puertos y prefijos por app  
✅ **Producción:** Diferentes dominios por microservicio  

## 🔄 Migración desde Configuración Hardcodeada

### Antes (Hardcodeado):
```typescript
// AuthService tenía hardcodeado:
baseUrl: 'http://localhost:3001'
```

### Ahora (Configurable):
```typescript
// main.ts
provideSharedLibConfig('app-alquiler')

// AuthService usa automáticamente:
// http://localhost:3001/app-alquiler/auth/*
```

## 🎯 Configuración de Desarrollo vs Producción

### Desarrollo
```typescript
provideSharedLibBackend(
  'http://localhost:3001',
  '/app-alquiler'
);
```

### Producción
```typescript
provideSharedLibBackend(
  'https://api.alquiler-zarza.com',
  '/app-alquiler'
);
```

## 🧪 Configuración para Testing

```typescript
provideCustomSharedLibConfig({
  backend: {
    baseUrl: 'http://localhost:3999',  // Puerto de test
    apiPrefix: '/test-api',
    timeout: 5000,                     // Timeout más corto
    retryAttempts: 1                   // Menos reintentos
  }
});
```

¡Ahora cada aplicación puede configurar su propio backend de forma independiente! 🎉