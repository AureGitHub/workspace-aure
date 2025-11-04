import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';

export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'tag';
  width?: string;
}

export interface TableConfig {
  paginator?: boolean;
  rows?: number;
  showCurrentPageReport?: boolean;
  rowsPerPageOptions?: number[];
  globalFilterFields?: string[];
  selectionMode?: 'single' | 'multiple' | null;
  exportFilename?: string;
}

@Component({
  selector: 'shared-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    DropdownModule
  ],
  template: `
    <div class="shared-table-container">
      <!-- Toolbar -->
      <div class="table-toolbar" *ngIf="showToolbar">
        <div class="toolbar-left">
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <input 
              pInputText 
              type="text" 
              [(ngModel)]="globalFilterValue"
              (input)="onGlobalFilter($event)"
              [placeholder]="'Buscar ' + (title || 'registros') + '...'"
              class="global-filter-input" />
          </span>
        </div>
        <div class="toolbar-right">
          <p-button 
            *ngIf="showAddButton"
            icon="pi pi-plus" 
            label="Nuevo" 
            severity="success"
            size="small"
            (onClick)="onAdd()">
          </p-button>
          <p-button 
            *ngIf="showExportButton"
            icon="pi pi-download" 
            label="Exportar" 
            severity="info"
            size="small"
            (onClick)="onExport()">
          </p-button>
        </div>
      </div>

      <!-- Table -->
      <p-table 
        [value]="data" 
        [columns]="columns"
        [paginator]="config.paginator !== false"
        [rows]="config.rows || 10"
        [showCurrentPageReport]="config.showCurrentPageReport !== false"
        [globalFilterFields]="config.globalFilterFields || getFilterFields()"
        [globalFilter]="globalFilterValue"
        [currentPageReportTemplate]="currentPageReportTemplate"
        [rowsPerPageOptions]="config.rowsPerPageOptions || [5,10,25,50]"
        [selectionMode]="config.selectionMode || null"
        [(selection)]="selectedItems"
        [tableStyle]="{ 'min-width': '50rem' }"
        styleClass="p-datatable-gridlines">
        
        <!-- Caption -->
        <ng-template pTemplate="caption" *ngIf="showCaption">
          <div class="table-caption">
            <div class="caption-left">
              <h3 *ngIf="title">{{ title }}</h3>
              <span *ngIf="selectedItems && selectedItems.length > 0" class="selection-info">
                {{ selectedItems.length }} elemento(s) seleccionado(s)
              </span>
            </div>
            <div class="caption-right">
              <span class="total-info">
                Total: {{ data.length }} registro(s)
              </span>
            </div>
          </div>
        </ng-template>

        <!-- Header -->
        <ng-template pTemplate="header" let-columns>
          <tr>
            <th *ngIf="config.selectionMode" style="width: 4rem">
              <p-tableHeaderCheckbox *ngIf="config.selectionMode === 'multiple'"></p-tableHeaderCheckbox>
            </th>
            <th *ngFor="let col of columns" 
                [pSortableColumn]="col.sortable !== false ? col.field : null"
                [style.width]="col.width">
              {{ col.header }}
              <p-sortIcon [field]="col.field" *ngIf="col.sortable !== false"></p-sortIcon>
            </th>
            <th *ngIf="showActions" style="width: 8rem">Acciones</th>
          </tr>
        </ng-template>

        <!-- Body -->
        <ng-template pTemplate="body" let-rowData let-rowIndex="rowIndex">
          <tr>
            <td *ngIf="config.selectionMode">
              <p-tableCheckbox [value]="rowData" *ngIf="config.selectionMode === 'multiple'"></p-tableCheckbox>
              <p-tableRadioButton [value]="rowData" *ngIf="config.selectionMode === 'single'"></p-tableRadioButton>
            </td>
            <td *ngFor="let col of columns">
              <ng-container [ngSwitch]="col.type">
                <span *ngSwitchCase="'tag'" 
                      [class]="'tag-' + getTagSeverity(rowData[col.field])">
                  <p-tag [value]="rowData[col.field]" 
                         [severity]="getTagSeverity(rowData[col.field])">
                  </p-tag>
                </span>
                <span *ngSwitchCase="'date'">
                  {{ rowData[col.field] | date:'dd/MM/yyyy HH:mm' }}
                </span>
                <span *ngSwitchCase="'boolean'">
                  <i [class]="rowData[col.field] ? 'pi pi-check text-green-500' : 'pi pi-times text-red-500'"></i>
                </span>
                <span *ngSwitchDefault>
                  {{ rowData[col.field] }}
                </span>
              </ng-container>
            </td>
            <td *ngIf="showActions">
              <div class="action-buttons">
                <p-button 
                  *ngIf="showEditButton"
                  icon="pi pi-pencil" 
                  severity="info"
                  size="small"
                  [text]="true"
                  (onClick)="onEdit(rowData)"
                  pTooltip="Editar">
                </p-button>
                <p-button 
                  *ngIf="showDeleteButton"
                  icon="pi pi-trash" 
                  severity="danger"
                  size="small"
                  [text]="true"
                  (onClick)="onDelete(rowData)"
                  pTooltip="Eliminar">
                </p-button>
              </div>
            </td>
          </tr>
        </ng-template>

        <!-- Empty -->
        <ng-template pTemplate="emptymessage">
          <tr>
            <td [attr.colspan]="getColspan()" class="text-center">
              <div class="empty-state">
                <i class="pi pi-info-circle" style="font-size: 2rem; color: var(--surface-400);"></i>
                <p class="empty-message">{{ emptyMessage || 'No se encontraron registros' }}</p>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [`
    .shared-table-container {
      width: 100%;
    }

    .table-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding: 1rem;
      background: var(--surface-50);
      border-radius: 6px;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .toolbar-left, .toolbar-right {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .global-filter-input {
      width: 300px;
    }

    .table-caption {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: var(--surface-100);
      border-radius: 6px 6px 0 0;
    }

    .caption-left h3 {
      margin: 0;
      color: var(--primary-color);
      font-size: 1.2rem;
    }

    .selection-info {
      color: var(--primary-color);
      font-weight: 500;
      font-size: 0.9rem;
    }

    .total-info {
      color: var(--text-color-secondary);
      font-size: 0.9rem;
    }

    .action-buttons {
      display: flex;
      gap: 0.25rem;
      justify-content: center;
    }

    .empty-state {
      padding: 3rem;
      text-align: center;
    }

    .empty-message {
      margin-top: 1rem;
      color: var(--surface-500);
      font-size: 1rem;
    }

    @media (max-width: 768px) {
      .table-toolbar {
        flex-direction: column;
        align-items: stretch;
      }

      .toolbar-left, .toolbar-right {
        justify-content: center;
      }

      .global-filter-input {
        width: 100%;
      }

      .table-caption {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 0.5rem;
      }
    }
  `]
})
export class SharedTableComponent {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() config: TableConfig = {};
  @Input() title?: string;
  @Input() emptyMessage?: string;
  @Input() showToolbar: boolean = true;
  @Input() showCaption: boolean = true;
  @Input() showActions: boolean = true;
  @Input() showAddButton: boolean = true;
  @Input() showEditButton: boolean = true;
  @Input() showDeleteButton: boolean = true;
  @Input() showExportButton: boolean = true;

  @Output() add = new EventEmitter<void>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() export = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<any>();

  globalFilterValue: string = '';
  selectedItems: any[] = [];

  get currentPageReportTemplate(): string {
    return `Mostrando {first} a {last} de {totalRecords} ${this.title?.toLowerCase() || 'registros'}`;
  }

  onGlobalFilter(event: Event) {
    const target = event.target as HTMLInputElement;
    this.globalFilterValue = target.value;
  }

  onAdd() {
    this.add.emit();
  }

  onEdit(rowData: any) {
    this.edit.emit(rowData);
  }

  onDelete(rowData: any) {
    this.delete.emit(rowData);
  }

  onExport() {
    this.export.emit();
  }

  getFilterFields(): string[] {
    return this.columns
      .filter(col => col.filterable !== false)
      .map(col => col.field);
  }

  getTagSeverity(value: any): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      if (lowerValue.includes('activ') || lowerValue.includes('success')) return 'success';
      if (lowerValue.includes('pendient') || lowerValue.includes('warning')) return 'warning';
      if (lowerValue.includes('error') || lowerValue.includes('danger') || lowerValue.includes('inactiv')) return 'danger';
      if (lowerValue.includes('info')) return 'info';
    }
    return 'secondary';
  }

  getColspan(): number {
    let colspan = this.columns.length;
    if (this.config.selectionMode) colspan++;
    if (this.showActions) colspan++;
    return colspan;
  }
}