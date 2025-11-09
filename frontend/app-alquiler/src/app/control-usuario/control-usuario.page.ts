import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  peopleOutline, 
  personAddOutline, 
  settingsOutline,
  shieldCheckmarkOutline,
  arrowBackOutline,
  personOutline,
  refreshOutline,
  alertCircleOutline,
  closeOutline,
  saveOutline
} from 'ionicons/icons';

// Imports de la librería compartida
import { 
  AuthService, 
  ApiService, 
  SharedTableComponent, 
  TableColumn, 
  TableConfig 
} from 'shared-lib';

// Import del servicio de título
import { PageTitleService } from '../services/page-title.service';

// Import del modal de formulario
import { UserFormModalComponent } from './user-form-modal.component';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  user_type?: 'admin' | 'owner' | 'tenant'; // Para compatibilidad hacia atrás
  profile_id: number;
  profile_description?: string; // Información del perfil desde el JOIN
  created_at: string;
  updated_at?: string;
}

@Component({
  selector: 'app-control-usuario',
  standalone: true,
  imports: [CommonModule, IonicModule, SharedTableComponent],
  template: `
    <ion-content [fullscreen]="true" class="control-usuario-content">
      <!-- Table Section -->
      <div class="table-section">
        <!-- Loading -->
        <div *ngIf="loading" class="loading-container">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Cargando usuarios...</p>
        </div>

        <!-- Error -->
        <ion-card *ngIf="error && !loading" class="error-card">
          <ion-card-content>
            <ion-icon name="alert-circle-outline" color="danger"></ion-icon>
            <h3>Error al cargar usuarios</h3>
            <p>{{ error }}</p>
            <ion-button fill="outline" color="primary" (click)="loadUsers()">
              Reintentar
            </ion-button>
          </ion-card-content>
        </ion-card>

        <!-- Users Table -->
        <div *ngIf="!loading && !error" class="table-wrapper">
          <!-- Usar *ngIf con tableKey para forzar recreación cuando sea necesario -->
          <shared-table
            *ngIf="tableKey > 0"
            [data]="users"
            [columns]="tableColumns"
            [config]="tableConfig"
            title="Usuarios del Sistema"
            [showToolbar]="true"
            [showCaption]="true"
            [showActions]="true"
            [showAddButton]="true"
            [showEditButton]="true"
            [showDeleteButton]="true"
            [showExportButton]="false"
            emptyMessage="No hay usuarios registrados en el sistema"
            (add)="onAddUser()"
            (edit)="onEditUser($event)"
            (delete)="onDeleteUser($event)"
            (selectionChange)="onSelectionChange($event)">
          </shared-table>
          
          <!-- Debug: Mostrar información de actualización -->
          <p class="debug-info">
            Última actualización: {{ lastUpdate | date:'HH:mm:ss' }} | 
            Usuarios: {{ users.length }} | 
            Table Key: {{ tableKey }}
          </p>
        </div>
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

      <!-- Alert para confirmaciones -->
      <ion-alert
        [isOpen]="showAlert"
        header="Confirmar Acción"
        [message]="alertMessage"
        [buttons]="alertButtons"
        (didDismiss)="showAlert = false">
      </ion-alert>
    </ion-content>
  `,
  styles: [`
    .control-usuario-content {
      background: var(--ion-color-light);
    }

    .table-section {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      padding-bottom: 40px;
    }

    .loading-container {
      text-align: center;
      padding: 40px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .loading-container ion-spinner {
      margin-bottom: 16px;
    }

    .loading-container p {
      color: var(--ion-color-medium);
      margin: 0;
    }

    .error-card {
      text-align: center;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .error-card ion-icon {
      font-size: 3rem;
      margin-bottom: 16px;
    }

    .error-card h3 {
      color: var(--ion-color-danger);
      margin-bottom: 8px;
    }

    .error-card p {
      color: var(--ion-color-medium);
      margin-bottom: 20px;
    }

    /* Wrapper para la tabla */
    .table-wrapper {
      width: 100%;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 16px;
      margin-bottom: 40px;
    }

    /* Debug info */
    .debug-info {
      text-align: center;
      color: var(--ion-color-medium);
      font-size: 0.8rem;
      margin-top: 16px;
      font-style: italic;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .table-section {
        padding-bottom: 60px;
      }
    }
  `]
})
export class ControlUsuarioPage implements OnInit {
  users: User[] = [];
  profiles: any[] = []; // Lista de perfiles disponibles
  loading = false;
  error: string | null = null;
  lastUpdate: Date = new Date();
  tableKey: number = 0; // Para forzar recreación del componente
  
