"use client";

import { Task } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useState } from 'react';
import { Star, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';

interface GodModePanelProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
}

export function GodModePanel({ tasks, onUpdateTask }: GodModePanelProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [rubrica, setRubrica] = useState<number>(5);
  const [observaciones, setObservaciones] = useState('');

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setRubrica(task.rubrica || 5);
    setObservaciones(task.observacionesJavi || '');
  };

  const handleSave = () => {
    if (editingTask) {
      onUpdateTask({
        ...editingTask,
        rubrica,
        observacionesJavi: observaciones,
      });
      setEditingTask(null);
    }
  };

  // Cálculo de estadísticas
  const tasksWithRubrica = tasks.filter(t => t.rubrica !== undefined);
  const averageRubrica = tasksWithRubrica.length > 0
    ? tasksWithRubrica.reduce((sum, t) => sum + (t.rubrica || 0), 0) / tasksWithRubrica.length
    : 0;
  const tasksWithoutRubrica = tasks.filter(t => t.rubrica === undefined).length;
  const totalTasks = tasks.length;

  return (
    <>
      <div className="space-y-4">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-600 fill-amber-600" />
              Panel de Evaluación
            </CardTitle>
            <CardDescription>
              Vista del docente para calificar y observar tareas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Media</p>
                      <p className="text-3xl font-bold">{averageRubrica.toFixed(1)}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Evaluadas</p>
                      <p className="text-3xl font-bold">{tasksWithRubrica.length}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Sin evaluar</p>
                      <p className="text-3xl font-bold">{tasksWithoutRubrica}</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Tareas disponibles</h3>
              <div className="grid gap-2 max-h-[400px] overflow-y-auto">
                {tasks.map(task => (
                  <Card
                    key={task.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleOpenEdit(task)}
                  >
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{task.titulo}</p>
                          <p className="text-xs text-muted-foreground">
                            Estado: {task.estado}
                          </p>
                        </div>
                        {task.rubrica !== undefined ? (
                          <div className="flex items-center gap-1 text-amber-600">
                            <Star className="h-4 w-4 fill-amber-600" />
                            <span className="font-mono font-semibold">{task.rubrica}/10</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Sin evaluar</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Evaluar: {editingTask?.titulo}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rubrica">
                Rúbrica (0-10)
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="rubrica"
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={rubrica}
                  onChange={(e) => setRubrica(parseFloat(e.target.value))}
                  className="flex-1"
                />
                <span className="text-2xl font-bold font-mono w-12 text-center">
                  {rubrica}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">
                Observaciones de Javi
              </Label>
              <Textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Comentarios sobre la tarea..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setEditingTask(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                Guardar evaluación
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
