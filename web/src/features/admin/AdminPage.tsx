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
  createdAt: string
}

type Filter = 'all' | 'quote_sent' | 'confirmed' | 'draft' | 'cancelled'

const STATUS_COLOR: Record<AdminBooking['status'], string> = {
  draft: '#8fa3bd',
  quote_sent: '#e2b04a',
  confirmed: '#2ec4b6',
  cancelled: '#ff7a59',
}

const FILTERS: Filter[] = ['all', 'quote_sent', 'confirmed', 'draft', 'cancelled']

const AVATAR_GRADS = [
  'from-[#e2b04a] to-[#ff7a59]',
  'from-[#2ec4b6] to-[#0f766e]',
  'from-[#f5d99b] to-[#d69a2d]',
  'from-[#93b1e0] to-[#3d5578]',
]

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('')
}
function hashIdx(s: string, mod: number): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h) % mod
}
function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const grad = AVATAR_GRADS[hashIdx(name, AVATAR_GRADS.length)]
  return (
    <div className="shrink-0 rounded-full p-[2px]" style={{ width: size, height: size }}>
      <div className={`bg-gradient-to-br ${grad} grid h-full w-full place-items-center rounded-full`}>
        <span className="font-display text-sm font-black text-[#071020]">{initials(name)}</span>
      </div>
    </div>
  )
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2)
    return (
      <svg viewBox="0 0 100 34" className="h-9 w-full" preserveAspectRatio="none">
        <line x1="0" y1="30" x2="100" y2="30" stroke="#e2b04a" strokeOpacity=".35" strokeWidth="2" />
      </svg>
    )
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${30 - ((v - min) / span) * 26}`)
  const [lx, ly] = pts[pts.length - 1]!.split(',')
  return (
    <svg viewBox="0 0 100 34" className="h-9 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e2b04a" stopOpacity=".35" />
          <stop offset="100%" stopColor="#e2b04a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,34 ${pts.join(' ')} 100,34`} fill="url(#spark-fill)" />
      <polyline points={pts.join(' ')} fill="none" stroke="#e2b04a" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lx} cy={ly} r="2.4" fill="#f5d99b" />
    </svg>
  )
}

