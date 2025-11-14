import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'tag';
  width?: string;
  displayFn?: (row: any) => string;
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
    FormsModule
  ],
  template: `
    <div class="shared-table-container">
      <!-- Toolbar -->
      <div class="table-toolbar" *ngIf="showToolbar">
        <div class="toolbar-left">
          <div class="search-container">
            <input 
              type="text" 
              [(ngModel)]="globalFilterValue"
              (input)="onGlobalFilter($event)"
              [placeholder]="'Buscar ' + (title || 'registros') + '...'"
              class="global-filter-input" />
          </div>
        </div>
        <div class="toolbar-right">
          <button 
            *ngIf="showAddButton"
            class="btn btn-success"
            (click)="onAdd()">
            ➕ Nuevo
          </button>
          <button 
            *ngIf="showExportButton"
            class="btn btn-info"
            (click)="onExport()">
            📥 Exportar
          </button>
        </div>
      </div>

      <!-- Caption -->
      <div class="table-caption" *ngIf="showCaption">
        <div class="caption-left">
          <h3 *ngIf="title">{{ title }}</h3>
          <span *ngIf="selectedItems && selectedItems.length > 0" class="selection-info">
            {{ selectedItems.length }} elemento(s) seleccionado(s)
          </span>
        </div>
        <div class="caption-right">
          <span class="total-info">
            Total: {{ getFilteredData().length }} registro(s)
          </span>
        </div>
      </div>

      <!-- Table -->
      <div class="table-responsive">
        <table class="custom-table">
          <!-- Header -->
          <thead>
            <tr>
              <th *ngIf="config.selectionMode" style="width: 50px">
                <input 
                  *ngIf="config.selectionMode === 'multiple'" 
                  type="checkbox" 
                  (change)="toggleAll($event)"
                  [checked]="allSelected">
              </th>
              <th *ngFor="let col of columns" 
                  [style.width]="col.width"
                  [class.sortable]="col.sortable !== false"
                  (click)="sort(col.field)">
                {{ col.header }}
                <span *ngIf="col.sortable !== false && sortField === col.field" 
                      [class]="'sort-icon ' + (sortOrder === 1 ? 'asc' : 'desc')">
                  {{ sortOrder === 1 ? '▲' : '▼' }}
                </span>
              </th>
              <th *ngIf="showActions" style="width: 120px">Acciones</th>
            </tr>
          </thead>

          <!-- Body -->
          <tbody>
            <tr *ngFor="let rowData of getPaginatedData(); let i = index"
                [class.selected]="isSelected(rowData)">
              <td *ngIf="config.selectionMode">
                <input 
                  type="checkbox" 
                  *ngIf="config.selectionMode === 'multiple'"
                  [checked]="isSelected(rowData)"
                  (change)="toggleSelection(rowData, $event)">
                <input 
                  type="radio" 
                  *ngIf="config.selectionMode === 'single'"
                  [checked]="isSelected(rowData)"
                  (change)="selectSingle(rowData)"
                  [name]="'radio-' + title">
              </td>
              <td *ngFor="let col of columns">
                <ng-container [ngSwitch]="col.type">
                  <span *ngSwitchCase="'tag'" 
                        [class]="'tag tag-' + getTagSeverity(rowData[col.field])">
                    {{ rowData[col.field] }}
                  </span>
                  <span *ngSwitchCase="'date'">
                    {{ rowData[col.field]  | date:'dd/MM/yyyy' }}
                  </span>
                  <span *ngSwitchCase="'boolean'">
                    <span [class]="rowData[col.field] ? 'status-true' : 'status-false'">
                      {{ rowData[col.field] ? '✓' : '✗' }}
                    </span>
                  </span>
                  <span *ngSwitchDefault>
                    {{ col.displayFn ? col.displayFn(rowData) : rowData[col.field] }}
                  </span>
                </ng-container>
              </td>
              <td *ngIf="showActions">
                <div class="action-buttons">
                  <button 
                    *ngIf="showEditButton"
                    class="btn-action btn-edit"
                    (click)="onEdit(rowData)"
                    title="Editar">
                    ✏️
                  </button>
                  <button 
                    *ngIf="showDeleteButton"
                    class="btn-action btn-delete"
                    (click)="onDelete(rowData)"
                    title="Eliminar">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>

          <!-- Empty message -->
          <tbody *ngIf="getFilteredData().length === 0">
            <tr>
              <td [attr.colspan]="getColspan()" class="text-center empty-message">
                <div class="empty-state">
                  <span class="empty-icon">📋</span>
                  <p>{{ emptyMessage || 'No se encontraron registros' }}</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination-container" *ngIf="config.paginator !== false && getFilteredData().length > 0">
        <div class="pagination-info">
          Mostrando {{ getStartRecord() }} a {{ getEndRecord() }} de {{ getFilteredData().length }} {{ title?.toLowerCase() || 'registros' }}
        </div>
        <div class="pagination-controls">
          <button class="btn-page" (click)="previousPage()" [disabled]="currentPage === 0">‹ Anterior</button>
          <span class="page-info">Página {{ currentPage + 1 }} de {{ getTotalPages() }}</span>
          <button class="btn-page" (click)="nextPage()" [disabled]="currentPage >= getTotalPages() - 1">Siguiente ›</button>
        </div>
        <div class="rows-per-page">
          <select [(ngModel)]="rowsPerPage" (change)="onRowsPerPageChange()">
            <option *ngFor="let option of (config.rowsPerPageOptions || [5,10,25])" [value]="option">
              {{ option }} por página
            </option>
          </select>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .shared-table-container {
      width: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .table-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      flex-wrap: wrap;
      gap: 1rem;
      border: 1px solid #e9ecef;
    }

    .toolbar-left, .toolbar-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .global-filter-input {
      width: 300px;
      padding: 0.5rem 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 0.9rem;
    }

    .global-filter-input:focus {
      outline: none;
      border-color: #0d6efd;
      box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-success { background: #198754; color: white; }
    .btn-success:hover { background: #157347; }
    .btn-info { background: #0dcaf0; color: #000; }
    .btn-info:hover { background: #31d2f2; }

    .table-caption {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background: #e9ecef;
      border-radius: 6px 6px 0 0;
      border: 1px solid #dee2e6;
      border-bottom: none;
    }

    .caption-left h3 {
      margin: 0;
      color: #495057;
      font-size: 1.1rem;
    }

    .selection-info {
      color: #0d6efd;
      font-weight: 500;
      font-size: 0.85rem;
    }

    .total-info {
      color: #6c757d;
      font-size: 0.85rem;
    }

    .table-responsive {
      overflow-x: auto;
      border-radius: 0 0 6px 6px;
    }

    .custom-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border: 1px solid #dee2e6;
    }

    .custom-table th {
      background: #f8f9fa;
      padding: 0.75rem;
      text-align: left;
      border-bottom: 2px solid #dee2e6;
      font-weight: 600;
      color: #495057;
      font-size: 0.875rem;
    }

    .custom-table th.sortable {
      cursor: pointer;
      user-select: none;
    }

    .custom-table th.sortable:hover {
      background: #e9ecef;
    }

    .sort-icon {
      margin-left: 0.5rem;
      font-size: 0.75rem;
    }

    .custom-table td {
      padding: 0.75rem;
      border-bottom: 1px solid #dee2e6;
      vertical-align: middle;
    }

    .custom-table tr:hover {
      background: #f8f9fa;
    }

    .custom-table tr.selected {
      background: #e7f3ff;
    }

    .tag {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .tag-success { background: #d1e7dd; color: #0f5132; }
    .tag-warning { background: #fff3cd; color: #664d03; }
    .tag-danger { background: #f8d7da; color: #721c24; }
    .tag-info { background: #d1ecf1; color: #0c5460; }
    .tag-secondary { background: #e2e3e5; color: #41464b; }

    .status-true { color: #198754; font-weight: bold; }
    .status-false { color: #dc3545; font-weight: bold; }

    .action-buttons {
      display: flex;
      gap: 0.25rem;
      justify-content: center;
    }

    .btn-action {
      padding: 0.25rem 0.5rem;
      border: none;
      background: transparent;
      cursor: pointer;
      border-radius: 4px;
      font-size: 1rem;
    }

    .btn-action:hover {
      background: #f8f9fa;
    }

    .empty-state {
      padding: 3rem;
      text-align: center;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      display: block;
    }

    .empty-message {
      color: #6c757d;
      font-size: 1rem;
    }

    .pagination-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-top: none;
      border-radius: 0 0 6px 6px;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .pagination-info {
      font-size: 0.875rem;
      color: #6c757d;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .btn-page {
      padding: 0.375rem 0.75rem;
      border: 1px solid #ced4da;
      background: white;
      cursor: pointer;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .btn-page:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-page:not(:disabled):hover {
      background: #e9ecef;
    }

    .page-info {
      font-size: 0.875rem;
      color: #495057;
    }

    .rows-per-page select {
      padding: 0.375rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 0.875rem;
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

      .pagination-container {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .custom-table {
        font-size: 0.875rem;
      }

      .custom-table th,
      .custom-table td {
        padding: 0.5rem;
      }
    }
  `]
})
export class SharedTableComponent implements OnInit {
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
  sortField: string = '';
  sortOrder: number = 1; // 1 = asc, -1 = desc
  currentPage: number = 0;
  rowsPerPage: number = 10;

