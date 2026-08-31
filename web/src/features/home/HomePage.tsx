import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { artFor, fetchOffers } from '../../core/api'
import type { Offer } from '../../data/offers'
import { TESTIMONIALS } from '../../data/testimonials'
import { PosterImage } from '../../components/ui/PosterImage'
import { useT } from '../../core/i18n'
import { formatPrice } from '../../core/money'
import { ShieldIcon, BoltIcon, BotIcon, GlobeIcon, SearchIcon, StarIcon, SparkleIcon } from '../../components/ui/Icons'

const todayISO = () => new Date().toISOString().slice(0, 10)
const inDaysISO = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10)

const FALLBACK_NAMES = ['Magie de Cappadoce', 'Santorin', 'Maldives', 'Marrakech', 'Istanbul', 'Bali', 'Dubaï']
const EARLY_TARGET = new Date('2026-09-30T23:59:59').getTime()

/** bandeau Early Booking avec compte à rebours live */
function PromoBanner() {
  const { t } = useT()
  const c = useCountdown(EARLY_TARGET)
  const cells: [number, string][] = [
    [c.days, 'J'],
    [c.hours, 'H'],
    [c.mins, 'M'],
    [c.secs, 'S'],
  ]
  return (
    <section className="bg-deep relative overflow-hidden border-y border-white/10 py-9">
      <div className="bg-gold/8 absolute -top-24 right-1/3 h-56 w-56 rounded-full blur-3xl" />
      <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-10 gap-y-6 px-5 lg:px-8">
        <div className="flex items-center gap-5">
          <span className="bg-gold/15 text-gold hidden h-12 w-12 shrink-0 place-items-center rounded-full ring-1 ring-gold/30 sm:grid">
            <SparkleIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="kicker-gold">{t('promo.kicker')}</p>
            <p className="font-display mt-1.5 max-w-md text-lg leading-snug font-bold text-ivory sm:text-xl">{t('promo.line')}</p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="hidden text-right sm:block">
            <p className="text-mist text-[10px] font-black uppercase tracking-widest">{t('promo.ends')}</p>
          </div>
          <div className="flex gap-2">
            {cells.map(([v, u]) => (
              <div key={u} className="panel-dark min-w-[58px] rounded-xl px-2 py-2 text-center">
                <p className="text-gold-soft font-display text-2xl font-black tabular-nums">{String(v).padStart(2, '0')}</p>
                <p className="text-mist text-[9px] font-bold tracking-widest">{u}</p>
              </div>
            ))}
          </div>
          <Link
            to="/destinations"
            className="btn-luxe-gold hidden px-7 py-3.5 text-sm font-bold md:inline-block"
          >
            {t('home.cta1')} →
          </Link>
        </div>
      </div>
    </section>
  )
}

