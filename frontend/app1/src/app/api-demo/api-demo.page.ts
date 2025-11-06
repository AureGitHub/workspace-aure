import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonSpinner,
  IonList,
  IonAvatar,
  IonChip,
  IonToast
} from '@ionic/angular/standalone';
import { ApiService, AppLayoutComponent, AppLayoutConfig } from 'shared-lib';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { download, add, create, trash, time, refresh } from 'ionicons/icons';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  company?: {
    name: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Component({
  selector: 'app-api-demo',
  template: `
    <lib-app-layout [config]="layoutConfig">
      <div class="api-demo-container">
        <h2>Demo del ApiService</h2>
        
        <!-- Configuración de API -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Configuración de API</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-label position="stacked">URL Base de la API</ion-label>
              <ion-input 
                [(ngModel)]="apiBaseUrl" 
                placeholder="https://jsonplaceholder.typicode.com">
              </ion-input>
            </ion-item>
            <ion-button expand="block" (click)="configureApi()" [disabled]="!apiBaseUrl">
              Configurar API
            </ion-button>
            <p class="config-status">
              Estado: {{ apiService.isConfigured() ? 'Configurado ✅' : 'No configurado ❌' }}
            </p>
            <p class="config-info" *ngIf="apiService.isConfigured()">
              URL Base: {{ apiService.getBaseUrl() }}
            </p>
          </ion-card-content>
        </ion-card>

        <!-- Operaciones CRUD -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Operaciones HTTP</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="button-grid">
              <ion-button expand="block" (click)="testGet()" [disabled]="!apiService.isConfigured() || loading">
                <ion-icon name="download" slot="start"></ion-icon>
                GET - Obtener Usuarios
              </ion-button>
              
              <ion-button expand="block" (click)="testPost()" [disabled]="!apiService.isConfigured() || loading">
                <ion-icon name="add" slot="start"></ion-icon>
                POST - Crear Usuario
              </ion-button>
              
              <ion-button expand="block" (click)="testPut()" [disabled]="!apiService.isConfigured() || loading">
                <ion-icon name="create" slot="start"></ion-icon>
                PUT - Actualizar Usuario
              </ion-button>
              
              <ion-button expand="block" (click)="testDelete()" [disabled]="!apiService.isConfigured() || loading">
                <ion-icon name="trash" slot="start"></ion-icon>
                DELETE - Eliminar Usuario
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Estado de carga -->
        <ion-card *ngIf="loading">
          <ion-card-content class="loading-card">
            <ion-spinner></ion-spinner>
            <p>Realizando petición HTTP...</p>
          </ion-card-content>
        </ion-card>

        <!-- Resultados -->
        <ion-card *ngIf="result">
          <ion-card-header>
            <ion-card-title>Resultado de la Petición</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="result-info">
              <p><strong>Método:</strong> {{ lastMethod }}</p>
              <p><strong>Endpoint:</strong> {{ lastEndpoint }}</p>
              <p><strong>Estado:</strong> 
                <span [class]="resultStatus === 'success' ? 'success' : 'error'">
                  {{ resultStatus === 'success' ? 'Éxito ✅' : 'Error ❌' }}
                </span>
              </p>
            </div>
            <pre class="result-data">{{ result }}</pre>
          </ion-card-content>
        </ion-card>

        <!-- Lista de usuarios -->
        <ion-card *ngIf="users.length > 0">
          <ion-card-header>
            <ion-card-title>Usuarios Cargados ({{ users.length }})</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item *ngFor="let user of users; let i = index" [button]="true" (click)="selectUser(user)">
                <ion-avatar slot="start">
                  <div class="user-avatar">{{ user.name.charAt(0) }}</div>
                </ion-avatar>
                <ion-label>
                  <h3>{{ user.name }}</h3>
                  <p>{{ user.email }}</p>
                  <p *ngIf="user.company">{{ user.company.name }}</p>
                </ion-label>
                <ion-chip slot="end" color="primary">ID: {{ user.id }}</ion-chip>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Herramientas de Testing -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Herramientas de Testing</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-button expand="block" (click)="testTimeout()" [disabled]="loading">
              <ion-icon name="time" slot="start"></ion-icon>
              Test Timeout (URL inválida)
            </ion-button>
            
            <ion-button expand="block" (click)="testRetry()" [disabled]="loading">
              <ion-icon name="refresh" slot="start"></ion-icon>
              Test Retry (Endpoint inexistente)
            </ion-button>
            
            <ion-button expand="block" (click)="clearResults()">
              <ion-icon name="trash" slot="start"></ion-icon>
              Limpiar Resultados
            </ion-button>
          </ion-card-content>
        </ion-card>

        <!-- Información técnica -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Configuración Actual</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <pre class="config-display">{{ getConfigInfo() }}</pre>
          </ion-card-content>
        </ion-card>
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
    </lib-app-layout>
  `,
  styles: [`
    .api-demo-container {
      padding: 1rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .button-grid {
      display: grid;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .loading-card {
      text-align: center;
      padding: 2rem;
    }

    .loading-card ion-spinner {
      margin-bottom: 1rem;
    }

    .result-info {
      margin-bottom: 1rem;
    }

    .result-info .success {
      color: var(--ion-color-success);
    }

    .result-info .error {
      color: var(--ion-color-danger);
    }

    .result-data {
      background: var(--ion-color-light);
      padding: 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      overflow-x: auto;
      white-space: pre-wrap;
      max-height: 300px;
      overflow-y: auto;
    }

    .config-status {
      margin: 0.5rem 0;
      font-weight: 500;
    }

    .config-info {
      font-size: 0.9rem;
      color: var(--ion-color-medium);
    }

    .config-display {
      background: var(--ion-color-light);
      padding: 1rem;
      border-radius: 8px;
      font-size: 0.8rem;
      overflow-x: auto;
    }

    .user-avatar {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--ion-color-primary);
      color: white;
      font-weight: bold;
      font-size: 1.2rem;
    }

    @media (max-width: 768px) {
      .api-demo-container {
        padding: 0.5rem;
      }
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner,
    IonList,
    IonAvatar,
    IonChip,
    IonToast,
    AppLayoutComponent
  ]
})
export class ApiDemoPage implements OnInit {
  // Layout configuration
  layoutConfig: AppLayoutConfig = {
    showHeader: true,
    showFooter: true,
    headerTitle: 'Demo ApiService',
    headerSubtitle: 'Prueba todas las funcionalidades del servicio HTTP',
    footerText: 'ApiService Demo © 2025',
    showBackButton: true,
    showMenuButton: true,
    showUserProfile: true
  };

  // API Configuration
  apiBaseUrl = 'https://jsonplaceholder.typicode.com';
  
  // State
  loading = false;
  users: User[] = [];
  result: string = '';
  resultStatus: 'success' | 'error' = 'success';
  lastMethod = '';
  lastEndpoint = '';

  // Toast
  showToast = false;
  toastMessage = '';
  toastColor = 'success';

  constructor(public apiService: ApiService) {
    // Registrar iconos
    addIcons({ download, add, create, trash, time, refresh });
  }

  ngOnInit() {
    // Configurar API por defecto
    this.configureApi();
  }

  configureApi() {
    if (!this.apiBaseUrl) {
      this.showToastMessage('Por favor ingresa una URL válida', 'warning');
      return;
    }

    this.apiService.configure({
      baseUrl: this.apiBaseUrl,
      timeout: 15000,
      retryAttempts: 2,
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Demo-Client': 'SharedLib-ApiService'
      }
    });

    this.showToastMessage('API configurada correctamente', 'success');
  }

  async testGet() {
    this.setLoading(true, 'GET', '/users');
    
    try {
      const users = await this.apiService.get<User[]>('/users').toPromise();
      
      this.users = users?.slice(0, 5) || []; // Mostrar solo los primeros 5
      this.setResult(JSON.stringify(users?.slice(0, 3), null, 2), 'success');
      this.showToastMessage(`${users?.length || 0} usuarios cargados`, 'success');
      
    } catch (error: any) {
      this.setResult(JSON.stringify(error, null, 2), 'error');
      this.showToastMessage(`Error al cargar usuarios: ${error.message}`, 'danger');
    } finally {
      this.setLoading(false);
    }
  }

  async testPost() {
    this.setLoading(true, 'POST', '/users');
    
    const newUser = {
      name: 'Usuario Demo',
      email: 'demo@example.com',
      phone: '+1234567890',
      website: 'demo.example.com',
      company: {
        name: 'Demo Company'
      }
    };

    try {
      const createdUser = await this.apiService.post<User>('/users', newUser).toPromise();
      
      this.setResult(JSON.stringify(createdUser, null, 2), 'success');
      this.showToastMessage('Usuario creado correctamente', 'success');
      
    } catch (error: any) {
      this.setResult(JSON.stringify(error, null, 2), 'error');
      this.showToastMessage(`Error al crear usuario: ${error.message}`, 'danger');
    } finally {
      this.setLoading(false);
    }
  }

  async testPut() {
    this.setLoading(true, 'PUT', '/users/1');
    
    const updatedUser = {
      id: 1,
      name: 'Usuario Actualizado',
      email: 'updated@example.com',
      phone: '+0987654321'
    };

    try {
      const result = await this.apiService.put<User>('/users/1', updatedUser).toPromise();
      
      this.setResult(JSON.stringify(result, null, 2), 'success');
      this.showToastMessage('Usuario actualizado correctamente', 'success');
      
    } catch (error: any) {
      this.setResult(JSON.stringify(error, null, 2), 'error');
      this.showToastMessage(`Error al actualizar usuario: ${error.message}`, 'danger');
    } finally {
      this.setLoading(false);
    }
  }

  async testDelete() {
    this.setLoading(true, 'DELETE', '/users/1');
    
    try {
      const result = await this.apiService.delete('/users/1').toPromise();
      
      this.setResult(JSON.stringify(result, null, 2), 'success');
      this.showToastMessage('Usuario eliminado correctamente', 'success');
      
    } catch (error: any) {
      this.setResult(JSON.stringify(error, null, 2), 'error');
      this.showToastMessage(`Error al eliminar usuario: ${error.message}`, 'danger');
    } finally {
      this.setLoading(false);
    }
  }

  async testTimeout() {
    this.setLoading(true, 'GET', '/timeout-test');
    
    // Configurar timeout muy corto para forzar error
    const originalConfig = this.apiService.getConfig();
    this.apiService.configure({ ...originalConfig, timeout: 1 });

    try {
      await this.apiService.get('https://httpstat.us/200?sleep=5000').toPromise();
    } catch (error: any) {
      this.setResult(JSON.stringify(error, null, 2), 'error');
      this.showToastMessage('Timeout simulado correctamente', 'warning');
    } finally {
      // Restaurar configuración original
      this.apiService.configure(originalConfig);
      this.setLoading(false);
    }
  }

  async testRetry() {
    this.setLoading(true, 'GET', '/nonexistent-endpoint');
    
    try {
      await this.apiService.get('/nonexistent-endpoint-404').toPromise();
    } catch (error: any) {
      this.setResult(JSON.stringify(error, null, 2), 'error');
      this.showToastMessage('Error 404 - Endpoint no encontrado', 'warning');
    } finally {
      this.setLoading(false);
    }
  }

  selectUser(user: User) {
    this.setResult(JSON.stringify(user, null, 2), 'success');
    this.showToastMessage(`Usuario seleccionado: ${user.name}`, 'primary');
  }

  clearResults() {
    this.result = '';
    this.users = [];
    this.lastMethod = '';
    this.lastEndpoint = '';
    this.showToastMessage('Resultados limpiados', 'medium');
  }

  getConfigInfo(): string {
    if (!this.apiService.isConfigured()) {
      return 'API no configurada';
    }

    const config = this.apiService.getConfig();
    return JSON.stringify({
      baseUrl: config.baseUrl,
      timeout: config.timeout,
      retryAttempts: config.retryAttempts,
      defaultHeaders: config.defaultHeaders
    }, null, 2);
  }

  private setLoading(loading: boolean, method?: string, endpoint?: string) {
    this.loading = loading;
    if (method && endpoint) {
      this.lastMethod = method;
      this.lastEndpoint = endpoint;
    }
  }

  private setResult(result: string, status: 'success' | 'error') {
    this.result = result;
    this.resultStatus = status;
  }

  private showToastMessage(message: string, color: string = 'success') {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
  }
}