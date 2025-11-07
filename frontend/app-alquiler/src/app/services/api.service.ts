import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  user_type: 'owner' | 'tenant' | 'admin';
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  user_type?: 'owner' | 'tenant';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface ApiHealthResponse {
  name: string;
  version: string;
  description: string;
  database_status: string;
  endpoints: {
    health: string;
    database_health: string;
    auth: {
      register: string;
      login: string;
      profile: string;
      update_profile: string;
      change_password: string;
    };
  };
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:3001';
  private readonly storageKey = 'app_alquiler_token';

  constructor(private http: HttpClient) {}

  // Headers con token si está disponible
  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  // Gestión de token
  setToken(token: string): void {
    localStorage.setItem(this.storageKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.storageKey);
  }

  clearToken(): void {
    localStorage.removeItem(this.storageKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // ======================
  // ENDPOINTS DE SALUD
  // ======================

  getHealth(): Observable<ApiHealthResponse> {
    return this.http.get<ApiHealthResponse>(`${this.baseUrl}/health`).pipe(
      tap(response => console.log('✅ API Health:', response)),
      catchError(this.handleError('getHealth'))
    );
  }

  getDatabaseHealth(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health/db`).pipe(
      tap(response => console.log('✅ Database Health:', response)),
      catchError(this.handleError('getDatabaseHealth'))
    );
  }

  // ======================
  // ENDPOINTS DE AUTENTICACIÓN
  // ======================

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, credentials, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.success && response.token) {
          this.setToken(response.token);
          console.log('✅ Login exitoso:', response.user);
        }
      }),
      catchError(this.handleError('login'))
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, userData, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.success) {
          console.log('✅ Registro exitoso:', response.user);
        }
      }),
      catchError(this.handleError('register'))
    );
  }

  getProfile(): Observable<{ success: boolean; user: User }> {
    return this.http.get<{ success: boolean; user: User }>(`${this.baseUrl}/auth/profile`, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => console.log('✅ Profile:', response.user)),
      catchError(this.handleError('getProfile'))
    );
  }

  updateProfile(userData: Partial<User>): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(`${this.baseUrl}/auth/profile`, userData, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => console.log('✅ Profile updated:', response)),
      catchError(this.handleError('updateProfile'))
    );
  }

  changePassword(oldPassword: string, newPassword: string): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(`${this.baseUrl}/auth/change-password`, {
      old_password: oldPassword,
      new_password: newPassword
    }, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => console.log('✅ Password changed:', response)),
      catchError(this.handleError('changePassword'))
    );
  }

  logout(): void {
    this.clearToken();
    console.log('👤 Sesión cerrada');
  }

  // ======================
  // MANEJO DE ERRORES
  // ======================

  private handleError(operation: string) {
    return (error: any): Observable<never> => {
      console.error(`❌ Error en ${operation}:`, error);
      
      let errorMessage = 'Error de conexión';
      
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.status === 0) {
        errorMessage = 'No se puede conectar al servidor. Verifique que el backend esté ejecutándose.';
      } else if (error.status === 401) {
        errorMessage = 'No autorizado. Token inválido o expirado.';
        this.clearToken();
      } else if (error.status === 404) {
        errorMessage = 'Endpoint no encontrado.';
      } else if (error.status >= 500) {
        errorMessage = 'Error interno del servidor.';
      }

      return throwError(() => ({ ...error, friendlyMessage: errorMessage }));
    };
  }
}