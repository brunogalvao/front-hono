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
import { FaChartArea, FaMoneyBill } from 'react-icons/fa6';
import { MdTipsAndUpdates } from 'react-icons/md';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type Props = {
  data: IASimplificada;
};

const getStatusFinanceiro = (percentualGasto: number) => {
  if (percentualGasto < 50) {
    return {
      status: 'Excelente',
      color: 'text-emerald-500',
      icon: CheckCircle,
      message: 'Seu controle financeiro está excelente! Continue assim.',
    };
  } else if (percentualGasto < 70) {
    return {
      status: 'Bom',
      color: 'text-blue-500',
      icon: TrendingUp,
      message: 'Bom controle financeiro, mas há espaço para melhorar.',
    };
  } else if (percentualGasto < 90) {
    return {
      status: 'Atenção',
      color: 'text-amber-500',
      icon: AlertTriangle,
      message: 'Atenção: você está gastando muito da sua renda.',
    };
  } else {
    return {
      status: 'Crítico',
      color: 'text-red-500',
      icon: TrendingDown,
      message: 'ALERTA: Situação financeira crítica!',
    };
  }
};

const IARecommendations = ({ data }: Props) => {
  const {
    percentualGasto,
    percentualDisponivel,
    resultadoLiquido,
    cotacaoDolar,
    quantidadeDolar,
    rendimentoMes,
    despesasPagas,
    despesasPendentes,
  } = data;

  const statusInfo = getStatusFinanceiro(percentualGasto);
  const IconComponent = statusInfo.icon;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[30%_40%_30%]">
      {/* Status Financeiro */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-primary flex flex-row items-center gap-2 text-lg">
            <Activity />
            Status Financeiro
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
              <span className="text-muted-foreground">Gasto: {percentualGasto}%</span>
              <span className="text-muted-foreground">Disponível: {percentualDisponivel}%</span>
            </div>
            <Progress value={percentualGasto} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground text-xs">Resultado</span>
              <div className="font-semibold text-blue-600">
                {formatToBRL(resultadoLiquido)}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Equivalente em dólar (USD)</span>
              <div className="font-semibold text-purple-600">
                {formatToUSD(quantidadeDolar)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-primary flex flex-row items-center gap-2 text-lg">
            <FaChartArea />
            Resumo do Mês
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Rendimento */}
          <div className="flex items-center gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
              <ArrowUpCircle className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-muted-foreground text-xs">Rendimento Total</div>
              <div className="text-lg font-bold text-blue-600 leading-tight">
                {formatToBRL(rendimentoMes)}
              </div>
            </div>
          </div>

          {/* Gastos */}
          <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-500/10">
              <ArrowDownCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-muted-foreground text-xs">Gastos Realizados</div>
              <div className="text-lg font-bold text-red-600 leading-tight">
                {formatToBRL(despesasPagas)}
              </div>
            </div>
            {despesasPendentes > 0 && (
              <div className="flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-1 text-xs text-amber-600 shrink-0">
                <Clock className="h-3 w-3" />
                <span>+{formatToBRL(despesasPendentes)} pendente</span>
              </div>
            )}
          </div>

          {/* Saldo */}
          <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
              <Wallet className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-muted-foreground text-xs">Sobrou no Mês</div>
              <div className="text-lg font-bold text-emerald-600 leading-tight">
                {formatToBRL(resultadoLiquido)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversão Dólar */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-primary flex flex-row items-center gap-2 text-lg">
            <FaMoneyBill />
            Conversão em Dólar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Cotação atual:</p>
              <p className="text-xl font-semibold text-emerald-600">
                {formatToBRL(cotacaoDolar)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-sm">Resultado em dólares:</p>
              <p className="text-xl font-semibold text-blue-600">
                ${quantidadeDolar.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="bg-muted mt-4 rounded-lg p-3">
            <p className="text-muted-foreground flex flex-row items-center gap-2 text-sm">
              <MdTipsAndUpdates className="shrink-0 text-amber-500" />
              <span>
                Com {formatToBRL(resultadoLiquido)} você pode comprar $
                {quantidadeDolar.toFixed(2)} dólares na cotação de{' '}
                {formatToBRL(cotacaoDolar)}.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IARecommendations;
