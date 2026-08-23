import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE, useAuth } from '../../core/auth'
import { useT } from '../../core/i18n'
import { formatPrice } from '../../core/money'

/** propositions vols aller-retour au départ de Tunis (tarifs indicatifs) */
const FLIGHTS: Record<string, { airline: string; airlineCode: string; priceEur: number; stops: number; origin: string; destination: string }[]> = {
  Turquie: [
    { airline: 'Nouvelair', airlineCode: 'BJ', priceEur: 290, stops: 0, origin: 'TUN', destination: 'IST' },
    { airline: 'Tunisair', airlineCode: 'TU', priceEur: 320, stops: 0, origin: 'TUN', destination: 'IST' },
    { airline: 'Turkish Airlines', airlineCode: 'TK', priceEur: 350, stops: 0, origin: 'TUN', destination: 'IST' },
  ],
  Grèce: [
    { airline: 'Transavia', airlineCode: 'TO', priceEur: 260, stops: 0, origin: 'TUN', destination: 'ATH' },
    { airline: 'Tunisair', airlineCode: 'TU', priceEur: 285, stops: 0, origin: 'TUN', destination: 'ATH' },
  ],
  Maldives: [
    { airline: 'Turkish Airlines', airlineCode: 'TK', priceEur: 720, stops: 1, origin: 'TUN', destination: 'MLE' },
    { airline: 'Qatar Airways', airlineCode: 'QR', priceEur: 755, stops: 1, origin: 'TUN', destination: 'MLE' },
    { airline: 'Emirates', airlineCode: 'EK', priceEur: 785, stops: 1, origin: 'TUN', destination: 'MLE' },
  ],
  Maroc: [
    { airline: 'Royal Air Maroc', airlineCode: 'AT', priceEur: 235, stops: 0, origin: 'TUN', destination: 'CMN' },
    { airline: 'Tunisair', airlineCode: 'TU', priceEur: 250, stops: 0, origin: 'TUN', destination: 'CMN' },
  ],
  Indonésie: [
    { airline: 'Turkish Airlines', airlineCode: 'TK', priceEur: 805, stops: 1, origin: 'TUN', destination: 'DPS' },
    { airline: 'Qatar Airways', airlineCode: 'QR', priceEur: 825, stops: 1, origin: 'TUN', destination: 'DPS' },
    { airline: 'Emirates', airlineCode: 'EK', priceEur: 855, stops: 1, origin: 'TUN', destination: 'DPS' },
  ],
  'Émirats Arabes Unis': [
    { airline: 'flydubai', airlineCode: 'FZ', priceEur: 385, stops: 0, origin: 'TUN', destination: 'DXB' },
    { airline: 'Emirates', airlineCode: 'EK', priceEur: 430, stops: 0, origin: 'TUN', destination: 'DXB' },
    { airline: 'Turkish Airlines', airlineCode: 'TK', priceEur: 455, stops: 1, origin: 'TUN', destination: 'DXB' },
  ],
  Égypte: [
    { airline: 'Tunisair', airlineCode: 'TU', priceEur: 295, stops: 0, origin: 'TUN', destination: 'CAI' },
    { airline: 'EgyptAir', airlineCode: 'MS', priceEur: 315, stops: 0, origin: 'TUN', destination: 'CAI' },
  ],
  Thaïlande: [
    { airline: 'Qatar Airways', airlineCode: 'QR', priceEur: 745, stops: 1, origin: 'TUN', destination: 'BKK' },
    { airline: 'Emirates', airlineCode: 'EK', priceEur: 770, stops: 1, origin: 'TUN', destination: 'BKK' },
  ],
}

interface OfferLite {
  _id: string
  slug: string
  title: string
  city: string
  country: string
  priceEur: number
  nights: number
}

interface FlightProp {
  airline: string
  airlineCode?: string
  priceEur: number
  stops: number
  flightNumber?: string
  departureAt?: string
  returnAt?: string
  duration?: string
  origin: string
  destination: string
  link?: string
}

const AIRPORT_LABEL: Record<string, string> = {
  TUN: 'Tunis-Carthage',
  IST: 'Istanbul',
  SAW: 'Istanbul-Sabiha',
  ATH: 'Athènes',
  MLE: 'Malé',
  CMN: 'Casablanca',
  DPS: 'Bali',
  DXB: 'Dubaï',
  CAI: 'Le Caire',
  BKK: 'Bangkok',
}

