import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/lib/i18n";
import { useAuth, displayName } from "@/hooks/useAuth";

export const Route = createFileRoute("/developpeur/soumettre")({
  head: () => ({
    meta: [
      { title: "Soumettre une application – Afristore" },
      { name: "description", content: "Proposez votre application africaine au catalogue Afristore." },
      { property: "og:title", content: "Soumettre une application – Afristore" },
      { property: "og:description", content: "Proposez votre application africaine au catalogue Afristore." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Submit,
});

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
const split = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

async function upload(uid: string, file: File) {
  const path = `${uid}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
  const { error } = await supabase.storage.from("app-media").upload(path, file);
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage.from("app-media").createSignedUrl(path, TEN_YEARS);
  if (e2) throw e2;
  return data.signedUrl;
}

function Submit() {
  const { t, lang } = useI18n();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [isFree, setIsFree] = useState(true);
  const { data: cats = [] } = useQuery({
    queryKey: ["cats"],
    queryFn: async () => (await supabase.from("categories").select("*").order("sort")).data ?? [],
  });
  if (loading) return null;
  if (!user) return <Navigate to="/auth" />;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const icon = f.get("icon") as File;
    const shots = (f.getAll("shots") as File[]).filter((x) => x.size).slice(0, 5);
    const url = String(f.get("link"));
    if (!/^https?:\/\//.test(url)) { toast.error("URL invalide"); return; }
    setBusy(true);
    try {
      const icon_url = icon?.size ? await upload(user.id, icon) : null;
      const screenshots = await Promise.all(shots.map((s) => upload(user.id, s)));
      const { error } = await supabase.from("apps").insert({
        developer_id: user.id,
        developer_name: String(f.get("dev")).trim(),
        name: String(f.get("name")).trim(),
        short_description: String(f.get("short")).trim(),
        description: String(f.get("desc")).trim(),
        category_slug: String(f.get("cat")),
        download_url: url,
        countries: split(String(f.get("countries"))),
        languages: split(String(f.get("languages"))),
        size_mb: f.get("size") ? Number(f.get("size")) : null,
        is_free: isFree,
        icon_url,
        screenshots,
      });
      if (error) throw error;
      toast.success(t("submitted"));
      navigate({ to: "/developpeur" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <h1 className="text-2xl">{t("submitApp")}</h1>
      <form onSubmit={onSubmit} className="mt-5 space-y-4 rounded-3xl bg-card p-5 shadow-sm">
        <Field label={t("appName")}><Input name="name" required maxLength={60} /></Field>
        <Field label={t("devName")}><Input name="dev" required maxLength={80} defaultValue={displayName(user)} /></Field>
        <Field label={t("shortDesc")}><Input name="short" required maxLength={80} /></Field>
        <Field label={t("longDesc")}><Textarea name="desc" required rows={5} maxLength={4000} /></Field>
        <Field label={t("category")}>
          <select name="cat" required className="h-10 w-full rounded-md border bg-background px-3 text-sm">
            {cats.map((c) => <option key={c.slug} value={c.slug}>{lang === "fr" ? c.name_fr : c.name_en}</option>)}
          </select>
        </Field>
        <Field label={t("icon")}><Input name="icon" type="file" accept="image/png,image/jpeg,image/webp" required /></Field>
        <Field label={t("shots")}><Input name="shots" type="file" accept="image/png,image/jpeg,image/webp" multiple /></Field>
        <Field label={t("link")}><Input name="link" type="url" required placeholder="https://play.google.com/store/apps/…" /></Field>
        <Field label={t("countriesHint")}><Input name="countries" required placeholder="Sénégal, Côte d'Ivoire" /></Field>
        <Field label={t("languagesHint")}><Input name="languages" required placeholder="Français, Wolof" /></Field>
        <Field label={t("sizeMb")}><Input name="size" type="number" min={0} step="0.1" /></Field>
        <label className="flex items-center gap-3 text-sm font-medium"><Switch checked={isFree} onCheckedChange={setIsFree} />{t("isFree")}</label>
        <Button type="submit" disabled={busy} className="h-11 w-full rounded-full">{busy ? t("submitting") : t("submitApp")}</Button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
