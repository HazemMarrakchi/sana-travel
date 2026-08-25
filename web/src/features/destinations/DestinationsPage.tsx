import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { artFor, fetchOffers } from '../../core/api'
import type { Offer } from '../../data/offers'
import { PosterImage } from '../../components/ui/PosterImage'
import { useT } from '../../core/i18n'
import { formatPrice } from '../../core/money'
import { nightsBetween } from '../../core/stay'

type SortKey = 'reco' | 'priceAsc' | 'priceDesc' | 'nightsDesc' | 'rating'

const SORTERS: Record<SortKey, (a: Offer, b: Offer) => number> = {
  reco: (a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating,
  priceAsc: (a, b) => a.priceEur - b.priceEur,
  priceDesc: (a, b) => b.priceEur - a.priceEur,
  nightsDesc: (a, b) => b.nights - a.nights,
  rating: (a, b) => b.rating - a.rating,
}

const isHotel = (o: Offer): boolean => o.tags.includes('hôtel')

const fmtDate = (iso: string, lang: string): string =>
  new Date(`${iso}T12:00:00`).toLocaleDateString(lang === 'ar' ? 'ar' : lang === 'en' ? 'en-GB' : 'fr-FR', {
    day: 'numeric',
    month: 'short',
  })

export function DestinationsPage() {
  const [{ offers, live }, setState] = useState<{ offers: Offer[]; live: boolean }>({
    offers: [],
    live: false,
  })
  const [filter, setFilter] = useState<string>('tout')
  const [sort, setSort] = useState<SortKey>('reco')
  const [country, setCountry] = useState<string>('all')
  const [city, setCity] = useState<string>('all')
  const { t, lang } = useT()
  const [query, setQuery] = useState('')
  /** le client choisit arrivée ET départ → nuits calculées, réservation directe */
  const [arrive, setArrive] = useState('')
  const [depart, setDepart] = useState('')
  const stayNights = arrive && depart ? nightsBetween(arrive, depart) : 0
  const stayInvalid = Boolean(arrive && depart && stayNights < 1)
  const stayReady = Boolean(arrive && depart && !stayInvalid)

  useEffect(() => {
    void fetchOffers().then(setState)
  }, [])

  /** cette page = hôtels uniquement (les voyages organisés vivent sur /offres) */
  const hotels = useMemo(() => offers.filter((o) => isHotel(o)), [offers])

  const tags = ['tout', ...Array.from(new Set(hotels.flatMap((o) => o.tags)))].filter(
    (tg) => tg !== 'hôtel',
  )

  const countries = useMemo(
    () => Array.from(new Set(hotels.map((o) => o.country))).sort((a, b) => a.localeCompare(b, 'fr')),
    [hotels],
  )

  /** cascade : les villes dépendent du pays sélectionné */
  const cities = useMemo(() => {
    const scoped = country === 'all' ? hotels : hotels.filter((o) => o.country === country)
    return Array.from(new Set(scoped.map((o) => o.city))).sort((a, b) => a.localeCompare(b, 'fr'))
  }, [hotels, country])

  useEffect(() => {
    if (filter !== 'tout' && !hotels.some((o) => o.tags.includes(filter))) setFilter('tout')
    if (country !== 'all' && !countries.includes(country)) setCountry('all')
    if (city !== 'all' && !cities.includes(city)) setCity('all')
  }, [hotels, countries, cities, filter, country, city])

  const q = query.trim().toLowerCase()
  const visible = hotels
    .filter((o) => country === 'all' ? true : o.country === country)
    .filter((o) => city === 'all' ? true : o.city === city)
    .filter((o) => (filter === 'tout' ? true : o.tags.includes(filter)))
    .filter((o) =>
      !q ||
      o.title.toLowerCase().includes(q) ||
      o.city.toLowerCase().includes(q) ||
      o.country.toLowerCase().includes(q) ||
      o.tags.some((tg) => tg.toLowerCase().includes(q)),
    )
    .sort(SORTERS[sort])

  return (
    <main className="bg-ivory min-h-screen">
      <div className="mx-auto max-w-7xl px-5 pt-12 pb-24 lg:px-8">
      <p className="text-coral text-xs font-bold uppercase tracking-[0.35em]">{t('dest.kicker')}</p>
      <h1 className="font-display mt-3 text-5xl font-black lg:text-6xl">
        {t('dest.title1')}<br />{t('dest.title2')}
      </h1>
      <p className="text-slate-soft mt-4 max-w-xl">
        {live ? t('dest.liveNote') : t('dest.demoNote')}
      </p>

      <div className="bg-ivory sticky top-[72px] z-30 -mx-5 mt-8 flex flex-col gap-4 border-b border-ink/5 px-5 py-3 lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* recherche + tri */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('dst.search')}
              className="border-ink/15 focus:border-gold w-full rounded-full border bg-white px-5 py-2.5 text-sm shadow-sm outline-none transition-colors sm:max-w-xs"
            />
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              aria-label={t('dest.country.label')}
              className="border-ink/15 focus:border-gold rounded-full border bg-white px-5 py-2.5 text-sm font-semibold shadow-sm outline-none transition-colors"
            >
              <option value="all">{t('dest.country.all')}</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              aria-label={t('dest.city.label')}
              className="border-ink/15 focus:border-gold rounded-full border bg-white px-5 py-2.5 text-sm font-semibold shadow-sm outline-none transition-colors"
            >
              <option value="all">{t('dest.city.all')}</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label={t('dest.sort.reco')}
              className="border-ink/15 focus:border-gold rounded-full border bg-white px-5 py-2.5 text-sm font-semibold shadow-sm outline-none transition-colors"
            >
              <option value="reco">{t('dest.sort.reco')}</option>
              <option value="priceAsc">{t('dest.sort.priceAsc')}</option>
              <option value="priceDesc">{t('dest.sort.priceDesc')}</option>
              <option value="nightsDesc">{t('dest.sort.nights')}</option>
              <option value="rating">{t('dest.sort.rating')}</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                filter === tag
                  ? 'border-ink bg-ink text-gold'
                  : 'border-ink/15 hover:border-ink/40'
              }`}
            >
              {tag === 'tout' ? t('filter.all') : tag}
            </button>
          ))}
        </div>
        <p className="text-slate-soft text-[11px] font-bold uppercase tracking-[0.3em]">
          {visible.length} {t('dest.offersWord')}
        </p>
      </div>

      {/* planificateur de séjour : le client choisit arrivée ET départ */}
      <div className="border-gold/30 bg-white mt-6 flex flex-col gap-4 rounded-3xl border p-5 shadow-sm sm:flex-row sm:items-end sm:gap-5">
        <div>
          <label htmlFor="sana-arrive" className="text-slate-soft text-[11px] font-bold uppercase tracking-widest">
            📅 {t('bk.arrive')}
          </label>
          <input
            id="sana-arrive"
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            value={arrive}
            onChange={(e) => setArrive(e.target.value)}
            className="border-ink/15 focus:border-gold mt-1 block rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold outline-none transition-colors"
          />
        </div>
        <div>
          <label htmlFor="sana-depart" className="text-slate-soft text-[11px] font-bold uppercase tracking-widest">
            🛫 {t('bk.depart')}
          </label>
          <input
            id="sana-depart"
            type="date"
            min={arrive || new Date().toISOString().slice(0, 10)}
            value={depart}
            onChange={(e) => setDepart(e.target.value)}
            className={`border-ink/15 focus:border-gold mt-1 block rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold outline-none transition-colors ${stayInvalid ? 'border-coral' : ''}`}
          />
        </div>
        {arrive && depart && !stayInvalid ? (
          <p className="text-lagoon pb-2.5 text-sm font-bold">
            ⏱ {stayNights} {t('od.nights')}
          </p>
        ) : null}
        {stayInvalid ? (
          <p className="text-coral pb-2.5 text-xs font-bold">{t('bk.invalidDates')}</p>
        ) : arrive ? (
          <button
            onClick={() => {
              setArrive('')
              setDepart('')
            }}
            className="text-slate-soft hover:text-coral pb-2.5 text-xs font-bold underline"
          >
            ✕ {t('dest.clearDates')}
          </button>
        ) : (
          <p className="text-slate-soft flex-1 pb-0.5 text-xs leading-relaxed">{t('dest.plannerHint')}</p>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="bg-night mt-12 rounded-3xl p-10 text-center">
          <p className="font-display text-2xl font-black">{t('dest.emptyTitle')}</p>
          <p className="text-slate-soft mt-2 text-sm">{t('dest.emptyBody')}</p>
          <button
            onClick={() => {
              setQuery('')
              setFilter('tout')
              setCountry('all')
              setCity('all')
            }}
            className="from-gold to-gold-soft text-ink mt-6 rounded-full bg-gradient-to-r px-8 py-3 text-sm font-bold shadow-lg transition-transform hover:scale-[1.02]"
          >
            {t('dest.emptyReset')}
          </button>
        </div>
      ) : (
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((o) => {
          return (
          <Link
            key={o.slug}
            to={stayReady ? `/booking?offer=${o.slug}&date=${arrive}&depart=${depart}` : `/offres/${o.slug}`}
            className="group border-ink/5 hover:border-gold/40 flex flex-col overflow-hidden rounded-3xl border bg-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${artFor(o.artKey)}`}>
              <PosterImage src={o.photo ?? o.images?.[0]} alt={o.title} />
              <span className="absolute top-4 right-4 rounded-full bg-white/85 px-3 py-1 text-xs font-bold backdrop-blur-sm">
                ★ {o.rating}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-6">
              <p className="text-gold text-xs font-bold uppercase tracking-[0.25em]">
                {o.country} · {stayReady ? stayNights : o.nights} {t('card.nights')}
              </p>
              <h2 className="font-display mt-1.5 text-2xl font-black text-ink">{o.title}</h2>
              <p className="text-slate-soft mt-2 line-clamp-2 text-sm">{o.summary}</p>
              {stayReady && (
                <p className="text-lagoon mt-2 text-xs font-bold">
                  📅 {fmtDate(arrive, lang)} → {fmtDate(depart, lang)}
                </p>
              )}
              <p className={`mt-4 inline-block w-fit rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${stayReady ? 'bg-coral text-white group-hover:bg-ink' : 'bg-night text-gold group-hover:from-gold group-hover:to-gold-soft group-hover:bg-gradient-to-r group-hover:text-ink'}`}>
                {stayReady ? `🛎 ${t('dest.book')}` : `${t('card.from')} ${formatPrice(o.priceEur, lang)}`}
              </p>
            </div>
          </Link>
          )
        })}
        </div>
      )}

      {/* bannière : rien ne vous convient ? voyage libre */}
      <div className="bg-night mt-14 flex flex-col items-center gap-5 rounded-3xl p-10 text-center shadow-xl">
        <p className="text-gold text-xs font-bold uppercase tracking-[0.3em]">{t('dest.hl.kicker')}</p>
        <h2 className="font-display max-w-2xl text-3xl font-black text-white">{t('dest.hl.title')}</h2>
        <p className="text-mist max-w-xl text-sm leading-relaxed">{t('dest.hl.body')}</p>
        <Link
          to="/voyage-libre"
          className="from-gold to-gold-soft text-ink mt-1 rounded-full bg-gradient-to-r px-8 py-3.5 text-sm font-bold shadow-lg transition-transform hover:scale-[1.03]"
        >
          {t('dest.hl.btn')}
        </Link>
      </div>
      </div>
    </main>
  )
}
