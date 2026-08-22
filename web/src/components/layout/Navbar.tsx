import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LANGS, useT } from '../../core/i18n'

const LINK_KEYS = [
  { to: '/destinations', key: 'nav.destinations' },
  { to: '/offres', key: 'nav.offers' },
  { to: '/concierge', key: 'nav.concierge' },
  { to: '/contact', key: 'nav.contact' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const onDarkHero = location.pathname === '/' && !scrolled
  const { t, lang, setLang } = useT()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        onDarkHero ? 'bg-transparent text-white' : 'bg-ivory/85 text-ink shadow-sm backdrop-blur-md'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link to="/" className="flex items-baseline gap-1">
          <span className="font-display text-3xl font-black tracking-tight">SANA</span>
          <span className={`text-[10px] font-bold uppercase tracking-[0.25em] ${onDarkHero ? 'text-gold' : 'text-coral'}`}>
            travel
          </span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {LINK_KEYS.map((l) => (
            <li key={l.to}>
              <Link to={l.to} className="text-sm font-semibold transition-opacity hover:opacity-70">
                {t(l.key)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-full border p-1 text-xs font-bold"
            style={{ borderColor: onDarkHero ? 'rgba(255,255,255,.25)' : 'rgba(10,22,40,.15)' }}
          >
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`rounded-full px-2.5 py-1 transition-colors ${
                  lang === l.code
                    ? onDarkHero ? 'bg-gold text-ink' : 'bg-ink text-gold'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <Link
            to="/login"
            className={`hidden rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors sm:block ${
              onDarkHero
                ? 'border-white/30 hover:bg-white/10'
                : 'border-ink/20 hover:border-ink/50'
            }`}
          >
            {t('nav.login')}
          </Link>
          <Link
            to="/booking"
            className="from-gold to-gold-soft hover:shadow-lg hover:shadow-gold/40 rounded-full bg-gradient-to-r px-5 py-2.5 text-sm font-bold text-ink shadow-md transition-shadow"
          >
            {t('nav.cta')}
          </Link>
        </div>
      </nav>
    </header>
  )
}
