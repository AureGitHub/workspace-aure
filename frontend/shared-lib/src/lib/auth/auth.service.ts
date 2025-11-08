import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ApiService } from '../api/api.service';
import { User, BackendLoginRequest, BackendRegisterRequest, BackendAuthResponse } from './auth.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  // Estado privado usando BehaviorSubject para reactividad
  private isLoginSubject = new BehaviorSubject<boolean>(false);
  
  // Observable público para que los componentes se suscriban
  public isLogin$: Observable<boolean> = this.isLoginSubject.asObservable();
  
  // Signal para el estado de login (Angular 17+)
  public isLoggedIn = signal<boolean>(false);
  
  // Computed signal que puede ser útil para estados derivados
  public authStatus = computed(() => 
    this.isLoggedIn() ? 'authenticated' : 'unauthenticated'
  );

  // Usuario actual
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';

  constructor(private apiService: ApiService) {
    // Configurar el API service con la URL del backend
    this.configureApiService();
    // Inicializar el estado desde localStorage si existe
    this.initializeAuthState();
  }

  /**
   * Configura el ApiService para trabajar con el backend
   */
  private configureApiService(): void {
    this.apiService.configure({
      baseUrl: 'http://localhost:3001',
      timeout: 30000,
      retryAttempts: 2,
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  /**
   * Obtiene el estado actual de autenticación
   */
  get isLogin(): boolean {
    return this.isLoginSubject.value;
  }

  /**
   * Establece el estado de login
   */
  private setLoginState(isLoggedIn: boolean, user: User | null = null): void {
    this.isLoginSubject.next(isLoggedIn);
    this.isLoggedIn.set(isLoggedIn);
    this.currentUserSubject.next(user);
    
    // Persistir en localStorage
    if (isLoggedIn && user) {
      localStorage.setItem('auth_isLogin', 'true');
      localStorage.setItem(this.userKey, JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_isLogin');
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      // Remover header de autorización del ApiService
      this.apiService.removeAuthorizationHeader();
    }
  }

  /**
   * Método para hacer login con backend
   */
  loginWithCredentials(credentials: BackendLoginRequest): Observable<boolean> {
    return this.apiService.post<BackendAuthResponse>('/auth/login', credentials).pipe(
      map(response => {
        if (response.success && response.data && response.data.user && response.data.token) {
          // Guardar token
          localStorage.setItem(this.tokenKey, response.data.token);
          // Establecer header de autorización
          this.apiService.setAuthorizationHeader(response.data.token);
          // Actualizar estado
          this.setLoginState(true, response.data.user);
          return true;
        }
        return false;  
      }),
      tap(success => {
        if (success) {
          console.log('🔐 Usuario autenticado:', this.currentUserSubject.value);
        }
      }),
      catchError(error => {
        console.error('❌ Error en login:', error);
        return throwError(error);
      })
    );
  }

  /**
   * Método para registrar usuario
   */
  registerUser(userData: BackendRegisterRequest): Observable<boolean> {
    return this.apiService.post<BackendAuthResponse>('/auth/register', userData).pipe(
      map(response => {
        if (response.success) {
          console.log('📝 Usuario registrado exitosamente');
          return true;
        }
        return false;
      }),
      catchError(error => {
        console.error('❌ Error en registro:', error);
        return throwError(error);
      })
    );
  }

  /**
   * Método para hacer login (mantener compatibilidad con componente AuthComponent)
   */
  login(): void {
    this.setLoginState(true);
  }

  /**
   * Método para hacer logout
   */
  logout(): void {
    // Limpiar completamente el estado
    console.log('👋 Cerrando sesión...');
    this.setLoginState(false, null);
    console.log('✅ Sesión cerrada completamente');
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.isLogin;
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtiene el token actual
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Verifica si el usuario es propietario
   */
  isOwner(): boolean {
    return this.getCurrentUser()?.user_type === 'owner';
  }

  /**
   * Verifica si el usuario es inquilino
   */
  isTenant(): boolean {
    return this.getCurrentUser()?.user_type === 'tenant';
  }

  /**
   * Verifica si el usuario es administrador
   */
  isAdmin(): boolean {
    return this.getCurrentUser()?.user_type === 'admin';
  }

  /**
   * Decodifica el token JWT y retorna el payload
   */
  decodeToken(): any {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      // Un JWT tiene 3 partes separadas por puntos: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Token JWT malformado');
        return null;
      }

      // Decodificar la parte del payload (segunda parte)
      const payload = parts[1];
      // Agregar padding si es necesario
      const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
      const decodedPayload = atob(paddedPayload);
      
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Error al decodificar token JWT:', error);
      return null;
    }
  }

  /**
   * Obtiene información completa del token y usuario para debugging
   */
  getTokenInfo(): any {
    const token = this.getToken();
    const user = this.getCurrentUser();
    const decodedToken = this.decodeToken();

    return {
      hasToken: !!token,
      token: token,
      tokenLength: token ? token.length : 0,
      user: user,
      decodedToken: decodedToken,
      isAuthenticated: this.isAuthenticated(),
      isAdmin: this.isAdmin(),
      isOwner: this.isOwner(),
      isTenant: this.isTenant()
    };
  }

  /**
   * Obtiene el perfil del usuario desde el backend
   */
  getProfile(): Observable<{ success: boolean; user: User }> {
    return this.apiService.get<{ success: boolean; user: User }>('/auth/profile').pipe(
      tap(response => {
        if (response.success && response.user) {
          this.currentUserSubject.next(response.user);
        }
      }),
      catchError(error => {
        console.error('❌ Error al obtener perfil:', error);
        this.logout(); // Si hay error, cerrar sesión
        return throwError(error);
      })
    );
  }

  /**
   * Actualiza el perfil del usuario
   */
  updateProfile(userData: Partial<User>): Observable<boolean> {
    return this.apiService.put<BackendAuthResponse>('/auth/profile', userData).pipe(
      map(response => {
        if (response.success && response.data && response.data.user) {
          this.currentUserSubject.next(response.data.user);
          return true;
        }
        return false;
      }),
      catchError(error => {
        console.error('❌ Error al actualizar perfil:', error);
        return throwError(error);
      })
    );
  }

  /**
   * Cambia la contraseña del usuario
   */
  changePassword(oldPassword: string, newPassword: string): Observable<boolean> {
    const data = {
      old_password: oldPassword,
      new_password: newPassword
    };

    return this.apiService.put<BackendAuthResponse>('/auth/change-password', data).pipe(
      map(response => response.success),
      catchError(error => {
        console.error('❌ Error al cambiar contraseña:', error);
        return throwError(error);
      })
    );
  }

  /**
   * Inicializa el estado de autenticación desde localStorage
   */
  private initializeAuthState(): void {
    const savedLoginState = localStorage.getItem('auth_isLogin');
    const savedUser = localStorage.getItem(this.userKey);
    const savedToken = localStorage.getItem(this.tokenKey);

    if (savedLoginState === 'true' && savedUser && savedToken) {
      try {
        const user = JSON.parse(savedUser);
        this.apiService.setAuthorizationHeader(savedToken);
        this.setLoginState(true, user);
        
        // Verificar que el token sigue siendo válido
        this.getProfile().subscribe({
          next: () => {
            console.log('✅ Sesión restaurada exitosamente');
          },
          error: () => {
            console.log('⚠️ Token expirado, cerrando sesión');
            this.logout();
          }
        });
      } catch (error) {
        console.error('❌ Error al restaurar sesión:', error);
        this.logout();
      }
    }
  }

  /**
   * Método para obtener el estado actual como Promise (útil para guards)
   */
  async getAuthState(): Promise<boolean> {
    return this.isLogin;
  }

  /**
   * Método para alternar el estado de login (útil para testing)
   */
  toggleLogin(): void {
    this.setLoginState(!this.isLogin);
  }
}