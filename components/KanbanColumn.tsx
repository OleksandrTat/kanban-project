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

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <span className="text-sm font-mono bg-primary/10 px-3 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>

      <Card
        ref={setNodeRef}
        className={`flex-1 p-4 ${color} transition-all duration-200 ${
          isOver ? 'ring-2 ring-primary shadow-lg scale-[1.02]' : ''
        }`}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 min-h-[200px]">
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
