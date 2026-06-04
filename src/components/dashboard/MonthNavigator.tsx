import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface MonthNavigatorProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

export function MonthNavigator({ month, year, onChange }: MonthNavigatorProps) {
  const { t } = useTranslation('common');
  const prev = () => {
    if (month === 1) onChange(12, year - 1);
    else onChange(month - 1, year);
  };

  const next = () => {
    const now = new Date();
    const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();
    if (isCurrentMonth) return;
    if (month === 12) onChange(1, year + 1);
    else onChange(month + 1, year);
  };

  const now = new Date();
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={prev}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="min-w-36 text-center font-semibold">
        {t(`months.${month}`, { defaultValue: t('months.invalid') })} {year}
      </span>
      <Button variant="outline" size="icon" onClick={next} disabled={isCurrentMonth}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
