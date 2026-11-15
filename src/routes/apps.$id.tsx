import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Download, Flag, Globe, Languages, HardDrive, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AppIcon } from "@/components/AppIcon";
import { Stars } from "@/components/Stars";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { useAuth, displayName } from "@/hooks/useAuth";
import { formatDownloads, type AppRow } from "@/lib/apps";

export const Route = createFileRoute("/apps/$id")({
  loader: async ({ params }) => {
    const { data } = await supabase.from("apps").select("name,short_description").eq("id", params.id).maybeSingle();
    return { meta: data };
  },
  head: ({ loaderData }) => {
    const title = loaderData?.meta ? `${loaderData.meta.name} – Afristore` : "Application – Afristore";
    const desc = loaderData?.meta?.short_description || "Découvrez cette application africaine sur Afristore.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: AppDetail,
});

function AppDetail() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const { data: app, isLoading } = useQuery({
    queryKey: ["app", id],
    queryFn: async () => (await supabase.from("apps").select("*").eq("id", id).maybeSingle()).data as AppRow | null,
  });
  const { data: cat } = useQuery({
    queryKey: ["cat", app?.category_slug],
    enabled: !!app,
    queryFn: async () => (await supabase.from("categories").select("*").eq("slug", app!.category_slug).single()).data,
  });

  if (isLoading) return <div className="mx-auto max-w-3xl p-4"><div className="h-40 animate-pulse rounded-2xl bg-muted" /></div>;
  if (!app) return <div className="mx-auto max-w-3xl p-8 text-center">{t("notFound")}</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-4">
      <Link to="/" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" />{t("home")}</Link>
      <div className="flex gap-4">
        <AppIcon name={app.name} url={app.icon_url} className="w-20 sm:w-24" />
        <div className="min-w-0">
          <h1 className="text-2xl leading-tight">{app.name}</h1>
          <p className="font-medium text-primary">{app.developer_name}</p>
          {cat && (
            <Link to="/apps" search={{ cat: cat.slug }} className="text-sm text-muted-foreground">
              {lang === "fr" ? cat.name_fr : cat.name_en}
            </Link>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 divide-x rounded-2xl bg-card py-3 text-center text-sm shadow-sm">
        <div><p className="flex items-center justify-center gap-1 font-semibold">{Number(app.rating_avg).toFixed(1)}<Star className="h-3.5 w-3.5 fill-star text-star" /></p><p className="text-xs text-muted-foreground">{app.rating_count} {t("reviews").toLowerCase()}</p></div>
        <div><p className="font-semibold">{formatDownloads(app.downloads)}</p><p className="text-xs text-muted-foreground">{t("download").toLowerCase()}s</p></div>
        <div><p className="font-semibold">{app.is_free ? t("free") : t("paid")}</p><p className="text-xs text-muted-foreground">{app.size_mb ? `${app.size_mb} Mo` : "—"}</p></div>
      </div>

      <Button asChild size="lg" className="mt-4 h-12 w-full rounded-full bg-accent text-base font-semibold text-accent-foreground hover:bg-accent/90">
        <a href={app.download_url} target="_blank" rel="noopener noreferrer"><Download className="h-5 w-5" />{t("download")}</a>
      </Button>

      {app.screenshots.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-lg">{t("screenshots")}</h2>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
            {app.screenshots.map((s) => <img key={s} src={s} alt="" loading="lazy" className="h-64 rounded-2xl border object-cover" />)}
          </div>
        </section>
      )}

      <section className="mt-6">
        <h2 className="mb-2 text-lg">{t("about")}</h2>
        <p className="whitespace-pre-line text-sm leading-relaxed">{app.description || app.short_description}</p>
        <dl className="mt-4 space-y-2 text-sm">
          <Info icon={Globe} label={t("countries")} value={app.countries.join(", ") || "—"} />
          <Info icon={Languages} label={t("languages")} value={app.languages.join(", ") || "—"} />
          <Info icon={HardDrive} label={t("size")} value={app.size_mb ? `${app.size_mb} Mo` : "—"} />
        </dl>
      </section>

      <Reviews appId={app.id} />
      <ReportButton appId={app.id} />
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Globe; label: string; value: string }) {
  return (
    <div className="flex gap-2"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><dt className="font-medium">{label} :</dt><dd className="text-muted-foreground">{value}</dd></div>
  );
}

function Reviews({ appId }: { appId: string }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", appId],
    queryFn: async () => (await supabase.from("reviews").select("*").eq("app_id", appId).order("created_at", { ascending: false })).data ?? [],
  });

  const submit = async () => {
    if (!user || !rating) return;
    setBusy(true);
    const { error } = await supabase.from("reviews").upsert(
      { app_id: appId, user_id: user.id, author_name: displayName(user), rating, comment: comment.trim() },
      { onConflict: "app_id,user_id" },
    );
    setBusy(false);
    if (error) return toast.error(error.message);
    setComment("");
    qc.invalidateQueries({ queryKey: ["reviews", appId] });
    qc.invalidateQueries({ queryKey: ["app", appId] });
  };

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg">{t("reviews")}</h2>
      {user ? (
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <p className="mb-1 text-sm font-medium">{t("writeReview")}</p>
          <Stars value={rating} size={26} onChange={setRating} />
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t("yourComment")} maxLength={1000} className="mt-2" />
          <Button onClick={submit} disabled={!rating || busy} className="mt-2 rounded-full">{t("publish")}</Button>
        </div>
      ) : (
        <Link to="/auth" className="block rounded-2xl bg-secondary p-4 text-center text-sm font-medium text-secondary-foreground">{t("loginToReview")}</Link>
      )}
      <ul className="mt-4 space-y-4">
        {reviews.map((r) => (
          <li key={r.id} className="border-b pb-3">
            <div className="flex items-center gap-2"><span className="text-sm font-semibold">{r.author_name}</span><Stars value={r.rating} size={12} /></div>
            {r.comment && <p className="mt-1 text-sm">{r.comment}</p>}
            <p className="mt-1 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
          </li>
        ))}
        {!reviews.length && <p className="text-sm text-muted-foreground">{t("noReviews")}</p>}
      </ul>
    </section>
  );
}

function ReportButton({ appId }: { appId: string }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const send = async () => {
    if (!user) return;
    const { error } = await supabase.from("reports").insert({ app_id: appId, user_id: user.id, reason: reason.trim() });
    if (error) return toast.error(error.message);
    toast.success(t("reported"));
    setReason("");
    setOpen(false);
  };
  if (!user)
    return <Link to="/auth" className="mt-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground"><Flag className="h-4 w-4" />{t("report")}</Link>;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="mt-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground"><Flag className="h-4 w-4" />{t("report")}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{t("report")}</DialogTitle></DialogHeader>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t("reportReason")} maxLength={1000} />
        <Button onClick={send} disabled={reason.trim().length < 3} variant="destructive" className="rounded-full">{t("send")}</Button>
      </DialogContent>
    </Dialog>
  );
}
