import { Task, AuditLog, AuditAction } from '@/types';

export function createAuditLog(
  accion: AuditAction,
  taskId: string,
  antes?: Partial<Task>,
  despues?: Partial<Task>
): AuditLog {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    accion,
    taskId,
    diff: {
      antes,
      despues,
    },
    userLabel: 'Alumno/a',
  };
}

export function formatAuditSummary(logs: AuditLog[]): string {
  let summary = '=== RESUMEN DE AUDITORÍA ===\n\n';
  summary += `Total de eventos: ${logs.length}\n`;
  summary += `Fecha de generación: ${new Date().toLocaleString('es-ES')}\n\n`;
  
  // Count by action
  const actionCounts: Record<AuditAction, number> = {
    CREATE: 0,
    UPDATE: 0,
    DELETE: 0,
    MOVE: 0,
  };
  
  logs.forEach(log => {
    actionCounts[log.accion]++;
  });
  
  summary += '--- Resumen por acción ---\n';
  Object.entries(actionCounts).forEach(([action, count]) => {
    summary += `${action}: ${count}\n`;
  });
  
  summary += '\n--- Detalle de eventos ---\n\n';
  
  logs.forEach((log, index) => {
    summary += `[${index + 1}] ${log.accion} - ${new Date(log.timestamp).toLocaleString('es-ES')}\n`;
    summary += `   Task ID: ${log.taskId}\n`;
    summary += `   Usuario: ${log.userLabel}\n`;
    
    if (log.diff.antes || log.diff.despues) {
      summary += '   Cambios:\n';
      
      if (log.accion === 'CREATE' && log.diff.despues) {
        summary += `   → Nuevo: ${log.diff.despues.titulo || 'Sin título'}\n`;
        summary += `   → Prioridad: ${log.diff.despues.prioridad || 'N/A'}\n`;
        summary += `   → Estado: ${log.diff.despues.estado || 'N/A'}\n`;
      } else if (log.accion === 'DELETE' && log.diff.antes) {
        summary += `   → Eliminado: ${log.diff.antes.titulo || 'Sin título'}\n`;
      } else if (log.accion === 'MOVE' && log.diff.antes && log.diff.despues) {
        summary += `   → De: ${log.diff.antes.estado} → A: ${log.diff.despues.estado}\n`;
      } else if (log.accion === 'UPDATE') {
        const changes: string[] = [];
        if (log.diff.antes && log.diff.despues) {
          Object.keys(log.diff.despues).forEach(key => {
            const k = key as keyof Task;
            const before = log.diff.antes?.[k];
            const after = log.diff.despues?.[k];
            if (JSON.stringify(before) !== JSON.stringify(after)) {
              changes.push(`${k}: ${JSON.stringify(before)} → ${JSON.stringify(after)}`);
            }
          });
        }
        changes.forEach(change => {
          summary += `   → ${change}\n`;
        });
      }
    }
    
    summary += '\n';
  });
  
  return summary;
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((resolve, reject) => {
      document.execCommand('copy') ? resolve() : reject();
      textArea.remove();
    });
  }
}
