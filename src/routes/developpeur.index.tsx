import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppIcon } from "@/components/AppIcon";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/developpeur/")({
  head: () => ({
    meta: [
      { title: "Espace développeur – Afristore" },
      { name: "description", content: "Publiez vos applications sur Afristore et suivez leur validation." },
      { property: "og:title", content: "Espace développeur – Afristore" },
      { property: "og:description", content: "Publiez vos applications sur Afristore et suivez leur validation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DevHome,
});

const statusTone = {
  pending: "bg-accent/20 text-accent-foreground",
  approved: "bg-secondary text-secondary-foreground",
  rejected: "bg-destructive/15 text-destructive",
} as const;

function DevHome() {
  const { t } = useI18n();
  const { user, loading } = useAuth();
  const { data: apps = [] } = useQuery({
    queryKey: ["my-apps", user?.id],
    enabled: !!user,
    queryFn: async () =>
      (await supabase.from("apps").select("id,name,icon_url,status,created_at").eq("developer_id", user!.id).order("created_at", { ascending: false })).data ?? [],
  });
  if (loading) return null;
  if (!user) return <Navigate to="/auth" />;
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl">{t("devSpace")}</h1>
        <button onClick={() => supabase.auth.signOut()} className="inline-flex items-center gap-1 text-sm text-muted-foreground"><LogOut className="h-4 w-4" />{t("logout")}</button>
      </div>
      <p className="text-sm text-muted-foreground">{user.email}</p>
      <Button asChild className="mt-5 h-11 rounded-full"><Link to="/developpeur/soumettre"><Plus className="h-4 w-4" />{t("submitApp")}</Link></Button>
      <h2 className="mb-2 mt-8 text-lg">{t("myApps")}</h2>
      {!apps.length && <p className="text-sm text-muted-foreground">{t("noApps")}</p>}
      <ul className="space-y-2">
        {apps.map((a) => (
          <li key={a.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm">
            <AppIcon name={a.name} url={a.icon_url} className="w-12" />
            <Link to="/apps/$id" params={{ id: a.id }} className="flex-1 truncate font-medium">{a.name}</Link>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[a.status]}`}>{t(`status_${a.status}`)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
