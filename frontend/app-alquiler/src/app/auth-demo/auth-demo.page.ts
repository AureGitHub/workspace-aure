import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardSubtitle, 
  IonCardContent, 
  IonButton,
  IonToast
} from '@ionic/angular/standalone';
import { 
  AuthComponent, 
  AuthConfig, 
  LoginData, 
  RegisterData, 
  AuthResponse,
  AuthService 
} from 'shared-lib';

@Component({
  selector: 'app-auth-demo',
  templateUrl: './auth-demo.page.html',
  styleUrls: ['./auth-demo.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonToast,
    AuthComponent
  ]
})
export class AuthDemoPage {
  
  // Configuración del componente de autenticación
  authConfig: AuthConfig = {
    showLogo: true,
    logoUrl: 'assets/logo.png', // Puedes cambiar por tu logo
    title: 'Workspace Aure',
    subtitle: 'Accede a tu cuenta o crea una nueva',
    color: 'primary',
    allowRegistration: true,
    allowForgotPassword: true,
    allowRememberMe: true,
    allowSocialLogin: true,
    minPasswordLength: 8,
    requireStrongPassword: true,
    loginButtonText: 'Iniciar Sesión',
    registerButtonText: 'Crear Cuenta',
    forgotPasswordText: '¿Olvidaste tu contraseña?',
    switchToRegisterText: '¿No tienes cuenta? Regístrate aquí',
    switchToLoginText: '¿Ya tienes cuenta? Inicia sesión',
    termsUrl: 'https://ejemplo.com/terminos',
    privacyUrl: 'https://ejemplo.com/privacidad'
  };

  // Estado de demo
  lastAction = '';
  lastData: any = null;
  toastMessage = '';
  showToast = false;
  toastColor = 'success';

  // Estado de autenticación del servicio
  isAuthenticated = false;
  authStatus = '';

  constructor(private authService: AuthService) {
    // Suscribirse al estado de autenticación
    this.authService.isLogin$.subscribe(isLoggedIn => {
      this.isAuthenticated = isLoggedIn;
      this.authStatus = this.authService.authStatus();
    });
  }

  // Manejar login
  onLogin(loginData: LoginData) {
    console.log('Login attempt:', loginData);
    this.lastAction = 'Login';
    this.lastData = loginData;
    
    // Simular autenticación (reemplazar con tu lógica real)
    setTimeout(() => {
      const mockResponse: AuthResponse = {
        success: true,
        message: 'Login exitoso',
        user: {
          id: '123',
          email: loginData.email,
          firstName: 'Usuario',
          lastName: 'Demo',
          token: 'mock-jwt-token'
        }
      };
      
      this.handleAuthResponse(mockResponse);
    }, 2000);
  }

  // Manejar registro
  onRegister(registerData: RegisterData) {
    console.log('Register attempt:', registerData);
    this.lastAction = 'Register';
    this.lastData = registerData;
    
    // Simular registro (reemplazar con tu lógica real)
    setTimeout(() => {
      const mockResponse: AuthResponse = {
        success: true,
        message: 'Registro exitoso',
        user: {
          id: '124',
          email: registerData.email,
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          token: 'mock-jwt-token'
        }
      };
      
      this.handleAuthResponse(mockResponse);
    }, 2000);
  }

  // Manejar recuperación de contraseña
  onForgotPassword(data: { email: string }) {
    console.log('Forgot password for:', data.email);
    this.lastAction = 'Forgot Password';
    this.lastData = data;
    
    // Simular envío de email (reemplazar con tu lógica real)
    setTimeout(() => {
      const mockResponse: AuthResponse = {
        success: true,
        message: `Se ha enviado un enlace de recuperación a ${data.email}`
      };
      
      this.handleAuthResponse(mockResponse);
    }, 1500);
  }

  // Manejar login social
  onSocialLogin(data: { provider: string }) {
    console.log('Social login with:', data.provider);
    this.lastAction = 'Social Login';
    this.lastData = data;
    
    // Simular login social (reemplazar con tu lógica real)
    setTimeout(() => {
      const mockResponse: AuthResponse = {
        success: true,
        message: `Login con ${data.provider} exitoso`,
        user: {
          id: '125',
          email: `usuario@${data.provider}.com`,
          firstName: 'Usuario',
          lastName: 'Social',
          token: 'mock-social-token'
        }
      };
      
      this.handleAuthResponse(mockResponse);
    }, 1500);
  }

  // Manejar respuesta de autenticación
  handleAuthResponse(response: AuthResponse) {
    console.log('Auth response:', response);
    
    if (response.success) {
      this.showToastMessage(response.message || 'Operación exitosa', 'success');
      
      if (response.user) {
        console.log('User authenticated:', response.user);
        // Actualizar el estado de autenticación en el servicio
        this.authService.login();
      }
    } else {
      this.showToastMessage(response.error?.message || 'Error en la operación', 'danger');
    }
  }

  // Mostrar toast
  private showToastMessage(message: string, color: string = 'success') {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
  }

  // Limpiar datos de demo
  clearDemo() {
    this.lastAction = '';
    this.lastData = null;
  }

  // Métodos del AuthService
  onLogout() {
    this.authService.logout();
    this.showToastMessage('Sesión cerrada correctamente', 'success');
  }

  onToggleAuth() {
    this.authService.toggleLogin();
    const status = this.authService.isAuthenticated() ? 'Sesión iniciada' : 'Sesión cerrada';
    this.showToastMessage(status, 'primary');
  }

  onCheckAuthState() {
    const isAuth = this.authService.isAuthenticated();
    const message = `Estado actual: ${isAuth ? 'Autenticado' : 'No autenticado'}`;
    this.showToastMessage(message, 'tertiary');
  }
}