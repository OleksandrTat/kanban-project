"use client";

import { useEffect, useState } from 'react';
import { Task, TaskStatus, BoardData, SearchQuery } from '@/types';
import { KanbanBoard } from '@/components/KanbanBoard';
import { TaskForm } from '@/components/TaskForm';
import { SearchBar } from '@/components/SearchBar';
import { AuditLogViewer } from '@/components/AuditLogViewer';
import { GodModePanel } from '@/components/GodModePanel';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { loadBoardData, saveBoardData, downloadJSON, validateBoardData } from '@/lib/storage';
import { createAuditLog } from '@/lib/audit';
import { parseSearchQuery, filterTasks } from '@/lib/query';
import { Plus, Download, Upload, Crown, AlertCircle } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const [boardData, setBoardData] = useState<BoardData>({ tasks: [], auditLogs: [], version: '1.0.0' });
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [godMode, setGodMode] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [showImportAlert, setShowImportAlert] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load data on mount
  useEffect(() => {
    const data = loadBoardData();
    setBoardData(data);
    setFilteredTasks(data.tasks);
    setIsHydrated(true);
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    if (!isHydrated) return;
    saveBoardData(boardData);
  }, [boardData, isHydrated]);

  // Filter tasks based on search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTasks(boardData.tasks);
    } else {
      const query: SearchQuery = parseSearchQuery(searchQuery);
      const filtered = filterTasks(boardData.tasks, query);
      setFilteredTasks(filtered);
    }
  }, [searchQuery, boardData.tasks]);

  const handleCreateTask = (data: Omit<Task, 'id' | 'estado' | 'fechaCreacion'>) => {
    const newTask: Task = {
      ...data,
      id: uuidv4(),
      estado: 'todo',
      fechaCreacion: new Date().toISOString(),
    };

    const auditLog = createAuditLog('CREATE', newTask.id, undefined, newTask);

    setBoardData(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
      auditLogs: [...prev.auditLogs, auditLog],
    }));

    toast.success('Tarea creada exitosamente');
  };

  const handleUpdateTask = (updatedTask: Task) => {
    const originalTask = boardData.tasks.find(t => t.id === updatedTask.id);
    
    if (originalTask) {
      const auditLog = createAuditLog('UPDATE', updatedTask.id, originalTask, updatedTask);

      setBoardData(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === updatedTask.id ? updatedTask : t),
        auditLogs: [...prev.auditLogs, auditLog],
      }));

      toast.success('Tarea actualizada');
    }
  };

  const handleMoveTask = (taskId: string, newStatus: TaskStatus) => {
    const task = boardData.tasks.find(t => t.id === taskId);
    
    if (task && task.estado !== newStatus) {
      const updatedTask = { ...task, estado: newStatus };
      const auditLog = createAuditLog('MOVE', taskId, { estado: task.estado }, { estado: newStatus });

      setBoardData(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? updatedTask : t),
        auditLogs: [...prev.auditLogs, auditLog],
      }));
    }
  };

  const handleDeleteTask = () => {
    if (deleteTaskId) {
      const task = boardData.tasks.find(t => t.id === deleteTaskId);
      
      if (task) {
        const auditLog = createAuditLog('DELETE', deleteTaskId, task, undefined);

        setBoardData(prev => ({
          ...prev,
          tasks: prev.tasks.filter(t => t.id !== deleteTaskId),
          auditLogs: [...prev.auditLogs, auditLog],
        }));

        toast.success('Tarea eliminada');
      }
      
      setDeleteTaskId(null);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: Omit<Task, 'id' | 'estado' | 'fechaCreacion'>) => {
    if (editingTask) {
      const updatedTask: Task = {
        ...editingTask,
        ...data,
      };
      handleUpdateTask(updatedTask);
    } else {
      handleCreateTask(data);
    }
    setEditingTask(null);
  };

  const handleExport = () => {
    downloadJSON(boardData);
    toast.success('Datos exportados exitosamente');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        const validation = validateBoardData(data);

        if (!validation.valid) {
          setImportErrors(validation.errors.map(e => `${e.field}: ${e.message}`));
          setShowImportAlert(true);
          return;
        }

        if (validation.errors.length > 0) {
          // Had duplicate IDs that were resolved
          const resolveLog = createAuditLog(
            'UPDATE',
            'system',
            undefined,
            { titulo: 'IDs duplicados resueltos durante importación' } as Partial<Task>
          );
          
          if (validation.data) {
            setBoardData({
              ...validation.data,
              auditLogs: [...validation.data.auditLogs, resolveLog],
            });
            setShowImportAlert(false);
            setImportErrors([]);
            toast.success('Datos importados (IDs duplicados fueron regenerados)');
          }
        } else if (validation.data) {
          setBoardData(validation.data);
          setShowImportAlert(false);
          setImportErrors([]);
          toast.success('Datos importados exitosamente');
        }
      } catch (error) {
        setImportErrors(['Archivo JSON inválido']);
        setShowImportAlert(true);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-8">
      <Toaster position="top-right" />
      
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-5xl font-bold tracking-tight mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Kanban Auditor
              </h1>
              <p className="text-muted-foreground text-lg">
                Sistema de gestión de tareas con auditoría completa
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('import-file')?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Importar
              </Button>
              <input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />

              <div className="flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-lg border border-amber-300">
                <Crown className="h-4 w-4 text-amber-600" />
                <Switch
                  id="god-mode"
                  checked={godMode}
                  onCheckedChange={setGodMode}
                />
                <Label htmlFor="god-mode" className="cursor-pointer font-semibold">
                  Modo Dios
                </Label>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <Button onClick={() => {
              setEditingTask(null);
              setIsFormOpen(true);
            }} className="gap-2 flex-shrink-0">
              <Plus className="h-4 w-4" />
              Nueva Tarea
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <Tabs defaultValue="board" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="board">Tablero</TabsTrigger>
            <TabsTrigger value="audit">Auditoría</TabsTrigger>
            {godMode && <TabsTrigger value="god">Evaluación</TabsTrigger>}
          </TabsList>

          <TabsContent value="board" className="space-y-4">
            <div className="h-[calc(100vh-280px)]">
              <KanbanBoard
                tasks={filteredTasks}
                onMoveTask={handleMoveTask}
                onEditTask={handleEditTask}
                onDeleteTask={(id) => setDeleteTaskId(id)}
                godMode={godMode}
              />
            </div>
          </TabsContent>

          <TabsContent value="audit">
            <AuditLogViewer logs={boardData.auditLogs} />
          </TabsContent>

          {godMode && (
            <TabsContent value="god">
              <GodModePanel
                tasks={boardData.tasks}
                onUpdateTask={handleUpdateTask}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Task Form Dialog */}
      <TaskForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingTask(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingTask || undefined}
        title={editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTaskId} onOpenChange={() => setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tarea?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La tarea será eliminada permanentemente
              y se registrará en el log de auditoría.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Error Alert */}
      {showImportAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Alert variant="destructive" className="max-w-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error al importar</AlertTitle>
            <AlertDescription>
              <div className="space-y-1 mt-2">
                {importErrors.map((error, idx) => (
                  <div key={idx} className="text-sm font-mono">• {error}</div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setShowImportAlert(false);
                  setImportErrors([]);
                }}
              >
                Cerrar
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
