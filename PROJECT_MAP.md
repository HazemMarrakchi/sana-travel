# PROJECT_MAP.md — SANA Travel Platform
*Dernière mise à jour : 2026-08-22*

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
        ├── users/              # register/login (JWT en S3)
        └── bookings/           # create/list/updateStatus ✅
```
Principes : Simplicity First · domain-driven · pas de micro-fichiers · logging simple console par niveau.

## [ORPHANS & PENDING]
- [ ] Navbar liens morts : /concierge, /contact, /login, /booking (routes manquantes)
- [ ] i18n FR/EN/AR (Context + RTL) — M2b
- [x] ~~Photos Unsplash vérifiées HTTP 200 (fallback gradient)~~ ✅ 6 URLs testées, en DB + fallback statique
- [ ] Auth JWT (register/login/guard admin) — modules users/bookings non protégés
- [ ] Page booking 3 étapes + génération devis PDF + envoi Resend
- [ ] Espace client (mes réservations)
- [ ] Dashboard admin (stats + CRUD UI offres + gestion clients)
- [ ] Concierge IA : endpoint /chat + KB admin + escalade humaine (WebSocket ou polling simple)
- [ ] Déploiements (Render API + GitHub Pages front) + seed prod
- [ ] Tests automatisés (API e2e minimal + web Vitest)

## Milestones (verifiable goals)
| # | Jalon | Critère de succès |
|---|---|---|
| M1 ✅ | Fondations | builds vert, DB connectée, 6 offres seedées |
| M2 | Vitrine dynamique complète | toutes les routes navbar fonctionnelles avec données API/fallback |
| M3 | Réservation + devis | un visiteur réserve et reçoit le devis PDF par email |
| M4 | Comptes & espaces | client voit ses réservations ; admin gère offres/clients/stats |
| M5 | Concierge IA | le bot répond sur les offres et escalade les questions inconnues |
| M6 | En ligne | front Pages + API Render, seed prod, README |
