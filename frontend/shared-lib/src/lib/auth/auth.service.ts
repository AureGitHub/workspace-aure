import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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

  constructor() {
    // Inicializar el estado desde localStorage si existe
    this.initializeAuthState();
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
  private setLoginState(isLoggedIn: boolean): void {
    this.isLoginSubject.next(isLoggedIn);
    this.isLoggedIn.set(isLoggedIn);
    
    // Persistir en localStorage
    if (isLoggedIn) {
      localStorage.setItem('auth_isLogin', 'true');
    } else {
      localStorage.removeItem('auth_isLogin');
    }
  }

  /**
   * Método para hacer login
   */
  login(): void {
    this.setLoginState(true);
  }

  /**
   * Método para hacer logout
   */
  logout(): void {
    this.setLoginState(false);
    // Limpiar otros datos de autenticación si los hay
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.isLogin;
  }

  /**
   * Inicializa el estado de autenticación desde localStorage
   */
  private initializeAuthState(): void {
    const savedLoginState = localStorage.getItem('auth_isLogin');
    const isLoggedIn = savedLoginState === 'true';
    this.setLoginState(isLoggedIn);
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