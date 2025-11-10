import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
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
import { faTree, faBuilding, faInfoCircle, faKey } from '@fortawesome/free-solid-svg-icons';

interface Catastro {
  id: number;
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

@Component({
  selector: 'app-gestion-propiedades',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, FontAwesomeModule],
  template: `
    <ion-content [fullscreen]="true" class="gestion-propiedades-content">
      <div class="table-section">
        <!-- Buscador con check Felipe, Agrario, Residencial y búsqueda por texto -->
        <div class="search-section">
          <ion-item>
            <ion-label class="buscador-label">Buscar</ion-label>
            <ion-input [(ngModel)]="searchText" (ionInput)="onSearchChange()" placeholder="Dirección o referencia..." class="buscador-input"></ion-input>
          </ion-item>
          <div class="checks-row">
            <ion-item>
              <ion-label>Felipe</ion-label>
              <ion-checkbox slot="end" [(ngModel)]="showFelipe" (ionChange)="onFelipeChange()"></ion-checkbox>
            </ion-item>
            <ion-item>
              <ion-label>Agrario</ion-label>
              <ion-checkbox slot="end" [(ngModel)]="showAgrario" (ionChange)="onAgrarioChange()"></ion-checkbox>
            </ion-item>
            <ion-item>
              <ion-label>Residencial</ion-label>
              <ion-checkbox slot="end" [(ngModel)]="showResidencial" (ionChange)="onResidencialChange()"></ion-checkbox>
            </ion-item>
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
                    <fa-icon *ngIf="c.catastrotipoid === 2" [icon]="faTree" style="color: green;"></fa-icon>
                    <ion-card-title>{{ c.direccion }}</ion-card-title>
                  </div>
                  <ion-card-subtitle>{{ c.referenciacatastral }}</ion-card-subtitle>
                </ion-card-header>
                <ion-card-content>
                  <div class="card-actions-row">
                    <fa-icon [icon]="faInfoCircle" class="detalle-icon" (click)="openDetalle(c)" title="Ver detalle" style="color: #1976d2; cursor: pointer;"></fa-icon>
                    <span class="actions-spacer"></span>
                    <fa-icon [icon]="faKey" class="alquiler-icon" title="Alquiler" style="color: #ff9800;"></fa-icon>
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
                <p><strong>Tipo1:</strong> {{ selectedCatastro.catastrotipoid }}</p>
                <p><strong>Felipe:</strong> {{ selectedCatastro.felipe ? 'Sí' : 'No' }}</p>
                <p><strong>Polígono:</strong> {{ selectedCatastro.poligono || '-' }}</p>
                <p><strong>Parcela:</strong> {{ selectedCatastro.parcela || '-' }}</p>
                <p><strong>Superficie construida:</strong> {{ selectedCatastro.superficieconstruida }} m²</p>
                <p><strong>Superficie parcela:</strong> {{ selectedCatastro.superficieparcela }} m²</p>
                <p><strong>Uso:</strong> {{ selectedCatastro.uso }}</p>
                <p><strong>Valor suelo:</strong> {{ selectedCatastro.valorsuelo | number:'1.2-2' }} €</p>
                <p><strong>Valor construcción:</strong> {{ selectedCatastro.valorconstruccion | number:'1.2-2' }} €</p>
                <p><strong>Valor catastral:</strong> {{ selectedCatastro.valorcatastral | number:'1.2-2' }} €</p>
              </div>
            </ion-content>
          </ng-template>
        </ion-modal>
      </div>
    </ion-content>
  `,
  styles: [`
    .icon-title-row {
      display: flex;
      align-items: center;
      gap: 6px;
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
      flex: 1 1 calc(16.666% - 16px);
      min-width: 0;
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
  loading = false;
  error: string | null = null;
  catastros: Catastro[] = [];
  showFelipe = true;
  showAgrario = true;
  showResidencial = false;
  searchText = '';
  filteredCatastros: Catastro[] = [];
  showDialog = false;
  selectedCatastro: Catastro | null = null;
  faTree = faTree;
  faBuilding = faBuilding;
  faInfoCircle = faInfoCircle;
  faKey = faKey;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private pageTitleService: PageTitleService,
    private apiService: ApiService
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

  loadCatastros() {
    this.loading = true;
    this.error = null;
    this.apiService.get<{success: boolean, data: Catastro[]}>('/app-alquiler/catastro')
      .subscribe({
        next: (response) => {
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
