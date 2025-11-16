import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from 'shared-lib';

export interface ArriendoFormData {
  id: number;
  catastroid: number;
  fechapago: Date;
  arriendotipoid: number;
  importe: number;
  quien: string;
  observaciones: string;
}

import { ModalController } from '@ionic/angular';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonIcon, IonItem, IonLabel, IonSelectOption, IonSelect, IonCheckbox, IonToast, IonInput } from '@ionic/angular/standalone';

@Component({
  selector: 'app-arriendo-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonButtons,
    IonIcon,
    IonContent,
    IonItem,
    IonLabel,
    IonSelectOption,
    IonSelect,
    IonCheckbox,
    IonToast,
    IonInput
  ],
    providers: [ModalController],
  
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ isEdit ? 'Editar Arriendo' : 'Nuevo Arriendo' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <form [formGroup]="arriendoForm" (ngSubmit)="onSubmit()">
        <ion-item class="inline-item">
          <ion-label position="stacked">Propiedad *</ion-label>
          <ion-select formControlName="catastroid" required interface="popover" placeholder="Selecciona un catastro" style="width:100%">
            <ion-select-option *ngFor="let c of catastroOptions" [value]="c.id">
              {{c.id}} - {{c.descripcion}}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Tipo Arriendo *</ion-label>
          <div style="display: flex; gap: 24px; margin-top: 8px;">
            <ion-checkbox
              [checked]="arriendoForm.get('arriendotipoid')?.value === 2"
              (ionChange)="toggleArriendoTipo(2, $event)"
              color="primary"
            >Anual</ion-checkbox>
            <ion-checkbox
              [checked]="arriendoForm.get('arriendotipoid')?.value === 1"
              (ionChange)="toggleArriendoTipo(1, $event)"
              color="primary"
            >Mensual</ion-checkbox>
          </div>
        </ion-item>
          <div class="row-fields">
            <ion-item class="inline-item">
              <ion-label position="stacked">Fecha Pago *</ion-label>
              <ion-input formControlName="fechapago" type="date" required></ion-input>
            </ion-item>
            <ion-item class="inline-item">
              <ion-label position="stacked">Importe *</ion-label>
              <ion-input formControlName="importe" type="number" required></ion-input>
            </ion-item>
          </div>
        <ion-item>
          <ion-label position="stacked">Inquilino *</ion-label>
          <ion-input formControlName="quien" required></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Observaciones</ion-label>
          <ion-input formControlName="observaciones"></ion-input>
        </ion-item>
        <div class="button-container">
          <ion-button expand="block" type="submit" color="primary" [disabled]="!arriendoForm.valid">
            <ion-icon name="save" slot="start"></ion-icon>
            {{ isEdit ? 'Actualizar Arriendo' : 'Crear Arriendo' }}
          </ion-button>
          <ion-button expand="block" fill="outline" color="medium" (click)="dismiss()">
            <ion-icon name="close" slot="start"></ion-icon>
            Cancelar
          </ion-button>
        </div>
      </form>
            <!-- Toast para mensajes -->
      <ion-toast 
        [isOpen]="showToast"
        [message]="toastMessage"
        [duration]="3000"
        [color]="toastColor"
        position="bottom"
        (didDismiss)="showToast = false">
      </ion-toast>
    </ion-content>
  `,
  styles: [`
            :host ::ng-deep ion-content {
              overflow-y: auto !important;
              max-height: 100% !important;
            }
        .row-fields {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
        }
        .inline-item {
          display: flex;
          flex: 1 1 0;
          min-width: 0;
          margin-bottom: 0 !important;
        }
        .inline-item ion-select {
          flex: 1 1 0;
          min-width: 0;
        }
        .inline-item ion-select::part(interface-popover),
        .inline-item ion-select::part(list) {
          width: 100% !important;
          min-width: 400px !important;
          max-width: 600px !important;
        }
    :host ::ng-deep .modal-wrapper {
      width: 420px !important;
      height: 800px !important;
      min-height: 400px !important;
      max-height: 900px !important;
      margin-left: 80px !important;
    }
    .button-container {
      margin-top: 24px;
      gap: 12px;
      display: flex;
      flex-direction: column;
    }
    ion-item {
      margin-bottom: 12px;
    }
    ion-label {
      font-weight: 500;
    }
    ion-button[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class ArriendoFormModalComponent implements OnInit {
  @Input() isEdit: boolean = false;
  @Input() arriendo?: Partial<ArriendoFormData>;

  arriendoForm!: FormGroup;
  catastroOptions: Array<{id: number, descripcion: string}> = [];

    // Toast para mensajes
  showToast = false;
  toastMessage = '';
  toastColor = 'success';

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.loadCatastroOptions();
    this.createForm();
  }
  private loadCatastroOptions() {
  this.apiService.get<{success: boolean, data: any[]}>('/app-alquiler/catastro/').subscribe({
    next: (resp) => {
      const data = resp.data ?? [];
      this.catastroOptions = data.map(item => ({
        id: item.catastroid ?? item.id ?? '',
        descripcion: item.direccion ?? ''
      }));
    },
    error: (err) => {
      console.error('Error cargando catastro:', err);
    }
  });
}

  private createForm() {
    let fechapagoValue = '';
    let arriendotipoidValue = 2; // Por defecto Anual
    if (this.isEdit && this.arriendo) {
      if (this.arriendo.fechapago) {
        const d = new Date(this.arriendo.fechapago);
        if (!isNaN(d.getTime())) {
          fechapagoValue = d.toISOString().slice(0, 10);
        }
      }
      arriendotipoidValue = this.arriendo.arriendotipoid ?? 2;
      this.arriendoForm = this.formBuilder.group({
        catastroid: [this.arriendo.catastroid ?? '', [Validators.required]],
        arriendotipoid: [arriendotipoidValue, [Validators.required]],
        fechapago: [fechapagoValue, [Validators.required]],
        importe: [this.arriendo.importe ?? '', [Validators.required]],
        quien: [this.arriendo.quien ?? '', [Validators.required]],
        observaciones: [this.arriendo.observaciones ?? '']
      });
    } else if (this.arriendo && this.arriendo.catastroid) {
      arriendotipoidValue = this.arriendo.arriendotipoid ?? 2;
      const today = new Date().toISOString().slice(0, 10);
      this.arriendoForm = this.formBuilder.group({
        catastroid: [this.arriendo.catastroid, [Validators.required]],
        arriendotipoid: [arriendotipoidValue, [Validators.required]],
        fechapago: [today, [Validators.required]],
        importe: ['', [Validators.required]],
        quien: ['', [Validators.required]],
        observaciones: ['']
      });
    } else {
      const today = new Date().toISOString().slice(0, 10);
      this.arriendoForm = this.formBuilder.group({
        catastroid: ['', [Validators.required]],
        arriendotipoid: [2, [Validators.required]],
        fechapago: [today, [Validators.required]],
        importe: ['', [Validators.required]],
        quien: ['', [Validators.required]],
        observaciones: ['']
      });
    }
   
  }

   toggleArriendoTipo(tipo: number, event: any): void {
      if (event.detail.checked) {
        this.arriendoForm.patchValue({ arriendotipoid: tipo });
      } else {
        // If both are unchecked, set to null
        const otherTipo = tipo === 2 ? 1 : 2;
        const otherChecked = this.arriendoForm.get('arriendotipoid')?.value === otherTipo;
        if (!otherChecked) {
          this.arriendoForm.patchValue({ arriendotipoid: null });
        }
      }
    }

  async onSubmit() {
    if (this.arriendoForm.valid) {
      const formData = this.arriendoForm.value;
      const created = await this.managementArriendo();
      if(created){
          await this.modalController.dismiss(formData, 'confirm');
      }
    }
  }

  async dismiss() {
    await this.modalController.dismiss(null, 'cancel');
  }


    private showToastMessage(message: string, color: string = 'success') {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
  }

     async managementArriendo() {

      try{ 
        const userData = this.arriendoForm.value;    
        console.log('📡 Iniciando llamada POST...');

        let response = null;

        if(this.isEdit){
          response= await this.apiService.put<{success: boolean, data: any}>(`/app-alquiler/arriendos/${this.arriendo?.id}`, userData).toPromise();
        }
        else{
          response= await this.apiService.post<{success: boolean, data: any}>('/app-alquiler/arriendos', userData).toPromise();
        }

        
         if (response && response.success && response.data) {
            console.log('✅ Usuario gestionado exitosamente:', response.data);
            this.showToastMessage('Usuario creado exitosamente', 'success');

        return true;           
          
          }
          else {
            console.error('❌ Error en respuesta del servidor:', response);
            this.showToastMessage('Error al crear usuario en el servidor', 'danger');
            return false;
          }
      }
      catch(error){  
       
        this.showToastMessage(`Error de conexión: ${error}`, 'danger');
        return false;
      }

    }
          
  

}
