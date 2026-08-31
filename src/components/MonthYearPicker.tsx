import { useState } from 'react';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { getMesesLista, getNomeMes } from '@/model/mes.enum';
import { useTranslation } from 'react-i18next';

interface MonthYearPickerProps {
  mes: number;
  ano: number;
  onChange: (mes: number, ano: number) => void;
  ariaLabel?: string;
}

export function MonthYearPicker({
  mes,
  ano,
  onChange,
  ariaLabel,
}: MonthYearPickerProps) {
  const { t } = useTranslation('common');
  const [yearView, setYearView] = useState(ano);
  const [open, setOpen] = useState(false);

  const handleSelect = (selectedMes: number) => {
    onChange(selectedMes, yearView);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-label={ariaLabel}
          className="min-h-11 w-full justify-start gap-2 sm:min-h-9"
        >
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
            aria-label={t('previousYear')}
            onClick={() => setYearView((y) => y - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="font-semibold">{yearView}</span>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('nextYear')}
            onClick={() => setYearView((y) => y + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {/* Grid de meses */}
        <div className="grid grid-cols-3 gap-1">
          {getMesesLista().map(({ value, label }) => {
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
