import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { AppIcon } from "./AppIcon";
import type { AppRow } from "@/lib/apps";
import { useI18n } from "@/lib/i18n";

type Lite = Pick<AppRow, "id" | "name" | "developer_name" | "icon_url" | "rating_avg" | "is_free">;

export function AppTile({ app }: { app: Lite }) {
  const { t } = useI18n();
  return (
    <Link to="/apps/$id" params={{ id: app.id }} className="block w-24 shrink-0 sm:w-28">
      <AppIcon name={app.name} url={app.icon_url} className="w-full" />
      <p className="mt-2 truncate text-sm font-medium">{app.name}</p>
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        {Number(app.rating_avg).toFixed(1)} <Star className="h-3 w-3 fill-star text-star" />
        <span className="ml-auto">{app.is_free ? t("free") : t("paid")}</span>
      </p>
    </Link>
  );
}

export function AppRowCard({ app }: { app: Lite & Pick<AppRow, "short_description"> }) {
  return (
    <Link to="/apps/$id" params={{ id: app.id }} className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-card">
      <AppIcon name={app.name} url={app.icon_url} className="w-16" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{app.name}</p>
        <p className="truncate text-sm text-muted-foreground">{app.short_description || app.developer_name}</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          {Number(app.rating_avg).toFixed(1)} <Star className="h-3 w-3 fill-star text-star" />
        </p>
      </div>
    </Link>
  );
}