function Donut({ parts, total }: { parts: { label: string; value: number; color: string }[]; total: number }) {
  const R = 42
  const C = 2 * Math.PI * R
  let offset = 0
  return (
    <div className="flex items-center gap-6">
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 100 100" className="-rotate-90">
          <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="11" />
          {parts.map((p) => {
            if (!p.value || !total) return null
            const len = (p.value / total) * C
            const seg = Math.max(len - 2, 0.5)
            const el = (
              <circle
                key={p.label}
                cx="50"
                cy="50"
                r={R}
                fill="none"
                stroke={p.color}
                strokeWidth="11"
                strokeDasharray={`${seg} ${C - seg}`}
                strokeDashoffset={-offset}
              />
            )
            offset += len
            return el
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-display tabular-nums text-3xl font-black text-white">{total}</p>
            <p className="text-mist text-[9px] font-bold tracking-[0.2em] uppercase">Dossiers</p>
          </div>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-2.5">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-2.5 text-xs">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: p.color }} />
            <span className="text-mist min-w-0 flex-1 truncate">{p.label}</span>
            <span className="font-bold text-white tabular-nums">{p.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const ICONS = {
  overview: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
  bookings:
    'M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 6 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-6Z M13 7v10',
  clients:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
}

function NavIcon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0">
      <path d={path} />
    </svg>
  )
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
    const byStatus = (s: AdminBooking['status']) => bookings.filter((b) => b.status === s).length
    return {
      pipeline: active.reduce((sum, b) => sum + b.totalEur, 0),
      quotes: bookings.length,
      confirmed: byStatus('confirmed'),
      clients: clients?.length ?? 0,
      trend: [...active]
        .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
        .reduce<number[]>((acc, b) => [...acc, (acc.at(-1) ?? 0) + b.totalEur], []),
      conversion: bookings.length ? Math.round((byStatus('confirmed') / bookings.length) * 100) : 0,
      parts: [
        { label: t('st.quote_sent'), value: byStatus('quote_sent'), color: STATUS_COLOR.quote_sent },
        { label: t('st.confirmed'), value: byStatus('confirmed'), color: STATUS_COLOR.confirmed },
        { label: t('st.draft'), value: byStatus('draft'), color: STATUS_COLOR.draft },
        { label: t('st.cancelled'), value: byStatus('cancelled'), color: STATUS_COLOR.cancelled },
      ],
    }
  }, [bookings, clients, t])

  const counts = useMemo(() => {
    const c = Object.fromEntries(FILTERS.map((f) => [f, 0])) as Record<Filter, number>
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
      <main className="bg-deep relative grid min-h-screen place-items-center overflow-hidden px-6 text-center">
        <div className="bg-gold/15 pointer-events-none absolute top-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl" />
        <div className="border-white/10 from-night relative rounded-[2rem] border bg-gradient-to-b to-transparent p-14 shadow-2xl">
          <p className="font-display text-gold text-5xl">✦</p>
          <p className="font-display mt-5 text-3xl font-bold text-white">{t('admin.restricted')}</p>
          <Link
            to="/login"
            className="from-gold to-gold-soft hover:shadow-gold/30 mt-8 inline-block rounded-full bg-gradient-to-r px-10 py-3.5 text-sm font-bold text-[#071020] shadow-lg transition-all hover:scale-105"
          >
            {t('nav.login')} →
          </Link>
        </div>
      </main>
    )
  }

  const card = 'border-white/[0.07] rounded-3xl border bg-gradient-to-b from-white/[0.05] to-white/[0.015] shadow-xl shadow-black/20'

  return (
    <div className="bg-deep relative min-h-screen text-white">
      {/* ambiance lumineuse */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="bg-gold/[0.07] absolute -top-32 right-1/4 h-[420px] w-[420px] rounded-full blur-3xl" />
        <div className="bg-lagoon/[0.05] absolute -bottom-40 -left-24 h-[380px] w-[380px] rounded-full blur-3xl" />
      </div>

      {/* ════ SIDEBAR ════ */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 lg:block">
        <div className="border-white/[0.07] flex h-full flex-col border-r bg-[#081120]/80 backdrop-blur-xl">
          <div className="px-8 pt-10 pb-12">
            <Link to="/" className="group inline-flex items-center gap-2.5">
              <span className="bg-gold shadow-gold/60 block h-2.5 w-2.5 rounded-full shadow-[0_0_14px] transition-transform group-hover:scale-150" />
              <span className="font-display text-[1.7rem] leading-none font-black tracking-tight">
                SANA<span className="text-gold">.</span>
              </span>
            </Link>
            <p className="text-mist mt-4 ps-[22px] text-[10px] font-bold tracking-[0.28em] uppercase">
              {t('admin.panel')}
            </p>
          </div>

          <nav className="flex-1 space-y-1.5 px-5">
            {(
              [
                ['#overview', ICONS.overview, t('admin.overview')],
                ['#bookings', ICONS.bookings, t('admin.bookings')],
                ['#clients', ICONS.clients, t('admin.clientsList')],
                ['#concierge', ICONS.chat, 'Concierge'],
              ] as const
            ).map(([href, icon, label]) => (
              <a
                key={href}
                href={href}
                className="group text-mist hover:text-white relative flex items-center gap-3.5 rounded-2xl px-5 py-3.5 text-[13px] font-semibold transition-all duration-300 hover:bg-white/[0.05]"
              >
                <span className="bg-gold absolute top-1/2 left-0 h-0 w-[3px] -translate-y-1/2 rounded-full transition-all duration-300 group-hover:h-6" />
                <span className="text-mist transition-transform duration-300 group-hover:text-gold group-hover:scale-110">
                  <NavIcon path={icon} />
                </span>
                {label}
              </a>
            ))}
          </nav>

          <div className="border-white/[0.07] mx-5 mt-auto border-t pt-5 pb-6">
            <div className="mb-4 flex items-center gap-3.5 px-4">
              <Avatar name={user.fullName} size={42} />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{user.fullName}</p>
                <span className="bg-gold/15 text-gold inline-block rounded-full px-2 py-0.5 text-[9px] font-black tracking-widest uppercase">
                  Admin
                </span>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="text-mist hover:bg-white/[0.05] hover:text-coral flex w-full items-center gap-3.5 rounded-2xl px-5 py-3 text-[13px] font-semibold transition-colors"
            >
              <NavIcon path={ICONS.logout} />
              {t('admin.logout')}
            </button>
          </div>
        </div>
      </aside>

      {/* ════ TOPBAR MOBILE ════ */}
      <header className="border-white/[0.07] sticky top-0 z-40 flex items-center justify-between border-b bg-[#081120]/85 px-5 py-4 backdrop-blur-xl lg:hidden">
        <Link to="/" className="font-display flex items-center gap-2 text-xl font-black">
          <span className="bg-gold block h-2 w-2 rounded-full" />
          SANA<span className="text-gold">.</span>
        </Link>
        <button onClick={() => logout()} aria-label={t('admin.logout')} className="text-mist hover:text-white">
          <NavIcon path={ICONS.logout} />
        </button>
      </header>

      {/* ════ CONTENU ════ */}
      <main className="relative px-5 pt-9 pb-24 lg:ml-72 lg:px-12 lg:pt-12">
        <div className="mx-auto max-w-6xl">
          {/* en-tête éditorial */}
          <div id="overview" className="scroll-mt-28">
            <p className="text-mist font-display text-lg">
              {greeting}, <span className="text-gold-soft font-semibold italic">{user.fullName.split(' ')[0]}</span> 👋
            </p>
            <h1 className="font-display mt-1.5 text-4xl leading-tight font-black capitalize sm:text-5xl lg:text-[3.4rem]">
              {today}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="ring-lagoon/30 flex items-center gap-2 rounded-full bg-lagoon/10 px-4 py-1.5 text-[11px] font-bold text-lagoon ring-1">
                <span className="relative flex h-2 w-2">
                  <span className="bg-lagoon absolute h-full w-full animate-ping rounded-full opacity-60" />
                  <span className="relative h-2 w-2 rounded-full" />
                </span>
                {t('admin.online')}
              </span>
              <span className="text-mist text-xs">·</span>
              <span className="text-mist text-xs font-semibold">
                {stats ? `${stats.quotes} ${t('admin.quotes').toLowerCase()}` : '…'}
              </span>
            </div>
          </div>

          {error && <p className="text-coral mt-4 text-sm">⚠ {t('bk.serverError')}</p>}

          {/* ════ KPI BAND ════ */}
          <section className="mt-11 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {stats ? (
              <>
                <div className={`${card} relative overflow-hidden p-7 md:col-span-2`}>
                  <div className="bg-gold/15 pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full blur-3xl" />
                  <p className="text-mist text-[10px] font-bold tracking-[0.3em] uppercase">{t('admin.pipeline')}</p>
                  <p className="font-display mt-3 bg-gradient-to-r from-gold-soft via-gold to-coral bg-clip-text pb-1 text-[3.4rem] leading-none font-black tracking-tight text-transparent tabular-nums">
                    {formatPrice(stats.pipeline, lang)}
                  </p>
                  <div className="mt-5 opacity-90">
                    <Sparkline values={stats.trend} />
                  </div>
                  <p className="text-mist mt-3 text-[11px] font-medium">
                    {stats.conversion}% {t('admin.conversion')}
                  </p>
                </div>

                <div className={`${card} group p-7 transition-transform duration-300 hover:-translate-y-1`}>
                  <p className="text-mist text-[10px] font-bold tracking-[0.3em] uppercase">{t('admin.quotes')}</p>
                  <p className="font-display mt-3 text-5xl font-black tabular-nums">{stats.quotes}</p>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="from-gold to-gold-soft h-full rounded-full bg-gradient-to-r" style={{ width: '100%' }} />
                  </div>
                </div>

                <div className={`${card} group p-7 transition-transform duration-300 hover:-translate-y-1`}>
                  <p className="text-mist text-[10px] font-bold tracking-[0.3em] uppercase">{t('admin.confirmed')}</p>
                  <p className="font-display mt-3 text-5xl font-black text-lagoon tabular-nums">{stats.confirmed}</p>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-lagoon" style={{ width: `${stats.conversion}%` }} />
                  </div>
                  <p className="text-mist mt-2 text-[11px]">{stats.conversion}% {t('admin.conversion')}</p>
                </div>

                <div className={`${card} group hidden p-7 transition-transform duration-300 hover:-translate-y-1 xl:hidden`}>
                  <p className="text-mist text-[10px] font-bold tracking-[0.3em] uppercase">{t('admin.clients')}</p>
                  <p className="font-display mt-3 text-5xl font-black tabular-nums">{stats.clients}</p>
                </div>

                <div className={`${card} group p-7 transition-transform duration-300 hover:-translate-y-1 max-xl:hidden`}>
                  <p className="text-mist text-[10px] font-bold tracking-[0.3em] uppercase">{t('admin.clients')}</p>
                  <p className="font-display mt-3 text-5xl font-black tabular-nums">{stats.clients}</p>
                </div>
              </>
            ) : (
              Array.from({ length: 4 }).map((_, i) => <div key={i} className={`${card} h-52 animate-pulse`} />)
            )}
          </section>

          {/* ════ RÉSERVATIONS + COLONNE LATÉRALE ════ */}
          <div className="mt-16 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section id="bookings" className="scroll-mt-28">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display flex items-center gap-3 text-2xl font-bold">
                  {t('admin.bookings')}
                  {bookings && (
                    <span className="bg-gold text-[#071020] rounded-full px-2.5 py-0.5 text-xs font-black tabular-nums">
                      {counts.all}
                    </span>
                  )}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={
                        filter === f
                          ? 'bg-gold shadow-gold/25 text-[#071020] rounded-full px-4 py-1.5 text-xs font-bold shadow-md transition-all'
                          : 'text-mist border-white/10 hover:border-white/30 hover:text-white rounded-full border bg-white/[0.03] px-4 py-1.5 text-xs font-bold transition-all'
                      }
                    >
                      {f === 'all' ? t('admin.filterAll') : t(`st.${f}`)}
                      <span className="ml-1.5 opacity-60 tabular-nums">{counts[f]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {visible?.length === 0 && (
                <div className={`${card} text-mist border-dashed p-14 text-center`}>
                  <p className="text-4xl">🧳</p>
                  <p className="mt-3 text-sm font-semibold">{t('admin.emptyFilter')}</p>
                </div>
              )}

              <div className="space-y-3.5">
                {visible?.map((b) => (
                  <article
                    key={b._id}
                    className={`${card} hover:border-gold/35 group relative grid gap-4 p-5 pl-7 transition-all duration-300 hover:-translate-y-0.5 md:grid-cols-[minmax(0,2fr)_minmax(0,1.15fr)_auto] md:items-center`}
                  >
                    <span className="absolute inset-y-4 left-0 w-1 rounded-full" style={{ background: STATUS_COLOR[b.status] }} />
                    <div className="flex min-w-0 items-center gap-4">
                      <Avatar name={b.contactName} size={46} />
                      <div className="min-w-0">
                        <p className="truncate font-bold">{b.contactName}</p>
                        <p className="text-mist truncate text-xs">{b.contactEmail}</p>
                        <p className="font-display text-gold mt-1 text-xs font-black tracking-widest">{b.reference}</p>
                      </div>
                    </div>

                    <div className="text-mist flex flex-wrap items-center gap-x-4 gap-y-1 text-xs md:flex-col md:items-start md:gap-1.5 xl:flex-row xl:gap-x-4">
                      <span className="border-white/10 bg-white/[0.04] rounded-lg border px-2.5 py-1 font-semibold whitespace-nowrap">
                        {b.offerSlug}
                      </span>
                      <span>
                        🗓 {new Date(b.startDate).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: '2-digit' })}
                      </span>
                      <span>👤 ×{b.travelers}</span>
                    </div>

                    <div className="flex items-center justify-between gap-3 md:justify-end">
                      <p className="font-display text-right text-xl font-black tabular-nums">{formatPrice(b.totalEur, lang)}</p>
                      <select
                        value={b.status}
                        onChange={(e) => void changeStatus(b._id, e.target.value)}
                        aria-label={`${b.reference} status`}
                        className="inp !w-auto !rounded-lg !px-2.5 !py-1.5 text-xs"
                        style={{ color: STATUS_COLOR[b.status] }}
                      >
                        {(['draft', 'quote_sent', 'confirmed', 'cancelled'] as const).map((s) => (
                          <option key={s} value={s}>
                            {t(`st.${s}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </article>
                ))}
                {!visible && !error &&
                  Array.from({ length: 3 }).map((_, i) => <div key={i} className={`${card} h-28 animate-pulse`} />)}
              </div>
            </section>

            {/* colonne latérale */}
            <aside className="space-y-8">
              <div id="concierge" className={`${card} scroll-mt-28 p-7`}>
                <h3 className="font-display mb-5 text-lg font-bold">📊 Répartition</h3>
                {stats ? (
                  <Donut parts={stats.parts} total={stats.quotes} />
                ) : (
                  <div className="h-36 animate-pulse rounded-2xl bg-white/[0.05]" />
                )}
              </div>

              <div className={`${card} p-7`}>
                <h3 className="font-display mb-5 flex items-center gap-2 text-lg font-bold">
                  🤖 Concierge
                  {escal && escal.length > 0 && (
                    <span className="bg-coral ml-auto rounded-full px-2.5 py-0.5 text-xs font-black tabular-nums text-white">
                      {escal.length}
                    </span>
                  )}
                </h3>
                {escal?.length === 0 && <p className="text-mist text-sm">✨ {t('admin.noEscal')}</p>}
                <div className="space-y-3">
                  {escal?.slice(0, 5).map((e) => (
                    <div key={e._id} className="border-coral/25 relative overflow-hidden rounded-xl border bg-white/[0.03] p-4 pl-5">
                      <span className="bg-coral absolute inset-y-0 left-0 w-[3px]" />
                      <p className="text-sm font-medium italic">« {e.question} »</p>
                      <p className="text-mist mt-1.5 text-[11px]">
                        {new Date(e.createdAt).toLocaleString(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))}
                  {!escal && Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-white/[0.05]" />)}
                </div>
              </div>

              <div id="clients" className={`${card} scroll-mt-28 p-7`}>
                <h3 className="font-display mb-5 text-lg font-bold">{t('admin.clientsList')}</h3>
                <div className="space-y-3">
                  {clients?.length === 0 && <p className="text-mist text-sm">{t('admin.noClients')}</p>}
                  {clients?.slice(0, 6).map((c) => (
                    <div key={c._id} className="hover:bg-white/[0.03] flex items-center gap-3.5 rounded-xl p-2 transition-colors">
                      <Avatar name={c.fullName} size={38} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">
                          {c.fullName}
                          {c.role === 'admin' && (
                            <span className="bg-gold/15 text-gold ml-2 rounded-full px-2 py-0.5 text-[9px] font-black tracking-widest uppercase">
                              A
                            </span>
                          )}
                        </p>
                        <p className="text-mist truncate text-xs">{c.email}</p>
                      </div>
                    </div>
                  ))}
                  {clients && clients.length > 6 && (
                    <p className="text-mist pt-1 text-center text-xs font-semibold">+{clients.length - 6} …</p>
                  )}
                  {!clients && Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-white/[0.05]" />)}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}