/** section témoignages voyageurs */
function Testimonials() {
  const { t } = useT()
  const items: [string, string, string][] = [
    ['Sarah B.', 'Maldives · Lune de miel', 'rev.r1'],
    ['Mehdi T.', 'Istanbul · En famille', 'rev.r2'],
    ['Amira K.', 'Cappadoce · Entre amies', 'rev.r3'],
  ]
  return (
    <section className="bg-deep relative overflow-hidden py-24 text-white lg:py-32">
      <div className="texture-dark pointer-events-none absolute inset-0 opacity-60" />
      <div className="animate-drift-a absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(226,176,74,0.18),transparent)] blur-2xl" />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="reveal text-center">
          <p className="kicker-gold">{t('rev.kicker')}</p>
          <h2 className="font-display mt-3 text-4xl font-black lg:text-5xl">{t('rev.title')}</h2>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {items.map(([name, trip, k], i) => (
            <figure
              key={name}
              className="reveal panel-dark hover:border-gold/30 group relative overflow-hidden p-9 transition-all duration-500 hover:-translate-y-1"
              style={{ transitionDelay: `${i * 110}ms` }}
            >
              <span className="font-display text-gold/25 absolute -top-3 right-5 text-8xl leading-none select-none">“</span>
              <div className="hairline-gold mb-6" />
              <blockquote className="text-mist mt-3 text-sm leading-relaxed italic">{t(k)}</blockquote>
              <figcaption className="mt-8 flex items-center gap-3">
                <span className="from-gold to-coral text-ink grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br text-xs font-black shadow-gold/25 shadow-lg">
                  {name[0]}
                </span>
                <span>
                  <span className="block text-sm font-bold">{name}</span>
                  <span className="text-mist block text-xs">{trip}</span>
                </span>
                <span className="text-gold ms-auto flex items-center gap-0.5 text-sm">
                  {[...Array(5)].map((_, j) => <StarIcon key={j} className="h-4 w-4" />)}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

/** compte à rebours temps réel vers une échéance */
function useCountdown(target: number) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const left = Math.max(0, target - now)
  return {
    days: Math.floor(left / 86400000),
    hours: Math.floor(left / 3600000) % 24,
    mins: Math.floor(left / 60000) % 60,
    secs: Math.floor(left / 1000) % 60,
  }
}

/** moteur de recherche de voyage — préremplit /booking */
function TripSearch({ offers }: { offers: Offer[] }) {
  const { t, lang } = useT()
  const nav = useNavigate()
  const [slug, setSlug] = useState(offers[0]?.slug ?? '')
  const [date, setDate] = useState(inDaysISO(30))
  const [pax, setPax] = useState(2)

  function search() {
    if (!slug) return
    const q = new URLSearchParams({ offer: slug, date, travelers: String(pax) })
    nav(`/booking?${q.toString()}`)
  }

  const field =
    'inp-light w-full text-sm font-semibold'
  const label = 'text-slate-soft mb-1.5 block text-[11px] font-bold uppercase tracking-[0.15em]'
  const selected = offers.find((o) => o.slug === slug)

  return (
    <div className="rounded-[2rem] bg-white/[0.98] p-6 shadow-[0_40px_90px_-24px_rgba(7,16,32,0.55)] ring-1 ring-black/5 backdrop-blur-xl sm:p-7">
      <p className="text-coral mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.35em]">
        <span className="bg-gold inline-block h-px w-8" /> {t('ts.kicker')}
      </p>
      <div className="grid items-end gap-4 md:grid-cols-[1.5fr_1fr_0.7fr_auto]">
        <div>
          <label className={label}>{t('ts.destination')}</label>
          <select value={slug} onChange={(e) => setSlug(e.target.value)} className={field}>
            {(offers.length ? offers : []).map((o) => (
              <option key={o.slug} value={o.slug}>
                {o.title} · {o.country}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>{t('ts.date')}</label>
          <input type="date" min={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} className={field} />
        </div>
        <div>
          <label className={label}>{t('ts.pax')}</label>
          <select value={pax} onChange={(e) => setPax(Number(e.target.value))} className={field}>
            {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={search}
          className="btn-gold inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-black hover:scale-[1.04]"
        >
          <SearchIcon className="h-4 w-4" /> {t('ts.search')}
        </button>
      </div>
      {selected && (
        <p className="text-slate-soft mt-4 inline-flex flex-wrap items-center gap-1.5 text-xs">
          {t('card.from')} {formatPrice(selected.priceEur, lang)} · {selected.nights} {t('card.nights')} ·
          <StarIcon className="text-gold h-3.5 w-3.5" /> {selected.rating || 4.8}
        </p>
      )}
    </div>
  )
}

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
      {/* ══════════ HERO ══════════ — plein écran immersif éditorial */}
      <section className="bg-ink relative flex min-h-[100svh] items-end overflow-hidden text-white">
        {/* grande photo de voyage en arrière-plan avec parallaxe */}
        <div className="absolute inset-0">
          <PosterImage
            src="https://images.unsplash.com/photo-1509233725247-49e657c54213?auto=format&fit=crop&w=1920&q=80"
            alt=""
          />
          {/* voiles de profondeur */}
          <div className="from-ink/60 via-ink/30 absolute inset-0 bg-gradient-to-t to-transparent" />
          <div className="from-ink absolute inset-0 bg-gradient-to-t via-transparent lg:via-ink/10" />
          <div className="absolute inset-0 bg-ink/20" />
          {/* grain & lueur */}
          <div className="texture-dark pointer-events-none absolute inset-0 opacity-40" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-5 pt-40 pb-20 lg:px-8">
          <div className="max-w-3xl">
            <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-[0.35em] uppercase backdrop-blur-md">
              <SparkleIcon className="text-gold h-3.5 w-3.5" /> {t('home.badge')}
            </p>

            <h1 className="font-display mt-8 text-6xl leading-[0.98] text-white sm:text-7xl lg:text-[6.5rem]">
              <span className="animate-fade-up block font-medium [animation-delay:120ms]">{t('home.title1')}</span>
              <span className="animate-fade-up block bg-gradient-to-r from-gold-soft via-gold to-coral bg-clip-text pr-3 pb-2 italic text-transparent [animation-delay:240ms]">
                {t('home.title2')}
              </span>
            </h1>

            <p className="text-white/80 animate-fade-up mt-7 max-w-xl text-lg font-light leading-relaxed [animation-delay:360ms]">
              {t('home.sub')}
            </p>

            <div className="animate-fade-up mt-10 flex flex-wrap items-center gap-4 [animation-delay:480ms]">
              <Link
                to="/booking"
                className="btn-gold group relative overflow-hidden px-10 py-4 text-sm shadow-gold/30 hover:shadow-gold/40"
              >
                {t('home.cta1')}
                <span className="ms-2 inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                to="/concierge"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-10 py-4 text-sm font-semibold backdrop-blur-md transition-colors hover:bg-white/15"
              >
                {t('home.cta2')}
              </Link>
            </div>
          </div>

          {/* bande stats + recherche intégrée */}
          <div className="mt-16 border-t border-white/15 pt-8">
            <dl className="grid max-w-2xl grid-cols-3 gap-6">
              {[
                ['12 000+', 'home.stat1'],
                ['40+', 'home.stat2'],
                ['4.9', 'home.stat3'],
              ].map(([v, k]) => (
                <div key={k}>
                  <dt className="font-display text-gold-soft text-4xl font-medium">{v}{k === 'home.stat3' && <StarIcon className="text-gold-soft mb-1 ml-1 inline h-5 w-5" />}</dt>
                  <dd className="text-white/60 mt-1 text-xs font-semibold uppercase tracking-wider">{t(k)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* scroll hint */}
        <div className="text-white/60 absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">{t('home.scroll')}</span>
          <span className="h-8 w-px animate-pulse bg-gradient-to-b from-transparent via-white/60 to-transparent" />
        </div>
      </section>

      {/* ══════════ MOTEUR DE RECHERCHE ══════════ */}
      <div className="bg-deep relative z-20 px-5">
        <div className="mx-auto max-w-5xl -mt-0 translate-y-0 pb-4 lg:px-8" style={{ marginTop: '-3.5rem' }}>
          <TripSearch offers={offers} />
        </div>
      </div>

      {/* ══════════ BARRE DE CONFIANCE ══════════ */}
      <section className="border-b border-white/5 bg-[#081120] py-8 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 md:grid-cols-4 lg:px-8">
          {[
            ['trust.secure', <ShieldIcon key="s" className="h-5 w-5" />],
            ['trust.devis', <BoltIcon key="b" className="h-5 w-5" />],
            ['trust.ai', <BotIcon key="a" className="h-5 w-5" />],
            ['trust.team', <GlobeIcon key="g" className="h-5 w-5" />],
          ].map(([k, icon]) => (
            <div key={k as string} className="flex items-center justify-center gap-3">
              <span className="border-gold/25 bg-gold/10 grid h-11 w-11 shrink-0 place-items-center rounded-full border text-gold">
                {icon}
              </span>
              <span className="text-mist text-xs leading-snug font-bold uppercase tracking-wider">{t(k as string)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ BANDEAU EARLY BOOKING ══════════ */}
      <PromoBanner />

      {/* ══════════ MARQUEE DESTINATIONS ══════════ */}
      <div className="border-white/10 overflow-hidden border-y bg-[#071020] py-5">
        <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap">
          {[0, 1].map((dup) => (
            <span key={dup} className="flex items-center gap-8">
              {(offers.length ? offers.map((o) => o.title) : FALLBACK_NAMES).map((name, i) => (
                <span key={`${dup}-${i}`} className="font-display flex items-center gap-8 text-xl font-black tracking-wide italic">
                  {name} <SparkleIcon className="text-gold mx-2 h-4 w-4 not-italic" />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ══════════ DESTINATIONS ══════════ */}
      <section className="bg-ivory py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="reveal flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="kicker-coral">{t('home.dest.kicker')}</p>
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
                    <div className="absolute top-4 end-4 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-black text-white backdrop-blur-md">
                      <StarIcon className="h-3.5 w-3.5 text-gold" /> {d.rating || 4.8}
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

      {/* ══════════ HOW IT WORKS — chapitre narratif immersif ══════════ */}
      <section className="bg-night relative overflow-hidden py-24 text-white lg:py-32">
        <div className="texture-dark pointer-events-none absolute inset-0 opacity-60" />
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="reveal flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="kicker-gold">{t('hiw.kicker')}</p>
              <h2 className="font-display mt-4 max-w-2xl text-5xl leading-[0.98] font-medium lg:text-6xl">
                {t('hiw.title')}
              </h2>
            </div>
          </div>

          <div className="mt-20 space-y-24">
            {[
              ['01', 'hiw.s1t', 'hiw.s1d', 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1200&q=80', false],
              ['02', 'hiw.s2t', 'hiw.s2d', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', true],
              ['03', 'hiw.s3t', 'hiw.s3d', 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80', false],
            ].map(([n, kt, kd, img, flip], i) => (
              <div
                key={n as string}
                className={`reveal grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${flip ? 'lg:[&>*:first-child]:order-2' : ''}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {/* image immersive éditoriale */}
                <div className="group relative overflow-hidden rounded-[2rem] shadow-2xl">
                  <div className="relative aspect-[4/3]">
                    <PosterImage src={img as string} alt={kt as string} />
                  </div>
                  <div className="from-ink/70 absolute inset-0 bg-gradient-to-t to-transparent" />
                  <span className="font-display absolute right-6 bottom-4 text-7xl font-medium text-white/25">{n as string}</span>
                </div>

                {/* texte à la une */}
                <div>
                  <span className="font-display bg-gradient-to-br from-gold-soft to-gold bg-clip-text text-6xl font-medium text-transparent">{n as string}</span>
                  <h3 className="font-display mt-4 text-4xl leading-tight font-medium">{t(kt as string)}</h3>
                  <p className="text-mist mt-5 max-w-md text-base leading-relaxed">{t(kd as string)}</p>
                  <div className="hairline-gold mt-7 w-24 opacity-60" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TÉMOIGNAGES ══════════ */}
      <Testimonials />

      {/* ══════════ CONCIERGE TEASER ══════════ */}
      <section className="bg-ivory overflow-hidden py-24 lg:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-2 lg:px-8">
          <div className="reveal">
            <p className="kicker-coral">{t('ct.kicker')}</p>
            <h2 className="font-display mt-3 text-4xl font-black lg:text-5xl">
              {t('ct.title')}
            </h2>
            <p className="text-slate-soft mt-5 leading-relaxed">
              {t('ct.body')}
            </p>
            <Link
              to="/concierge"
              className="btn-luxe-gold mt-8 inline-flex px-9 py-4 text-sm font-semibold"
            >
              {t('ct.cta')}
            </Link>
          </div>

          {/* mock conversation en verre */}
          <div className="reveal border-night/10 relative">
            <div className="bg-gold/20 absolute -top-6 -right-6 h-28 w-28 rounded-full blur-2xl" />
            <div className="panel-dark rounded-[2rem] p-6 shadow-luxe-dark sm:p-8">
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

      {/* avis clients — grand témoignage éditorial à la une */}
      <section className="bg-deep relative overflow-hidden py-28 text-white lg:py-40">
        <div className="texture-dark pointer-events-none absolute inset-0 opacity-50" />
        <div className="bg-gold/10 animate-drift-a absolute -bottom-40 left-1/4 h-96 w-96 rounded-full blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-5 text-center lg:px-8">
          <div className="reveal max-w-2xl mx-auto">
            <p className="kicker-coral">{t('tm.kicker')}</p>
            <h2 className="font-display mt-4 text-4xl font-medium lg:text-5xl">{t('tm.title')}</h2>
          </div>

          <figure className="reveal mt-14">
            <span className="font-display text-gold/40 block text-8xl leading-none">“</span>
            <blockquote className="font-display mx-auto mt-2 max-w-3xl text-2xl leading-snug font-light text-white/90 sm:text-3xl">
              {TESTIMONIALS[0].text[lang]}
            </blockquote>
            <figcaption className="mt-8 flex items-center justify-center gap-4">
              <span className="size-12 rounded-full bg-gradient-to-br from-gold to-coral font-black uppercase grid place-items-center text-ink">
                {TESTIMONIALS[0].name[0]}
              </span>
              <span className="text-left">
                <span className="block text-sm font-bold">{TESTIMONIALS[0].name}</span>
                <span className="text-mist block text-xs">{TESTIMONIALS[0].trip[lang]}</span>
              </span>
            </figcaption>
            <span className="text-gold mt-6 flex items-center justify-center gap-1">
              {[...Array(TESTIMONIALS[0].rating)].map((_, i) => <StarIcon key={`f${i}`} className="h-5 w-5" />)}
            </span>
          </figure>
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
