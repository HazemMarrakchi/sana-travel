import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { artFor, fetchOffer } from '../../core/api'
import type { Offer } from '../../data/offers'

export function OfferDetailPage() {
  const { slug = '' } = useParams()
  const [state, setState] = useState<{ offer?: Offer; live: boolean }>({ live: false })

  useEffect(() => {
    void fetchOffer(slug).then(setState)
    window.scrollTo(0, 0)
  }, [slug])

  const o = state.offer
  if (!o) {
    return (
      <main className="grid min-h-screen place-items-center px-6 text-center">
        <div>
          <p className="font-display text-5xl font-black">Offre introuvable</p>
          <Link to="/destinations" className="text-coral mt-4 inline-block font-bold underline">
            ← Retour aux destinations
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
        <div className="from-ink/85 via-ink/20 absolute inset-0 bg-gradient-to-t to-transparent" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-16 lg:px-8">
          <Link to="/destinations" className="text-white/80 hover:text-gold text-xs font-bold uppercase tracking-[0.3em] transition-colors">
            ← Toutes les destinations
          </Link>
          <h1 className="font-display mt-4 max-w-3xl text-5xl font-black text-white lg:text-7xl">
            {o.title}
          </h1>
          <p className="text-white/85 mt-3 max-w-2xl text-lg">{o.summary}</p>
        </div>
      </section>

      {/* details */}
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.6fr_1fr] lg:px-8">
        <div>
          <h2 className="font-display text-3xl font-black">Votre séjour</h2>
          <p className="text-slate-soft mt-4 leading-relaxed">{o.description}</p>

          <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              ['Destination', `${o.city}, ${o.country}`],
              ['Durée', `${o.nights} nuits`],
              ['Hôtel', o.hotelName],
              ['Note', `★ ${o.rating}`],
            ].map(([k, v]) => (
              <div key={k} className="border-gold border-t-2 pt-4">
                <dt className="text-slate-soft text-[11px] font-bold uppercase tracking-widest">{k}</dt>
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
          <p className="text-mist text-xs font-bold uppercase tracking-widest">À partir de</p>
          <p className="font-display mt-1 text-5xl font-black text-gold">{o.priceEur}€</p>
          <p className="text-mist mt-1 text-sm">par personne · {o.nights} nuits</p>

          <ul className="border-white/10 my-6 space-y-2.5 border-t pt-6 text-sm">
            {['Vols aller-retour inclus', 'Hébergement sélectionné', 'Assistance SANA 24h/24', 'Annulation flexible'].map(
              (f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="bg-lagoon/20 text-lagoon grid size-5 place-items-center rounded-full text-[10px] font-black">✓</span>
                  {f}
                </li>
              ),
            )}
          </ul>

          <Link
            to={`/booking?offer=${o.slug}`}
            className="block rounded-full bg-gradient-to-r from-gold to-gold-soft py-4 text-center text-sm font-bold text-ink shadow-lg shadow-gold/25 transition-transform hover:scale-[1.02]"
          >
            Réserver ce voyage →
          </Link>
          <p className="text-mist mt-4 text-center text-xs">Devis gratuit envoyé par email en 20 secondes</p>
        </aside>
      </section>
    </main>
  )
}