  ngOnInit() {
    this.rowsPerPage = this.config.rows || 10;
  }

  get allSelected(): boolean {
    const filteredData = this.getFilteredData();
    return filteredData.length > 0 && filteredData.every(item => this.isSelected(item));
  }

  onGlobalFilter(event: Event) {
    const target = event.target as HTMLInputElement;
    this.globalFilterValue = target.value;
    this.currentPage = 0; // Reset to first page when filtering
  }

  getFilteredData(): any[] {
    if (!this.globalFilterValue) {
      return this.getSortedData();
    }

    const filterValue = this.globalFilterValue.toLowerCase();
    const filtered = this.data.filter(item => {
      const filterFields = this.getFilterFields();
      return filterFields.some(field => {
        const value = item[field]?.toString().toLowerCase() || '';
        return value.includes(filterValue);
      });
    });

    return this.sortData(filtered);
  }

  getSortedData(): any[] {
    return this.sortData([...this.data]);
  }

  sortData(data: any[]): any[] {
    if (!this.sortField) return data;

    return data.sort((a, b) => {
      const aVal = a[this.sortField];
      const bVal = b[this.sortField];
      
      let result = 0;
      if (aVal < bVal) result = -1;
      else if (aVal > bVal) result = 1;
      
      return result * this.sortOrder;
    });
  }

