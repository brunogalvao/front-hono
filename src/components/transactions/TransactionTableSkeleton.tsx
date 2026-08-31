import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  MobileRecordList,
  MobileRecordListItem,
} from '@/components/ui/mobile-record-list';
import { useTranslation } from 'react-i18next';

export function TransactionTableSkeleton() {
  const { t } = useTranslation('transactions');

  return (
    <>
      <MobileRecordList className="md:hidden" aria-label={t('table.loading')}>
        {Array.from({ length: 4 }).map((_, index) => (
          <MobileRecordListItem key={index} className="space-y-3">
            <div className="flex justify-between gap-3">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="flex justify-between gap-3">
              <Skeleton className="h-11 w-24 rounded-full" />
              <Skeleton className="h-11 w-24" />
            </div>
          </MobileRecordListItem>
        ))}
      </MobileRecordList>
      <div
        data-slot="collection-loading desktop-table"
        className="hidden rounded-md border md:block"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12" />
              <TableHead>{t('table.name')}</TableHead>
              <TableHead className="hidden sm:table-cell">
                {t('table.colType')}
              </TableHead>
              <TableHead>{t('table.colStatus')}</TableHead>
              <TableHead>{t('table.colAmount')}</TableHead>
              <TableHead className="hidden w-20 sm:table-cell" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-10 w-10 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Skeleton className="h-5 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Skeleton className="h-8 w-16" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
