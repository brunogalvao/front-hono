import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NumericFormat } from 'react-number-format';
import { TypeSelector } from '@/components/TypeSelector';
import { getExpenseTypes } from '@/service/expense-types/getExpenseTypes';
import { useEditParcela } from '@/hooks/use-parcelas';
import { Loader } from 'lucide-react';
import { toast } from 'sonner';
import type { ParcelaGroup } from '@/model/parcelas.model';

interface EditParcelaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parcela: ParcelaGroup;
}

export function EditParcelaDialog({
  open,
  onOpenChange,
  parcela,
}: EditParcelaDialogProps) {
  const [allTypes, setAllTypes] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: parcela.title,
    total: parcela.valor_total as string | number,
    type: parcela.type ?? '',
  });

  const editMutation = useEditParcela();

  useEffect(() => {
    if (open) {
      setForm({
        title: parcela.title,
        total: parcela.valor_total,
        type: parcela.type ?? '',
      });
    }
  }, [open, parcela]);

  useEffect(() => {
    getExpenseTypes()
      .then((types) => setAllTypes(types.map((t) => t.name)))
      .catch(console.error);
  }, []);

  const totalNum = Number(form.total);
  const valorParcela =
    totalNum > 0 && parcela.parcela_total > 0
      ? totalNum / parcela.parcela_total
      : null;

  const isValid = String(form.title).trim().length > 0 && totalNum > 0;

  const handleSubmit = async () => {
    if (!isValid || valorParcela === null) return;
    try {
      await editMutation.mutateAsync({
        parcela_group_id: parcela.parcela_group_id,
        payload: {
          title: form.title.trim(),
          type: form.type || undefined,
          price: valorParcela,
        },
      });
      toast.success('Compra parcelada atualizada!');
      onOpenChange(false);
    } catch {
      toast.error('Erro ao atualizar compra parcelada.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Compra Parcelada</DialogTitle>
          <DialogDescription>
            Alterações serão aplicadas a todas as parcelas deste grupo.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-5">
          <div className="flex flex-col space-y-2">
            <Label className="text-base font-medium">Descrição</Label>
            <Input
              placeholder="Ex: iPhone 16, Notebook, etc."
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="h-12 text-base"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Label className="text-base font-medium">Valor total</Label>
            <NumericFormat
              value={form.total}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, total: v.floatValue ?? '' }))
              }
              thousandSeparator="."
              decimalSeparator=","
              prefix="R$ "
              decimalScale={2}
              allowNegative={false}
              fixedDecimalScale={false}
              customInput={Input}
              className="h-12 text-base"
              placeholder="0,00"
              autoComplete="off"
            />
            {valorParcela !== null && (
              <span className="text-muted-foreground text-xs">
                ≈ R$ {valorParcela.toFixed(2).replace('.', ',')} / parcela ({parcela.parcela_total}x)
              </span>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <Label className="text-base font-medium">Categoria</Label>
            <div className="bg-background min-h-12 rounded-md border p-4">
              <TypeSelector
                value={form.type}
                onChange={(v) => setForm((p) => ({ ...p, type: v }))}
                allTypes={allTypes}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 px-6"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || editMutation.isPending}
            className="h-11 px-8"
          >
            {editMutation.isPending ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
