import { useState } from 'react';
import { MonthNavigator } from '@/components/dashboard/MonthNavigator';
import { InsightsPanel } from '@/components/insights/InsightsPanel';
import { useInsights } from '@/hooks/useInsights';
import { useWorkspace } from '@/context/WorkspaceContext';

export default function InsightsPage() {
  const { activeWorkspaceId } = useWorkspace();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const { workspaceInsights, individualInsights } = useInsights(activeWorkspaceId, month, year);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Insights de IA</h1>
          <p className="text-muted-foreground text-sm">
            Análise inteligente dos seus gastos gerada por IA
          </p>
        </div>
        <MonthNavigator month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <InsightsPanel
          title="Insights do Workspace"
          insights={workspaceInsights.data}
          isLoading={workspaceInsights.isLoading}
          error={workspaceInsights.error}
        />
        <InsightsPanel
          title="Meus Insights"
          insights={individualInsights.data}
          isLoading={individualInsights.isLoading}
          error={individualInsights.error}
        />
      </div>
    </div>
  );
}
