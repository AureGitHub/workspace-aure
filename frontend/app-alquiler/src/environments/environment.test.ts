import { Environment } from './environment.interface';

export const environment: Environment = {
  production: false,
  testing: true,
  backend: {
    baseUrl: 'http://localhost:3999',
    apiPrefix: '/app-alquiler',
    timeout: 15000,
    retryAttempts: 1
  }
};