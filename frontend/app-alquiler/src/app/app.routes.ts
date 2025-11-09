import { Routes } from '@angular/router';
import { AdminGuard, AuthGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'user-management',
    loadComponent: () => import('./user-management/user-management.page').then((m) => m.UserManagementPage),
    canActivate: [AuthGuard] // Requiere autenticación
  },
  {
    path: 'control-usuario',
    loadComponent: () => import('./control-usuario/control-usuario.page').then((m) => m.ControlUsuarioPage),
    canActivate: [AdminGuard] // Requiere permisos de admin
  },
  {
    path: 'no-permitido',
    loadComponent: () => import('./no-permitido/no-permitido.page').then((m) => m.NoPermitidoPage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'home' // Ruta por defecto para URLs no encontradas
  }
];
