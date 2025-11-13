import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { ApiService } from 'shared-lib';

export interface ArriendoFormData {
  catastroid: number;
  fechapago: Date;
  importe: number;
  quien: string;
  observaciones: string;
}

@Component({
  selector: 'app-arriendo-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
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
        <ion-item>
          <ion-label position="stacked">Propiedad *</ion-label>
          <ion-select formControlName="catastroid" required interface="popover" placeholder="Selecciona un catastro">
            <ion-select-option *ngFor="let c of catastroOptions" [value]="c.id">
              {{c.id}} - {{c.descripcion}}
            </ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Fecha Pago *</ion-label>
          <ion-input formControlName="fechapago" type="date" required></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Importe *</ion-label>
          <ion-input formControlName="importe" type="number" required></ion-input>
        </ion-item>
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
    </ion-content>
  `,
  styles: [`
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
    if (this.isEdit && this.arriendo) {
      // Si fechapago existe, convertir a YYYY-MM-DD
      if (this.arriendo.fechapago) {
        const d = new Date(this.arriendo.fechapago);
        if (!isNaN(d.getTime())) {
          fechapagoValue = d.toISOString().slice(0, 10);
        }
      }
      this.arriendoForm = this.formBuilder.group({
        catastroid: [this.arriendo.catastroid ?? '', [Validators.required]],
        fechapago: [fechapagoValue, [Validators.required]],
        importe: [this.arriendo.importe ?? '', [Validators.required]],
        quien: [this.arriendo.quien ?? '', [Validators.required]],
        observaciones: [this.arriendo.observaciones ?? '']
      });
    } else if (this.arriendo && this.arriendo.catastroid) {
      // Si se pasa catastroid desde el modal de alta, usarlo como valor inicial
      this.arriendoForm = this.formBuilder.group({
        catastroid: [this.arriendo.catastroid, [Validators.required]],
        fechapago: ['', [Validators.required]],
        importe: ['', [Validators.required]],
        quien: ['', [Validators.required]],
        observaciones: ['']
      });
    } else {
      this.arriendoForm = this.formBuilder.group({
        catastroid: ['', [Validators.required]],
        fechapago: ['', [Validators.required]],
        importe: ['', [Validators.required]],
        quien: ['', [Validators.required]],
        observaciones: ['']
      });
    }
  }

  async onSubmit() {
    if (this.arriendoForm.valid) {
      const formData = this.arriendoForm.value;
      await this.modalController.dismiss(formData, 'confirm');
    }
  }

  async dismiss() {
    await this.modalController.dismiss(null, 'cancel');
  }
}
