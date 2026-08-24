import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { artFor, fetchOffer, fetchOffers } from '../../core/api'
import type { Offer } from '../../data/offers'
import { PosterImage } from '../../components/ui/PosterImage'
import { useT } from '../../core/i18n'
import { formatPrice } from '../../core/money'

export function OfferDetailPage() {
  const { slug = '' } = useParams()
  const [state, setState] = useState<{ offer?: Offer; live: boolean; loading: boolean }>({
    loading: true,
    live: false,
  })
  const [similar, setSimilar] = useState<Offer[]>([])
  const { t, lang } = useT()
  const [gal, setGal] = useState(0)

  useEffect(() => {
    void fetchOffer(slug).then((r) => setState({ ...r, loading: false }))
    setGal(0)
    void fetchOffers().then(({ offers }) => {
      const cur = offers.find((x) => x.slug === slug)
      if (!cur) return setSimilar([])
      const scored = offers
        .filter((x) => x.slug !== slug)
        .map((x) => ({
          o: x,
          s: (x.country === cur.country ? 2 : 0) + x.tags.filter((tg) => cur.tags.includes(tg)).length,
        }))
        .sort((a, b) => b.s - a.s || a.o.priceEur - b.o.priceEur)
        .slice(0, 4)
        .map((x) => x.o)
      setSimilar(scored)
    })
    try {
      const raw = localStorage.getItem('sana-recent')
      const arr: string[] = raw ? JSON.parse(raw) : []
      const next = [slug, ...arr.filter((s) => s !== slug)].slice(0, 8)
      localStorage.setItem('sana-recent', JSON.stringify(next))
    } catch {
      /* stockage indisponible */
    }
    window.scrollTo(0, 0)
  }, [slug])

  const o = state.offer
  if (state.loading) {
    return (
      <main className="bg-deep grid min-h-screen place-items-center text-white">
        <div className="animate-pulse text-center">
          <p className="font-display text-3xl font-black text-gold">SANA</p>
          <p className="text-mist mt-3 text-sm">{t('bk.loading')}</p>
        </div>
      </main>
    )
  }
  if (!o) {
    return (
      <main className="grid min-h-screen place-items-center bg-deep px-6 text-center">
        <div>
          <p className="font-display text-5xl font-black text-white">{t('od.notfound')}</p>
          <Link to="/destinations" className="text-coral mt-4 inline-block font-bold underline">
            {t('od.backlist')}
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main>
      {/* poster banner */}
      <section
        className={`relative flex min-h-[70vh] items-end overflow-hidden bg-gradient-to-br ${artFor(o.artKey)}`}
      >
        <PosterImage src={o.photo ?? o.images?.[gal] ?? o.images?.[0]} alt={o.title} />
        <div className="from-ink/85 via-ink/20 absolute inset-0 bg-gradient-to-t to-transparent" />
        {o.images && o.images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 z-10 flex max-w-[92%] -translate-x-1/2 flex-wrap justify-center gap-2">
            {o.images.map((u, i) => (
              <button
                key={i}
                onClick={() => setGal(i)}
                className={`h-14 w-20 overflow-hidden rounded-lg ring-2 transition ${i === gal ? 'ring-gold' : 'ring-white/30 hover:ring-white/60'}`}
                aria-label={`photo ${i + 1}`}
              >
                <img src={u} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-16 lg:px-8">
          <Link to="/destinations" className="text-white/80 hover:text-gold text-xs font-bold uppercase tracking-[0.3em] transition-colors">
            {t('od.back')}
          </Link>
          <h1 className="font-display mt-4 max-w-3xl text-5xl font-black text-white lg:text-7xl">
            {o.title}
          </h1>
          <p className="text-white/85 mt-3 max-w-2xl text-lg">{o.summary}</p>
        </div>
      </section>

      {/* details */}
      <section className="bg-ivory mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.6fr_1fr] lg:px-8">
        <div>
          <h2 className="font-display text-3xl font-black">{t('od.stay')}</h2>
          <p className="text-slate-soft mt-4 leading-relaxed">{o.description}</p>

          <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              ['od.lDest', `${o.city}, ${o.country}`],
              ['od.lDur', `${o.nights} ${t('od.nights')}`],
              ['od.lHotel', o.hotelName],
              ['od.lRating', `★ ${o.rating}`],
            ].map(([k, v]) => (
              <div key={k} className="border-gold border-t-2 pt-4">
                <dt className="text-slate-soft text-[11px] font-bold uppercase tracking-widest">{t(k)}</dt>
                <dd className="mt-1 text-sm font-semibold">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap gap-2">
            {o.tags.map((t) => (
              <span key={t} className="border-ink/15 rounded-full border px-3 py-1 text-xs font-bold">
                #{t}
              </span>
            ))}
          </div>
        </div>

        {/* booking card */}
        <aside className="bg-night h-fit rounded-3xl p-8 text-white shadow-xl lg:sticky lg:top-28">
          <p className="text-mist text-xs font-bold uppercase tracking-widest">{t('card.from')}</p>
          <p className="font-display mt-1 text-5xl font-black text-gold">{formatPrice(o.priceEur, lang)}</p>
          <p className="text-mist mt-1 text-sm">
            {t('od.perPerson')} · {o.nights} {t('od.nights')}
          </p>

          <ul className="border-white/10 my-6 space-y-2.5 border-t pt-6 text-sm">
            {['od.f1', 'od.f2', 'od.f3', 'od.f4'].map((k) => (
              <li key={k} className="flex items-center gap-2">
                <span className="bg-lagoon/20 text-lagoon grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-black">✓</span>
                {t(k)}
              </li>
            ))}
          </ul>

          <Link
            to={`/booking?offer=${o.slug}`}
            className="block rounded-full bg-gradient-to-r from-gold to-gold-soft py-4 text-center text-sm font-bold text-ink shadow-lg shadow-gold/25 transition-transform hover:scale-[1.02]"
          >
            {t('od.book')}
          </Link>
          <p className="text-mist mt-4 text-center text-xs">{t('od.devis')}</p>
        </aside>
      </section>

      {/* offres similaires */}
      {similar.length > 0 && (
        <section className="bg-ivory mx-auto max-w-7xl px-5 pb-24 lg:px-8">
          <h2 className="font-display text-3xl font-black">{t('od.similar')}</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((s) => (
              <Link
                key={s.slug}
                to={`/offres/${s.slug}`}
                onClick={() => window.scrollTo(0, 0)}
                className={`group relative aspect-[3/4] overflow-hidden rounded-3xl bg-gradient-to-br ${artFor(s.artKey)} shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl`}
              >
                <PosterImage src={s.photo ?? s.images?.[0]} alt={s.title} />
                <div className="from-ink/80 via-ink/10 absolute inset-0 bg-gradient-to-t to-transparent" />
                <span className="absolute top-4 right-4 rounded-full bg-white/85 px-3 py-1 text-xs font-bold backdrop-blur-sm">
                  ★ {s.rating}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/70">
                    {s.country} · {s.nights} {t('card.nights')}
                  </p>
                  <h3 className="font-display mt-1 text-xl font-black text-white">{s.title}</h3>
                  <p className="mt-2 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm transition-colors group-hover:bg-gold group-hover:text-ink">
                    {t('card.from')} {formatPrice(s.priceEur, lang)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
