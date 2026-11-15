import type { Database } from "@/integrations/supabase/types";
import {
  Wallet, GraduationCap, ShoppingBag, HeartPulse, Gamepad2, Bus, Sprout, Users, Wrench, LayoutGrid,
} from "lucide-react";

export type AppRow = Database["public"]["Tables"]["apps"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];

export const categoryIcons: Record<string, typeof Wallet> = {
  wallet: Wallet, "graduation-cap": GraduationCap, "shopping-bag": ShoppingBag, "heart-pulse": HeartPulse,
  "gamepad-2": Gamepad2, bus: Bus, sprout: Sprout, users: Users, wrench: Wrench,
};
export const fallbackIcon = LayoutGrid;

export const listFields =
  "id,name,developer_name,short_description,category_slug,icon_url,rating_avg,rating_count,is_free,made_in_africa,featured,downloads,created_at,countries,languages,size_mb";

export function formatDownloads(n: number) {
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)} M+`;
  if (n >= 1_000) return `${Math.round(n / 1_000)} k+`;
  return `${n}`;
}
