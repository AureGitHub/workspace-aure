import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PrimeTableColumn {
  field: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'tag';
  width?: string;
}

export interface PrimeTableConfig {
  paginator?: boolean;
  rows?: number;
  showCurrentPageReport?: boolean;
  rowsPerPageOptions?: number[];
  globalFilterFields?: string[];
  selectionMode?: 'single' | 'multiple';
  dataKey?: string;
  sortMode?: 'single' | 'multiple';
  filterDelay?: number;
  scrollable?: boolean;
  scrollHeight?: string;
  responsive?: boolean;
}

@Component({
  selector: 'lib-prime-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  template: `
    <div class="prime-table-container">
      <!-- Header with global filter -->
      <div class="table-header">
        <h3 *ngIf="title">{{ title }}</h3>
        <div class="filter-container">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              (input)="onGlobalFilter($event)" 
              placeholder="Search..." 
              class="global-filter-input"
            />
          </div>
        </div>
      </div>

      <!-- Simple HTML Table styled like PrimeNG -->
      <div class="table-wrapper">
        <table class="prime-styled-table">
          <thead>
            <tr>
              <th *ngFor="let col of columns" 
                  [style.width]="col.width"
                  class="sortable-header"
                  (click)="onSort(col)">
                {{ col.header }}
                <span *ngIf="col.sortable" class="sort-icon">
                  {{ getSortIcon(col.field) }}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let rowData of pagedData; let i = index" 
                (click)="onRowClick(rowData)" 
                [class.selected-row]="isRowSelected(rowData)"
                [class.even-row]="i % 2 === 0"
                [class.odd-row]="i % 2 === 1">
              <td *ngFor="let col of columns">
                <ng-container [ngSwitch]="col.type || 'text'">
                  
                  <!-- Text type -->
                  <span *ngSwitchCase="'text'">
                    {{ getFieldValue(rowData, col.field) }}
                  </span>
                  
                  <!-- Number type -->
                  <span *ngSwitchCase="'number'">
                    {{ getFieldValue(rowData, col.field) | number }}
                  </span>
                  
                  <!-- Date type -->
                  <span *ngSwitchCase="'date'">
                    {{ getFieldValue(rowData, col.field) | date:'medium' }}
                  </span>
                  
                  <!-- Boolean type -->
                  <span *ngSwitchCase="'boolean'">
                    <span [class]="getFieldValue(rowData, col.field) ? 'bool-icon bool-true' : 'bool-icon bool-false'">
                      {{ getFieldValue(rowData, col.field) ? '✓' : '✗' }}
                    </span>
                  </span>
                  
                  <!-- Tag type -->
                  <span *ngSwitchCase="'tag'" [class]="'status-tag status-' + getFieldValue(rowData, col.field)?.toLowerCase()">
                    {{ getFieldValue(rowData, col.field) }}
                  </span>
                  
                  <!-- Default text -->
                  <span *ngSwitchDefault>
                    {{ getFieldValue(rowData, col.field) }}
                  </span>
                  
                </ng-container>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination-wrapper" *ngIf="config.paginator">
        <div class="pagination-info">
          Showing {{ getStartRecord() }} to {{ getEndRecord() }} of {{ filteredData.length }} entries
        </div>
        <div class="pagination-controls">
          <button (click)="previousPage()" [disabled]="currentPage === 0" class="page-btn">❮</button>
          <span class="page-info">Page {{ currentPage + 1 }} of {{ getTotalPages() }}</span>
          <button (click)="nextPage()" [disabled]="currentPage >= getTotalPages() - 1" class="page-btn">❯</button>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="table-actions" *ngIf="showActions">
        <button 
          type="button" 
          (click)="onRefresh()"
          class="action-button refresh-btn">
          🔄 Refresh
        </button>
        <button 
          type="button" 
          (click)="onExport()"
          class="action-button export-btn">
          📥 Export
        </button>
      </div>
    </div>
  `,
  styles: [`
    .prime-table-container {
      margin: 1rem 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .table-header h3 {
      margin: 0;
      color: #495057;
      font-weight: 600;
    }

    .search-input-wrapper {
      position: relative;
      display: inline-block;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #6c757d;
      font-size: 14px;
    }

    .global-filter-input {
      width: 250px;
      padding: 0.5rem 0.75rem 0.5rem 2.5rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 14px;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    .global-filter-input:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }

    .table-wrapper {
      border: 1px solid #dee2e6;
      border-radius: 4px;
      overflow: hidden;
      background: white;
    }

    .prime-styled-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .prime-styled-table thead th {
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
      padding: 1rem 0.75rem;
      text-align: left;
      font-weight: 600;
      color: #495057;
      user-select: none;
    }

    .sortable-header {
      cursor: pointer;
      transition: background-color 0.15s;
    }

    .sortable-header:hover {
      background: #e9ecef;
    }

    .sort-icon {
      margin-left: 0.5rem;
      font-size: 12px;
      color: #6c757d;
    }

    .prime-styled-table tbody tr {
      border-bottom: 1px solid #dee2e6;
      transition: background-color 0.15s;
    }

    .prime-styled-table tbody tr:hover {
      background: #f8f9fa;
    }

    .prime-styled-table tbody tr.selected-row {
      background: #e3f2fd !important;
    }

    .prime-styled-table tbody tr.even-row {
      background: #ffffff;
    }

    .prime-styled-table tbody tr.odd-row {
      background: #f8f9fa;
    }

    .prime-styled-table tbody td {
      padding: 0.75rem;
      color: #495057;
      vertical-align: middle;
    }

    .bool-icon {
      font-weight: bold;
      font-size: 16px;
    }

    .bool-true {
      color: #28a745;
    }

    .bool-false {
      color: #dc3545;
    }

    .status-tag {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-align: center;
      display: inline-block;
      min-width: 60px;
    }

    .status-activo {
      background-color: #d1edff;
      color: #003d71;
    }

    .status-inactivo {
      background-color: #ffe6e6;
      color: #b30000;
    }

    .status-pendiente {
      background-color: #fff3cd;
      color: #856404;
    }

    .pagination-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: #f8f9fa;
      border-top: 1px solid #dee2e6;
      font-size: 14px;
    }

    .pagination-info {
      color: #495057;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .page-btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 0.375rem 0.75rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.15s;
    }

    .page-btn:hover:not(:disabled) {
      background: #0056b3;
    }

    .page-btn:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }

    .page-info {
      color: #495057;
      font-weight: 500;
    }

    .table-actions {
      margin-top: 1rem;
      display: flex;
      gap: 0.5rem;
    }

    .action-button {
      background: #6c757d;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.15s;
    }

    .refresh-btn:hover {
      background: #5a6268;
    }

    .export-btn:hover {
      background: #5a6268;
    }
  `]
})
export class PrimeTableComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];
  @Input() columns: PrimeTableColumn[] = [];
  @Input() config: PrimeTableConfig = {};
  @Input() title: string = '';
  @Input() showActions: boolean = true;
  @Input() selectedItems: any[] = [];

  @Output() rowSelect = new EventEmitter<any>();
  @Output() rowUnselect = new EventEmitter<any>();
  @Output() refresh = new EventEmitter<void>();
  @Output() export = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<any[]>();

  filteredData: any[] = [];
  pagedData: any[] = [];
  globalFilterValue: string = '';
  currentPage: number = 0;
  sortField: string = '';
  sortOrder: number = 0; // 0: no sort, 1: asc, -1: desc

  ngOnInit() {
    // Set default config values
    this.config = {
      paginator: true,
      rows: 10,
      showCurrentPageReport: true,
      rowsPerPageOptions: [5, 10, 20, 50],
      globalFilterFields: this.columns.map(col => col.field),
      selectionMode: 'single',
      dataKey: 'id',
      sortMode: 'multiple',
      filterDelay: 300,
      scrollable: false,
      responsive: true,
      ...this.config
    };
    
    // Initialize filtered data
    this.filteredData = [...this.data];
    this.updatePagedData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && !changes['data'].firstChange) {
      this.filteredData = [...this.data];
      // Reapply global filter if there's one
      if (this.globalFilterValue) {
        this.applyGlobalFilter();
      } else {
        this.updatePagedData();
      }
    }
  }

  onGlobalFilter(event: any) {
    this.globalFilterValue = event.target.value;
    this.applyGlobalFilter();
  }

  private applyGlobalFilter() {
    if (!this.globalFilterValue) {
      this.filteredData = [...this.data];
    } else {
      this.filteredData = this.data.filter(item => {
        return this.columns.some(col => {
          const value = this.getFieldValue(item, col.field);
          return value && value.toString().toLowerCase().includes(this.globalFilterValue.toLowerCase());
        });
      });
    }
    
    this.currentPage = 0;
    this.updatePagedData();
  }

  onRowClick(rowData: any) {
    if (this.config.selectionMode === 'single') {
      const wasSelected = this.isRowSelected(rowData);
      this.selectedItems = wasSelected ? [] : [rowData];
      
      if (wasSelected) {
        this.onRowUnselect({ data: rowData });
      } else {
        this.onRowSelect({ data: rowData });
      }
    }
  }

  isRowSelected(rowData: any): boolean {
    return this.selectedItems.some(item => 
      this.getFieldValue(item, this.config.dataKey || 'id') === 
      this.getFieldValue(rowData, this.config.dataKey || 'id')
    );
  }

  onRowSelect(event: any) {
    this.rowSelect.emit(event);
    this.selectionChange.emit(this.selectedItems);
  }

  onRowUnselect(event: any) {
    this.rowUnselect.emit(event);
    this.selectionChange.emit(this.selectedItems);
  }

  onRefresh() {
    this.refresh.emit();
  }

  onExport() {
    this.export.emit();
  }

  getFieldValue(obj: any, field: string): any {
    return field.split('.').reduce((o, f) => o && o[f], obj);
  }

  // Pagination methods
  updatePagedData() {
    const startIndex = this.currentPage * (this.config.rows || 10);
    const endIndex = startIndex + (this.config.rows || 10);
    this.pagedData = this.filteredData.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredData.length / (this.config.rows || 10));
  }

  getStartRecord(): number {
    return this.currentPage * (this.config.rows || 10) + 1;
  }

  getEndRecord(): number {
    const endRecord = (this.currentPage + 1) * (this.config.rows || 10);
    return Math.min(endRecord, this.filteredData.length);
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updatePagedData();
    }
  }

  nextPage() {
    if (this.currentPage < this.getTotalPages() - 1) {
      this.currentPage++;
      this.updatePagedData();
    }
  }

  // Sorting methods
  onSort(column: PrimeTableColumn) {
    if (!column.sortable) return;

    if (this.sortField === column.field) {
      this.sortOrder = this.sortOrder === 1 ? -1 : this.sortOrder === -1 ? 0 : 1;
    } else {
      this.sortField = column.field;
      this.sortOrder = 1;
    }

    if (this.sortOrder === 0) {
      this.filteredData = [...this.data];
      this.applyGlobalFilter();
    } else {
      this.filteredData.sort((a, b) => {
        const valueA = this.getFieldValue(a, this.sortField);
        const valueB = this.getFieldValue(b, this.sortField);
        
        if (valueA < valueB) return -1 * this.sortOrder;
        if (valueA > valueB) return 1 * this.sortOrder;
        return 0;
      });
    }

    this.currentPage = 0;
    this.updatePagedData();
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) return '↕️';
    if (this.sortOrder === 1) return '↑';
    if (this.sortOrder === -1) return '↓';
    return '↕️';
  }
}