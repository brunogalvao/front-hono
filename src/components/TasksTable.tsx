import { useState } from "react";
// ui
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import StatusDropdown from "./StatusDropdown";
// service
import { editTask } from "@/service/task/editTask";
import { deleteTask } from "@/service/task/deleteTask";
// model
import type { Task } from "@/model/tasks.model";
// icons
import { AiFillDelete } from "react-icons/ai";
import { MdModeEditOutline } from "react-icons/md";
import { formatToBRL } from "@/utils/format";

import { NumericFormat } from "react-number-format";

type Props = {
  tasks: Task[];
  total: number;
  onTasksChange: () => void;
  totalPrice: number;
};

export function TasksTable({ tasks, totalPrice, total, onTasksChange }: Props) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setPrice(task.price?.toString() ?? "");
    setDialogOpen(true);
    setDone(task.done);
  };

  const handleSave = async () => {
    if (editingTask) {
      try {
        const updated = await editTask(editingTask.id, {
          title,
          done,
          price: price ? Number(price) : null,
        });
        console.log("🟢 Editado com sucesso:", updated);
        setEditingTask(null);
        // Fecha o dialog
        setDialogOpen(false);
        // Atualiza a tabela
        onTasksChange();
      } catch (err) {
        console.error("❌ Erro ao editar:", err);
      }
    }
  };

  const handleDelete = async (id: string) => {
    setIsSubmitting(true);
    try {
      await deleteTask(id);
      // Atualiza a tabela
      onTasksChange();
      setIsSubmitting(false);
    } catch (err) {
      console.error("❌ Erro ao deletar:", err);
    }
  };

  return (
    <Table>
      <TableCaption>
        <div className="flex flex-1 justify-between">
          <span className="flex gap-3">Total de Tarefas {total}</span>

          <span className="flex gap-3">Total{formatToBRL(totalPrice)}</span>
        </div>
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Título</TableHead>
          <TableHead className="text-start">Preço</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-center">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell className="w-[50%]">{task.title}</TableCell>
            <TableCell>{formatToBRL(task.price ?? 0)}</TableCell>
            <TableCell>
              <div className="flex justify-center">
                <StatusDropdown task={task} onStatusChanged={onTasksChange} />
              </div>
            </TableCell>
            <TableCell className="flex gap-2 justify-center">
              {/* Editar */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex gap-3"
                    onClick={() => handleEditClick(task)}
                  >
                    <MdModeEditOutline />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar Tarefa</DialogTitle>
                    <DialogDescription>
                      Edite suas informações do item.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-row space-x-2">
                    <div className="flex flex-col space-y-2">
                      <Label>Titulo</Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Label>Preço</Label>
                      <NumericFormat
                        value={price}
                        onValueChange={(values) => {
                          setPrice(String(values.floatValue ?? ""));
                        }}
                        thousandSeparator="."
                        decimalSeparator=","
                        prefix="R$ "
                        decimalScale={2}
                        allowNegative={false}
                        fixedDecimalScale={false} // 👈 isso remove zeros fixos no final
                        customInput={Input}
                      />
                    </div>

                    <div className="flex flex-col space-y-3">
                      <Label>Status</Label>
                      <Switch checked={done} onCheckedChange={setDone} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSave}>Salvar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Deletar */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex gap-3">
                    {/* Deletar */}
                    <AiFillDelete />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Deseja realmente deletar?
                    </AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(task.id)}
                      disabled={isSubmitting}
                    >
                      Confirmar
                      {isSubmitting ? "Deletando..." : "Confirmar"}
                    </AlertDialogAction>

                    {/* <Button onClick={handleSubmit} disabled={isSubmitting}>
                      {isSubmitting ? "Salvando..." : "Salvar"}
                    </Button> */}
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
