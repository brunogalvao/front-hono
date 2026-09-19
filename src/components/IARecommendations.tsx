import type { IASimplificada } from '@/service/ia/getIA';
import { formatToBRL, formatToUSD } from '@/utils/format';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Clock,
  Activity,
} from 'lucide-react';
import { FaChartArea } from 'react-icons/fa6';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarConversionCard } from '@/components/dashboard/DollarConversionCard';
import { useTranslation } from 'react-i18next';

type Props = {
  data: IASimplificada;
  showDollarCard?: boolean;
};

const IARecommendations = ({ data, showDollarCard = false }: Props) => {
  const { t } = useTranslation('dashboard');
  const {
    percentualGasto,
    percentualDisponivel,
    resultadoLiquido,
    quantidadeDolar,
    cotacaoDolar,
    rendimentoMes,
    despesasPagas,
    despesasPendentes,
  } = data;

  const statusInfo =
    percentualGasto < 50
      ? {
          status: t('financialStatus.excellent'),
          color: 'text-emerald-500',
          icon: CheckCircle,
          message: t('financialStatus.excellentMessage'),
        }
      : percentualGasto < 70
        ? {
            status: t('financialStatus.good'),
            color: 'text-blue-500',
            icon: TrendingUp,
            message: t('financialStatus.goodMessage'),
          }
        : percentualGasto < 90
          ? {
              status: t('financialStatus.attention'),
              color: 'text-amber-500',
              icon: AlertTriangle,
              message: t('financialStatus.attentionMessage'),
            }
          : {
              status: t('financialStatus.critical'),
              color: 'text-red-500',
              icon: TrendingDown,
              message: t('financialStatus.criticalMessage'),
            };
  const IconComponent = statusInfo.icon;

  return (
    <div
      className={`grid grid-cols-1 gap-4 ${showDollarCard ? 'md:grid-cols-[30%_40%_30%]' : 'md:grid-cols-2'}`}
    >
      {/* Status Financeiro */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex flex-row items-center gap-2 text-lg">
            <Activity className="text-primary shrink-0" />
            {t('financialStatus.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-3">
            <IconComponent className={`h-6 w-6 shrink-0 ${statusInfo.color}`} />
            <div>
              <h3 className={`text-lg font-semibold ${statusInfo.color}`}>
                {statusInfo.status}
              </h3>
              <p className="text-muted-foreground text-sm">
                {statusInfo.message}
              </p>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="mb-4 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">
                {t('financialStatus.spent')}: {percentualGasto}%
              </span>
              <span className="text-muted-foreground">
                {t('financialStatus.available')}: {percentualDisponivel}%
              </span>
            </div>
            <Progress value={percentualGasto} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground text-xs">
                {t('financialStatus.result')}
              </span>
              <div className="text-foreground font-semibold">
                {formatToBRL(resultadoLiquido)}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">
                {t('financialStatus.usdEquivalent')}
              </span>
              <div className="text-foreground font-semibold">
                {formatToUSD(quantidadeDolar)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex flex-row items-center gap-2 text-lg">
            <FaChartArea className="text-primary shrink-0" />
            {t('financialStatus.monthlySummary')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Rendimento */}
          <div className="flex items-center gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
              <ArrowUpCircle className="h-5 w-5 text-blue-500" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-muted-foreground text-xs">
                {t('financialStatus.totalIncome')}
              </div>
              <div className="text-lg leading-tight font-bold text-blue-600">
                {formatToBRL(rendimentoMes)}
              </div>
            </div>
          </div>

          {/* Gastos */}
          <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/10">
              <ArrowDownCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-muted-foreground text-xs">
                {t('financialStatus.completedExpenses')}
              </div>
              <div className="text-lg leading-tight font-bold text-red-600">
                {formatToBRL(despesasPagas)}
              </div>
            </div>
            {despesasPendentes > 0 && (
              <div className="flex shrink-0 items-center gap-1 rounded-md bg-amber-500/10 px-2 py-1 text-xs text-amber-600">
                <Clock className="h-3 w-3" />
                <span>
                  +{formatToBRL(despesasPendentes)}{' '}
                  {t('financialStatus.pending')}
                </span>
              </div>
            )}
          </div>

          {/* Saldo */}
          <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
              <Wallet className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-muted-foreground text-xs">
                {t('financialStatus.remaining')}
              </div>
              <div className="text-lg leading-tight font-bold text-emerald-600">
                {formatToBRL(resultadoLiquido)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showDollarCard && (
        <DollarConversionCard
          cotacaoDolar={cotacaoDolar}
          quantidadeDolar={quantidadeDolar}
          valorLivre={data.valorLivre}
        />
      )}
    </div>
  );
};

export default IARecommendations;
