import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { artFor, fetchOffers } from '../../core/api'
import type { Offer } from '../../data/offers'
import { PosterImage } from '../../components/ui/PosterImage'
import { useT } from '../../core/i18n'
import { formatPrice } from '../../core/money'

type OfferType = 'all' | 'tours' | 'hotels'
const isHotel = (o: Offer): boolean => o.tags.includes('hôtel')

export function OffersPage() {
  const [{ offers, live }, setState] = useState<{ offers: Offer[]; live: boolean }>({
    offers: [],
    live: false,
  })
  const [type, setType] = useState<OfferType>('all')
  const { t } = useT()

  useEffect(() => {
    void fetchOffers().then(setState)
  }, [])

  const visible = useMemo(
    () =>
      offers
        .filter((o) => (type === 'all' ? true : type === 'hotels' ? isHotel(o) : !isHotel(o)))
        .sort((a, b) => Number(b.featured) - Number(a.featured) || a.priceEur - b.priceEur),
    [offers, type],
  )

  return (
    <main className="bg-ivory min-h-screen">
      <div className="mx-auto max-w-6xl px-5 pt-12 pb-24 lg:px-8">
        <p className="text-coral text-xs font-bold uppercase tracking-[0.35em]">{t('op.kicker')}</p>
        <h1 className="font-display mt-3 text-5xl font-black lg:text-6xl">{t('op.title')}</h1>
        <p className="text-slate-soft mt-4 max-w-xl">
          {live ? t('dest.liveNote') : t('dest.demoNote')}
        </p>

        <div className="mt-8 inline-flex w-fit rounded-full border border-ink/10 bg-white p-1 shadow-sm">
          {(
            [
              ['all', 'dest.tabAll'],
              ['tours', 'dest.tabTours'],
              ['hotels', 'dest.tabHotels'],
            ] as const
          ).map(([v, k]) => (
            <button
              key={v}
              onClick={() => setType(v)}
              className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                type === v ? 'bg-ink text-gold shadow-sm' : 'text-slate-soft hover:text-ink'
              }`}
            >
              {t(k)}
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4">
          {visible.map((o) => (
            <Link
              key={o.slug}
              to={`/offres/${o.slug}`}
              className="group border-ink/5 hover:border-gold/50 flex items-center gap-5 rounded-3xl border bg-white p-4 shadow-sm transition-all hover:shadow-lg"
            >
              <div className={`relative h-28 w-44 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br ${artFor(o.artKey)}`}>
                <PosterImage src={o.photo ?? o.images?.[0]} alt={o.title} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-slate-soft text-[11px] font-bold uppercase tracking-[0.25em]">
                  {o.country} · {o.city} · {o.nights} {t('od.nights')} · ★ {o.rating}
                </p>
                <h2 className="font-display mt-1 truncate text-xl font-black text-ink">{o.title}</h2>
                <p className="text-slate-soft mt-1 hidden truncate text-sm sm:block">{o.summary}</p>
              </div>
              <div className="shrink-0 text-end">
                <p className="bg-night group-hover:from-gold group-hover:to-gold-soft group-hover:text-ink inline-block rounded-full px-4 py-1.5 text-xs font-bold text-gold transition-colors">
                  {t('card.from')} {formatPrice(o.priceEur, 'fr')}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {visible.length === 0 && (
          <p className="text-slate-soft mt-12 text-center">{t('dest.emptyBody')}</p>
        )}
      </div>
    </main>
  )
}
