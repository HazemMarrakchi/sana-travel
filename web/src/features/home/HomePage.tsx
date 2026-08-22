import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { artFor, fetchOffers } from '../../core/api'
import type { Offer } from '../../data/offers'
import { PosterImage } from '../../components/ui/PosterImage'
import { useT } from '../../core/i18n'
import { formatPrice } from '../../core/money'

export function HomePage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const { t, lang } = useT()

  useEffect(() => {
    void fetchOffers().then((r) => setOffers(r.offers))
  }, [])

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
            {t('home.badge')}
          </p>

          <h1 className="font-display mt-6 max-w-4xl text-5xl leading-[1.05] font-black text-white sm:text-6xl lg:text-7xl">
            <span className="animate-fade-up block [animation-delay:120ms]">{t('home.title1')}</span>
            <span className="animate-fade-up text-gold block italic [animation-delay:240ms]">
              {t('home.title2')}
            </span>
          </h1>

          <p className="text-mist animate-fade-up mt-6 max-w-xl text-lg leading-relaxed [animation-delay:360ms]">
            {t('home.sub')}
          </p>

          <div className="animate-fade-up mt-10 flex flex-wrap items-center gap-4 [animation-delay:480ms]">
            <Link
              to="/booking"
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-gold to-gold-soft px-8 py-4 text-sm font-bold text-ink shadow-xl shadow-gold/25 transition-transform hover:scale-[1.03]"
            >
              {t('home.cta1')}
              <span className="ms-2 inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              to="/concierge"
              className="border-white/25 text-white hover:bg-white/10 rounded-full border px-8 py-4 text-sm font-semibold transition-colors"
            >
              {t('home.cta2')}
            </Link>
          </div>

          <dl className="border-white/10 animate-fade-up mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t pt-8 [animation-delay:600ms]">
            {[
              ['12 000+', 'home.stat1'],
              ['40+', 'home.stat2'],
              ['4.9★', 'home.stat3'],
            ].map(([v, k]) => (
              <div key={k}>
                <dt className="font-display text-3xl font-black text-white">{v}</dt>
                <dd className="text-mist mt-1 text-xs font-semibold uppercase tracking-wider">{t(k)}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* scroll hint */}
        <div className="text-mist absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">{t('home.scroll')}</span>
          <span className="border-white/20 h-8 w-px animate-pulse bg-gradient-to-b from-transparent via-white/50 to-transparent" />
        </div>
      </section>

      {/* ══════════ DESTINATIONS ══════════ */}
      <section className="bg-ivory py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-coral text-xs font-bold uppercase tracking-[0.35em]">{t('home.dest.kicker')}</p>
              <h2 className="font-display mt-3 text-4xl font-black lg:text-5xl">
                {t('home.dest.title')}
              </h2>
            </div>
            <Link
              to="/destinations"
              className="text-ink hover:text-coral text-sm font-bold underline decoration-gold decoration-2 underline-offset-8 transition-colors"
            >
              {t('home.dest.link')}
            </Link>
          </div>

          <div className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {offers.slice(0, 6).map((d) => (
              <Link
                key={d.slug}
                to={`/offres/${d.slug}`}
                className={`group relative aspect-[3/4] w-72 shrink-0 snap-start overflow-hidden rounded-3xl bg-gradient-to-br ${artFor(d.artKey)} shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl`}
              >
                <PosterImage src={d.photo ?? d.images?.[0]} alt={d.title} />
                <div className="from-ink/80 via-ink/10 absolute inset-0 bg-gradient-to-t to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/70">
                    {d.country} · {d.nights} {t('card.nights')}
                  </p>
                  <h3 className="font-display mt-1 text-3xl font-black text-white">{d.title}</h3>
                  <p className="mt-2 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm transition-colors group-hover:bg-gold group-hover:text-ink">
                    {t('card.from')} {formatPrice(d.priceEur, lang)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="bg-night py-24 text-white lg:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <p className="text-gold text-xs font-bold uppercase tracking-[0.35em]">{t('hiw.kicker')}</p>
          <h2 className="font-display mt-3 max-w-2xl text-4xl font-black lg:text-5xl">
            {t('hiw.title')}
          </h2>

          <ol className="mt-14 grid gap-10 md:grid-cols-3">
            {[
              ['01', 'hiw.s1t', 'hiw.s1d'],
              ['02', 'hiw.s2t', 'hiw.s2d'],
              ['03', 'hiw.s3t', 'hiw.s3d'],
            ].map(([n, kt, kd]) => (
              <li key={n} className="border-white/10 relative border-t pt-8">
                <span className="font-display text-gold absolute -top-6 end-0 text-7xl font-black opacity-30">
                  {n}
                </span>
                <h3 className="font-display text-2xl font-bold">{t(kt)}</h3>
                <p className="text-mist mt-3 text-sm leading-relaxed">{t(kd)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ══════════ CONCIERGE TEASER ══════════ */}
      <section className="bg-ivory overflow-hidden py-24 lg:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-coral text-xs font-bold uppercase tracking-[0.35em]">{t('ct.kicker')}</p>
            <h2 className="font-display mt-3 text-4xl font-black lg:text-5xl">
              {t('ct.title')}
            </h2>
            <p className="text-slate-soft mt-5 leading-relaxed">
              {t('ct.body')}
            </p>
            <Link
              to="/concierge"
              className="bg-ink text-gold hover:shadow-xl mt-8 inline-block rounded-full px-8 py-4 text-sm font-bold transition-shadow"
            >
              {t('ct.cta')}
            </Link>
          </div>

          {/* mock conversation */}
          <div className="bg-deep rounded-[2rem] p-6 shadow-2xl sm:p-8">
            <ChatBubble side="user">{t('chat.u1')}</ChatBubble>
            <ChatBubble side="sana">{t('chat.s1')}</ChatBubble>
            <ChatBubble side="user">{t('chat.u2')}</ChatBubble>
            <ChatBubble side="sana">{t('chat.s2')}</ChatBubble>
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
