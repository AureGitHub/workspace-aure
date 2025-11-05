import { Component, OnInit } from '@angular/core';
import { 
  IonButton, 
  IonToast, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent, 
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel
} from '@ionic/angular/standalone';
import { 
  SharedTableComponent, 
  TableColumn, 
  TableConfig, 
  PrimeTableComponent, 
  PrimeTableColumn, 
  PrimeTableConfig,
  AppLayoutComponent,
  AppLayoutConfig
} from 'shared-lib';
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
    IonButton,
    IonToast,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    CommonModule,
    SharedTableComponent,
    PrimeTableComponent,
    AppLayoutComponent
  ],
})
export class HomePage implements OnInit {
  usuarios: Usuario[] = [];
  columns: TableColumn[] = [];
  tableConfig: TableConfig = {};
  
  // PrimeNG Table properties
  primeColumns: PrimeTableColumn[] = [];
  primeTableConfig: PrimeTableConfig = {};
  
  // UI State
  showToast = false;
  toastMessage = '';
  toastColor = 'success';
  tableType: string = 'simple'; // 'simple' or 'prime'

  // Layout Configuration
  layoutConfig: AppLayoutConfig = {
    showHeader: true,
    showFooter: true,
    headerTitle: 'App1 - Gestión de Usuarios',
    headerSubtitle: 'Ejemplo de tabla con componentes compartidos',
    footerText: 'Workspace Aure © 2025 - App1',
    showBackButton: false,
    showMenuButton: true,
    showUserProfile: true
  };

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
    this.setupPrimeTableConfig();
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

  setupPrimeTableConfig() {
    // Configure PrimeNG table columns
    this.primeColumns = [
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

    // Configure PrimeNG table settings
    this.primeTableConfig = {
      paginator: true,
      rows: 7,
      showCurrentPageReport: true,
      rowsPerPageOptions: [5, 7, 10, 25],
      globalFilterFields: ['nombre', 'email', 'departamento', 'rol', 'estado'],
      selectionMode: 'multiple',
      dataKey: 'id',
      sortMode: 'single',
      scrollable: false,
      responsive: true
    };
  }

  // Table type toggle
  onTableTypeChange(event: any) {
    this.tableType = event.detail.value;
    this.showToastMessage(`Cambiado a tabla ${this.tableType === 'prime' ? 'PrimeNG' : 'Simple'}`, 'primary');
  }

  // PrimeNG Table Event Handlers
  onPrimeAdd() {
    this.showToastMessage('PrimeNG: Función "Agregar Usuario" activada', 'success');
  }

  onPrimeEdit(usuario: Usuario) {
    this.showToastMessage(`PrimeNG: Editando usuario: ${usuario.nombre}`, 'warning');
    console.log('PrimeNG Editar usuario:', usuario);
  }

  onPrimeDelete(usuario: Usuario) {
    this.showToastMessage(`PrimeNG: Usuario eliminado: ${usuario.nombre}`, 'danger');
    console.log('PrimeNG Eliminar usuario:', usuario);
    
    // Simular eliminación
    this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);
  }

  onPrimeView(usuario: Usuario) {
    this.showToastMessage(`PrimeNG: Viendo detalles de: ${usuario.nombre}`, 'tertiary');
    console.log('PrimeNG Ver usuario:', usuario);
  }

  onPrimeExport() {
    this.showToastMessage('PrimeNG: Exportando usuarios...', 'success');
    console.log('PrimeNG Exportar usuarios:', this.usuarios);
  }

  onPrimeSelectionChange(selectedUsers: Usuario[]) {
    console.log('PrimeNG Usuarios seleccionados:', selectedUsers);
    if (selectedUsers.length > 0) {
      this.showToastMessage(`PrimeNG: ${selectedUsers.length} usuario(s) seleccionado(s)`, 'info');
    }
  }

  onRefreshData() {
    this.showToastMessage('Datos actualizados', 'success');
    console.log('Datos actualizados');
  }

  // Layout Event Handlers
  onMenuClick() {
    this.showToastMessage('Menú clickeado', 'primary');
    console.log('Menú clickeado');
  }

  onBackClick() {
    this.showToastMessage('Botón atrás clickeado', 'primary');
    console.log('Botón atrás clickeado');
  }

  onUserProfileClick() {
    this.showToastMessage('Perfil de usuario clickeado', 'primary');
    console.log('Perfil de usuario clickeado');
  }
}
