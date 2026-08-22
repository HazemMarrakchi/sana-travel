import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { artFor, fetchOffers } from '../../core/api'
import type { Offer } from '../../data/offers'
import { PosterImage } from '../../components/ui/PosterImage'

export function DestinationsPage() {
  const [{ offers, live }, setState] = useState<{ offers: Offer[]; live: boolean }>({
    offers: [],
    live: false,
  })
  const [filter, setFilter] = useState<string>('tout')

  useEffect(() => {
    void fetchOffers().then(setState)
  }, [])

  const tags = ['tout', ...Array.from(new Set(offers.flatMap((o) => o.tags)))]
  const visible = filter === 'tout' ? offers : offers.filter((o) => o.tags.includes(filter))

  return (
    <main className="bg-ivory min-h-screen">
      <div className="mx-auto max-w-7xl px-5 pt-32 pb-24 lg:px-8">
      <p className="text-coral text-xs font-bold uppercase tracking-[0.35em]">Toutes nos offres</p>
      <h1 className="font-display mt-3 text-5xl font-black lg:text-6xl">
        Où partirez-vous<br />la prochaine fois ?
      </h1>
      <p className="text-slate-soft mt-4 max-w-xl">
        {live
          ? '✅ Offres en direct de notre système de réservation.'
          : 'Mode démonstration — offres statiques (l\'API est endormie).'}
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {tags.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
              filter === t
                ? 'border-ink bg-ink text-gold'
                : 'border-ink/15 hover:border-ink/40'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((o) => (
          <Link
            key={o.slug}
            to={`/offres/${o.slug}`}
            className={`group relative aspect-[3/4] overflow-hidden rounded-3xl bg-gradient-to-br ${artFor(o.artKey)} shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl`}
          >
            <PosterImage src={o.photo ?? o.images?.[0]} alt={o.title} />
            <div className="from-ink/80 via-ink/10 absolute inset-0 bg-gradient-to-t to-transparent" />
            <span className="absolute top-4 right-4 rounded-full bg-white/85 px-3 py-1 text-xs font-bold backdrop-blur-sm">
              ★ {o.rating}
            </span>
            <div className="absolute inset-x-0 bottom-0 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/70">
                {o.country} · {o.nights} nuits
              </p>
              <h2 className="font-display mt-1 text-3xl font-black text-white">{o.title}</h2>
              <p className="text-white/80 mt-1 line-clamp-2 text-sm">{o.summary}</p>
              <p className="mt-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm transition-colors group-hover:bg-gold group-hover:text-ink">
                à partir de {o.priceEur}€
              </p>
            </div>
          </Link>
        ))}
      </div>
      </div>
    </main>
  )
}
