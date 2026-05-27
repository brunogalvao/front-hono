import { Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Insight } from '@/hooks/useInsights';

export function InsightCard({ insight }: { insight: Insight }) {
  return (
    <Card className="border-primary/20">
      <CardContent className="flex gap-3 p-4">
        <Lightbulb className="text-primary mt-0.5 h-5 w-5 shrink-0" />
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">{insight.category}</Badge>
          </div>
          <p className="text-sm font-medium">{insight.observation}</p>
          <p className="text-muted-foreground text-sm">{insight.suggestion}</p>
        </div>
      </CardContent>
    </Card>
  );
}
