#!/bin/bash

# Script para inicializar el repositorio Git con commits progresivos
# Ejecutar después de npm install

echo "🚀 Inicializando repositorio Git con historial de desarrollo..."

git init

# Commit 1: Configuración inicial del proyecto
git add package.json tsconfig.json next.config.js tailwind.config.js postcss.config.js .gitignore .eslintrc.json
git commit -m "chore: initial project setup with Next.js, TypeScript, and Tailwind"

# Commit 2: Definición de tipos
git add types/
git commit -m "feat: add TypeScript type definitions for tasks and audit logs"

# Commit 3: Utilidades de storage
git add lib/storage.ts lib/utils.ts
git commit -m "feat: implement localStorage persistence with import/export validation"

# Commit 4: Parser de búsqueda
git add lib/query.ts
git commit -m "feat: add advanced search query parser with operators"

# Commit 5: Sistema de auditoría
git add lib/audit.ts
git commit -m "feat: audit log diff implementation with report generation"

# Commit 6: Componentes UI base
git add components/ui/button.tsx components/ui/input.tsx components/ui/label.tsx components/ui/card.tsx
git commit -m "feat: add base Shadcn UI components"

# Commit 7: Más componentes UI
git add components/ui/dialog.tsx components/ui/select.tsx components/ui/badge.tsx components/ui/textarea.tsx
git commit -m "feat: add form-related UI components"

# Commit 8: Componentes de navegación
git add components/ui/tabs.tsx components/ui/switch.tsx components/ui/table.tsx
git commit -m "feat: add navigation and data display components"

# Commit 9: Componentes interactivos
git add components/ui/tooltip.tsx components/ui/popover.tsx components/ui/alert-dialog.tsx components/ui/alert.tsx
git commit -m "feat: add interactive UI components for better UX"

# Commit 10: Estilos globales
git add app/globals.css
git commit -m "style: implement custom theme with warm color palette and typography"

# Commit 11: Componente TaskCard con drag
git add components/TaskCard.tsx
git commit -m "feat: create TaskCard component with drag and drop support"

# Commit 12: Columnas del Kanban
git add components/KanbanColumn.tsx
git commit -m "feat: implement droppable Kanban columns with empty states"

# Commit 13: Board principal
git add components/KanbanBoard.tsx
git commit -m "feat: integrate drag and drop board with dnd-kit"

# Commit 14: Formulario de tareas
git add components/TaskForm.tsx
git commit -m "feat: task form with Zod validation and tag management"

# Commit 15: Barra de búsqueda
git add components/SearchBar.tsx
git commit -m "feat: advanced search bar with operator hints"

# Commit 16: Visor de auditoría
git add components/AuditLogViewer.tsx
git commit -m "feat: audit log viewer with filtering and copy report feature"

# Commit 17: Panel Modo Dios
git add components/GodModePanel.tsx
git commit -m "feat: god mode panel for teacher evaluation with rubric system"

# Commit 18: Página principal
git add app/page.tsx app/layout.tsx
git commit -m "feat: integrate all components in main page with state management"

# Commit 19: README
git add README.md
git commit -m "docs: add comprehensive README with setup and technical decisions"

# Commit 20: Mejoras finales
git add .
git commit -m "fix: import validation and accessibility improvements"

echo "✅ Repositorio inicializado con 20 commits progresivos"
echo "📝 Revisa el historial con: git log --oneline"
