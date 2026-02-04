"use client";

import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Task, TaskStatus } from '@/types';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';

interface KanbanBoardProps {
  tasks: Task[];
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  godMode: boolean;
}

export function KanbanBoard({ tasks, onMoveTask, onEditTask, onDeleteTask, godMode }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const todoTasks = tasks.filter(t => t.estado === 'todo');
  const doingTasks = tasks.filter(t => t.estado === 'doing');
  const doneTasks = tasks.filter(t => t.estado === 'done');

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      return;
    }

    const taskId = active.id as string;
    const activeItem = tasks.find(t => t.id === taskId);
    if (!activeItem) {
      setActiveTask(null);
      return;
    }

    let newStatus: TaskStatus | null = null;

    if (over.id === 'todo' || over.id === 'doing' || over.id === 'done') {
      newStatus = over.id as TaskStatus;
    } else {
      const overTask = tasks.find(t => t.id === over.id);
      if (overTask) {
        newStatus = overTask.estado;
      }
    }

    if (newStatus && newStatus !== activeItem.estado) {
      onMoveTask(taskId, newStatus);
    }

    setActiveTask(null);
  }

  function handleDragCancel() {
    setActiveTask(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid gap-6 h-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <KanbanColumn
          id="todo"
          title="Por Hacer"
          tasks={todoTasks}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          godMode={godMode}
          color="bg-stone-50 border-stone-200"
        />
        <KanbanColumn
          id="doing"
          title="En Progreso"
          tasks={doingTasks}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          godMode={godMode}
          color="bg-sky-50 border-sky-200"
        />
        <KanbanColumn
          id="done"
          title="Completado"
          tasks={doneTasks}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          godMode={godMode}
          color="bg-emerald-50 border-emerald-200"
        />
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-90">
            <TaskCard
              task={activeTask}
              onEdit={() => {}}
              onDelete={() => {}}
              godMode={godMode}
              isDragging
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
