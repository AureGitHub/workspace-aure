import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { 
  PaginatedResponse, 
  SingleResponse, 
  CreateResponse, 
  UpdateResponse, 
  DeleteResponse,
  QueryParams,
  BaseUser,
  ApiAuthResponse,
  LoginRequest,
  RegisterRequest
} from './api.types';

/**
 * Ejemplo de servicio que utiliza ApiService
 * Este es un ejemplo de cómo implementar servicios específicos usando el ApiService base
 */
@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  constructor(private apiService: ApiService) {}

  /**
   * Obtener lista paginada de usuarios
   */
  getUsers(params?: QueryParams): Observable<PaginatedResponse<BaseUser>> {
    return this.apiService.get<PaginatedResponse<BaseUser>>('/users', {
      params: params as any
    });
  }

  /**
   * Obtener un usuario por ID
   */
  getUserById(id: string | number): Observable<SingleResponse<BaseUser>> {
    return this.apiService.get<SingleResponse<BaseUser>>(`/users/${id}`);
  }

  /**
   * Crear un nuevo usuario
   */
  createUser(userData: Partial<BaseUser>): Observable<CreateResponse<BaseUser>> {
    return this.apiService.post<CreateResponse<BaseUser>>('/users', userData);
  }

  /**
   * Actualizar un usuario
   */
  updateUser(id: string | number, userData: Partial<BaseUser>): Observable<UpdateResponse<BaseUser>> {
    return this.apiService.put<UpdateResponse<BaseUser>>(`/users/${id}`, userData);
  }

  /**
   * Eliminar un usuario
   */
  deleteUser(id: string | number): Observable<DeleteResponse> {
    return this.apiService.delete<DeleteResponse>(`/users/${id}`);
  }

  /**
   * Subir avatar de usuario
   */
  uploadAvatar(userId: string | number, file: File): Observable<any> {
    return this.apiService.uploadFile(`/users/${userId}/avatar`, file);
  }
}

/**
 * Ejemplo de servicio de autenticación usando ApiService
 */
@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  constructor(private apiService: ApiService) {}

  /**
   * Iniciar sesión
   */
  login(credentials: LoginRequest): Observable<ApiAuthResponse> {
    return this.apiService.post<ApiAuthResponse>('/auth/login', credentials);
  }

  /**
   * Registrar nuevo usuario
   */
  register(userData: RegisterRequest): Observable<ApiAuthResponse> {
    return this.apiService.post<ApiAuthResponse>('/auth/register', userData);
  }

  /**
   * Cerrar sesión
   */
  logout(): Observable<any> {
    return this.apiService.post('/auth/logout', {});
  }

  /**
   * Refrescar token
   */
  refreshToken(refreshToken: string): Observable<ApiAuthResponse> {
    return this.apiService.post<ApiAuthResponse>('/auth/refresh', { refreshToken });
  }

  /**
   * Solicitar recuperación de contraseña
   */
  forgotPassword(email: string): Observable<any> {
    return this.apiService.post('/auth/forgot-password', { email });
  }

  /**
   * Restablecer contraseña
   */
  resetPassword(token: string, password: string): Observable<any> {
    return this.apiService.post('/auth/reset-password', { token, password });
  }

  /**
   * Obtener perfil del usuario actual
   */
  getProfile(): Observable<SingleResponse<BaseUser>> {
    return this.apiService.get<SingleResponse<BaseUser>>('/auth/profile');
  }

  /**
   * Actualizar perfil del usuario actual
   */
  updateProfile(profileData: Partial<BaseUser>): Observable<UpdateResponse<BaseUser>> {
    return this.apiService.put<UpdateResponse<BaseUser>>('/auth/profile', profileData);
  }
}

/**
 * Ejemplo de configuración e inicialización del ApiService
 */
export class ApiServiceExample {
  
  static configureApiService(apiService: ApiService): void {
    // Configuración básica
    apiService.configure({
      baseUrl: 'https://api.example.com',
      timeout: 30000,
      retryAttempts: 2,
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Client-Version': '1.0.0'
      }
    });
  }

  static setupAuthentication(apiService: ApiService, token: string): void {
    // Configurar token de autenticación
    apiService.setAuthorizationHeader(token);
  }

  static handleApiErrors(): void {
    // Ejemplo de manejo de errores global
    // Esto normalmente se haría en un interceptor o en cada servicio
    console.log('Configure global error handling here');
  }
}

/**
 * Ejemplo de uso en un componente
 */
export class ComponentExample {
  constructor(
    private userApi: UserApiService,
    private authApi: AuthApiService
  ) {}

  async loadUsers(): Promise<void> {
    try {
      const response = await this.userApi.getUsers({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      }).toPromise();

      if (response?.data) {
        console.log('Users loaded:', response.data);
        console.log('Total users:', response.meta.total);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  async loginUser(email: string, password: string): Promise<void> {
    try {
      const response = await this.authApi.login({
        email,
        password,
        rememberMe: true
      }).toPromise();

      if (response?.success) {
        console.log('Login successful:', response.data);
        // Guardar token, redirigir, etc.
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  async uploadUserAvatar(userId: number, file: File): Promise<void> {
    try {
      const response = await this.userApi.uploadAvatar(userId, file).toPromise();
      console.log('Avatar uploaded:', response);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }
}