  // Toast para mensajes
  showToast = false;
  toastMessage = '';
  toastColor = 'success';

  // Alert para confirmaciones
  showAlert = false;
  alertMessage = '';
  alertButtons: any[] = [];

  // Configuración de la tabla
  tableColumns: TableColumn[] = [
    {
      field: 'id',
      header: 'ID',
      sortable: true,
      width: '80px',
      type: 'number'
    },
    {
      field: 'first_name',
      header: 'Nombre',
      sortable: true,
      filterable: true
    },
    {
      field: 'last_name',
      header: 'Apellidos',
      sortable: true,
      filterable: true
    },
    {
      field: 'email',
      header: 'Email',
      sortable: true,
      filterable: true
    },
    {
      field: 'profile_description',
      header: 'Perfil',
      sortable: true,
      filterable: true,
      type: 'tag'
    },
    {
      field: 'created_at',
      header: 'Fecha Creación',
      sortable: true,
      type: 'date',
      width: '150px'
    }
  ];

  tableConfig: TableConfig = {
    paginator: true,
    rows: 10,
    rowsPerPageOptions: [5, 10, 25, 50],
    selectionMode: 'multiple',
    showCurrentPageReport: true,
    globalFilterFields: ['first_name', 'last_name', 'email', 'profile_description']
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService,
    private alertController: AlertController,
    private modalController: ModalController,
    private cdr: ChangeDetectorRef,
    private pageTitleService: PageTitleService
  ) {
    // Registrar iconos de Ionicons
    addIcons({
      'people-outline': peopleOutline,
      'person-add-outline': personAddOutline,
      'settings-outline': settingsOutline,
      'shield-checkmark-outline': shieldCheckmarkOutline,
      'arrow-back-outline': arrowBackOutline,
      'person-outline': personOutline,
      'refresh-outline': refreshOutline,
      'alert-circle-outline': alertCircleOutline,
      'close': closeOutline,
      'save': saveOutline
    });
  }

  ngOnInit() {
    console.log('ControlUsuario page loaded');
    
    // Configurar título de la página
    this.pageTitleService.setTitle('Control de Usuarios');
    
    // Inicializar tableKey
    this.tableKey = 1;
    
    // Verificar que el usuario es admin (doble verificación)
    if (!this.authService.isAdmin()) {
      console.warn('⚠️ Usuario no autorizado intentando acceder a Control de Usuarios');
      this.router.navigate(['/no-permitido']);
      return;
    }
    
    console.log('👨‍💼 Usuario admin accediendo a Control de Usuarios');
    
    // Cargar perfiles y usuarios
    this.loadProfiles();
    this.loadUsers();
  }

  loadUsers() {
    console.log('🔄 loadUsers() iniciado...');
    this.loading = true;
    this.error = null;

    // Usar el ApiService configurado para hacer la petición
    this.apiService.get<{success: boolean, data: User[]}>('/app-alquiler/users')
      .subscribe({
        next: (response) => {
          console.log('✅ Respuesta del servidor (loadUsers):', response);
          if (response.success && response.data) {
            console.log('📊 Actualizando array de usuarios con:', response.data.length, 'usuarios');
            // Crear nueva referencia del array para forzar re-render
            this.users = [...response.data];
            console.log('📊 Array users actualizado:', this.users);
          } else {
            console.log('⚠️ Respuesta sin datos válidos, limpiando array');
            this.users = [];
          }
          
          // Forzar detección de cambios y refresh de tabla
          this.lastUpdate = new Date();
          this.loading = false;
          this.forceTableRefresh();
          console.log('✅ loadUsers() completado');
        },
        error: (error) => {
          console.error('❌ Error al cargar usuarios:', error);
          this.error = error.message || 'Error al cargar usuarios';
          this.loading = false;
          this.showToastMessage('Error al cargar usuarios', 'danger');
        }
      });
  }

