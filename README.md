# Afristore

Crée "Afristore", un store d'applications dédié à l'Afrique : un catalogue web
d'apps africaines, mobile-first, léger et rapide (connexions lentes).

LANGUES
Français par défaut + anglais, avec un sélecteur de langue.

DESIGN
- Couleurs : principal vert #1B7F4B, accent orange #F59E0B, fond crème
  #FFF8EE, texte #1F2937.
- Boutons "Télécharger" en orange, éléments principaux en vert.
- Style moderne, arrondi, propre, inspiré du Play Store. Logo texte "Afristore".
- Optimisé pour petits écrans Android d'entrée de gamme.

PAGES
1. Accueil : barre de recherche, catégories (Finance, Éducation, Commerce,
   Santé, Jeux, Transport, Agriculture, Social, Outils), sections "Populaires",
   "Nouveautés", "Made in Afrique".
2. Liste par catégorie avec filtres : pays, langue, note, gratuit/payant.
3. Fiche application : icône, nom, développeur, description, captures
   d'écran, note moyenne, avis, pays/langues supportés, taille, bouton
   "Télécharger" (lien externe : Play Store, APK ou site de l'app).
4. Espace développeur : inscription/connexion, formulaire de soumission
   d'app (nom, description, catégorie, icône, captures, lien de
   téléchargement, pays, langues). Statut : en attente / validée / refusée.
5. Espace admin (réservé à moi) : valider ou refuser les apps soumises,
   mettre des apps en avant, supprimer des avis.
6. Pages : À propos, Contact, Confidentialité, Conditions d'utilisation.

FONCTIONNALITÉS
- Comptes utilisateurs (email + Google), avis et notes sur les apps.
- Seules les apps validées par l'admin sont visibles publiquement.
- Bouton "Signaler cette app".
- Base de données Supabase (apps, développeurs, avis, catégories).
- Site responsive, installable en PWA.

Commence par l'accueil, la fiche application et la soumission d'app

Ajoute l'identité visuelle d'Afristore.

LOGO
- Icône : carré arrondi vert #1B7F4B avec un "A" blanc stylisé dont la
  barre horizontale est une flèche de téléchargement orange #F59E0B.
- Logo complet : icône + texte "Afristore" en police arrondie, grasse.
- Version claire (fond sombre) et version sombre (fond clair).
- Place le logo dans l'en-tête, le pied de page et les écrans de connexion.

FAVICON ET ICÔNES
- Favicon basé sur l'icône seule, lisible en 16x16 et 32x32.
- Ajoute apple-touch-icon (180x180) et icônes PWA 192x192 et 512x512.
- Configure le manifest PWA : name "Afristore", short_name "Afristore",
  theme_color #1B7F4B, background_color #FFF8EE.

MÉTADONNÉES
- Titre : "Afristore – Les apps d'Afrique, au même endroit"
- Description : "Découvrez et téléchargez des applications africaines :
  finance, éducation, commerce, santé et plus."
- Balises Open Graph (image de partage 1200x630 avec logo + slogan,
  fond vert).
- Slogan affiché sur l'accueil, avec traduction anglaise.

TYPOGRAPHIE
- Titres : Poppins (gras). Texte : Inter.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a9f56394-09cd-408f-b19d-d3100f1784a5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
