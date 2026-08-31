import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { artFor, fetchOffer, fetchOffers } from '../../core/api'
import type { Offer } from '../../data/offers'
import { PosterImage } from '../../components/ui/PosterImage'
import { StarIcon, StarEmptyIcon, AlertIcon, CalculatorIcon, CompassIcon, HeartIcon, HeartEmptyIcon } from '../../components/ui/Icons'
import { useT } from '../../core/i18n'
import { formatPrice, formatPriceExact } from '../../core/money'
import { API_BASE, useAuth } from '../../core/auth'
import { loadFavorites, toggleFavorite } from '../../core/favorites'
import { BOARDS, isHotelOffer, nightsBetween, quoteStay } from '../../core/stay'
import type { Board } from '../../core/stay'

interface Review {
  _id: string
  offerSlug: string
  authorName: string
  rating: number
  comment: string
  createdAt: string
}

export function OfferDetailPage() {
  const { slug = '' } = useParams()
  const [state, setState] = useState<{ offer?: Offer; live: boolean; loading: boolean }>({
    loading: true,
    live: false,
  })
  const [similar, setSimilar] = useState<Offer[]>([])
  const { t, lang } = useT()
  const [gal, setGal] = useState(0)
  const { token } = useAuth()
  const [isFav, setIsFav] = useState(false)
  const [reviews, setReviews] = useState<Review[] | null>(null)
  const [rName, setRName] = useState('')
  const [rRating, setRRating] = useState(5)
  const [rComment, setRComment] = useState('')
  const [rDone, setRDone] = useState(false)
  const [rError, setRError] = useState('')

  useEffect(() => {
    void fetchOffer(slug).then((r) => setState({ ...r, loading: false }))
    setGal(0)
    setRDone(false)
    setRError('')
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
    void fetch(`${API_BASE}/reviews?slug=${encodeURIComponent(slug)}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((d: unknown) => setReviews(Array.isArray(d) ? (d as Review[]) : []))
      .catch(() => setReviews([]))
    void loadFavorites(token).then((favs) => setIsFav(favs.includes(slug)))
    try {
      const raw = localStorage.getItem('sana-recent')
      const arr: string[] = raw ? JSON.parse(raw) : []
      const next = [slug, ...arr.filter((s) => s !== slug)].slice(0, 8)
      localStorage.setItem('sana-recent', JSON.stringify(next))
    } catch {
      /* stockage indisponible */
    }
    window.scrollTo(0, 0)
  }, [slug, token])

  async function onToggleFav() {
    try {
      const next = await toggleFavorite(slug, token)
      setIsFav(next.includes(slug))
    } catch {
      /* silencieux */
    }
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!state.offer || rName.trim().length < 2 || rComment.trim().length < 5) {
      setRError(t('rvl.error'))
      return
    }
    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerSlug: state.offer.slug, authorName: rName, rating: rRating, comment: rComment }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setRName('')
      setRComment('')
      setRRating(5)
      setRDone(true)
      const d = (await res.json()) as Review
      setReviews((rs) => [d, ...(rs ?? [])])
    } catch {
      setRError(t('rvl.error'))
    }
  }


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
      {/* hero texte pur â€” aucune photo en fond */}
      <section className="bg-deep relative overflow-hidden text-white">
        {/* grande image d'offre en hero immersif */}
        <div className="absolute inset-0">
          <PosterImage src={o.images?.[gal] ?? o.photo ?? o.images?.[0]} alt={o.title} />
          <div className="from-deep absolute inset-0 bg-gradient-to-t via-deep/60 to-deep/40" />
          <div className="absolute inset-0 bg-ink/30" />
          <div className="texture-dark pointer-events-none absolute inset-0 opacity-40" />
        </div>
        <div className="relative mx-auto max-w-5xl px-5 py-24 lg:px-8 lg:py-36">
            <Link to={isHotelOffer(o) ? '/destinations' : '/offres'} className="text-white/80 hover:text-gold inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.3em] backdrop-blur-md transition-colors">
              ← {t('od.back')}
            </Link>
          <p className="text-gold mt-10 text-xs font-bold uppercase tracking-[0.25em]">
            {o.country} · {o.nights} {t('od.nights')} · <StarIcon className="text-gold mb-0.5 -ml-0.5 inline h-3.5 w-3.5" /> {o.rating}
          </p>
          <h1 className="font-display mt-4 text-5xl leading-[0.98] font-medium sm:text-6xl lg:text-7xl">
            {o.title}
          </h1>
          <p className="text-white/80 mt-6 max-w-2xl text-lg font-light leading-relaxed">{o.summary}</p>
        </div>
      </section>

      {/* galerie — bandeau de vignettes sélectionnables */}
      <section className="bg-deep">
        <div className="mx-auto -mt-10 max-w-7xl px-5 lg:px-8">
          <div className="relative">
            <button
              onClick={() => void onToggleFav()}
              aria-label={isFav ? t('fav.remove') : t('fav.add')}
              className={`absolute -top-4 right-6 z-10 grid size-12 place-items-center rounded-full text-lg shadow-xl backdrop-blur-sm transition-transform hover:scale-110 ${
                isFav ? 'bg-coral text-white' : 'bg-white/90 text-ink'
              }`}
            >
              {isFav ? <HeartIcon className="h-5 w-5" /> : <HeartEmptyIcon className="h-5 w-5" />}
            </button>
            {o.images && o.images.length > 1 ? (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {o.images.map((u, i) => (
                  <button
                    key={i}
                    onClick={() => setGal(i)}
                    className={`relative aspect-[3/2] h-24 shrink-0 overflow-hidden rounded-xl transition ${
                      i === gal ? 'ring-gold ring-2' : 'opacity-60 ring-1 ring-white/20 hover:opacity-100'
                    }`}
                    aria-label={`photo ${i + 1}`}
                  >
                    <img src={u} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="h-1" />
            )}
          </div>
        </div>
      </section>

      {/* details */}
      <section className="bg-ivory mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.6fr_1fr] lg:px-8">
        <div>
          <h2 className="font-display text-3xl font-black">{t('od.stay')}</h2>
          <p className="text-slate-soft mt-4 leading-relaxed">{o.description}</p>

          <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {([
              ['od.lDest', `${o.city}, ${o.country}`],
              // durÃ©e statique inutile pour un hÃ´tel : le client choisit ses dates
              ...(!isHotelOffer(o) ? ([['od.lDur', `${o.nights} ${t('od.nights')}`]] as [string, string][]) : []),
              ['od.lHotel', o.hotelName],
              ['od.lRating', String(o.rating)],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k} className="border-gold border-t-2 pt-4">
                <dt className="text-slate-soft text-[11px] font-bold uppercase tracking-widest">{t(k)}</dt>
                <dd className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
                  {k === 'od.lRating' && <StarIcon className="text-gold h-4 w-4" />}
                  {v}
                </dd>
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

        {/* configurateur de sÃ©jour */}
        <StayConfigurator offer={o} />
      </section>

      {/* avis voyageurs */}
      <section className="bg-deep mx-auto px-5 py-16 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="font-display text-3xl font-black text-white">{t('rvl.title')}</h2>
            {reviews === null && <p className="text-mist mt-6 animate-pulse">{t('bk.loading')}</p>}
            {reviews?.length === 0 && (
              <p className="text-mist panel-dark mt-6 rounded-3xl p-8 text-sm">{t('rvl.empty')}</p>
            )}
            <div className="mt-8 space-y-4">
              {reviews?.map((r) => (
                <article key={r._id} className="panel-dark rounded-3xl p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-gold/20 text-gold font-display grid size-10 place-items-center rounded-full text-sm font-black uppercase">
                        {r.authorName.slice(0, 1)}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-white">{r.authorName}</p>
                        <p className="text-mist text-[11px]">
                          {new Date(r.createdAt).toLocaleDateString(lang === 'en' ? 'en-US' : lang === 'ar' ? 'ar-TN' : 'fr-FR')}
                        </p>
                      </div>
                    </div>
                    <span className="text-gold flex items-center gap-0.5 text-sm">
                      {[...Array(r.rating)].map((_, i) => <StarIcon key={`f${i}`} className="h-4 w-4" />)}
                      {[...Array(5 - r.rating)].map((_, i) => <StarEmptyIcon key={`e${i}`} className="h-4 w-4 text-gold/40" />)}
                    </span>
                  </div>
                  <p className="text-mist mt-4 text-sm leading-relaxed">{r.comment}</p>
                </article>
              ))}
            </div>
          </div>

          {/* formulaire avis */}
          <form onSubmit={(e) => void submitReview(e)} className="panel-dark h-fit rounded-3xl p-8 text-white lg:sticky lg:top-28">
            <h3 className="font-display text-xl font-black">{t('rvl.formTitle')}</h3>
            {rDone && <p className="bg-lagoon/15 text-lagoon mt-4 rounded-xl px-4 py-3 text-sm font-semibold">âœ“ {t('rvl.done')}</p>}
            {rError && <p className="text-coral mt-4 text-sm font-semibold">{rError}</p>}
            <label className="text-mist mt-6 block text-xs font-bold uppercase tracking-widest">{t('rvl.name')}</label>
            <input
              value={rName}
              onChange={(e) => setRName(e.target.value)}
              maxLength={60}
              required
              className="inp-dark mt-2 w-full text-sm"
            />
            <label className="text-mist mt-5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
              <StarIcon className="h-3.5 w-3.5" /> {t('rvl.rating')}
            </label>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setRRating(n)}
                  aria-label={`${n}/5`}
                  className={`transition-transform hover:scale-125 ${n <= rRating ? 'text-gold' : 'text-white/25'}`}
                >
                  {n <= rRating
                    ? <StarIcon className="h-6 w-6" />
                    : <StarEmptyIcon className="h-6 w-6" />}
                </button>
              ))}
            </div>
            <label className="text-mist mt-5 block text-xs font-bold uppercase tracking-widest">{t('rvl.comment')}</label>
            <textarea
              value={rComment}
              onChange={(e) => setRComment(e.target.value)}
              rows={4}
              maxLength={800}
              required
              className="inp-dark mt-2 w-full resize-none text-sm"
            />
            <button
              type="submit"
              className="btn-gold mt-6 w-full py-3.5 text-sm font-bold"
            >
              {t('rvl.submit')}
            </button>
          </form>
        </div>
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
                <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-white/85 px-3 py-1 text-xs font-bold backdrop-blur-sm">
                  <StarIcon className="text-gold h-3.5 w-3.5" /> {s.rating}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/70">
                    {s.country} Â· {s.nights} {t('card.nights')}
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

/** Configurateur : arrivÃ©e/dÃ©part, voyageurs, chambres, formule â€” devis en direct. */
function StayConfigurator({ offer }: { offer: Offer }) {
  const { t, lang } = useT()
  const hotel = isHotelOffer(offer)
  const today = new Date().toISOString().slice(0, 10)

  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [travelers, setTravelers] = useState(2)
  const [rooms, setRooms] = useState(1)
  const [board, setBoard] = useState<Board>('bb')

  const q = quoteStay(offer, { start, end, travelers, board })
  const invalid = Boolean(hotel && start && end && nightsBetween(start, end) < 1)
  const coefPct = Math.round((q.coef - 1) * 100)

  const bookingParams = new URLSearchParams({ offer: offer.slug })
  if (hotel && start) bookingParams.set('date', start)
  if (hotel && start && end && !invalid) {
    bookingParams.set('depart', end)
    bookingParams.set('board', board)
    bookingParams.set('rooms', String(rooms))
  }
  bookingParams.set('travelers', String(travelers))

  return (
    <aside className="panel-dark h-fit rounded-[2rem] p-8 text-white lg:sticky lg:top-28">
      <h3 className="font-display flex items-center gap-2 text-xl font-black"><CalculatorIcon className="text-gold h-5 w-5" /> {t('bk.cfg.title')}</h3>

      {!hotel && (
        <p className="bg-gold/10 text-gold mt-4 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold">
          <CompassIcon className="h-3.5 w-3.5" /> {t('bk.orgNote')}
        </p>
      )}

      {hotel && (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div>
            <label className="text-mist text-[10px] font-bold uppercase tracking-widest">{t('bk.arrive')}</label>
            <input
              type="date"
              min={today}
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="inp-dark mt-1 w-full px-3 py-2.5 text-sm [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="text-mist text-[10px] font-bold uppercase tracking-widest">{t('bk.depart')}</label>
            <input
              type="date"
              min={start || today}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="inp-dark mt-1 w-full px-3 py-2.5 text-sm [color-scheme:dark]"
            />
          </div>
        </div>
      )}

      <div className={`mt-3 grid gap-3 ${hotel ? 'grid-cols-2' : ''}`}>
        <div>
          <label className="text-mist text-[10px] font-bold uppercase tracking-widest">{t('bk.travelers')}</label>
          <select
            value={travelers}
            onChange={(e) => setTravelers(Number(e.target.value))}
            className="inp-dark mt-1 w-full px-3 py-2.5 text-sm font-semibold"
          >
            {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
              <option key={n} value={n} className="text-ink">
                {n}
              </option>
            ))}
          </select>
        </div>
        {hotel && (
          <div>
            <label className="text-mist text-[10px] font-bold uppercase tracking-widest">{t('bk.rooms')}</label>
            <select
              value={rooms}
              onChange={(e) => setRooms(Number(e.target.value))}
              className="inp-dark mt-1 w-full px-3 py-2.5 text-sm font-semibold"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n} className="text-ink">
                  {n}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {hotel && (
        <div className="mt-4">
          <p className="text-mist text-[10px] font-bold uppercase tracking-widest">{t('bk.board.label')}</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {BOARDS.map((b) => (
              <button
                key={b.id}
                onClick={() => setBoard(b.id)}
                className={`rounded-xl border px-2 py-2.5 text-[11px] font-bold transition-colors ${
                  board === b.id
                    ? 'border-gold bg-gold/15 text-gold'
                    : 'border-white/15 text-mist hover:border-white/40'
                }`}
              >
                {t(b.key)}
              </button>
            ))}
          </div>
        </div>
      )}

      <ul className="border-white/10 mt-5 space-y-2 border-t pt-4 text-sm">
        <li className="flex justify-between gap-3">
          <span className="text-mist">
            {travelers} Ã— {t('bk.pers')} Â· {hotel ? t(`bk.board.${board}`) : `${q.nights} ${t('od.nights')}`}
          </span>
          <span className="font-semibold">{formatPriceExact(q.perNightEur, lang)} {t('bk.perNight')}</span>
        </li>
        {hotel && coefPct > 0 && (
          <li className="flex justify-between gap-3">
            <span className="text-mist">{t(`bk.board.${board}`)}</span>
            <span className="text-lagoon font-semibold">+{coefPct}%</span>
          </li>
        )}
        <li className="border-white/10 flex items-baseline justify-between gap-3 border-t pt-3">
          <span className="text-xs font-bold uppercase tracking-widest">{t('bk.total')}</span>
          <span className="font-display text-4xl font-black text-gold">{formatPriceExact(q.totalEur, lang)}</span>
        </li>
      </ul>

      {invalid ? (
        <p className="text-coral mt-4 inline-flex items-center gap-1.5 text-xs font-bold"><AlertIcon className="h-4 w-4" /> {t('bk.invalidDates')}</p>
      ) : (
        <Link
          to={`/booking?${bookingParams.toString()}`}
          className="btn-gold mt-5 block py-4 text-center text-sm font-bold"
        >
          {t('od.book')}
        </Link>
      )}
      <p className="text-mist mt-4 text-center text-xs">{t('od.devis')}</p>
    </aside>
  )
}
