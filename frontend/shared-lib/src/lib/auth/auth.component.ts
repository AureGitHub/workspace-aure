import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  eye, 
  eyeOff, 
  mail, 
  lockClosed, 
  person, 
  logoGoogle, 
  logoFacebook, 
  logoApple,
  checkmark,
  close
} from 'ionicons/icons';

import { 
  AuthConfig, 
  LoginData, 
  RegisterData, 
  AuthResponse, 
  AuthMode, 
  AuthState, 
  ValidationError 
} from './auth.interfaces';

@Component({
  selector: 'lib-auth',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule
  ],
  template: `
    <!-- Header del Modal -->
    <ion-header>
      <ion-toolbar [color]="config.color || 'primary'">
        <ion-title>{{ getTitle() }}</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" (click)="onClose()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <!-- Contenido del Modal -->
    <ion-content class="auth-modal-content">
      <div class="auth-container">
        <!-- Logo y Título -->
        <div class="auth-header" *ngIf="config.showLogo || config.subtitle">
          <div class="logo-container" *ngIf="config.showLogo && config.logoUrl">
            <img [src]="config.logoUrl" alt="Logo" class="auth-logo">
          </div>
          <p class="auth-subtitle" *ngIf="config.subtitle">
            {{ config.subtitle }}
          </p>
        </div>

        <div class="auth-form-container">
          <!-- Formulario de Login -->
          <form [formGroup]="loginForm" *ngIf="state.mode === 'login'" (ngSubmit)="onLogin()">
            <!-- Email -->
            <ion-item fill="outline" class="auth-input">
              <ion-icon name="mail" slot="start" [color]="config.color || 'primary'"></ion-icon>
              <ion-input
                type="email"
                placeholder="Correo electrónico"
                formControlName="email"
                [class.ion-invalid]="isFieldInvalid('email')"
                [class.ion-touched]="loginForm.get('email')?.touched">
              </ion-input>
            </ion-item>
            <div class="error-message" *ngIf="isFieldInvalid('email')">
              {{ getFieldError('email') }}
            </div>

            <!-- Password -->
            <ion-item fill="outline" class="auth-input">
              <ion-icon name="lock-closed" slot="start" [color]="config.color || 'primary'"></ion-icon>
              <ion-input
                [type]="state.showPassword ? 'text' : 'password'"
                placeholder="Contraseña"
                formControlName="password"
                [class.ion-invalid]="isFieldInvalid('password')"
                [class.ion-touched]="loginForm.get('password')?.touched">
              </ion-input>
              <ion-button 
                fill="clear" 
                slot="end" 
                (click)="togglePasswordVisibility()"
                type="button">
                <ion-icon 
                  [name]="state.showPassword ? 'eye-off' : 'eye'" 
                  [color]="config.color || 'primary'">
                </ion-icon>
              </ion-button>
            </ion-item>
            <div class="error-message" *ngIf="isFieldInvalid('password')">
              {{ getFieldError('password') }}
            </div>

            <!-- Remember Me -->
            <ion-item lines="none" *ngIf="config.allowRememberMe">
              <ion-checkbox 
                formControlName="rememberMe" 
                [color]="config.color || 'primary'">
              </ion-checkbox>
              <ion-label class="ion-margin-start">Recordarme</ion-label>
            </ion-item>

            <!-- Botón Login -->
            <ion-button 
              expand="block" 
              type="submit" 
              [disabled]="loginForm.invalid || state.loading"
              [color]="config.color || 'primary'"
              class="auth-button">
              <ion-spinner *ngIf="state.loading" name="crescent" slot="start"></ion-spinner>
              {{ config.loginButtonText || 'Iniciar Sesión' }}
            </ion-button>

            <!-- Forgot Password -->
            <ion-button 
              fill="clear" 
              expand="block" 
              (click)="switchMode('forgot-password')"
              *ngIf="config.allowForgotPassword"
              [color]="config.color || 'primary'">
              {{ config.forgotPasswordText || '¿Olvidaste tu contraseña?' }}
            </ion-button>
          </form>

          <!-- Formulario de Registro -->
          <form [formGroup]="registerForm" *ngIf="state.mode === 'register'" (ngSubmit)="onRegister()">
            <!-- Nombre -->
            <ion-item fill="outline" class="auth-input">
              <ion-icon name="person" slot="start" [color]="config.color || 'primary'"></ion-icon>
              <ion-input
                type="text"
                placeholder="Nombre"
                formControlName="firstName"
                [class.ion-invalid]="isRegisterFieldInvalid('firstName')"
                [class.ion-touched]="registerForm.get('firstName')?.touched">
              </ion-input>
            </ion-item>
            <div class="error-message" *ngIf="isRegisterFieldInvalid('firstName')">
              {{ getRegisterFieldError('firstName') }}
            </div>

            <!-- Apellido -->
            <ion-item fill="outline" class="auth-input">
              <ion-icon name="person" slot="start" [color]="config.color || 'primary'"></ion-icon>
              <ion-input
                type="text"
                placeholder="Apellido"
                formControlName="lastName"
                [class.ion-invalid]="isRegisterFieldInvalid('lastName')"
                [class.ion-touched]="registerForm.get('lastName')?.touched">
              </ion-input>
            </ion-item>
            <div class="error-message" *ngIf="isRegisterFieldInvalid('lastName')">
              {{ getRegisterFieldError('lastName') }}
            </div>

            <!-- Email -->
            <ion-item fill="outline" class="auth-input">
              <ion-icon name="mail" slot="start" [color]="config.color || 'primary'"></ion-icon>
              <ion-input
                type="email"
                placeholder="Correo electrónico"
                formControlName="email"
                [class.ion-invalid]="isRegisterFieldInvalid('email')"
                [class.ion-touched]="registerForm.get('email')?.touched">
              </ion-input>
            </ion-item>
            <div class="error-message" *ngIf="isRegisterFieldInvalid('email')">
              {{ getRegisterFieldError('email') }}
            </div>

            <!-- Password -->
            <ion-item fill="outline" class="auth-input">
              <ion-icon name="lock-closed" slot="start" [color]="config.color || 'primary'"></ion-icon>
              <ion-input
                [type]="state.showPassword ? 'text' : 'password'"
                placeholder="Contraseña"
                formControlName="password"
                [class.ion-invalid]="isRegisterFieldInvalid('password')"
                [class.ion-touched]="registerForm.get('password')?.touched">
              </ion-input>
              <ion-button 
                fill="clear" 
                slot="end" 
                (click)="togglePasswordVisibility()"
                type="button">
                <ion-icon 
                  [name]="state.showPassword ? 'eye-off' : 'eye'" 
                  [color]="config.color || 'primary'">
                </ion-icon>
              </ion-button>
            </ion-item>
            <div class="error-message" *ngIf="isRegisterFieldInvalid('password')">
              {{ getRegisterFieldError('password') }}
            </div>

            <!-- Confirm Password -->
            <ion-item fill="outline" class="auth-input">
              <ion-icon name="lock-closed" slot="start" [color]="config.color || 'primary'"></ion-icon>
              <ion-input
                [type]="state.showConfirmPassword ? 'text' : 'password'"
                placeholder="Confirmar contraseña"
                formControlName="confirmPassword"
                [class.ion-invalid]="isRegisterFieldInvalid('confirmPassword')"
                [class.ion-touched]="registerForm.get('confirmPassword')?.touched">
              </ion-input>
              <ion-button 
                fill="clear" 
                slot="end" 
                (click)="toggleConfirmPasswordVisibility()"
                type="button">
                <ion-icon 
                  [name]="state.showConfirmPassword ? 'eye-off' : 'eye'" 
                  [color]="config.color || 'primary'">
                </ion-icon>
              </ion-button>
            </ion-item>
            <div class="error-message" *ngIf="isRegisterFieldInvalid('confirmPassword')">
              {{ getRegisterFieldError('confirmPassword') }}
            </div>

            <!-- Accept Terms -->
            <ion-item lines="none">
              <ion-checkbox 
                formControlName="acceptTerms" 
                [color]="config.color || 'primary'">
              </ion-checkbox>
              <ion-label class="ion-margin-start">
                Acepto los 
                <a [href]="config.termsUrl" target="_blank" *ngIf="config.termsUrl">términos y condiciones</a>
                <span *ngIf="!config.termsUrl">términos y condiciones</span>
              </ion-label>
            </ion-item>
            <div class="error-message" *ngIf="isRegisterFieldInvalid('acceptTerms')">
              {{ getRegisterFieldError('acceptTerms') }}
            </div>

            <!-- Botón Register -->
            <ion-button 
              expand="block" 
              type="submit" 
              [disabled]="registerForm.invalid || state.loading"
              [color]="config.color || 'primary'"
              class="auth-button">
              <ion-spinner *ngIf="state.loading" name="crescent" slot="start"></ion-spinner>
              {{ config.registerButtonText || 'Registrarse' }}
            </ion-button>
          </form>

          <!-- Forgot Password -->
          <form [formGroup]="forgotPasswordForm" *ngIf="state.mode === 'forgot-password'" (ngSubmit)="onForgotPassword()">
            <p class="forgot-password-text">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            
            <ion-item fill="outline" class="auth-input">
              <ion-icon name="mail" slot="start" [color]="config.color || 'primary'"></ion-icon>
              <ion-input
                type="email"
                placeholder="Correo electrónico"
                formControlName="email"
                [class.ion-invalid]="isForgotFieldInvalid('email')"
                [class.ion-touched]="forgotPasswordForm.get('email')?.touched">
              </ion-input>
            </ion-item>
            <div class="error-message" *ngIf="isForgotFieldInvalid('email')">
              {{ getForgotFieldError('email') }}
            </div>

            <ion-button 
              expand="block" 
              type="submit" 
              [disabled]="forgotPasswordForm.invalid || state.loading"
              [color]="config.color || 'primary'"
              class="auth-button">
              <ion-spinner *ngIf="state.loading" name="crescent" slot="start"></ion-spinner>
              Enviar enlace
            </ion-button>
          </form>

          <!-- Social Login -->
          <div class="social-login" *ngIf="config.allowSocialLogin && state.mode === 'login'">
            <div class="divider">
              <span>o continúa con</span>
            </div>
            
            <div class="social-buttons">
              <ion-button 
                fill="outline" 
                (click)="onSocialLogin('google')"
                [disabled]="state.loading">
                <ion-icon name="logo-google" slot="start"></ion-icon>
                Google
              </ion-button>
              
              <ion-button 
                fill="outline" 
                (click)="onSocialLogin('facebook')"
                [disabled]="state.loading">
                <ion-icon name="logo-facebook" slot="start"></ion-icon>
                Facebook
              </ion-button>
              
              <ion-button 
                fill="outline" 
                (click)="onSocialLogin('apple')"
                [disabled]="state.loading">
                <ion-icon name="logo-apple" slot="start"></ion-icon>
                Apple
              </ion-button>
            </div>
          </div>

          <!-- Switch Mode -->
          <div class="switch-mode">
            <ion-button 
              fill="clear" 
              expand="block"
              (click)="switchMode(state.mode === 'login' ? 'register' : 'login')"
              *ngIf="config.allowRegistration && (state.mode === 'login' || state.mode === 'register')"
              [color]="config.color || 'primary'">
              {{ getSwitchModeText() }}
            </ion-button>
            
            <ion-button 
              fill="clear" 
              expand="block"
              (click)="switchMode('login')"
              *ngIf="state.mode === 'forgot-password'"
              [color]="config.color || 'primary'">
              Volver al login
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .auth-modal-content {
      --padding-start: 16px;
      --padding-end: 16px;
      --padding-top: 16px;
      --padding-bottom: 16px;
    }

    .auth-container {
      display: block;
      width: 100%;
      max-width: 500px;
      margin: 0 auto;
    }

    .auth-form-container {
      width: 100%;
    }

    .auth-header {
      text-align: center;
      padding: 8px 0 16px;
      width: 100%;
    }

    .logo-container {
      margin-bottom: 1rem;
    }

    .auth-logo {
      width: 80px;
      height: 80px;
      object-fit: contain;
    }

    .auth-subtitle {
      font-size: 0.95rem;
      color: var(--ion-color-medium, #92949c);
      margin: 0.5rem 0 0;
      line-height: 1.4;
    }

    .auth-input {
      margin-bottom: 8px;
      --border-radius: 8px;
    }

    .auth-input ion-input {
      --padding-start: 8px;
    }

    .error-message {
      color: var(--ion-color-danger, #eb445a);
      font-size: 0.8rem;
      margin: 4px 0 12px;
      padding-left: 16px;
    }

    .auth-button {
      margin: 16px 0 8px;
      --border-radius: 8px;
      height: 48px;
      font-weight: 600;
    }

    .forgot-password-text {
      text-align: center;
      font-size: 0.9rem;
      color: var(--ion-color-medium, #92949c);
      margin-bottom: 16px;
      line-height: 1.4;
    }

    .social-login {
      margin-top: 16px;
    }

    .divider {
      text-align: center;
      margin: 16px 0;
      position: relative;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: var(--ion-color-light-shade, #d7d8da);
    }

    .divider span {
      background: var(--ion-color-light, #f4f5f8);
      padding: 0 1rem;
      font-size: 0.8rem;
      color: var(--ion-color-medium, #92949c);
    }

    .social-buttons {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .social-buttons ion-button {
      --border-radius: 8px;
      height: 44px;
    }

    .switch-mode {
      margin-top: 12px;
      text-align: center;
    }

    .switch-mode ion-button {
      font-size: 0.9rem;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .auth-modal-content {
        --padding-start: 12px;
        --padding-end: 12px;
      }
      
      .auth-header {
        padding: 4px 0 12px;
      }
    }

    @media (max-width: 480px) {
      .auth-modal-content {
        --padding-start: 8px;
        --padding-end: 8px;
      }
    }

    /* Dark theme support */
    @media (prefers-color-scheme: dark) {
      .auth-subtitle {
        color: var(--ion-color-medium-tint, #a2a4ab);
      }
    }
  `]
})
export class AuthComponent implements OnInit, OnDestroy {
  @Input() config: AuthConfig = {
    showLogo: false,
    title: 'Bienvenido',
    allowRegistration: true,
    allowForgotPassword: true,
    allowRememberMe: true,
    allowSocialLogin: false,
    minPasswordLength: 6,
    requireStrongPassword: false
  };

