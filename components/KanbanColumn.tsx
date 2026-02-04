"use client";

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/types';
import { TaskCard } from './TaskCard';
import { Card } from './ui/card';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  godMode: boolean;
  color: string;
}

export function KanbanColumn({ id, title, tasks, onEditTask, onDeleteTask, godMode, color }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const taskIds = tasks.map(t => t.id);
  const accent = id === 'todo' ? 'bg-slate-400' : id === 'doing' ? 'bg-sky-400' : 'bg-emerald-400';
  const accentSoft = id === 'todo' ? 'bg-slate-300/40' : id === 'doing' ? 'bg-sky-300/40' : 'bg-emerald-300/40';

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`h-2.5 w-2.5 rounded-full ${accent}`} />
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        </div>
        <span className="text-sm font-mono bg-white/70 border border-border px-3 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>

      <Card
        ref={setNodeRef}
        className={`relative flex-1 p-4 flex flex-col ${color} transition-all duration-200 ${
          isOver ? 'ring-2 ring-primary shadow-lg scale-[1.02]' : ''
        }`}
      >
        <div className={`pointer-events-none absolute left-4 right-4 top-3 h-1 rounded-full ${accentSoft}`} />
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 min-h-[200px] flex-1 overflow-y-auto pr-1 pt-4">
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="text-6xl mb-4 opacity-20">📋</div>
                <p className="text-muted-foreground font-mono text-sm">
                  {id === 'todo' && 'Sin tareas pendientes'}
                  {id === 'doing' && 'Nada en progreso'}
                  {id === 'done' && 'Sin tareas completadas'}
                </p>
              </div>
            ) : (
              tasks.map((task, index) => (
                <div
                  key={task.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TaskCard
                    task={task}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    godMode={godMode}
                  />
                </div>
              ))
            )}
          </div>
        </SortableContext>
      </Card>
    </div>
  );
}
