"use client";

import { useState, useMemo } from 'react';
import { AuditLog, AuditAction } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Copy, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { formatAuditSummary, copyToClipboard } from '@/lib/audit';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from './ui/badge';

interface AuditLogViewerProps {
  logs: AuditLog[];
}

export function AuditLogViewer({ logs }: AuditLogViewerProps) {
  const [filterAction, setFilterAction] = useState<AuditAction | 'ALL'>('ALL');
  const [filterTaskId, setFilterTaskId] = useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (filterAction !== 'ALL' && log.accion !== filterAction) return false;
      if (filterTaskId && !log.taskId.includes(filterTaskId)) return false;
      return true;
    });
  }, [logs, filterAction, filterTaskId]);

  const handleCopyReport = async () => {
    try {
      const summary = formatAuditSummary(filteredLogs);
      await copyToClipboard(summary);
      toast.success('Resumen copiado al portapapeles');
    } catch (error) {
      toast.error('Error al copiar el resumen');
      console.error(error);
    }
  };

  const actionColors: Record<AuditAction, string> = {
    CREATE: 'bg-green-100 text-green-800',
    UPDATE: 'bg-blue-100 text-blue-800',
    DELETE: 'bg-red-100 text-red-800',
    MOVE: 'bg-purple-100 text-purple-800',
  };

  const actionLabels: Record<AuditAction, string> = {
    CREATE: 'Crear',
    UPDATE: 'Actualizar',
    DELETE: 'Eliminar',
    MOVE: 'Mover',
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filterAction} onValueChange={(v) => setFilterAction(v as AuditAction | 'ALL')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filtrar acción" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas</SelectItem>
            <SelectItem value="CREATE">Crear</SelectItem>
            <SelectItem value="UPDATE">Actualizar</SelectItem>
            <SelectItem value="DELETE">Eliminar</SelectItem>
            <SelectItem value="MOVE">Mover</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Filtrar por Task ID..."
          value={filterTaskId}
          onChange={(e) => setFilterTaskId(e.target.value)}
          className="w-64 font-mono text-sm"
        />

        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyReport}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Copiar resumen
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground font-mono">
        Mostrando {filteredLogs.length} de {logs.length} eventos
      </div>

      <div className="border rounded-lg bg-white/70 shadow-sm max-h-[520px] overflow-auto">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <p className="text-muted-foreground">No hay eventos de auditoría que mostrar</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur">
              <TableRow>
                <TableHead className="w-[180px]">Fecha/Hora</TableHead>
                <TableHead className="w-[120px]">Acción</TableHead>
                <TableHead className="w-[200px]">Task ID</TableHead>
                <TableHead>Cambios</TableHead>
                <TableHead className="w-[100px]">Usuario</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">
                    {format(new Date(log.timestamp), "dd MMM yyyy HH:mm:ss", { locale: es })}
                  </TableCell>
                  <TableCell>
                    <Badge className={actionColors[log.accion]}>
                      {actionLabels[log.accion]}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs truncate max-w-[200px]">
                    {log.taskId.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="text-xs">
                    {log.accion === 'CREATE' && log.diff.despues && (
                      <span>Nuevo: {log.diff.despues.titulo}</span>
                    )}
                    {log.accion === 'DELETE' && log.diff.antes && (
                      <span>Eliminado: {log.diff.antes.titulo}</span>
                    )}
                    {log.accion === 'MOVE' && log.diff.antes && log.diff.despues && (
                      <span>
                        {log.diff.antes.estado} → {log.diff.despues.estado}
                      </span>
                    )}
                    {log.accion === 'UPDATE' && (
                      <span className="text-muted-foreground">
                        {Object.keys(log.diff.despues || {}).length} campos modificados
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    {log.userLabel}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
