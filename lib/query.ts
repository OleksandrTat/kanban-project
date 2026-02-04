import { SearchQuery, Priority, Task } from '@/types';
import { isAfter, addWeeks, parseISO } from 'date-fns';

export function parseSearchQuery(query: string): SearchQuery {
  const result: SearchQuery = {};
  const tokens = query.trim().split(/\s+/);
  const textParts: string[] = [];
  
  for (const token of tokens) {
    // tag:value
    if (token.startsWith('tag:')) {
      const tag = token.slice(4);
      if (!result.tags) result.tags = [];
      result.tags.push(tag);
      continue;
    }
    
    // p:priority
    if (token.startsWith('p:')) {
      const priority = token.slice(2) as Priority;
      if (['low', 'medium', 'high'].includes(priority)) {
        result.prioridad = priority;
      }
      continue;
    }
    
    // due:overdue or due:week
    if (token.startsWith('due:')) {
      const dueValue = token.slice(4);
      if (dueValue === 'overdue' || dueValue === 'week') {
        result.dueFilter = dueValue;
      }
      continue;
    }
    
    // est:<60 or est:>=120
    if (token.startsWith('est:')) {
      const estValue = token.slice(4);
      const match = estValue.match(/^([<>]=?)?(\d+)$/);
      if (match) {
        const operator = (match[1] || '=') as '<' | '>' | '<=' | '>=';
        const value = parseInt(match[2], 10);
        
        if (operator === '<' || operator === '<=') {
          result.estimacionMax = value;
          result.estimacionOperator = operator;
        } else if (operator === '>' || operator === '>=') {
          result.estimacionMin = value;
          result.estimacionOperator = operator;
        }
      }
      continue;
    }
    
    // Regular text
    textParts.push(token);
  }
  
  if (textParts.length > 0) {
    result.texto = textParts.join(' ').toLowerCase();
  }
  
  return result;
}

export function filterTasks(tasks: Task[], query: SearchQuery): Task[] {
  return tasks.filter(task => {
    // Text search
    if (query.texto) {
      const searchText = query.texto.toLowerCase();
      const titleMatch = task.titulo.toLowerCase().includes(searchText);
      const descMatch = task.descripcion?.toLowerCase().includes(searchText);
      if (!titleMatch && !descMatch) return false;
    }
    
    // Tags
    if (query.tags && query.tags.length > 0) {
      const hasAllTags = query.tags.every(tag => 
        task.tags.some(t => t.toLowerCase() === tag.toLowerCase())
      );
      if (!hasAllTags) return false;
    }
    
    // Priority
    if (query.prioridad && task.prioridad !== query.prioridad) {
      return false;
    }
    
    // Due date filter
    if (query.dueFilter) {
      if (!task.fechaLimite) return false;
      
      const now = new Date();
      const dueDate = parseISO(task.fechaLimite);
      
      if (query.dueFilter === 'overdue') {
        if (!isAfter(now, dueDate)) return false;
      } else if (query.dueFilter === 'week') {
        const weekFromNow = addWeeks(now, 1);
        if (isAfter(dueDate, weekFromNow) || isAfter(now, dueDate)) {
          return false;
        }
      }
    }
    
    // Estimation filters
    if (query.estimacionMin !== undefined || query.estimacionMax !== undefined) {
      const est = task.estimacionMin;
      
      if (query.estimacionOperator === '<' && query.estimacionMax !== undefined) {
        if (est >= query.estimacionMax) return false;
      }
      if (query.estimacionOperator === '<=' && query.estimacionMax !== undefined) {
        if (est > query.estimacionMax) return false;
      }
      if (query.estimacionOperator === '>' && query.estimacionMin !== undefined) {
        if (est <= query.estimacionMin) return false;
      }
      if (query.estimacionOperator === '>=' && query.estimacionMin !== undefined) {
        if (est < query.estimacionMin) return false;
      }
    }
    
    return true;
  });
}

export function getSearchExamples(): string[] {
  return [
    'tag:frontend - buscar por tag',
    'p:high - prioridad alta',
    'due:overdue - tareas vencidas',
    'due:week - vencen esta semana',
    'est:<60 - menos de 60 minutos',
    'est:>=120 - 120 minutos o más',
    'bug tag:backend - combinado',
  ];
}
