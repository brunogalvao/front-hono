import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
// ui
import TituloPage from '@/components/TituloPage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
// hooks
import { useCreateIncome } from '@/hooks/use-create-income';
import { useEditIncome } from '@/hooks/use-edit-income';
import { useDeleteIncome } from '@/hooks/use-delete-income';
// service
import { totalIncomes } from '@/service/income/totalIncome';
import { getIncomes } from '@/service/income/getIncome';
// model's
import type { IncomeItem } from '@/model/incomes.model';
import { LiquidButton } from '@/components/animate-ui/buttons/liquid';
import { Plus } from '@/components/animate-ui/icons/plus';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { RefreshCcw } from '@/components/animate-ui/icons/refresh-ccw';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/animate-ui/components/tooltip';
import MonthIncome from '@/components/monthIncome';
import { MonthYearPicker } from '@/components/MonthYearPicker';
import { IncomesDataTable } from '@/components/IncomesDataTable';
import {
  IncomeFormSkeleton,
  IncomeListSkeleton,
} from '@/components/SkeletonIncome';
import { queryKeys } from '@/lib/query-keys';

function Income() {
  const { t } = useTranslation(['income', 'common']);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    descricao: '',
    valor: 0,
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
  });

  // Hooks para mutações
  const createIncomeMutation = useCreateIncome();
  const editIncomeMutation = useEditIncome();
  const deleteIncomeMutation = useDeleteIncome();

  // React Query gerencia os dados — sem useEffect manual
  const { data: incomes = [], isLoading, isError } = useQuery({
    queryKey: queryKeys.incomes.list(),
    queryFn: getIncomes,
  });

  const { data: total = 0 } = useQuery({
    queryKey: queryKeys.totals.incomes(),
    queryFn: totalIncomes,
  });

  const handleAddOrEdit = async () => {
    try {
      if (editingId) {
        await editIncomeMutation.mutateAsync({ ...form, id: editingId });
        toast.success(t('toast.updated'));
      } else {
        await createIncomeMutation.mutateAsync(form);
        toast.success(t('toast.created'));
      }

      setForm({
        descricao: '',
        valor: 0,
        mes: new Date().getMonth() + 1,
        ano: new Date().getFullYear(),
      });
      setEditingId(null);
    } catch (err) {
      console.error('Erro ao salvar:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : 'Erro desconhecido';

      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteIncomeMutation.mutateAsync(id);
      toast.success(t('toast.deleted'));
    } catch (err) {
      console.error('Erro ao deletar:', err);

      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
            ? err
            : t('toast.deleteError');

      toast.error(errorMessage);
    }
  };

  const handleEdit = (income: IncomeItem) => {
    setForm({
      descricao: income.descricao ?? '',
      valor: income.valor,
      mes: income.mes,
      ano: income.ano,
    });
    setEditingId(income.id);
  };

  return (
    <div className="space-y-6">
      <TituloPage titulo={t('title')} />

      {isLoading ? (
        <IncomeFormSkeleton />
      ) : (
        <>
          <MonthIncome
            onSelectMes={(mes) => setForm((f) => ({ ...f, mes }))}
            total={total}
          />

          <div className="flex flex-col space-y-6">
            <div className="flex flex-row gap-3">
              <div className="flex w-full flex-col space-y-3">
                <Label>{t('description')}</Label>
                <Input
                  className="w-full"
                  placeholder={t('description')}
                  value={form.descricao}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, descricao: e.target.value }))
                  }
                />
              </div>

              <div className="flex w-full flex-col space-y-3">
                <Label>{t('amount')}</Label>
                <NumericFormat
                  value={form.valor}
                  onValueChange={({ floatValue }) => {
                    setForm((f) => ({ ...f, valor: floatValue ?? 0 }));
                  }}
                  thousandSeparator="."
                  decimalSeparator=","
                  prefix="R$ "
                  decimalScale={2}
                  allowNegative={false}
                  fixedDecimalScale={false}
                  customInput={Input}
                />
              </div>

              <div className="flex w-full flex-col space-y-3">
                <Label>{t('monthYear')}</Label>
                <MonthYearPicker
                  mes={form.mes}
                  ano={form.ano}
                  onChange={(mes, ano) => setForm((f) => ({ ...f, mes, ano }))}
                />
              </div>
              <div className="flex items-end">
                <AnimateIcon animateOnHover>
                  <LiquidButton
                    className="text-white"
                    onClick={handleAddOrEdit}
                  >
                    <div className="flex flex-row items-center gap-3 px-12">
                      {editingId ? (
                        <>
                          {t('common:update')}
                          <RefreshCcw />
                        </>
                      ) : (
                        <>
                          {t('common:add')}
                          <Plus className="size-5" />
                        </>
                      )}
                    </div>
                  </LiquidButton>
                </AnimateIcon>
              </div>
            </div>
          </div>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('listTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <IncomeListSkeleton />
          ) : isError ? (
            <p className="text-center text-sm text-red-500">
              {t('loadError')}
            </p>
          ) : incomes.length <= 0 ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <p className="cursor-pointer p-0 text-center text-sm text-zinc-500">
                    {t('noIncome')}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  {t('noIncomeTooltip')}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <IncomesDataTable
              data={incomes}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Income;
