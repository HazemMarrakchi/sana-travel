import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiAuth, useAuth } from '../../core/auth'
import { useT } from '../../core/i18n'
import { formatPrice } from '../../core/money'
import { loadFavorites, toggleFavorite } from '../../core/favorites'
import { artFor, fetchOffers } from '../../core/api'
import type { Offer } from '../../data/offers'
import { PosterImage } from '../../components/ui/PosterImage'
import { CalendarIcon, StarIcon, FileIcon, ReceiptIcon, PlaneIcon, CreditCardIcon, HeartIcon, WaveIcon } from '../../components/ui/Icons'

interface MyBooking {
  _id: string
  reference: string
  offerSlug: string
  travelers: number
  startDate: string
  endDate?: string
  note?: string
  status: 'draft' | 'quote_sent' | 'confirmed' | 'cancelled'
  totalEur: number
  depositPaid?: boolean
  depositEur?: number
  createdAt: string
}

const STATUS_STYLES: Record<MyBooking['status'], string> = {
  draft: 'bg-white/10 text-mist',
  quote_sent: 'bg-gold/20 text-gold',
  confirmed: 'bg-lagoon/20 text-lagoon',
  cancelled: 'bg-coral/20 text-coral',
}

export function AccountPage() {
  const { token, user, logout } = useAuth()
  const { t, lang } = useT()
  const [bookings, setBookings] = useState<MyBooking[] | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [paying, setPaying] = useState<string | null>(null)
  const [favs, setFavs] = useState<string[]>([])
  const [favOffers, setFavOffers] = useState<Offer[]>([])

  useEffect(() => {
    if (!token) return
    void apiAuth('/bookings/mine', token)
      .then((d) => setBookings(d as MyBooking[]))
      .catch((e: Error) => setError(e.message))
    void loadFavorites(token).then((f) => setFavs(f))
    void fetchOffers().then(({ offers }) => setFavOffers(offers))
  }, [token])

  async function onToggleFav(slug: string) {
    try {
      const next = await toggleFavorite(slug, token)
      setFavs(next)
    } catch {
      /* silencieux */
    }
  }

  async function payDeposit(b: MyBooking) {
    if (!token) return
    setPaying(b._id)
    setError('')
    try {
      const d = (await apiAuth(`/bookings/${b._id}/pay`, token, { method: 'POST' })) as { url?: string }
      if (d.url) window.location.href = d.url
      else setError(t('acct.payError'))
    } catch (e) {
      setError((e as Error).message || t('acct.payError'))
    } finally {
      setPaying(null)
    }
  }

  async function cancelBooking(id: string) {
    if (!window.confirm(t('acct.cancel') + ' ?')) return
    try {
      await apiAuth(`/bookings/${id}/cancel`, token!, { method: 'PATCH' })
      setBookings((bs) => bs?.map((b) => (b._id === id ? { ...b, status: 'cancelled' as const } : b)) ?? null)
      setOpen(null)
    } catch {
      setError(t('bk.serverError'))
    }
  }

  if (!user) {
    return (
      <main className="bg-deep grid min-h-screen place-items-center px-6 text-center text-white">
        <div>
          <p className="font-display text-3xl font-black">{t('acct.needLogin')}</p>
          <Link to="/login" className="text-gold mt-4 inline-block font-bold underline underline-offset-4">
            {t('nav.login')} →
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-deep min-h-screen px-5 pt-12 pb-24 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="kicker-gold">{t('acct.kicker')}</p>
            <h1 className="font-display mt-2 text-4xl font-black text-white">
              {t('acct.hello')} {user.fullName.split(' ')[0]} <WaveIcon className="text-gold inline h-6 w-6" />
            </h1>
            <p className="text-mist mt-1 text-sm">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="btn-ghost-dark px-6 py-2.5 text-sm font-semibold"
          >
            {t('auth.logout')}
          </button>
        </div>

        <h2 className="font-display mt-14 mb-5 text-xl font-bold text-white">{t('acct.myBookings')}</h2>

        {error && <p className="text-coral">{t('bk.serverError')}</p>}
        {bookings === null && !error && (
          <p className="text-mist animate-pulse">{t('bk.loading')}</p>
        )}
        {bookings?.length === 0 && (
          <div className="panel-dark rounded-3xl p-10 text-center">
            <p className="text-mist">{t('acct.empty')}</p>
            <Link
              to="/destinations"
              className="btn-gold mt-6 inline-block px-8 py-3.5 text-sm font-bold"
            >
              {t('home.cta1')} →
            </Link>
          </div>
        )}

        <div className="grid gap-4">
          {bookings?.map((b) => (
            <div key={b._id} className="card-dark rounded-2xl p-6">
              <button
                onClick={() => setOpen(open === b._id ? null : b._id)}
                className="flex w-full flex-wrap items-center justify-between gap-4 text-start"
              >
                <div>
                  <p className="font-display text-lg font-black tracking-wide text-gold">{b.reference}</p>
                  <p className="text-mist mt-1 text-xs">
                    {new Date(b.startDate).toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR')}
                    {b.endDate && ` → ${new Date(b.endDate).toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR')}`} ·{' '}
                    {b.travelers} × {t('od.perPerson')}
                  </p>
                </div>
                <span className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${STATUS_STYLES[b.status]}`}>
                  {t(`st.${b.status}`)}
                </span>
                {b.depositPaid && (
                  <span className="bg-lagoon/20 text-lagoon rounded-full px-4 py-1.5 text-xs font-bold">✓ {t('pay.paid')}</span>
                )}
                <p className="font-display text-2xl font-black text-white">{formatPrice(b.totalEur, lang)}</p>
                <span className="text-gold text-lg">{open === b._id ? '▾' : '▸'}</span>
              </button>

              {open === b._id && (
                <div className="mt-5 border-t border-white/10 pt-5">
                  <div className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                    <p className="text-mist flex items-center gap-1.5">
                      <FileIcon className="text-gold h-3.5 w-3.5" /> {t('acct.details')} · <span className="text-white font-semibold">{b.offerSlug}</span>
                    </p>
                    <p className="text-mist flex items-center gap-1.5">
                      <CalendarIcon className="text-gold h-3.5 w-3.5" /> {new Date(b.startDate).toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', { dateStyle: 'long' })}
                      {b.endDate && ` → ${new Date(b.endDate).toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', { dateStyle: 'long' })}`}
                    </p>
                    <p className="text-mist flex items-center gap-1.5">
                      <CalendarIcon className="text-gold h-3.5 w-3.5" /> {new Date(b.createdAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR')}
                    </p>
                    {b.note && (() => {
                      try {
                        const n = JSON.parse(b.note) as { pays?: string; ville?: string; vol?: string; nuits?: number }
                        return (
                          <p className="text-mist sm:col-span-2">
                            <ReceiptIcon className="text-gold mb-0.5 inline h-3.5 w-3.5" /> {[n.ville, n.pays].filter(Boolean).join(', ')} · {n.nuits} {t('vt.nights')} · <PlaneIcon className="text-gold mb-0.5 inline h-3.5 w-3.5" /> {n.vol ?? t('vt.noFlight')}
                          </p>
                        )
                      } catch {
                        return null
                      }
                    })()}
                  </div>
                  {(b.status === 'draft' || b.status === 'quote_sent') && (
                    <button
                      onClick={() => void cancelBooking(b._id)}
                      className="text-coral border-coral/50 hover:bg-coral/10 mt-5 rounded-full border px-6 py-2.5 text-xs font-bold transition"
                    >
                      ✕ {t('acct.cancel')}
                    </button>
                  )}
                  {!b.depositPaid && b.status !== 'cancelled' && (
                    <button
                      onClick={() => void payDeposit(b)}
                      disabled={paying === b._id}
                 className="btn-gold mt-5 px-6 py-2.5 text-xs disabled:opacity-60 sm:ms-3"
                >
                  {paying === b._id ? <span className="inline-flex h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink/30 border-t-ink" /> : <CreditCardIcon className="h-3.5 w-3.5" />}
                  {paying === b._id ? t('pay.redirect') : `${t('pay.cta')} · ${formatPrice(Math.round(b.totalEur * 0.3), lang)}`}
                </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <h2 className="font-display mt-14 mb-5 text-xl font-bold text-white">{t('acct.favorites')}</h2>
        {favs.length === 0 ? (
          <div className="panel-dark rounded-3xl p-10 text-center">
            <p className="text-mist text-sm">{t('acct.noFavs')}</p>
            <Link to="/destinations" className="text-gold mt-3 inline-block text-sm font-bold underline underline-offset-4">
              {t('dest.kicker')} →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favs
              .map((slug) => favOffers.find((o) => o.slug === slug))
              .filter((o): o is Offer => !!o)
              .map((o) => (
                <div key={o.slug} className="card-dark group relative overflow-hidden rounded-2xl">
                  <Link to={`/offres/${o.slug}`} className={`block aspect-[16/10] bg-gradient-to-br ${artFor(o.artKey)}`}>
                    <PosterImage src={o.photo ?? o.images?.[0]} alt={o.title} />
                    <span className="absolute top-3 start-3 inline-flex items-center gap-1 rounded-full bg-white/85 px-3 py-1 text-xs font-bold backdrop-blur-sm">
                      <StarIcon className="text-gold h-3.5 w-3.5" /> {o.rating}
                    </span>
                    <div className="from-ink/80 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/70">
                        {o.country} · {o.nights} {t('card.nights')}
                      </p>
                      <h3 className="font-display mt-0.5 font-black text-white">{o.title}</h3>
                      <p className="text-gold mt-1 text-sm font-bold">
                        {t('card.from')} {formatPrice(o.priceEur, lang)}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={() => void onToggleFav(o.slug)}
                    aria-label={t('fav.remove')}
                    className="bg-coral absolute top-3 end-3 grid size-9 place-items-center rounded-full text-sm text-white shadow-lg transition-transform hover:scale-110"
                  >
                    <HeartIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </main>
  )
}
