import { BoardData, Task, AuditLog } from '@/types';

const STORAGE_KEY = 'kanban-board-data';
const STORAGE_VERSION = '1.0.0';

export const defaultBoardData: BoardData = {
  tasks: [],
  auditLogs: [],
  version: STORAGE_VERSION,
};

export function loadBoardData(): BoardData {
  if (typeof window === 'undefined') return defaultBoardData;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultBoardData;
    
    const data = JSON.parse(stored) as BoardData;
    
    // Validation
    if (!data.tasks || !Array.isArray(data.tasks)) {
      throw new Error('Invalid tasks data');
    }
    if (!data.auditLogs || !Array.isArray(data.auditLogs)) {
      throw new Error('Invalid audit logs data');
    }
    
    return data;
  } catch (error) {
    console.error('Error loading board data:', error);
    return defaultBoardData;
  }
}

export function saveBoardData(data: BoardData): void {
  if (typeof window === 'undefined') return;
  
  try {
    const dataWithVersion = {
      ...data,
      version: STORAGE_VERSION,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithVersion));
  } catch (error) {
    console.error('Error saving board data:', error);
  }
}

export function exportBoardData(data: BoardData): string {
  return JSON.stringify(data, null, 2);
}

export function downloadJSON(data: BoardData, filename: string = 'kanban-export.json'): void {
  const json = exportBoardData(data);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

interface ValidationError {
  field: string;
  message: string;
}

export function validateBoardData(data: unknown): { valid: boolean; errors: ValidationError[]; data?: BoardData } {
  const errors: ValidationError[] = [];
  
  if (!data || typeof data !== 'object') {
    errors.push({ field: 'root', message: 'Invalid JSON structure' });
    return { valid: false, errors };
  }
  
  const parsedData = data as Record<string, unknown>;
  
  // Validate tasks
  if (!parsedData.tasks || !Array.isArray(parsedData.tasks)) {
    errors.push({ field: 'tasks', message: 'Tasks must be an array' });
  } else {
    parsedData.tasks.forEach((task, index) => {
      if (!task.id || typeof task.id !== 'string') {
        errors.push({ field: `tasks[${index}].id`, message: 'Task ID is required and must be a string' });
      }
      if (!task.titulo || typeof task.titulo !== 'string' || task.titulo.length < 3) {
        errors.push({ field: `tasks[${index}].titulo`, message: 'Title must be at least 3 characters' });
      }
      if (!task.prioridad || !['low', 'medium', 'high'].includes(task.prioridad)) {
        errors.push({ field: `tasks[${index}].prioridad`, message: 'Priority must be low, medium, or high' });
      }
      if (!task.tags || !Array.isArray(task.tags)) {
        errors.push({ field: `tasks[${index}].tags`, message: 'Tags must be an array' });
      }
      if (typeof task.estimacionMin !== 'number') {
        errors.push({ field: `tasks[${index}].estimacionMin`, message: 'Estimation must be a number' });
      }
      if (!task.fechaCreacion || typeof task.fechaCreacion !== 'string') {
        errors.push({ field: `tasks[${index}].fechaCreacion`, message: 'Creation date is required' });
      }
      if (!task.estado || !['todo', 'doing', 'done'].includes(task.estado)) {
        errors.push({ field: `tasks[${index}].estado`, message: 'Status must be todo, doing, or done' });
      }
    });
  }
  
  // Validate audit logs
  if (!parsedData.auditLogs || !Array.isArray(parsedData.auditLogs)) {
    errors.push({ field: 'auditLogs', message: 'Audit logs must be an array' });
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  // Check for duplicate IDs and resolve
  const tasks = parsedData.tasks as Task[];
  const taskIds = new Set<string>();
  const resolvedTasks: Task[] = [];
  let hadDuplicates = false;
  
  tasks.forEach(task => {
    if (taskIds.has(task.id)) {
      hadDuplicates = true;
      const newId = crypto.randomUUID();
      resolvedTasks.push({ ...task, id: newId });
    } else {
      taskIds.add(task.id);
      resolvedTasks.push(task);
    }
  });
  
  const boardData: BoardData = {
    tasks: resolvedTasks,
    auditLogs: (parsedData.auditLogs as AuditLog[]) || [],
    version: STORAGE_VERSION,
  };
  
  return {
    valid: true,
    errors: hadDuplicates ? [{ field: 'tasks', message: 'Duplicate IDs were found and regenerated' }] : [],
    data: boardData,
  };
}
