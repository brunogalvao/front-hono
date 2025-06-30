export type Task = {
  id: string;
  title: string;
  price: number | null;
  done: TaskStatus;
  created_at?: string;
  type?: string;
};

export type TaskTable = {
  tasks: Task[];
  total: number;
  onTasksChange: () => void;
  totalPrice: number;
};

// Status como objeto (em vez de enum)
export const TaskStatus = {
  Pending: "Pendente",
  Fixed: "Fixo",
  Completed: "Pago",
} as const;

// Modelo de criação
export type NewTask = Omit<Task, "id" | "created_at">;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];
