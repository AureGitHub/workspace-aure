export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
}

export interface AuthConfig {
  // Configuración visual
  showLogo?: boolean;
  logoUrl?: string;
  title?: string;
  subtitle?: string;
  color?: string;
  
  // Funcionalidades
  allowRegistration?: boolean;
  allowForgotPassword?: boolean;
  allowRememberMe?: boolean;
  allowSocialLogin?: boolean;
  
  // Validaciones
  minPasswordLength?: number;
  requireStrongPassword?: boolean;
  
  // Textos personalizables
  loginButtonText?: string;
  registerButtonText?: string;
  forgotPasswordText?: string;
  switchToRegisterText?: string;
  switchToLoginText?: string;
  
  // URLs/rutas
  termsUrl?: string;
  privacyUrl?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    token?: string;
  };
  error?: {
    code: string;
    message: string;
    field?: string;
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

export type AuthMode = 'login' | 'register' | 'forgot-password';

export interface AuthState {
  mode: AuthMode;
  loading: boolean;
  errors: ValidationError[];
  showPassword: boolean;
  showConfirmPassword: boolean;
}