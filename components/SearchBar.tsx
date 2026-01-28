"use client";

import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { HelpCircle, Search } from 'lucide-react';
import { getSearchExamples } from '@/lib/query';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const examples = getSearchExamples();

  return (
    <div className="relative flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar tareas... (Ej: tag:backend p:high)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 font-mono"
          aria-label="Buscar tareas con filtros avanzados"
        />
      </div>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label="Mostrar ayuda de búsqueda"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold mb-2">Operadores de búsqueda</h4>
              <div className="space-y-1 text-sm">
                {examples.map((example, idx) => (
                  <div
                    key={idx}
                    className="font-mono text-xs bg-muted p-2 rounded cursor-pointer hover:bg-accent"
                    onClick={() => {
                      onChange(example.split(' - ')[0]);
                      setIsOpen(false);
                    }}
                  >
                    {example}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-xs text-muted-foreground pt-2 border-t">
              Puedes combinar múltiples operadores.
              <br />
              Ej: <span className="font-mono">bug tag:backend p:high</span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
