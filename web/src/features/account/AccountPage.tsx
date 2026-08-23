import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiAuth, useAuth } from '../../core/auth'
import { useT } from '../../core/i18n'
import { formatPrice } from '../../core/money'

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

  useEffect(() => {
    if (!token) return
    void apiAuth('/bookings/mine', token)
      .then((d) => setBookings(d as MyBooking[]))
      .catch((e: Error) => setError(e.message))
  }, [token])

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
            <p className="text-gold text-xs font-bold uppercase tracking-[0.35em]">{t('acct.kicker')}</p>
            <h1 className="font-display mt-2 text-4xl font-black text-white">
              {t('acct.hello')} {user.fullName.split(' ')[0]} 👋
            </h1>
            <p className="text-mist mt-1 text-sm">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="border-white/25 text-mist hover:text-white hover:bg-white/10 rounded-full border px-6 py-2.5 text-sm font-semibold transition-colors"
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
          <div className="bg-night rounded-3xl p-10 text-center">
            <p className="text-mist">{t('acct.empty')}</p>
            <Link
              to="/destinations"
              className="from-gold to-gold-soft mt-6 inline-block rounded-full bg-gradient-to-r px-8 py-3.5 text-sm font-bold text-ink shadow-lg transition-transform hover:scale-[1.02]"
            >
              {t('home.cta1')} →
            </Link>
          </div>
        )}

        <div className="grid gap-4">
          {bookings?.map((b) => (
            <div key={b._id} className="bg-night rounded-2xl p-6">
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
                <p className="font-display text-2xl font-black text-white">{formatPrice(b.totalEur, lang)}</p>
                <span className="text-gold text-lg">{open === b._id ? '▾' : '▸'}</span>
              </button>

              {open === b._id && (
                <div className="mt-5 border-t border-white/10 pt-5">
                  <div className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                    <p className="text-mist">
                      📄 {t('acct.details')} · <span className="text-white font-semibold">{b.offerSlug}</span>
                    </p>
                    <p className="text-mist">
                      🗓️ {new Date(b.startDate).toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', { dateStyle: 'long' })}
                      {b.endDate && ` → ${new Date(b.endDate).toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', { dateStyle: 'long' })}`}
                    </p>
                    <p className="text-mist">
                      📅 {new Date(b.createdAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR')}
                    </p>
                    {b.note && (() => {
                      try {
                        const n = JSON.parse(b.note) as { pays?: string; ville?: string; vol?: string; nuits?: number }
                        return (
                          <p className="text-mist sm:col-span-2">
                            🧾 {[n.ville, n.pays].filter(Boolean).join(', ')} · {n.nuits} {t('vt.nights')} · ✈️ {n.vol ?? t('vt.noFlight')}
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
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
