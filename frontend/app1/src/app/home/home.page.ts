import { Component, OnInit } from '@angular/core';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton, 
  IonToast, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent, 
  IonIcon 
} from '@ionic/angular/standalone';
import { SharedTableComponent, TableColumn, TableConfig } from 'shared-lib';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { personAdd, informationCircle } from 'ionicons/icons';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  departamento: string;
  estado: string;
  fechaRegistro: Date;
  activo: boolean;
  rol: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonButton,
    IonToast,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    CommonModule,
    SharedTableComponent
  ],
})
export class HomePage implements OnInit {
  usuarios: Usuario[] = [];
  columns: TableColumn[] = [];
  tableConfig: TableConfig = {};
  showToast = false;
  toastMessage = '';
  toastColor = 'success';

  constructor() {
    // Registrar iconos de Ionicons
    addIcons({
      'person-add': personAdd,
      'information-circle': informationCircle
    });
  }

  ngOnInit() {
    this.initializeData();
    this.setupTableConfig();
  }

  initializeData() {
    // Datos de ejemplo para la tabla
    this.usuarios = [
      {
        id: 1,
        nombre: 'Ana García',
        email: 'ana.garcia@empresa.com',
        telefono: '+34 666 111 222',
        departamento: 'Desarrollo',
        estado: 'Activo',
        fechaRegistro: new Date('2024-01-15'),
        activo: true,
        rol: 'Desarrolladora Senior'
      },
      {
        id: 2,
        nombre: 'Carlos López',
        email: 'carlos.lopez@empresa.com',
        telefono: '+34 666 333 444',
        departamento: 'Marketing',
        estado: 'Pendiente',
        fechaRegistro: new Date('2024-02-20'),
        activo: true,
        rol: 'Especialista Marketing'
      },
      {
        id: 3,
        nombre: 'María Rodríguez',
        email: 'maria.rodriguez@empresa.com',
        telefono: '+34 666 555 666',
        departamento: 'Recursos Humanos',
        estado: 'Activo',
        fechaRegistro: new Date('2024-01-10'),
        activo: true,
        rol: 'Coordinadora RRHH'
      },
      {
        id: 4,
        nombre: 'David Martín',
        email: 'david.martin@empresa.com',
        telefono: '+34 666 777 888',
        departamento: 'Desarrollo',
        estado: 'Inactivo',
        fechaRegistro: new Date('2024-03-05'),
        activo: false,
        rol: 'Desarrollador Junior'
      },
      {
        id: 5,
        nombre: 'Laura Sánchez',
        email: 'laura.sanchez@empresa.com',
        telefono: '+34 666 999 000',
        departamento: 'Ventas',
        estado: 'Activo',
        fechaRegistro: new Date('2024-02-28'),
        activo: true,
        rol: 'Gerente de Ventas'
      },
      {
        id: 6,
        nombre: 'Roberto Fernández',
        email: 'roberto.fernandez@empresa.com',
        telefono: '+34 666 111 333',
        departamento: 'Soporte',
        estado: 'Pendiente',
        fechaRegistro: new Date('2024-03-15'),
        activo: true,
        rol: 'Técnico de Soporte'
      },
      {
        id: 7,
        nombre: 'Carmen Jiménez',
        email: 'carmen.jimenez@empresa.com',
        telefono: '+34 666 444 555',
        departamento: 'Contabilidad',
        estado: 'Activo',
        fechaRegistro: new Date('2024-01-25'),
        activo: true,
        rol: 'Contadora Senior'
      },
      {
        id: 8,
        nombre: 'Javier Moreno',
        email: 'javier.moreno@empresa.com',
        telefono: '+34 666 666 777',
        departamento: 'Desarrollo',
        estado: 'Error',
        fechaRegistro: new Date('2024-03-01'),
        activo: false,
        rol: 'DevOps Engineer'
      }
    ];
  }

  setupTableConfig() {
    // Configuración de columnas
    this.columns = [
      {
        field: 'id',
        header: 'ID',
        type: 'number',
        width: '80px',
        sortable: true
      },
      {
        field: 'nombre',
        header: 'Nombre Completo',
        type: 'text',
        sortable: true,
        filterable: true
      },
      {
        field: 'email',
        header: 'Email',
        type: 'text',
        sortable: true,
        filterable: true
      },
      {
        field: 'telefono',
        header: 'Teléfono',
        type: 'text'
      },
      {
        field: 'departamento',
        header: 'Departamento',
        type: 'text',
        sortable: true,
        filterable: true
      },
      {
        field: 'rol',
        header: 'Rol',
        type: 'text',
        sortable: true,
        filterable: true
      },
      {
        field: 'estado',
        header: 'Estado',
        type: 'tag',
        sortable: true,
        filterable: true,
        width: '120px'
      },
      {
        field: 'activo',
        header: 'Activo',
        type: 'boolean',
        sortable: true,
        width: '100px'
      },
      {
        field: 'fechaRegistro',
        header: 'Fecha Registro',
        type: 'date',
        sortable: true,
        width: '160px'
      }
    ];

    // Configuración de la tabla
    this.tableConfig = {
      paginator: true,
      rows: 5,
      showCurrentPageReport: true,
      rowsPerPageOptions: [5, 10, 25],
      globalFilterFields: ['nombre', 'email', 'departamento', 'rol', 'estado'],
      selectionMode: 'multiple'
    };
  }

  // Eventos de la tabla
  onAddUser() {
    this.showToastMessage('Función "Agregar Usuario" activada', 'primary');
  }

  onEditUser(usuario: Usuario) {
    this.showToastMessage(`Editando usuario: ${usuario.nombre}`, 'warning');
    console.log('Editar usuario:', usuario);
  }

  onDeleteUser(usuario: Usuario) {
    this.showToastMessage(`Usuario eliminado: ${usuario.nombre}`, 'danger');
    console.log('Eliminar usuario:', usuario);
    
    // Simular eliminación
    this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);
  }

  onExportUsers() {
    this.showToastMessage('Exportando usuarios...', 'success');
    console.log('Exportar usuarios:', this.usuarios);
  }

  onSelectionChange(selectedUsers: Usuario[]) {
    console.log('Usuarios seleccionados:', selectedUsers);
    if (selectedUsers.length > 0) {
      this.showToastMessage(`${selectedUsers.length} usuario(s) seleccionado(s)`, 'tertiary');
    }
  }

  // Funciones auxiliares
  showToastMessage(message: string, color: string = 'success') {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
  }

  addSampleUser() {
    const newUser: Usuario = {
      id: this.usuarios.length + 1,
      nombre: 'Nuevo Usuario',
      email: 'nuevo@empresa.com',
      telefono: '+34 666 000 111',
      departamento: 'Desarrollo',
      estado: 'Pendiente',
      fechaRegistro: new Date(),
      activo: true,
      rol: 'Desarrollador'
    };
    
    this.usuarios = [...this.usuarios, newUser];
    this.showToastMessage('Usuario agregado correctamente', 'success');
  }

  getDepartamentos(): string[] {
    const departamentos = [...new Set(this.usuarios.map(u => u.departamento))];
    return departamentos;
  }

  getUsuariosActivos(): Usuario[] {
    return this.usuarios.filter(u => u.activo);
  }
}