const AIRLINE_LOGO: Record<string, string> = {
  TU: '🇹🇳', BJ: '🇹🇳', TK: '🇹🇷', EK: '🇦🇪', QR: '🇶🇦', AF: '🇫🇷',
  MS: '🇪🇬', AT: '🇲🇦', PC: '🇹🇷', FZ: '🇦🇪', TO: '🇫🇷', LH: '🇩🇪',
  U2: '🇬🇧', FR: '🇮🇪', W6: '🇭🇺',
}

function fmtFlightDT(iso: string | undefined, locale: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso.slice(0, 16).replace('T', ' ')
  return d.toLocaleString(locale === 'en' ? 'en-GB' : 'fr-FR', {
    weekday: 'short', day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Tunis',
  })
}

/** aéroport principal par pays (départ toujours TUN) */
const IATA: Record<string, string> = {
  Turquie: 'IST',
  Grèce: 'ATH',
  Maldives: 'MLE',
  Maroc: 'CMN',
  Indonésie: 'DPS',
  'Émirats Arabes Unis': 'DXB',
  Égypte: 'CAI',
  Thaïlande: 'BKK',
}

const iso = (d: Date) => d.toISOString().slice(0, 10)

export function CustomTripPage() {
  const { t, lang } = useT()
  const { user } = useAuth()

  const [offers, setOffers] = useState<OfferLite[] | null>(null)
  const [country, setCountry] = useState('')
  const [dep, setDep] = useState(iso(new Date(Date.now() + 14 * 864e5)))
  const [ret, setRet] = useState(iso(new Date(Date.now() + 21 * 864e5)))
  const [travelers, setTravelers] = useState(2)
  const [withFlight, setWithFlight] = useState(true)
  const [flightIdx, setFlightIdx] = useState(0)
  const [name, setName] = useState(user?.fullName ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState('')
  const [realFlights, setRealFlights] = useState<FlightProp[] | null>(null)
  const [sending, setSending] = useState(false)
  const [reference, setReference] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    void fetch(`${API_BASE}/offers`)
      .then((r) => r.json())
      .then((d: OfferLite[]) => setOffers(d))
      .catch(() => setOffers([]))
  }, [])

  /** vols temps réel (Amadeus) dès que les clés sont configurées côté API */
  useEffect(() => {
    const to = IATA[country]
    if (!to || !withFlight) return
    setRealFlights(null)
    const ctrl = new AbortController()
    void fetch(`${API_BASE}/flights/search?to=${to}&dep=${dep}&ret=${ret}&adults=${travelers}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d: { offers?: FlightProp[] }) => setRealFlights(d.offers ?? []))
      .catch(() => setRealFlights([]))
    return () => ctrl.abort()
  }, [country, dep, ret, travelers, withFlight])

  const countries = useMemo(() => {
    const set = new Set<string>([...(offers ?? []).map((o) => o.country), ...Object.keys(FLIGHTS)])
    return [...set]
  }, [offers])

  useEffect(() => {
    if (!country && countries.length > 0) setCountry(countries[0])
  }, [countries, country])

  const nights = useMemo(() => {
    const n = Math.round((new Date(ret).getTime() - new Date(dep).getTime()) / 864e5)
    return Math.max(1, Math.min(30, Number.isFinite(n) ? n : 7))
  }, [dep, ret])

  const base = useMemo(() => {
    const mine = (offers ?? []).filter((o) => o.country === country)
    if (mine.length === 0) return null
    return mine.reduce((a, b) => (a.priceEur / a.nights <= b.priceEur / b.nights ? a : b))
  }, [offers, country])

  const nightly = base ? base.priceEur / base.nights : 85
  const hotelTotal = Math.round(nightly * nights * travelers)
  const live = (realFlights ?? []).filter((f) => f.priceEur > 0)
  const flights: FlightProp[] = live.length > 0 ? live : FLIGHTS[country] ?? []
  const flightSource: 'live' | 'estimate' = live.length > 0 ? 'live' : 'estimate'
  const flight = withFlight && flights.length > 0 ? flights[Math.min(flightIdx, flights.length - 1)] : null
  const flightTotal = flight ? flight.priceEur * travelers : 0
  const total = hotelTotal + flightTotal

  useEffect(() => setFlightIdx(0), [flightSource])

  async function submit() {
    setError('')
    if (!name.trim() || !/.+@.+\..+/.test(email)) {
      setError(t('bk.invalid'))
      return
    }
    setSending(true)
    try {
      const note = JSON.stringify({
        type: 'voyage-libre',
        pays: country,
        ville: base?.city ?? '',
        nuits: nights,
        vol: flight ? `${flight.airline} (${flight.stops === 0 ? 'direct' : `${flight.stops} escale${flight.stops > 1 ? 's' : ''}`})` : 'sans vol',
      })
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId: base?._id ?? `custom-${country}`,
          offerSlug: base?.slug ?? 'voyage-libre',
          contactName: name.trim(),
          contactEmail: email.trim(),
          contactPhone: phone.trim() || undefined,
          travelers,
          startDate: dep,
          endDate: ret,
          note,
          totalEur: total,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const d = (await res.json()) as { reference: string }
      setReference(d.reference)
    } catch {
      setError(t('bk.serverError'))
    } finally {
      setSending(false)
    }
  }

  if (reference) {
    return (
      <main className="bg-deep grid min-h-screen place-items-center px-5 pt-32 pb-24 text-white">
        <div className="bg-night max-w-lg rounded-[2rem] border border-white/10 p-10 text-center shadow-2xl">
          <p className="text-5xl">🎉</p>
          <h1 className="font-display mt-4 text-3xl font-black">{t('vt.done')}</h1>
          <p className="text-gold font-display mt-4 text-2xl font-black tracking-widest">{reference}</p>
          <p className="text-mist mt-4 text-sm leading-relaxed">{t('od.quoteSent')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/account" className="from-gold to-gold-soft rounded-full bg-gradient-to-r px-6 py-3 text-sm font-bold text-ink">
              {t('acct.myBookings')} →
            </Link>
            <button onClick={() => setReference('')} className="border-white/25 text-mist hover:text-white rounded-full border px-6 py-3 text-sm font-semibold">
              {t('vt.title')}
            </button>
          </div>
        </div>
      </main>
    )
  }

  const inp =
    'w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm outline-none transition focus:border-gold/60'
  const lab = 'mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-white/50'

  return (
    <main className="bg-deep min-h-screen px-5 pt-32 pb-24 text-white lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="max-w-2xl">
          <p className="text-gold text-xs font-bold uppercase tracking-[0.35em]">{t('vt.kicker')}</p>
          <h1 className="font-display mt-3 text-5xl font-black leading-[1.05]">{t('vt.title')}</h1>
          <p className="text-mist mt-4 leading-relaxed">{t('vt.sub')}</p>
        </header>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          {/* formulaire */}
          <section className="bg-night space-y-6 rounded-[2rem] border border-white/10 p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={lab}>{t('vt.dest')}</label>
                <select value={country} onChange={(e) => { setCountry(e.target.value); setFlightIdx(0) }} className={`${inp} [&>option]:bg-[#0d1b30]`}>
                  {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lab}>{t('vt.pax')}</label>
                <input type="number" min={1} max={12} value={travelers} onChange={(e) => setTravelers(Math.max(1, Math.min(12, Number(e.target.value) || 1)))} className={inp} />
              </div>
              <div>
                <label className={lab}>✈️ {t('vt.dep')}</label>
                <input type="date" min={iso(new Date())} value={dep} onChange={(e) => setDep(e.target.value)} className={inp} />
              </div>
              <div>
                <label className={lab}>🏠 {t('vt.ret')}</label>
                <input type="date" min={iso(new Date(new Date(dep).getTime() + 864e5))} value={ret} onChange={(e) => setRet(e.target.value)} className={inp} />
              </div>
            </div>

            <p className="text-gold text-sm font-bold">
              🌙 {nights} {t('vt.nights')}
            </p>

            {flights.length > 0 && (
              <div>
                <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
                  <input type="checkbox" checked={withFlight} onChange={(e) => setWithFlight(e.target.checked)} className="accent-gold h-4 w-4" />
                  ✈️ {t('vt.flight')}
                </label>
                {withFlight && (
                  <>
                    <p className="text-mist mt-3 text-[11px] font-bold uppercase tracking-wider">
                      {realFlights === null && IATA[country] ? (
                        <span className="animate-pulse">⏳ {t('vt.loadingFlights')}</span>
                      ) : flightSource === 'live' ? (
                        <span className="text-lagoon">● {t('vt.live')}</span>
                      ) : (
                        <span>○ {t('vt.estimate')}</span>
                      )}
                    </p>
                    <div className="mt-2 grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
                      {flights.map((f, i) => {
                        const oLabel = AIRPORT_LABEL[f.origin] ?? f.origin
                        const dLabel = AIRPORT_LABEL[f.destination] ?? f.destination
                        const code = f.airlineCode ?? ''
                        return (
                          <button
                            key={`${f.airline}-${code}-${i}`}
                            onClick={() => setFlightIdx(i)}
                            className={`rounded-2xl border p-4 text-start transition ${
                              flightIdx === i
                                ? 'border-gold bg-gold/10 shadow-lg shadow-gold/10'
                                : 'border-white/10 hover:border-white/25'
                            }`}
                          >
                            <p className="flex items-center gap-2 text-sm font-bold leading-none">
                              <span className="text-base leading-none">{AIRLINE_LOGO[code] ?? '✈️'}</span>
                              <span>{f.airline}</span>
                              {f.flightNumber && (
                                <span className="text-mist text-[11px] font-normal">· {f.flightNumber}</span>
                              )}
                            </p>
                            <p className="mt-1.5 text-[11px] font-semibold">
                              <span className={f.stops === 0 ? 'text-lagoon' : 'text-amber-300'}>
                                {f.stops === 0 ? 'Direct' : `${f.stops} escale${f.stops > 1 ? 's' : ''}`} · A/R
                              </span>
                              <span className="text-mist font-normal"> · {oLabel} ⇄ {dLabel}</span>
                              {f.duration && (
                                <span className="text-mist font-normal"> · ⏱ {f.duration}</span>
                              )}
                            </p>
                            <div className="mt-2 space-y-1.5 border-t border-white/10 pt-2.5 text-[11px] leading-relaxed">
                              <p>
                                <span className="text-mist font-bold uppercase tracking-wider">Aller</span>{' '}
                                <span className="text-white/90">{fmtFlightDT(f.departureAt, lang)}</span>
                                <br />
                                <span className="text-mist">{f.origin}</span> →{' '}
                                <span className="text-mist">{f.destination}</span>
                              </p>
                              {f.returnAt && (
                                <p>
                                  <span className="text-mist font-bold uppercase tracking-wider">Retour</span>{' '}
                                  <span className="text-white/90">{fmtFlightDT(f.returnAt, lang)}</span>
                                  <br />
                                  <span className="text-mist">{f.destination}</span> →{' '}
                                  <span className="text-mist">{f.origin}</span>
                                </p>
                              )}
                            </div>
                            <p className="font-display mt-3 text-lg font-black leading-none">
                              {formatPrice(f.priceEur, lang)}{' '}
                              <span className="text-mist text-[10px] font-normal tracking-wide">/ pers.</span>
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label className={lab}>{t('vt.name')} *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className={inp} />
              </div>
              <div>
                <label className={lab}>{t('vt.email')} *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inp} />
              </div>
              <div>
                <label className={lab}>{t('bk.phone')}</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inp} />
              </div>
            </div>

            {error && <p className="text-coral text-sm font-semibold">{error}</p>}
          </section>

          {/* récap */}
          <aside className="bg-night h-fit rounded-[2rem] border border-gold/30 p-8 lg:sticky lg:top-28">
            <p className="text-gold text-xs font-bold uppercase tracking-[0.3em]">{t('vt.total')}</p>
            <p className="font-display mt-3 text-5xl font-black">{formatPrice(total, lang)}</p>
            <div className="mt-6 space-y-3 border-t border-white/10 pt-6 text-sm">
              <p className="flex justify-between gap-4">
                <span className="text-mist">🏨 {base?.title ?? country} · {nights}×{nights >= 1 ? '' : ''}{t('vt.nights')}</span>
                <span className="font-semibold tabular-nums">{formatPrice(hotelTotal, lang)}</span>
              </p>
              <p className="flex justify-between gap-4">
                <span className="text-mist">✈️ {flight ? flight.airline : t('vt.noFlight')}</span>
                <span className="font-semibold tabular-nums">{flight ? formatPrice(flightTotal, lang) : '—'}</span>
              </p>
              <p className="flex justify-between gap-4">
                <span className="text-mist">{travelers} × {t('od.perPerson')}</span>
              </p>
            </div>
            <button
              onClick={() => void submit()}
              disabled={sending}
              className="from-gold to-gold-soft mt-8 w-full rounded-full bg-gradient-to-r px-6 py-4 text-sm font-black text-ink shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              {sending ? '…' : `${t('vt.cta')} →`}
            </button>
            <p className="text-mist mt-4 text-[11px] leading-relaxed text-center">{t('od.devis')}</p>
          </aside>
        </div>
      </div>
    </main>
  )
}
