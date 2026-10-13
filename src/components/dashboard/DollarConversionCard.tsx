import { FaMoneyBill } from 'react-icons/fa6';
import {
  AlertTriangle,
  CircleMinus,
  ExternalLink,
  WalletCards,
  WifiOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatToBRL, formatToUSD } from '@/utils/format';
import { useTranslation } from 'react-i18next';

interface DollarConversionCardProps {
  cotacaoDolar?: number;
  valorLivre?: number;
  marketUpdatedAt?: string | null;
  sourceLabel?: string;
  sourceUrl?: string;
  isLoading?: boolean;
  isError?: boolean;
}

export function DollarConversionCard({
  cotacaoDolar,
  valorLivre,
  marketUpdatedAt,
  sourceLabel,
  sourceUrl,
  isLoading,
  isError,
}: DollarConversionCardProps) {
  const { t, i18n } = useTranslation('dashboard');

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

  if (isError || cotacaoDolar === undefined || cotacaoDolar <= 0) {
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

  const availableAmount = valorLivre ?? 0;
  const convertedAmount =
    availableAmount > 0 ? availableAmount / cotacaoDolar : 0;
  const locale = i18n.resolvedLanguage === 'en' ? 'en-US' : 'pt-BR';
  const parsedUpdatedAt = marketUpdatedAt ? new Date(marketUpdatedAt) : null;
  const formattedUpdatedAt =
    parsedUpdatedAt && !Number.isNaN(parsedUpdatedAt.getTime())
      ? new Intl.DateTimeFormat(locale, {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(parsedUpdatedAt)
      : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-row items-center gap-2 text-lg">
          <FaMoneyBill className="text-primary shrink-0" />
          {t('dollar.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4" aria-live="polite">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs">
              {t('dollar.referenceRate')}
            </p>
            <p className="text-foreground text-lg font-semibold">
              {t('dollar.rateValue', { rate: formatToBRL(cotacaoDolar) })}
            </p>
          </div>
          {formattedUpdatedAt && (
            <p className="text-muted-foreground max-w-32 text-right text-xs">
              {t('dollar.updatedAt', { date: formattedUpdatedAt })}
            </p>
          )}
        </div>

        <div className="bg-muted rounded-lg p-3">
          {availableAmount > 0 ? (
            <div className="flex items-start gap-3">
              <WalletCards className="mt-0.5 size-5 shrink-0 text-emerald-500" />
              <div>
                <p className="text-muted-foreground text-xs">
                  {t('dollar.estimatedEquivalent')}
                </p>
                <p className="text-xl font-semibold text-emerald-600">
                  {formatToUSD(convertedAmount)}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {t('dollar.positiveHint', {
                    available: formatToBRL(availableAmount),
                  })}
                </p>
              </div>
            </div>
          ) : availableAmount < 0 ? (
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-500" />
              <div>
                <p className="text-muted-foreground text-xs">
                  {t('dollar.projectedDeficit')}
                </p>
                <p className="text-xl font-semibold text-red-600">
                  {formatToBRL(Math.abs(availableAmount))}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {t('dollar.negativeHint')}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <CircleMinus className="text-muted-foreground mt-0.5 size-5 shrink-0" />
              <div>
                <p className="font-medium">{t('dollar.noAvailableBalance')}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {t('dollar.zeroHint')}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="text-muted-foreground space-y-1 text-xs">
          <p>{t('dollar.disclaimer')}</p>
          {sourceLabel && sourceUrl && (
            <a
              className="hover:text-foreground inline-flex items-center gap-1 underline underline-offset-2"
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              {t('dollar.source', { source: sourceLabel })}
              <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