  getPaginatedData(): any[] {
    const filtered = this.getFilteredData();
    if (this.config.paginator === false) return filtered;

    const start = this.currentPage * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    return filtered.slice(start, end);
  }

  sort(field: string) {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 1 ? -1 : 1;
    } else {
      this.sortField = field;
      this.sortOrder = 1;
    }
  }

  isSelected(item: any): boolean {
    return this.selectedItems.some(selected => selected === item);
  }

  toggleSelection(item: any, event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      if (!this.isSelected(item)) {
        this.selectedItems.push(item);
      }
    } else {
      this.selectedItems = this.selectedItems.filter(selected => selected !== item);
    }
    this.selectionChange.emit(this.selectedItems);
  }

  selectSingle(item: any) {
    this.selectedItems = [item];
    this.selectionChange.emit(this.selectedItems);
  }

  toggleAll(event: Event) {
    const target = event.target as HTMLInputElement;
    const filteredData = this.getFilteredData();
    
    if (target.checked) {
      filteredData.forEach(item => {
        if (!this.isSelected(item)) {
          this.selectedItems.push(item);
        }
      });
    } else {
      this.selectedItems = this.selectedItems.filter(selected => 
        !filteredData.some(item => item === selected)
      );
    }
    this.selectionChange.emit(this.selectedItems);
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.getTotalPages() - 1) {
      this.currentPage++;
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.getFilteredData().length / this.rowsPerPage);
  }

  getStartRecord(): number {
    return this.currentPage * this.rowsPerPage + 1;
  }

  getEndRecord(): number {
    const end = (this.currentPage + 1) * this.rowsPerPage;
    return Math.min(end, this.getFilteredData().length);
  }

  onRowsPerPageChange() {
    this.currentPage = 0;
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

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES') + ' ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  getColspan(): number {
    let colspan = this.columns.length;
    if (this.config.selectionMode) colspan++;
    if (this.showActions) colspan++;
    return colspan;
  }
}