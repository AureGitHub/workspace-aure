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

// Interfaces específicas del backend
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  user_type: 'owner' | 'tenant' | 'admin';
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackendLoginRequest {
  email: string;
  password: string;
}

export interface BackendRegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  user_type?: 'owner' | 'tenant';
}

export interface BackendAuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
  timestamp?: string;
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