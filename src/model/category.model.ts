import type { LucideIcon } from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  type: 'receita' | 'despesa';
  is_default: boolean;
  workspace_id: string | null;
  icon: string | null;
}

export interface CategoryIconOption {
  name: string;
  label: string;
  Icon: LucideIcon;
}
