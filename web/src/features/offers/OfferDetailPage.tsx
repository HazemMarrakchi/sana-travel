import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { artFor, fetchOffer, fetchOffers } from '../../core/api'
import type { Offer } from '../../data/offers'
import { PosterImage } from '../../components/ui/PosterImage'
import { useT } from '../../core/i18n'
import { formatPrice } from '../../core/money'
import { API_BASE, useAuth } from '../../core/auth'
import { loadFavorites, toggleFavorite } from '../../core/favorites'

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
      {/* poster banner */}
      <section
        className={`relative flex min-h-[70vh] items-end overflow-hidden bg-gradient-to-br ${artFor(o.artKey)}`}
      >
        <PosterImage src={o.images?.[gal] ?? o.photo ?? o.images?.[0]} alt={o.title} />
        <div className="from-ink/85 via-ink/20 absolute inset-0 bg-gradient-to-t to-transparent" />
        <button
          onClick={() => void onToggleFav()}
          aria-label={isFav ? t('fav.remove') : t('fav.add')}
          className={`absolute top-6 end-6 z-10 grid size-12 place-items-center rounded-full text-xl shadow-lg backdrop-blur-sm transition-transform hover:scale-110 ${
            isFav ? 'bg-coral text-white' : 'bg-white/85 text-ink'
          }`}
        >
          {isFav ? '♥' : '♡'}
        </button>
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

      {/* avis voyageurs */}
      <section className="bg-deep mx-auto px-5 py-16 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="font-display text-3xl font-black text-white">{t('rvl.title')}</h2>
            {reviews === null && <p className="text-mist mt-6 animate-pulse">{t('bk.loading')}</p>}
            {reviews?.length === 0 && (
              <p className="text-mist bg-night mt-6 rounded-3xl p-8 text-sm">{t('rvl.empty')}</p>
            )}
            <div className="mt-8 space-y-4">
              {reviews?.map((r) => (
                <article key={r._id} className="bg-night rounded-3xl p-6">
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
                    <span className="text-gold text-sm tracking-widest">
                      {'★'.repeat(r.rating)}
                      {'☆'.repeat(5 - r.rating)}
                    </span>
                  </div>
                  <p className="text-mist mt-4 text-sm leading-relaxed">{r.comment}</p>
                </article>
              ))}
            </div>
          </div>

          {/* formulaire avis */}
          <form onSubmit={(e) => void submitReview(e)} className="bg-night h-fit rounded-3xl p-8 text-white lg:sticky lg:top-28">
            <h3 className="font-display text-xl font-black">{t('rvl.formTitle')}</h3>
            {rDone && <p className="bg-lagoon/15 text-lagoon mt-4 rounded-xl px-4 py-3 text-sm font-semibold">✓ {t('rvl.done')}</p>}
            {rError && <p className="text-coral mt-4 text-sm font-semibold">{rError}</p>}
            <label className="text-mist mt-6 block text-xs font-bold uppercase tracking-widest">{t('rvl.name')}</label>
            <input
              value={rName}
              onChange={(e) => setRName(e.target.value)}
              maxLength={60}
              required
              className="border-white/15 focus:border-gold mt-2 w-full rounded-xl border bg-white/5 px-4 py-3 text-sm outline-none"
            />
            <label className="text-mist mt-5 block text-xs font-bold uppercase tracking-widest">★</label>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setRRating(n)}
                  aria-label={`${n}/5`}
                  className={`text-2xl transition-transform hover:scale-125 ${n <= rRating ? 'text-gold' : 'text-white/25'}`}
                >
                  ★
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
              className="border-white/15 focus:border-gold mt-2 w-full resize-none rounded-xl border bg-white/5 px-4 py-3 text-sm outline-none"
            />
            <button
              type="submit"
              className="from-gold to-gold-soft shadow-gold/25 mt-6 w-full rounded-full bg-gradient-to-r py-3.5 text-sm font-bold text-ink shadow-lg transition-transform hover:scale-[1.02]"
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
