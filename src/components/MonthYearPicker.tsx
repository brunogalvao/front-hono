import { useState } from 'react';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { MESES, getNomeMes } from '@/model/mes.enum';

interface MonthYearPickerProps {
  mes: number;
  ano: number;
  onChange: (mes: number, ano: number) => void;
}

export function MonthYearPicker({ mes, ano, onChange }: MonthYearPickerProps) {
  const [yearView, setYearView] = useState(ano);
  const [open, setOpen] = useState(false);

  const handleSelect = (selectedMes: number) => {
    onChange(selectedMes, yearView);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2">
          <CalendarIcon className="size-4" />
          {getNomeMes(mes)} {ano}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-3">
        {/* Navegação de ano */}
        <div className="mb-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setYearView((y) => y - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="font-semibold">{yearView}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setYearView((y) => y + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {/* Grid de meses */}
        <div className="grid grid-cols-3 gap-1">
          {Object.entries(MESES).map(([value, label]) => {
            const mesNum = Number(value);
            const isSelected = mesNum === mes && yearView === ano;
            return (
              <Button
                key={value}
                variant={isSelected ? 'default' : 'ghost'}
                size="sm"
                className="text-xs"
                onClick={() => handleSelect(mesNum)}
              >
                {label.slice(0, 3)}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
