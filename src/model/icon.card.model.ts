import { Clock7, Bell, Heart, Cog } from "lucide-react";

export const ICONS = {
  Clock7,
  Bell,
  Heart,
  Cog,
} as const;

export type IconName = keyof typeof ICONS;
