import {
  AlertTriangle,
  Building2,
  CircleMinus,
  ExternalLink,
  TrendingDown,
  TrendingUp,
  UserRound,
  WalletCards,
} from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { DashboardSummary } from '@/hooks/useDashboard';
import { cn } from '@/lib/utils';
import { formatToBRL } from '@/utils/format';
import { useTranslation } from 'react-i18next';

interface SummaryCardProps {
  title: string;
  context: string;
  scope: 'workspace' | 'personal';
  summary?: DashboardSummary;
  expenseShare?: number;
  month: number;
  year: number;
  isLoading?: boolean;
}

export function SummaryCard({
  title,
  context,
  scope,
  summary,
  expenseShare,
  month,
  year,
  isLoading,
}: SummaryCardProps) {
  const { t } = useTranslation('dashboard');
  if (isLoading || !summary) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const { total_receitas, total_despesas, saldo } = summary;

  const isPositive = saldo > 0;
  const isNegative = saldo < 0;
  const ScopeIcon = scope === 'workspace' ? Building2 : UserRound;
  const ResultIcon = isPositive
    ? WalletCards
    : isNegative
      ? AlertTriangle
      : CircleMinus;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ScopeIcon className="text-primary size-5 shrink-0" />
          <span className="truncate">{title}</span>
        </CardTitle>
        <p className="text-muted-foreground text-xs">{context}</p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              {t('summary.income')}
            </div>
            <span className="font-semibold text-green-600">
              {formatToBRL(total_receitas)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <TrendingDown className="h-4 w-4 text-red-500" />
              {t('summary.expenses')}
            </div>
            <span className="font-semibold text-red-500">
              {formatToBRL(total_despesas)}
            </span>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-start gap-3">
            <ResultIcon
              className={cn(
                'mt-0.5 size-5 shrink-0',
                isPositive
                  ? 'text-emerald-500'
                  : isNegative
                    ? 'text-red-500'
                    : 'text-muted-foreground'
              )}
            />
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs">
                {isNegative
                  ? t('summary.projectedDeficit')
                  : isPositive
                    ? t('summary.availableBalance')
                    : t('summary.zeroBalance')}
              </p>
              <p
                className={cn(
                  'text-xl font-semibold tabular-nums',
                  isPositive
                    ? 'text-emerald-600'
                    : isNegative
                      ? 'text-red-600'
                      : 'text-foreground'
                )}
              >
                {formatToBRL(Math.abs(saldo))}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {isNegative
                  ? t(`summary.${scope}DeficitHint`)
                  : isPositive
                    ? t(`summary.${scope}PositiveHint`)
                    : t(`summary.${scope}ZeroHint`)}
              </p>
            </div>
          </div>
        </div>

        <div className="text-muted-foreground mt-auto space-y-2 text-xs">
          {scope === 'personal' && expenseShare !== undefined && (
            <p>{t('summary.expenseShare', { percent: expenseShare })}</p>
          )}
          <Link
            to="/admin/transactions"
            search={{ month, year, status: undefined, highlight: undefined }}
            className="hover:text-foreground inline-flex items-center gap-1 underline underline-offset-2"
          >
            {t(
              scope === 'workspace'
                ? 'summary.viewWorkspaceTransactions'
                : 'summary.viewPersonalContext'
            )}
            <ExternalLink className="size-3" aria-hidden="true" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
