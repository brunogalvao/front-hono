import { useState, useEffect, useCallback, memo, useMemo } from "react";
import type { Task, TaskStatus } from "@/model/tasks.model";
import { TASK_STATUS } from "@/model/tasks.model";
import { editTask } from "@/service/task/editTask";
import { deleteTask } from "@/service/task/deleteTask";
import { getExpenseTypes } from "@/service/expense-types/getExpenseTypes";
import { z } from "zod";
import { taskSchema } from "@/schema/taskSchema";

// ui
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { TypeSelector } from "./TypeSelector";
import StatusDropdown from "./StatusDropdown";

// icons
import { Pencil, Trash, Loader } from "lucide-react";

interface TaskTable {
  tasks: Task[];
  totalPrice: number;
  total: number;
  onTasksChange: () => void;
}

export const TasksTable = memo(function TasksTable({
  tasks,
  totalPrice,
  onTasksChange,
}: TaskTable) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [done, setDone] = useState<TaskStatus>(TASK_STATUS.Pendente);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState("");
  const [allTypes, setAllTypes] = useState<string[]>([]);
  const [form, setForm] = useState({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
  });

  const handleEditClick = useCallback((task: Task) => {
    setEditingTask(task);

    // Atualiza o título da tarefa
    setTitle(task.title ?? "");

    // Converte o preço para string de forma segura
    setPrice(
      task.price !== null && task.price !== undefined
        ? task.price.toString()
        : "",
    );

    // Garante um tipo mesmo se estiver undefined
    setType(task.type ?? "");

    // Define o status da tarefa
    setDone(task.done);

    setForm({
      mes: task.mes,
      ano: task.ano,
    });

    // Abre o modal de edição
    setDialogOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (editingTask) {
      try {
        const updated = await editTask(editingTask.id, {
          title,
          done,
          price: price ? Number(price) : null,
          type,
          mes: form.mes,
          ano: form.ano,
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
  }, [editingTask, title, done, price, type, form, onTasksChange]);

  const handleDelete = useCallback(async (id: string) => {
    setIsSubmitting(true);
    try {
      await deleteTask(id);

      // Atualiza a tabela
      onTasksChange();

      // Atualiza a lista de tipos
      const types = await getExpenseTypes();
      setAllTypes(types.map((t) => t.name));
    } catch (err) {
      console.error("❌ Erro ao deletar:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [onTasksChange]);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const types = await getExpenseTypes();
        console.log("✅ Tipos carregados:", types);
        setAllTypes(types.map((t) => t.name)); // ou t.nome se não fez o mapeamento na API
      } catch (err) {
        console.error("Erro ao carregar tipos de gasto:", err);
      }
    };

    fetchTypes();
  }, []);

  // Memoiza a validação do formulário
  const formErrors = useMemo(() => {
    try {
      taskSchema.parse({
        title,
        price: price ? Number(price) : null,
        type,
        done,
        mes: form.mes,
        ano: form.ano,
      });
      return {};
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            errors[err.path[0] as string] = err.message;
          }
        });
        return errors;
      }
      return {};
    }
  }, [title, price, type, done, form]);

  const isFormValid = Object.keys(formErrors).length === 0;

  return (
    <div className="space-y-4">
      <Table>
        <TableCaption className="text-end">
          {tasks.length} Tarefas - Total: R$ {totalPrice.toFixed(2)}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]" scope="col">
              Título
            </TableHead>
            <TableHead scope="col">Tipo</TableHead>
            <TableHead scope="col">Preço</TableHead>
            <TableHead scope="col">Status</TableHead>
            <TableHead scope="col">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>{task.type || "Sem tipo"}</TableCell>
              <TableCell>
                {task.price ? `R$ ${task.price.toFixed(2)}` : "Sem preço"}
              </TableCell>
              <TableCell>
                <StatusDropdown 
                  task={task} 
                  onStatusChanged={onTasksChange}
                />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(task)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Editar Tarefa</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="title" className="text-right">
                            Título
                          </Label>
                          <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="price" className="text-right">
                            Preço
                          </Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="type" className="text-right">
                            Tipo
                          </Label>
                          <div className="col-span-3">
                            <TypeSelector
                              value={type}
                              onChange={setType}
                              allTypes={allTypes}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="status" className="text-right">
                            Status
                          </Label>
                          <Select
                            value={done}
                            onValueChange={(value) =>
                              setDone(value as TaskStatus)
                            }
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={TASK_STATUS.Pendente}>
                                Pendente
                              </SelectItem>
                              <SelectItem value={TASK_STATUS.Pago}>
                                Pago
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleSave}
                          disabled={!isFormValid || isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader className="mr-2 h-4 w-4 animate-spin" />
                              Salvando...
                            </>
                          ) : (
                            "Salvar"
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(task.id)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});
