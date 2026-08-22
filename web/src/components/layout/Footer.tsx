import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-deep text-white">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-4xl font-black">
              SANA<span className="text-gold">.</span>
            </p>
            <p className="text-mist mt-3 max-w-xs text-sm leading-relaxed">
              L'agence de voyage qui compose votre séjour comme une œuvre — avec le soin en plus,
              et l'IA en bonus.
            </p>
            <div className="mt-6 flex gap-2">
              {['Tunis', 'Paris', 'Dubaï'].map((city) => (
                <span
                  key={city}
                  className="border-white/15 rounded-full border px-3 py-1 text-xs font-semibold text-mist"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>

          <FooterCol
            title="Explorer"
            items={['Destinations', 'Offres du moment', 'Concierge IA', 'Voyages de groupe']}
          />
          <FooterCol title="Agence" items={['À propos', 'Nos conseillers', 'Avis clients', 'Carrières']} />
          <FooterCol title="Légal" items={['CGV', 'Confidentialité', 'Assurances', 'Nous contacter']} />
        </div>

        <div className="border-white/10 mt-14 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-mist text-xs">
            © {new Date().getFullYear()} SANA Travel Agency — Conçu avec soin.
          </p>
          <p className="text-mist text-xs">
            Démo produit par{' '}
            <Link
              to="https://hazemmarrakchi.github.io/portfolio/"
              className="text-gold hover:underline"
            >
              Hazem Marrakchi
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {items.map((it) => (
          <li key={it}>
            <a href="#" className="text-mist hover:text-white text-sm transition-colors">
              {it}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
