import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiAuth, useAuth } from '../../core/auth'
import { useT } from '../../core/i18n'
import { formatPrice } from '../../core/money'
import { ART } from '../../data/offers'

interface AdminOffer {
  slug: string
  title: string
  city: string
  country: string
  summary?: string
  description?: string
  priceEur: number
  nights: number
  hotelName?: string
  rating?: number
  artKey?: string
  tags?: string[]
  featured?: boolean
  images?: string[]
}

type OfferDraft = {
  slug: string
  title: string
  city: string
  country: string
  summary: string
  description: string
  priceEur: number
  nights: number
  hotelName: string
  rating: number
  tags: string
  featured: boolean
  images: string
}

const EMPTY_DRAFT: OfferDraft = {
  slug: '', title: '', city: '', country: '', summary: '', description: '',
  priceEur: 900, nights: 4, hotelName: '', rating: 4.8, tags: '', featured: false, images: '',
}

function slugify(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

/** catalogue géographique — sélection en cascade pays → ville */
const GEO: Record<string, string[]> = {
  'Turquie': ['Istanbul', 'Cappadoce', 'Antalya', 'Bodrum'],
  'Grèce': ['Santorin', 'Athènes', 'Mykonos', 'Crète'],
  'Maldives': ['Malé Atoll'],
  'Maroc': ['Marrakech', 'Casablanca', 'Agadir', 'Fès'],
  'Indonésie': ['Ubud', 'Seminyak'],
  'Émirats Arabes Unis': ['Dubaï', 'Abu Dhabi'],
  'Égypte': ['Le Caire', 'Hurghada', 'Sharm El Sheikh'],
  'Thaïlande': ['Bangkok', 'Phuket'],
  'Tunisie': ['Djerba', 'Hammamet', 'Sousse', 'Tozeur'],
}
const OTHER = '__other__'

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
  handled?: boolean
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
  tag: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z M7 7h.01',
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

/** en-tête de section dans le formulaire d'offre */
function FormSection({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="mt-2 sm:col-span-2 first:mt-0">
      <p className="text-gold mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.25em]">
        <span className="text-sm">{icon}</span> {title}
      </p>
      <div className="h-px bg-white/[0.07]" />
    </div>
  )
}

export function AdminPage() {
  const { token, user, logout } = useAuth()
  const { t, lang } = useT()
  const [bookings, setBookings] = useState<AdminBooking[] | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [escal, setEscal] = useState<Escalation[]>([])
  const [offers, setOffers] = useState<AdminOffer[]>([])
  const [modal, setModal] = useState<null | { mode: 'create' } | { mode: 'edit'; slug: string }>(null)
  const [draft, setDraft] = useState<OfferDraft>(EMPTY_DRAFT)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [offerFilter, setOfferFilter] = useState('all')
  const [offerQuery, setOfferQuery] = useState('')
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
          const [b, u, e, of] = await Promise.all([
            apiAuth('/bookings', token),
            apiAuth('/users', token),
            apiAuth('/chat/escalations', token),
            apiAuth('/offers', token),
          ])
          if (!alive) return
          setWaking(false)
          const arr = (x: unknown): AdminBooking[] =>
            Array.isArray(x) ? (x as AdminBooking[]) : ((x as { bookings?: AdminBooking[] })?.bookings ?? [])
          setBookings(arr(b))
          setUsers(Array.isArray(u) ? (u as AdminUser[]) : [])
          setEscal(Array.isArray(e) ? (e as Escalation[]) : [])
          setOffers(Array.isArray(of) ? (of as AdminOffer[]) : [])
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

  const offerCountries = useMemo(() => Array.from(new Set(offers.map((o) => o.country))).sort(), [offers])
  const shownOffers = useMemo(() => {
    let list = offers
    if (offerFilter !== 'all') list = list.filter((o) => o.country === offerFilter)
    const q = foldStr(offerQuery.trim())
    if (q) list = list.filter((o) => foldStr(`${o.title} ${o.city} ${o.country}`).includes(q))
    return list
  }, [offers, offerFilter, offerQuery])

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

  function openCreate() {
    setDraft(EMPTY_DRAFT)
    setModal({ mode: 'create' })
  }
  function openEdit(o: AdminOffer) {
    setDraft({
      slug: o.slug,
      title: o.title,
      city: o.city,
      country: o.country,
      summary: o.summary ?? '',
      description: o.description ?? '',
      priceEur: o.priceEur,
      nights: o.nights,
      hotelName: o.hotelName ?? '',
      rating: o.rating ?? 4.8,
      tags: (o.tags ?? []).join(', '),
      featured: Boolean(o.featured),
      images: (o.images ?? []).join('\n'),
    })
    setModal({ mode: 'edit', slug: o.slug })
  }
  async function saveOffer() {
    if (!draft.title.trim() || saving) return
    setSaving(true)
    const payload = {
      slug: draft.slug.trim() || slugify(draft.title),
      title: draft.title.trim(),
      city: draft.city.trim(),
      country: draft.country.trim(),
      summary: draft.summary.trim(),
      description: draft.description.trim(),
      priceEur: Number(draft.priceEur) || 0,
      nights: Number(draft.nights) || 1,
      hotelName: draft.hotelName.trim(),
      rating: Number(draft.rating) || 4.8,
      tags: draft.tags.split(',').map((s) => s.trim()).filter(Boolean),
      featured: draft.featured,
      artKey: slugify(draft.city || draft.title),
      images: draft.images.split(/[\n,]/).map((s) => s.trim()).filter(Boolean),
    }
    try {
      if (modal?.mode === 'edit') await apiAuth(`/offers/${modal.slug}`, token!, { method: 'PUT', body: payload })
      else await apiAuth('/offers', token!, { method: 'POST', body: payload })
      setOffers((os) => [...os.filter((o) => o.slug !== payload.slug), payload as unknown as AdminOffer])
      setModal(null)
    } catch {
      /* leave modal open on error */
    } finally {
      setSaving(false)
    }
  }
  async function removeOffer(slug: string) {
    if (!window.confirm(t('admin.deleteConfirm'))) return
    try {
      await apiAuth(`/offers/${slug}`, token!, { method: 'DELETE' })
      setOffers((os) => os.filter((o) => o.slug !== slug))
    } catch {
      /* ignore */
    }
  }

  async function markHandled(id: string) {
    try {
      await apiAuth(`/chat/escalations/${id}`, token!, { method: 'PATCH' })
      setEscal((es) => es.map((e) => (e._id === id ? { ...e, handled: true } : e)))
    } catch {
      /* ignore */
    }
  }

  function exportCsv() {    const rows = [
      ['reference', 'offre', 'client', 'email', 'voyageurs', 'depart', 'statut', 'total_eur'],
      ...(bookings ?? []).map((b) => [
        b.reference, b.offerSlug, b.contactName, b.contactEmail,
        String(b.travelers), b.startDate.slice(0, 10), b.status, String(b.totalEur),
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `sana-reservations-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
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
    ;['overview', 'offers', 'bookings', 'clients'].forEach((id) => {
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
    { id: 'offers', label: t('nav.offers'), icon: ICONS.tag },
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

  const inp = 'focus:border-gold/60 w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm outline-none transition'
  const lab = 'mb-1 block text-[11px] font-bold uppercase tracking-wider text-white/40'
  const countryKnown = Object.keys(GEO).includes(draft.country)
  const cityOptions = GEO[draft.country] ?? []
  const cityKnown = cityOptions.includes(draft.city)
  const set = (k: keyof OfferDraft, v: string | number | boolean) => setDraft((d) => ({ ...d, [k]: v }))

  return (
    <div className="relative min-h-screen bg-[#050d1a] text-white">
      {/* ambient glows */}
      <div className="pointer-events-none fixed -top-40 -left-40 h-96 w-96 rounded-full bg-[#e2b04a]/[0.07] blur-3xl" />
      <div className="pointer-events-none fixed top-1/3 -right-40 h-96 w-96 rounded-full bg-[#2ec4b6]/[0.06] blur-3xl" />

      {/* ── Sidebar desktop ── */}
      <aside className="fixed top-[72px] bottom-0 left-0 z-40 hidden w-72 flex-col border-r border-white/[0.06] bg-[#081120]/80 backdrop-blur-xl lg:flex">
        <div className="flex items-center gap-2.5 px-8 pt-5 pb-8">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
          </span>
          <div>
            <p className="font-display text-base leading-none font-black tracking-[0.25em]">SANA</p>
            <p className="text-mist mt-1 text-[8px] font-bold tracking-[0.3em] uppercase">{t('admin.kicker')}</p>
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
      <div className="sticky top-[72px] z-30 flex items-center gap-3 border-b border-white/[0.06] bg-[#081120]/90 px-5 py-3 backdrop-blur-xl lg:hidden">
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

          {/* ── Offres ── */}
          <section id="offers" className="mt-12 scroll-mt-24">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-black">
                {t('nav.offers')}{' '}
                <span className="text-mist text-base font-normal tabular-nums">({shownOffers.length}/{offers.length})</span>
              </h2>
              <button
                onClick={openCreate}
                className="from-gold to-gold-soft text-ink hover:shadow-gold/40 rounded-full bg-gradient-to-r px-6 py-2.5 text-xs font-black shadow-lg shadow-gold/25 transition-all hover:scale-105"
              >
                + {t('admin.newOffer')}
              </button>
            </div>

            {/* recherche + filtres pays */}
            <div className="mt-5 space-y-3">
              <div className="group relative max-w-md">
                <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-white/35 transition group-focus-within:text-gold">
                  <NavIcon path={ICONS.search} />
                </span>
                <input
                  value={offerQuery}
                  onChange={(e) => setOfferQuery(e.target.value)}
                  placeholder={t('ts.destination')}
                  className="focus:border-gold/50 w-full rounded-2xl border border-white/[0.09] bg-white/[0.04] py-3 pr-4 pl-11 text-sm outline-none transition placeholder:text-white/30"
                />
              </div>
              {offerCountries.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setOfferFilter('all')}
                    className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${
                      offerFilter === 'all'
                        ? 'border-lagoon/60 bg-lagoon/15 text-lagoon'
                        : 'border-white/10 text-mist hover:border-white/25 hover:text-white'
                    }`}
                  >
                    {t('admin.filterAll')} <span className="ml-1.5 tabular-nums opacity-60">{offers.length}</span>
                  </button>
                  {offerCountries.map((c) => (
                    <button
                      key={c}
                      onClick={() => setOfferFilter(offerFilter === c ? 'all' : c)}
                      className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${
                        offerFilter === c
                          ? 'border-lagoon/60 bg-lagoon/15 text-lagoon'
                          : 'border-white/10 text-mist hover:border-white/25 hover:text-white'
                      }`}
                    >
                      {c}{' '}
                      <span className="ml-1.5 tabular-nums opacity-60">{offers.filter((o) => o.country === c).length}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {shownOffers.map((o) => (
                <article
                  key={o.slug}
                  className="hover:border-gold/25 group overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.03] transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`relative aspect-[16/9] bg-gradient-to-br ${o.artKey ? ART[o.artKey] ?? 'from-gold to-coral' : 'from-gold to-coral'}`}>
                    {o.images?.[0] && (
                      <img src={o.images[0]} alt={o.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                    )}
                    <div className="from-deep absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-70" />
                    {o.featured && (
                      <span className="text-ink absolute top-3 start-3 rounded-full bg-gold px-2.5 py-1 text-[10px] font-black uppercase">
                        ★
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 p-5 pt-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{o.title}</p>
                      <p className="text-mist truncate text-xs">{o.city} · {o.country}</p>
                      <p className="text-gold-soft mt-1.5 text-sm font-black">
                        {formatPrice(o.priceEur, lang)}{' '}
                        <span className="text-mist text-xs font-semibold">· {o.nights} n · ★ {o.rating ?? 4.8}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => openEdit(o)}
                      title={t('admin.edit')}
                      className="hover:border-gold/50 hover:text-gold grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-sm transition"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => removeOffer(o.slug)}
                      title={t('admin.delete')}
                      className="hover:border-coral/60 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-sm transition hover:bg-coral/15"
                    >
                      🗑️
                    </button>
                  </div>
                </article>
              ))}
            </div>
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
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-2xl font-black">
                  {t('admin.bookings')}{' '}
                  <span className="text-mist text-base font-normal tabular-nums">({visible.length})</span>
                </h2>
                <button
                  onClick={exportCsv}
                  className="hover:border-lagoon/60 hover:text-lagoon rounded-full border border-white/15 px-5 py-2 text-xs font-bold text-mist transition"
                >
                  ⬇ Excel / CSV
                </button>
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
                      <li
                        key={e._id}
                        className={`rounded-xl border-l-2 bg-coral/[0.06] p-3 ${e.handled ? 'border-white/10 opacity-50' : 'border-coral/20'}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className={`line-clamp-2 text-xs leading-relaxed ${e.handled ? 'line-through' : ''}`}>❝ {e.question} ❞</p>
                          {!e.handled && (
                            <button
                              onClick={() => void markHandled(e._id)}
                              title={t('admin.handled')}
                              className="text-lagoon hover:border-lagoon/60 shrink-0 rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-bold transition"
                            >
                              ✓ {t('admin.handled')}
                            </button>
                          )}
                        </div>
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

      {/* ── Modal offre (création / édition) ── */}
      {modal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => !saving && setModal(null)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault()
              void saveOffer()
            }}
            className="border-white/10 bg-night my-8 w-full max-w-2xl rounded-3xl border p-7 shadow-2xl sm:mx-auto"
          >
            <h3 className="font-display text-2xl font-black">
              {modal.mode === 'create' ? t('admin.newOffer') : `${t('admin.edit')} · ${modal.slug}`}
            </h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <FormSection icon="📍" title={t('fs.geo')} />
              <div>
                <label className={lab}>{t('f.country')}</label>
                <select
                  value={countryKnown ? draft.country : OTHER}
                  onChange={(e) => {
                    const v = e.target.value
                    if (v === OTHER) set('country', '')
                    else {
                      set('country', v)
                      set('city', '')
                    }
                  }}
                  className={inp}
                >
                  {Object.keys(GEO).map((c) => (
                    <option key={c} value={c} className="bg-[#0d1b30]">{c}</option>
                  ))}
                  <option value={OTHER} className="bg-[#0d1b30]">Autre…</option>
                </select>
              </div>
              {!countryKnown && (
                <div>
                  <label className={lab}>{t('f.country')}</label>
                  <input value={draft.country} onChange={(e) => set('country', e.target.value)} className={inp} />
                </div>
              )}
              {countryKnown ? (
                <div>
                  <label className={lab}>{t('f.city')}</label>
                  <select
                    value={cityKnown ? draft.city : OTHER}
                    onChange={(e) => {
                      const v = e.target.value
                      if (v === OTHER) set('city', '')
                      else set('city', v)
                    }}
                    className={inp}
                  >
                    {cityOptions.map((c) => (
                      <option key={c} value={c} className="bg-[#0d1b30]">{c}</option>
                    ))}
                    <option value={OTHER} className="bg-[#0d1b30]">Autre…</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className={lab}>{t('f.city')}</label>
                  <input value={draft.city} onChange={(e) => set('city', e.target.value)} className={inp} />
                </div>
              )}
              {!cityKnown && countryKnown && (
                <div>
                  <label className={lab}>{t('f.city')}</label>
                  <input value={draft.city} onChange={(e) => set('city', e.target.value)} className={inp} />
                </div>
              )}
              <div>
                <label className={lab}>{t('f.hotel')}</label>
                <input value={draft.hotelName} onChange={(e) => set('hotelName', e.target.value)} className={inp} />
              </div>

              <FormSection icon="📝" title={t('fs.content')} />
              <div className="sm:col-span-2">
                <label className={lab}>{t('f.title')} *</label>
                <input required value={draft.title} onChange={(e) => set('title', e.target.value)} className={inp} />
              </div>
              <div className="sm:col-span-2">
                <label className={lab}>{t('f.summary')}</label>
                <textarea rows={2} value={draft.summary} onChange={(e) => set('summary', e.target.value)} className={`${inp} resize-none`} />
              </div>
              <div className="sm:col-span-2">
                <label className={lab}>{t('f.desc')}</label>
                <textarea rows={4} value={draft.description} onChange={(e) => set('description', e.target.value)} className={`${inp} resize-none`} />
              </div>
              <div className="sm:col-span-2">
                <label className={lab}>{t('f.tags')}</label>
                <input value={draft.tags} onChange={(e) => set('tags', e.target.value)} className={inp} />
              </div>

              <FormSection icon="💰" title={t('fs.pricing')} />
              <div className="grid grid-cols-3 gap-3 sm:col-span-2">
                {([
                  ['priceEur', 'f.price'],
                  ['nights', 'f.nights'],
                  ['rating', '★'],
                ] as const).map(([k, lk]) => (
                  <div key={k}>
                    <label className={lab}>{lk === '★' ? '★' : t(lk)}</label>
                    <input
                      type="number"
                      step={k === 'rating' ? '0.1' : '1'}
                      min={k === 'nights' ? 1 : 0}
                      value={draft[k]}
                      onChange={(e) => set(k, Number(e.target.value))}
                      className={inp}
                    />
                  </div>
                ))}
              </div>

              <FormSection icon="🖼️" title={t('fs.media')} />
              <div className="sm:col-span-2">
                <label className={lab}>{t('f.images')} <span className="font-normal text-ink/50">(une URL par ligne)</span></label>
                <textarea
                  value={draft.images}
                  rows={3}
                  placeholder={"https://images.unsplash.com/photo-…\nhttps://images.unsplash.com/photo-…"}
                  onChange={(e) => set('images', e.target.value)}
                  className={inp + ' resize-y'}
                />
                {draft.images.split(/[\n,]/).map((s) => s.trim()).filter(Boolean).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {draft.images.split(/[\n,]/).map((s) => s.trim()).filter(Boolean).map((u, i) => (
                      <img key={i} src={u} alt="" className="h-16 w-24 rounded-lg object-cover ring-1 ring-white/20" onError={(e) => ((e.currentTarget.style.opacity = '0.25'))} />
                    ))}
                  </div>
                )}
              </div>
              <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold sm:col-span-2">
                <input type="checkbox" checked={draft.featured} onChange={(e) => set('featured', e.target.checked)} className="accent-gold h-4 w-4" />
                ★ {t('f.featured')}
              </label>
            </div>
            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="hover:border-white/30 rounded-full border border-white/15 px-6 py-2.5 text-xs font-bold text-mist transition"
              >
                {t('admin.cancel')}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="from-gold to-gold-soft text-ink rounded-full bg-gradient-to-r px-8 py-2.5 text-xs font-black shadow-lg shadow-gold/25 transition-all hover:scale-105 disabled:opacity-50"
              >
                {saving ? '…' : t('admin.save')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
