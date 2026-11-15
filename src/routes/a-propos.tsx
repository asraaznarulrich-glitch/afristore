import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos d'Afristore" },
      { name: "description", content: "Afristore est le catalogue des applications africaines. Notre mission : rendre visibles les apps créées en Afrique et pour l'Afrique, et aider chacun " },
      { property: "og:title", content: "À propos d'Afristore" },
      { property: "og:description", content: "Afristore est le catalogue des applications africaines. Notre mission : rendre visibles les apps créées en Afrique et pour l'Afrique, et aider chacun " },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl">À propos</h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">Afristore est le catalogue des applications africaines. Notre mission : rendre visibles les apps créées en Afrique et pour l'Afrique, et aider chacun à trouver rapidement l'outil utile, même avec une connexion lente.</p>
    </div>
  ),
});
