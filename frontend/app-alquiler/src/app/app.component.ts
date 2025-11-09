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

// Import del servicio de título
import { PageTitleService } from './services/page-title.service';

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
    appName: 'Alquiler ZarZa',
    pageTitle: '',
    headerSubtitle: '',
    footerText: 'Alquiler ZarZa © 2025',
    showBackButton: false,
    showMenuButton: false,
    showUserProfile: true,
    color: 'primary'
  };

  private routerSubscription?: Subscription;
  private titleSubscription?: Subscription;
  private authSubscription?: Subscription;
  private logoutSubscription?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private pageTitleService: PageTitleService
  ) {}

  ngOnInit() {
    console.log('🚀 App iniciada - verificando estado de autenticación...');
    
    // Debug: verificar localStorage directamente
    console.log('💾 Estado del localStorage:', {
      auth_isLogin: localStorage.getItem('auth_isLogin'),
      auth_token: localStorage.getItem('auth_token'),
      auth_user: localStorage.getItem('auth_user'),
      allLocalStorageKeys: Object.keys(localStorage)
    });
    
    // Debug: verificar estado inicial del AuthService
    console.log('🔐 Estado inicial AuthService:', {
      isAuthenticated: this.authService.isAuthenticated(),
      currentUser: this.authService.getCurrentUser(),
      hasToken: !!this.authService.getToken(),
      tokenInfo: this.authService.getTokenInfo()
    });

    // Suscribirse a cambios de estado de autenticación
    this.authSubscription = this.authService.isLogin$.subscribe(isLoggedIn => {
      console.log('🔄 Estado de login cambió:', isLoggedIn);
      if (isLoggedIn) {
        console.log('👤 Usuario actual:', this.authService.getCurrentUser());
      }
    });

    // Suscribirse a eventos de logout para redirigir a home
    this.logoutSubscription = this.authService.logout$.subscribe(() => {
      console.log('🚪 Logout detectado, redirigiendo a home...');
      this.router.navigate(['/home']);
    });

    // Suscribirse a cambios de título dinámico
    this.titleSubscription = this.pageTitleService.title$.subscribe(title => {
      this.layoutConfig = {
        ...this.layoutConfig,
        pageTitle: title
      };
    });

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
    if (this.titleSubscription) {
      this.titleSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.logoutSubscription) {
      this.logoutSubscription.unsubscribe();
    }
  }

  private updateLayoutConfig(url: string) {
    // Actualizar configuración según la ruta actual
    if (url === '/home' || url === '/') {
      // En home: sin botón back y sin título de página
      this.layoutConfig = {
        ...this.layoutConfig,
        showBackButton: false,
        pageTitle: ''
      };
      // También limpiar el servicio por si acaso
      this.pageTitleService.clearTitle();
    } else {
      // En otras páginas: mostrar botón back
      this.layoutConfig = {
        ...this.layoutConfig,
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
