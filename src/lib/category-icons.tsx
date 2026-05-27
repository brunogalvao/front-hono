import type { IconType } from 'react-icons';
import {
  FaUtensils,
  FaCar,
  FaHouseChimney,
  FaHeartPulse,
  FaGraduationCap,
  FaGamepad,
  FaShirt,
  FaRepeat,
  FaWrench,
  FaTag,
  FaBriefcase,
  FaLaptopCode,
  FaChartLine,
} from 'react-icons/fa6';

const categoryIconMap: Record<string, IconType> = {
  'Alimentação': FaUtensils,
  'Transporte': FaCar,
  'Moradia': FaHouseChimney,
  'Saúde': FaHeartPulse,
  'Educação': FaGraduationCap,
  'Lazer': FaGamepad,
  'Vestuário': FaShirt,
  'Assinaturas': FaRepeat,
  'Serviços': FaWrench,
  'Outros (despesa)': FaTag,
  'Salário': FaBriefcase,
  'Freelance': FaLaptopCode,
  'Investimentos': FaChartLine,
  'Outros (receita)': FaTag,
};

interface CategoryIconProps {
  name: string;
  className?: string;
}

export function CategoryIcon({ name, className = 'h-3 w-3' }: CategoryIconProps) {
  const Icon = categoryIconMap[name] ?? FaTag;
  return <Icon className={className} />;
}
