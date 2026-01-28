"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Edit2, Trash2, Clock, Calendar, Star } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  godMode: boolean;
  isDragging?: boolean;
}

export function TaskCard({ task, onEdit, onDelete, godMode, isDragging = false }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800 border-green-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    high: 'bg-red-100 text-red-800 border-red-300',
  };

  const priorityLabels = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
  };

  const isOverdue = task.fechaLimite && isPast(parseISO(task.fechaLimite));

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow ${
        isDragging ? 'shadow-2xl' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg leading-tight flex-1">
            {task.titulo}
          </h3>
          <div className="flex gap-1 flex-shrink-0">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              aria-label="Editar tarea"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 hover:bg-destructive hover:text-destructive-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              aria-label="Eliminar tarea"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {task.descripcion && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.descripcion}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5">
          <Badge className={priorityColors[task.prioridad]}>
            {priorityLabels[task.prioridad]}
          </Badge>
          {task.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{task.estimacionMin}min</span>
          </div>
          {task.fechaLimite && (
            <div className={`flex items-center gap-1 ${isOverdue ? 'text-destructive font-semibold' : ''}`}>
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {format(parseISO(task.fechaLimite), 'dd MMM', { locale: es })}
              </span>
            </div>
          )}
        </div>

        {godMode && (
          <div className="pt-3 border-t space-y-2">
            {task.rubrica !== undefined && (
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="font-mono text-sm font-semibold">
                  {task.rubrica}/10
                </span>
              </div>
            )}
            {task.observacionesJavi && (
              <p className="text-xs text-muted-foreground italic bg-amber-50 p-2 rounded border border-amber-200">
                &quot;{task.observacionesJavi}&quot;
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