  @Output() login = new EventEmitter<LoginData>();
  @Output() register = new EventEmitter<RegisterData>();
  @Output() forgotPassword = new EventEmitter<{ email: string }>();
  @Output() socialLogin = new EventEmitter<{ provider: string }>();
  @Output() authResponse = new EventEmitter<AuthResponse>();
  @Output() close = new EventEmitter<void>();

  // Formularios
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  forgotPasswordForm!: FormGroup;

  // Estado del componente
  state: AuthState = {
    mode: 'login',
    loading: false,
    errors: [],
    showPassword: false,
    showConfirmPassword: false
  };

  constructor(private formBuilder: FormBuilder) {
    // Registrar iconos
    addIcons({
      eye,
      eyeOff,
      mail,
      'lock-closed': lockClosed,
      person,
      'logo-google': logoGoogle,
      'logo-facebook': logoFacebook,
      'logo-apple': logoApple,
      checkmark,
      close
    });
  }

  ngOnInit() {
    this.initializeForms();
  }

  ngOnDestroy() {
    // Cleanup si es necesario
  }

  private initializeForms() {
    // Login Form
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(this.config.minPasswordLength || 6)]],
      rememberMe: [false]
    });

    // Register Form
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(this.config.minPasswordLength || 6),
        ...(this.config.requireStrongPassword ? [this.strongPasswordValidator] : [])
      ]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });

    // Forgot Password Form
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  // Validadores personalizados
  private strongPasswordValidator(control: any) {
    const value = control.value;
    if (!value) return null;
    
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?\":{}|<>]/.test(value);
    
    const valid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecial;
    return valid ? null : { strongPassword: true };
  }

  private passwordMatchValidator(group: FormGroup) {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');
    
    if (!password || !confirmPassword) return null;
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  // Métodos de validación
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  isRegisterFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  isForgotFieldInvalid(fieldName: string): boolean {
    const field = this.forgotPasswordForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['email']) return 'Ingresa un email válido';
    if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    
    return 'Campo inválido';
  }

  getRegisterFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['email']) return 'Ingresa un email válido';
    if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    if (field.errors['strongPassword']) return 'La contraseña debe contener mayúsculas, minúsculas, números y símbolos';
    if (field.errors['requiredTrue']) return 'Debes aceptar los términos y condiciones';
    
    if (fieldName === 'confirmPassword' && this.registerForm.errors?.['passwordMismatch']) {
      return 'Las contraseñas no coinciden';
    }
    
    return 'Campo inválido';
  }

  getForgotFieldError(fieldName: string): string {
    const field = this.forgotPasswordForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Este campo es requerido';
    if (field.errors['email']) return 'Ingresa un email válido';
    
    return 'Campo inválido';
  }

  // Métodos de UI
  togglePasswordVisibility() {
    this.state.showPassword = !this.state.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.state.showConfirmPassword = !this.state.showConfirmPassword;
  }

  switchMode(mode: AuthMode) {
    this.state.mode = mode;
    this.state.errors = [];
  }

  getTitle(): string {
    if (this.config.title) return this.config.title;
    
    switch (this.state.mode) {
      case 'login': return 'Iniciar Sesión';
      case 'register': return 'Crear Cuenta';
      case 'forgot-password': return 'Recuperar Contraseña';
      default: return 'Bienvenido';
    }
  }

  getSwitchModeText(): string {
    if (this.state.mode === 'login') {
      return this.config.switchToRegisterText || '¿No tienes cuenta? Regístrate';
    } else {
      return this.config.switchToLoginText || '¿Ya tienes cuenta? Inicia sesión';
    }
  }

  // Métodos de eventos
  onLogin() {
    if (this.loginForm.valid && !this.state.loading) {
      this.state.loading = true;
      const loginData: LoginData = this.loginForm.value;
      this.login.emit(loginData);
    }
  }

  onRegister() {
    if (this.registerForm.valid && !this.state.loading) {
      this.state.loading = true;
      const registerData: RegisterData = this.registerForm.value;
      this.register.emit(registerData);
    }
  }

  onForgotPassword() {
    if (this.forgotPasswordForm.valid && !this.state.loading) {
      this.state.loading = true;
      const email = this.forgotPasswordForm.get('email')?.value;
      this.forgotPassword.emit({ email });
    }
  }

  onSocialLogin(provider: string) {
    if (!this.state.loading) {
      this.state.loading = true;
      this.socialLogin.emit({ provider });
    }
  }

  // Método público para manejar respuestas de autenticación
  handleAuthResponse(response: AuthResponse) {
    this.state.loading = false;
    this.authResponse.emit(response);
    
    if (!response.success && response.error) {
      // Manejar errores específicos de campo
      if (response.error.field) {
        const form = this.getCurrentForm();
        const field = form?.get(response.error.field);
        if (field) {
          field.setErrors({ serverError: response.error.message });
        }
      }
    }
  }

  private getCurrentForm(): FormGroup | null {
    switch (this.state.mode) {
      case 'login': return this.loginForm;
      case 'register': return this.registerForm;
      case 'forgot-password': return this.forgotPasswordForm;
      default: return null;
    }
  }

  // Métodos públicos para control externo
  setLoading(loading: boolean) {
    this.state.loading = loading;
  }

  resetForms() {
    this.loginForm.reset();
    this.registerForm.reset();
    this.forgotPasswordForm.reset();
    this.state.errors = [];
  }

  setMode(mode: AuthMode) {
    this.switchMode(mode);
  }

  // Método para cerrar el modal
  onClose() {
    this.close.emit();
  }
}