import { Environment } from './environment.interface';

export const environment: Environment = {
  production: true,
  backend: {
    baseUrl: 'https://app-arriendo-crw36h210hg6.deno.dev',
    apiPrefix: '/app-alquiler',
    timeout: 30000,
    retryAttempts: 3
  },
  auth: {
    enableDebugCredentials: false
  }
};
