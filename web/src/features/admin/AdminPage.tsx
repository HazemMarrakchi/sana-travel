import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiAuth, useAuth } from '../../core/auth'
import { useT } from '../../core/i18n'
import { formatPrice } from '../../core/money'

interface AdminBooking {
  _id: string
  reference: string
  offerSlug: string
  contactName: string
  contactEmail: string
  travelers: number
  startDate: string
  status: 'draft' | 'quote_sent' | 'confirmed' | 'cancelled'
  totalEur: number
  createdAt: string
}

interface AdminUser {
  _id: string
  fullName: string
  email: string
  role: string
  createdAt: string
}

const STATUSES = ['draft', 'quote_sent', 'confirmed', 'cancelled'] as const

export function AdminPage() {
  const { token, user } = useAuth()
  const { t, lang } = useT()
  const [bookings, setBookings] = useState<AdminBooking[] | null>(null)
  const [clients, setClients] = useState<AdminUser[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token || user?.role !== 'admin') return
    void apiAuth('/bookings', token)
      .then((d) => setBookings(d as AdminBooking[]))
      .catch((e: Error) => setError(e.message))
    void apiAuth('/users', token)
      .then((d) => setClients(d as AdminUser[]))
      .catch(() => setClients([]))
  }, [token, user])

  const stats = useMemo(() => {
    if (!bookings) return null
    const active = bookings.filter((b) => b.status !== 'cancelled')
    return {
      pipeline: active.reduce((sum, b) => sum + b.totalEur, 0),
      quotes: bookings.length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
      clients: clients?.length ?? 0,
    }
  }, [bookings, clients])

  const changeStatus = async (id: string, status: string) => {
    if (!token) return
    try {
      await apiAuth(`/bookings/${id}/status`, token, { method: 'PATCH', body: { status } })
      setBookings((prev) => prev?.map((b) => (b._id === id ? { ...b, status: status as AdminBooking['status'] } : b)) ?? null)
    } catch {
      setError('status update failed')
    }
  }

  if (!user || user.role !== 'admin') {
    return (
      <main className="bg-deep grid min-h-screen place-items-center px-6 text-center text-white">
        <div>
          <p className="font-display text-3xl font-black">{t('admin.restricted')}</p>
          <Link to="/login" className="text-gold mt-4 inline-block font-bold underline underline-offset-4">
            {t('nav.login')} →
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-deep min-h-screen px-5 pt-32 pb-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-gold text-xs font-bold uppercase tracking-[0.35em]">SANA · {t('admin.kicker')}</p>
        <h1 className="font-display mt-2 text-4xl font-black text-white">{t('admin.title')}</h1>

        {error && <p className="text-coral mt-4">{t('bk.serverError')}</p>}

        {/* stats */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats
            ? (
              [
                [formatPrice(stats.pipeline, lang), t('admin.pipeline')],
                [String(stats.quotes), t('admin.quotes')],
                [String(stats.confirmed), t('admin.confirmed')],
                [String(stats.clients), t('admin.clients')],
              ] as const
            ).map(([v, k]) => (
              <div key={k} className="bg-night rounded-3xl p-6 shadow-sm">
                <p className="font-display text-3xl font-black text-gold">{v}</p>
                <p className="text-mist mt-1 text-[11px] font-bold uppercase tracking-wider">{k}</p>
              </div>
            ))
            : Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-night h-28 animate-pulse rounded-3xl" />
              ))}
        </div>

        {/* bookings table */}
        <h2 className="font-display mt-14 mb-5 text-xl font-bold text-white">{t('admin.bookings')}</h2>
        {bookings === null && !error && <p className="text-mist animate-pulse">{t('bk.loading')}</p>}
        {bookings?.length === 0 && <p className="text-mist">{t('admin.noBookings')}</p>}
        {bookings && bookings.length > 0 && (
          <div className="bg-night overflow-x-auto rounded-3xl shadow-sm">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-white/10 text-mist border-b text-[11px] uppercase tracking-wider">
                  <th className="px-6 py-4">{t('od.lDur')} / Réf</th>
                  <th className="px-4 py-4">Client</th>
                  <th className="px-4 py-4">{t('bk.travelers')}</th>
                  <th className="px-4 py-4">{t('bk.date')}</th>
                  <th className="px-4 py-4">{t('bk.total')}</th>
                  <th className="px-4 py-4">Statut</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} className="border-white/5 border-b last:border-0 hover:bg-white/5">
                    <td className="px-6 py-4">
                      <span className="font-display font-black text-gold">{b.reference}</span>
                      <span className="text-mist block text-xs">{b.offerSlug}</span>
                    </td>
                    <td className="px-4 py-4 text-white/90">
                      {b.contactName}
                      <span className="text-mist block text-xs">{b.contactEmail}</span>
                    </td>
                    <td className="px-4 py-4 text-white/90">{b.travelers}</td>
                    <td className="px-4 py-4 text-white/90">
                      {new Date(b.startDate).toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR')}
                    </td>
                    <td className="px-4 py-4 font-semibold text-white">{formatPrice(b.totalEur, lang)}</td>
                    <td className="px-4 py-4">
                      <select
                        value={b.status}
                        onChange={(e) => void changeStatus(b._id, e.target.value)}
                        className="inp !w-auto !py-1.5 text-xs"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {t(`st.${s}`)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* clients */}
        <h2 className="font-display mt-14 mb-5 text-xl font-bold text-white">{t('admin.clientsList')}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clients?.map((c) => (
            <div key={c._id} className="bg-night rounded-2xl p-5">
              <p className="font-semibold text-white">{c.fullName}</p>
              <p className="text-mist text-xs">{c.email}</p>
              {c.role === 'admin' && <span className="bg-gold/20 text-gold mt-2 inline-block rounded-full px-3 py-0.5 text-[10px] font-bold uppercase">Admin</span>}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
