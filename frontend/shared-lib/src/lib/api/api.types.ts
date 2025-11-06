/**
 * Interfaces comunes para respuestas de API
 */

export interface PaginatedResponse<T = any> {
  data: T[];
  meta: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
    from: number;
    to: number;
  };
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export interface ListResponse<T = any> {
  success: boolean;
  data: T[];
  count: number;
  message?: string;
}

export interface SingleResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CreateResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
}

export interface UpdateResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export interface ValidationErrorResponse {
  success: false;
  message: string;
  errors: {
    [field: string]: string[];
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: string;
  statusCode: number;
  timestamp: string;
  path?: string;
}

/**
 * Parámetros comunes para consultas
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  perPage?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  filter?: string;
  q?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface QueryParams extends PaginationParams, SortParams, FilterParams {}

/**
 * Tipos para upload de archivos
 */
export interface FileUploadResponse {
  success: boolean;
  data: {
    filename: string;
    originalName: string;
    size: number;
    mimeType: string;
    url: string;
    path: string;
  };
  message: string;
}

export interface MultipleFileUploadResponse {
  success: boolean;
  data: {
    files: Array<{
      filename: string;
      originalName: string;
      size: number;
      mimeType: string;
      url: string;
      path: string;
    }>;
    totalFiles: number;
    totalSize: number;
  };
  message: string;
}

/**
 * Estados de recursos
 */
export type ResourceStatus = 'active' | 'inactive' | 'pending' | 'deleted' | 'archived';

/**
 * Metadatos comunes para recursos
 */
export interface ResourceMetadata {
  id: string | number;
  createdAt: string;
  updatedAt: string;
  status?: ResourceStatus;
  version?: number;
}

/**
 * Usuario base para sistemas de autenticación
 */
export interface BaseUser extends ResourceMetadata {
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  avatar?: string;
  role?: string;
  permissions?: string[];
}

/**
 * Respuesta de autenticación
 */
export interface ApiAuthResponse {
  success: boolean;
  data: {
    user: BaseUser;
    token: string;
    refreshToken?: string;
    expiresIn: number;
    tokenType: string;
  };
  message: string;
}

/**
 * Datos de login
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Datos de registro
 */
export interface RegisterRequest {
  email: string;
  password: string;
  passwordConfirmation: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
}

/**
 * Solicitud de recuperación de contraseña
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Restablecer contraseña
 */
export interface ResetPasswordRequest {
  token: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

/**
 * Cambiar contraseña
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}