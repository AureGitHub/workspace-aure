import { Environment } from './environment.interface';

export const environment: Environment = {
  production: true,
  backend: {
    baseUrl: 'https://api.alquiler-zarza.com',
    apiPrefix: '/app-alquiler',
    timeout: 30000,
    retryAttempts: 3
  },
  auth: {
    enableDebugCredentials: false
  }
};
