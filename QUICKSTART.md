# 🚀 Guía Rápida de Instalación

## Pasos para poner en marcha el proyecto

### 1. Instalar dependencias

```bash
npm install
```

Esto instalará todas las dependencias listadas en `package.json`:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Shadcn UI (Radix primitives)
- dnd-kit para drag & drop
- Zod para validación
- react-hook-form
- uuid
- date-fns
- sonner (toast notifications)

### 2. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

### 3. Inicializar Git (opcional pero recomendado)

```bash
chmod +x init-git.sh
./init-git.sh
```

Esto creará un historial de Git con 20 commits progresivos que muestran el desarrollo incremental del proyecto.

### 4. Importar datos de ejemplo (opcional)

1. Abre la aplicación en el navegador
2. Click en el botón "Importar" en la esquina superior derecha
3. Selecciona el archivo `sample-data.json`
4. Verás 10 tareas de ejemplo y 5 eventos de auditoría

### 5. Build para producción

```bash
npm run build
npm start
```

### 6. Deploy en Vercel

**Opción A - CLI:**
```bash
npm i -g vercel
vercel
```

**Opción B - Dashboard:**
1. Ve a [vercel.com](https://vercel.com)
2. Click en "Add New Project"
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente Next.js
5. Click en "Deploy"

## Estructura del proyecto

```
kanban-project/
├── app/
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Página principal con state management
│   └── globals.css         # Estilos globales y tema
├── components/
│   ├── ui/                 # Componentes Shadcn UI
│   ├── KanbanBoard.tsx     # Board con DnD context
│   ├── KanbanColumn.tsx    # Columna droppable
│   ├── TaskCard.tsx        # Card draggable
│   ├── TaskForm.tsx        # Form con validación Zod
│   ├── SearchBar.tsx       # Buscador con operadores
│   ├── AuditLogViewer.tsx  # Tabla de auditoría
│   └── GodModePanel.tsx    # Panel de evaluación
├── lib/
│   ├── storage.ts          # Persistencia localStorage
│   ├── query.ts            # Parser de búsqueda
│   ├── audit.ts            # Sistema de auditoría
│   └── utils.ts            # Utilidades (cn)
├── types/
│   └── index.ts            # Definiciones TypeScript
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

## Comandos útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Producción local
npm start

# Linting
npm run lint

# Ver logs de Git
git log --oneline
```

## Troubleshooting

### Error: Module not found
```bash
rm -rf node_modules package-lock.json
npm install
```

### Puerto 3000 ocupado
```bash
# Usar otro puerto
npm run dev -- -p 3001
```

### Errores de TypeScript
```bash
# Limpiar cache
rm -rf .next
npm run dev
```

## Features principales a probar

1. **Crear tarea**: Click en "Nueva Tarea" → llenar formulario → guardar
2. **Drag & Drop**: Arrastra una tarea entre columnas
3. **Búsqueda**: Prueba `tag:backend p:high est:>=120`
4. **Auditoría**: Ve a pestaña "Auditoría" → filtra por acción
5. **Modo Dios**: Activa switch → evalúa tareas con rúbrica
6. **Export/Import**: Exporta → modifica JSON → reimporta

## Siguientes pasos

- [ ] Subir a GitHub
- [ ] Deploy en Vercel
- [ ] Actualizar README con URLs reales
- [ ] Capturar 3 screenshots
- [ ] Entregar links

¡Listo para desarrollar! 🎉
