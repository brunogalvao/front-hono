import { FaMoneyBill } from 'react-icons/fa6';
import { MdTipsAndUpdates } from 'react-icons/md';
import { WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatToBRL, formatToUSD } from '@/utils/format';
import { useTranslation } from 'react-i18next';

interface DollarConversionCardProps {
  cotacaoDolar?: number;
  quantidadeDolar?: number;
  valorLivre?: number;
  isLoading?: boolean;
  isError?: boolean;
}

export function DollarConversionCard({
  cotacaoDolar,
  quantidadeDolar,
  valorLivre,
  isLoading,
  isError,
}: DollarConversionCardProps) {
  const { t } = useTranslation('dashboard');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('dollar.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError || cotacaoDolar === undefined) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('dollar.title')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-2 py-6 text-center">
          <WifiOff className="text-muted-foreground h-8 w-8" />
          <p className="text-muted-foreground text-sm">
            {t('dollar.unavailable')}
          </p>
          <p className="text-muted-foreground text-xs">
            {t('dollar.unavailableHint')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-row items-center gap-2 text-lg">
          <FaMoneyBill className="text-primary shrink-0" />
          {t('dollar.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">
              {t('dollar.currentRate')}
            </p>
            <p className="text-xl font-semibold text-emerald-600">
              {formatToBRL(cotacaoDolar)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-sm">
              {t('dollar.availableAmount')}
            </p>
            <p className="text-xl font-semibold text-emerald-600">
              {formatToBRL(valorLivre ?? 0)}
            </p>
          </div>
        </div>
        <div className="bg-muted mt-4 rounded-lg p-3">
          <p className="text-muted-foreground flex flex-row items-center gap-2 text-sm">
            <MdTipsAndUpdates className="shrink-0 text-amber-500" />
            <span>
              {t('dollar.conversionHint', {
                usd: formatToUSD(quantidadeDolar ?? 0),
                available: formatToBRL(valorLivre ?? 0),
                rate: formatToBRL(cotacaoDolar),
              })}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
