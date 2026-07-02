import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '@/lib/utils';

interface MonthYearPickerProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
type MonthNum = typeof MONTHS[number];

export function MonthYearPicker({ month, year, onChange }: MonthYearPickerProps) {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(year);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const isFuture = (m: number, y: number) =>
    y > currentYear || (y === currentYear && m > currentMonth);

  const handleSelect = (m: number) => {
    if (isFuture(m, pickerYear)) return;
    onChange(m, pickerYear);
    setOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (next) setPickerYear(year);
    setOpen(next);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2 font-semibold min-w-44 justify-between">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span>{t(`months.${month as MonthNum}`)} {year}</span>
          <span />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        {/* Year navigation */}
        <div className="mb-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setPickerYear((y) => y - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold">{pickerYear}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={pickerYear >= currentYear}
            onClick={() => setPickerYear((y) => y + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-3 gap-1">
          {MONTHS.map((m) => {
            const isSelected = m === month && pickerYear === year;
            const disabled = isFuture(m, pickerYear);
            return (
              <button
                key={m}
                type="button"
                disabled={disabled}
                onClick={() => handleSelect(m)}
                className={cn(
                  'rounded-md px-2 py-1.5 text-sm transition-colors',
                  isSelected
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'hover:bg-muted',
                  disabled && 'cursor-not-allowed opacity-30',
                )}
              >
                {t(`months.${m as MonthNum}`).slice(0, 3)}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
