import TituloPage from '@/components/TituloPage';
import { useIA } from '@/hooks/use-ia';
import IARecommendations from '@/components/IARecommendations';
import FinancialChart from '@/components/FinancialChart';
import { CheckCircle2 } from 'lucide-react';
import { MdTipsAndUpdates } from 'react-icons/md';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarConversionSkeleton,
  StatusSkeleton,
  SummarySkeleton,
  TipsSkeleton,
} from '@/components/SkeletonDashboard';
import { getNomeMes } from '@/model/mes.enum';
import { getCurrentMonth, getCurrentYear } from '@/utils/date';

const Dashboard = () => {
  const { data: iaData, isLoading } = useIA();
  const shouldShowSkeleton = isLoading;

  const subtitulo = `${getNomeMes(getCurrentMonth())} de ${getCurrentYear()}`;

  return (
    <div className="space-y-6">
      <TituloPage titulo="Visão Geral" subtitulo={subtitulo} />

      {/* Gráfico de Visão Geral */}
      <FinancialChart />

      {/* Dicas de Economia */}
      {shouldShowSkeleton ? (
        <TipsSkeleton />
      ) : (
        iaData?.data?.dicasEconomia &&
        iaData.data.dicasEconomia.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-amber-500">
                <MdTipsAndUpdates />
                Dicas de Economia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {iaData.data.dicasEconomia.map((dica, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    <span className="text-sm">{dica}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )
      )}

      {/* Análise da IA */}
      {shouldShowSkeleton ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[30%_40%_30%]">
          <StatusSkeleton />
          <SummarySkeleton />
          <DollarConversionSkeleton />
        </div>
      ) : iaData?.data ? (
        <IARecommendations data={iaData.data} />
      ) : null}
    </div>
  );
};

export default Dashboard;
