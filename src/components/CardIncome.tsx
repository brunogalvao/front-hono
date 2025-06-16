import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { Loader } from "lucide-react"; // ou seu loader customizado
import { formatToBRL } from "@/utils/format";
import { getNomeMes } from "@/model/mes.enum";
import type { CardIncomeProps } from "@/model/cardIncome.model";
import { DialogConfirmDelete } from "./DialogConfirmDelete";

function CardIncome({
  incomes,
  loading,
  total,
  setForm,
  setEditingId,
  handleDelete,
}: CardIncomeProps) {
  return (
    <Table>
      {loading ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : (
        <TableCaption className="text-left">
          <div className="flex gap-2 items-center">
            Total
            <span className="font-bold text-lg bg-primary text-white px-3 rounded-full">
              {formatToBRL(total)}
            </span>
          </div>
        </TableCaption>
      )}

      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Nome</TableHead>
          <TableHead className="w-[200px]">Valor</TableHead>
          <TableHead className="w-1/5 text-center">Mês e Ano</TableHead>
          <TableHead className="w-1/5 text-center">Ações</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {incomes.map((incomes) => (
          <TableRow key={incomes.id}>
            <TableCell>{incomes.descricao}</TableCell>
            <TableCell>{formatToBRL(incomes.valor)}</TableCell>
            <TableCell className="text-center">
              {getNomeMes(incomes.mes)} / {incomes.ano}
            </TableCell>

            <TableCell>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setForm({
                      descricao: incomes.descricao ?? "",
                      valor: incomes.valor,
                      mes: incomes.mes,
                      ano: incomes.ano,
                    });
                    setEditingId(incomes.id);
                  }}
                >
                  <Pencil />
                </Button>
                <DialogConfirmDelete
                  description={incomes.descricao ?? "item"}
                  onConfirm={() => handleDelete(incomes.id)}
                >
                  <Button variant="destructive" size="sm">
                    <Trash className="h-4 w-4" />
                  </Button>
                </DialogConfirmDelete>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default CardIncome;
