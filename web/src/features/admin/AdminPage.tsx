import { useEffect, useMemo, useRef, useState } from 'react'
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
function foldStr(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
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

/** compteur animé easing cubic */
function useCountUp(target: number, duration = 900): number {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return val
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
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M21 21l-4.35-4.35',
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
  const [users, setUsers] = useState<AdminUser[]>([])
  const [escal, setEscal] = useState<Escalation[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [waking, setWaking] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!token || user?.role !== 'admin') return
    let alive = true
    ;(async () => {
      for (let attempt = 1; attempt <= 4; attempt++) {
        try {
          if (attempt > 1 && alive) setWaking(true)
          const [b, u, e] = await Promise.all([
            apiAuth('/bookings', token),
            apiAuth('/users', token),
            apiAuth('/chat/escalations', token),
          ])
          if (!alive) return
          setWaking(false)
          const arr = (x: unknown): AdminBooking[] =>
            Array.isArray(x) ? (x as AdminBooking[]) : ((x as { bookings?: AdminBooking[] })?.bookings ?? [])
          setBookings(arr(b))
          setUsers(Array.isArray(u) ? (u as AdminUser[]) : [])
          setEscal(Array.isArray(e) ? (e as Escalation[]) : [])
          return
        } catch {
          if (!alive) return
          if (attempt === 4) {
            setWaking(false)
            setBookings([])
          } else {
            await new Promise((r) => setTimeout(r, 5000))
          }
        }
      }
    })()
    return () => {
      alive = false
    }
  }, [token, user])

  const stats = useMemo(() => {
    const list = bookings ?? []
    const active = list.filter((b) => b.status !== 'cancelled')
    const pipeline = active.reduce((s, b) => s + (b.totalEur || 0), 0)
    const quotes = list.filter((b) => b.status === 'quote_sent').length
    const confirmed = list.filter((b) => b.status === 'confirmed').length
    const conv = list.length ? Math.round(((quotes + confirmed) / list.length) * 100) : 0
    const byDay = new Map<string, number>()
    for (const b of list) {
      const d = new Date(b.createdAt).toISOString().slice(0, 10)
      byDay.set(d, (byDay.get(d) ?? 0) + 1)
    }
    let cum = 0
    const trend = [...byDay.keys()].sort().map((d) => (cum += byDay.get(d) ?? 0))
    return { pipeline, quotes, confirmed, conv, trend }
  }, [bookings])

  const counts = useMemo(
    () => ({
      all: bookings?.length ?? 0,
      quote_sent: bookings?.filter((b) => b.status === 'quote_sent').length ?? 0,
      confirmed: bookings?.filter((b) => b.status === 'confirmed').length ?? 0,
      draft: bookings?.filter((b) => b.status === 'draft').length ?? 0,
      cancelled: bookings?.filter((b) => b.status === 'cancelled').length ?? 0,
    }),
    [bookings],
  )

  const visible = useMemo(() => {
    let list = bookings ?? []
    if (filter !== 'all') list = list.filter((b) => b.status === filter)
    const q = foldStr(query.trim())
    if (q)
      list = list.filter((b) => foldStr(`${b.reference} ${b.contactName} ${b.contactEmail} ${b.offerSlug}`).includes(q))
    return [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  }, [bookings, filter, query])

  async function changeStatus(id: string, status: AdminBooking['status']) {
    setBookings((bs) => (bs ? bs.map((b) => (b._id === id ? { ...b, status } : b)) : bs))
    try {
      await apiAuth(`/bookings/${id}`, token!, { method: 'PATCH', body: { status } })
    } catch {
      /* optimistic */
    }
  }

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'Escape' && document.activeElement === searchRef.current) {
        setQuery('')
        searchRef.current?.blur()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  useEffect(() => {
    if (user?.role !== 'admin') return
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActiveSection(e.target.id)),
      { rootMargin: '-35% 0px -55% 0px' },
    )
    ;['overview', 'bookings', 'clients'].forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [user])

  const animPipeline = useCountUp(stats.pipeline)
  const animQuotes = useCountUp(stats.quotes)
  const animConfirmed = useCountUp(stats.confirmed)
  const animClients = useCountUp(users.length)

  const locale = lang === 'ar' ? 'ar-TN' : lang === 'en' ? 'en-GB' : 'fr-FR'
  const dateLabel = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())
  const hour = new Date().getHours()
  const greeting = hour < 18 ? t('admin.morning') : t('admin.evening')

  if (!user || user.role !== 'admin')
    return (
      <div className="bg-deep grid min-h-screen place-items-center px-6">
        <div className="border-gold/20 bg-night/60 rounded-3xl border p-12 text-center backdrop-blur">
          <p className="text-5xl">🔒</p>
          <p className="text-mist mt-4">{t('admin.restricted')}</p>
          <Link to="/" className="text-gold mt-6 inline-block font-bold hover:underline">
            ← SANA Travel
          </Link>
        </div>
      </div>
    )

  const navItems = [
    { id: 'overview', label: t('admin.overview'), icon: ICONS.overview },
    { id: 'bookings', label: t('admin.bookings'), icon: ICONS.bookings },
    { id: 'clients', label: t('admin.clientsList'), icon: ICONS.clients },
    { id: 'chat', label: t('nav.concierge'), icon: ICONS.chat },
  ]

  const donutParts = [
    { label: t('st.quote_sent'), value: counts.quote_sent, color: '#e2b04a' },
    { label: t('st.confirmed'), value: counts.confirmed, color: '#2ec4b6' },
    { label: t('st.draft'), value: counts.draft, color: '#8fa3bd' },
    { label: t('st.cancelled'), value: counts.cancelled, color: '#ff7a59' },
  ]

  return (
    <div className="relative min-h-screen bg-[#050d1a] text-white">
      {/* ambient glows */}
      <div className="pointer-events-none fixed -top-40 -left-40 h-96 w-96 rounded-full bg-[#e2b04a]/[0.07] blur-3xl" />
      <div className="pointer-events-none fixed top-1/3 -right-40 h-96 w-96 rounded-full bg-[#2ec4b6]/[0.06] blur-3xl" />

      {/* ── Sidebar desktop ── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-white/[0.06] bg-[#081120]/80 backdrop-blur-xl lg:flex">
        <div className="flex items-center gap-3 px-8 pt-10 pb-14">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-gold" />
          </span>
          <div>
            <p className="font-display text-xl font-black tracking-wide">SANA</p>
            <p className="text-mist text-[9px] font-bold tracking-[0.35em] uppercase">{t('admin.kicker')}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          {navItems.map((item) =>
            item.id === 'chat' ? (
              <Link
                key={item.id}
                to="/concierge"
                className="group text-mist hover:bg-white/[0.04] hover:text-white relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition"
              >
                <NavIcon path={item.icon} />
                {item.label}
              </Link>
            ) : (
              <button
                key={item.id}
                onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  activeSection === item.id ? 'bg-white/[0.05] text-white' : 'text-mist hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <span
                  className={`absolute top-1/2 left-0 h-6 w-[3px] -translate-y-1/2 rounded-r bg-gold transition-all ${
                    activeSection === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                  }`}
                />
                <NavIcon path={item.icon} />
                {item.label}
              </button>
            ),
          )}
        </nav>

        <div className="mx-4 mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
          <div className="flex items-center gap-3">
            <Avatar name={user.fullName} size={42} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{user.fullName}</p>
              <p className="text-mist truncate text-xs">{user.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-coral/25 bg-coral/10 py-2.5 text-xs font-bold text-coral transition hover:bg-coral/20"
          >
            <NavIcon path={ICONS.logout} /> {t('admin.logout')}
          </button>
        </div>
      </aside>

      {/* ── Mobile topbar ── */}
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/[0.06] bg-[#081120]/90 px-5 py-3.5 backdrop-blur-xl lg:hidden">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-gold" />
        <p className="font-display flex-1 text-lg font-black">SANA</p>
        <Avatar name={user.fullName} size={34} />
        <button onClick={logout} className="text-mist hover:text-coral transition">
          <NavIcon path={ICONS.logout} />
        </button>
      </div>

      <main className="lg:pl-72">
        <div className="mx-auto max-w-6xl px-5 pt-10 pb-24 sm:px-10">
          {/* ── Header éditorial ── */}
          <header id="overview" className="scroll-mt-24">
            <p className="text-gold text-[11px] font-bold tracking-[0.4em] uppercase">{t('admin.kicker')} · {dateLabel}</p>
            <h1 className="font-display mt-3 text-4xl leading-tight font-black sm:text-5xl">
              {greeting},{' '}
              <span className="from-gold-soft to-gold bg-gradient-to-r bg-clip-text italic text-transparent">
                {user.fullName.split(' ')[0]}
              </span>
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-lagoon/25 bg-lagoon/10 px-4 py-1.5 text-xs font-bold text-lagoon">
                <span className="relative flex h-2 w-2">
                  <span className="absolute h-full w-full animate-ping rounded-full bg-lagoon opacity-70" />
                  <span className="relative h-2 w-2 rounded-full bg-lagoon" />
                </span>
                {t('admin.online')}
              </span>
              <span className="text-mist text-xs">{counts.all} dossiers · {users.length} clients</span>
            </div>
          </header>

          {/* ── Bandeau KPI ── */}
          <section className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div className="border-gold/15 sm:col-span-2 relative overflow-hidden rounded-3xl border bg-gradient-to-br from-white/[0.06] to-transparent p-7">
              <div className="absolute -top-16 -right-16 h-44 w-44 rounded-full bg-gold/10 blur-2xl" />
              <p className="text-mist text-xs font-bold tracking-widest uppercase">{t('admin.pipeline')}</p>
              <p className="font-display mt-2 bg-gradient-to-r from-[#f5d99b] via-gold to-[#c98f2e] bg-clip-text text-5xl font-black tabular-nums text-transparent">
                {formatPrice(animPipeline, lang)}
              </p>
              <div className="mt-4 max-w-xs">
                <Sparkline values={stats.trend.length > 1 ? stats.trend : [1, stats.trend[0] ?? 1]} />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-black text-gold tabular-nums">
                  {stats.conv}%
                </span>
                <span className="text-mist text-xs">{t('admin.conversion')}</span>
              </div>
            </div>

            {[
              { label: t('admin.quotes'), value: animQuotes, accent: '#e2b04a', icon: '📄' },
              { label: t('admin.confirmed'), value: animConfirmed, accent: '#2ec4b6', icon: '✅' },
              { label: t('admin.clients'), value: animClients, accent: '#93b1e0', icon: '👥' },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="group rounded-3xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-transparent p-7 transition-all duration-300 hover:border-white/[0.14]"
              >
                <div
                  className="grid h-10 w-10 place-items-center rounded-xl text-lg"
                  style={{ background: `${kpi.accent}1f`, color: kpi.accent }}
                >
                  {kpi.icon}
                </div>
                <p className="font-display mt-5 text-4xl font-black tabular-nums" style={{ color: kpi.accent }}>
                  {kpi.value}
                </p>
                <p className="text-mist mt-1.5 text-sm">{kpi.label}</p>
              </div>
            ))}
          </section>

          {waking && (
            <div className="border-gold/25 bg-gold/10 mt-8 flex items-center gap-3 rounded-2xl border p-5">
              <span className="animate-bounce text-xl">☕</span>
              <p className="text-gold-soft text-sm font-semibold">{t('admin.waking')}</p>
            </div>
          )}

          <div className="mt-12 grid gap-8 xl:grid-cols-[minmax(0,1fr)_330px]">
            {/* ── Réservations ── */}
            <section id="bookings" className="scroll-mt-24">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 className="font-display text-2xl font-black">
                  {t('admin.bookings')}{' '}
                  <span className="text-mist text-base font-normal tabular-nums">({visible.length})</span>
                </h2>
              </div>

              {/* recherche + filtres */}
              <div className="mt-5 space-y-3.5">
                <div className="group relative">
                  <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-white/35 transition group-focus-within:text-gold">
                    <NavIcon path={ICONS.search} />
                  </span>
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('admin.search')}
                    className="focus:border-gold/50 w-full rounded-2xl border border-white/[0.09] bg-white/[0.04] py-3.5 pr-20 pl-11 text-sm outline-none transition placeholder:text-white/30"
                  />
                  {query ? (
                    <button
                      onClick={() => setQuery('')}
                      className="hover:bg-white/10 absolute top-1/2 right-3.5 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-white/50 transition"
                      aria-label="clear"
                    >
                      ✕
                    </button>
                  ) : (
                    <kbd className="absolute top-1/2 right-4 -translate-y-1/2 rounded-md border border-white/15 bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold text-white/40">
                      /
                    </kbd>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${
                        filter === f
                          ? 'border-gold/60 bg-gold/15 text-gold'
                          : 'border-white/10 text-mist hover:border-white/25 hover:text-white'
                      }`}
                    >
                      {f === 'all' ? t('admin.filterAll') : t(`st.${f}`)}
                      <span className="ml-1.5 tabular-nums opacity-60">{counts[f]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* liste */}
              <div className="mt-6 space-y-2.5">
                {bookings === null && !waking
                  ? [0, 1, 2].map((i) => (
                      <div key={i} className="h-[86px] animate-pulse rounded-2xl bg-white/[0.04]" />
                    ))
                  : visible.map((b) => (
                      <article
                        key={b._id}
                        className="hover:border-gold/25 group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 transition-all duration-300 hover:bg-white/[0.05]"
                      >
                        <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: STATUS_COLOR[b.status] }} />
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pl-2.5">
                          <Avatar name={b.contactName} size={46} />
                          <div className="min-w-[150px] flex-1">
                            <p className="text-sm font-bold">
                              {b.reference}
                              <span className="text-mist mx-2 font-normal">·</span>
                              <span className="italic">{b.offerSlug}</span>
                            </p>
                            <p className="text-mist mt-0.5 truncate text-xs">{b.contactEmail}</p>
                          </div>
                          <div className="hidden sm:block">
                            <p className="text-mist text-[10px] tracking-wider uppercase">{t('admin.joined')}</p>
                            <p className="text-sm font-semibold">{new Date(b.startDate).toLocaleDateString(locale)}</p>
                          </div>
                          <div>
                            <p className="text-mist text-[10px] tracking-wider uppercase">
                              {b.travelers} {t('admin.pax')}
                            </p>
                            <p className="text-gold-soft text-sm font-black">{formatPrice(b.totalEur, lang)}</p>
                          </div>
                          <select
                            value={b.status}
                            onChange={(e) => changeStatus(b._id, e.target.value as AdminBooking['status'])}
                            className="cursor-pointer rounded-lg border bg-transparent px-3 py-2 text-xs font-bold outline-none"
                            style={{
                              color: STATUS_COLOR[b.status],
                              borderColor: `${STATUS_COLOR[b.status]}55`,
                            }}
                          >
                            {(['draft', 'quote_sent', 'confirmed', 'cancelled'] as const).map((s) => (
                              <option key={s} value={s} className="bg-[#0d1b30] text-white">
                                {t(`st.${s}`)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </article>
                    ))}
                {bookings !== null && visible.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
                    <p className="text-3xl opacity-40">{query ? '🔍' : '🗂️'}</p>
                    <p className="text-mist mt-3 text-sm">
                      {query ? `${t('admin.noResults')} « ${query} »` : bookings.length === 0 ? t('admin.noBookings') : t('admin.emptyFilter')}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* ── Colonne latérale ── */}
            <aside className="space-y-6">
              <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-6">
                <h3 className="mb-5 text-xs font-bold tracking-[0.25em] uppercase">Répartition</h3>
                <Donut parts={donutParts} total={counts.all} />
              </div>

              <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xs font-bold tracking-[0.25em] uppercase">{t('nav.concierge')}</h3>
                  {escal.length > 0 && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-coral px-1.5 text-[10px] font-black text-white">
                      {escal.length}
                    </span>
                  )}
                </div>
                {escal.length === 0 ? (
                  <p className="text-mist text-xs leading-relaxed">{t('admin.noEscal')}</p>
                ) : (
                  <ul className="max-h-64 space-y-3 overflow-y-auto pr-1">
                    {escal.map((e) => (
                      <li key={e._id} className="border-coral/20 rounded-xl border-l-2 bg-coral/[0.06] p-3">
                        <p className="line-clamp-2 text-xs leading-relaxed">« {e.question} »</p>
                        <p className="text-mist mt-1.5 text-[10px]">
                          {new Date(e.createdAt).toLocaleString(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </aside>
          </div>

          {/* ── Clients ── */}
          <section id="clients" className="scroll-mt-24 xl:max-w-[calc(100%-370px)]">
            <h2 className="font-display mt-12 text-2xl font-black">{t('admin.clientsList')}</h2>
            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {users.length === 0 ? (
                <p className="text-mist col-span-2 text-sm">{t('admin.noClients')}</p>
              ) : (
                users
                  .slice()
                  .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
                  .map((u) => (
                    <div
                      key={u._id}
                      className="hover:border-white/[0.14] flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 transition"
                    >
                      <Avatar name={u.fullName} size={42} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">
                          {u.fullName}
                          {u.role === 'admin' && (
                            <span className="text-gold ml-2 rounded-md bg-gold/15 px-2 py-0.5 text-[9px] font-black tracking-wider uppercase">
                              admin
                            </span>
                          )}
                        </p>
                        <p className="text-mist truncate text-xs">{u.email}</p>
                      </div>
                      <p className="text-mist shrink-0 text-[10px]">
                        {t('admin.joined')} {new Date(u.createdAt).toLocaleDateString(locale)}
                      </p>
                    </div>
                  ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
