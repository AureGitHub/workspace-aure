import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { arrowBack, personCircle, person, logIn, logOut, menu, close, mail, shieldCheckmark, codeOutline, copyOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { AuthComponent } from '../auth/auth.component';
import { LoginData, RegisterData, AuthResponse, BackendLoginRequest } from '../auth/auth.interfaces';

import { IonHeader, IonToolbar, IonButtons, IonMenuButton, IonButton, IonIcon, IonTitle, IonContent, IonModal, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonChip, IonItem, IonLabel } from '@ionic/angular/standalone';

export interface AppLayoutConfig {
  showHeader?: boolean;
  showFooter?: boolean;
  appName?: string;          // Nombre de la app (lado izquierdo)
  pageTitle?: string;        // Título de la página (centro)
  headerTitle?: string;      // Mantener por compatibilidad
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
    AuthComponent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonButton,
    IonIcon,
    IonTitle,
    IonContent,
    IonModal,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonChip,
    IonItem,
    IonLabel
],
  template: `
    <!-- Header -->     
    <ion-header *ngIf="config.showHeader" [translucent]="false">
  <ion-toolbar [color]="config.color" [style.background]="config.color">
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
          <div class="header-content">
            <!-- Nombre de la app (izquierda) -->
            <div class="app-name">
              {{ config.appName || config.headerTitle || 'Workspace Aure' }}
            </div>
            <!-- Título de la página (centro) -->
            <div class="page-title" *ngIf="config.pageTitle">
              {{ config.pageTitle }}
            </div>
          </div>
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
        <ion-toolbar [color]="isHtmlColor(config.color) ? null : (config.color || 'primary')" [style.background]="isHtmlColor(config.color) ? config.color : null">
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
         
        </div>
        <div class="footer-center">
          <ng-content select="[slot=footer-center]"></ng-content>
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
                  <ion-card-title>¡Bienvenido, Sesión Activa!</ion-card-title>
                  <ion-card-subtitle>Información del usuario</ion-card-subtitle>
                </ion-card-header>
                <ion-card-content>
                  <div *ngIf="currentUser" class="user-details">
                    <div class="user-info-item">
                      <ion-icon name="person" color="primary"></ion-icon>
                      <span class="info-label">Nombre:</span>
                      <span class="info-value">{{ currentUser.first_name }} {{ currentUser.last_name }}</span>
                    </div>
                    
                    <div class="user-info-item">
                      <ion-icon name="mail" color="secondary"></ion-icon>
                      <span class="info-label">Email:</span>
                      <span class="info-value">{{ currentUser.email }}</span>
                    </div>
                    
                    <div class="user-info-item">
                      <ion-icon name="shield-checkmark" [color]="getRoleColor(currentUser.user_type)"></ion-icon>
                      <span class="info-label">Rol:</span>
                      <ion-chip [color]="getRoleColor(currentUser.user_type)" class="role-chip">
                        {{ getRoleLabel(currentUser.user_type) }}
                      </ion-chip>
                    </div>
                  </div>
                  
                  <ion-button expand="block" color="danger" (click)="onLogout()" class="logout-button">
                    <ion-icon name="log-out" slot="start"></ion-icon>
                    Cerrar Sesión
                  </ion-button>
                </ion-card-content>
              </ion-card>

              <!-- Sección de Debug JWT -->
              <ion-card class="debug-card">
                <ion-card-header>
                  <ion-card-title>🛠️ Debug JWT Token</ion-card-title>
                  <ion-card-subtitle>Información técnica del token</ion-card-subtitle>
                </ion-card-header>
                <ion-card-content>
                  <ion-button 
                    expand="block" 
                    fill="outline" 
                    color="primary" 
                    (click)="toggleTokenInfo()">
                    <ion-icon name="code-outline" slot="start"></ion-icon>
                    {{ showTokenInfo ? 'Ocultar' : 'Mostrar' }} Token Info
                  </ion-button>
                  
                  <div *ngIf="showTokenInfo" class="token-info">
                    <ion-item lines="none">
                      <ion-label>
                        <h3>Estado de Autenticación</h3>
                        <p>Autenticado: <strong>{{ tokenInfo?.isAuthenticated ? 'Sí' : 'No' }}</strong></p>
                        <p>Rol Admin: <strong>{{ tokenInfo?.isAdmin ? 'Sí' : 'No' }}</strong></p>
                        <p>Token presente: <strong>{{ tokenInfo?.hasToken ? 'Sí' : 'No' }}</strong></p>
                        <p>Longitud token: <strong>{{ tokenInfo?.tokenLength || 0 }} chars</strong></p>
                      </ion-label>
                    </ion-item>

                    <ion-item lines="none" *ngIf="tokenInfo?.decodedToken">
                      <ion-label>
                        <h3>Datos del Token JWT</h3>
                        <p><strong>Email:</strong> {{ tokenInfo.decodedToken.email || 'N/A' }}</p>
                        <p><strong>User ID:</strong> {{ tokenInfo.decodedToken.user_id || tokenInfo.decodedToken.sub || 'N/A' }}</p>
                        <p><strong>Rol:</strong> {{ tokenInfo.decodedToken.user_type || 'N/A' }}</p>
                        <p><strong>Emitido:</strong> {{ formatDate(tokenInfo.decodedToken.iat) }}</p>
                        <p><strong>Expira:</strong> {{ formatDate(tokenInfo.decodedToken.exp) }}</p>
                      </ion-label>
                    </ion-item>

                    <ion-item lines="none">
                      <ion-label>
                        <h3>Token JWT (Primeros 100 chars)</h3>
                        <p class="token-preview">{{ getTokenPreview() }}</p>
                      </ion-label>
                    </ion-item>

                    <ion-button 
                      expand="block" 
                      fill="clear" 
                      size="small"
                      color="medium"
                      (click)="copyTokenToClipboard()">
                      <ion-icon name="copy-outline" slot="start"></ion-icon>
                      Copiar Token Completo
                    </ion-button>
                  </div>
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

    .header-content {
      display: flex;
      align-items: center;
      width: 100%;
      justify-content: space-between;
    }

    .app-name {
      font-size: 1.1rem;
      font-weight: 600;
      flex-shrink: 0;
    }

    .page-title {
      font-size: 0.95rem;
      font-weight: 400;
      opacity: 0.9;
      text-align: center;
      flex: 1;
      margin: 0 16px;
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

    .user-details {
      text-align: left;
      margin-bottom: 20px;
    }

    .user-info-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      gap: 8px;
    }

    .info-label {
      font-weight: 600;
      color: var(--ion-color-dark);
      min-width: 60px;
    }

    .info-value {
      flex: 1;
      color: var(--ion-color-medium);
    }

    .role-chip {
      font-size: 0.8rem;
      font-weight: 600;
    }

    .logout-button {
      margin-top: 20px;
    }

    /* Responsive modal */
    @media (max-width: 768px) {
      .user-profile-modal {
        height: 100vh;
      }
    }

    /* Estilos para debug del token */
    .debug-card {
      margin-top: 20px;
      border: 1px dashed var(--ion-color-medium);
    }

    .token-info {
      margin-top: 15px;
    }

    .token-info ion-item {
      --background: var(--ion-color-light);
      margin-bottom: 10px;
      border-radius: 8px;
    }

    .token-info h3 {
      color: var(--ion-color-primary);
      font-size: 0.9rem;
      margin-bottom: 8px;
    }

    .token-info p {
      font-size: 0.8rem;
      margin: 2px 0;
      line-height: 1.4;
    }

    .token-preview {
      font-family: 'Courier New', monospace;
      font-size: 0.7rem;
      word-break: break-all;
      background: var(--ion-color-light);
      padding: 8px;
      border-radius: 4px;
      border: 1px solid var(--ion-color-medium);
    }
  `]
})
export class AppLayoutComponent implements OnInit, OnDestroy {
  // Permite usar colores HTML personalizados en el header
  isHtmlColor(color: string | undefined): boolean {
    if (!color) return false;
    // Check for hex, rgb, rgba, hsl, hsla
    return /^#([A-Fa-f0-9]{3,8})$/.test(color)
        || /^rgb(a)?\(/.test(color)
        || /^hsl(a)?\(/.test(color);
  }
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
  currentUser: any = null;
  private authSubscription?: Subscription;
  private userSubscription?: Subscription;

  // Estado del debug de token
  showTokenInfo = false;
  tokenInfo: any = null;

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
      close,
      mail,
      'shield-checkmark': shieldCheckmark,
      'code-outline': codeOutline,
      'copy-outline': copyOutline
    });
  }

  ngOnInit() {
    // Obtener estado inicial inmediatamente
    this.isAuthenticated = this.authService.isLoggedIn();
    if (this.isAuthenticated) {
      this.currentUser = this.authService.getCurrentUser();
    }
    
    // Suscribirse al estado de autenticación para cambios futuros
    this.authSubscription = this.authService.isLogin$.subscribe(isLoggedIn => {
      this.isAuthenticated = isLoggedIn;
      if (!isLoggedIn) {
        this.currentUser = null;
      }
    });

    // Suscribirse específicamente a cambios en el usuario actual
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log('🔄 Usuario actualizado en layout:', user);
    });
  }

  ngOnDestroy() {
    // Limpiar suscripciones
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
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
          // Forzar actualización del usuario actual
          this.currentUser = this.authService.getCurrentUser();
          console.log('✅ Login exitoso, usuario actual:', this.currentUser);
          
          // Emitir el evento y cerrar modal
          this.authLogin.emit(this.currentUser);
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

  // Métodos para el manejo de roles
  getRoleColor(userType: string): string {
    switch (userType) {
      case 'admin': return 'danger';
      case 'owner': return 'warning';
      case 'tenant': return 'tertiary';
      default: return 'primary';
    }
  }

  getRoleLabel(userType: string): string {
    switch (userType) {
      case 'admin': return 'Administrador';
      case 'owner': return 'Propietario';
      case 'tenant': return 'Inquilino';
      default: return 'Usuario';
    }
  }

  // Métodos para el debug del token JWT
  toggleTokenInfo() {
    this.showTokenInfo = !this.showTokenInfo;
    if (this.showTokenInfo) {
      this.tokenInfo = this.authService.getTokenInfo();
      console.log('🛠️ Token Info:', this.tokenInfo);
    }
  }

  formatDate(timestamp: number): string {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleString('es-ES');
  }

  getTokenPreview(): string {
    const token = this.authService.getToken();
    if (!token) return 'No hay token';
    return token.substring(0, 100) + '...';
  }

  async copyTokenToClipboard() {
    const token = this.authService.getToken();
    if (!token) {
      console.log('No hay token para copiar');
      return;
    }

    try {
      await navigator.clipboard.writeText(token);
      console.log('✅ Token copiado al portapapeles');
      // Aquí podrías mostrar un toast de confirmación
    } catch (error) {
      console.error('❌ Error al copiar token:', error);
      // Fallback para navegadores más antiguos
      const textArea = document.createElement('textarea');
      textArea.value = token;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      console.log('✅ Token copiado al portapapeles (fallback)');
    }
  }
}