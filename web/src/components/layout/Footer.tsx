import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useT } from '../../core/i18n'

export function Footer() {
  const { t } = useT()
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  async function subscribe() {
    if (!/.+@.+\..+/.test(email)) return
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setDone(true)
    } catch {
      setDone(true)
    }
  }

  return (
    <footer className="bg-deep text-white">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-4xl font-black">
              SANA<span className="text-gold">.</span>
            </p>
            <p className="text-mist mt-3 max-w-xs text-sm leading-relaxed">
              {t('footer.tagline')}
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
            title={t('footer.explorer')}
            items={[
              { label: t('nav.destinations'), to: '/destinations' },
              { label: t('nav.offers'), to: '/offres' },
              { label: t('nav.custom'), to: '/voyage-libre' },
              { label: t('nav.concierge'), to: '/concierge' },
            ]}
          />
          <FooterCol
            title={t('footer.agency')}
            items={[
              { label: t('nav.agency'), to: '/agence' },
              { label: t('nav.contact'), to: '/contact' },
              { label: t('acct.myBookings'), to: '/account' },
              { label: t('nav.login'), to: '/login' },
            ]}
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{t('nl.title')}</p>
            {done ? (
              <p className="text-lagoon mt-4 text-sm font-semibold">✓ {t('nl.done')}</p>
            ) : (
              <div className="mt-4 flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('nl.ph')}
                  className="border-white/15 bg-white/[0.05] focus:border-gold/60 w-full min-w-0 rounded-full border px-4 py-2.5 text-sm outline-none transition"
                />
                <button
                  onClick={() => void subscribe()}
                  className="from-gold to-gold-soft shrink-0 rounded-full bg-gradient-to-r px-5 py-2.5 text-xs font-bold text-ink transition-transform hover:scale-[1.03]"
                >
                  {t('nl.cta')}
                </button>
              </div>
            )}
            <ul className="mt-6 space-y-2.5">
              {[t('footer.fl1'), t('footer.fl2')].map((it) => (
                <li key={it} className="text-mist text-sm">
                  {it}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-white/10 mt-14 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-mist text-xs">
            © {new Date().getFullYear()} SANA Travel Agency {t('footer.rights')}
          </p>
          <p className="text-mist text-xs">
            {t('footer.demo')}{' '}
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

function FooterCol({
  title,
  items,
}: {
  title: string
  items: { label: string; to: string }[]
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {items.map((it) => (
          <li key={it.label}>
            <Link to={it.to} className="text-mist hover:text-white text-sm transition-colors">
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
