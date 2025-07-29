import TituloPage from '@/components/TituloPage';
import DashboardCard from '@/components/dashboard-card';
import { IARecommendations } from '@/components/IARecommendations';
import { useIA } from '@/hooks/use-ia';
import { useIncomesByMonth } from '@/hooks/use-incomes-by-month';
import { useTasks } from '@/hooks/use-tasks';
import { formatToBRL } from '@/utils/format';
import { getNomeMes } from '@/model/mes.enum';
import { DollarSign } from 'lucide-react';

const Dashboard = () => {
  // Hook para buscar dados da IA (inclui cotação do dólar)
  const { data: iaData, isLoading: isLoadingIA } = useIA();

  // Hook para buscar rendimentos por mês
  const { data: salariosPorMes = {} } = useIncomesByMonth();

  // Hook para buscar tarefas do mês atual
  const mesAtual = new Date().getMonth() + 1; // getMonth() retorna 0-11
  const anoAtual = new Date().getFullYear();
  const {
    data: tasksCurrentMonth = [],
    isLoading: isLoadingTasks,
    error: tasksError,
  } = useTasks(mesAtual, anoAtual);

  // Calcula o total do mês atual
  const totalMesAtual = salariosPorMes[mesAtual] || 0;

  // Calcula o total pago das tarefas do mês atual
  const totalPaidTasks = tasksCurrentMonth
    .filter((task) => task.done === 'Pago')
    .reduce((sum, task) => sum + (task.price || 0), 0);

  // Calcula o total de tarefas que ainda precisam ser pagas
  const totalPendingTasks = tasksCurrentMonth
    .filter((task) => task.done !== 'Pago' && task.price)
    .reduce((sum, task) => sum + (task.price || 0), 0);

  // Calcula o total geral de tarefas do mês atual
  const totalTasksCurrentMonth = tasksCurrentMonth.reduce(
    (sum, task) => sum + (task.price || 0),
    0
  );

  // Obter cotação do dólar da IA
  const dollarRate = iaData?.data?.cotacaoDolar?.valor;

  return (
    <div className="space-y-6">
      <TituloPage titulo="Home" />
      <div className="flex flex-row gap-2">
        <div className="bg-muted flex w-full items-center justify-between rounded-md p-2 px-4">
          <span className="text-lg font-semibold">
            Rendimentos do mês {getNomeMes(mesAtual)}{' '}
            {formatToBRL(totalMesAtual)}
          </span>

          <div className="flex items-center gap-2">
            {isLoadingIA && (
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
                Atualizando...
              </div>
            )}
            {dollarRate && typeof dollarRate === 'number' && (
              <span className="text-muted-foreground flex flex-row items-center gap-1 text-sm">
                <DollarSign className="h-4 w-4" />
                <b>R$ {dollarRate.toFixed(2)}</b>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Totais do mês atual */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {/* Total de Tarefas Pagas do Mês */}
        <DashboardCard
          title="Tarefas pagas do mês"
          value={totalPaidTasks}
          isLoading={isLoadingTasks}
          error={tasksError?.message || null}
          color="green"
          formatValue={formatToBRL}
        />

        {/* Total Ainda serem Pagos */}
        <DashboardCard
          title="Total ainda a serem pagos"
          value={totalPendingTasks}
          isLoading={isLoadingTasks}
          error={tasksError?.message || null}
          color="orange"
          formatValue={formatToBRL}
        />

        {/* Total Geral de Tarefas do Mês */}
        <DashboardCard
          title="Total de tarefas do mês"
          value={totalTasksCurrentMonth}
          isLoading={isLoadingTasks}
          error={tasksError?.message || null}
          color="purple"
          formatValue={formatToBRL}
        />
      </div>

      {/* Análise da IA */}
      <IARecommendations />
    </div>
  );
};

export default Dashboard;
