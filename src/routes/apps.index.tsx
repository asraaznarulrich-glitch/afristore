import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { listFields, type AppRow, type Category } from "@/lib/apps";
import { AppRowCard } from "@/components/AppCard";
import { useI18n } from "@/lib/i18n";

type S = { q?: string; cat?: string; country?: string; lang?: string; rating?: string; price?: string; made?: string };

export const Route = createFileRoute("/apps/")({
  validateSearch: (s: Record<string, unknown>): S => {
    const o: S = {};
    for (const k of ["q", "cat", "country", "lang", "rating", "price", "made"] as const)
      if (typeof s[k] === "string" && s[k]) o[k] = s[k] as string;
    return o;
  },
  head: () => ({
    meta: [
      { title: "Catalogue d'applications africaines – Afristore" },
      { name: "description", content: "Parcourez les apps africaines par catégorie, pays, langue, note et prix." },
      { property: "og:title", content: "Catalogue d'applications africaines – Afristore" },
      { property: "og:description", content: "Parcourez les apps africaines par catégorie, pays, langue, note et prix." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AppsList,
});

const sel = "h-10 rounded-full border bg-card px-3 text-sm";

function AppsList() {
  const s = Route.useSearch();
  const navigate = useNavigate({ from: "/apps/" });
  const { t, lang } = useI18n();
  const set = (k: keyof S, v: string) => navigate({ search: (p: S) => ({ ...p, [k]: v || undefined }) });

  const { data } = useQuery({
    queryKey: ["apps-all"],
    queryFn: async () => {
      const [c, a] = await Promise.all([
        supabase.from("categories").select("*").order("sort"),
        supabase.from("apps").select(listFields).eq("status", "approved").limit(1000),
      ]);
      return { cats: (c.data ?? []) as Category[], apps: (a.data ?? []) as unknown as AppRow[] };
    },
  });
  const apps = data?.apps ?? [];
  const countries = [...new Set(apps.flatMap((a) => a.countries))].sort();
  const langs = [...new Set(apps.flatMap((a) => a.languages))].sort();
  const q = s.q?.toLowerCase();
  const filtered = apps
    .filter((a) => (!s.cat || a.category_slug === s.cat))
    .filter((a) => (!q || `${a.name} ${a.developer_name} ${a.short_description}`.toLowerCase().includes(q)))
    .filter((a) => (!s.country || a.countries.includes(s.country)))
    .filter((a) => (!s.lang || a.languages.includes(s.lang)))
    .filter((a) => (!s.rating || Number(a.rating_avg) >= Number(s.rating)))
    .filter((a) => (!s.price || (s.price === "free" ? a.is_free : !a.is_free)))
    .filter((a) => (!s.made || a.made_in_africa))
    .sort((a, b) => b.downloads - a.downloads);
  const cat = data?.cats.find((c) => c.slug === s.cat);

  return (
    <div className="mx-auto max-w-5xl px-4 py-5">
      <h1 className="text-2xl">{cat ? (lang === "fr" ? cat.name_fr : cat.name_en) : s.made ? t("madeIn") : t("allApps")}</h1>
      <div className="mt-3 flex items-center gap-2 rounded-full border bg-card px-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          defaultValue={s.q}
          onChange={(e) => set("q", e.target.value)}
          placeholder={t("search")}
          className="h-11 flex-1 bg-transparent outline-none"
        />
      </div>
      <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        <select className={sel} value={s.cat ?? ""} onChange={(e) => set("cat", e.target.value)} aria-label={t("category")}>
          <option value="">{t("categories")}</option>
          {data?.cats.map((c) => <option key={c.slug} value={c.slug}>{lang === "fr" ? c.name_fr : c.name_en}</option>)}
        </select>
        <select className={sel} value={s.country ?? ""} onChange={(e) => set("country", e.target.value)} aria-label={t("countries")}>
          <option value="">{t("anyCountry")}</option>
          {countries.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className={sel} value={s.lang ?? ""} onChange={(e) => set("lang", e.target.value)} aria-label={t("languages")}>
          <option value="">{t("anyLang")}</option>
          {langs.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className={sel} value={s.rating ?? ""} onChange={(e) => set("rating", e.target.value)} aria-label="Note">
          <option value="">{t("anyRating")}</option>
          <option value="4.5">4.5 ★ +</option>
          <option value="4">4 ★ +</option>
          <option value="3">3 ★ +</option>
        </select>
        <select className={sel} value={s.price ?? ""} onChange={(e) => set("price", e.target.value)} aria-label="Prix">
          <option value="">{t("anyPrice")}</option>
          <option value="free">{t("free")}</option>
          <option value="paid">{t("paid")}</option>
        </select>
      </div>
      <div className="mt-4 grid gap-1 sm:grid-cols-2">
        {filtered.map((a) => <AppRowCard key={a.id} app={a} />)}
      </div>
      {data && !filtered.length && (
        <p className="py-12 text-center text-muted-foreground">
          {t("noResults")} <Link to="/apps" className="text-primary underline">{t("allApps")}</Link>
        </p>
      )}
    </div>
  );
}
