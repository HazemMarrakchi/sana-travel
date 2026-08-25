# SANA Travel

Plateforme de voyages trilingue (FR / EN / AR avec support RTL) : voyages organisés, hôtels, voyage libre sur mesure et conciergerie IA.

- **Front** : https://hazemmarrakchi.github.io/sana-travel/
- **API** : https://sana-api.onrender.com

## Fonctionnalités

### Voyages organisés (`/offres`)
- Catalogue des circuits accompagnés par l'agence
- Fiche détaillée avec galerie photo
- Configurateur simplifié : nombre de voyageurs, total en direct (programme fixé par l'agence)

### Hôtels (`/destinations`)
- Grille d'hôtels avec recherche, filtres pays → villes (cascade) et tri
- Planificateur de séjour : le client choisit ses dates d'arrivée **et** de départ, la durée est calculée automatiquement
- Réservation directe depuis une carte avec dates préremplies

### Fiche hôtel / circuit (`/offres/:slug`)
- Configurateur intelligent :
  - **Hôtel** : arrivée / départ, voyageurs, chambres, formule (petit-déjeuner, demi-pension +18 %, tout inclus +35 %), devis temps réel
  - **Circuit organisé** : voyageurs uniquement (dates fixées par l'agence)
- Avis voyageurs + formulaire de dépôt d'avis
- Offres similaires (même pays / tags)

### Voyage libre (`/voyage-libre`)
- Recherche de vols en temps réel (Amadeus + Travelpayouts, aller-retour ou aller simple)
- Formulaire sur mesure (destination, dates, budget, envies) envoyé à l'agence

### Comptes & réservations
- Inscription / connexion (JWT), favoris, « vus récemment »
- Les devis invités sont rattachés automatiquement au compte client par email (`/bookings/claim`)
- Paiement d'acompte 30 % via Stripe Checkout

### Administration (`/admin`)
- Vue d'ensemble (KPIs, graphiques), gestion des offres (CRUD multi-photos), réservations, utilisateurs, escalades du chat
- Affichage des notes de voyage libre (trajet, vol, hôtel…)

### Transverse
- i18n complet FR / EN / AR (+ RTL), SEO (sitemap, robots, Open Graph, JSON-LD)
- Pages légales : mentions légales, CGV, confidentialité
- Témoignages clients, chat conciergerie (Groq) avec escalade admin

## Stack technique

| Couche | Technologies |
|---|---|
| Front | React 18, TypeScript, Vite, Tailwind CSS 4, react-router |
| Back | Node.js, NestJS, Mongoose (MongoDB Atlas) |
| Intégrations | Amadeus, Travelpayouts, Stripe, Groq, Resend |
| Déploiement | GitHub Pages (front), Render (API) |

## Structure du projet

```
sana-travel/
├── web/                  # Front React (Vite)
│   ├── src/core/         # api, auth, i18n, money (EUR→TND), stay (devis)
│   ├── src/features/     # pages par domaine (home, destinations, offers, booking…)
│   ├── src/data/         # offres de repli, témoignages, contenus légaux
│   └── public/           # sitemap.xml, robots.txt
└── api/                  # API NestJS
    ├── src/modules/      # auth, bookings, offers, flights, reviews, chat…
    └── scripts/          # seed.mjs, add-hotels.mjs, add-dubai.mjs
```

## Démarrage local

```bash
npm install            # installe front + back (workspaces)

npm run dev:api        # API NestJS sur http://localhost:3001
npm run dev:web        # Front Vite sur http://localhost:5173
```

> En développement, `web/.env` peut pointer `VITE_API_URL` vers l'API de production pour éviter de lancer le back localement.

## Variables d'environnement

### `web/.env`
| Variable | Rôle |
|---|---|
| `VITE_API_URL` | URL de l'API (`/api`) |
| `VITE_WHATSAPP` | numéro WhatsApp (la bulle flottante reste cachée si vide) |

### `api/.env`
| Variable | Rôle |
|---|---|
| `MONGODB_URI` | connexion MongoDB Atlas |
| `JWT_SECRET` | signature des tokens |
| `AMADEUS_*`, `TRAVELPAYOUTS_TOKEN` | moteurs de vols |
| `STRIPE_SECRET_KEY`, `STRIPE_PRICE_*` | acompte en ligne |
| `GROQ_API_KEY` | conciergerie IA (optionnel) |
| `RESEND_API_KEY` | envoi d'emails (optionnel) |

## Base de données — scripts

```bash
# depuis la racine, MONGODB_URI dans l'environnement
node api/scripts/seed.mjs        # réinitialise les voyages organisés (supprime tout !)
node api/scripts/add-hotels.mjs  # ajoute les 7 hôtels (upsert)
```

Après un `seed.mjs`, toujours relancer `add-hotels.mjs`.

## Règles métier importantes

- **Prix stockés en EUR**, affichés en DT (taux de référence `EUR_TND`).
- Les tarifs proviennent des données réelles : aucun multiplicateur artificiel.
- Le serveur recalcule toujours le total d'une réservation (`offer.priceEur / nuits × durée × voyageurs × coef formule`) — le front ne fait qu'estimer.
- Chaque offre porte le tag `hôtel` ou non : c'est ce tag qui sépare les deux univers (destinations vs voyages organisés).

## Déploiement

- **Front** : push sur `main` → GitHub Actions → GitHub Pages (base `/sana-travel/`).
- **API** : push sur `main` → deploy automatique Render.

## Licence

Projet privé — © SANA Travel.
