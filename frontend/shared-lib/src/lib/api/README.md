# ApiService - Servicio HTTP para Angular con Ionic

Un servicio completo para gestionar todas las llamadas HTTP a tu API con manejo robusto de errores, interceptores y utilidades avanzadas.

## 🚀 Características

- ✅ **Métodos HTTP completos**: GET, POST, PUT, PATCH, DELETE, HEAD
- ✅ **Manejo robusto de errores**: Mensajes amigables y logging detallado
- ✅ **Sistema de reintentos**: Configurable para requests fallidos
- ✅ **Timeout configurable**: Evita requests que cuelguen indefinidamente
- ✅ **Upload/Download de archivos**: Soporte nativo para archivos
- ✅ **Interceptor HTTP**: Manejo automático de tokens y loading states
- ✅ **TypeScript completo**: Interfaces y tipos para mejor DX
- ✅ **Configuración flexible**: Adapta el servicio a tus necesidades

## 📦 Instalación

```bash
# Ya incluido en shared-lib
import { ApiService, ApiInterceptor } from 'shared-lib';
```

## 🔧 Configuración Inicial

### 1. Configurar el ApiService

```typescript
import { ApiService } from 'shared-lib';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  constructor(private apiService: ApiService) {
    this.configureApi();
  }

  private configureApi() {
    this.apiService.configure({
      baseUrl: 'https://api.tudominio.com',
      timeout: 30000, // 30 segundos
      retryAttempts: 2,
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Client-Version': '1.0.0'
      }
    });
  }
}
```

### 2. Configurar el Interceptor (Opcional)

```typescript
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiInterceptor } from 'shared-lib';

// En tu app.config.ts o app.module.ts
export const appConfig: ApplicationConfig = {
  providers: [
    // ... otros providers
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true
    }
  ]
};
```

## 📖 Uso Básico

### Métodos HTTP Básicos

```typescript
import { Injectable } from '@angular/core';
import { ApiService } from 'shared-lib';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private apiService: ApiService) {}

  // GET - Obtener datos
  getUsers(): Observable<any> {
    return this.apiService.get('/users');
  }

  // POST - Crear datos
  createUser(userData: any): Observable<any> {
    return this.apiService.post('/users', userData);
  }

  // PUT - Actualizar datos
  updateUser(id: number, userData: any): Observable<any> {
    return this.apiService.put(`/users/${id}`, userData);
  }

  // PATCH - Actualización parcial
  patchUser(id: number, updates: any): Observable<any> {
    return this.apiService.patch(`/users/${id}`, updates);
  }

  // DELETE - Eliminar datos
  deleteUser(id: number): Observable<any> {
    return this.apiService.delete(`/users/${id}`);
  }
}
```

### Uso con Parámetros y Headers

```typescript
// GET con parámetros de consulta
getUsers(page: number, limit: number): Observable<any> {
  return this.apiService.get('/users', {
    params: { page, limit, status: 'active' }
  });
}

// POST con headers personalizados
createUser(userData: any): Observable<any> {
  return this.apiService.post('/users', userData, {
    headers: {
      'X-Custom-Header': 'valor-personalizado'
    }
  });
}
```

## 📁 Upload y Download de Archivos

### Upload de Archivos

```typescript
// Upload simple
uploadAvatar(file: File): Observable<any> {
  return this.apiService.uploadFile('/users/avatar', file);
}

// Upload con datos adicionales
uploadDocument(file: File, metadata: any): Observable<any> {
  return this.apiService.uploadFile('/documents', file, metadata);
}
```

### Download de Archivos

```typescript
// Download automático
downloadReport(): Observable<Blob> {
  return this.apiService.downloadFile('/reports/monthly', 'reporte-mensual.pdf');
}

// Download manual
getFileBlob(): Observable<Blob> {
  return this.apiService.downloadFile('/files/document.pdf');
}
```

## 🎯 Uso con TypeScript (Recomendado)

### Interfaces Tipadas

```typescript
import { 
  PaginatedResponse, 
  SingleResponse, 
  CreateResponse,
  UpdateResponse,
  DeleteResponse 
} from 'shared-lib';

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

@Injectable()
export class UserService {
  constructor(private apiService: ApiService) {}

  getUsers(): Observable<PaginatedResponse<User>> {
    return this.apiService.get<PaginatedResponse<User>>('/users');
  }

  getUserById(id: number): Observable<SingleResponse<User>> {
    return this.apiService.get<SingleResponse<User>>(`/users/${id}`);
  }

  createUser(userData: Partial<User>): Observable<CreateResponse<User>> {
    return this.apiService.post<CreateResponse<User>>('/users', userData);
  }
}
```

## 🔐 Autenticación

### Configurar Token de Autenticación

```typescript
// Establecer token
this.apiService.setAuthorizationHeader('tu-jwt-token');

// Token con prefijo personalizado
this.apiService.setAuthorizationHeader('tu-token', 'Custom');

// Remover token
this.apiService.removeAuthorizationHeader();
```

### Ejemplo Completo de Autenticación

