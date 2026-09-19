import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SuspenseWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

// Componente de loading padrão
function DefaultLoading() {
  const { t } = useTranslation('common');
  return (
    <div className="flex items-center justify-center p-8">
      <Loader className="h-8 w-8 animate-spin" />
      <span className="ml-2">{t('loading')}</span>
    </div>
  );
}

// Componente Suspense wrapper
export function SuspenseWrapper({
  children,
  fallback = <DefaultLoading />,
}: SuspenseWrapperProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
