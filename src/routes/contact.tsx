import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contacter Afristore" },
      { name: "description", content: "Une question, un partenariat ou un problème avec une application ? Écrivez-nous. (Adresse de contact à compléter.)" },
      { property: "og:title", content: "Contacter Afristore" },
      { property: "og:description", content: "Une question, un partenariat ou un problème avec une application ? Écrivez-nous. (Adresse de contact à compléter.)" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl">Contact</h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">Une question, un partenariat ou un problème avec une application ? Écrivez-nous. (Adresse de contact à compléter.)</p>
    </div>
  ),
});
