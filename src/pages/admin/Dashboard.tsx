import TituloPage from '@/components/TituloPage';
import { useIA } from '@/hooks/use-ia';
import IARecommendations from '@/components/IARecommendations';
import { GoDotFill } from 'react-icons/go';
import { MdTipsAndUpdates } from 'react-icons/md';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  DollarConversionSkeleton,
  StatusSkeleton,
  SummarySkeleton,
  TipsSkeleton,
} from '@/components/SkeletonDashboard';

const Dashboard = () => {
  // Hook para buscar dados da IA simplificados
  const { data: iaData, isLoading } = useIA();

  // Mostrar skeleton quando está carregando OU quando não há dados
  const shouldShowSkeleton = isLoading || !iaData?.data;

  return (
    <div className="space-y-6">
      <TituloPage titulo="Home" />

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
              <ul className="grid grid-cols-2 gap-3">
                {iaData.data.dicasEconomia.map((dica, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-emerald-600">
                      <GoDotFill />
                    </span>
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
      ) : (
        <IARecommendations />
      )}
    </div>
  );
};

export default Dashboard;
