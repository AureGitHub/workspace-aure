import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBack, personCircle, person, logIn, logOut, menu, close } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { AuthComponent } from '../auth/auth.component';
import { LoginData, RegisterData, AuthResponse, BackendLoginRequest } from '../auth/auth.interfaces';

export interface AppLayoutConfig {
  showHeader?: boolean;
  showFooter?: boolean;
  headerTitle?: string;
  headerSubtitle?: string;
  footerText?: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  showUserProfile?: boolean;
  color?: string;
}

@Component({
  selector: 'lib-app-layout',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    AuthComponent
  ],
  template: `
    <!-- Header -->
    <ion-header *ngIf="config.showHeader" [translucent]="false">
      <ion-toolbar [color]="config.color || 'primary'">
        <ion-buttons slot="start">
          <ion-menu-button 
            *ngIf="config.showMenuButton"
            (click)="onMenuClick()">
          </ion-menu-button>
          <ion-button 
            *ngIf="config.showBackButton"
            fill="clear"
            (click)="onBackClick()">
            <ion-icon name="arrow-back" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
        
        <ion-title>
          {{ config.headerTitle || 'Workspace Aure' }}
          <p *ngIf="config.headerSubtitle" class="header-subtitle">
            {{ config.headerSubtitle }}
          </p>
        </ion-title>
        
        <ion-buttons slot="end">
          <ion-button 
            *ngIf="config.showUserProfile"
            fill="clear"
            (click)="onUserProfileClick()"
            [color]="isAuthenticated ? 'light' : 'medium'">
            <ion-icon 
              [name]="getUserIcon()" 
              slot="icon-only"
              [style.opacity]="isAuthenticated ? '1' : '0.5'"
              [color]="isAuthenticated ? 'light' : 'medium'">
            </ion-icon>
          </ion-button>
          <ng-content select="[slot=header-actions]"></ng-content>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <!-- Main Content -->
    <ion-content [fullscreen]="false" [class.has-footer]="config.showFooter">
      <ion-header collapse="condense" *ngIf="config.showHeader">
        <ion-toolbar [color]="config.color || 'primary'">
          <ion-title size="large">{{ config.headerTitle }}</ion-title>
        </ion-toolbar>
      </ion-header>
      
      <div class="main-content">
        <ng-content></ng-content>
      </div>
    </ion-content>

    <!-- Footer fijo en la parte inferior -->
    <div class="custom-footer" *ngIf="config.showFooter">
      <div class="footer-content">
        <div class="footer-left">
          <span class="footer-text">
            {{ config.footerText || 'Workspace Aure © 2025' }}
          </span>
        </div>
        <div class="footer-center">
          <ng-content select="[slot=footer-center]"></ng-content>
        </div>
        <div class="footer-right">
          <ng-content select="[slot=footer-actions]"></ng-content>
        </div>
      </div>
    </div>

    <!-- Modal de Autenticación -->
    <ion-modal 
      [isOpen]="showAuthModal" 
      (didDismiss)="closeAuthModal()">
      <ng-template>
        <!-- Modal para usuario autenticado (Perfil) -->
        <div *ngIf="isAuthenticated" class="user-profile-modal">
          <ion-header>
            <ion-toolbar color="primary">
              <ion-title>Mi Perfil</ion-title>
              <ion-buttons slot="end">
                <ion-button fill="clear" (click)="closeAuthModal()">
                  <ion-icon name="close"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          
          <ion-content class="profile-content">
            <div class="user-profile">
              <ion-card>
                <ion-card-header>
                  <ion-card-title>¡Bienvenido!</ion-card-title>
                  <ion-card-subtitle>Sesión activa</ion-card-subtitle>
                </ion-card-header>
                <ion-card-content>
                  <p>Has iniciado sesión correctamente.</p>
                  <ion-button expand="block" color="danger" (click)="onLogout()">
                    <ion-icon name="log-out" slot="start"></ion-icon>
                    Cerrar Sesión
                  </ion-button>
                </ion-card-content>
              </ion-card>
            </div>
          </ion-content>
        </div>
        
        <!-- Componente de Autenticación como Modal completo -->
        <lib-auth 
          #authComponent
          *ngIf="!isAuthenticated"
          [config]="authConfig"
          (login)="onAuthLogin($event)"
          (register)="onAuthRegister($event)"
          (forgotPassword)="onAuthForgotPassword($event)"
          (socialLogin)="onAuthSocialLogin($event)"
          (close)="closeAuthModal()">
        </lib-auth>
      </ng-template>
    </ion-modal>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      position: relative;
    }

    .header-subtitle {
      margin: 0.25rem 0 0 0;
      font-size: 0.875rem;
      opacity: 0.9;
      font-weight: 300;
    }

    ion-content {
      --padding-start: 0;
      --padding-end: 0;
      --padding-top: 20px;
      --padding-bottom: 0;
    }

    ion-content.has-footer {
      --padding-bottom: 70px;
    }

    .main-content {
      padding: 1rem;
      padding-top: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      min-height: calc(100vh - 200px);
    }

    .custom-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: var(--ion-color-dark, #222428);
      color: var(--ion-color-dark-contrast, #ffffff);
      border-top: 1px solid var(--ion-color-medium-shade, #92949c);
      min-height: 56px;
      display: flex;
      align-items: center;
      box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    }



    .footer-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 1rem;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
    }

    .footer-left {
      display: flex;
      align-items: center;
    }

    .footer-text {
      font-size: 0.875rem;
      color: var(--ion-color-light, #f4f5f8);
    }

    .footer-center {
      flex: 1;
      display: flex;
      justify-content: center;
    }

    .footer-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .main-content {
        padding: 0.75rem;
      }

      .footer-content {
        flex-direction: column;
        gap: 0.5rem;
        text-align: center;
        padding: 0.75rem;
      }

      .footer-center,
      .footer-right {
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .header-subtitle {
        font-size: 0.75rem;
      }

      .main-content {
        padding: 0.5rem;
      }
    }

    /* Estilos del modal de perfil de usuario */
    .user-profile-modal {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .profile-content {
      flex: 1;
      --padding-start: 0;
      --padding-end: 0;
      --padding-top: 0;
      --padding-bottom: 0;
    }

    .user-profile {
      padding: 1rem;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
    }

    .user-profile ion-card {
      width: 100%;
      max-width: 400px;
      text-align: center;
    }

    /* Responsive modal */
    @media (max-width: 768px) {
      .user-profile-modal {
        height: 100vh;
      }
    }
  `]
})
export class AppLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('authComponent') authComponent?: AuthComponent;

  @Input() config: AppLayoutConfig = {
    showHeader: true,
    showFooter: true,
    headerTitle: 'Workspace Aure',
    headerSubtitle: '',
    footerText: 'Workspace Aure © 2025',
    showBackButton: false,
    showMenuButton: true,
    showUserProfile: true
  };

  @Output() menuClick = new EventEmitter<void>();
  @Output() backClick = new EventEmitter<void>();
  @Output() userProfileClick = new EventEmitter<void>();
  @Output() authLogin = new EventEmitter<LoginData>();
  @Output() authRegister = new EventEmitter<RegisterData>();

  // Estado de autenticación
  isAuthenticated = false;
  showAuthModal = false;
  private authSubscription?: Subscription;

  // Configuración del componente de autenticación
  authConfig = {
    showLogo: false,
    title: 'Acceder a tu cuenta',
    subtitle: 'Inicia sesión o crea una cuenta nueva',
    allowRegistration: true,
    allowForgotPassword: true,
    allowRememberMe: true,
    allowSocialLogin: false,
    minPasswordLength: 6,
    requireStrongPassword: false
  };

  constructor(private authService: AuthService) {
    // Registrar los iconos que vamos a usar
    addIcons({ 
      arrowBack, 
      personCircle, 
      person,
      'log-in': logIn,
      'log-out': logOut,
      menu,
      close
    });
  }

  ngOnInit() {
    // Obtener estado inicial inmediatamente
    this.isAuthenticated = this.authService.isLoggedIn();
    
    // Suscribirse al estado de autenticación para cambios futuros
    this.authSubscription = this.authService.isLogin$.subscribe(isLoggedIn => {
      this.isAuthenticated = isLoggedIn;
    });
  }

  ngOnDestroy() {
    // Limpiar suscripciones
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  onMenuClick() {
    this.menuClick.emit();
  }

  onBackClick() {
    this.backClick.emit();
  }

  onUserProfileClick() {
    // Abrir el modal de autenticación
    this.showAuthModal = true;
    this.userProfileClick.emit();
  }

  // Métodos para el icono de usuario
  getUserIcon(): string {
    if (this.isAuthenticated) {
      return 'person-circle';
    } else {
      return 'log-in';
    }
  }

  // Métodos del modal
  closeAuthModal() {
    this.showAuthModal = false;
  }

  // Métodos de autenticación
  onAuthLogin(loginData: LoginData) {
    // Usar el método que se conecta al backend
    const loginRequest: BackendLoginRequest = {
      email: loginData.email,
      password: loginData.password
    };

    this.authService.loginWithCredentials(loginRequest).subscribe({
      next: (success) => {
        if (success) {
          // El AuthService ya actualizó su estado interno
          // Solo emitir el evento y cerrar modal
          this.authLogin.emit(loginData);
          // Cerrar modal después de un breve delay
          setTimeout(() => {
            this.closeAuthModal();
          }, 1000);
        } else {
          // Desbloquear el AuthComponent y mostrar error
          if (this.authComponent) {
            this.authComponent.setLoading(false);
            this.authComponent.handleAuthResponse({
              success: false,
              message: 'Credenciales inválidas: Email o contraseña incorrectos',
              error: {
                code: 'INVALID_CREDENTIALS',
                message: 'Email o contraseña incorrectos'
                // No especificamos 'field' para evitar conflictos con validación
              }
            });
          }
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        // Desbloquear el AuthComponent y mostrar error
        if (this.authComponent) {
          this.authComponent.setLoading(false);
          this.authComponent.handleAuthResponse({
            success: false,
            message: error.message || 'Error de conexión con el servidor',
            error: {
              code: 'CONNECTION_ERROR',
              message: error.message || 'No se pudo conectar con el servidor'
              // No especificamos 'field' para evitar conflictos con validación
            }
          });
        }
      }
    });
  }

  onAuthRegister(registerData: RegisterData) {
    // Simular registro exitoso
    this.authService.login();
    this.authRegister.emit(registerData);
    
    // Cerrar modal después de un breve delay
    setTimeout(() => {
      this.closeAuthModal();
    }, 1000);
  }

  onAuthForgotPassword(data: { email: string }) {
    console.log('Forgot password for:', data.email);
    // Aquí puedes emitir un evento o manejar la lógica
  }

  onAuthSocialLogin(data: { provider: string }) {
    console.log('Social login with:', data.provider);
    // Simular login social exitoso
    this.authService.login();
    
    // Cerrar modal después de un breve delay
    setTimeout(() => {
      this.closeAuthModal();
    }, 1000);
  }

  onLogout() {
    this.authService.logout();
    this.closeAuthModal();
  }
}