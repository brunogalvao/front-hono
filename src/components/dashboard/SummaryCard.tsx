import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { DashboardSummary } from '@/hooks/useDashboard';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  summary?: DashboardSummary;
  isLoading?: boolean;
}

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export function SummaryCard({ title, summary, isLoading }: SummaryCardProps) {
  if (isLoading || !summary) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-green-500" />
            Receitas
          </div>
          <span className="font-semibold text-green-600">{formatBRL(total_receitas)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingDown className="h-4 w-4 text-red-500" />
            Despesas
          </div>
          <span className="font-semibold text-red-500">{formatBRL(total_despesas)}</span>
        </div>

        <div className="border-t pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Wallet className="h-4 w-4" />
            Saldo
          </div>
          <span className={cn('font-bold text-lg tabular-nums', saldo >= 0 ? 'text-green-600' : 'text-red-500')}>
            {formatBRL(saldo)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
