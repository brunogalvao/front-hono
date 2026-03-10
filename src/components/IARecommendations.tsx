import { useIA } from '@/hooks/use-ia';
import { formatToBRL, formatToUSD } from '@/utils/format';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { FaChartArea, FaMoneyBill } from 'react-icons/fa6';
import { MdTipsAndUpdates } from 'react-icons/md';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Componente Skeleton para o status financeiro
const StatusSkeleton = () => (
  <Card>
    <CardContent className="pt-6">
      <div className="mb-4 flex items-center gap-3">
        <Skeleton className="h-6 w-6" />
        <div className="flex-1">
          <Skeleton className="mb-2 h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
        {[1, 2, 3, 4].map((index) => (
          <div key={index}>
            <Skeleton className="mb-1 h-4 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Componente Skeleton para o resumo financeiro
const SummarySkeleton = () => (
  <Card>
    <CardHeader className="pb-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-6 w-32" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[1, 2, 3].map((index) => (
          <div key={index} className="bg-muted rounded-lg p-4 text-center">
            <Skeleton className="mx-auto mb-2 h-8 w-24" />
            <Skeleton className="mx-auto h-4 w-20" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Componente Skeleton para conversão de dólar
const DollarConversionSkeleton = () => (
  <Card>
    <CardHeader className="pb-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-6 w-40" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="mb-1 h-4 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="text-right">
          <Skeleton className="mb-1 h-4 w-36" />
          <Skeleton className="h-6 w-28" />
        </div>
      </div>
      <div className="bg-muted mt-4 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 flex-1" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const IARecommendations = () => {
  const { data: iaData, isLoading, error } = useIA();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <StatusSkeleton />
        <div className="grid grid-cols-1 gap-4">
          <SummarySkeleton />
          <DollarConversionSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span className="text-lg font-semibold text-red-800">
            Erro na Análise
          </span>
        </div>
        <p className="text-red-700">{error.message}</p>
      </div>
    );
  }

  // Verificação de segurança para iaData
  if (!iaData?.data) {
    return null; // Deixa o Dashboard controlar o skeleton
  }

  const {
    percentualGasto,
    percentualDisponivel,
    resultadoLiquido,
    cotacaoDolar,
    quantidadeDolar,
    rendimentoMes,
    tarefasPagas,
  } = iaData.data;

  // Determinar status financeiro baseado no percentual gasto
  const getStatusFinanceiro = () => {
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

  const statusInfo = getStatusFinanceiro();
  const IconComponent = statusInfo.icon;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[30%_40%_30%]">
      {/* Status Financeiro */}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center gap-3">
            <IconComponent className={`h-6 w-6 ${statusInfo.color}`} />
            <div>
              <h3 className={`text-lg font-semibold ${statusInfo.color}`}>
                Status: {statusInfo.status}
              </h3>
              <p className="text-muted-foreground text-sm">
                {statusInfo.message}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div>
              <span className="text-muted-foreground">Gasto:</span>
              <div className={`font-semibold ${statusInfo.color}`}>
                {percentualGasto}%
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Disponível:</span>
              <div className="font-semibold text-emerald-500">
                {percentualDisponivel}%
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Resultado:</span>
              <div className="font-semibold text-blue-600">
                {formatToBRL(resultadoLiquido)}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Em USD:</span>
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
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatToBRL(rendimentoMes)}
              </div>
              <div className="text-muted-foreground text-sm">Rendimento Total</div>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatToBRL(tarefasPagas)}
              </div>
              <div className="text-muted-foreground text-sm">Gastos Realizados</div>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {formatToBRL(resultadoLiquido)}
              </div>
              <div className="text-muted-foreground text-sm">Sobrou no Mês</div>
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
              <MdTipsAndUpdates className="text-amber-500 shrink-0" />
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
