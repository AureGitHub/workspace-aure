import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService, User, LoginRequest, RegisterRequest } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private apiService: ApiService) {
    // Verificar si hay un token al inicializar el servicio
    this.checkAuthenticationStatus();
  }

  private checkAuthenticationStatus(): void {
    if (this.apiService.isAuthenticated()) {
      // Si hay token, intentar obtener el perfil del usuario
      this.loadUserProfile();
    }
  }

  private loadUserProfile(): void {
    this.apiService.getProfile().subscribe({
      next: (response) => {
        if (response.success && response.user) {
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
        } else {
          this.logout(); // Token inválido
        }
      },
      error: () => {
        this.logout(); // Error al obtener perfil
      }
    });
  }

  login(credentials: LoginRequest): Observable<boolean> {
    return this.apiService.login(credentials).pipe(
      map(response => {
        if (response.success && response.user) {
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
          return true;
        }
        return false;
      }),
      tap(success => {
        if (success) {
          console.log('🔐 Usuario autenticado:', this.currentUserSubject.value);
        }
      })
    );
  }

  register(userData: RegisterRequest): Observable<boolean> {
    return this.apiService.register(userData).pipe(
      map(response => {
        if (response.success) {
          console.log('📝 Usuario registrado exitosamente');
          return true;
        }
        return false;
      })
    );
  }

  logout(): void {
    this.apiService.logout();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    console.log('👋 Sesión cerrada');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  isOwner(): boolean {
    const user = this.getCurrentUser();
    return user?.user_type === 'owner';
  }

  isTenant(): boolean {
    const user = this.getCurrentUser();
    return user?.user_type === 'tenant';
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.user_type === 'admin';
  }

  updateProfile(userData: Partial<User>): Observable<boolean> {
    return this.apiService.updateProfile(userData).pipe(
      map(response => {
        if (response.success && response.user) {
          this.currentUserSubject.next(response.user);
          return true;
        }
        return false;
      })
    );
  }

  changePassword(oldPassword: string, newPassword: string): Observable<boolean> {
    return this.apiService.changePassword(oldPassword, newPassword).pipe(
      map(response => response.success)
    );
  }
}