import { Clock7, Bell, Heart, Cog, BellOff, RefreshCcw } from 'lucide-react';

export const ICONS = {
  Clock7,
  Bell,
  Heart,
  Cog,
  BellOff,
  RefreshCcw,
} as const;

export type IconName = keyof typeof ICONS;
