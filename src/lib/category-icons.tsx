import {
  Utensils, RefreshCw, GraduationCap, Smile, Home, Package, HeartPulse,
  Wrench, Car, Shirt, Briefcase, TrendingUp, Wallet, DollarSign, ShoppingCart,
  ShoppingBag, Coffee, Plane, Bus, Bike, Music, Film, Tv, Gamepad2, BookOpen,
  CreditCard, PiggyBank, BarChart2, Receipt, Gift, Tag, Zap, Building,
  type LucideIcon,
} from 'lucide-react';

export interface CategoryIconOption {
  name: string;
  label: string;
  Icon: LucideIcon;
}

export const CATEGORY_ICONS: CategoryIconOption[] = [
  { name: 'Utensils',      label: 'Alimentação',  Icon: Utensils },
  { name: 'Coffee',        label: 'Café',          Icon: Coffee },
  { name: 'ShoppingCart',  label: 'Compras',       Icon: ShoppingCart },
  { name: 'ShoppingBag',   label: 'Shopping',      Icon: ShoppingBag },
  { name: 'Car',           label: 'Carro',         Icon: Car },
  { name: 'Bus',           label: 'Ônibus',        Icon: Bus },
  { name: 'Plane',         label: 'Viagem',        Icon: Plane },
  { name: 'Bike',          label: 'Bicicleta',     Icon: Bike },
  { name: 'Home',          label: 'Moradia',       Icon: Home },
  { name: 'Building',      label: 'Empresa',       Icon: Building },
  { name: 'HeartPulse',    label: 'Saúde',         Icon: HeartPulse },
  { name: 'GraduationCap', label: 'Educação',      Icon: GraduationCap },
  { name: 'BookOpen',      label: 'Leitura',       Icon: BookOpen },
  { name: 'Smile',         label: 'Lazer',         Icon: Smile },
  { name: 'Gamepad2',      label: 'Jogos',         Icon: Gamepad2 },
  { name: 'Music',         label: 'Música',        Icon: Music },
  { name: 'Film',          label: 'Cinema',        Icon: Film },
  { name: 'Tv',            label: 'Streaming',     Icon: Tv },
  { name: 'Wallet',        label: 'Carteira',      Icon: Wallet },
  { name: 'DollarSign',    label: 'Dinheiro',      Icon: DollarSign },
  { name: 'CreditCard',    label: 'Cartão',        Icon: CreditCard },
  { name: 'PiggyBank',     label: 'Poupança',      Icon: PiggyBank },
  { name: 'TrendingUp',    label: 'Investimento',  Icon: TrendingUp },
  { name: 'BarChart2',     label: 'Gráfico',       Icon: BarChart2 },
  { name: 'Receipt',       label: 'Conta',         Icon: Receipt },
  { name: 'Briefcase',     label: 'Trabalho',      Icon: Briefcase },
  { name: 'RefreshCw',     label: 'Assinatura',    Icon: RefreshCw },
  { name: 'Wrench',        label: 'Serviços',      Icon: Wrench },
  { name: 'Shirt',         label: 'Roupas',        Icon: Shirt },
  { name: 'Gift',          label: 'Presente',      Icon: Gift },
  { name: 'Tag',           label: 'Tag',           Icon: Tag },
  { name: 'Zap',           label: 'Energia',       Icon: Zap },
  { name: 'Package',       label: 'Outros',        Icon: Package },
];

const iconMap = Object.fromEntries(CATEGORY_ICONS.map((o) => [o.name, o.Icon]));

interface CategoryIconProps {
  name: string | null | undefined;
  className?: string;
}

export function CategoryIcon({ name, className = 'h-4 w-4' }: CategoryIconProps) {
  if (!name) return null;
  const Icon = iconMap[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}
