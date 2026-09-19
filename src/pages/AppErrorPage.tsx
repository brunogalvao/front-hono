import { useEffect } from 'react';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StatusPage } from '@/components/StatusPage';
import { reportError } from '@/lib/monitoring';

export default function AppErrorPage({ error, reset }: ErrorComponentProps) {
  const { t } = useTranslation('common');

  useEffect(() => {
    void reportError(error, { source: 'router-error-boundary' });
  }, [error]);

  return (
    <StatusPage
      code="500"
      title={t('statusPages.error.title')}
      description={t('statusPages.error.description')}
      icon={<TriangleAlert aria-hidden="true" className="size-7" />}
      onRetry={reset}
      retryLabel={t('statusPages.error.retry')}
      homeLabel={t('statusPages.home')}
      backLabel={t('statusPages.back')}
    />
  );
}
