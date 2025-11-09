// Configuration service for shared library
import { Injectable, inject, InjectionToken } from '@angular/core';
import { SharedLibConfig, BackendConfig, DEFAULT_CONFIGS, AppName } from './shared-lib.config';

// Injection token for the configuration
export const SHARED_LIB_CONFIG = new InjectionToken<SharedLibConfig>('SharedLibConfig');

@Injectable({
  providedIn: 'root'
})
export class SharedLibConfigService {
  private config: SharedLibConfig;

  constructor() {
    // Try to inject the configuration, fallback to default
    try {
      this.config = inject(SHARED_LIB_CONFIG);
    } catch {
      // Default fallback configuration
      this.config = DEFAULT_CONFIGS['app-alquiler'];
    }
  }

  /**
   * Get the current configuration
   */
  getConfig(): SharedLibConfig {
    return this.config;
  }

  /**
   * Get backend configuration
   */
  getBackendConfig(): BackendConfig {
    return this.config.backend;
  }

  /**
   * Get full API URL for an endpoint
   */
  getApiUrl(endpoint: string): string {
    const { baseUrl, apiPrefix } = this.config.backend;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    // Construct full URL: baseUrl + apiPrefix + endpoint
    return `${baseUrl}${apiPrefix}${cleanEndpoint}`;
  }

  /**
   * Update configuration (useful for runtime changes)
   */
  updateConfig(newConfig: Partial<SharedLibConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
      backend: {
        ...this.config.backend,
        ...newConfig.backend
      }
    };
  }

  /**
   * Set configuration for a specific app
   */
  setAppConfig(appName: AppName): void {
    if (DEFAULT_CONFIGS[appName]) {
      this.config = DEFAULT_CONFIGS[appName];
    }
  }
}