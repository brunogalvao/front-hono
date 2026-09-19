import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatToBRL } from '@/utils/format';
import { TrendingUp } from 'lucide-react';
import { useIncomesByMonth } from '@/hooks/use-incomes-by-month';
import { useTasksByYear } from '@/hooks/use-tasks-by-year';
import { getAbrevMes } from '@/model/mes.enum';
import { TASK_STATUS } from '@/model/tasks.model';
import { useTranslation } from 'react-i18next';

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border-border space-y-1.5 rounded-xl border px-4 py-3 shadow-lg">
      <p className="text-muted-foreground text-xs font-medium">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground text-xs">{entry.name}:</span>
          <span className="text-foreground text-xs font-bold">
            {formatToBRL(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

const FinancialChart = () => {
  const { t } = useTranslation('dashboard');
  const ano = new Date().getFullYear();
  const mesAtual = new Date().getMonth() + 1;

  const { data: incomesByMonth, isLoading: loadingIncomes } =
    useIncomesByMonth();
  const { data: tasksByYear, isLoading: loadingTasks } = useTasksByYear(ano);

  const isLoading = loadingIncomes || loadingTasks;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-56 w-full" />
        </CardContent>
      </Card>
    );
  }

  const allMonthsData = Array.from({ length: 12 }, (_, i) => {
    const mes = i + 1;
    const rendimento = incomesByMonth?.[mes] ?? 0;

    const tasks = tasksByYear?.[mes] ?? [];
    const pagas = tasks
      .filter((t) => t.done === TASK_STATUS.Pago && t.price)
      .reduce((sum, t) => sum + (Number(t.price) || 0), 0);
    const pendentes = tasks
      .filter((t) => t.done === TASK_STATUS.Pendente && t.price)
      .reduce((sum, t) => sum + (Number(t.price) || 0), 0);
    const recorrentes = tasks
      .filter((t) => (t.recorrente || t.fixo_source_id) && t.price)
      .reduce((sum, t) => sum + (Number(t.price) || 0), 0);

    const totalDespesas = pagas + pendentes;
    const disponivel = Math.max(0, rendimento - totalDespesas);

    return {
      month: getAbrevMes(mes),
      income: rendimento,
      expenses: pagas,
      pending: pendentes,
      recurring: recorrentes,
      available: disponivel,
    };
  });

  // Exibe até o último mês que tem algum dado (income, despesa paga ou pendente)
  const lastMonthWithData = allMonthsData.reduce(
    (last, d, i) =>
      d.income > 0 || d.expenses > 0 || d.pending > 0 || d.recurring > 0
        ? i
        : last,
    mesAtual - 1
  );
  const chartData = allMonthsData.slice(0, lastMonthWithData + 1);

  const hasData = chartData.some(
    (d) => d.income > 0 || d.expenses > 0 || d.pending > 0 || d.recurring > 0
  );
  if (!hasData) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-row items-center gap-2 text-lg">
          <TrendingUp className="text-primary h-5 w-5 shrink-0" />
          {t('chart.title', { year: ano })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={256}>
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gradRendimento" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradDespesas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPendentes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradDisponivel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradRecorrente" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              strokeOpacity={0.07}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.55 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.5 }}
              tickFormatter={(v) =>
                v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`
              }
              width={52}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{
                fontSize: '12px',
                paddingTop: '12px',
                opacity: 0.7,
              }}
            />
            <Area
              type="monotone"
              dataKey="income"
              name={t('chart.income')}
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#gradRendimento)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              name={t('chart.expenses')}
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#gradDespesas)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="pending"
              name={t('chart.pending')}
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 3"
              fill="url(#gradPendentes)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="recurring"
              name={t('chart.recurring')}
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="4 2"
              fill="url(#gradRecorrente)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="available"
              name={t('chart.available')}
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#gradDisponivel)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default FinancialChart;
