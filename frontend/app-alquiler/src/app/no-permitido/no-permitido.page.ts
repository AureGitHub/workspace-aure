import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  shieldOutline, 
  homeOutline, 
  arrowBackOutline,
  alertCircleOutline,
  lockClosedOutline,
  personOutline
} from 'ionicons/icons';

// Imports de la librería compartida
import { AuthService } from 'shared-lib';

@Component({
  selector: 'app-no-permitido',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar color="danger">
        <ion-buttons slot="start">
          <ion-button (click)="goBack()">
            <ion-icon name="arrow-back-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Acceso Denegado</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="no-permitido-content">
      <!-- Error Section -->
      <div class="error-section">
        <ion-icon name="lock-closed-outline" class="error-icon"></ion-icon>
        <h1>Acceso No Permitido</h1>
        <p>No tienes permisos para acceder a esta sección</p>
      </div>

      <!-- Info Section -->
      <div class="info-section">
        <ion-card class="error-card">
          <ion-card-content>
            <ion-icon name="alert-circle-outline" color="warning" class="warning-icon"></ion-icon>
            <h2>Permisos Insuficientes</h2>
            <p>Esta sección requiere permisos de administrador para acceder.</p>
            
            <div class="user-info" *ngIf="currentUser">
              <h3>Tu información actual:</h3>
              <ion-list>
                <ion-item lines="none">
                  <ion-icon name="person-outline" slot="start" color="medium"></ion-icon>
                  <ion-label>
                    <h4>{{ currentUser.first_name }} {{ currentUser.last_name }}</h4>
                    <p>{{ currentUser.email }}</p>
                  </ion-label>
                </ion-item>
                
                <ion-item lines="none">
                  <ion-icon name="shield-outline" slot="start" color="medium"></ion-icon>
                  <ion-label>
                    <h4>Rol actual</h4>
                    <p><strong>{{ getUserRoleDisplay() }}</strong></p>
                  </ion-label>
                </ion-item>
              </ion-list>
            </div>

            <div class="required-info">
              <h3>Permisos requeridos:</h3>
              <ion-chip color="danger">
                <ion-icon name="shield-outline"></ion-icon>
                <ion-label>Administrador</ion-label>
              </ion-chip>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Actions Section -->
        <div class="actions-section">
          <ion-button expand="block" color="primary" (click)="goHome()">
            <ion-icon name="home-outline" slot="start"></ion-icon>
            Volver al Inicio
          </ion-button>
          
          <ion-button expand="block" fill="outline" color="medium" (click)="goBack()">
            <ion-icon name="arrow-back-outline" slot="start"></ion-icon>
            Página Anterior
          </ion-button>
        </div>

        <!-- Contact Info -->
        <ion-card class="contact-card">
          <ion-card-content>
            <h3>¿Necesitas acceso?</h3>
            <p>Si crees que deberías tener acceso a esta sección, contacta con el administrador del sistema.</p>
            <ion-button fill="clear" color="primary" (click)="showContactInfo()">
              Contactar Administrador
            </ion-button>
          </ion-card-content>
        </ion-card>
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
    .no-permitido-content {
      background: var(--ion-color-light);
    }

    .error-section {
      padding: 60px 20px 40px;
      text-align: center;
      color: white;
      background: linear-gradient(135deg, var(--ion-color-danger) 0%, var(--ion-color-danger-shade) 100%);
      margin-bottom: 20px;
    }

    .error-icon {
      font-size: 5rem;
      color: white;
      opacity: 0.8;
      margin-bottom: 20px;
    }

    .error-section h1 {
      font-size: 2.5rem;
      font-weight: bold;
      margin: 20px 0 16px;
    }

    .error-section p {
      font-size: 1.2rem;
      opacity: 0.9;
      margin: 0;
    }

    .info-section {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }

    .error-card {
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
    }

    .warning-icon {
      font-size: 2.5rem;
      display: block;
      margin: 0 auto 16px;
    }

    .error-card h2 {
      text-align: center;
      color: var(--ion-color-dark);
      margin-bottom: 16px;
      font-weight: 600;
    }

    .error-card p {
      text-align: center;
      color: var(--ion-color-medium);
      margin-bottom: 20px;
    }

    .user-info, .required-info {
      margin: 20px 0;
      padding: 16px;
      background: var(--ion-color-light-tint);
      border-radius: 12px;
    }

    .user-info h3, .required-info h3 {
      color: var(--ion-color-dark);
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 12px;
      text-align: left;
    }

    .required-info {
      text-align: center;
    }

    .actions-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin: 20px 0;
    }

    .contact-card {
      background: var(--ion-color-primary-tint);
      border-radius: 16px;
      margin-top: 20px;
    }

    .contact-card h3 {
      color: var(--ion-color-primary-shade);
      text-align: center;
      margin-bottom: 8px;
      font-weight: 600;
    }

    .contact-card p {
      color: var(--ion-color-primary-shade);
      opacity: 0.8;
      text-align: center;
      margin-bottom: 16px;
      font-size: 0.9rem;
    }

    .contact-card ion-button {
      display: block;
      margin: 0 auto;
    }

    ion-list {
      background: transparent;
    }

    ion-item {
      --background: transparent;
      --border-color: var(--ion-color-light-shade);
    }

    ion-item h4 {
      color: var(--ion-color-dark);
      font-weight: 600;
      margin-bottom: 4px;
    }

    ion-item p {
      color: var(--ion-color-medium);
      font-size: 0.9rem;
    }

    ion-chip {
      font-weight: 600;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .error-section {
        padding: 40px 20px 30px;
      }
      
      .error-section h1 {
        font-size: 2rem;
      }
      
      .error-icon {
        font-size: 4rem;
      }
      
      .info-section {
        padding: 16px;
      }
    }
  `]
})
export class NoPermitidoPage implements OnInit {
  currentUser: any = null;
  
  // Toast para mensajes
  showToast = false;
  toastMessage = '';
  toastColor = 'success';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    // Registrar iconos de Ionicons
    addIcons({
      'shield-outline': shieldOutline,
      'home-outline': homeOutline,
      'arrow-back-outline': arrowBackOutline,
      'alert-circle-outline': alertCircleOutline,
      'lock-closed-outline': lockClosedOutline,
      'person-outline': personOutline
    });
  }

  ngOnInit() {
    console.log('NoPermitido page loaded');
    
    // Obtener información del usuario actual
    this.currentUser = this.authService.getCurrentUser();
    
    console.log('🚫 Usuario sin permisos intentó acceder a sección protegida:', this.currentUser);
  }

  goBack() {
    // Usar window.history para ir a la página anterior
    window.history.back();
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  getUserRoleDisplay(): string {
    if (!this.currentUser) return 'No identificado';
    
    const roleMap: { [key: string]: string } = {
      'admin': 'Administrador',
      'owner': 'Propietario',
      'tenant': 'Inquilino'
    };
    
    return roleMap[this.currentUser.user_type] || this.currentUser.user_type;
  }

  showContactInfo() {
    this.showToastMessage('Contacta con el administrador: admin@alquilerzarza.com', 'primary');
  }

  private showToastMessage(message: string, color: string = 'success') {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
  }
}