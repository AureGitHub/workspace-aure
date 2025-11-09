// Configuration interfaces for shared library
export interface SharedLibConfig {
  backend: {
    baseUrl: string;
    apiPrefix: string;
    timeout?: number;
    retryAttempts?: number;
  };
}

export interface BackendConfig {
  baseUrl: string;
  apiPrefix: string;
  timeout?: number;
  retryAttempts?: number;
}

// Default configurations for different apps
export const DEFAULT_CONFIGS = {
  'app-alquiler': {
    backend: {
      baseUrl: 'http://localhost:3001',
      apiPrefix: '/app-alquiler',
      timeout: 30000,
      retryAttempts: 2
    }
  },
  'app2': {
    backend: {
      baseUrl: 'http://localhost:3002',
      apiPrefix: '/app2',
      timeout: 30000,
      retryAttempts: 2
    }
  },
  'portal': {
    backend: {
      baseUrl: 'http://localhost:3003',
      apiPrefix: '/portal',
      timeout: 30000,
      retryAttempts: 2
    }
  }
} as const;

export type AppName = keyof typeof DEFAULT_CONFIGS;