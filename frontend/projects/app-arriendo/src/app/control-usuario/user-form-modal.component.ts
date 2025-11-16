import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';

interface Profile {
  id: number;
  description: string;
  is_active: boolean;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_id: number;
  profile_description?: string;
}

interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  profile_id: number;
}

@Component({
  selector: 'app-user-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ isEdit ? 'Editar Usuario' : 'Nuevo Usuario' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
        
        <!-- Nombre -->
        <ion-item>
          <ion-label position="stacked">
            Nombre *
            <ion-text color="danger" *ngIf="isFieldInvalid('first_name')">
              <small>{{ getFieldError('first_name') }}</small>
            </ion-text>
          </ion-label>
          <ion-input 
            formControlName="first_name"
            maxlength="50"
            placeholder="Ingrese nombre"
            [class.ion-invalid]="isFieldInvalid('first_name')"
            [class.ion-touched]="f['first_name']?.touched">
          </ion-input>
        </ion-item>

        <!-- Apellidos -->
        <ion-item>
          <ion-label position="stacked">
            Apellidos *
            <ion-text color="danger" *ngIf="isFieldInvalid('last_name')">
              <small>{{ getFieldError('last_name') }}</small>
            </ion-text>
          </ion-label>
          <ion-input 
            formControlName="last_name"
            maxlength="50"
            placeholder="Ingrese apellidos"
            [class.ion-invalid]="isFieldInvalid('last_name')"
            [class.ion-touched]="f['last_name']?.touched">
          </ion-input>
        </ion-item>

        <!-- Email -->
        <ion-item>
          <ion-label position="stacked">
            Email *
            <ion-text color="danger" *ngIf="isFieldInvalid('email')">
              <small>{{ getFieldError('email') }}</small>
            </ion-text>
          </ion-label>
          <ion-input 
            formControlName="email"
            type="email"
            maxlength="100"
            placeholder="usuario@ejemplo.com"
            [class.ion-invalid]="isFieldInvalid('email')"
            [class.ion-touched]="f['email']?.touched">
          </ion-input>
        </ion-item>

        <!-- Contraseña - Solo para nuevos usuarios -->
        <ion-item *ngIf="!isEdit">
          <ion-label position="stacked">
            Contraseña *
            <ion-text color="danger" *ngIf="isFieldInvalid('password')">
              <small>{{ getFieldError('password') }}</small>
            </ion-text>
          </ion-label>
          <ion-input 
            formControlName="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            [class.ion-invalid]="isFieldInvalid('password')"
            [class.ion-touched]="f['password']?.touched">
          </ion-input>
        </ion-item>

        <!-- Perfil - Combo desplegable -->
        <ion-item>
          <ion-label position="stacked">
            Perfil *
            <ion-text color="danger" *ngIf="isFieldInvalid('profile_id')">
              <small>{{ getFieldError('profile_id') }}</small>
            </ion-text>
          </ion-label>
          <ion-select 
            formControlName="profile_id"
            placeholder="Seleccione un perfil"
            interface="popover"
            [class.ion-invalid]="isFieldInvalid('profile_id')"
            [class.ion-touched]="f['profile_id']?.touched">
            <ion-select-option 
              *ngFor="let profile of profiles" 
              [value]="profile.id">
              {{ profile.description }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <!-- Información adicional si está editando -->
        <ion-card *ngIf="isEdit && user" class="info-card">
          <ion-card-content>
            <ion-text color="medium">
              <p><strong>Usuario:</strong> {{ user.first_name }} {{ user.last_name }}</p>
              <p><strong>Perfil actual:</strong> {{ user.profile_description || 'No definido' }}</p>
            </ion-text>
          </ion-card-content>
        </ion-card>



        <!-- Botones -->
        <div class="button-container">
          <ion-button 
            expand="block" 
            type="submit" 
            color="primary"
            [disabled]="!userForm.valid">
            <ion-icon name="save" slot="start"></ion-icon>
            {{ isEdit ? 'Actualizar Usuario' : 'Crear Usuario' }}
          </ion-button>
          
          <ion-button 
            expand="block" 
            fill="outline" 
            color="medium"
            (click)="dismiss()">
            <ion-icon name="close" slot="start"></ion-icon>
            Cancelar
          </ion-button>
        </div>

      </form>
    </ion-content>
  `,
  styles: [`
    .info-card {
      margin: 16px 0;
      background: var(--ion-color-light);
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

    ion-input.ion-invalid.ion-touched,
    ion-select.ion-invalid.ion-touched {
      --border-color: var(--ion-color-danger);
      --highlight-color-focused: var(--ion-color-danger);
    }

    ion-item {
      --border-color: var(--ion-color-medium);
    }

    ion-item.item-has-focus {
      --border-color: var(--ion-color-primary);
    }

    ion-text[color="danger"] small {
      font-size: 0.8rem;
      font-weight: 500;
    }

    ion-button[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class UserFormModalComponent implements OnInit {
  @Input() isEdit: boolean = false;
  @Input() user?: User;
  @Input() profiles: Profile[] = [];

  userForm!: FormGroup;

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.createForm();
  }

  private createForm() {
    if (this.isEdit && this.user) {
      // Formulario para edición
      this.userForm = this.formBuilder.group({
        first_name: [this.user.first_name, [Validators.required, Validators.maxLength(50)]],
        last_name: [this.user.last_name, [Validators.required, Validators.maxLength(50)]],
        email: [this.user.email, [Validators.required, Validators.email, Validators.maxLength(100)]],
        profile_id: [this.user.profile_id, [Validators.required]]
      });
    } else {
      // Formulario para nuevo usuario con datos de prueba
      const timestamp = Date.now();
      this.userForm = this.formBuilder.group({
        first_name: ['Test Usuario', [Validators.required, Validators.maxLength(50)]],
        last_name: ['De Prueba', [Validators.required, Validators.maxLength(50)]],
        email: [`test${timestamp}@example.com`, [Validators.required, Validators.email, Validators.maxLength(100)]],
        password: ['test123456', [Validators.required, Validators.minLength(6)]],
        profile_id: [3, [Validators.required]]
      });
    }
  }

  async onSubmit() {
    if (this.userForm.valid) {
      const formData = this.userForm.value;
      await this.modalController.dismiss(formData, 'confirm');
    }
  }

  async dismiss() {
    await this.modalController.dismiss(null, 'cancel');
  }

  // Getters para acceder fácilmente a los controles del formulario
  get f() { return this.userForm.controls; }

  // Métodos de utilidad para validaciones
  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return `${fieldName} es obligatorio`;
      if (field.errors['email']) return 'Formato de email inválido';
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
    }
    return '';
  }


}