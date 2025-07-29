import { MESES } from '@/model/mes.enum';
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
  const { data: salariosPorMes = {}, error } = useIncomesByMonth(reloadTrigger);

  const formatToBRL = (valor: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);

  if (error) {
    console.error('Erro ao carregar salários por mês:', error);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row gap-3">
        <TooltipProvider>
          <div className="flex flex-wrap gap-2">
            {Object.entries(MESES).map(([id, nome]) => {
              const mesNumero = parseInt(id);
              const salarioMes = salariosPorMes[mesNumero];

              return (
                <Tooltip key={id}>
                  <TooltipTrigger>
                    <div
                      className={`cursor-pointer rounded-full border px-3 py-1 text-[.75rem] uppercase ${
                        salarioMes
                          ? 'bg-primary border-primary'
                          : 'hover:bg-primary border-zinc-400 text-zinc-400 duration-200 hover:text-white'
                      }`}
                    >
                      <span onClick={() => onSelectMes?.(mesNumero)}>
                        {nome}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {salarioMes
                      ? `Salário: ${formatToBRL(salarioMes)}`
                      : 'Sem salário'}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </div>
      Total Anual {formatToBRL(total)}
    </div>
  );
}
