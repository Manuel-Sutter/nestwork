import {
  Baby,
  ShoppingCart,
  GraduationCap,
  Plane,
  Sparkles,
  Home,
  CalendarClock,
  CircleEllipsis,
  type LucideIcon,
} from "lucide-react";

export type CategoryId =
  | "kinderbetreuung"
  | "schule_kindergarten"
  | "hobbys"
  | "urlaub"
  | "einkaufen"
  | "haushalt"
  | "termine"
  | "sonstiges";

export const CATEGORY_IDS: CategoryId[] = [
  "kinderbetreuung",
  "schule_kindergarten",
  "hobbys",
  "urlaub",
  "einkaufen",
  "haushalt",
  "termine",
  "sonstiges",
];

export const CATEGORIES: Record<CategoryId, { label: string; icon: LucideIcon }> = {
  kinderbetreuung: { label: "Kinderbetreuung", icon: Baby },
  schule_kindergarten: { label: "Schule/Kindergarten", icon: GraduationCap },
  hobbys: { label: "Hobbys", icon: Sparkles },
  urlaub: { label: "Urlaub", icon: Plane },
  einkaufen: { label: "Einkaufen", icon: ShoppingCart },
  haushalt: { label: "Haushalt", icon: Home },
  termine: { label: "Termine", icon: CalendarClock },
  sonstiges: { label: "Sonstiges", icon: CircleEllipsis },
};

export function isCategoryId(value: string): value is CategoryId {
  return (CATEGORY_IDS as string[]).includes(value);
}
