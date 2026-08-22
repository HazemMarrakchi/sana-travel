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

interface Escalation {
  _id: string
  question: string
  answer: string
  createdAt: string
}

type Filter = 'all' | 'quote_sent' | 'confirmed' | 'draft' | 'cancelled'

const STATUS_UI: Record<AdminBooking['status'], { dot: string; pill: string }> = {
  draft: { dot: 'bg-mist', pill: 'text-mist bg-mist/10 ring-mist/25' },
  quote_sent: { dot: 'bg-gold', pill: 'text-gold bg-gold/10 ring-gold/30' },
  confirmed: { dot: 'bg-lagoon', pill: 'text-lagoon bg-lagoon/10 ring-lagoon/30' },
  cancelled: { dot: 'bg-coral', pill: 'text-coral bg-coral/10 ring-coral/30' },
}

const AVATAR_GRADS = [
  'from-[#e2b04a] to-[#ff7a59]',
  'from-[#2ec4b6] to-[#1a8f85]',
  'from-[#f5d99b] to-[#e2b04a]',
  'from-[#7d95c4] to-[#4a5f8a]',
]

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}

function hashHue(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function Avatar({ name, size = 'md' as const }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const grad = AVATAR_GRADS[hashHue(name) % AVATAR_GRADS.length]
  const dim = size === 'lg' ? 'h-11 w-11 text-sm' : 'h-9 w-9 text-xs'
  return (
    <div
      className={`bg-gradient-to-br ${grad} ${dim} font-display grid shrink-0 place-items-center rounded-full font-bold text-[#0a1628]`}
    >
      {initials(name)}
    </div>
  )
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) {
    return (
      <svg viewBox="0 0 100 32" className="h-8 w-full" preserveAspectRatio="none">
        <line x1="0" y1="28" x2="100" y2="28" stroke="#e2b04a" strokeOpacity="0.35" strokeWidth="2" />
      </svg>
    )
  }
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${28 - ((v - min) / span) * 24}`)
  return (
    <svg viewBox="0 0 100 32" className="h-8 w-full" preserveAspectRatio="none">
      <polygon points={`0,32 ${pts.join(' ')} 100,32`} fill="#e2b04a" opacity="0.12" />
      <polyline points={pts.join(' ')} fill="none" stroke="#e2b04a" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function NavIcon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">
      <path d={path} />
    </svg>
  )
}

const ICONS = {
  overview: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
  bookings: 'M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v0a2 2 0 0 0 0 6v0a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v0a2 2 0 0 0 0-6Z M13 7v10',
  clients:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
}

export function AdminPage() {
  const { token, user, logout } = useAuth()
  const { t, lang } = useT()
  const [bookings, setBookings] = useState<AdminBooking[] | null>(null)
  const [clients, setClients] = useState<AdminUser[] | null>(null)
  const [escal, setEscal] = useState<Escalation[] | null>(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    if (!token || user?.role !== 'admin') return
    void apiAuth('/bookings', token)
      .then((d) => setBookings(d as AdminBooking[]))
      .catch((e: Error) => setError(e.message))
    void apiAuth('/users', token)
      .then((d) => setClients(d as AdminUser[]))
      .catch(() => setClients([]))
    void apiAuth('/chat/escalations', token)
      .then((d) => setEscal(d as Escalation[]))
      .catch(() => setEscal([]))
  }, [token, user])

  const stats = useMemo(() => {
    if (!bookings) return null
    const active = bookings.filter((b) => b.status !== 'cancelled')
    return {
      pipeline: active.reduce((sum, b) => sum + b.totalEur, 0),
      quotes: bookings.length,
      confirmed: bookings.filter((b) => b.status === 'confirmed').length,
      clients: clients?.length ?? 0,
      trend: [...active]
        .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
        .reduce<number[]>((acc, b) => [...acc, (acc.at(-1) ?? 0) + b.totalEur], []),
    }
  }, [bookings, clients])

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: 0, quote_sent: 0, confirmed: 0, draft: 0, cancelled: 0 }
    for (const b of bookings ?? []) {
      c.all++
      c[b.status]++
    }
    return c
  }, [bookings])

  const changeStatus = async (id: string, status: string) => {
    if (!token) return
    try {
      await apiAuth(`/bookings/${id}/status`, token, { method: 'PATCH', body: { status } })
      setBookings((prev) => prev?.map((b) => (b._id === id ? { ...b, status: status as AdminBooking['status'] } : b)) ?? null)
    } catch {
      setError('status update failed')
    }
  }

  const locale = lang === 'en' ? 'en-US' : 'fr-FR'
  const today = new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })
  const hour = new Date().getHours()
  const greeting = hour >= 17 || hour < 5 ? t('admin.evening') : t('admin.morning')
  const visible = bookings?.filter((b) => filter === 'all' || b.status === filter) ?? null

  if (!user || user.role !== 'admin') {
    return (
      <main className="bg-deep grid min-h-screen place-items-center px-6 text-center">
        <div className="border-night bg-night/60 rounded-3xl border p-12 shadow-2xl backdrop-blur">
          <p className="font-display text-gold text-5xl">✦</p>
          <p className="font-display mt-4 text-2xl font-bold text-white">{t('admin.restricted')}</p>
          <Link
            to="/login"
            className="bg-gold text-ink mt-6 inline-block rounded-full px-8 py-3 text-sm font-bold transition-transform hover:scale-105"
          >
            {t('nav.login')} →
          </Link>
        </div>
      </main>
    )
  }

  return (
    <div className="bg-deep min-h-screen text-white">
      {/* ── Sidebar desktop ─────────────────────────── */}
      <aside className="border-night fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r lg:flex">
        <div className="px-7 pt-9 pb-8">
          <Link to="/" className="font-display text-2xl font-black tracking-tight">
            SANA<span className="text-gold">.</span>
          </Link>
          <p className="text-mist mt-1 text-[10px] font-bold uppercase tracking-[0.3em]">{t('admin.panel')}</p>
        </div>

        <nav className="space-y-1 px-4">
          {(
            [
              ['#overview', ICONS.overview, t('admin.overview')],
              ['#bookings', ICONS.bookings, t('admin.bookings')],
              ['#clients', ICONS.clients, t('admin.clientsList')],
              ['#concierge', ICONS.chat, `Concierge`],
            ] as const
          ).map(([href, icon, label]) => (
            <a
              key={href}
              href={href}
              className="text-mist hover:bg-night hover:text-white flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
            >
              <NavIcon path={icon} />
              {label}
            </a>
          ))}
        </nav>

        <div className="mt-auto border-night border-t p-4">
          <div className="flex items-center gap-3 px-2 pb-3">
            <Avatar name={user.fullName} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{user.fullName}</p>
              <span className="bg-gold/15 text-gold inline-block rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">
                Admin
              </span>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="text-mist hover:bg-night hover:text-coral flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
          >
            <NavIcon path={ICONS.logout} />
            {t('admin.logout')}
          </button>
        </div>
      </aside>

      {/* ── Topbar mobile ───────────────────────────── */}
      <header className="border-night bg-deep/90 sticky top-0 z-40 flex items-center justify-between border-b px-5 py-4 backdrop-blur lg:hidden">
        <Link to="/" className="font-display text-xl font-black">
          SANA<span className="text-gold">.</span>
        </Link>
        <button onClick={() => logout()} aria-label={t('admin.logout')} className="text-mist hover:text-white">
          <NavIcon path={ICONS.logout} />
        </button>
      </header>

      {/* ── Contenu ─────────────────────────────────── */}
      <main className="px-5 pt-8 pb-24 lg:ml-64 lg:px-10 lg:pt-10">
        <div className="mx-auto max-w-6xl">
          {/* greeting */}
          <div id="overview" className="flex flex-wrap items-end justify-between gap-4 scroll-mt-24">
            <div>
              <p className="font-display text-mist text-lg">
                {greeting}, <span className="text-gold font-semibold">{user.fullName.split(' ')[0]}</span> 👋
              </p>
              <h1 className="font-display mt-1 text-4xl font-black capitalize lg:text-5xl">{today}</h1>
            </div>
            <span className="ring-lagoon/30 flex items-center gap-2 rounded-full bg-lagoon/10 px-4 py-2 text-xs font-bold text-lagoon ring-1">
              <span className="bg-lagoon relative flex h-2 w-2">
                <span className="bg-lagoon absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full" />
              </span>
              {t('admin.online')}
            </span>
          </div>

          {error && <p className="text-coral mt-4 text-sm">⚠ {t('bk.serverError')}</p>}

          {/* KPI band */}
          <section className="mt-9 grid gap-4 lg:grid-cols-4">
            {stats ? (
              <>
                <div className="border-night bg-gradient-to-br from-night via-night to-[#152743] relative overflow-hidden rounded-3xl border p-7 shadow-xl lg:col-span-2">
                  <div className="bg-gold/20 pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl" />
                  <p className="text-mist text-[11px] font-bold uppercase tracking-[0.25em]">{t('admin.pipeline')}</p>
                  <p className="font-display mt-3 bg-gradient-to-r from-gold-soft via-gold to-gold-soft bg-clip-text text-5xl font-black tracking-tight text-transparent tabular-nums lg:text-6xl">
                    {formatPrice(stats.pipeline, lang)}
                  </p>
                  <div className="mt-5 opacity-80">
                    <Sparkline values={stats.trend} />
                  </div>
                  <p className="text-mist mt-2 text-[11px]">
                    {stats.quotes} {t('admin.quotes').toLowerCase()} · {stats.confirmed}{' '}
                    {t('admin.confirmed').toLowerCase()}
                  </p>
                </div>
                {(
                  [
                    [String(stats.quotes), t('admin.quotes'), '📄'],
                    [String(stats.confirmed), t('admin.confirmed'), '✅'],
                    [String(stats.clients), t('admin.clients'), '👥'],
                  ] as const
                ).map(([v, k, ic]) => (
                  <div key={k} className="border-night bg-night/60 hover:border-gold/30 rounded-3xl border p-7 transition-colors">
                    <p className="text-xl">{ic}</p>
                    <p className="font-display mt-3 text-3xl font-black tabular-nums">{v}</p>
                    <p className="text-mist mt-1 text-[11px] font-bold uppercase tracking-[0.2em]">{k}</p>
                  </div>
                ))}
              </>
            ) : (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-night h-44 animate-pulse rounded-3xl" />)
            )}
          </section>

          {/* ── Réservations ───────────────────────────── */}
          <section id="bookings" className="mt-14 scroll-mt-24">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display flex items-center gap-3 text-2xl font-bold">
                {t('admin.bookings')}
                {bookings && (
                  <span className="bg-gold text-ink rounded-full px-2.5 py-0.5 text-xs font-black tabular-nums">
                    {counts.all}
                  </span>
                )}
              </h2>
              <div className="flex flex-wrap gap-2">
                {(['all', 'quote_sent', 'confirmed', 'draft', 'cancelled'] as Filter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={
                      filter === f
                        ? 'bg-gold text-ink rounded-full px-4 py-1.5 text-xs font-bold transition-all'
                        : 'text-mist border-night hover:border-white/20 hover:text-white rounded-full border px-4 py-1.5 text-xs font-bold transition-all'
                    }
                  >
                    {f === 'all' ? t('admin.filterAll') : t(`st.${f}`)}
                    <span className="ml-1.5 opacity-60 tabular-nums">{counts[f]}</span>
                  </button>
                ))}
              </div>
            </div>

            {visible?.length === 0 && (
              <div className="border-night text-mist rounded-3xl border-2 border-dashed p-14 text-center">
                <p className="text-4xl">🧳</p>
                <p className="mt-3 text-sm font-semibold">{t('admin.emptyFilter')}</p>
              </div>
            )}

            <div className="space-y-3">
              {visible?.map((b) => {
                const ui = STATUS_UI[b.status]
                return (
                  <article
                    key={b._id}
                    className="border-night bg-night/60 hover:border-gold/40 group grid gap-4 rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)_auto] md:items-center"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <Avatar name={b.contactName} size="lg" />
                      <div className="min-w-0">
                        <p className="truncate font-bold">{b.contactName}</p>
                        <p className="text-mist truncate text-xs">{b.contactEmail}</p>
                        <p className="font-display text-gold mt-1 text-xs font-black tracking-wider">{b.reference}</p>
                      </div>
                    </div>

                    <div className="text-mist flex flex-wrap items-center gap-x-4 gap-y-1 text-xs md:block xl:flex">
                      <span className="border-night bg-deep rounded-lg border px-2.5 py-1 font-semibold">{b.offerSlug}</span>
                      <span>
                        🗓 {new Date(b.startDate).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: '2-digit' })}
                      </span>
                      <span>
                        👤 ×{b.travelers}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 md:justify-end">
                      <p className="font-display text-right text-xl font-black tabular-nums">
                        {formatPrice(b.totalEur, lang)}
                      </p>
                      <span className={`ring-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold whitespace-nowrap ${ui.pill}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${ui.dot}`} />
                        {t(`st.${b.status}`)}
                      </span>
                      <select
                        value={b.status}
                        onChange={(e) => void changeStatus(b._id, e.target.value)}
                        aria-label={`${b.reference} status`}
                        className="inp !w-auto !rounded-lg !px-2.5 !py-1.5 text-xs"
                      >
                        {(['draft', 'quote_sent', 'confirmed', 'cancelled'] as const).map((s) => (
                          <option key={s} value={s}>
                            {t(`st.${s}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </article>
                )
              })}
              {!visible && !error && (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-night h-24 animate-pulse rounded-2xl" />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── Clients + Concierge ────────────────────── */}
          <div className="mt-14 grid gap-8 xl:grid-cols-2">
            <section id="clients" className="scroll-mt-24">
              <h2 className="font-display mb-5 text-2xl font-bold">{t('admin.clientsList')}</h2>
              <div className="space-y-3">
                {clients?.length === 0 && <p className="text-mist text-sm">{t('admin.noClients')}</p>}
                {clients?.map((c) => (
                  <div
                    key={c._id}
                    className="border-night bg-night/60 hover:border-gold/30 flex items-center gap-4 rounded-2xl border p-4 transition-colors"
                  >
                    <Avatar name={c.fullName} size="lg" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">
                        {c.fullName}
                        {c.role === 'admin' && (
                          <span className="bg-gold/15 text-gold ml-2 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">
                            Admin
                          </span>
                        )}
                      </p>
                      <p className="text-mist truncate text-xs">{c.email}</p>
                    </div>
                    <p className="text-mist hidden text-[11px] whitespace-nowrap sm:block">
                      {t('admin.joined')}{' '}
                      {new Date(c.createdAt).toLocaleDateString(locale, { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                ))}
                {!clients && Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-night h-[72px] animate-pulse rounded-2xl" />)}
              </div>
            </section>

            <section id="concierge" className="scroll-mt-24">
              <h2 className="font-display mb-5 flex items-center gap-2 text-2xl font-bold">
                🤖 Questions à traiter
                {escal && escal.length > 0 && (
                  <span className="bg-coral text-white rounded-full px-2.5 py-0.5 text-xs font-black tabular-nums">
                    {escal.length}
                  </span>
                )}
              </h2>
              {escal?.length === 0 && (
                <div className="border-night text-mist rounded-2xl border border-dashed p-8 text-center text-sm">
                  ✨ {t('admin.noEscal')}
                </div>
              )}
              <div className="space-y-3">
                {escal?.slice(0, 6).map((e) => (
                  <div key={e._id} className="border-coral/25 bg-night/60 relative overflow-hidden rounded-2xl border p-5 pl-6">
                    <span className="bg-coral absolute inset-y-0 left-0 w-1" />
                    <p className="text-sm font-medium italic">« {e.question} »</p>
                    <p className="text-mist mt-2 text-[11px]">
                      {new Date(e.createdAt).toLocaleString(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
                {!escal && Array.from({ length: 2 }).map((_, i) => <div key={i} className="bg-night h-20 animate-pulse rounded-2xl" />)}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
