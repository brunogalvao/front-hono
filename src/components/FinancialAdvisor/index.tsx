import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles,
  RotateCcw,
  TrendingUp,
  AlertTriangle,
  PiggyBank,
  Bot,
  Clock,
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

const KEYWORDS_POSITIVE = [
  'superávit',
  'positivo',
  'positiva',
  'excelente',
  'ótimo',
  'ótima',
  'reserva de emergência',
  'Tesouro Direto',
  'CDB',
  'LCI',
  'LCA',
  'FIIs',
  'patrimônio',
  'investimento',
  'rentabilidade',
];

const KEYWORDS_WARNING = [
  'déficit',
  'negativo',
  'negativa',
  'atenção',
  'alerta',
  'cuidado',
  'reduzir',
  'eliminar',
  'cortar',
  'dívida',
  'dívidas',
  'endividamento',
  'comprometido',
  'comprometida',
  'excesso',
  'excessivo',
];

function highlightKeywords(text: string): string {
  let result = text;
  for (const word of KEYWORDS_POSITIVE) {
    result = result.replace(
      new RegExp(`(?<![*\`])(${word})(?![*\`])`, 'gi'),
      '**$1**'
    );
  }
  for (const word of KEYWORDS_WARNING) {
    result = result.replace(
      new RegExp(`(?<![*\`])(${word})(?![*\`])`, 'gi'),
      '*$1*'
    );
  }
  return result;
}

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
  badgeClass?: string;
  content: string;
}

function SectionCard({
  title,
  icon: Icon,
  iconClass,
  badge,
  badgeVariant = 'secondary',
  badgeClass,
  content,
}: SectionCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className={`size-5 shrink-0 ${iconClass}`} />
          <span>{title}</span>
          {badge && (
            <Badge
              variant={badgeVariant}
              className={`ml-auto text-xs ${badgeClass ?? ''}`}
            >
              {badge}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm dark:prose-invert advisor-content max-w-none text-sm leading-relaxed">
          <ReactMarkdown
            components={{
              strong: ({ children }) => (
                <strong className="rounded px-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="rounded px-0.5 font-medium text-rose-600 not-italic dark:text-rose-400">
                  {children}
                </em>
              ),
            }}
          >
            {highlightKeywords(content)}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}

function QuotaExceededAlert({ retrySeconds }: { retrySeconds: number | null }) {
  const { t, i18n } = useTranslation('advisor');
  const initialSeconds = retrySeconds ?? 60;
  const [countdown, setCountdown] = useState(initialSeconds);
  const availableAt = new Date(
    Date.now() + initialSeconds * 1000
  ).toLocaleTimeString(i18n.language === 'en' ? 'en-US' : 'pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const countdownStr =
    minutes > 0
      ? `${minutes}min ${seconds.toString().padStart(2, '0')}s`
      : `${countdown}s`;

  return (
    <Alert className="border-amber-500/50 bg-amber-500/10">
      <Clock className="-mt-1 size-4 text-amber-500" />
      <AlertDescription className="text-sm">
        <span className="font-semibold text-amber-600 dark:text-amber-400">
          {t('quota.exceeded')}
        </span>{' '}
        {countdown > 0 ? (
          <>
            {t('quota.availableAt')}{' '}
            <span className="font-semibold tabular-nums">{availableAt}</span> —
            {t('quota.remaining')} <span className="tabular-nums">{countdownStr}</span>.
          </>
        ) : (
          t('quota.tryAgain')
        )}
      </AlertDescription>
    </Alert>
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
  const { t } = useTranslation('advisor');
  const [month, setMonth] = useState(getCurrentMonth());
  const [year, setYear] = useState(getCurrentYear());
  const { analysis, isLoading, error, retrySeconds, analyzeFinances, reset } =
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
        titulo={t('title')}
        subtitulo={t('subtitle')}
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
                <Sparkles
                  className={`size-4 ${isLoading ? 'animate-spin' : ''}`}
                />
                {isLoading ? t('analyzing') : t('analyze')}
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isLoading}
                className="gap-2"
              >
                <RotateCcw className="size-4" />
                {t('newAnalysis')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quota esgotada */}
      {retrySeconds !== null && (
        <QuotaExceededAlert retrySeconds={retrySeconds} />
      )}

      {/* Erro genérico */}
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
              <span>{t('analyzing')}</span>
            </div>
          )}

          {sections.diagnostico && (
            <SectionCard
              title={t('sections.diagnosis')}
              icon={TrendingUp}
              iconClass="text-blue-500"
              badge={`${getNomeMes(month)} ${year}`}
              content={sections.diagnostico}
            />
          )}

          {sections.alertas && (
            <SectionCard
              title={t('sections.alerts')}
              icon={AlertTriangle}
              iconClass="text-amber-500"
              badge={t('sections.attentionBadge')}
              badgeVariant="outline"
              badgeClass="border-amber-500/50 bg-amber-500/15 text-amber-600 dark:text-amber-400"
              content={sections.alertas}
            />
          )}

          {sections.investimento && (
            <SectionCard
              title={t('sections.investment')}
              icon={PiggyBank}
              iconClass="text-emerald-500"
              badge={t('sections.strategyBadge')}
              badgeVariant="outline"
              badgeClass="border-emerald-500/50 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              content={sections.investimento}
            />
          )}

          {!isStreaming && (
            <p className="text-muted-foreground text-center text-xs">
              {t('disclaimer')}
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
              <h3 className="font-semibold">{t('emptyTitle')}</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {t('emptyDescription')}
              </p>
            </div>
            <Button onClick={handleAnalyze} className="gap-2">
              <Sparkles className="size-4" />
              {t('analyze')} {getNomeMes(month)} {year}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
