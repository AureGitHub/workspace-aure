import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'app1',
    loadComponent: () => import('./app1/app1.page').then((m) => m.App1Page),
  },
  {
    path: 'app2',
    loadComponent: () => import('./app2/app2.page').then((m) => m.App2Page),
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
];