  loadProfiles() {
    console.log('🔄 loadProfiles() iniciado...');
    
    // Usar el ApiService para obtener los perfiles
    this.apiService.get<{success: boolean, data: any[]}>('/app-alquiler/profiles')
      .subscribe({
        next: (response) => {
          console.log('✅ Respuesta del servidor (loadProfiles):', response);
          if (response.success && response.data) {
            console.log('📊 Perfiles obtenidos:', response.data.length, 'perfiles');
            this.profiles = response.data;
          } else {
            console.log('⚠️ Respuesta sin datos válidos de perfiles');
            this.profiles = [];
          }
        },
        error: (error) => {
          console.error('❌ Error al cargar perfiles:', error);
          this.profiles = [];
          this.showToastMessage('Error al cargar perfiles', 'danger');
        }
      });
  }

  refreshUsers() {
    this.showToastMessage('Actualizando usuarios...', 'primary');
    this.loadUsers();
  }

  async onAddUser() {
    console.log('➕ Añadiendo nuevo usuario...');
    
    const modal = await this.modalController.create({
      component: UserFormModalComponent,
      componentProps: {
        isEdit: false,
        profiles: this.profiles
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    
    if (role === 'confirm' && data) {
      console.log('📝 Datos recibidos del modal:', data);
      this.createUser(data);
    }
  }

  async onEditUser(user: User) {
    console.log('✏️ Editando usuario:', user);
    
    const modal = await this.modalController.create({
      component: UserFormModalComponent,
      componentProps: {
        isEdit: true,
        user: user,
        profiles: this.profiles
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    
    if (role === 'confirm' && data) {
      console.log('📝 Datos recibidos del modal:', data);
      this.updateUser(user.id, data);
    }
  }

  onDeleteUser(user: User) {
    this.alertMessage = `¿Estás seguro de que quieres eliminar al usuario "${user.first_name} ${user.last_name}"?`;
    this.alertButtons = [
      {
        text: 'Cancelar',
        role: 'cancel',
        cssClass: 'secondary'
      },
      {
        text: 'Eliminar',
        cssClass: 'danger',
        handler: () => {
          this.deleteUser(user);
        }
      }
    ];
    this.showAlert = true;
  }

  private deleteUser(user: User) {
    // No poner loading = true aquí porque loadUsers() ya maneja el estado de carga
    
    this.apiService.delete(`/app-alquiler/users/${user.id}`)
      .subscribe({
        next: (response) => {
          console.log('✅ Usuario eliminado:', response);
          this.showToastMessage(`Usuario ${user.first_name} ${user.last_name} eliminado correctamente`, 'success');
          this.loadUsers(); // Recargar la lista (loadUsers maneja el loading)
        },
        error: (error) => {
          console.error('❌ Error al eliminar usuario:', error);
          this.showToastMessage('Error al eliminar usuario', 'danger');
        }
      });
  }

  private updateUser(userId: number, updateData: Partial<User>) {
    console.log('🔄 Actualizando usuario:', userId, updateData);
    console.log('📊 Usuarios ANTES de actualizar:', this.users.length, this.users);
    
    this.apiService.put<{success: boolean, data: User}>(`/app-alquiler/users/${userId}`, updateData)
      .subscribe({
        next: (response) => {
          console.log('✅ Usuario actualizado exitosamente:', response);
          
          if (response.success && response.data) {
            this.showToastMessage(`Usuario ${response.data.first_name} ${response.data.last_name} actualizado correctamente`, 'success');
            
            // Actualización optimista: actualizar directamente en el array local
            const userIndex = this.users.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
              console.log('🔄 Actualizando usuario localmente en índice:', userIndex);
              this.users[userIndex] = { ...this.users[userIndex], ...response.data };
              console.log('📊 Usuario actualizado localmente:', this.users[userIndex]);
              
              // Forzar recreación de la tabla incrementando la key
              this.forceTableRefresh();
            }
          } else {
            this.showToastMessage('Usuario actualizado correctamente', 'success');
          }
          
          // También recargar desde el servidor para estar seguro
          console.log('� Recargando desde servidor...');
          this.loadUsers();
        },
        error: (error) => {
          console.error('❌ Error al actualizar usuario:', error);
          let errorMessage = 'Error al actualizar usuario';
          
          // Manejar errores específicos
          if (error.status === 409) {
            errorMessage = 'El email ya está en uso por otro usuario';
          } else if (error.status === 404) {
            errorMessage = 'Usuario no encontrado';
          } else if (error.status === 400) {
            errorMessage = error.error?.message || 'Datos inválidos';
          }
          
          this.showToastMessage(errorMessage, 'danger');
        }
      });
  }

  onSelectionChange(selectedUsers: User[]) {
    console.log('📋 Usuarios seleccionados:', selectedUsers);
    if (selectedUsers.length > 0) {
      this.showToastMessage(`${selectedUsers.length} usuario(s) seleccionado(s)`, 'primary');
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  private createUser(userData: {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    profile_id: number;
  }) {
    console.log('🔄 Creando usuario en backend:', userData);
    console.log('🌐 Enviando petición POST a backend...');
    console.log('📦 Datos a enviar:', userData);
    console.log('🔧 ApiService disponible:', !!this.apiService);
    console.log('🔐 Token disponible:', !!this.authService.getToken());
    console.log('🔐 Token actual:', this.authService.getToken());
    
    // Usar ApiService como los otros métodos que funcionan
    console.log('📡 Iniciando llamada POST...');
    this.apiService.post<{success: boolean, data: User}>('/app-alquiler/users', userData)
      .subscribe({
        next: (response) => {
          console.log('✅ Respuesta del servidor (createUser):', response);
          console.log('✅ Tipo de respuesta:', typeof response);
          console.log('✅ Response.success:', response?.success);
          console.log('✅ Response.data:', response?.data);
          
          if (response && response.success && response.data) {
            console.log('✅ Usuario creado exitosamente:', response.data);
            this.showToastMessage('Usuario creado exitosamente', 'success');
            
            // Recargar la tabla para mostrar el nuevo usuario
            this.loadUsers(); // Usar loadUsers() para recargar datos frescos
          } else {
            console.error('❌ Error en respuesta del servidor:', response);
            this.showToastMessage('Error al crear usuario en el servidor', 'danger');
          }
        },
        error: (error) => {
          console.error('❌ Error completo al crear usuario:', error);
          console.error('❌ Error status:', error?.status);
          console.error('❌ Error message:', error?.message);
          console.error('❌ Error error:', error?.error);
          console.error('❌ Error url:', error?.url);
          this.showToastMessage(`Error de conexión: ${error?.message || 'Error desconocido'}`, 'danger');
        },
        complete: () => {
          console.log('🏁 Petición POST completada');
        }
      });
  }

  private showToastMessage(message: string, color: string = 'success') {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
  }

  private forceTableRefresh() {
    console.log('🔄 Forzando refresh de la tabla...');
    
    // Método 1: Incrementar key para forzar recreación
    this.tableKey++;
    
    // Método 2: Forzar detección de cambios
    this.cdr.detectChanges();
    
    // Método 3: Pequeño delay para asegurar que Angular procese los cambios
    setTimeout(() => {
      this.cdr.detectChanges();
      console.log('✅ Refresh de tabla completado, key:', this.tableKey);
    }, 10);
  }
}