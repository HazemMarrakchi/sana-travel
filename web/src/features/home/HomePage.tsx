import { Link } from 'react-router-dom'

const DESTINATIONS = [
  { name: 'Cappadoce', country: 'Turquie', price: 'à partir de 890€', art: 'from-orange-300 via-rose-400 to-purple-500' },
  { name: 'Santorin', country: 'Grèce', price: 'à partir de 1 190€', art: 'from-sky-300 via-blue-400 to-indigo-600' },
  { name: 'Maldives', country: 'Océan Indien', price: 'à partir de 2 450€', art: 'from-cyan-200 via-teal-400 to-emerald-600' },
  { name: 'Marrakech', country: 'Maroc', price: 'à partir de 560€', art: 'from-amber-300 via-orange-500 to-red-600' },
  { name: 'Istanbul', country: 'Turquie', price: 'à partir de 640€', art: 'from-violet-400 via-fuchsia-500 to-rose-500' },
  { name: 'Bali', country: 'Indonésie', price: 'à partir de 1 780€', art: 'from-lime-300 via-emerald-400 to-cyan-600' },
]

export function HomePage() {
  return (
    <main>
      {/* ══════════ HERO ══════════ */}
      <section className="bg-deep relative flex min-h-screen items-center overflow-hidden">
        {/* aurora glows */}
        <div className="absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(226,176,74,0.28),transparent)] blur-2xl" />
        <div className="bg-coral/15 absolute -right-40 top-1/3 h-[420px] w-[420px] rounded-full blur-3xl" />
        <div className="bg-lagoon/10 absolute -left-32 bottom-0 h-[380px] w-[380px] rounded-full blur-3xl" />

        <div className="relative mx-auto w-full max-w-7xl px-5 pt-32 pb-24 lg:px-8">
          <p className="animate-fade-up text-gold text-xs font-bold uppercase tracking-[0.35em]">
            Agence de voyage · Tunis — Paris — Dubaï
          </p>

          <h1 className="font-display mt-6 max-w-4xl text-5xl leading-[1.05] font-black text-white sm:text-6xl lg:text-7xl">
            <span className="animate-fade-up block [animation-delay:120ms]">Le monde est grand.</span>
            <span className="animate-fade-up text-gold block italic [animation-delay:240ms]">
              Votre temps ne l'est pas.
            </span>
          </h1>

          <p className="text-mist animate-fade-up mt-6 max-w-xl text-lg leading-relaxed [animation-delay:360ms]">
            Décrivez le voyage dont vous rêvez. Notre concierge IA le compose à partir des plus
            beaux hôtels et vols — vous n'avez plus qu'à faire vos valises.
          </p>

          <div className="animate-fade-up mt-10 flex flex-wrap items-center gap-4 [animation-delay:480ms]">
            <Link
              to="/booking"
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-gold to-gold-soft px-8 py-4 text-sm font-bold text-ink shadow-xl shadow-gold/25 transition-transform hover:scale-[1.03]"
            >
              Composer mon voyage
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              to="/concierge"
              className="border-white/25 text-white hover:bg-white/10 rounded-full border px-8 py-4 text-sm font-semibold transition-colors"
            >
              💬 Parler à Sana
            </Link>
          </div>

          <dl className="border-white/10 animate-fade-up mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t pt-8 [animation-delay:600ms]">
            {[
              ['12 000+', 'voyageurs heureux'],
              ['40+', 'destinations'],
              ['4.9★', 'note moyenne'],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="font-display text-3xl font-black text-white">{v}</dt>
                <dd className="text-mist mt-1 text-xs font-semibold uppercase tracking-wider">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* scroll hint */}
        <div className="text-mist absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Défiler</span>
          <span className="border-white/20 h-8 w-px animate-pulse bg-gradient-to-b from-transparent via-white/50 to-transparent" />
        </div>
      </section>

      {/* ══════════ DESTINATIONS ══════════ */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-coral text-xs font-bold uppercase tracking-[0.35em]">Collections</p>
              <h2 className="font-display mt-3 text-4xl font-black lg:text-5xl">
                Des lieux qui restent<br />gravés en vous.
              </h2>
            </div>
            <a href="#" className="text-ink hover:text-coral text-sm font-bold underline decoration-gold decoration-2 underline-offset-8 transition-colors">
              Voir les 40 destinations →
            </a>
          </div>

          <div className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {DESTINATIONS.map((d) => (
              <article
                key={d.name}
                className={`group relative aspect-[3/4] w-72 shrink-0 snap-start overflow-hidden rounded-3xl bg-gradient-to-br ${d.art} shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl`}
              >
                <div className="from-ink/80 via-ink/10 absolute inset-0 bg-gradient-to-t to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/70">{d.country}</p>
                  <h3 className="font-display mt-1 text-3xl font-black text-white">{d.name}</h3>
                  <p className="mt-2 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm transition-colors group-hover:bg-gold group-hover:text-ink">
                    {d.price}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="bg-night py-24 text-white lg:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <p className="text-gold text-xs font-bold uppercase tracking-[0.35em]">Simple par design</p>
          <h2 className="font-display mt-3 max-w-2xl text-4xl font-black lg:text-5xl">
            Trois étapes.<br />Zéro stress.
          </h2>

          <ol className="mt-14 grid gap-10 md:grid-cols-3">
            {[
              ['01', 'Rêvez à voix haute', 'Écrivez ou dites ce que vous imaginez : budget, ambiance, envies. Sana écoute.'],
              ['02', 'Sana compose', 'Notre IA assemble vols, hôtels et expériences en un itinéraire jour par jour — ajustable à volonté.'],
              ['03', 'Vous partez', 'Devis clair, acompte en ligne, documents dans votre coffre. On s\'occupe du reste.'],
            ].map(([n, t, d]) => (
              <li key={n} className="border-white/10 relative border-t pt-8">
                <span className="font-display text-gold absolute -top-6 right-0 text-7xl font-black opacity-30">
                  {n}
                </span>
                <h3 className="font-display text-2xl font-bold">{t}</h3>
                <p className="text-mist mt-3 text-sm leading-relaxed">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ══════════ CONCIERGE TEASER ══════════ */}
      <section className="overflow-hidden py-24 lg:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-coral text-xs font-bold uppercase tracking-[0.35em]">Rencontre Sana</p>
            <h2 className="font-display mt-3 text-4xl font-black lg:text-5xl">
              Un concierge IA qui connaît chaque offre de l'agence.
            </h2>
            <p className="text-slate-soft mt-5 leading-relaxed">
              Disponibilité, prix, visa, météo, idées d'excursions — Sana répond instantanément,
              24h/24, en français, arabe, anglais et allemand. Et si la question est délicate,
              un conseiller humain prend le relais sans coupure.
            </p>
            <Link
              to="/concierge"
              className="bg-ink text-gold hover:shadow-xl mt-8 inline-block rounded-full px-8 py-4 text-sm font-bold transition-shadow"
            >
              Essayer le concierge
            </Link>
          </div>

          {/* mock conversation */}
          <div className="bg-deep rounded-[2rem] p-6 shadow-2xl sm:p-8">
            <ChatBubble side="user">Une semaine en famille, plage + culture, budget 2500€ depuis Paris ✈️</ChatBubble>
            <ChatBubble side="sana">
              Magnifique choix ! Voici ma proposition : <b>Istanbul 3j</b> puis <b>Santorin 4j</b> —
              hôtel famille vue mer, vols inclus, <b>2 380€</b>. Je peux ajouter une journée croisière ?
            </ChatBubble>
            <ChatBubble side="user">Oui, et réserve ! 🌅</ChatBubble>
            <ChatBubble side="sana">
              C'est réservé ✓ Devis envoyé par email — il ne reste que les valises !
            </ChatBubble>
          </div>
        </div>
      </section>
    </main>
  )
}

function ChatBubble({ side, children }: { side: 'user' | 'sana'; children: React.ReactNode }) {
  const isUser = side === 'user'
  return (
    <div className={`mb-4 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser ? 'bg-white/10 text-mist rounded-br-md' : 'bg-gold text-ink rounded-bl-md font-medium'
        }`}
      >
        {!isUser && <span className="mr-1 font-black">SANA</span>}
        {children}
      </div>
    </div>
  )
}
