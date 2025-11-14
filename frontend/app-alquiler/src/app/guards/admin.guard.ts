import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

// Imports de la librería compartida
import { AuthService } from 'shared-lib';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    console.log('🛡️ AdminGuard: Verificando acceso a:', state.url);
    
    // Verificar si el usuario está autenticado y es admin
    return this.authService.isLogin$.pipe(
      take(1), // Solo tomar el primer valor emitido
      map(isLoggedIn => {
        if (!isLoggedIn) {
          console.log('❌ AdminGuard: Usuario no autenticado');
          this.router.navigate(['/home']);
          return false;
        }

        const isAdmin = this.authService.isAdmin();
        const currentUser = this.authService.getCurrentUser();
        
   

        if (isAdmin) {
          console.log('✅ AdminGuard: Acceso permitido para admin');
          return true;
        } else {
          console.log('🚫 AdminGuard: Acceso denegado - usuario no es admin');
          this.router.navigate(['/no-permitido']);
          return false;
        }
      })
    );
  }
}

// Guard adicional para verificar solo autenticación (sin rol específico)
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    console.log('🔐 AuthGuard: Verificando autenticación para:', state.url);
    
    return this.authService.isLogin$.pipe(
      take(1),
      map(isLoggedIn => {
        if (isLoggedIn) {
          console.log('✅ AuthGuard: Usuario autenticado');
          return true;
        } else {
          console.log('❌ AuthGuard: Usuario no autenticado, redirigiendo a home');
          this.router.navigate(['/home']);
          return false;
        }
      })
    );
  }
}