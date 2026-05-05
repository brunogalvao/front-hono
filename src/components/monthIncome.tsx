import { getMesesLista } from '@/model/mes.enum';
import { formatToBRL } from '@/utils/format';
import { useTranslation } from 'react-i18next';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './animate-ui/components/tooltip';
import { useIncomesByMonth } from '@/hooks/use-incomes-by-month';

type MonthIncomeProps = {
  reloadTrigger?: number;
  onSelectMes?: (mes: number) => void;
  total: number;
};

export default function MonthIncome({
  reloadTrigger,
  onSelectMes,
  total,
}: MonthIncomeProps) {
  const { t } = useTranslation('income');
  const { data: salariosPorMes = {}, error } = useIncomesByMonth(reloadTrigger);
  const mesesLista = getMesesLista();

  if (error) {
    console.error('Erro ao carregar salários por mês:', error);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row gap-3">
        <TooltipProvider>
          <div className="flex flex-wrap gap-2">
            {mesesLista.map(({ value, label }) => {
              const mesNumero = parseInt(value);
              const salarioMes = salariosPorMes[mesNumero];

              return (
                <Tooltip key={value}>
                  <TooltipTrigger>
                    <div
                      className={`cursor-pointer rounded-full border px-3 py-1 text-[.75rem] uppercase ${
                        salarioMes
                          ? 'bg-primary border-primary'
                          : 'hover:bg-primary border-zinc-400 text-zinc-400 duration-200 hover:text-white'
                      }`}
                    >
                      <span onClick={() => onSelectMes?.(mesNumero)}>
                        {label}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {salarioMes
                      ? `${t('amount')}: ${formatToBRL(salarioMes)}`
                      : t('noIncome')}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </div>
      {t('annualTotal')} {formatToBRL(total)}
    </div>
  );
}
