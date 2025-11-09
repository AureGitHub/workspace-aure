// Provider functions for easy shared library configuration
import { Provider } from '@angular/core';
import { SHARED_LIB_CONFIG } from './shared-lib-config.service';
import { SharedLibConfig, DEFAULT_CONFIGS, AppName } from './shared-lib.config';

/**
 * Provides shared library configuration for a specific app
 */
export function provideSharedLibConfig(appName: AppName): Provider {
  return {
    provide: SHARED_LIB_CONFIG,
    useValue: DEFAULT_CONFIGS[appName]
  };
}

/**
 * Provides custom shared library configuration
 */
export function provideCustomSharedLibConfig(config: SharedLibConfig): Provider {
  return {
    provide: SHARED_LIB_CONFIG,
    useValue: config
  };
}

/**
 * Provides shared library configuration with backend settings
 */
export function provideSharedLibBackend(
  baseUrl: string, 
  apiPrefix: string, 
  options?: {
    timeout?: number;
    retryAttempts?: number;
  }
): Provider {
  const config: SharedLibConfig = {
    backend: {
      baseUrl,
      apiPrefix,
      timeout: options?.timeout || 30000,
      retryAttempts: options?.retryAttempts || 2
    }
  };

  return {
    provide: SHARED_LIB_CONFIG,
    useValue: config
  };
}

/**
 * Provides shared library configuration from environment
 */
export function provideSharedLibFromEnvironment(environment: any): Provider {
  if (!environment.backend) {
    throw new Error('Environment must have a backend configuration');
  }

  const config: SharedLibConfig = {
    backend: {
      baseUrl: environment.backend.baseUrl,
      apiPrefix: environment.backend.apiPrefix,
      timeout: environment.backend.timeout || 30000,
      retryAttempts: environment.backend.retryAttempts || 2
    }
  };

  return {
    provide: SHARED_LIB_CONFIG,
    useValue: config
  };
}