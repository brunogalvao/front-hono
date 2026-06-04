import { AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { InsightCard } from './InsightCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Insight } from '@/hooks/useInsights';

interface InsightsPanelProps {
  title: string;
  insights?: Insight[];
  isLoading?: boolean;
  error?: Error | null;
}

export function InsightsPanel({ title, insights, isLoading, error }: InsightsPanelProps) {
  const { t } = useTranslation('insights');
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Loader2 className={isLoading ? 'h-4 w-4 animate-spin' : 'hidden'} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          <>
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </>
        )}

        {error && !isLoading && (
          <div className="text-muted-foreground flex items-center gap-2 py-4 text-sm">
            <AlertCircle className="h-4 w-4 text-destructive" />
            {t('error')}
          </div>
        )}

        {!isLoading && !error && insights && insights.length === 0 && (
          <p className="text-muted-foreground py-4 text-sm text-center">
            {t('empty')}
          </p>
        )}

        {!isLoading && !error && insights && insights.map((insight, i) => (
          <InsightCard key={i} insight={insight} />
        ))}
      </CardContent>
    </Card>
  );
}
