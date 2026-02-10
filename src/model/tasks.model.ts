// Status como objeto
export const TASK_STATUS = {
  Pago: 'Pago',
  Pendente: 'Pendente',
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

export const TASK_STATUS_LIST = Object.entries(TASK_STATUS).map(
  ([value, label]) => ({ value, label })
);

export type Task = {
  id: string;
  title: string;
  price: number | null;
  done: TaskStatus;
  created_at?: string;
  type?: string;
  mes: number;
  ano: number;
};

export type TaskTable = {
  tasks: Task[];
  total: number;
  onTasksChange: () => void;
  totalPrice: number;
};

// Modelo de criação
export type NewTask = Omit<Task, 'id' | 'created_at'>;
