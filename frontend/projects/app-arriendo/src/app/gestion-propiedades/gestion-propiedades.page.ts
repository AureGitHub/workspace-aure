// ...existing code...
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';

import {
  businessOutline,
  alertCircleOutline,
  homeOutline,
  leafOutline
} from 'ionicons/icons';
import { PageTitleService } from '../services';
import { ApiService } from 'shared-lib';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTree, faBuilding, faInfoCircle, faEuroSign } from '@fortawesome/free-solid-svg-icons';
import { ModalController } from '@ionic/angular';

import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonSpinner, IonCard, IonCardContent, IonIcon, IonCardHeader, IonCardTitle, IonCardSubtitle, IonModal, IonButtons, IonButton } from '@ionic/angular/standalone';
import { IonCheckbox } from '@ionic/angular/standalone';
import { IonInput } from '@ionic/angular/standalone';

interface Catastro {
  id: number;
  fechapago: Date,
  importe: number;
   quien: string;
  catastrotipoid: number;
  felipe: boolean;
  referenciacatastral: string;
  direccion: string;
  poligono?: string;
  parcela?: string;
  superficieconstruida: number;
  superficieparcela: number;
  uso: string;
  valorsuelo: number;
  valorconstruccion: number;
  valorcatastral: number;
}

interface PagoCatastro{
    fechapago: Date,
  importe: number;
   quien: string;  
}

