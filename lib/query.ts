import { SearchQuery, Task } from '@/types';
import { addWeeks, isAfter, isBefore, parseISO } from 'date-fns';

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function splitTokens(value: string): string[] {
  return normalizeText(value)
    .split(/[\s,]+/)
    .map(token => token.replace(/^#/, ''))
    .filter(Boolean);
}

export function filterTasks(tasks: Task[], query: SearchQuery): Task[] {
  return tasks.filter(task => {
    const normalizedTitle = normalizeText(task.titulo);
    const normalizedDesc = normalizeText(task.descripcion ?? '');
    const combinedText = `${normalizedTitle} ${normalizedDesc}`;

    if (query.texto) {
      const tokens = splitTokens(query.texto);
      if (tokens.length > 0) {
        const matchesAll = tokens.every(token => combinedText.includes(token));
        if (!matchesAll) return false;
      }
    }

    if (query.tagTexto) {
      const tokens = splitTokens(query.tagTexto);
      if (tokens.length > 0) {
        const normalizedTags = task.tags.map(tag => normalizeText(tag));
        const matchesAllTokens = tokens.every(token =>
          normalizedTags.some(tag => tag.includes(token))
        );
        if (!matchesAllTokens) return false;
      }
    }

    if (query.prioridad && task.prioridad !== query.prioridad) {
      return false;
    }

    if (query.dueFilter) {
      if (query.dueFilter === 'none') {
        if (task.fechaLimite) return false;
      } else {
        if (!task.fechaLimite) return false;

        const now = new Date();
        const dueDate = parseISO(task.fechaLimite);

        if (query.dueFilter === 'overdue') {
          if (!isAfter(now, dueDate)) return false;
        } else if (query.dueFilter === 'week') {
          const weekFromNow = addWeeks(now, 1);
          if (isAfter(dueDate, weekFromNow) || isBefore(dueDate, now)) {
            return false;
          }
        }
      }
    }

    if (query.estimacionMin !== undefined) {
      if (task.estimacionMin < query.estimacionMin) return false;
    }
    if (query.estimacionMax !== undefined) {
      if (task.estimacionMin > query.estimacionMax) return false;
    }

    return true;
  });
}
