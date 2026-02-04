# 📋 Kanban Auditor

Sistema avanzado de gestión de tareas tipo Kanban con auditoría completa, búsqueda avanzada y modo de evaluación docente.

## 🎯 Objetivo

Crear un gestor de tareas profesional para **desarrollo de software** que incluye:
- Tablero Kanban con drag & drop real
- Sistema de auditoría completo con diff de cambios
- Búsqueda avanzada con operadores
- Persistencia en localStorage
- Modo "Dios" para evaluación docente
- Export/Import JSON con validación

## 🚀 Cómo usar

### Instalación

```bash
# Clonar el repositorio
git clone <tu-repo>
cd kanban-auditor

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Despliegue en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deployar
vercel
```

O conecta tu repositorio GitHub directamente en [vercel.com](https://vercel.com).

## 📸 Capturas

### Tablero Principal
![Tablero Kanban con tres columnas (Por Hacer, En Progreso, Completado) mostrando tarjetas de tareas con prioridades, tags y estimaciones. Incluye drag & drop visual.](./docs/screenshot-board.png)

*Vista principal del tablero con drag & drop entre columnas*

### Sistema de Auditoría
![Vista de tabla con eventos de auditoría mostrando timestamp, acción (CREATE/UPDATE/DELETE/MOVE), Task ID y diff de cambios. Incluye filtros por acción y taskId.](./docs/screenshot-audit.png)

*Log de auditoría completo con diff de cambios y filtros*

### Modo Dios - Evaluación
![Panel de evaluación del docente con estadísticas (media, evaluadas, sin evaluar) y lista de tareas con rúbricas de 0-10 y observaciones.](./docs/screenshot-god-mode.png)

*Panel de evaluación con rúbrica y observaciones para el docente*

## ✅ Checklist de Requisitos

### Funcionales
- ✅ **Kanban completo** con 3 columnas fijas (Todo, Doing, Done)
- ✅ **CRUD de tareas** con todos los campos requeridos
- ✅ **Drag & Drop real** con @dnd-kit (no solo botones)
- ✅ **Auditoría completa** con diff antes/después
- ✅ **Búsqueda avanzada** con operadores (`tag:`, `p:`, `due:`, `est:`)
- ✅ **Persistencia** en localStorage
- ✅ **Export JSON** con descarga de archivo
- ✅ **Import JSON** con validación de campos y resolución de IDs duplicados
- ✅ **Modo Dios** con columna observaciones, rúbrica 0-10 y panel resumen

### Técnicos
- ✅ **Shadcn UI** (Dialog, Form, Select, Badge, Tabs, Table, Toast, AlertDialog)
- ✅ **TypeScript sin any**
- ✅ **Validación Zod** en formularios
- ✅ **Separación de código** (types, lib/storage, lib/query, componentes)
- ✅ **Accesibilidad**: navegación por teclado, aria-labels, foco en modales
- ✅ **Estados vacíos** significativos con iconos y mensajes
- ✅ **10+ commits** con mensajes descriptivos

## 🏗️ Decisiones Técnicas

### Arquitectura y Estructura

**Separación por responsabilidades**: El código está organizado en capas claras:
- `types/` - Definiciones TypeScript centralizadas
- `lib/` - Lógica de negocio (storage, query parser, audit)
- `components/` - UI reutilizable dividida en componentes atómicos
- `app/` - Páginas y layouts de Next.js 14 con App Router

**Por qué esta estructura**: Permite escalabilidad, testing independiente y claridad en las responsabilidades. Cada módulo tiene un propósito único y bien definido.

### Sistema de Auditoría

**Implementación del diff**: Cada operación (CREATE, UPDATE, DELETE, MOVE) genera un log con:
- Estado "antes" y "después" de la tarea
- Timestamp preciso
- taskId para trazabilidad
- userLabel fijo como "Alumno/a"

**Persistencia del historial**: Los logs se guardan en el mismo localStorage junto con las tareas, garantizando que el historial sobreviva a recargas de página. Al importar JSON, los logs se preservan y se añaden eventos de resolución de IDs duplicados.

**Por qué este approach**: Permite debugging completo, auditoría de calidad profesional y cumple con el requisito "anti-chatgpt" de demostrar comprensión del estado.

### Parser de Búsqueda

**Tokenización y operadores**: El parser divide la query en tokens y detecta patrones:
```typescript
'tag:react p:high est:>=120' → {
  tags: ['react'],
  prioridad: 'high',
  estimacionMin: 120,
  estimacionOperator: '>='
}
```

**Filtrado compuesto**: Los filtros se aplican secuencialmente con lógica AND, permitiendo búsquedas complejas como "bug tag:backend due:week p:high".

**Por qué esta solución**: Es más intuitivo que un query builder UI y demuestra parsing real de texto. La UI de hints ayuda al usuario a descubrir los operadores.

### Persistencia y Validación

**localStorage con versionado**: Guardamos un objeto `BoardData` con versión para futuras migraciones:
```typescript
{
  tasks: Task[],
  auditLogs: AuditLog[],
  version: "1.0.0"
}
```

**Validación en import**: Verificamos cada campo de cada tarea según el schema Zod. Si hay IDs duplicados, los regeneramos automáticamente y lo registramos en auditoría.

**Por qué Zod**: Type-safe validation que se sincroniza con TypeScript. Los errores son claros y específicos para mostrar al usuario.

### Drag & Drop con dnd-kit

**Sensors y colisiones**: Usamos PointerSensor con threshold de 8px para evitar drags accidentales. El algoritmo `closestCorners` detecta la columna destino.

**DragOverlay**: Mostramos una copia semi-transparente y rotada de la tarea durante el drag, mejorando el feedback visual.

**Por qué dnd-kit**: Moderna, accesible por defecto, funciona con React 18 y Next.js 14. Más ligera que react-beautiful-dnd.

### Accesibilidad

**Navegación por teclado**: 
- Tab/Shift+Tab entre elementos
- Enter para abrir modales
- Escape para cerrar
- Foco automático en inputs al abrir forms

**ARIA labels**: Todos los botones icon-only tienen aria-label. Los formularios tienen descripciones para screen readers.

**Contraste**: Palette de colores warm con contraste WCAG AA mínimo. Estados focus con ring visible.

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript (strict mode, sin any)
- **UI**: Shadcn UI (Radix primitives)
- **Estilos**: Tailwind CSS con custom theme
- **Drag & Drop**: @dnd-kit
- **Validación**: Zod + react-hook-form
- **Fechas**: date-fns
- **Notificaciones**: Sonner
- **Fuentes**: Crimson Pro (serif) + DM Mono

## 📦 Modelo de Datos

```typescript
interface Task {
  id: string;              // UUID
  titulo: string;          // min 3 chars
  descripcion?: string;    // opcional
  prioridad: 'low' | 'medium' | 'high';
  tags: string[];
  estimacionMin: number;   // minutos
  fechaCreacion: string;   // ISO
  fechaLimite?: string;    // ISO, opcional
  estado: 'todo' | 'doing' | 'done';
  // Modo Dios
  observacionesJavi?: string;
  rubrica?: number;        // 0-10
}

interface AuditLog {
  id: string;
  timestamp: string;
  accion: 'CREATE' | 'UPDATE' | 'DELETE' | 'MOVE';
  taskId: string;
  diff: {
    antes?: Partial<Task>;
    despues?: Partial<Task>;
  };
  userLabel: string;
}
```

**Por qué este modelo**: Es completo pero no excesivo. Los campos opcionales permiten flexibilidad. El diff parcial ahorra espacio en localStorage.

## 🎨 Diseño UI/UX

**Estética**: Palette warm (ambers, oranges) con fuentes serif/mono para darle personalidad profesional pero accesible. No es el típico azul corporativo.

**Animaciones**: Fade-in staggered en cards, scale en drag, smooth transitions. CSS-only para performance.

**Empty states**: Iconos grandes (📋) con mensajes contextuales. No dejamos espacios vacíos sin explicar.

## 🔗 Enlaces

- **Vercel Deploy**: [TU_URL_AQUI.vercel.app](https://tu-url.vercel.app)
- **GitHub Repo**: [github.com/tu-usuario/kanban-auditor](https://github.com/tu-usuario/kanban-auditor)

## 📝 Instrucciones de Entrega

1. **Deployar en Vercel** y obtener URL pública
2. **Subir a GitHub** público con el historial de commits
3. **Actualizar este README** con tus enlaces reales
4. **Capturar 3 screenshots** y guardarlas en `/docs/`
5. **Entregar** el link de Vercel + link de GitHub
