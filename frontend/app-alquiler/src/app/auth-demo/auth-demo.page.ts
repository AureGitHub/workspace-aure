import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardSubtitle, 
  IonCardContent, 
  IonButton,
  IonToast,
  IonSpinner,
  IonText,
  IonChip,
  IonIcon,
  IonItem,
  IonLabel,
  IonList
} from '@ionic/angular/standalone';
import { 
  AuthComponent, 
  AuthConfig, 
  LoginData, 
  RegisterData, 
  AuthService as SharedAuthService
} from 'shared-lib';
import { ApiService, User, LoginRequest, RegisterRequest } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { checkmarkCircle, alertCircle, person, wifi, server } from 'ionicons/icons';

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
    IonSpinner,
    IonChip,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    AuthComponent
  ]
})
export class AuthDemoPage implements OnDestroy {
  
  // Configuración del componente de autenticación
  authConfig: AuthConfig = {
    showLogo: true,
    logoUrl: 'assets/logo.png',
    title: 'App Alquiler',
    subtitle: 'Conectando con Backend Deno.js',
    color: 'primary',
    allowRegistration: true,
    allowForgotPassword: false, // Deshabilitado por ahora
    allowRememberMe: true,
    allowSocialLogin: false, // Deshabilitado por ahora
    minPasswordLength: 6,
    requireStrongPassword: false,
    loginButtonText: 'Iniciar Sesión',
    registerButtonText: 'Crear Cuenta',
    forgotPasswordText: '¿Olvidaste tu contraseña?',
    switchToRegisterText: '¿No tienes cuenta? Regístrate aquí',
    switchToLoginText: '¿Ya tienes cuenta? Inicia sesión'
  };

  // Estado de la aplicación
  currentUser: User | null = null;
  isAuthenticated = false;
  isLoading = false;
  
  // Estado de la API
  apiStatus = 'checking';
  apiHealth: any = null;
  
  // Toast
  toastMessage = '';
  showToast = false;
  toastColor: 'success' | 'danger' | 'warning' | 'primary' = 'success';
  
  // Demo data
  lastAction = '';
  lastData: any = null;

  // Demo users para pruebas rápidas
  demoUsers = [
    { label: 'Admin', email: 'admin@test.com', password: 'admin123', type: 'admin' },
    { label: 'Owner', email: 'owner@test.com', password: 'owner123', type: 'owner' },
    { label: 'Tenant', email: 'tenant@test.com', password: 'tenant123', type: 'tenant' },
    { label: 'Aure', email: 'aure@workspace.com', password: 'aure123', type: 'admin' }
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private apiService: ApiService, 
    private authService: AuthService,
    private sharedAuthService: SharedAuthService
  ) {
    // Configurar iconos
    addIcons({ checkmarkCircle, alertCircle, person, wifi, server });
    
    // Suscribirse al estado de autenticación
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      }),
      this.authService.isAuthenticated$.subscribe(isAuth => {
        this.isAuthenticated = isAuth;
      })
    );
    
    // Verificar estado de la API
    this.checkApiHealth();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ===================
  // MÉTODOS DE LA API
  // ===================

  checkApiHealth() {
    this.apiStatus = 'checking';
    this.apiService.getHealth().subscribe({
      next: (response) => {
        this.apiHealth = response;
        this.apiStatus = 'connected';
        console.log('✅ API Health:', response);
      },
      error: (error) => {
        this.apiStatus = 'error';
        console.error('❌ API Health Error:', error);
        this.showToastMessage('No se puede conectar al backend', 'danger');
      }
    });
  }

  // Manejar login
  onLogin(loginData: LoginData) {
    console.log('🔐 Login attempt:', loginData);
    this.lastAction = 'Login';
    this.lastData = loginData;
    this.isLoading = true;
    
    const credentials: LoginRequest = {
      email: loginData.email,
      password: loginData.password
    };

    this.authService.login(credentials).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (success) {
          this.showToastMessage('¡Login exitoso!', 'success');
        } else {
          this.showToastMessage('Credenciales incorrectas', 'danger');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.showToastMessage(error.friendlyMessage || 'Error en el login', 'danger');
      }
    });
  }

  // Manejar registro
  onRegister(registerData: RegisterData) {
    console.log('📝 Register attempt:', registerData);
    this.lastAction = 'Register';
    this.lastData = registerData;
    this.isLoading = true;
    
    const userData: RegisterRequest = {
      username: registerData.email.split('@')[0], // Usar email como base para username
      email: registerData.email,
      password: registerData.password,
      first_name: registerData.firstName,
      last_name: registerData.lastName,
      user_type: 'tenant' // Por defecto crear como tenant
    };

    this.authService.register(userData).subscribe({
      next: (success) => {
        this.isLoading = false;
        if (success) {
          this.showToastMessage('¡Registro exitoso! Ya puedes iniciar sesión', 'success');
        } else {
          this.showToastMessage('Error en el registro', 'danger');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.showToastMessage(error.friendlyMessage || 'Error en el registro', 'danger');
      }
    });
  }

  // Manejar recuperación de contraseña
  onForgotPassword(data: { email: string }) {
    console.log('🔑 Forgot password for:', data.email);
    this.showToastMessage('Función no implementada aún', 'warning');
  }

  // Manejar login social
  onSocialLogin(data: { provider: string }) {
    console.log('📱 Social login with:', data.provider);
    this.showToastMessage('Login social no implementado aún', 'warning');
  }

  // Login rápido con usuarios demo
  quickLogin(demoUser: any) {
    const loginData: LoginData = {
      email: demoUser.email,
      password: demoUser.password,
      rememberMe: false
    };
    this.onLogin(loginData);
  }

  // Logout
  onLogout() {
    this.authService.logout();
    this.showToastMessage('Sesión cerrada correctamente', 'success');
    this.clearDemo();
  }

  // ===================
  // MÉTODOS AUXILIARES
  // ===================

  private showToastMessage(message: string, color: 'success' | 'danger' | 'warning' | 'primary' = 'success') {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
  }

  clearDemo() {
    this.lastAction = '';
    this.lastData = null;
  }

  // Obtener estado de la API como texto
  getApiStatusText(): string {
    switch (this.apiStatus) {
      case 'checking': return 'Verificando...';
      case 'connected': return 'Conectado';
      case 'error': return 'Error de conexión';
      default: return 'Desconocido';
    }
  }

  // Obtener color del estado de la API
  getApiStatusColor(): string {
    switch (this.apiStatus) {
      case 'checking': return 'warning';
      case 'connected': return 'success';
      case 'error': return 'danger';
      default: return 'medium';
    }
  }
}