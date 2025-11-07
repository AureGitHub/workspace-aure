import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

// Imports de la librería compartida
import { AuthService, AuthComponent, AuthConfig, AuthResponse, LoginData, RegisterData } from 'shared-lib';

// Services locales
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, AuthComponent],
  template: `
    <lib-auth
      #authComponent
      [config]="config"
      (login)="onLogin($event)"
      (register)="onRegister($event)"
      (forgotPassword)="onForgotPassword($event)"
      (close)="onClose()">
    </lib-auth>

    <!-- Toast para errores -->
    <ion-toast 
      [isOpen]="showErrorToast"
      [message]="errorMessage"
      [duration]="4000"
      color="danger"
      position="top"
      (didDismiss)="showErrorToast = false">
    </ion-toast>
  `
})
export class AuthModalComponent implements OnInit {
  @ViewChild('authComponent') authComponent!: any;

  config: AuthConfig = {
    showLogo: false,
    title: 'Bienvenido',
    subtitle: 'Inicia sesión para acceder a todas las funcionalidades',
    color: 'primary',
    allowRegistration: true,
    allowForgotPassword: true,
    allowRememberMe: true,
    minPasswordLength: 6
  };

  // Error handling
  showErrorToast = false;
  errorMessage = '';

  constructor(
    private modalController: ModalController,
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit() {}

  async onLogin(loginData: LoginData) {
    try {
      // Llamar al API real del backend app-alquiler
      const response = await this.apiService.login({
        email: loginData.email,
        password: loginData.password
      }).toPromise();

      if (response?.success) {
        // Actualizar el estado de autenticación en el servicio compartido
        this.authService.login();
        
        // Cerrar modal y retornar datos de éxito
        this.modalController.dismiss({
          success: true,
          message: 'Inicio de sesión exitoso',
          user: response.user
        });
      } else {
        // Mostrar error en el AuthComponent
        this.showError(response?.message || 'Error en el inicio de sesión');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Mejorar el manejo de errores basado en el tipo de error
      let errorMessage = 'Error en el inicio de sesión';
      
      if (error.status === 401) {
        // Error de credenciales incorrectas
        errorMessage = 'Email o contraseña incorrectos';
      } else if (error.status === 400) {
        // Error de validación
        errorMessage = 'Por favor, verifica que todos los campos estén completos';
      } else if (error.status === 500) {
        // Error del servidor
        if (error.error?.code === 'SERVICE_ERROR') {
          errorMessage = 'Servicio de autenticación temporalmente no disponible. Inténtalo más tarde.';
        } else {
          errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
        }
      } else if (error.status === 0 || !navigator.onLine) {
        // Error de conexión
        errorMessage = 'Sin conexión al servidor. Verifica tu conexión a internet.';
      } else if (error.error?.message) {
        // Usar el mensaje específico del servidor si está disponible
        errorMessage = error.error.message;
      }
      
      this.showError(errorMessage);
    }
  }

  async onRegister(registerData: RegisterData) {
    try {
      // Llamar al API de registro
      const response = await this.apiService.register({
        username: registerData.email.split('@')[0], // Usar parte del email como username
        email: registerData.email,
        password: registerData.password,
        first_name: registerData.firstName,
        last_name: registerData.lastName
      }).toPromise();

      if (response?.success) {
        // Mostrar mensaje de éxito
        this.modalController.dismiss({
          success: true,
          message: 'Registro exitoso. Ahora puedes iniciar sesión'
        });
      } else {
        this.showError(response?.message || 'Error en el registro');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      
      // Mejorar el manejo de errores para registro
      let errorMessage = 'Error en el registro';
      
      if (error.status === 400) {
        // Error de validación
        if (error.error?.message?.includes('email')) {
          errorMessage = 'El email ya está registrado o tiene un formato inválido';
        } else if (error.error?.message?.includes('password')) {
          errorMessage = 'La contraseña no cumple con los requisitos mínimos';
        } else {
          errorMessage = 'Por favor, verifica que todos los campos estén completos y sean válidos';
        }
      } else if (error.status === 409) {
        // Conflicto - usuario ya existe
        errorMessage = 'Este email ya está registrado. Intenta iniciar sesión en su lugar.';
      } else if (error.status === 500) {
        // Error del servidor
        errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
      } else if (error.status === 0 || !navigator.onLine) {
        // Error de conexión
        errorMessage = 'Sin conexión al servidor. Verifica tu conexión a internet.';
      } else if (error.error?.message) {
        // Usar el mensaje específico del servidor si está disponible
        errorMessage = error.error.message;
      }
      
      this.showError(errorMessage);
    }
  }

  async onForgotPassword(data: { email: string }) {
    // Mostrar mensaje de funcionalidad próximamente
    this.modalController.dismiss({
      success: false,
      message: 'Funcionalidad de recuperación de contraseña próximamente'
    });
  }

  onClose() {
    this.modalController.dismiss({
      success: false,
      message: 'Modal cerrado por el usuario'
    });
  }

  private showError(message: string) {
    // Mostrar error en toast
    this.errorMessage = message;
    this.showErrorToast = true;
    
    // También resetear el estado de loading del AuthComponent
    if (this.authComponent) {
      this.authComponent.setLoading(false);
    }
    
    console.error('Auth Error:', message);
  }
}