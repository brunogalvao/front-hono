import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useParcelas, useDeleteParcela } from '@/hooks/use-parcelas';
import { queryKeys } from '@/lib/query-keys';
import TituloPage from '@/components/TituloPage';
import { AddParcelaDialog } from '@/components/AddParcelaDialog';
import { EditParcelaDialog } from '@/components/EditParcelaDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatToBRL } from '@/utils/format';
import { getNomeMes } from '@/model/mes.enum';
import type { ParcelaGroup } from '@/model/parcelas.model';
import { CreditCard, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type StatusFilter = 'Todos' | 'Ativo' | 'Quitada';

function ProgressBar({ pagas, total }: { pagas: number; total: number }) {
  const pct = total > 0 ? Math.round((pagas / total) * 100) : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="bg-muted h-1.5 w-full min-w-24 overflow-hidden rounded-full">
        <div
          className="bg-primary h-1.5 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-muted-foreground text-xs">
        {pagas}/{total} parcelas
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: ParcelaGroup['status'] }) {
  return (
    <Badge
      className={
        status === 'Quitada'
          ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
          : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
      }
    >
      {status}
    </Badge>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

function Parcelas() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<StatusFilter>('Todos');
  const [editingParcela, setEditingParcela] = useState<ParcelaGroup | null>(null);
  const [deletingParcela, setDeletingParcela] = useState<ParcelaGroup | null>(null);
  const deleteMutation = useDeleteParcela();

  const { data: parcelas = [], isLoading } = useParcelas();

  const ativas = parcelas.filter((p) => p.status === 'Ativo');
  const quitadas = parcelas.filter((p) => p.status === 'Quitada');
  const filtered =
    filter === 'Todos' ? parcelas : parcelas.filter((p) => p.status === filter);

  const totalEmAberto = ativas.reduce(
    (sum, p) => sum + p.valor_parcela * (p.parcela_total - p.parcelas_pagas),
    0,
  );

  const handleCreated = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.parcelas.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
  };

  return (
    <div className="space-y-6">
      <TituloPage
        titulo="Compras a Prazo"
        subtitulo="Acompanhe suas compras parceladas"
      />

      {/* Header: total em aberto + botão */}
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          {!isLoading && ativas.length > 0 && (
            <span>
              Em aberto:{' '}
              <span className="text-foreground font-semibold">
                {formatToBRL(totalEmAberto)}
              </span>{' '}
              restantes
            </span>
          )}
        </div>
        <AddParcelaDialog onCreated={handleCreated} />
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {(
          [
            { key: 'Todos' as const, label: `Todos (${parcelas.length})` },
            { key: 'Ativo' as const, label: `Ativo (${ativas.length})` },
            { key: 'Quitada' as const, label: `Quitada (${quitadas.length})` },
          ]
        ).map(({ key, label }) => (
          <Button
            key={key}
            variant={filter === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Compras Parceladas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <CreditCard className="text-muted-foreground mx-auto mb-3 h-10 w-10 opacity-30" />
              <p className="text-muted-foreground text-sm">
                Nenhuma compra parcelada encontrada.
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Clique em "Adicionar" para registrar uma nova compra parcelada.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Parcela</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((group) => (
                  <TableRow key={group.parcela_group_id}>
                    <TableCell className="font-medium">{group.title}</TableCell>
                    <TableCell>
                      {group.type ? (
                        <Badge variant="outline">{group.type}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatToBRL(group.valor_parcela)}
                      <span className="text-muted-foreground block text-xs font-normal">
                        /mês
                      </span>
                    </TableCell>
                    <TableCell>
                      <ProgressBar
                        pagas={group.parcelas_pagas}
                        total={group.parcela_total}
                      />
                    </TableCell>
                    <TableCell>{formatToBRL(group.valor_total)}</TableCell>
                    <TableCell>
                      {getNomeMes(group.mes_inicio)} {group.ano_inicio}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={group.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingParcela(group)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingParcela(group)}
                          className="text-destructive hover:text-destructive h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {editingParcela && (
        <EditParcelaDialog
          open={!!editingParcela}
          onOpenChange={(open) => { if (!open) setEditingParcela(null); }}
          parcela={editingParcela}
        />
      )}

      <AlertDialog
        open={!!deletingParcela}
        onOpenChange={(open) => { if (!open) setDeletingParcela(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Arquivar compra parcelada?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deletingParcela?.title}" e todas as suas{' '}
              {deletingParcela?.parcela_total} parcelas serão arquivadas. Essa
              ação pode ser revertida diretamente no banco de dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={async () => {
                if (!deletingParcela) return;
                try {
                  await deleteMutation.mutateAsync(deletingParcela.parcela_group_id);
                  toast.success('Compra parcelada arquivada.');
                } catch {
                  toast.error('Erro ao arquivar compra parcelada.');
                } finally {
                  setDeletingParcela(null);
                }
              }}
            >
              Arquivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Parcelas;
