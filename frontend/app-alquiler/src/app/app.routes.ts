import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'auth-demo',
    loadComponent: () => import('./auth-demo/auth-demo.page').then((m) => m.AuthDemoPage),
  },
  {
    path: 'api-demo',
    loadComponent: () => import('./api-demo/api-demo.page').then((m) => m.ApiDemoPage),
  },
  {
    path: 'user-management',
    loadComponent: () => import('./user-management/user-management.page').then((m) => m.UserManagementPage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
