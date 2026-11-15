import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronRight } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { categoryIcons, fallbackIcon, listFields, type AppRow, type Category } from "@/lib/apps";
import { AppTile, AppRowCard } from "@/components/AppCard";
import { useI18n, type TKey } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Afristore – Les apps d'Afrique, au même endroit" },
      { name: "description", content: "Découvrez et téléchargez des applications africaines : finance, éducation, commerce, santé et plus." },
      { property: "og:title", content: "Afristore – Les apps d'Afrique, au même endroit" },
      { property: "og:description", content: "Découvrez et téléchargez des applications africaines : finance, éducation, commerce, santé et plus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function useHomeData() {
  return useQuery({
    queryKey: ["home"],
    queryFn: async () => {
      const [cats, apps] = await Promise.all([
        supabase.from("categories").select("*").order("sort"),
        supabase.from("apps").select(listFields).eq("status", "approved").limit(200),
      ]);
      return { cats: (cats.data ?? []) as Category[], apps: (apps.data ?? []) as unknown as AppRow[] };
    },
  });
}

function Section({ title, apps, to }: { title: TKey; apps: AppRow[]; to?: Record<string, string> }) {
  const { t } = useI18n();
  if (!apps.length) return null;
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg">{t(title)}</h2>
        <Link to="/apps" search={to ?? {}} className="flex items-center text-sm font-medium text-primary">
          {t("seeAll")} <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2">
        {apps.map((a) => <AppTile key={a.id} app={a} />)}
      </div>
    </section>
  );
}

function Home() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const { data, isLoading } = useHomeData();
  const apps = data?.apps ?? [];
  const popular = [...apps].sort((a, b) => b.downloads - a.downloads).slice(0, 10);
  const newest = [...apps].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 10);
  const made = apps.filter((a) => a.made_in_africa).sort((a, b) => Number(b.rating_avg) - Number(a.rating_avg));
  const featured = apps.filter((a) => a.featured).slice(0, 4);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-6">
      <section className="-mx-4 bg-primary px-4 pb-8 pt-6 text-primary-foreground sm:mx-0 sm:mt-4 sm:rounded-3xl sm:px-8">
        <h1 className="text-2xl leading-tight sm:text-4xl">{t("slogan")}</h1>
        <p className="mt-2 max-w-xl text-sm opacity-90 sm:text-base">{t("heroSub")}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/apps", search: q.trim() ? { q: q.trim() } : {} });
          }}
          className="mt-5 flex items-center gap-2 rounded-full bg-card px-4 py-1 text-card-foreground shadow-lg"
        >
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search")}
            className="h-11 flex-1 bg-transparent text-base outline-none"
            aria-label={t("search")}
          />
        </form>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-lg">{t("categories")}</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-9">
          {(data?.cats ?? []).map((c) => {
            const Icon = categoryIcons[c.icon] ?? fallbackIcon;
            return (
              <Link
                key={c.slug}
                to="/apps"
                search={{ cat: c.slug }}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-card p-3 text-center shadow-sm transition-colors hover:bg-secondary"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-medium">{lang === "fr" ? c.name_fr : c.name_en}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {isLoading && <div className="mt-8 h-32 animate-pulse rounded-2xl bg-muted" />}
      <Section title="popular" apps={popular} />
      <Section title="newest" apps={newest} />
      <Section title="madeIn" apps={made} to={{ made: "1" }} />

      {featured.length > 0 && (
        <section className="mt-8 grid gap-1 rounded-3xl bg-card p-3 shadow-sm sm:grid-cols-2">
          {featured.map((a) => <AppRowCard key={a.id} app={a} />)}
        </section>
      )}
    </div>
  );
}
