import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';

// Imports de la librería compartida
import { 
  AppLayoutComponent, 
  AppLayoutConfig, 
  AuthService,
  LoginData,
  RegisterData 
} from 'shared-lib';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, AppLayoutComponent],
})
export class AppComponent implements OnInit, OnDestroy {
  
  // Configuración del layout común
  layoutConfig: AppLayoutConfig = {
    showHeader: true,
    showFooter: true,
    headerTitle: 'Alquiler ZarZa',
    headerSubtitle: 'Gestión de propiedades de alquiler',
    footerText: 'Alquiler ZarZa © 2025',
    showBackButton: false,
    showMenuButton: false,
    showUserProfile: true,
    color: 'primary'
  };

  private routerSubscription?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Suscribirse a cambios de ruta para actualizar configuración del layout
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateLayoutConfig(event.url);
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private updateLayoutConfig(url: string) {
    // Actualizar configuración del layout según la ruta actual
    if (url === '/home' || url === '/') {
      this.layoutConfig = {
        ...this.layoutConfig,
        headerTitle: 'Alquiler ZarZa',
        headerSubtitle: 'Bienvenido a la plataforma de gestión',
        showBackButton: false
      };
    } else if (url === '/user-management') {
      this.layoutConfig = {
        ...this.layoutConfig,
        headerTitle: 'Gestión de Usuarios',
        headerSubtitle: 'Administración del sistema',
        showBackButton: true
      };
    } else {
      this.layoutConfig = {
        ...this.layoutConfig,
        headerTitle: 'Alquiler ZarZa',
        headerSubtitle: 'Gestión de propiedades',
        showBackButton: true
      };
    }
  }

  // Métodos del layout
  onMenuClick() {
    console.log('Menu clicked from app component');
  }

  onBackClick() {
    this.router.navigate(['/home']);
  }

  onUserProfileClick() {
    console.log('User profile clicked from app component');
  }

  onAuthLogin(loginData: LoginData) {
    console.log('Login successful from app component:', loginData);
  }

  onAuthRegister(registerData: RegisterData) {
    console.log('Register from app component:', registerData);
  }
}
