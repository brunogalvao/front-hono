import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles,
  RotateCcw,
  TrendingUp,
  AlertTriangle,
  PiggyBank,
  Bot,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { MonthYearPicker } from '@/components/MonthYearPicker';
import TituloPage from '@/components/TituloPage';
import { useFinancialAdvisor } from '@/hooks/useFinancialAdvisor';
import { getCurrentMonth, getCurrentYear } from '@/utils/date';
import { getNomeMes } from '@/model/mes.enum';

function AnalysisSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="size-5 rounded" />
              <Skeleton className="h-5 w-48" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface SectionCardProps {
  title: string;
  icon: React.ElementType;
  iconClass: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  content: string;
}

function SectionCard({
  title,
  icon: Icon,
  iconClass,
  badge,
  badgeVariant = 'secondary',
  content,
}: SectionCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className={`size-5 shrink-0 ${iconClass}`} />
          <span>{title}</span>
          {badge && (
            <Badge variant={badgeVariant} className="ml-auto text-xs">
              {badge}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed [&>h3]:mb-1 [&>h3]:font-semibold [&>ol]:mt-2 [&>ol]:space-y-1 [&>p]:mb-2 [&>strong]:font-semibold [&>ul]:mt-2 [&>ul]:space-y-1">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}

function parseAnalysisSections(analysis: string): {
  diagnostico: string;
  alertas: string;
  investimento: string;
} {
  const section1Match = analysis.match(
    /##\s*1\.\s*Diagnóstico do Período([\s\S]*?)(?=##\s*2\.|$)/i
  );
  const section2Match = analysis.match(
    /##\s*2\.\s*Alertas e Sugestões de Corte([\s\S]*?)(?=##\s*3\.|$)/i
  );
  const section3Match = analysis.match(
    /##\s*3\.\s*Recomendação de Investimento([\s\S]*?)$/i
  );

  return {
    diagnostico: section1Match?.[1]?.trim() ?? analysis,
    alertas: section2Match?.[1]?.trim() ?? '',
    investimento: section3Match?.[1]?.trim() ?? '',
  };
}

export function FinancialAdvisor() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [year, setYear] = useState(getCurrentYear());
  const { analysis, isLoading, error, analyzeFinances, reset } =
    useFinancialAdvisor();

  const hasAnalysis = analysis.length > 0;
  const sections = hasAnalysis ? parseAnalysisSections(analysis) : null;
  const isStreaming = isLoading && hasAnalysis;
  const showSkeleton = isLoading && !hasAnalysis;

  const handleAnalyze = () => {
    analyzeFinances({ month, year });
  };

  const handleReset = () => {
    reset();
  };

  const handlePeriodChange = (mes: number, ano: number) => {
    setMonth(mes);
    setYear(ano);
    if (hasAnalysis) reset();
  };

  return (
    <div className="space-y-6">
      <TituloPage
        titulo="Consultor IA"
        subtitulo="Análise financeira personalizada com inteligência artificial"
      />

      {/* Controles */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="w-full sm:w-56">
              <MonthYearPicker
                mes={month}
                ano={year}
                onChange={handlePeriodChange}
              />
            </div>
            {!hasAnalysis ? (
              <Button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="gap-2"
              >
                <Sparkles className="size-4" />
                {isLoading ? 'Analisando...' : 'Analisar'}
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isLoading}
                className="gap-2"
              >
                <RotateCcw className="size-4" />
                Nova análise
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Skeleton inicial */}
      {showSkeleton && <AnalysisSkeleton />}

      {/* Análise em streaming ou completa */}
      {hasAnalysis && sections && (
        <div className="space-y-4">
          {isStreaming && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Bot className="size-4 animate-pulse" />
              <span>Gerando análise...</span>
            </div>
          )}

          {sections.diagnostico && (
            <SectionCard
              title="Diagnóstico do Período"
              icon={TrendingUp}
              iconClass="text-blue-500"
              badge={`${getNomeMes(month)} ${year}`}
              content={sections.diagnostico}
            />
          )}

          {sections.alertas && (
            <SectionCard
              title="Alertas e Sugestões de Corte"
              icon={AlertTriangle}
              iconClass="text-amber-500"
              badge="Atenção"
              badgeVariant="outline"
              content={sections.alertas}
            />
          )}

          {sections.investimento && (
            <SectionCard
              title="Recomendação de Investimento"
              icon={PiggyBank}
              iconClass="text-emerald-500"
              badge="Estratégia"
              content={sections.investimento}
            />
          )}

          {/* Aviso de responsabilidade */}
          {!isStreaming && (
            <p className="text-muted-foreground text-center text-xs">
              Esta análise é gerada por inteligência artificial e tem caráter
              informativo. Consulte um profissional financeiro certificado para
              decisões de investimento.
            </p>
          )}
        </div>
      )}

      {/* Estado vazio */}
      {!hasAnalysis && !isLoading && !error && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="bg-primary/10 flex size-16 items-center justify-center rounded-full">
              <Sparkles className="text-primary size-8" />
            </div>
            <div>
              <h3 className="font-semibold">Análise financeira com IA</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Selecione o período e clique em "Analisar" para receber um
                diagnóstico personalizado com alertas e recomendações de
                investimento.
              </p>
            </div>
            <Button onClick={handleAnalyze} className="gap-2">
              <Sparkles className="size-4" />
              Analisar {getNomeMes(month)} {year}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
