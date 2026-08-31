import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { artFor, fetchOffers } from '../../core/api'
import type { Offer } from '../../data/offers'
import { PosterImage } from '../../components/ui/PosterImage'
import { StarIcon } from '../../components/ui/Icons'
import { useT } from '../../core/i18n'
import { formatPrice } from '../../core/money'
import { isHotelOffer } from '../../core/stay'

export function OffersPage() {
  const [{ offers, live }, setState] = useState<{ offers: Offer[]; live: boolean }>({
    offers: [],
    live: false,
  })
  const { t } = useT()

  useEffect(() => {
    void fetchOffers().then(setState)
  }, [])

  /** cette page = voyages organisés uniquement (les hôtels vivent sur /destinations) */
  const tours = useMemo(
    () => offers.filter((o) => !isHotelOffer(o)).sort((a, b) => Number(b.featured) - Number(a.featured) || a.priceEur - b.priceEur),
    [offers],
  )

  return (
    <main className="bg-ivory min-h-screen">
      {/* en-tête éditorial */}
      <div className="relative overflow-hidden bg-deep text-white">
        <div className="absolute inset-0">
          <PosterImage
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1920&q=80"
            alt=""
          />
          <div className="from-deep absolute inset-0 bg-gradient-to-t via-deep/40 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-6xl px-5 pt-28 pb-20 lg:px-8">
          <p className="kicker-gold">{t('op.kicker')}</p>
          <h1 className="font-display mt-4 max-w-3xl text-5xl leading-[0.98] font-medium sm:text-6xl lg:text-7xl">
            {t('op.title')}
          </h1>
          <p className="text-white/80 mt-6 max-w-xl text-base font-light leading-relaxed">
            {live ? t('dest.liveNote') : t('dest.demoNote')}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 pt-14 pb-24 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          {tours.map((o) => (
            <Link
              key={o.slug}
              to={`/offres/${o.slug}`}
              className="card-light group flex flex-col overflow-hidden rounded-[1.75rem] transition-all duration-500 hover:-translate-y-1 hover:shadow-luxe"
            >
              <div className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${artFor(o.artKey)}`}>
                <PosterImage src={o.photo ?? o.images?.[0]} alt={o.title} />
                <div className="from-ink/70 absolute inset-0 bg-gradient-to-t to-transparent" />
                <span className="text-gold absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-bold backdrop-blur-sm">
                  <StarIcon className="h-3.5 w-3.5" /> {o.rating}
                </span>
                <span className="bg-night text-gold absolute left-4 bottom-4 inline-block rounded-full px-4 py-1.5 text-xs font-bold">
                  {t('card.from')} {formatPrice(o.priceEur, 'fr')}
                </span>
              </div>
              <div className="flex-1 p-6">
                <p className="text-gold text-[11px] font-bold uppercase tracking-[0.25em]">
                  {o.country} · {o.city} · {o.nights} {t('od.nights')}
                </p>
                <h2 className="font-display mt-2 text-2xl font-semibold leading-tight text-ink">{o.title}</h2>
                <p className="text-slate-soft mt-2 line-clamp-2 text-sm">{o.summary}</p>
              </div>
            </Link>
          ))}
        </div>

        {tours.length === 0 && (
          <p className="text-slate-soft mt-12 text-center">{t('dest.emptyBody')}</p>
        )}
      </div>
    </main>
  )
}
