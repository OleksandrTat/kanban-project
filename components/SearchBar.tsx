"use client";

import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { Search, Tag, X } from 'lucide-react';
import { Priority } from '@/types';

interface SearchBarProps {
  textValue: string;
  tagValue: string;
  priority: Priority | 'all';
  due: 'all' | 'overdue' | 'week' | 'none';
  estimation: 'all' | 'lt60' | '60-120' | 'gte120';
  onTextChange: (value: string) => void;
  onTagChange: (value: string) => void;
  onPriorityChange: (value: Priority | 'all') => void;
  onDueChange: (value: 'all' | 'overdue' | 'week' | 'none') => void;
  onEstimationChange: (value: 'all' | 'lt60' | '60-120' | 'gte120') => void;
  onClear: () => void;
  availableTags?: string[];
  resultsCount?: number;
  totalCount?: number;
}

export function SearchBar({
  textValue,
  tagValue,
  priority,
  due,
  estimation,
  onTextChange,
  onTagChange,
  onPriorityChange,
  onDueChange,
  onEstimationChange,
  onClear,
  availableTags = [],
  resultsCount,
  totalCount,
}: SearchBarProps) {
  const hasFilters =
    textValue.trim() !== '' ||
    tagValue.trim() !== '' ||
    priority !== 'all' ||
    due !== 'all' ||
    estimation !== 'all';

  const pillClass = (active: boolean) =>
    cn(
      "h-7 rounded-full px-3 text-xs font-mono transition-colors",
      active
        ? "bg-emerald-600 text-white hover:bg-emerald-600 border-emerald-600"
        : "bg-white/80 border border-stone-200 text-muted-foreground hover:text-foreground"
    );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nombre o descripcion"
            value={textValue}
            onChange={(e) => onTextChange(e.target.value)}
            className="pl-10 pr-9"
            aria-label="Buscar tareas por nombre o descripcion"
          />
          {textValue.trim() !== '' && (
            <button
              type="button"
              onClick={() => onTextChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Limpiar busqueda por nombre"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar en tags (parcial)"
            value={tagValue}
            onChange={(e) => onTagChange(e.target.value)}
            className="pl-10 pr-9"
            aria-label="Buscar tareas por tags"
            list={availableTags.length > 0 ? "tag-suggestions" : undefined}
          />
          {tagValue.trim() !== '' && (
            <button
              type="button"
              onClick={() => onTagChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Limpiar busqueda por tags"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {availableTags.length > 0 && (
            <datalist id="tag-suggestions">
              {availableTags.map(tag => (
                <option key={tag} value={tag} />
              ))}
            </datalist>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono text-muted-foreground">Prioridad</span>
        <Button
          variant="outline"
          size="sm"
          className={pillClass(priority === 'all')}
          onClick={() => onPriorityChange('all')}
        >
          Todas
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={pillClass(priority === 'low')}
          onClick={() => onPriorityChange('low')}
        >
          Baja
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={pillClass(priority === 'medium')}
          onClick={() => onPriorityChange('medium')}
        >
          Media
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={pillClass(priority === 'high')}
          onClick={() => onPriorityChange('high')}
        >
          Alta
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono text-muted-foreground">Vence</span>
        <Button
          variant="outline"
          size="sm"
          className={pillClass(due === 'all')}
          onClick={() => onDueChange('all')}
        >
          Todas
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={pillClass(due === 'overdue')}
          onClick={() => onDueChange('overdue')}
        >
          Vencidas
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={pillClass(due === 'week')}
          onClick={() => onDueChange('week')}
        >
          Semana
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={pillClass(due === 'none')}
          onClick={() => onDueChange('none')}
        >
          Sin fecha
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono text-muted-foreground">Estimacion</span>
        <Button
          variant="outline"
          size="sm"
          className={pillClass(estimation === 'all')}
          onClick={() => onEstimationChange('all')}
        >
          Todas
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={pillClass(estimation === 'lt60')}
          onClick={() => onEstimationChange('lt60')}
        >
          Hasta 60m
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={pillClass(estimation === '60-120')}
          onClick={() => onEstimationChange('60-120')}
        >
          60-120m
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={pillClass(estimation === 'gte120')}
          onClick={() => onEstimationChange('gte120')}
        >
          +120m
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">
          Tip: en tags puedes escribir parte del nombre, ej: &quot;front&quot; encuentra &quot;frontend&quot;.
        </span>
        {(hasFilters || (resultsCount !== undefined && totalCount !== undefined)) && (
          <div className="ml-auto flex items-center gap-2">
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={onClear}
              >
                Limpiar filtros
              </Button>
            )}
            {resultsCount !== undefined && totalCount !== undefined && (
              <span className="text-xs font-mono text-muted-foreground">
                Resultados: {resultsCount} / {totalCount}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
