import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useIA } from '@/hooks/use-ia';
import { Loader, RefreshCw } from 'lucide-react';
import { SuspenseWrapper } from '@/components/ui/suspense';

// Componente de loading
function IALoading() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader className="h-8 w-8 animate-spin" />
      <span className="ml-2">Analisando seus dados com IA...</span>
    </div>
  );
}

// Componente de erro
function IAError({ error, onRetry }: { error?: any; onRetry?: () => void }) {
  const getErrorMessage = (error: any) => {
    if (error?.message) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Erro desconhecido ao carregar análise da IA';
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center">
          <p className="text-destructive font-medium">
            Erro ao carregar análise da IA
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            {getErrorMessage(error)}
          </p>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="mt-4"
              size="sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente principal da IA (será envolvido pelo Suspense)
function IARecommendationsContent() {
  const { data: iaData, error, isLoading, refetchIA } = useIA();

  console.log('🔍 IARecommendations - Status:', {
    isLoading,
    error,
    hasData: !!iaData,
  });
  console.log('📊 IA Data completo:', iaData);

  if (isLoading) {
    return <IALoading />;
  }

  if (error) {
    console.error('❌ Erro na análise IA:', error);
    return <IAError error={error} onRetry={refetchIA} />;
  }

  if (!iaData?.data) {
    console.warn('⚠️ Sem dados da IA');
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">Nenhuma análise disponível</p>
            <p className="text-muted-foreground mt-2 text-sm">
              Verifique se você tem dados de rendimentos e tarefas
            </p>
            <Button
              onClick={refetchIA}
              variant="outline"
              className="mt-4"
              size="sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar Análise
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { dashboard, investimento, cotacaoDolar, analise, metadata } =
    iaData.data;

  // Validação adicional dos dados
  if (!dashboard || !investimento || !analise || !metadata) {
    console.warn('⚠️ Estrutura de dados inválida:', {
      dashboard,
      investimento,
      analise,
      metadata,
    });
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">Estrutura de dados inválida</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const {
    statusEconomia,
    precisaEconomizar,
    economiaRecomendada,
    estrategiaInvestimento,
    dicasEconomia,
    distribuicaoInvestimento,
    resumo,
  } = analise;

  return (
    <div className="space-y-6">
      {/* Header com botão de atualização */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            🤖 Análise de Investimento IA
          </h2>
          <p className="text-muted-foreground">
            Análise inteligente baseada em seus dados financeiros
          </p>
        </div>
        <div className="flex items-center gap-4">
          {metadata?.timestamp && (
            <span className="text-muted-foreground text-sm">
              Última atualização:{' '}
              {new Date(metadata.timestamp).toLocaleTimeString()}
            </span>
          )}
          <Button
            onClick={refetchIA}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Resumo Geral */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🤖 Análise IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Status Econômico</h4>
                <Badge
                  variant={
                    statusEconomia === 'bom'
                      ? 'default'
                      : statusEconomia === 'regular'
                        ? 'secondary'
                        : 'destructive'
                  }
                >
                  {statusEconomia.toUpperCase()}
                </Badge>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Precisa Economizar</h4>
                <Badge variant={precisaEconomizar ? 'destructive' : 'default'}>
                  {precisaEconomizar ? 'SIM' : 'NÃO'}
                </Badge>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Economia Recomendada</h4>
                <p className="text-muted-foreground text-sm">
                  R${' '}
                  {typeof economiaRecomendada === 'number'
                    ? economiaRecomendada.toFixed(2)
                    : '0.00'}
                </p>
              </div>
            </div>
            <div className="border-t pt-4">
              <p className="text-muted-foreground text-sm">{resumo}</p>
            </div>
          </CardContent>
        </Card>

        {/* Recomendações de Investimento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💰 Recomendações de Investimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Poupança */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Poupança</h4>
                <Badge variant="outline" className="text-xs">
                  Baixo Risco
                </Badge>
              </div>
              <Progress
                value={
                  typeof distribuicaoInvestimento.poupanca === 'number'
                    ? distribuicaoInvestimento.poupanca
                    : 0
                }
                className="h-2"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {typeof distribuicaoInvestimento.poupanca === 'number'
                    ? distribuicaoInvestimento.poupanca
                    : 0}
                  %
                </span>
                <span className="text-muted-foreground">
                  Segurança e liquidez
                </span>
              </div>
            </div>

            {/* Dólar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Dólar</h4>
                <Badge variant="outline" className="text-xs">
                  Médio Risco
                </Badge>
              </div>
              <Progress
                value={
                  typeof distribuicaoInvestimento.dolar === 'number'
                    ? distribuicaoInvestimento.dolar
                    : 0
                }
                className="h-2"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {typeof distribuicaoInvestimento.dolar === 'number'
                    ? distribuicaoInvestimento.dolar
                    : 0}
                  %
                </span>
                <span className="text-muted-foreground">Proteção cambial</span>
              </div>
            </div>

            {/* Outros */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Outros Investimentos</h4>
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {dicasEconomia.map((dica: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {dica}
                    </Badge>
                  ))}
                </div>
                <p className="text-muted-foreground text-xs">
                  Diversificação da carteira
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estratégia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📈 Estratégia de Investimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Curto Prazo</h4>
                <p className="text-muted-foreground text-sm">
                  {estrategiaInvestimento.curtoPrazo}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Médio Prazo</h4>
                <p className="text-muted-foreground text-sm">
                  {estrategiaInvestimento.medioPrazo}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Longo Prazo</h4>
                <p className="text-muted-foreground text-sm">
                  {estrategiaInvestimento.longoPrazo}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metadados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Dados da Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Rendimento Mensal:
                </span>
                <span className="text-sm font-medium">
                  {dashboard.rendimentoMesBRL}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Disponível:
                </span>
                <span className="text-sm font-medium">
                  {dashboard.rendimentoDisponivelBRL}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Cotação Dólar:
                </span>
                <span className="text-sm font-medium">
                  {cotacaoDolar?.valorBRL || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Investimento Recomendado:
                </span>
                <span className="text-sm font-medium">
                  {investimento.recomendadoBRL}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Componente principal com Suspense
export function IARecommendations() {
  return (
    <SuspenseWrapper fallback={<IALoading />}>
      <IARecommendationsContent />
    </SuspenseWrapper>
  );
}
