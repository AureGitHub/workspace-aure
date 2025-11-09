import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { 
  homeOutline, 
  businessOutline, 
  peopleOutline, 
  analyticsOutline, 
  logInOutline, 
  settingsOutline,
  checkmarkCircleOutline,
  phonePortraitOutline,
  headsetOutline,
  personOutline,
  cardOutline
} from 'ionicons/icons';

// Imports de la librería compartida
import { AuthService, AppLayoutComponent, AppLayoutConfig } from 'shared-lib';

// Import del servicio de título
import { PageTitleService } from '../services/page-title.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <!-- Contenido principal -->
    <ion-content class="app-alquiler-content">
        <!-- Header Hero Section -->
        <div class="hero-section">
          <div class="hero-content">
            <ion-icon name="home-outline" class="hero-icon"></ion-icon>
            <h1>Bienvenido a Alquiler ZarZa</h1>
            <p>La plataforma más completa para gestionar los alquileres de Felipe</p>
          </div>
        </div>

        <!-- Features Section -->
        <div class="features-section" *ngIf="isAuthenticated">
          <ion-grid>
            <ion-row class="ion-justify-content-center">
              <ion-col size="12" size-md="4">
                <ion-card class="feature-card" (click)="onPropertyManagementClick()">
                  <ion-card-content>
                    <ion-icon name="business-outline" color="primary" class="feature-icon"></ion-icon>
                    <h3>Gestión de Propiedades</h3>
                    <p>Administra todas tus propiedades desde un solo lugar</p>
                  </ion-card-content>
                </ion-card>
              </ion-col>
              
              <ion-col size="12" size-md="4">
                <ion-card class="feature-card" (click)="onRentalManagementClick()">
                  <ion-card-content>
                    <ion-icon name="card-outline" color="tertiary" class="feature-icon"></ion-icon>
                    <h3>Gestión de alquileres</h3>
                    <p>Controla todos los contratos y pagos de alquiler</p>
                  </ion-card-content>
                </ion-card>
              </ion-col>
              
              <ion-col size="12" size-md="4" *ngIf="isAdmin">
                <ion-card class="feature-card" (click)="onUserManagementClick()">
                  <ion-card-content>
                    <ion-icon name="people-outline" color="secondary" class="feature-icon"></ion-icon>
                    <h3>Control de usuarios</h3>
                    <p>Usuarios con acceso a la app</p>
                  </ion-card-content>
                </ion-card>
              </ion-col>
            </ion-row>
          </ion-grid>
        </div>

        <!-- Debug section - TEMPORAL -->
        <div style="padding: 20px; background: #f0f0f0; margin: 20px;">
          <h4>Debug Autenticación</h4>
          <ion-button color="primary" (click)="debugLogin()">Login de Prueba</ion-button>
          <ion-button color="secondary" (click)="debugLogout()">Logout</ion-button>
          <ion-button color="tertiary" (click)="debugCheckState()">Ver Estado</ion-button>
          <p><strong>Estado:</strong> {{ isAuthenticated ? 'Logueado' : 'No logueado' }}</p>
          <p><strong>Es Admin:</strong> {{ isAdmin ? 'Sí' : 'No' }}</p>
        </div>
        
        <!-- Toast para mensajes -->
        <ion-toast 
          [isOpen]="showToast"
          [message]="toastMessage"
          [duration]="3000"
          [color]="toastColor"
          position="bottom"
          (didDismiss)="showToast = false">
        </ion-toast>
    </ion-content>
  `,
  styles: [`
    .app-alquiler-content {
      background: var(--ion-color-light);
    }

    .hero-section {
      padding: 40px 20px;
      text-align: center;
      color: white;
      background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-secondary) 100%);
      border-radius: 16px;
      margin-bottom: 20px;
    }

    .hero-content h1 {
      font-size: 2.5rem;
      font-weight: bold;
      margin: 20px 0;
    }

    .hero-content p {
      font-size: 1.2rem;
      opacity: 0.9;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }

    .hero-icon {
      font-size: 4rem;
      color: white;
    }

    .features-section {
      padding: 40px 20px;
      background: white;
    }

    .feature-card {
      text-align: center;
      margin: 10px 0;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      background: var(--ion-color-light-tint);
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 16px;
      transition: all 0.3s ease;
    }

    .feature-card:hover .feature-icon {
      transform: scale(1.1);
      filter: brightness(1.2);
    }

    .feature-card h3 {
      color: var(--ion-color-dark);
      margin: 16px 0 8px;
      font-weight: 600;
      transition: color 0.3s ease;
    }

    .feature-card p {
      color: var(--ion-color-medium);
      line-height: 1.5;
      transition: color 0.3s ease;
    }

    .feature-card:hover h3 {
      color: var(--ion-color-primary);
    }

    .feature-card:hover p {
      color: var(--ion-color-dark);
    }

    .cta-section {
      padding: 40px 20px;
      background: var(--ion-color-light);
    }

    .cta-card {
      border-radius: 16px;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    }

    .cta-content {
      text-align: center;
      padding: 40px 20px;
    }

    .cta-content h2 {
      color: var(--ion-color-dark);
      margin-bottom: 16px;
      font-weight: 600;
    }

    .cta-content p {
      color: var(--ion-color-medium);
      margin-bottom: 30px;
      font-size: 1.1rem;
    }

    .cta-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 300px;
      margin: 0 auto;
    }

    .info-section {
      padding: 40px 20px;
      background: white;
    }

    .info-section ion-item {
      --padding-start: 20px;
      --inner-padding-end: 20px;
      margin: 10px 0;
      border-radius: 12px;
      --background: var(--ion-color-light);
    }

    .info-section h3 {
      color: var(--ion-color-dark);
      font-weight: 600;
      margin-bottom: 4px;
    }

    .info-section p {
      color: var(--ion-color-medium);
      font-size: 0.9rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .hero-content h1 {
        font-size: 2rem;
      }
      
      .hero-content p {
        font-size: 1rem;
      }
      
      .cta-buttons {
        max-width: 100%;
      }
    }
  `]
})
export class HomePage implements OnInit, OnDestroy {
  // Estado de autenticación
  isAuthenticated = false;
  isAdmin = false;
  private authSubscription?: Subscription;
  private userSubscription?: Subscription;

  // Configuración del layout
  layoutConfig: AppLayoutConfig = {
    showHeader: true,
    showFooter: true,
    headerTitle: 'Alquiler ZarZa',
    headerSubtitle: 'Gestión de propiedades de alquiler',
    footerText: 'Alquiler ZarZa © 2025',
    showBackButton: false,
    showMenuButton: false,
    showUserProfile: true,
    color: 'primary'
  };

  // Toast para mensajes
  showToast = false;
  toastMessage = '';
  toastColor = 'success';

  constructor(
    private router: Router,
    private authService: AuthService,
    private pageTitleService: PageTitleService
  ) {
    // Registrar iconos de Ionicons
    addIcons({
      'home-outline': homeOutline,
      'business-outline': businessOutline,
      'people-outline': peopleOutline,
      'analytics-outline': analyticsOutline,
      'log-in-outline': logInOutline,
      'settings-outline': settingsOutline,
      'checkmark-circle-outline': checkmarkCircleOutline,
      'phone-portrait-outline': phonePortraitOutline,
      'headset-outline': headsetOutline,
      'person-outline': personOutline,
      'card-outline': cardOutline
    });
  }

  ngOnInit() {
    console.log('Home page loaded');
    
    // Para home limpiamos el título de página (solo queda el nombre de la app)
    this.pageTitleService.clearTitle();
    
    // Obtener estado inicial inmediatamente
    this.isAuthenticated = this.authService.isLoggedIn();
    this.isAdmin = this.isAuthenticated ? this.authService.isAdmin() : false;
    
    const currentUser = this.authService.getCurrentUser();
    console.log('🏠 Estado inicial home - isAuthenticated:', this.isAuthenticated, 'isAdmin:', this.isAdmin, 'user:', currentUser);
    
    this.checkAuthentication();
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private checkAuthentication() {
    // Suscribirse a cambios en el estado de autenticación
    this.authSubscription = this.authService.isLogin$.subscribe(isLoggedIn => {
      this.isAuthenticated = isLoggedIn;
      
      // Verificar si el usuario es admin usando el método del servicio
      this.isAdmin = isLoggedIn ? this.authService.isAdmin() : false;
      console.log('🔐 Estado auth actualizado - isAuthenticated:', this.isAuthenticated, 'isAdmin:', this.isAdmin);
    });

    // Suscribirse también a cambios del usuario actual
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      // Recalcular isAdmin cuando cambie el usuario
      this.isAdmin = user ? this.authService.isAdmin() : false;
      console.log('👤 Usuario actualizado en home - user:', user, 'isAdmin:', this.isAdmin);
    });
  }

  goToAuth() {
    if (this.isAuthenticated) {
      // Si ya está autenticado, ir directamente a user management
      this.goToUserManagement();
    } else {
      // Si no está autenticado, el AppLayoutComponent manejará la autenticación
      this.showToastMessage('Por favor, inicia sesión usando el botón de perfil en el header', 'primary');
    }
  }

  goToUserManagement() {
    this.router.navigate(['/user-management']);
  }

  // Métodos para el layout compartido
  onMenuClick() {
    this.showToastMessage('Menú clickeado', 'primary');
  }

  onBackClick() {
    // No usado ya que showBackButton está en false
  }

  onUserProfileClick() {
    // El layout compartido ya maneja la autenticación
    this.showToastMessage('Perfil de usuario clickeado', 'secondary');
  }

  private showToastMessage(message: string, color: string = 'success') {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
  }

  // Métodos para navegación de las feature cards
  onPropertyManagementClick() {
    // TODO: Navegar a gestión de propiedades
    this.showToastMessage('Próximamente: Gestión de Propiedades', 'primary');
  }

  onRentalManagementClick() {
    // TODO: Navegar a gestión de alquileres
    this.showToastMessage('Próximamente: Gestión de Alquileres', 'tertiary');
  }

  onUserManagementClick() {
    // Navegar a control-usuario (el guard se encargará de la seguridad)
    this.router.navigate(['/control-usuario']);
  }

  // Métodos de debug - TEMPORAL
  debugLogin() {
    console.log('🧪 Simulando login de prueba...');
    
    // Simular datos de usuario
    const mockUser = {
      id: 1,
      first_name: 'Admin',
      last_name: 'Test',
      email: 'admin@test.com',
      user_type: 'admin' as const,
      created_at: new Date().toISOString()
    };

    // Simular token
    const mockToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjEsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJ1c2VyX3R5cGUiOiJhZG1pbiIsImV4cCI6MTczMTIzNDAwMH0.test';

    // Establecer directamente en localStorage
    localStorage.setItem('auth_isLogin', 'true');
    localStorage.setItem('auth_token', mockToken);
    localStorage.setItem('auth_user', JSON.stringify(mockUser));

    // Llamar login en el servicio
    this.authService.login();
    
    // Actualizar estado local
    this.isAuthenticated = this.authService.isLoggedIn();
    this.isAdmin = this.isAuthenticated ? this.authService.isAdmin() : false;
    
    console.log('✅ Login de prueba completado');
    this.showToastMessage('Login de prueba realizado', 'success');
  }

  debugLogout() {
    console.log('🧪 Haciendo logout...');
    this.authService.logout();
    this.isAuthenticated = this.authService.isLoggedIn();
    this.isAdmin = this.isAuthenticated ? this.authService.isAdmin() : false;
    console.log('✅ Logout completado');
    this.showToastMessage('Logout realizado', 'warning');
  }

  debugCheckState() {
    console.log('🧪 Verificando estado actual...');
    console.log('💾 localStorage:', {
      auth_isLogin: localStorage.getItem('auth_isLogin'),
      auth_token: localStorage.getItem('auth_token'),
      auth_user: localStorage.getItem('auth_user')
    });
    console.log('🔐 AuthService:', {
      isAuthenticated: this.authService.isAuthenticated(),
      currentUser: this.authService.getCurrentUser(),
      hasToken: !!this.authService.getToken(),
      isAdmin: this.authService.isAdmin()
    });
    this.showToastMessage('Ver consola para detalles del estado', 'primary');
  }

}
