import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { artFor, fetchOffer } from '../../core/api'
import type { Offer } from '../../data/offers'
import { useT } from '../../core/i18n'
import { formatPrice } from '../../core/money'
import { downloadDevis } from '../../core/devisPdf'

interface CreatedBooking {
  reference: string
  totalEur: number
}

const todayISO = () => new Date().toISOString().slice(0, 10)

export function BookingPage() {
  const [params] = useSearchParams()
  const slug = params.get('offer') ?? ''
  const { t, lang } = useT()

  const [{ offer }, setOfferState] = useState<{ offer?: Offer }>({})
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState<CreatedBooking | null>(null)

  const [startDate, setStartDate] = useState(todayISO())
  const [travelers, setTravelers] = useState(2)
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')

  useEffect(() => {
    if (slug) void fetchOffer(slug).then((r) => setOfferState({ offer: r.offer }))
    window.scrollTo(0, 0)
  }, [slug])

  const totalEur = useMemo(() => (offer ? offer.priceEur * travelers : 0), [offer, travelers])

  if (!offer) {
    return (
      <main className="bg-deep grid min-h-screen place-items-center px-6 text-center text-white">
        <div>
          <p className="font-display text-3xl font-black">{slug ? t('bk.noOffer') : t('bk.pickFirst')}</p>
          <Link to="/destinations" className="text-coral mt-4 inline-block font-bold underline">
            {t('od.backlist')}
          </Link>
        </div>
      </main>
    )
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!contactName.trim() || !/^\S+@\S+\.\S+$/.test(contactEmail)) {
      setError(t('bk.invalid'))
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'}/bookings`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            offerSlug: offer.slug,
            startDate,
            travelers,
            contactName,
            contactEmail,
            contactPhone: contactPhone || undefined,
          }),
        },
      )
      if (!res.ok) throw new Error(String(res.status))
      const data = (await res.json()) as CreatedBooking
      setCreated(data)
      window.scrollTo(0, 0)
    } catch {
      setError(t('bk.serverError'))
    } finally {
      setSubmitting(false)
    }
  }

  // ══════════ SUCCESS SCREEN ══════════
  if (created) {
    return (
      <main className="bg-deep min-h-screen px-5 pt-32 pb-24">
        <div className="mx-auto max-w-xl text-center text-white">
          <p className="text-6xl">🎉</p>
          <h1 className="font-display mt-6 text-4xl font-black">{t('bk.doneTitle')}</h1>
          <p className="text-mist mt-4 leading-relaxed">{t('bk.doneNote')}</p>

          <div className="bg-night mx-auto mt-8 rounded-3xl p-8 shadow-xl">
            <p className="text-mist text-xs font-bold uppercase tracking-widest">{t('bk.yourRef')}</p>
            <p className="font-display mt-2 text-5xl font-black tracking-wider text-gold">
              {created.reference}
            </p>
            <p className="text-mist mt-3 text-sm">
              {offer.title} · {travelers} × {formatPrice(offer.priceEur, lang)}
            </p>
          </div>

          <button
            onClick={() =>
              downloadDevis({
                reference: created.reference,
                offerTitle: offer.title,
                city: offer.city,
                country: offer.country,
                hotelName: offer.hotelName,
                nights: offer.nights,
                travelers,
                startDate,
                unitPriceEur: offer.priceEur,
                totalEur: created.totalEur,
                contactName,
                contactEmail,
              })
            }
            className="from-gold to-gold-soft mt-8 w-full rounded-full bg-gradient-to-r py-4 text-sm font-bold text-ink shadow-lg transition-transform hover:scale-[1.02]"
          >
            📄 {t('bk.pdf')}
          </button>
          <Link to="/" className="border-white/25 hover:bg-white/10 mt-3 inline-block rounded-full border px-8 py-3.5 text-sm font-semibold transition-colors">
            {t('bk.home')}
          </Link>
        </div>
      </main>
    )
  }

  const stepLabels = [t('bk.step1'), t('bk.step2'), t('bk.step3')]

  return (
    <main className="bg-ivory min-h-screen">
      <div className="mx-auto max-w-3xl px-5 pt-32 pb-24 lg:px-8">
        <p className="text-coral text-xs font-bold uppercase tracking-[0.35em]">{t('bk.kicker')}</p>
        <h1 className="font-display mt-3 text-4xl font-black lg:text-5xl">{t('bk.title')}</h1>

        {/* stepper */}
        <ol className="mt-10 flex items-center gap-2">
          {stepLabels.map((label, i) => (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-black transition-colors ${
                  step > i + 1 ? 'bg-lagoon text-white' : step === i + 1 ? 'bg-ink text-gold' : 'border-ink/20 border text-slate-soft'
                }`}
              >
                {step > i + 1 ? '✓' : i + 1}
              </span>
              <span className={`hidden text-xs font-bold uppercase tracking-wider sm:block ${step === i + 1 ? '' : 'text-slate-soft'}`}>
                {label}
              </span>
              {i < 2 && <span className={`h-px flex-1 ${step > i + 1 ? 'bg-lagoon' : 'bg-ink/15'}`} />}
            </li>
          ))}
        </ol>

        <form onSubmit={submit} className="mt-10">
          {/* ── STEP 1 : voyage ── */}
          <section className={step === 1 ? 'block' : 'hidden'}>
            <div className="border-ink/10 rounded-3xl border bg-white p-7 shadow-sm">
              <div className={`relative mb-6 h-36 overflow-hidden rounded-2xl bg-gradient-to-br ${artFor(offer.artKey)}`}>
                <PosterMini src={offer.photo ?? offer.images?.[0]} alt={offer.title} />
                <p className="font-display absolute bottom-3 left-5 text-2xl font-black text-white drop-shadow">
                  {offer.title}
                </p>
              </div>
              <label className="text-slate-soft block text-xs font-bold uppercase tracking-widest">
                {t('bk.date')}
              </label>
              <input
                type="date"
                min={todayISO()}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="border-ink/15 focus:border-gold mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none"
              />
              <label className="text-slate-soft mt-6 block text-xs font-bold uppercase tracking-widest">
                {t('bk.travelers')}
              </label>
              <select
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value))}
                className="border-ink/15 focus:border-gold mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <p className="mt-5 text-right text-sm font-semibold">
                {formatPrice(offer.priceEur, lang)} / pers · {offer.nights} {t('od.nights')}
              </p>
            </div>
            <NextBtn onClick={() => setStep(2)} label={t('bk.next')} />
          </section>

          {/* ── STEP 2 : coordonnées ── */}
          <section className={step === 2 ? 'block' : 'hidden'}>
            <div className="border-ink/10 space-y-5 rounded-3xl border bg-white p-7 shadow-sm">
              <Field label={t('bk.name')}>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  placeholder="Hazem Marrakchi"
                  className="border-ink/15 focus:border-gold w-full rounded-xl border px-4 py-3 text-sm outline-none"
                />
              </Field>
              <Field label={t('bk.email')}>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  placeholder="vous@email.com"
                  className="border-ink/15 focus:border-gold w-full rounded-xl border px-4 py-3 text-sm outline-none"
                />
              </Field>
              <Field label={t('bk.phone')}>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+216 …"
                  className="border-ink/15 focus:border-gold w-full rounded-xl border px-4 py-3 text-sm outline-none"
                />
              </Field>
            </div>
            {error && <p className="text-coral mt-4 text-sm font-semibold">{error}</p>}
            <BackNext onBack={() => setStep(1)} backLabel={t('bk.back')} onNext={() => setStep(3)} nextLabel={t('bk.next')} />
          </section>

          {/* ── STEP 3 : récap ── */}
          <section className={step === 3 ? 'block' : 'hidden'}>
            <div className="bg-night rounded-3xl p-8 text-white shadow-lg">
              <h2 className="font-display text-2xl font-black">{t('bk.recap')}</h2>
              <dl className="border-white/10 mt-5 space-y-3 border-t pt-5 text-sm">
                {[
                  [t('od.lDest'), `${offer.city}, ${offer.country}`],
                  [t('od.lHotel'), offer.hotelName],
                  [t('bk.date'), startDate],
                  [t('bk.travelers'), String(travelers)],
                  [t('bk.name'), contactName],
                  [t('bk.email'), contactEmail],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4">
                    <dt className="text-mist">{k}</dt>
                    <dd className="text-right font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="border-white/10 mt-5 flex items-baseline justify-between border-t pt-5">
                <span className="text-xs font-bold uppercase tracking-widest">{t('bk.total')}</span>
                <span className="font-display text-3xl font-black text-gold">
                  {formatPrice(totalEur, lang)}
                </span>
              </div>
              <p className="text-mist mt-1 text-right text-xs">
                ({totalEur.toLocaleString(lang === 'en' ? 'en-US' : 'fr-FR')} €)
              </p>
            </div>
            {error && <p className="text-coral mt-4 text-sm font-semibold">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="from-gold to-gold-soft mt-8 w-full rounded-full bg-gradient-to-r py-4 text-sm font-bold text-ink shadow-lg transition-transform hover:scale-[1.01] disabled:opacity-60"
            >
              {submitting ? '⏳ …' : `✉️ ${t('bk.submit')}`}
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-slate-soft mt-3 w-full text-center text-xs font-bold underline underline-offset-4"
            >
              ← {t('bk.back')}
            </button>
          </section>
        </form>
      </div>
    </main>
  )
}

function PosterMini({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return null
  return (
    <img src={src} alt={alt} onError={() => setFailed(true)} className="absolute inset-0 h-full w-full object-cover" />
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-slate-soft block text-xs font-bold uppercase tracking-widest">{label}</span>
      <span className="mt-2 block">{children}</span>
    </label>
  )
}

function NextBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-ink text-gold mt-6 w-full rounded-full py-4 text-sm font-bold shadow-lg transition-transform hover:scale-[1.01]"
    >
      {label} →
    </button>
  )
}

function BackNext({
  onBack,
  backLabel,
  onNext,
  nextLabel,
}: {
  onBack: () => void
  backLabel: string
  onNext: () => void
  nextLabel: string
}) {
  return (
    <div className="mt-6 flex gap-3">
      <button
        type="button"
        onClick={onBack}
        className="border-ink/20 hover:border-ink/50 flex-1 rounded-full border py-3.5 text-sm font-semibold transition-colors"
      >
        ← {backLabel}
      </button>
      <button
        type="button"
        onClick={onNext}
        className="bg-ink text-gold flex-[2] rounded-full py-3.5 text-sm font-bold shadow-lg transition-transform hover:scale-[1.01]"
      >
        {nextLabel} →
      </button>
    </div>
  )
}
