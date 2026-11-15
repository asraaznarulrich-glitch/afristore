import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité – Afristore" },
      { name: "description", content: "Nous collectons uniquement les données nécessaires à votre compte (e-mail, nom affiché) et à vos avis. Nous ne vendons pas vos données. Vous pouvez de" },
      { property: "og:title", content: "Politique de confidentialité – Afristore" },
      { property: "og:description", content: "Nous collectons uniquement les données nécessaires à votre compte (e-mail, nom affiché) et à vos avis. Nous ne vendons pas vos données. Vous pouvez de" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl">Confidentialité</h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">Nous collectons uniquement les données nécessaires à votre compte (e-mail, nom affiché) et à vos avis. Nous ne vendons pas vos données. Vous pouvez demander la suppression de votre compte à tout moment.</p>
    </div>
  ),
});
