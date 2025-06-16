export interface DialogDelete {
  onConfirm: () => void;
  description: string | null;
  children: React.ReactNode;
}
