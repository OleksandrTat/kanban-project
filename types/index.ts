export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'doing' | 'done';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'MOVE';

export interface Task {
  id: string;
  titulo: string;
  descripcion?: string;
  prioridad: Priority;
  tags: string[];
  estimacionMin: number;
  fechaCreacion: string;
  fechaLimite?: string;
  estado: TaskStatus;
  // Modo Dios fields
  observacionesJavi?: string;
  rubrica?: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  accion: AuditAction;
  taskId: string;
  diff: {
    antes?: Partial<Task>;
    despues?: Partial<Task>;
  };
  userLabel: string;
}

export interface BoardData {
  tasks: Task[];
  auditLogs: AuditLog[];
  version: string;
}

export interface SearchQuery {
  texto?: string;
  tags?: string[];
  prioridad?: Priority;
  dueFilter?: 'overdue' | 'week' | 'none';
  estimacionMin?: number;
  estimacionMax?: number;
  estimacionOperator?: '<' | '>' | '<=' | '>=';
}
