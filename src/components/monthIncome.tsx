import { MESES } from '@/model/mes.enum';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './animate-ui/components/tooltip';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Props = {
  reloadTrigger?: number;
  onSelectMes?: (mes: number) => void; // 👈 nova prop
};

function MonthIncome({ reloadTrigger, onSelectMes }: Props) {
  const [salariosPorMes, setSalariosPorMes] = useState<Record<number, number>>(
    {}
  );

  const formatToBRL = (valor: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);

  useEffect(() => {
    const carregarDados = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) return;

      const uid = userData.user.id;
      // setUserId(uid);

      const { data: rendimentos, error } = await supabase
        .from('incomes')
        .select('mes, valor')
        .eq('user_id', uid);

      if (error) {
        console.error('Erro ao carregar salários:', error);
        return;
      }

      const agrupadoPorMes = rendimentos.reduce(
        (acc, curr) => {
          const mes = Number(curr.mes);
          const valor = Number(curr.valor ?? 0);
          acc[mes] = (acc[mes] || 0) + valor;
          return acc;
        },
        {} as Record<number, number>
      );

      setSalariosPorMes(agrupadoPorMes);
    };

    carregarDados();
  }, [reloadTrigger]);

  return (
    <div>
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
    </div>
  );
}

export default MonthIncome;
