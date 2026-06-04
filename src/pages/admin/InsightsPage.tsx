import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MonthNavigator } from '@/components/dashboard/MonthNavigator';
import { InsightsPanel } from '@/components/insights/InsightsPanel';
import { useInsights } from '@/hooks/useInsights';
import { useWorkspace } from '@/context/WorkspaceContext';

export default function InsightsPage() {
  const { t } = useTranslation('insights');
  const { activeWorkspaceId } = useWorkspace();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const { workspaceInsights, individualInsights } = useInsights(activeWorkspaceId, month, year);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
        </div>
        <MonthNavigator month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <InsightsPanel
          title={t('workspacePanel')}
          insights={workspaceInsights.data}
          isLoading={workspaceInsights.isLoading}
          error={workspaceInsights.error}
        />
        <InsightsPanel
          title={t('individualPanel')}
          insights={individualInsights.data}
          isLoading={individualInsights.isLoading}
          error={individualInsights.error}
        />
      </div>
    </div>
  );
}
