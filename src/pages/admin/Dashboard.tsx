import TituloPage from '@/components/TituloPage';
import { Link } from '@tanstack/react-router';
import { useIA } from '@/hooks/use-ia';
import IARecommendations from '@/components/IARecommendations';
import FinancialChart from '@/components/FinancialChart';
import { CheckCircle2, Sparkles } from 'lucide-react';
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
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { data: iaData, isLoading } = useIA();
  const { t } = useTranslation('dashboard');
  const shouldShowSkeleton = isLoading;

  const subtitulo = `${getNomeMes(getCurrentMonth())} ${getCurrentYear()}`;

  return (
    <div className="space-y-6">
      <TituloPage titulo={t('title')} subtitulo={subtitulo} />

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
              <CardTitle className="flex items-center justify-between gap-2 text-lg">
                <div className="flex flex-row items-center gap-2 text-amber-500">
                  <MdTipsAndUpdates />
                  {t('savingTips')}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-y-6">
              <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {iaData.data.dicasEconomia.map((dica, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    <span className="text-sm">{dica}</span>
                  </li>
                ))}
              </ul>
              <Link to="/admin/advisor">
                <div className="border-primary hover:bg-primary group flex w-full cursor-pointer flex-col items-center justify-center gap-2 gap-y-1 rounded-full border bg-amber-50/5 py-3 text-center text-white transition-all hover:text-white">
                  <div className="flex flex-row items-center gap-2">
                    <Sparkles />
                    {t('advisorCta')}
                  </div>
                  <div className="text-sm font-light text-gray-500 group-hover:text-white">
                    {t('advisorDescription')}
                  </div>
                </div>
              </Link>
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
