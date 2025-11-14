import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ModalController } from '@ionic/angular';
import { PageTitleService } from '../services';
import { ApiService, SharedTableComponent, TableColumn, TableConfig } from 'shared-lib';
import { addIcons } from 'ionicons';
import { saveOutline } from 'ionicons/icons';
import { ArriendoFormModalComponent } from './arriendo-form-modal.component';

export interface Arriendo {
  id: number;
  catastroid: number;
  fechapago: Date;
  importe: number;
  quien: string;
  observaciones: string;
}

@Component({
  selector: 'app-ver-gestion-alquiler',
  standalone: true,
  imports: [CommonModule, IonicModule, SharedTableComponent],
  template: `
    <ion-content [fullscreen]="true" class="ver-gestion-alquiler-content">
      <div class="table-section">
        <div *ngIf="loading" class="loading-container">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Cargando alquileres...</p>
        </div>
        <ion-card *ngIf="error && !loading" class="error-card">
          <ion-card-content>
            <ion-icon name="alert-circle-outline" color="danger"></ion-icon>
            <h3>Error al cargar alquileres</h3>
            <p>{{ error }}</p>
            <ion-button fill="outline" color="primary" (click)="loadArriendos()">Reintentar</ion-button>
          </ion-card-content>
        </ion-card>
        <div *ngIf="!loading && !error" class="table-wrapper">
          <shared-table
            *ngIf="tableKey > 0"
            [data]="arriendos"
            [columns]="tableColumns"
            [config]="tableConfig"
            title="Alquileres"
            [showToolbar]="true"
            [showCaption]="true"
            [showActions]="true"
            [showAddButton]="true"
            [showEditButton]="true"
            [showDeleteButton]="true"
            [showExportButton]="false"
            emptyMessage="No hay alquileres registrados"
            (add)="onAddArriendo()"
            (edit)="onEditArriendo($event)"
            (delete)="onDeleteArriendo($event)"
            >
          </shared-table>
          <p class="debug-info">
            Última actualización: {{ lastUpdate | date:'HH:mm:ss' }} |
            Alquileres: {{ arriendos.length }} |
            Table Key: {{ tableKey }}
          </p>
        </div>
      </div>
      <ion-toast 
        [isOpen]="showToast"
        [message]="toastMessage"
        [duration]="3000"
        [color]="toastColor"
        position="bottom"
        (didDismiss)="showToast = false">
      </ion-toast>
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
    .ver-gestion-alquiler-content {
      background: var(--ion-color-light);
      padding: 20px;
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
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
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
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
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
    .table-wrapper {
      width: 100%;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      padding: 16px;
      margin-bottom: 40px;
    }
    .debug-info {
      text-align: center;
      color: var(--ion-color-medium);
      font-size: 0.8rem;
      margin-top: 16px;
      font-style: italic;
    }
    @media (max-width: 768px) {
      .table-section {
        padding-bottom: 60px;
      }
    }
  `]
})
export class VerGestionAlquilerPage implements OnInit {
  arriendos: Arriendo[] = [];
  loading = false;
  error: string | null = null;
  lastUpdate: Date = new Date();
  tableKey: number = 0;
  showToast = false;
  toastMessage = '';
  toastColor = 'success';
  showAlert = false;
  alertMessage = '';
  alertButtons: any[] = [];
  tableColumns: TableColumn[] = [
    { field: 'direccion', header: 'direccion', sortable: true, filterable: true },
    {
      field: 'arriendotipoid',
      header: 'Tipo',
      sortable: true,
      type: 'text',
      width: '120px',
      displayFn: (row: any) => {
        if (row.arriendotipoid === 1) return 'Mensual';
        if (row.arriendotipoid === 2) return 'Anual';
        return '';
      }
    },
    { field: 'fechapago', header: 'F.Pago', sortable: true, type: 'date', width: '150px' },
    { field: 'importe', header: 'Importe', sortable: true, type: 'number' },
    { field: 'quien', header: 'Inquilino', sortable: true, filterable: true },
    { field: 'observaciones', header: 'Obser.', filterable: true }
  ];
  tableConfig: TableConfig = {
    paginator: true,
    rows: 10,
    rowsPerPageOptions: [5, 10, 25, 50],
    selectionMode: 'multiple',
    showCurrentPageReport: true,
    globalFilterFields: ['catastroid', 'quien', 'observaciones']
  };

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private pageTitleService: PageTitleService,
    private alertController: AlertController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    addIcons({ 'save': saveOutline });
    this.pageTitleService.setTitle('Gestión de Alquileres');
    this.tableKey = 1;
    this.loadArriendos();
  }


  loadArriendos() {
    this.loading = true;
    this.error = null;
    
    this.apiService.get<{success: boolean, data: Arriendo[]}>('/app-alquiler/arriendos')
      .subscribe({
        next: (response) => {
            console.log('loadArriendos...',response);
          if (response.success && Array.isArray(response.data)) {
            this.arriendos = [...response.data];
          } else {
            this.arriendos = [];
          }
          this.lastUpdate = new Date();
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.error = err.message || 'Error al cargar alquileres';
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  onAddArriendo() {
    this.openAddArriendoModal();
  }

  async openAddArriendoModal() {
    const modal = await this.modalController.create({
      component: ArriendoFormModalComponent,
      componentProps: {
        isEdit: false
      }
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data) {
      this.loadArriendos();
    }
  }

  createArriendo(data: Omit<Arriendo, 'id'>) {
    this.apiService.post<{success: boolean, data: Arriendo}>(
      '/app-alquiler/arriendo',
      data
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.showToastMessage('Arriendo creado correctamente', 'success');
          this.loadArriendos();
        } else {
          this.showToastMessage('No se pudo crear el arriendo', 'danger');
        }
      },
      error: () => {
        this.showToastMessage('Error al crear el arriendo', 'danger');
      }
    });
  }

  onEditArriendo(arriendo: Arriendo) {
    this.openEditArriendoModal(arriendo);
  }

  async openEditArriendoModal(arriendo: Arriendo) {
    const modal = await this.modalController.create({
      component: ArriendoFormModalComponent,
      componentProps: {
        isEdit: true,
        arriendo: arriendo
      }
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm' && data) {
      this.loadArriendos();
    }
  }

  updateArriendo(id: number, data: Partial<Omit<Arriendo, 'id'>>) {
    this.apiService.put<{success: boolean, data: Arriendo}>(
      `/app-alquiler/arriendo/${id}`,
      data
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.showToastMessage('Arriendo actualizado correctamente', 'success');
          this.loadArriendos();
        } else {
          this.showToastMessage('No se pudo actualizar el arriendo', 'danger');
        }
      },
      error: () => {
        this.showToastMessage('Error al actualizar el arriendo', 'danger');
      }
    });
  }

  onDeleteArriendo(arriendo: Arriendo) {
    this.confirmDeleteArriendo(arriendo);
  }

  async confirmDeleteArriendo(arriendo: Arriendo) {
    const alert = await this.alertController.create({
      header: 'Eliminar Arriendo',
      message: `¿Seguro que quieres eliminar el arriendo de <b>${arriendo.quien}</b> (ID: ${arriendo.id})?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'confirm',
          handler: () => this.deleteArriendo(arriendo.id)
        }
      ]
    });
    await alert.present();
  }

  deleteArriendo(id: number) {
    this.apiService.delete<{success: boolean, data: Arriendo}>(`/app-alquiler/arriendos/${id}`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.showToastMessage('Arriendo eliminado correctamente', 'success');
            this.loadArriendos();
          } else {
            this.showToastMessage('No se pudo eliminar el arriendo', 'danger');
          }
        },
        error: () => {
          this.showToastMessage('Error al eliminar el arriendo', 'danger');
        }
      });
  }

  showToastMessage(message: string, color: string = 'success') {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
  }
}
