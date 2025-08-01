import TituloPage from '@/components/TituloPage';
// import DashboardCard from '@/components/dashboard-card';
import { useIA } from '@/hooks/use-ia';
// import { useIncomesByMonth } from '@/hooks/use-incomes-by-month';

// import { formatToBRL } from '@/utils/format';
// import { getNomeMes } from '@/model/mes.enum';
// import { DollarSign } from 'lucide-react';
import IARecommendations from '@/components/IARecommendations';
import { GoDotFill } from 'react-icons/go';
import { MdTipsAndUpdates } from 'react-icons/md';

const Dashboard = () => {
  // Hook para buscar dados da IA simplificados
  const { data: iaData } = useIA();

  // Hook para buscar rendimentos por mês (ainda usado para exibição no header)
  // const { data: salariosPorMes = {} } = useIncomesByMonth();

  // const mesAtual = new Date().getMonth() + 1;

  // Usar dados da IA ou fallback para valores locais
  // const totalMesAtual =
  //   iaData?.data?.rendimentoMes || salariosPorMes[mesAtual] || 0;
  // const totalPaidTasks = iaData?.data?.tarefasPagas || 0;
  // const totalPendingTasks = iaData?.data?.tarefasPendentes || 0;
  // const totalTasksCurrentMonth = iaData?.data?.totalTarefas || 0;
  // const dollarRate = iaData?.data?.cotacaoDolar;

  return (
    <div className="space-y-6">
      <TituloPage titulo="Home" />

      {/* Dicas de Economia */}
      {iaData?.data?.dicasEconomia && iaData.data.dicasEconomia.length > 0 && (
        <div className="bg-muted rounded-lg p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-amber-500">
            <MdTipsAndUpdates />
            Dicas de Economia
          </h3>
          <ul className="grid grid-cols-2 gap-3">
            {iaData.data.dicasEconomia.map((dica, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="text-green-600">
                  <GoDotFill />
                </span>
                <span className="text-sm">{dica}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Análise da IA */}
      <IARecommendations />
    </div>
  );
};

export default Dashboard;
