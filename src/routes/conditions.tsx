import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/conditions")({
  head: () => ({
    meta: [
      { title: "Conditions d'utilisation – Afristore" },
      { name: "description", content: "Afristore référence des applications de tiers. Les téléchargements se font sur les sites des éditeurs. Les développeurs sont responsables du contenu q" },
      { property: "og:title", content: "Conditions d'utilisation – Afristore" },
      { property: "og:description", content: "Afristore référence des applications de tiers. Les téléchargements se font sur les sites des éditeurs. Les développeurs sont responsables du contenu q" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl">Conditions d'utilisation</h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">Afristore référence des applications de tiers. Les téléchargements se font sur les sites des éditeurs. Les développeurs sont responsables du contenu qu'ils soumettent ; Afristore peut refuser ou retirer toute app ou tout avis inapproprié.</p>
    </div>
  ),
});
