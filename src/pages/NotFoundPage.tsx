import { SearchX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StatusPage } from '@/components/StatusPage';

export default function NotFoundPage() {
  const { t } = useTranslation('common');

  return (
    <StatusPage
      code="404"
      title={t('statusPages.notFound.title')}
      description={t('statusPages.notFound.description')}
      icon={<SearchX aria-hidden="true" className="size-7" />}
      homeLabel={t('statusPages.home')}
      backLabel={t('statusPages.back')}
    />
  );
}
