'use client';

import * as React from 'react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import type { IncomeItem } from '@/model/incomes.model';
import { formatToBRL } from '@/utils/format';
import { getNomeMes } from '@/model/mes.enum';
import { Pencil, Trash } from 'lucide-react';
import { DialogConfirmDelete } from './DialogConfirmDelete';

export type Income = IncomeItem & {
  onEdit?: (income: IncomeItem) => void;
  onDelete?: (id: string) => void;
};

interface IncomesDataTableProps {
  data: IncomeItem[];
  onEdit: (income: IncomeItem) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

// Componente Skeleton para a tabela de rendimentos
const IncomesDataTableSkeleton = () => (
  <div className="w-full space-y-4">
    {/* Header com filtro e dropdown */}
    <div className="flex items-center py-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="ml-auto h-10 w-32" />
    </div>

    {/* Tabela */}
    <div className="rounded-md border">
      <div className="bg-muted/50 border-b px-4 py-3">
        <div className="grid grid-cols-5 gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <div className="divide-y">
        {[1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="px-4 py-3">
            <div className="grid grid-cols-5 gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Footer com paginação */}
    <div className="flex items-center justify-end space-x-2 py-4">
      <Skeleton className="h-4 w-32 flex-1" />
      <div className="space-x-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  </div>
);

export const columns: ColumnDef<Income>[] = [
  {
    accessorKey: 'descricao',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('descricao')}</div>
    ),
  },
  {
    accessorKey: 'valor',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Valor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const valor = parseFloat(row.getValue('valor'));
      return <div className="font-medium">{formatToBRL(valor)}</div>;
    },
  },
  {
    accessorKey: 'mes',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Mês
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const mes = row.getValue('mes') as number;
      const ano = row.getValue('ano') as number;
      return (
        <div>
          {getNomeMes(mes)} / {ano}
        </div>
      );
    },
  },
  {
    accessorKey: 'ano',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Ano
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const ano = row.getValue('ano') as number;
      return <div className="font-medium">{ano}</div>;
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    header: 'Ações',
    cell: ({ row }) => {
      const income = row.original;

      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => income.onEdit?.(income)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <DialogConfirmDelete
            description={income.descricao ?? 'item'}
            onConfirm={() => income.onDelete?.(income.id)}
          >
            <Button variant="destructive" size="sm">
              <Trash className="h-4 w-4" />
            </Button>
          </DialogConfirmDelete>
        </div>
      );
    },
  },
];

export function IncomesDataTable({
  data,
  onEdit,
  onDelete,
  isLoading,
}: IncomesDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  // Adiciona as funções de callback aos dados
  const dataWithCallbacks = React.useMemo(() => {
    return data.map((item) => ({
      ...item,
      onEdit,
      onDelete,
    }));
  }, [data, onEdit, onDelete]);

  const table = useReactTable({
    data: dataWithCallbacks,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  if (isLoading) {
    return <IncomesDataTableSkeleton />;
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar por nome..."
          value={
            (table.getColumn('descricao')?.getFilterValue() as string) ?? ''
          }
          onChange={(event) =>
            table.getColumn('descricao')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Colunas <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value: boolean) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id === 'descricao'
                      ? 'Nome'
                      : column.id === 'valor'
                        ? 'Valor'
                        : column.id === 'mes'
                          ? 'Mês'
                          : column.id === 'ano'
                            ? 'Ano'
                            : column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {cell.getIsPlaceholder()
                        ? null
                        : flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredRowModel().rows.length} linha(s) encontrada(s).
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Próximo
          </Button>
        </div>
      </div>
    </div>
  );
}