```typescript
@Injectable()
export class AuthService {
  constructor(private apiService: ApiService) {}

  async login(email: string, password: string): Promise<void> {
    try {
      const response = await this.apiService.post('/auth/login', {
        email,
        password
      }).toPromise();

      if (response.success) {
        // Guardar token
        localStorage.setItem('token', response.data.token);
        
        // Configurar para requests futuras
        this.apiService.setAuthorizationHeader(response.data.token);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    this.apiService.removeAuthorizationHeader();
  }
}
```

## 🛠️ Utilidades Avanzadas

### Construcción de Parámetros

```typescript
// Método auxiliar para parámetros complejos
const params = this.apiService.buildParams({
  page: 1,
  limit: 20,
  search: 'john',
  status: 'active',
  includeDeleted: false
});

this.apiService.get('/users', { params });
```

### Verificación de Configuración

```typescript
// Verificar si el servicio está configurado
if (this.apiService.isConfigured()) {
  console.log('API Service ready!');
  console.log('Base URL:', this.apiService.getBaseUrl());
}
```

## ⚠️ Manejo de Errores

### Errores Automáticos

El servicio maneja automáticamente diferentes tipos de errores:

- **0**: Error de conexión/red
- **400**: Solicitud inválida
- **401**: No autorizado
- **403**: Acceso denegado
- **404**: Recurso no encontrado
- **422**: Error de validación
- **500**: Error interno del servidor

### Manejo Manual de Errores

```typescript
async loadData(): Promise<void> {
  try {
    const data = await this.apiService.get('/data').toPromise();
    console.log('Data loaded:', data);
  } catch (apiError: any) {
    console.error('API Error:', {
      message: apiError.message,
      statusCode: apiError.statusCode,
      timestamp: apiError.timestamp
    });

    // Manejo específico por código de error
    switch (apiError.statusCode) {
      case 401:
        this.redirectToLogin();
        break;
      case 403:
        this.showForbiddenMessage();
        break;
      case 422:
        this.handleValidationErrors(apiError.details);
        break;
      default:
        this.showGenericError();
    }
  }
}
```

## 🔄 Interceptor HTTP

### Configuración del Interceptor

```typescript
// Configurar interceptor
const interceptor = inject(ApiInterceptor);

interceptor.configure({
  showLoadingForRoutes: ['/users', '/posts'],
  excludeLoadingForRoutes: ['/auth/refresh'],
  tokenHeaderName: 'Authorization',
  tokenPrefix: 'Bearer'
});

// Callbacks para manejo de estados
interceptor.setLoadingCallback((loading: boolean) => {
  console.log('Loading state:', loading);
});

interceptor.setUnauthorizedCallback(() => {
  console.log('Unauthorized - redirect to login');
});

interceptor.setTokenProvider(() => {
  return localStorage.getItem('token');
});
```

## 📊 Ejemplos de Uso en Componentes

### Componente con Lista de Usuarios

```typescript
import { Component, OnInit } from '@angular/core';
import { UserService } from './user.service';

@Component({
  selector: 'app-users',
  template: `
    <div *ngIf="loading">Cargando usuarios...</div>
    <div *ngIf="error" class="error">{{ error }}</div>
    <div *ngFor="let user of users">
      {{ user.name }} - {{ user.email }}
    </div>
  `
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  loading = false;
  error: string | null = null;

  constructor(private userService: UserService) {}

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    try {
      this.loading = true;
      this.error = null;
      
      const response = await this.userService.getUsers().toPromise();
      this.users = response.data;
    } catch (error: any) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }
}
```

## 🎨 Integración con Ionic

### Loading Controller

```typescript
import { LoadingController } from '@ionic/angular';

@Injectable()
export class IonicApiService {
  private loading: HTMLIonLoadingElement | null = null;

  constructor(
    private apiService: ApiService,
    private loadingCtrl: LoadingController
  ) {
    this.setupInterceptor();
  }

  private setupInterceptor() {
    const interceptor = inject(ApiInterceptor);
    
    interceptor.setLoadingCallback(async (isLoading: boolean) => {
      if (isLoading) {
        this.loading = await this.loadingCtrl.create({
          message: 'Cargando...'
        });
        this.loading.present();
      } else if (this.loading) {
        this.loading.dismiss();
        this.loading = null;
      }
    });
  }
}
```

## 🔍 Debugging y Desarrollo

### Logs de Debug

```typescript
// El servicio incluye logs automáticos para debugging
// Verifica la consola del navegador para información detallada

// Para producción, puedes configurar el nivel de logging
if (environment.production) {
  console.log = () => {}; // Deshabilitar logs
}
```

## 📈 Mejores Prácticas

1. **Usa TypeScript**: Siempre define interfaces para tus respuestas de API
2. **Maneja errores**: Implementa manejo de errores consistente
3. **Configura timeouts**: Ajusta timeouts según tus necesidades
4. **Usa interceptores**: Para funcionalidad cross-cutting como auth y loading
5. **Cachea cuando sea apropiado**: Considera implementar caching para datos estáticos
6. **Monitorea performance**: Usa las herramientas de desarrollo para optimizar

## 🤝 Contribución

Para contribuir a este servicio:

1. Crea una nueva rama para tu feature
2. Implementa los cambios con tests
3. Actualiza la documentación
4. Crea un PR con descripción detallada

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles.