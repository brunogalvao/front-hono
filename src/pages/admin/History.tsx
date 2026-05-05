import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { queryKeys } from '@/lib/query-keys';
import TituloPage from '@/components/TituloPage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getNomeMes } from '@/model/mes.enum';
import { TASK_STATUS } from '@/model/tasks.model';
import { formatToBRL } from '@/utils/format';
import { getIncomes } from '@/service/income/getIncome';
import { getTasksByYear } from '@/service/task/getTasksByYear';
import type { IncomeItem } from '@/model/incomes.model';
import type { Task } from '@/model/tasks.model';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MonthSummary {
  mes: number;
  rendimento: number;
  totalDespesas: number;
  pago: number;
  pendente: number;
  saldo: number;
}

function buildSummaries(
  incomes: IncomeItem[],
  tasksByYear: Record<number, Task[]>,
  ano: number
): MonthSummary[] {
  return Array.from({ length: 12 }, (_, i) => {
    const mes = i + 1;

    const rendimento = incomes
      .filter((inc) => inc.mes === mes && inc.ano === ano)
      .reduce((sum, inc) => sum + Number(inc.valor), 0);

    const tasks = tasksByYear[mes] ?? [];

    const pago = tasks
      .filter((t) => t.done === TASK_STATUS.Pago)
      .reduce((sum, t) => sum + Number(t.price ?? 0), 0);

    const pendente = tasks
      .filter((t) => t.done === TASK_STATUS.Pendente)
      .reduce((sum, t) => sum + Number(t.price ?? 0), 0);

    const totalDespesas = pago + pendente;
    const saldo = rendimento - totalDespesas;

    return { mes, rendimento, totalDespesas, pago, pendente, saldo };
  });
}

function StatusBar({ pago, pendente }: { pago: number; pendente: number }) {
  const { t } = useTranslation('history');
  const total = pago + pendente;
  if (total === 0) {
    return <span className="text-muted-foreground text-xs">{t('noExpenses')}</span>;
  }
  const pagoPercent = Math.round((pago / total) * 100);

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${pagoPercent}%` }}
        />
      </div>
      <div className="text-muted-foreground flex justify-between text-xs">
        <span className="text-emerald-500">{t('paidPercent', { pct: pagoPercent })}</span>
        <span className="text-amber-500">{t('pendingPercent', { pct: 100 - pagoPercent })}</span>
      </div>
    </div>
  );
}

function SaldoBadge({ saldo }: { saldo: number }) {
  if (saldo > 0) {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
        {formatToBRL(saldo)}
      </Badge>
    );
  }
  if (saldo < 0) {
    return (
      <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
        {formatToBRL(saldo)}
      </Badge>
    );
  }
  return <Badge variant="secondary">{formatToBRL(saldo)}</Badge>;
}

function HistorySkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

interface DespesasModalProps {
  tasks: Task[];
  mes: number;
  ano: number;
  open: boolean;
  onClose: () => void;
}

function DespesasModal({ tasks, mes, ano, open, onClose }: DespesasModalProps) {
  const { t } = useTranslation('history');
  const total = tasks.reduce((sum, t) => sum + Number(t.price ?? 0), 0);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t('modal.title', { month: getNomeMes(mes), year: ano })}
          </DialogTitle>
        </DialogHeader>

        {tasks.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            {t('noExpensesThisMonth')}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('col.title')}</TableHead>
                <TableHead>{t('col.type')}</TableHead>
                <TableHead>{t('col.amount')}</TableHead>
                <TableHead>{t('col.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map(({ id, title, type, price, done }) => (
                <TableRow key={id}>
                  <TableCell className="font-medium">{title}</TableCell>
                  <TableCell>
                    {type ? (
                      <Badge variant="outline">{type}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>{price != null ? formatToBRL(price) : '—'}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        done === TASK_STATUS.Pago
                          ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                      }
                    >
                      {done}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {tasks.length > 0 && (
          <div className="flex justify-end border-t pt-3">
            <span className="text-muted-foreground text-sm">
              Total:{' '}
              <span className="text-foreground font-semibold">{formatToBRL(total)}</span>
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function History() {
  const { t } = useTranslation('history');
  const currentYear = new Date().getFullYear();
  const [ano, setAno] = useState(currentYear);
  const [selectedMes, setSelectedMes] = useState<number | null>(null);

  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const {
    data: incomes = [],
    isLoading: isLoadingIncomes,
    isError: isErrorIncomes,
  } = useQuery({
    queryKey: queryKeys.incomes.list(),
    queryFn: getIncomes,
  });

  const {
    data: tasksByYear = {},
    isLoading: isLoadingTasks,
    isError: isErrorTasks,
  } = useQuery({
    queryKey: queryKeys.tasks.byYear(ano),
    queryFn: () => getTasksByYear(ano),
  });

  const loading = isLoadingIncomes || isLoadingTasks;
  const isError = isErrorIncomes || isErrorTasks;

  const summaries = useMemo(
    () => buildSummaries(incomes, tasksByYear, ano),
    [incomes, tasksByYear, ano],
  );

  const totalRendimento = useMemo(
    () => summaries.reduce((s, m) => s + m.rendimento, 0),
    [summaries],
  );
  const totalDespesas = useMemo(
    () => summaries.reduce((s, m) => s + m.totalDespesas, 0),
    [summaries],
  );
  const totalPago = useMemo(
    () => summaries.reduce((s, m) => s + m.pago, 0),
    [summaries],
  );
  const totalPendente = useMemo(
    () => summaries.reduce((s, m) => s + m.pendente, 0),
    [summaries],
  );
  const totalSaldo = totalRendimento - totalDespesas;

  return (
    <div className="space-y-6">
      <TituloPage titulo={t('title')} />

      {/* Filtro de Ano */}
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground text-sm font-medium">{t('year')}:</span>
        <Select value={String(ano)} onValueChange={(v) => setAno(Number(v))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isError && (
        <p className="text-sm text-red-500">
          {t('loadError')}
        </p>
      )}

      {/* Cards de Resumo Anual */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {t('totalIncome')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-emerald-500">
              {loading ? <Skeleton className="h-6 w-24" /> : formatToBRL(totalRendimento)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {t('totalExpenses')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-red-500">
              {loading ? <Skeleton className="h-6 w-24" /> : formatToBRL(totalDespesas)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {t('totalPaid')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              {loading ? <Skeleton className="h-6 w-24" /> : formatToBRL(totalPago)}
            </p>
            <p className="text-muted-foreground text-xs">
              {t('pending')}: {loading ? '...' : formatToBRL(totalPendente)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              {t('yearBalance')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <p
                className={`text-lg font-bold ${
                  totalSaldo >= 0 ? 'text-emerald-500' : 'text-red-500'
                }`}
              >
                {formatToBRL(totalSaldo)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabela Mensal */}
      <Card>
        <CardHeader>
          <CardTitle>{t('monthlyTitle', { year: ano })}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <HistorySkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px]">{t('col.month')}</TableHead>
                  <TableHead>{t('col.income')}</TableHead>
                  <TableHead>{t('col.expenses')}</TableHead>
                  <TableHead>{t('col.paid')}</TableHead>
                  <TableHead>{t('col.pending')}</TableHead>
                  <TableHead>{t('col.balance')}</TableHead>
                  <TableHead className="min-w-[160px]">{t('col.status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaries.map(({ mes, rendimento, totalDespesas, pago, pendente, saldo }) => (
                  <TableRow key={mes}>
                    <TableCell className="font-medium">{getNomeMes(mes)}</TableCell>
                    <TableCell className="text-emerald-500">
                      {rendimento > 0 ? (
                        formatToBRL(rendimento)
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {totalDespesas > 0 ? (
                        <button
                          onClick={() => setSelectedMes(mes)}
                          className="text-foreground hover:text-primary cursor-pointer underline-offset-4 hover:underline"
                        >
                          {formatToBRL(totalDespesas)}
                        </button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-emerald-500">
                      {pago > 0 ? (
                        formatToBRL(pago)
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-amber-500">
                      {pendente > 0 ? (
                        formatToBRL(pendente)
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <SaldoBadge saldo={saldo} />
                    </TableCell>
                    <TableCell>
                      <StatusBar pago={pago} pendente={pendente} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Despesas */}
      {selectedMes !== null && (
        <DespesasModal
          tasks={tasksByYear[selectedMes] ?? []}
          mes={selectedMes}
          ano={ano}
          open={selectedMes !== null}
          onClose={() => setSelectedMes(null)}
        />
      )}
    </div>
  );
}

export default History;
