# Workspace Aure

Multi-aplicación Ionic 8 + Angular 20 + PrimeNG 20.3.0

## Estructura del Proyecto

```
workspace-aure/
├── frontend/
│   ├── portal/          # Aplicación portal (navegación principal)
│   ├── app1/           # Aplicación ejemplo 1
│   ├── app2/           # Aplicación ejemplo 2
│   └── shared-lib/     # Librería compartida con componentes PrimeNG
└── package.json        # Scripts del workspace
```

## Tecnologías

- **Ionic**: 8.0.0
- **Angular**: 20.0.0 (Standalone Components)
- **PrimeNG**: 20.3.0
- **PrimeIcons**: 7.0.0
- **TypeScript**: 5.8.0
- **Capacitor**: 7.x

## Instalación

```bash
# Instalar dependencias de todas las aplicaciones
npm run install:all

# O instalar individualmente
cd frontend/shared-lib && npm install
cd frontend/portal && npm install
cd frontend/app1 && npm install
cd frontend/app2 && npm install
```

## Desarrollo

### Ejecutar aplicaciones

```bash
# Portal (puerto 8100)
npm run start:portal

# App1 (puerto 8101)
npm run start:app1

# App2 (puerto 8102)
npm run start:app2

# Todas las aplicaciones simultáneamente
npm run start:all
```

### Build

```bash
# Portal
npm run build:portal

# App1
npm run build:app1

# App2
npm run build:app2

# Todas las aplicaciones
npm run build:all
```

## Características

### Portal
- Navegación por router (no tabs)
- Enlaces a App1 y App2
- Arquitectura de componentes standalone

### Shared Library
- **SharedTableComponent**: Componente p-table avanzado de PrimeNG
- Interfaces TypeScript para configuración de tablas
- Funcionalidades: paginación, ordenamiento, filtrado, selección, acciones

### Apps de Ejemplo
- Aplicaciones Ionic blank template
- Configuración PrimeNG integrada
- Listas para usar componentes compartidos

## Uso de la Librería Compartida

```typescript
// En cualquier aplicación
import { SharedTableComponent } from 'shared-lib';

// Configuración de tabla
const tableConfig = {
  columns: [
    { field: 'name', header: 'Nombre', sortable: true },
    { field: 'email', header: 'Email', filterable: true }
  ],
  // ... más configuraciones
};
```

## Scripts Disponibles

- `npm run start:portal` - Ejecutar portal
- `npm run start:app1` - Ejecutar app1  
- `npm run start:app2` - Ejecutar app2
- `npm run start:all` - Ejecutar todas las apps
- `npm run build:all` - Build de todas las apps
- `npm run install:all` - Instalar dependencias de todas las apps