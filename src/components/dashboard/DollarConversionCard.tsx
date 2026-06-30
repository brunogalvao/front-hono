import { FaMoneyBill } from 'react-icons/fa6';
import { MdTipsAndUpdates } from 'react-icons/md';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatToBRL, formatToUSD } from '@/utils/format';

interface DollarConversionCardProps {
  cotacaoDolar?: number;
  quantidadeDolar?: number;
  valorLivre?: number;
  isLoading?: boolean;
}

export function DollarConversionCard({
  cotacaoDolar,
  quantidadeDolar,
  valorLivre,
  isLoading,
}: DollarConversionCardProps) {
  if (isLoading || cotacaoDolar === undefined) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Conversão em Dólar</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-primary flex flex-row items-center gap-2 text-lg">
          <FaMoneyBill />
          Conversão em Dólar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Cotação atual:</p>
            <p className="text-xl font-semibold text-emerald-600">
              {formatToBRL(cotacaoDolar)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-sm">Valor livre:</p>
            <p className="text-xl font-semibold text-emerald-600">
              {formatToBRL(valorLivre ?? 0)}
            </p>
          </div>
        </div>
        <div className="bg-muted mt-4 rounded-lg p-3">
          <p className="text-muted-foreground flex flex-row items-center gap-2 text-sm">
            <MdTipsAndUpdates className="shrink-0 text-amber-500" />
            <span>
              Você pode converter{' '}
              <span className="font-semibold text-blue-600">{formatToUSD(quantidadeDolar ?? 0)}</span>
              {' '}com o valor livre de {formatToBRL(valorLivre ?? 0)} na cotação de{' '}
              {formatToBRL(cotacaoDolar)}.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
