import { useState } from 'react';
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
import { MonthNavigator } from '@/components/dashboard/MonthNavigator';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { DollarConversionCard } from '@/components/dashboard/DollarConversionCard';
import { useDashboard } from '@/hooks/useDashboard';
import { useWorkspace } from '@/context/WorkspaceContext';

const Dashboard = () => {
  const { data: iaData, isLoading } = useIA();
  const { t } = useTranslation('dashboard');
  const shouldShowSkeleton = isLoading;
  const { activeWorkspaceId } = useWorkspace();

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const { workspaceSummary, individualSummary } = useDashboard(
    activeWorkspaceId,
    month,
    year
  );

  const subtitulo = `${getNomeMes(getCurrentMonth())} ${getCurrentYear()}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <TituloPage titulo={t('title')} subtitulo={subtitulo} />
        <MonthNavigator
          month={month}
          year={year}
          onChange={(m, y) => {
            setMonth(m);
            setYear(y);
          }}
        />
      </div>

      {/* Resumo do Workspace e Individual */}
      {activeWorkspaceId && (
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            title="Workspace"
            summary={workspaceSummary.data}
            isLoading={workspaceSummary.isLoading}
          />
          <SummaryCard
            title="Meus gastos"
            summary={individualSummary.data}
            isLoading={individualSummary.isLoading}
          />
          <DollarConversionCard
            isLoading={shouldShowSkeleton}
            cotacaoDolar={iaData?.data?.cotacaoDolar}
            quantidadeDolar={iaData?.data?.quantidadeDolar}
            valorLivre={iaData?.data?.valorLivre}
          />
        </div>
      )}

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
        <div className={`grid grid-cols-1 gap-4 ${!activeWorkspaceId ? 'md:grid-cols-[30%_40%_30%]' : 'md:grid-cols-2'}`}>
          <StatusSkeleton />
          <SummarySkeleton />
          {!activeWorkspaceId && <DollarConversionSkeleton />}
        </div>
      ) : iaData?.data ? (
        <IARecommendations data={iaData.data} showDollarCard={!activeWorkspaceId} />
      ) : null}
    </div>
  );
};

export default Dashboard;
