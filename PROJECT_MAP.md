# PROJECT_MAP.md — SANA Travel Platform
*Dernière mise à jour : 2026-08-23*

## [DECISIONS VERROUILLÉES] (propriétaire)
- Langues interface : **FR + EN + AR** (i18n custom Context, RTL pour AR) — implémentation dédiée M2b
- Paiement : **Stripe Checkout mode test** (acompte 30% simulé réel)
- Images destinations : **Unsplash** (URL vérifiées HTTP 200 avant commit ; fallback gradient si erreur)
- Devis : **PDF téléchargeable + envoi Resend** (compte à créer par le propriétaire)


## [TECH_STACK]
| Couche | Techno | Version | Statut (au 2026-08) |
|---|---|---|---|
| Front | React + TypeScript | 19.1 / 5.8 | stable ✅ |
| Build | Vite | 7.1 | stable ✅ |
| Styles | Tailwind CSS | 4.3.3 | stable ✅ |
| Routing | react-router-dom | 7.8 | stable ✅ |
| Animations | GSAP | 3.13 | stable ✅ |
| API | NestJS (@nestjs/*) | 11.1 | stable ✅ |
| ODM | Mongoose | 8.16 | stable ✅ |
| DB | MongoDB Atlas M0 (`sana_travel`) | 8.0 | free tier ✅ |
| IA concierge (S3) | Groq API (llama) | — | free tier, clé requise |
| Paiement (S3) | Stripe Checkout mode test | — | gratuit en démo |

## [SYSTEM_FLOW] — Parcours utilisateurs (objectifs vérifiables)
### Visiteur → Client
1. `GET /` : vitrine immersive → clic « Composer mon voyage »
2. `GET /destinations` : liste offres filtrable par tag (source: API, fallback statique)
3. `GET /offres/:slug` : détail + CTA réservation
4. `POST /bookings` : réservation 3 étapes (dates, voyageurs, récap) → devis email
5. `POST /auth/register` puis `/login` : compte client (JWT)
6. Espace client : mes réservations + statut

### Admin
7. `POST /auth/login` rôle admin → `GET /admin` dashboard (CA, réservations, clients)
8. CRUD offres depuis l'admin
9. Panneau chatbot : éditer base de connaissances (kb_entries), lire conversations
10. Chatbot public `POST /chat` : répond depuis KB + offres ; escalade si inconnu

## [ARCHITECTURE]
```
sana-travel/
├── web/                        # React SPA (Pages)
│   └── src/
│       ├── core/api.ts         # client HTTP + fallback démo
│       ├── data/offers.ts      # fallback statique + ART gradients
│       ├── components/layout/  # Navbar, Footer
│       └── features/
│           ├── home/           # HomePage (hero aurora)
│           ├── destinations/   # DestinationsPage (grille + filtres)
│           └── offers/         # OfferDetailPage
└── api/                        # NestJS (/api prefix)
    └── src/modules/
        ├── offers/             # CRUD + filtres ✅
        ├── users/              # register/login (JWT en S3) + favoris ✅
        ├── bookings/           # create/list/updateStatus + claim + acompte Stripe ✅
        └── reviews/            # avis publics GET/POST, modération admin ✅
```
Principes : Simplicity First · domain-driven · pas de micro-fichiers · logging simple console par niveau.

## [ORPHANS & PENDING]
- [x] ~~Navbar liens morts~~ ✅ pages /concierge (chat plein écran + chips) et /contact (infos + formulaire mailto) créées et routées
- [x] ~~i18n FR/EN/AR + prix TND~~ ✅ core/i18n (RTL auto) + core/money.ts
- [x] ~~Photos Unsplash vérifiées~~ ✅ 6 URLs testées HTTP 200, en DB
- [x] ~~Auth JWT complète~~ ✅ M4 : 14/14 tests verts ; fix `import type` qui effaçait les DTOs (ValidationPipe skip) ; @IsOptional phone ; login 200
- [x] ~~Lier les bookings invités au compte client après inscription~~ ✅ POST /api/bookings/claim (updateMany par email) ; appelé auto après login/register côté front
- [x] ~~Booking 3 étapes + devis PDF + Resend~~ ✅ M3 : wizard invité, référence SNA-XXXXXX, total serveur, jsPDF lazy-loadé (bundle principal ~300kB), email Resend optionnel
- [x] ~~Admin : CRUD UI des offres~~ ✅ section Offres dans /admin : cartes + modal création/édition + suppression avec confirmation ; API sécurisée @Roles('admin') sur POST/PUT/DELETE
- [x] ~~Concierge IA~~ ✅ M5 : POST /api/chat (règles 5/5 tests ; Groq llama-3.3-70b auto si GROQ_API_KEY), chat_logs + escalades dans /admin, widget flottant + page dédiée
- [x] ~~Déploiement production~~ ✅ M6 EN LIGNE : https://hazemmarrakchi.github.io/sana-travel/ (Pages) + https://sana-api.onrender.com (Render free, auto-deploy sur push main). VITE_BASE=/sana-travel/ + BrowserRouter basename. Fix admin bookings vide (findAll). Cron keep-warm conseillé toutes les 10 min (cron-job.org → GET /api/offers)
- [x] ~~Offre Dubaï~~ ✅ seedée en base via scripts/add-dubai.mjs (7 offres au total, photo Unsplash vérifiée)
- [x] ~~Avis clients~~ ✅ module reviews : GET/POST publics (/api/reviews?slug=), suppression admin ; formulaire + liste sur la page détail offre
- [x] ~~Favoris / wishlist~~ ✅ user.favorites (slugs) + GET/PUT me/favorites (toggle) ; cœur sur page détail, section Mes favoris dans /account, fallback localStorage invité
- [x] ~~Paiement acompte Stripe~~ ✅ POST /bookings/:id/pay → Checkout Session (30%, mode test) + POST /bookings/pay-confirm au retour ; statut → confirmed si payé ; bouton dans /account ; nécessite STRIPE_SECRET_KEY (+ FRONT_URL) sinon 404 propre
- [x] ~~Offres hôtels dédiées~~ ✅ 7 offres tag « hôtel » (Djerba, Hammamet, Le Caire, Rome, Antalya, Tozeur, **Gabès**) — photos Unsplash vérifiées HTTP 200, en base via scripts/add-hotels.mjs (14 offres) + fallback front ; **galerie photos** (3-4 images/hôtel en base + fallback, miniatures cliquables sur la page offre)
- [x] ~~Organisation /destinations~~ ✅ onglets Tout/Voyages/Hôtels + filtres en cascade **Pays → Ville** (la ville ne propose que les villes du pays choisi, reset auto) + tri (recommandés/prix/durée/note) + compteur résultats + état vide avec réinitialisation
- [ ] Compte Resend à créer par le propriétaire pour activer l'envoi email
- [ ] Clé GROQ_API_KEY à ajouter dans Render (env) pour activer le vrai mode IA du concierge
- [ ] Clé STRIPE_SECRET_KEY à ajouter dans Render (env) + FRONT_URL=https://hazemmarrakchi.github.io/sana-travel pour activer le paiement en ligne
- [x] ~~Design premium~~ ✅ navbar sticky (zéro chevauchement structurel), HomePage 3D (TiltCard, reveal au scroll, aurores animées), LoginPage split-screen, AdminPage cockpit v2 (sidebar glass sous la navbar top-[72px], donut chart, KPI count-up, recherche réservations avec raccourci « / », scroll-spy)

## Milestones (verifiable goals)
| # | Jalon | Critère de succès |
|---|---|---|
| M1 ✅ | Fondations | builds vert, DB connectée, 6 offres seedées |
| M2 ✅ | Vitrine dynamique complète | destinations/détail dynamiques, i18n 3 langues, TND, photos vérifiées |
| M3 ✅ | Réservation + devis | wizard invité testé E2E ; email Resend en attente de clé (graceful skip) |
| M4 ✅ | Comptes & espaces | auth JWT 14/14 tests ; pages /login /account /admin livrées (admin@sana.tn) |
| M5 ✅ | Concierge IA | bot répond sur les offres (règles/Groq), escalade les questions inconnues vers admin |
| M6 ✅ | En ligne | front Pages + API Render en prod ; seed présent (même Atlas) ; auto-deploy push→main |
