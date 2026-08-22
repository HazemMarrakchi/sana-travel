import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { artFor, fetchOffers } from '../../core/api'
import type { Offer } from '../../data/offers'
import { PosterImage } from '../../components/ui/PosterImage'
import { useT } from '../../core/i18n'
import { formatPrice } from '../../core/money'

/** révèle les sections quand elles entrent dans le viewport */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const targets = el.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible')
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.12 },
    )
    targets.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])
  return ref
}

/** carte inclinée en 3D suivant le curseur */
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(900px) rotateY(${px * 14}deg) rotateX(${py * -12}deg) translateZ(12px)`
  }
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg)'
  }
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`tilt-card transition-transform duration-300 ease-out ${className}`}
    >
      <span className="shine rounded-3xl" />
      {children}
    </div>
  )
}

export function HomePage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const { t, lang } = useT()
  const revealRef = useReveal()

  useEffect(() => {
    void fetchOffers().then((r) => setOffers(r.offers))
  }, [])

  return (
    <main ref={revealRef}>
      {/* ══════════ HERO ══════════ */}
      <section className="bg-deep relative flex min-h-[92vh] items-center overflow-hidden">
        {/* aurores vivantes */}
        <div className="animate-drift-a absolute -top-40 left-1/2 h-[560px] w-[900px] rounded-full bg-[radial-gradient(closest-side,rgba(226,176,74,0.30),transparent)] blur-2xl" />
        <div className="bg-coral/15 animate-drift-b absolute -right-40 top-1/3 h-[420px] w-[420px] rounded-full blur-3xl" />
        <div className="bg-lagoon/10 absolute -left-32 bottom-0 h-[380px] w-[380px] rounded-full blur-3xl" />
        {/* grille subtile */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:72px_72px]" />

        <div className="relative mx-auto w-full max-w-7xl px-5 pt-16 pb-24 lg:px-8">
          <p className="ring-gold/40 text-gold animate-fade-up inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs font-bold tracking-[0.35em] uppercase ring-1 backdrop-blur-sm">
            ✦ {t('home.badge')}
          </p>

          <h1 className="font-display mt-7 max-w-4xl text-5xl leading-[1.04] font-black text-white sm:text-6xl lg:text-[5.2rem]">
            <span className="animate-fade-up block [animation-delay:120ms]">{t('home.title1')}</span>
            <span className="animate-fade-up block bg-gradient-to-r from-gold-soft via-gold to-coral bg-clip-text pr-2 pb-2 italic text-transparent [animation-delay:240ms]">
              {t('home.title2')}
            </span>
          </h1>

          <p className="text-mist animate-fade-up mt-6 max-w-xl text-lg leading-relaxed [animation-delay:360ms]">
            {t('home.sub')}
          </p>

          <div className="animate-fade-up mt-10 flex flex-wrap items-center gap-4 [animation-delay:480ms]">
            <Link
              to="/booking"
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-gold to-gold-soft px-9 py-4 text-sm font-bold text-ink shadow-xl shadow-gold/30 transition-all hover:scale-[1.04] hover:shadow-2xl hover:shadow-gold/40"
            >
              {t('home.cta1')}
              <span className="ms-2 inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              to="/concierge"
              className="border-white/25 text-white hover:border-white/50 hover:bg-white/10 rounded-full border px-9 py-4 text-sm font-semibold backdrop-blur-sm transition-all"
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
                <dt className="font-display text-gold-soft text-3xl font-black">{v}</dt>
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
          <div className="reveal flex flex-wrap items-end justify-between gap-4">
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

          <div className="reveal mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {offers.slice(0, 6).map((d) => (
              <div key={d.slug} className="w-72 shrink-0 snap-start">
                <TiltCard className="rounded-3xl">
                  <Link
                    to={`/offres/${d.slug}`}
                    className={`group relative block aspect-[3/4] overflow-hidden rounded-3xl bg-gradient-to-br ${artFor(d.artKey)} shadow-xl transition-shadow duration-500 hover:shadow-2xl`}
                  >
                    <PosterImage src={d.photo ?? d.images?.[0]} alt={d.title} />
                    <div className="from-ink/85 via-ink/10 absolute inset-0 bg-gradient-to-t to-transparent" />
                    <div className="absolute top-4 end-4 rounded-full bg-white/15 px-3 py-1.5 text-xs font-black text-white backdrop-blur-md">
                      ★ {d.rating || 4.8}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/70">
                        {d.country} · {d.nights} {t('card.nights')}
                      </p>
                      <h3 className="font-display mt-1 text-3xl font-black text-white">{d.title}</h3>
                      <p className="mt-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm transition-colors group-hover:bg-gold group-hover:text-ink">
                        {t('card.from')} {formatPrice(d.priceEur, lang)}
                      </p>
                    </div>
                  </Link>
                </TiltCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="bg-night relative overflow-hidden py-24 text-white lg:py-32">
        <div className="bg-lagoon/8 pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full blur-3xl" />
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="reveal">
            <p className="text-gold text-xs font-bold uppercase tracking-[0.35em]">{t('hiw.kicker')}</p>
            <h2 className="font-display mt-3 max-w-2xl text-4xl font-black lg:text-5xl">
              {t('hiw.title')}
            </h2>
          </div>

          <ol className="mt-16 grid gap-10 md:grid-cols-3">
            {[
              ['01', 'hiw.s1t', 'hiw.s1d'],
              ['02', 'hiw.s2t', 'hiw.s2d'],
              ['03', 'hiw.s3t', 'hiw.s3d'],
            ].map(([n, kt, kd], i) => (
              <li
                key={n}
                className="border-night reveal group relative rounded-3xl border bg-white/[0.03] p-8 transition-all duration-500 hover:-translate-y-1 hover:bg-white/[0.06]"
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <span className="font-display bg-gradient-to-br from-gold-soft to-gold bg-clip-text text-6xl font-black text-transparent opacity-60 transition-opacity group-hover:opacity-100">
                  {n}
                </span>
                <h3 className="font-display mt-4 text-2xl font-bold">{t(kt)}</h3>
                <p className="text-mist mt-3 text-sm leading-relaxed">{t(kd)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ══════════ CONCIERGE TEASER ══════════ */}
      <section className="bg-ivory overflow-hidden py-24 lg:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-2 lg:px-8">
          <div className="reveal">
            <p className="text-coral text-xs font-bold uppercase tracking-[0.35em]">{t('ct.kicker')}</p>
            <h2 className="font-display mt-3 text-4xl font-black lg:text-5xl">
              {t('ct.title')}
            </h2>
            <p className="text-slate-soft mt-5 leading-relaxed">
              {t('ct.body')}
            </p>
            <Link
              to="/concierge"
              className="bg-ink text-gold hover:shadow-ink/20 mt-8 inline-block rounded-full px-9 py-4 text-sm font-bold shadow-lg transition-all hover:scale-[1.03] hover:shadow-xl"
            >
              {t('ct.cta')}
            </Link>
          </div>

          {/* mock conversation en verre */}
          <div className="reveal border-night/10 relative">
            <div className="bg-gold/20 absolute -top-6 -right-6 h-28 w-28 rounded-full blur-2xl" />
            <div className="from-deep to-night rounded-[2rem] bg-gradient-to-br p-6 shadow-2xl ring-1 ring-white/10 sm:p-8">
              <div className="mb-5 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-coral/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-gold/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-lagoon/80" />
                <span className="text-mist ms-2 text-[10px] font-bold tracking-widest uppercase">SANA · IA</span>
              </div>
              <ChatBubble side="user">{t('chat.u1')}</ChatBubble>
              <ChatBubble side="sana">{t('chat.s1')}</ChatBubble>
              <ChatBubble side="user">{t('chat.u2')}</ChatBubble>
              <ChatBubble side="sana">{t('chat.s2')}</ChatBubble>
            </div>
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
