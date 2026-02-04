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
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { loadBoardData, saveBoardData, downloadJSON, validateBoardData } from '@/lib/storage';
import { createAuditLog } from '@/lib/audit';
import { parseSearchQuery, filterTasks } from '@/lib/query';
import { Plus, Download, Upload, Crown, AlertCircle, ListChecks, Flame, Clock, CheckCircle2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { addDays, isAfter, isBefore, isPast, parseISO } from 'date-fns';

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

  const now = new Date();
  const totalTasks = boardData.tasks.length;
  const doneTasks = boardData.tasks.filter(task => task.estado === 'done').length;
  const overdueTasks = boardData.tasks.filter(task => task.fechaLimite && isPast(parseISO(task.fechaLimite))).length;
  const dueSoonTasks = boardData.tasks.filter(task => {
    if (!task.fechaLimite) return false;
    const dueDate = parseISO(task.fechaLimite);
    return isAfter(dueDate, now) && isBefore(dueDate, addDays(now, 7));
  }).length;

  const quickFilters = [
    { label: 'Urgentes', query: 'p:high' },
    { label: 'Vencidas', query: 'due:overdue' },
    { label: 'Semana', query: 'due:week' },
    { label: 'Frontend', query: 'tag:frontend' },
    { label: 'Backend', query: 'tag:backend' },
  ];

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
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-emerald-50 to-slate-50 p-6 lg:p-8 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-20 h-96 w-96 rounded-full bg-slate-300/20 blur-3xl" />
      <Toaster position="top-right" />
      
      <div className="max-w-[1800px] mx-auto space-y-6 relative">
        {/* Header */}
        <header className="space-y-6 rounded-3xl border bg-white/80 backdrop-blur p-6 shadow-sm">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-mono text-emerald-800">
                Auditoria activa
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mt-3 bg-gradient-to-r from-emerald-700 to-slate-700 bg-clip-text text-transparent">
                Kanban Auditor
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg mt-2">
                Sistema de gestion de tareas con auditoria completa
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
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

              <div className="flex items-center gap-2 bg-emerald-100 px-4 py-2 rounded-lg border border-emerald-200">
                <Crown className="h-4 w-4 text-emerald-700" />
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

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="bg-gradient-to-br from-stone-50 to-slate-50 border-stone-200">
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{totalTasks}</p>
                  </div>
                  <ListChecks className="h-6 w-6 text-slate-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-sky-50 to-cyan-50 border-sky-200">
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground">Vence pronto</p>
                    <p className="text-2xl font-bold">{dueSoonTasks}</p>
                  </div>
                  <Clock className="h-6 w-6 text-sky-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-rose-50 to-amber-50 border-rose-200">
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground">Vencidas</p>
                    <p className="text-2xl font-bold">{overdueTasks}</p>
                  </div>
                  <Flame className="h-6 w-6 text-rose-600" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground">Completadas</p>
                    <p className="text-2xl font-bold">{doneTasks}</p>
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-emerald-700" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col xl:flex-row xl:items-center gap-3">
            <div className="flex-1">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => {
                setEditingTask(null);
                setIsFormOpen(true);
              }} className="gap-2 flex-shrink-0">
                <Plus className="h-4 w-4" />
                Nueva Tarea
              </Button>
              {searchQuery.trim() !== '' && (
                <Button
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">
              Filtros rapidos:
            </span>
            {quickFilters.map(filter => (
              <Button
                key={filter.label}
                variant="secondary"
                size="sm"
                className="font-mono text-xs"
                onClick={() => setSearchQuery(filter.query)}
              >
                {filter.label}
              </Button>
            ))}
            {searchQuery.trim() !== '' && (
              <span className="ml-auto text-xs font-mono text-muted-foreground">
                Resultados: {filteredTasks.length}
              </span>
            )}
          </div>
        </header>

        {/* Main Content */}
        <Tabs defaultValue="board" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-white/80 border border-stone-200 shadow-sm">
            <TabsTrigger value="board">Tablero</TabsTrigger>
            <TabsTrigger value="audit">Auditoría</TabsTrigger>
            {godMode && <TabsTrigger value="god">Evaluación</TabsTrigger>}
          </TabsList>

          <TabsContent value="board" className="space-y-4">
            <div className="min-h-[560px] lg:h-[calc(100vh-360px)]">
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

