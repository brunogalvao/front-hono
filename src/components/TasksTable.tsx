import { useEffect, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import StatusDropdown from "./StatusDropdown";
// service
import { editTask } from "@/service/task/editTask";
import { deleteTask } from "@/service/task/deleteTask";
// model
import { TaskStatus, type Task, type TaskTable } from "@/model/tasks.model";
// icons
import { AiFillDelete } from "react-icons/ai";
import { MdModeEditOutline } from "react-icons/md";
import { formatToBRL } from "@/utils/format";

import { NumericFormat } from "react-number-format";
import { DialogConfirmDelete } from "./DialogConfirmDelete";
import { AnimateIcon } from "./animate-ui/icons/icon";
import { Loader } from "./animate-ui/icons/loader";
import { getExpenseTypes } from "@/service/expense-types/getExpenseTypes";

export function TasksTable({
  tasks,
  totalPrice,
  total,
  onTasksChange,
}: TaskTable) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [done, setDone] = useState<TaskStatus>(TaskStatus.Pending);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState("");
  const [allTypes, setAllTypes] = useState<string[]>([]);

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setPrice(task.price?.toString() ?? "");
    setType(task.type ?? "");
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
          type,
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

  return (
    <Table>
      <TableCaption>
        <div className="flex flex-1 justify-between">
          {/* paginação */}
          <span className="flex gap-3">Total de Tarefas {total}</span>

          <div className="flex gap-2 items-center w-1/2">
            <span>Total</span>
            <span className="font-bold text-base bg-primary text-white px-1 rounded">
              {formatToBRL(totalPrice)}
            </span>
          </div>
        </div>
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Título</TableHead>
          <TableHead className="text-start">Preço</TableHead>
          <TableHead className="text-start">Tipo</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-center">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell className="w-[50%]">{task.title}</TableCell>
            <TableCell>{formatToBRL(task.price ?? 0)}</TableCell>
            <TableCell>{task.type}</TableCell>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-2">
                      <Label>Título</Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Título da tarefa"
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
                        fixedDecimalScale={false}
                        customInput={Input}
                      />
                    </div>

                    <div className="flex flex-col space-y-2 col-span-2">
                      <div className="flex flex-1 flex-row gap-2">
                        <div className="flex flex-col w-[80%] space-y-2">
                          <Label>Tipo</Label>
                          <Input
                            placeholder="Digite ou selecione um tipo"
                            list="expense-types"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                          />
                          <datalist id="expense-types">
                            {allTypes.map((t) => (
                              <option key={t} value={t} />
                            ))}
                          </datalist>
                        </div>

                        <div className="flex flex-col space-y-2 col-span-2 ">
                          <Label>Status</Label>
                          <Switch
                            className="mt-2"
                            checked={done === TaskStatus.Completed}
                            onCheckedChange={(checked) =>
                              setDone(
                                checked
                                  ? TaskStatus.Completed
                                  : TaskStatus.Pending,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button onClick={handleSave}>Salvar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Deletar */}
              <DialogConfirmDelete
                description={task.title ?? ""}
                onConfirm={() => handleDelete(task.id)}
              >
                <Button
                  variant="destructive"
                  className="flex gap-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <AnimateIcon animateOnHover>
                        <Loader />
                      </AnimateIcon>
                    </>
                  ) : (
                    <AiFillDelete />
                  )}
                </Button>
              </DialogConfirmDelete>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
