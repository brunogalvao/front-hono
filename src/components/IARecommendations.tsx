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

// Componente Skeleton para o status financeiro
const StatusSkeleton = () => (
  <div className="rounded-lg border bg-blue-50 p-6">
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
  </div>
);

// Componente Skeleton para o resumo financeiro
const SummarySkeleton = () => (
  <div className="rounded-lg border bg-white p-6">
    <div className="mb-4 flex items-center gap-2">
      <Skeleton className="h-5 w-5" />
      <Skeleton className="h-6 w-32" />
    </div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {[1, 2, 3].map((index) => (
        <div key={index} className="rounded-lg bg-gray-50 p-4 text-center">
          <Skeleton className="mx-auto mb-2 h-8 w-24" />
          <Skeleton className="mx-auto h-4 w-20" />
        </div>
      ))}
    </div>
  </div>
);

// Componente Skeleton para conversão de dólar
const DollarConversionSkeleton = () => (
  <div className="rounded-lg border bg-white p-6">
    <div className="mb-4 flex items-center gap-2">
      <Skeleton className="h-5 w-5" />
      <Skeleton className="h-6 w-40" />
    </div>
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
    <div className="mt-4 rounded-lg bg-blue-50 p-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 flex-1" />
      </div>
    </div>
  </div>
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

  if (!iaData?.data) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <p className="text-gray-600">Nenhum dado de análise disponível.</p>
      </div>
    );
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
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-200',
        icon: CheckCircle,
        message: 'Seu controle financeiro está excelente! Continue assim.',
      };
    } else if (percentualGasto < 70) {
      return {
        status: 'Bom',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-200',
        icon: TrendingUp,
        message: 'Bom controle financeiro, mas há espaço para melhorar.',
      };
    } else if (percentualGasto < 90) {
      return {
        status: 'Atenção',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 border-yellow-200',
        icon: AlertTriangle,
        message: 'Atenção: você está gastando muito da sua renda.',
      };
    } else {
      return {
        status: 'Crítico',
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
        icon: TrendingDown,
        message: 'ALERTA: Situação financeira crítica!',
      };
    }
  };

  const statusInfo = getStatusFinanceiro();
  const IconComponent = statusInfo.icon;

  return (
    <div className="space-y-4">
      {/* Status Financeiro */}
      <div className={`rounded-lg border p-6 ${statusInfo.bgColor}`}>
        <div className="mb-4 flex items-center gap-3">
          <IconComponent className={`h-6 w-6 ${statusInfo.color}`} />
          <div>
            <h3 className={`text-lg font-semibold ${statusInfo.color}`}>
              Status Financeiro: {statusInfo.status}
            </h3>
            <p className={`text-sm ${statusInfo.color.replace('600', '700')}`}>
              {statusInfo.message}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <span className="text-gray-600">Gasto:</span>
            <div className={`font-semibold ${statusInfo.color}`}>
              {percentualGasto}%
            </div>
          </div>
          <div>
            <span className="text-gray-600">Disponível:</span>
            <div className="font-semibold text-green-600">
              {percentualDisponivel}%
            </div>
          </div>
          <div>
            <span className="text-gray-600">Resultado:</span>
            <div className="font-semibold text-blue-600">
              {formatToBRL(resultadoLiquido)}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Em USD:</span>
            <div className="font-semibold text-purple-600">
              {/*${quantidadeDolar.toFixed(2)}*/}
              {formatToUSD(quantidadeDolar)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Resumo Financeiro */}
        <div className="rounded-lg border bg-white p-6">
          <h3 className="text-primary mb-4 flex flex-row items-center gap-2 text-lg font-semibold">
            <FaChartArea />
            Resumo do Mês
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatToBRL(rendimentoMes)}
              </div>
              <div className="text-sm text-gray-600">Rendimento Total</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatToBRL(tarefasPagas)}
              </div>
              <div className="text-sm text-gray-600">Gastos Realizados</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatToBRL(resultadoLiquido)}
              </div>
              <div className="text-sm text-gray-600">Sobrou no Mês</div>
            </div>
          </div>
        </div>

        {/* Conversão Dólar */}
        <div className="rounded-lg border bg-white p-6">
          <h3 className="text-primary mb-4 flex flex-row items-center gap-2 text-lg font-semibold">
            <FaMoneyBill />
            Conversão em Dólar
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cotação atual do dólar:</p>
              <p className="text-xl font-semibold text-green-600">
                {formatToBRL(cotacaoDolar)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Seu resultado em dólares:</p>
              <p className="text-xl font-semibold text-blue-600">
                ${quantidadeDolar.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-lg bg-blue-50 p-3">
            <p className="flex flex-row items-center gap-2 text-sm text-blue-700">
              <MdTipsAndUpdates />
              <span>
                Com {formatToBRL(resultadoLiquido)} você pode comprar $
                {quantidadeDolar.toFixed(2)} dólares na cotação atual de{' '}
                {formatToBRL(cotacaoDolar)}.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IARecommendations;
