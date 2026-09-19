import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { DashboardSummary } from '@/hooks/useDashboard';
import { cn } from '@/lib/utils';
import { formatToBRL } from '@/utils/format';
import { useTranslation } from 'react-i18next';

interface SummaryCardProps {
  title: string;
  summary?: DashboardSummary;
  isLoading?: boolean;
}

export function SummaryCard({ title, summary, isLoading }: SummaryCardProps) {
  const { t } = useTranslation('dashboard');
  if (isLoading || !summary) {
    return (
      <Card>
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

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
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

        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Wallet className="h-4 w-4" />
            {t('summary.balance')}
          </div>
          <span
            className={cn(
              'text-lg font-bold tabular-nums',
              saldo >= 0 ? 'text-green-600' : 'text-red-500'
            )}
          >
            {formatToBRL(saldo)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