@Component({
  selector: 'app-gestion-propiedades',
  standalone: true,
  imports: [
    CommonModule,  FormsModule,
    IonContent, FontAwesomeModule, IonItem, IonLabel, IonSpinner, IonCard, IonCardContent, IonIcon, IonCardHeader, IonCardTitle, IonCardSubtitle, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonCheckbox, IonInput],
    providers: [ModalController],
  
  template: `
    <ion-content [fullscreen]="true" class="gestion-propiedades-content">
      <div class="table-section">
        <!-- Buscador con check Felipe, Agrario, Residencial y búsqueda por texto -->
        <div class="search-section">
          <div class="search-row">
            <ion-item style="flex: 1;">
              <ion-label class="buscador-label">Buscar</ion-label>
              <ion-input [value]="searchText" (ionInput)="searchText = ($event.target && $event.target.value) ? ('' + $event.target.value) : ''; onSearchChange()" placeholder="Dirección o referencia..." class="buscador-input"></ion-input>
            </ion-item>
          </div>
          <div class="checks-row">
            <div class="check-col">
              <div class="check-label">Felipe</div>
                <ion-checkbox [checked]="showFelipe" (ionChange)="showFelipe = $event.detail.checked; onFelipeChange()"></ion-checkbox>
            </div>
            <div class="check-col">
              <div class="check-label">Agrario</div>
                <ion-checkbox [checked]="showAgrario" (ionChange)="showAgrario = $event.detail.checked; onAgrarioChange()"></ion-checkbox>
            </div>
            <div class="check-col">
              <div class="check-label">Residencial</div>
                <ion-checkbox [checked]="showResidencial" (ionChange)="showResidencial = $event.detail.checked; onResidencialChange()"></ion-checkbox>
            </div>
            <div class="check-col">
              <div class="check-label">Pagado</div>
                <ion-checkbox [checked]="showPagado" (ionChange)="showPagado = $event.detail.checked; onPagadoChange()"></ion-checkbox>
            </div>
          </div>
        </div>
        <div *ngIf="loading" class="loading-container">
          <ion-spinner name="crescent"></ion-spinner>
          <p>Cargando propiedades...</p>
        </div>
        <ion-card *ngIf="error && !loading" class="error-card">
          <ion-card-content>
            <ion-icon name="alert-circle-outline" color="danger"></ion-icon>
            <h3>Error al cargar propiedades</h3>
            <p>{{ error }}</p>
          </ion-card-content>
        </ion-card>
        <div *ngIf="!loading && !error" class="table-wrapper">
          <ng-container *ngIf="filteredCatastros.length > 0; else emptyList">
            <div class="catastro-grid">
              <ion-card *ngFor="let c of filteredCatastros" class="catastro-card">
                <ion-card-header>
                  <div class="icon-title-row">
                    <fa-icon *ngIf="c.catastrotipoid === 1" [icon]="faBuilding" style="color: #1976d2;"></fa-icon>
                    <i *ngIf="c.catastrotipoid === 2" class="ri-tree-fill" style="color: green; font-size: 2rem;"></i>
                    <ion-card-title>{{ c.direccion }}</ion-card-title>
                  </div>
                  <ion-card-subtitle>{{ c.referenciacatastral }}</ion-card-subtitle>
                </ion-card-header>
                <ion-card-content>
                  <div class="card-actions-row">
                    <fa-icon [icon]="faInfoCircle" class="detalle-icon" (click)="openDetalle(c)" title="Ver detalle" style="color: #1976d2; cursor: pointer;"></fa-icon>
                    <span class="actions-spacer"></span>
                    <span *ngIf="c.fechapago" class="fechapago-label-centered">
                      <span  (click)="openFechapagoModal(c)" style="cursor:pointer;">
                        {{ c.fechapago ? (c.fechapago | date:'dd/MM/yyyy') : '' }}
                      </span>
                    </span>
                    <span class="actions-spacer"></span>
                    <fa-icon [icon]="faEuroSign" class="alquiler-icon" title="Alquiler / Valor" style="color: #2ecc40; cursor:pointer;" (click)="openArriendoModal(c.id)"></fa-icon>
                    
                  </div>
                </ion-card-content>
              </ion-card>
            </div>
          </ng-container>
          <ng-template #emptyList>
            <p class="debug-info">No hay propiedades registradas.</p>
          </ng-template>
        </div>
        <!-- Dialog Detalle -->
        <ion-modal [isOpen]="showFechapagoModal" (didDismiss)="closeFechapagoModal()">
          <ng-template>
            <ion-header>
              <ion-toolbar>
                <ion-title>Detalle de Pago</ion-title>
                <ion-buttons slot="end">
                  <ion-button (click)="closeFechapagoModal()">Cerrar</ion-button>
                </ion-buttons>
              </ion-toolbar>
            </ion-header>
            <ion-content>
              <div >
                <table class="fechapago-table">
                  <thead>
                    <tr>
                      <th>Pago</th>
                      <th>Importe</th>
                      <th>Quién</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let pago of lstPagosCatastro">
                      <td>{{ pago.fechapago ? (pago.fechapago | date:'dd/MM/yyyy') : '-' }}</td>
                      <td>{{ pago.importe !== undefined && pago.importe !== null ? (pago.importe | currency:'EUR':'symbol':'1.2-2':'es-ES') : '-' }}</td>
                      <td>{{ pago.quien }}</td>
                    </tr>
                  </tbody>
                </table>
                <div style="text-align:center; margin-top: 24px;">
                  <ion-button color="primary" (click)="closeFechapagoModal()">Cerrar</ion-button>
                </div>
              </div>
                
            </ion-content>
          </ng-template>
        </ion-modal>
        <ion-modal [isOpen]="showDialog" (didDismiss)="closeDialog()">
          <ng-template>
            <ion-header>
              <ion-toolbar>
                <ion-title>Detalle Catastro</ion-title>
                <ion-buttons slot="end">
                  <ion-button (click)="closeDialog()">Cerrar</ion-button>
                </ion-buttons>
              </ion-toolbar>
            </ion-header>
            <ion-content>
              <div *ngIf="selectedCatastro">
                <p><strong>Felipe:</strong> {{ selectedCatastro.felipe ? 'Sí' : 'No' }}</p>
                <p><strong>Polígono:</strong> {{ selectedCatastro.poligono || '-' }}</p>
                <p><strong>Parcela:</strong> {{ selectedCatastro.parcela || '-' }}</p>
                <p><strong>Superficie construida:</strong> {{ selectedCatastro.superficieconstruida }} m²</p>
                <p><strong>Superficie parcela:</strong> {{ selectedCatastro.superficieparcela }} m²</p>
                <p><strong>Uso:</strong> {{ selectedCatastro.uso }}</p>
                <p><strong>Valor suelo:</strong> {{ selectedCatastro.valorsuelo | number:'1.2-2' }} €</p>
                <p><strong>Valor construcción:</strong> {{ selectedCatastro.valorconstruccion | number:'1.2-2' }} €</p>
                <p><strong>Valor catastral:</strong> {{ selectedCatastro.valorcatastral | number:'1.2-2' }} €</p>
                <div style="text-align:center; margin-top: 24px;">
                  <ion-button color="primary" (click)="closeDialog()">Cerrar</ion-button>
                </div>
              </div>
            </ion-content>
          </ng-template>
        </ion-modal>
      </div>
      <div style="height: 48px;"></div>
    </ion-content>
  `,
  styles: [`

.fechapago-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 16px;
                  margin-bottom: 8px;
                }
                .fechapago-table th, .fechapago-table td {
                  border: 1px solid #ccc;
                  padding: 8px 12px;
                  text-align: center;
                  font-size: 1rem;
                }
                .fechapago-table th {
                  background: #f5f5f5;
                  font-weight: bold;
                }

  .fechapago-label-centered {
                        font-size: 1.0rem;
                        color: navy;
                        font-weight: bold;
                        margin: 0 8px;
                        text-align: center;
                        letter-spacing: 1px;
                        background: lightcoral;
                        border-radius: 4px;
                        padding: 2px 8px;
                        box-shadow: none;
                        display: inline-block;
                      }

        ion-modal ion-content {
          padding: 40px 32px 32px 32px;
          border-radius: 18px;
        }
        ion-modal ion-content div {
          padding: 16px 12px 16px 12px;
        }
    .icon-title-row {
      display: flex;
      align-items: center;
      gap: 6px;
      height: 2.5rem;
    }
    .icon-title-row fa-icon,
    .icon-title-row .ri-tree-fill {
      display: flex;
      align-items: center;
      height: 2rem;
      line-height: 1;
      vertical-align: middle;
      margin-top: 2px;
    }
    .card-actions-row {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
    }
    .actions-spacer {
      flex: 1 1 auto;
    }
    .alquiler-icon {
      font-size: 1.3rem;
      margin-right: 2px;
    }
    .detalle-icon {
      font-size: 1.4rem;
      margin-left: 4px;
      transition: color 0.2s;
    }
    .detalle-icon:hover {
      color: #1565c0;
    }
    .buscador-label {
      margin-right: 8px;
    }
    .buscador-input {
      margin-left: 8px;
    }
    .search-section {
      margin-bottom: 20px;
      padding: 8px 0;
    }
    .search-row {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 8px;
    }
    .checks-row {
      display: flex;
      gap: 32px;
      align-items: flex-start;
      margin-top: 0;
      justify-content: flex-start;
    }
    .check-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .check-label {
      font-size: 0.95rem;
      font-weight: 500;
      margin-bottom: 2px;
      text-align: center;
    }
    .checks-row {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-top: 8px;
    }
    .gestion-propiedades-content {
      background: var(--ion-color-light);
    }
    .table-section {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      padding-bottom: 40px;
    }
    ion-modal {
      --width: 520px;
      --height: 560px;
      min-height: 320px;
      max-height: 700px;
      margin-left: 80px;
    }
    /* Eliminar restricciones de altura y scroll para que la modal se ajuste al contenido */
    @media (max-width: 500px) {
      ion-modal {
        --width: 95vw;
        --height: 80vh;
        margin-left: 0;
      }
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
    .table-wrapper {
      width: 100%;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 16px;
      margin-bottom: 40px;
    }
    .catastro-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
    .catastro-card {
      flex: 1 1 calc(25% - 16px);
      min-width: 280px;
      max-width: 400px;
      box-sizing: border-box;
      margin-bottom: 16px;
    }
    .catastro-card ion-card-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .catastro-card ion-icon,
    .catastro-card fa-icon {
      font-size: 1.2rem !important;
      margin-right: 0;
    }
    .icon-title-row ion-icon,
    .icon-title-row fa-icon {
      font-size: 2rem !important;
      margin-right: 0;
    }
    .catastro-card ion-card-title {
      font-size: 1rem;
      font-weight: 500;
      margin-bottom: 0;
    }
    .catastro-card ion-card-subtitle {
      font-size: 0.85rem;
      color: #666;
    }
    @media (max-width: 1200px) {
      .catastro-card {
        flex: 1 1 calc(25% - 16px);
      }
    }
    @media (max-width: 900px) {
      .catastro-card {
        flex: 1 1 calc(33.333% - 16px);
      }
    }
    @media (max-width: 600px) {
      .catastro-card {
        flex: 1 1 100%;
      }
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
export class GestionPropiedadesPage implements OnInit {
  showPagado = false;
  showFechapagoModal = false;
    openFechapagoModal(catastro: Catastro) {
      this.showFechapagoModal = true;
      this.loadPagos(catastro?.id);

    }

    closeFechapagoModal() {
      this.showFechapagoModal = false;
      this.lstPagosCatastro = [];
    }
  ionViewWillEnter() {
    this.loadCatastros();
  }
      // ...existing code...
      // Método para refrescar arriendos (debe llamarse tras crear un arriendo)
      
  loading = false;
  error: string | null = null;
  catastros: Catastro[] = [];
  lstPagosCatastro: PagoCatastro[] = [];
  showFelipe = true;
  showAgrario = true;
  showResidencial = false;
  searchText: string = '';
  filteredCatastros: Catastro[] = [];
  showDialog = false;
  selectedCatastro: Catastro | null = null;
  faTree = faTree;
  faBuilding = faBuilding;
  faInfoCircle = faInfoCircle;
  faEuroSign = faEuroSign;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private pageTitleService: PageTitleService,
    private apiService: ApiService,
    private modalController: ModalController
  ) {
    addIcons({
      'business-outline': businessOutline,
      'alert-circle-outline': alertCircleOutline,
      'home-outline': homeOutline,
      'leaf-outline': leafOutline
    });
  }

  ngOnInit() {
    console.log('entra en init de GestionPropiedadesPage');
    this.pageTitleService.setTitle('Gestión de Propiedades');
    this.loadCatastros();
  }


  refreshArriendos() {
        this.loadCatastros();
      }
   async openArriendoModal(catastroid: number) {
  const modal = await this.modalController.create({
    component: (await import('../ver-gestion-alquiler/arriendo-form-modal.component')).ArriendoFormModalComponent,
    componentProps: {
      isEdit: false,
      arriendo: { catastroid }
    }
  });
  await modal.present();
  const { data, role } = await modal.onWillDismiss();
  if (role === 'confirm' && data) {
    this.refreshArriendos();
  }
}

  loadCatastros() {
    this.loading = true;
    this.error = null;
    this.catastros = [];
    this.apiService.get<{success: boolean, data: Catastro[]}>('/app-alquiler/catastro')
      .subscribe({
        next: (response) => {
          console.log('response',response);
          if (response.success && Array.isArray(response.data)) {
            this.catastros = [...response.data];
          } else {
            this.catastros = [];
          }
          this.applyFilter();
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.error = err.message || 'Error al cargar propiedades';
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }


    loadPagos(catastroid: number) {
    this.lstPagosCatastro = [];
    this.apiService.get<{success: boolean, data: any[]}>(`/app-alquiler/arriendos-pagos/${catastroid}`)
      .subscribe({
        next: (response) => {
          if (response.success && Array.isArray(response.data)) {
            this.lstPagosCatastro = [...response.data];
          } else {
            this.lstPagosCatastro = [];
          }
        },
        error: (err) => {
          
          // this.error = err.message || 'Error al cargar los pagos del catastro';          
        }
      });
  }



  onFelipeChange() {
    this.applyFilter();
  }

  onAgrarioChange() {
    this.applyFilter();
  }

  onResidencialChange() {
    this.applyFilter();
  }

  onSearchChange() {
    this.applyFilter();
  }

    onPagadoChange() {
    this.applyFilter();
  }

  applyFilter() {
    let filtered = [...this.catastros];
    if (!this.showFelipe) {
      filtered = filtered.filter(c => !c.felipe);
    }

    if (!this.showAgrario) {
      filtered = filtered.filter(c => c.catastrotipoid !== 2);
    }

    if (!this.showResidencial) {
      filtered = filtered.filter(c => c.catastrotipoid !== 1);
    }

    if (this.showPagado) {
      filtered = filtered.filter(c => !!c.fechapago);
    }

    if (this.searchText.trim()) {
      const text = this.searchText.trim().toLowerCase();
      filtered = filtered.filter(c =>
        c.direccion.toLowerCase().includes(text) ||
        c.referenciacatastral.toLowerCase().includes(text)
      );
    }
    this.filteredCatastros = filtered;
  }



  openDetalle(catastro: Catastro) {
    this.selectedCatastro = catastro;
    this.showDialog = true;
  }

  closeDialog() {
    this.showDialog = false;
    this.selectedCatastro = null;
  }
}
