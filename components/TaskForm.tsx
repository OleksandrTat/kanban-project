"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Task, Priority } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useState } from 'react';
import { X } from 'lucide-react';
import { Badge } from './ui/badge';

const taskSchema = z.object({
  titulo: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  descripcion: z.string().optional(),
  prioridad: z.enum(['low', 'medium', 'high']),
  tags: z.array(z.string()),
  estimacionMin: z.number().min(1, 'La estimación debe ser mayor a 0'),
  fechaLimite: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TaskFormData) => void;
  initialData?: Task;
  title: string;
}

export function TaskForm({ open, onOpenChange, onSubmit, initialData, title }: TaskFormProps) {
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      titulo: initialData?.titulo || '',
      descripcion: initialData?.descripcion || '',
      prioridad: initialData?.prioridad || 'medium',
      tags: initialData?.tags || [],
      estimacionMin: initialData?.estimacionMin || 30,
      fechaLimite: initialData?.fechaLimite || '',
    },
  });

  const prioridad = watch('prioridad');

  const handleFormSubmit = (data: TaskFormData) => {
    onSubmit({ ...data, tags });
    reset();
    setTags([]);
    setTagInput('');
    onOpenChange(false);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setValue('tags', newTags);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setValue('tags', newTags);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="task-form-description">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p id="task-form-description" className="sr-only">
          Formulario para {initialData ? 'editar' : 'crear'} una tarea con título, descripción, prioridad y etiquetas
        </p>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="titulo">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="titulo"
              {...register('titulo')}
              placeholder="Ej: Implementar autenticación OAuth"
              aria-required="true"
              aria-invalid={!!errors.titulo}
              aria-describedby={errors.titulo ? 'titulo-error' : undefined}
            />
            {errors.titulo && (
              <p id="titulo-error" className="text-sm text-destructive" role="alert">
                {errors.titulo.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              {...register('descripcion')}
              placeholder="Detalles adicionales sobre la tarea..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prioridad">
                Prioridad <span className="text-destructive">*</span>
              </Label>
              <Select
                value={prioridad}
                onValueChange={(value) => setValue('prioridad', value as Priority)}
              >
                <SelectTrigger id="prioridad" aria-required="true">
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimacionMin">
                Estimación (minutos) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="estimacionMin"
                type="number"
                {...register('estimacionMin', { valueAsNumber: true })}
                placeholder="30"
                aria-required="true"
                aria-invalid={!!errors.estimacionMin}
                aria-describedby={errors.estimacionMin ? 'estimacion-error' : undefined}
              />
              {errors.estimacionMin && (
                <p id="estimacion-error" className="text-sm text-destructive" role="alert">
                  {errors.estimacionMin.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaLimite">Fecha límite</Label>
            <Input
              id="fechaLimite"
              type="date"
              {...register('fechaLimite')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagInput">Etiquetas</Label>
            <div className="flex gap-2">
              <Input
                id="tagInput"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Agregar etiqueta..."
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Agregar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                    aria-label={`Eliminar etiqueta ${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setTags([]);
                setTagInput('');
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {initialData ? 'Guardar cambios' : 'Crear tarea'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
