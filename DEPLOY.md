# 🚀 Déploiement SANA Travel — checklist pas à pas

Durée totale : ~20 minutes. Deux comptes gratuits nécessaires : **GitHub** et **Render**.

---

## Étape 1 — Pousser le code sur GitHub (5 min)

1. Crée un repo **public** nommé `sana-travel` sur https://github.com/new (⚠️ sans README initial).
2. Dans PowerShell, depuis `C:\Users\HazemMarrakchi\Documents\sana-travel` :

```powershell
git remote add origin https://github.com/<TON-PSEUDO>/sana-travel.git
git push -u origin main
```

> Si ton branch principal ne s'appelle pas `main` : `git branch -M main` d'abord.

---

## Étape 2 — Déployer l'API sur Render (8 min)

1. Va sur https://dashboard.render.com → **New +** → **Web Service**.
2. **Build and deploy from a Git repository** → connecte GitHub → choisis `sana-travel`.
3. Configuration exacte :
   | Champ | Valeur |
   |---|---|
   | Name | `sana-api` |
   | Root Directory | `api` |
   | Runtime | `Node` |
   | Build Command | `npm install && npm run build` |
   | Start Command | `node dist/main.js` |
   | Instance Type | `Free` |
4. **Environment Variables** → Add :
   | Key | Value |
   |---|---|
   | `MONGODB_URI` | `mongodb+srv://hazem:SanaTravel2026@cluster0.xbpvten.mongodb.net/sana_travel?appName=Cluster0` |
   | `JWT_SECRET` | une longue phrase aléatoire (≠ celle du dev) |
   | `GROQ_API_KEY` | *(optionnel)* ta clé https://console.groq.com |
5. **Create Web Service** → attends le déploiement (~3 min).
6. Note l'URL affichée en haut, ex : `https://sana-api-xxxx.onrender.com`.
7. Teste dans ton navigateur : `https://sana-api-xxxx.onrender.com/api/offers` → doit afficher les offres JSON.
   > ⚠️ La base Atlas est encore vide côté "prod" ? C'est la même base que le local → déjà seedée. ✅

### ⚠️ Plan gratuit Render
L'API s'endort après 15 min d'inactivité → première requête = ~50 s de réveil.
Le widget chat et le site continuent de fonctionner ; c'est juste lent au premier clic.

---

## Étape 3 — Configurer GitHub Pages (4 min)

1. Sur le repo GitHub → **Settings** → **Secrets and variables** → **Actions** → onglet **Variables** → **New repository variable** (×2) :
   | Name | Value |
   |---|---|
   | `VITE_API_URL` | `https://sana-api-xxxx.onrender.com/api` *(ton URL Render + `/api`)* |
   | `VITE_BASE` | `/sana-travel/` |
2. Toujours dans **Settings** → **Pages** → **Source** : sélectionne **GitHub Actions**.

---

## Étape 4 — Déployer le front (3 min)

```powershell
git commit --allow-empty -m "ci: trigger pages deploy" ; git push
```

Puis onglet **Actions** du repo → le workflow *Deploy web to GitHub Pages* doit passer au vert (~2 min).

Ton site est en ligne sur : **`https://<TON-PSEUDO>.github.io/sana-travel/`** 🎉

---

## Étape 5 — Vérification finale

| Test | Attendu |
|---|---|
| Ouvrir le site Pages | vitrine avec photos |
| Réserver une offre | référence `SNA-XXXXXX` reçue |
| Télécharger le devis PDF | fichier avec total DT |
| 💬 Poser une question au concierge | réponse sur les offres |
| Se connecter admin | dashboard accessible |

> Le compte admin prod est celui créé en local (`admin@sana.tn`) car même base MongoDB.

---

## Plus tard (optionnel)
- **Domaine personnalisé** : Settings → Pages → Custom domain.
- **CORS** : actuellement ouvert à toutes les origines (`cors: true`). Pour restreindre : remplacer par `{ origin: 'https://<pseudo>.github.io' }` dans `api/src/main.ts`.
- **Base de prod séparée** : créer `sana_travel_prod` dans Atlas et utiliser cette URI dans Render.
