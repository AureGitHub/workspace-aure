import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
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
  personOutline
} from 'ionicons/icons';

// Imports de la librería compartida
import { AuthService, AppLayoutComponent, AppLayoutConfig } from 'shared-lib';

// Componente modal local
import { AuthModalComponent } from '../components/auth-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule, AppLayoutComponent],
  template: `
    <lib-app-layout 
      [config]="layoutConfig"
      (menuClick)="onMenuClick()"
      (backClick)="onBackClick()"
      (userProfileClick)="onUserProfileClick()">
      
      <!-- Acciones del header -->
      <div slot="header-actions">
        <ion-button color="light" fill="outline" size="small" (click)="goToUserManagement()">
          <ion-icon name="settings-outline" slot="start"></ion-icon>
          Gestión
        </ion-button>
      </div>

      <!-- Contenido principal -->
      <div class="app-alquiler-content">
        <!-- Header Hero Section -->
        <div class="hero-section">
          <div class="hero-content">
            <ion-icon name="home-outline" class="hero-icon"></ion-icon>
            <h1>Bienvenido a App Alquiler</h1>
            <p>La plataforma más completa para gestionar tus propiedades de alquiler</p>
          </div>
        </div>

        <!-- Features Section -->
        <div class="features-section">
          <ion-grid>
            <ion-row>
              <ion-col size="12" size-md="4">
                <ion-card class="feature-card">
                  <ion-card-content>
                    <ion-icon name="business-outline" color="primary" class="feature-icon"></ion-icon>
                    <h3>Gestión de Propiedades</h3>
                    <p>Administra todas tus propiedades desde un solo lugar</p>
                  </ion-card-content>
                </ion-card>
              </ion-col>
              
              <ion-col size="12" size-md="4">
                <ion-card class="feature-card">
                  <ion-card-content>
                    <ion-icon name="people-outline" color="secondary" class="feature-icon"></ion-icon>
                    <h3>Control de Inquilinos</h3>
                    <p>Gestiona contratos, pagos y comunicación con inquilinos</p>
                  </ion-card-content>
                </ion-card>
              </ion-col>
              
              <ion-col size="12" size-md="4">
                <ion-card class="feature-card">
                  <ion-card-content>
                    <ion-icon name="analytics-outline" color="tertiary" class="feature-icon"></ion-icon>
                    <h3>Reportes y Analytics</h3>
                    <p>Obtén insights detallados sobre tu negocio inmobiliario</p>
                  </ion-card-content>
                </ion-card>
              </ion-col>
            </ion-row>
          </ion-grid>
        </div>

        <!-- CTA Section -->
        <div class="cta-section">
          <ion-card class="cta-card">
            <ion-card-content class="cta-content">
              <h2>¿Listo para comenzar?</h2>
              <p>Únete a miles de propietarios que ya confían en nuestra plataforma</p>
              <div class="cta-buttons">
                <ion-button 
                  expand="block" 
                  color="primary" 
                  size="large"
                  (click)="goToAuth()">
                  <ion-icon name="log-in-outline" slot="start"></ion-icon>
                  Iniciar Sesión
                </ion-button>
                <ion-button 
                  expand="block" 
                  fill="outline" 
                  color="primary" 
                  size="large"
                  (click)="goToUserManagement()">
                  <ion-icon name="settings-outline" slot="start"></ion-icon>
                  Ver Gestión de Usuarios
                </ion-button>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Info Section -->
        <div class="info-section">
          <ion-list lines="none">
            <ion-item>
              <ion-icon name="checkmark-circle-outline" color="success" slot="start"></ion-icon>
              <ion-label>
                <h3>100% Seguro</h3>
                <p>Tus datos están protegidos con la mejor seguridad</p>
              </ion-label>
            </ion-item>
            
            <ion-item>
              <ion-icon name="phone-portrait-outline" color="primary" slot="start"></ion-icon>
              <ion-label>
                <h3>Multiplataforma</h3>
                <p>Accede desde cualquier dispositivo, en cualquier momento</p>
              </ion-label>
            </ion-item>
            
            <ion-item>
              <ion-icon name="headset-outline" color="secondary" slot="start"></ion-icon>
              <ion-label>
                <h3>Soporte 24/7</h3>
                <p>Nuestro equipo está aquí para ayudarte cuando lo necesites</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </div>
      </div>
      
      <!-- Footer center content -->
      <div slot="footer-center">
        <small>App Alquiler funcionando</small>
      </div>
      
      <!-- Footer actions -->
      <div slot="footer-actions">
        <small>v1.0.0</small>
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
      
    </lib-app-layout>
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
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 16px;
    }

    .feature-card h3 {
      color: var(--ion-color-dark);
      margin: 16px 0 8px;
      font-weight: 600;
    }

    .feature-card p {
      color: var(--ion-color-medium);
      line-height: 1.5;
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
  private authSubscription?: Subscription;

  // Configuración del layout
  layoutConfig: AppLayoutConfig = {
    showHeader: true,
    showFooter: true,
    headerTitle: 'App Alquiler',
    headerSubtitle: 'Gestión de propiedades de alquiler',
    footerText: 'App Alquiler © 2025',
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
    private modalController: ModalController
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
      'person-outline': personOutline
    });
  }

  ngOnInit() {
    console.log('Home page loaded');
    this.checkAuthentication();
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private checkAuthentication() {
    // Suscribirse a cambios en el estado de autenticación
    this.authSubscription = this.authService.isLogin$.subscribe(isLoggedIn => {
      this.isAuthenticated = isLoggedIn;
    });
  }

  // Método para abrir el modal de autenticación
  async openAuthModal() {
    if (this.isAuthenticated) {
      // Si ya está autenticado, ir directamente a user management
      this.goToUserManagement();
    } else {
      // Si no está autenticado, abrir modal de login
      const modal = await this.modalController.create({
        component: AuthModalComponent,
        backdropDismiss: true,
        showBackdrop: true
      });

      // Manejar respuesta del modal
      modal.onDidDismiss().then((result) => {
        if (result.data?.success) {
          this.showToastMessage(result.data.message, 'success');
          if (result.data.user) {
            // Si el login fue exitoso, navegar a user management
            this.goToUserManagement();
          }
        } else if (result.data?.message) {
          this.showToastMessage(result.data.message, 'warning');
        }
      });

      await modal.present();
    }
  }



  goToAuth() {
    this.openAuthModal();
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
}
