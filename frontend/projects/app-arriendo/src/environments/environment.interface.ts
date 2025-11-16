// Environment interface for type safety
export interface BackendConfig {
  baseUrl: string;
  apiPrefix: string;
  timeout?: number;
  retryAttempts?: number;
}

export interface AuthConfig {
  enableDebugCredentials?: boolean;
  debugEmail?: string;
  debugPassword?: string;
}

export interface Environment {
  production: boolean;
  testing?: boolean;
  backend: BackendConfig;
  auth?: AuthConfig;
}