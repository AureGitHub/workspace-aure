import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// Imports de la librería compartida
import { 
  AuthService, 
  AuthComponent, 
  AuthConfig, 
  LoginData, 
  RegisterData,
  User,
  BackendLoginRequest
} from 'shared-lib';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, IonicModule, AuthComponent],
  template: `
    <!-- Componente de autenticación (modal) -->
    <ion-modal 
      #authModal
      [isOpen]="showAuthModal"
      [canDismiss]="false"
      [backdropDismiss]="false">
      <lib-auth
        [config]="authConfig"
        (login)="onLogin($event)"
        (register)="onRegister($event)"
        (forgotPassword)="onForgotPassword($event)"
        (close)="onAuthClose()">
      </lib-auth>
    </ion-modal>

    <!-- Contenido principal (solo visible si está autenticado) -->
    <ion-content *ngIf="isAuthenticated" class="user-management-content">
        <!-- Header de bienvenida -->
        <div class="welcome-section">
          <div class="welcome-content">
            <ion-icon name="people-outline" class="welcome-icon"></ion-icon>
            <h1>Gestión de Usuarios</h1>
            <p>Panel de administración para la gestión completa de usuarios del sistema</p>
          </div>
        </div>

        <!-- Estadísticas rápidas -->
        <div class="stats-section">
          <ion-grid>
            <ion-row>
              <ion-col size="12" size-sm="6" size-md="3">
                <ion-card class="stat-card">
                  <ion-card-content>
                    <div class="stat-content">
                      <ion-icon name="people" color="primary" class="stat-icon"></ion-icon>
                      <div class="stat-info">
                        <h2>{{ totalUsers }}</h2>
                        <p>Total Usuarios</p>
                      </div>
                    </div>
                  </ion-card-content>
                </ion-card>
              </ion-col>
              
              <ion-col size="12" size-sm="6" size-md="3">
                <ion-card class="stat-card">
                  <ion-card-content>
                    <div class="stat-content">
                      <ion-icon name="checkmark-circle" color="success" class="stat-icon"></ion-icon>
                      <div class="stat-info">
                        <h2>{{ activeUsers }}</h2>
                        <p>Activos</p>
                      </div>
                    </div>
                  </ion-card-content>
                </ion-card>
              </ion-col>
              
              <ion-col size="12" size-sm="6" size-md="3">
                <ion-card class="stat-card">
                  <ion-card-content>
                    <div class="stat-content">
                      <ion-icon name="home" color="warning" class="stat-icon"></ion-icon>
                      <div class="stat-info">
                        <h2>{{ propertyOwners }}</h2>
                        <p>Propietarios</p>
                      </div>
                    </div>
                  </ion-card-content>
                </ion-card>
              </ion-col>
              
              <ion-col size="12" size-sm="6" size-md="3">
                <ion-card class="stat-card">
                  <ion-card-content>
                    <div class="stat-content">
                      <ion-icon name="key" color="tertiary" class="stat-icon"></ion-icon>
                      <div class="stat-info">
                        <h2>{{ tenants }}</h2>
                        <p>Inquilinos</p>
                      </div>
                    </div>
                  </ion-card-content>
                </ion-card>
              </ion-col>
            </ion-row>
          </ion-grid>
        </div>

        <!-- Lista de usuarios -->
        <div class="users-section">
          <div class="section-header">
            <h2>Lista de Usuarios</h2>
            <ion-button color="primary" (click)="refreshUsers()">
              <ion-icon name="refresh" slot="start"></ion-icon>
              Actualizar
            </ion-button>
          </div>

          <!-- Loading -->
          <div *ngIf="loading" class="loading-container">
            <ion-spinner name="circular"></ion-spinner>
            <p>Cargando usuarios...</p>
          </div>

          <!-- Lista de usuarios -->
          <ion-list *ngIf="!loading && users.length > 0" lines="full">
            <ion-item *ngFor="let user of users; trackBy: trackUser" class="user-item">
              <ion-avatar slot="start">
                <ion-icon name="person-circle-outline" class="avatar-icon"></ion-icon>
              </ion-avatar>
              
              <ion-label>
                <h2>{{ user.username }}</h2>
                <h3>{{ user.email }}</h3>
                <p>{{ user.first_name }} {{ user.last_name }}</p>
                <p>Rol: <span class="user-role" [class]="'role-' + user.user_type">{{ user.user_type }}</span></p>
              </ion-label>
              
              <ion-chip 
                slot="end" 
                [color]="user.is_active ? 'success' : 'medium'"
                class="status-chip">
                {{ user.is_active ? 'Activo' : 'Inactivo' }}
              </ion-chip>
              
              <ion-buttons slot="end">
                <ion-button fill="clear" (click)="editUser(user)">
                  <ion-icon name="pencil" slot="icon-only"></ion-icon>
                </ion-button>
                <ion-button fill="clear" color="danger" (click)="deleteUser(user)">
                  <ion-icon name="trash" slot="icon-only"></ion-icon>
                </ion-button>
              </ion-buttons>
            </ion-item>
          </ion-list>

          <!-- Empty state -->
          <div *ngIf="!loading && users.length === 0" class="empty-state">
            <ion-icon name="people-outline" class="empty-icon"></ion-icon>
            <h3>No hay usuarios</h3>
            <p>No se encontraron usuarios en el sistema</p>
            <ion-button color="primary" (click)="refreshUsers()">
              <ion-icon name="refresh" slot="start"></ion-icon>
              Recargar
            </ion-button>
          </div>
        </div>

        <!-- Error state -->
        <div *ngIf="error" class="error-state">
          <ion-icon name="alert-circle-outline" color="danger" class="error-icon"></ion-icon>
          <h3>Error al cargar datos</h3>
          <p>{{ error }}</p>
          <ion-button color="primary" (click)="refreshUsers()">
            <ion-icon name="refresh" slot="start"></ion-icon>
            Reintentar
          </ion-button>
        </div>
    </ion-content>

    <!-- Loading screen inicial -->
    <div *ngIf="!isAuthenticated && !showAuthModal" class="initial-loading">
      <ion-spinner name="circular"></ion-spinner>
      <p>Verificando autenticación...</p>
    </div>

    <!-- Toast para mensajes -->
    <ion-toast 
      [isOpen]="showToast"
      [message]="toastMessage"
      [duration]="3000"
      [color]="toastColor"
      position="bottom"
      (didDismiss)="showToast = false">
    </ion-toast>
  `,
  styles: [`
    .user-management-content {
      --background: var(--ion-color-light);
    }

    .welcome-section {
      padding: 40px 20px;
      text-align: center;
      background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-secondary) 100%);
      color: white;
    }

    .welcome-content h1 {
      font-size: 2rem;
      font-weight: bold;
      margin: 16px 0 8px;
    }

    .welcome-content p {
      opacity: 0.9;
      font-size: 1.1rem;
    }

    .welcome-icon {
      font-size: 3rem;
      color: white;
    }

    .stats-section {
      padding: 20px;
      background: white;
    }

    .stat-card {
      margin: 0;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      font-size: 2.5rem;
    }

    .stat-info h2 {
      font-size: 2rem;
      font-weight: bold;
      margin: 0;
      color: var(--ion-color-dark);
    }

    .stat-info p {
      margin: 4px 0 0;
      color: var(--ion-color-medium);
      font-size: 0.9rem;
    }

    .users-section {
      padding: 20px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .section-header h2 {
      color: var(--ion-color-dark);
      margin: 0;
    }

    .user-item {
      --background: white;
      margin-bottom: 8px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .avatar-icon {
      font-size: 2rem;
      color: var(--ion-color-medium);
    }

    .user-role {
      font-weight: 600;
      text-transform: capitalize;
    }

    .role-admin { color: var(--ion-color-danger); }
    .role-owner { color: var(--ion-color-warning); }
    .role-tenant { color: var(--ion-color-tertiary); }
    .role-user { color: var(--ion-color-primary); }

    .status-chip {
      font-size: 0.8rem;
    }

    .loading-container, .initial-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .loading-container p, .initial-loading p {
      margin-top: 16px;
      color: var(--ion-color-medium);
    }

    .empty-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .empty-icon, .error-icon {
      font-size: 4rem;
      margin-bottom: 20px;
      color: var(--ion-color-medium);
    }

    .empty-state h3, .error-state h3 {
      color: var(--ion-color-dark);
      margin-bottom: 8px;
    }

    .empty-state p, .error-state p {
      color: var(--ion-color-medium);
      margin-bottom: 20px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .section-header {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
      }
      
      .welcome-content h1 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class UserManagementPage implements OnInit, OnDestroy {
  @ViewChild('authModal') authModal!: any;

  // Estado de autenticación
  isAuthenticated = false;
  showAuthModal = false;
  private authSubscription?: Subscription;

  // Configuración del componente de auth
  authConfig: AuthConfig = {
    showLogo: false,
    title: 'Acceso Requerido',
    subtitle: 'Necesitas iniciar sesión para acceder a la gestión de usuarios',
    color: 'primary',
    allowRegistration: false,
    allowForgotPassword: false,
    allowRememberMe: true,
    minPasswordLength: 6
  };

  // Datos de usuarios
  users: any[] = [];
  loading = false;
  error: string | null = null;

  // Estadísticas
  totalUsers = 0;
  activeUsers = 0;
  propertyOwners = 0;
  tenants = 0;

  // UI State
  showToast = false;
  toastMessage = '';
  toastColor = 'success';

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.checkAuthentication();
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private checkAuthentication() {
    // Suscribirse a cambios en el estado de autenticación
    this.authSubscription = this.authService.isLogin$.subscribe(isLoggedIn => {
      this.isAuthenticated = isLoggedIn;
      
      if (isLoggedIn) {
        this.showAuthModal = false;
        this.loadUsers();
      } else {
        // Mostrar modal de autenticación
        setTimeout(() => {
          this.showAuthModal = true;
        }, 500);
      }
    });
  }

  async loadUsers() {
    this.loading = true;
    this.error = null;

    try {
      // Por ahora usaremos datos mock ya que no tenemos endpoint de usuarios
      // En el futuro, esto sería: const users = await this.apiService.getUsers().toPromise();
      
      // Simular loading para mejor UX
      await new Promise(resolve => setTimeout(resolve, 800));

      // Datos de usuarios desde el backend (estos son los que están en la base de datos)
      this.users = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@test.com',
          first_name: 'Admin',
          last_name: 'Sistema',
          user_type: 'admin',
          is_active: true
        },
        {
          id: 2,
          username: 'owner1',
          email: 'owner@test.com',
          first_name: 'Juan',
          last_name: 'Propietario',
          user_type: 'owner',
          is_active: true
        },
        {
          id: 3,
          username: 'tenant1',
          email: 'tenant@test.com',
          first_name: 'María',
          last_name: 'Inquilina',
          user_type: 'tenant',
          is_active: true
        },
        {
          id: 4,
          username: 'usuario_aure',
          email: 'aure@workspace.com',
          first_name: 'Aure',
          last_name: 'Usuario',
          user_type: 'admin',
          is_active: true
        }
      ];

      this.updateStats();
      this.showToastMessage('Usuarios cargados correctamente', 'success');
    } catch (error: any) {
      this.error = error.friendlyMessage || 'Error al cargar los usuarios. Por favor, inténtalo de nuevo.';
      this.showToastMessage('Error al cargar usuarios', 'danger');
      console.error('Error loading users:', error);
    } finally {
      this.loading = false;
    }
  }

  private updateStats() {
    this.totalUsers = this.users.length;
    this.activeUsers = this.users.filter(u => u.is_active).length;
    this.propertyOwners = this.users.filter(u => u.user_type === 'owner').length;
    this.tenants = this.users.filter(u => u.user_type === 'tenant').length;
  }

  // Eventos de autenticación
  async onLogin(loginData: LoginData) {
    try {
      // Usar el AuthService de shared-lib que ahora se comunica con el backend
      const loginRequest: BackendLoginRequest = {
        email: loginData.email,
        password: loginData.password
      };

      this.authService.loginWithCredentials(loginRequest).subscribe({
        next: (success) => {
          if (success) {
            this.showToastMessage('Inicio de sesión exitoso', 'success');
          } else {
            this.showToastMessage('Credenciales inválidas', 'danger');
          }
        },
        error: (error) => {
          this.showToastMessage(error.message || 'Error en el inicio de sesión', 'danger');
          console.error('Login error:', error);
        }
      });
    } catch (error: any) {
      this.showToastMessage('Error en el inicio de sesión', 'danger');
      console.error('Login error:', error);
    }
  }

  async onRegister(registerData: RegisterData) {
    // No usado ya que allowRegistration está en false
    console.log('Register:', registerData);
  }

  async onForgotPassword(data: { email: string }) {
    // No usado ya que allowForgotPassword está en false
    console.log('Forgot password:', data);
  }

  onAuthClose() {
    // No permitir cerrar sin autenticar, redirigir al home
    this.goHome();
  }

  // Navegación
  goHome() {
    this.router.navigate(['/home']);
  }

  logout() {
    // Cerrar sesión usando el AuthService de shared-lib
    this.authService.logout();
    
    this.showToastMessage('Sesión cerrada', 'success');
    this.goHome();
  }

  // Acciones de usuarios
  refreshUsers() {
    this.loadUsers();
  }

  editUser(user: any) {
    this.showToastMessage(`Editando usuario: ${user.username}`, 'warning');
    console.log('Edit user:', user);
  }

  deleteUser(user: any) {
    this.showToastMessage(`Usuario eliminado: ${user.username}`, 'danger');
    console.log('Delete user:', user);
    
    // Simular eliminación
    this.users = this.users.filter(u => u.id !== user.id);
    this.updateStats();
  }

  // Utilidades
  trackUser(index: number, user: any): any {
    return user.id;
  }

  private showToastMessage(message: string, color: string = 'success') {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
  }
}