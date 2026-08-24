import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LANGS, useT } from '../../core/i18n'
import { useAuth } from '../../core/auth'

const LINK_KEYS = [
  { to: '/destinations', key: 'nav.destinations' },
  { to: '/offres', key: 'nav.offers' },
  { to: '/voyage-libre', key: 'nav.custom' },
  { to: '/agence', key: 'nav.agency' },
  { to: '/concierge', key: 'nav.concierge' },
  { to: '/contact', key: 'nav.contact' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const onDarkHero = location.pathname === '/' && !scrolled
  const { t, lang, setLang } = useT()
  const { user, logout } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky inset-x-0 top-0 z-50 transition-all duration-300 ${
        onDarkHero ? 'bg-transparent text-white' : 'bg-ivory text-ink shadow-sm'
      }`}
    >
      <nav className="mx-auto flex h-[72px] w-full max-w-[92rem] items-center justify-between gap-x-6 px-4 sm:px-5 lg:px-8">
        <Link to="/" className="flex shrink-0 items-baseline gap-1 whitespace-nowrap">
          <span className="font-display text-3xl font-black tracking-tight">SANA</span>
          <span className={`text-[10px] font-bold uppercase tracking-[0.25em] ${onDarkHero ? 'text-gold' : 'text-coral'}`}>
            travel
          </span>
        </Link>

        <ul className="hidden min-w-0 items-center gap-x-5 md:flex lg:gap-x-7 xl:gap-x-8">
          {LINK_KEYS.map((l) => (
            <li key={l.to} className="whitespace-nowrap">
              <Link to={l.to} className="text-sm font-semibold transition-opacity hover:opacity-70">
                {t(l.key)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
          <div
            className="flex items-center rounded-full border p-1 text-xs font-bold"
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

          {user ? (
            <>
              <Link
                to={user.role === 'admin' ? '/admin' : '/account'}
                className={`hidden max-w-[11rem] truncate whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors sm:block ${
                  onDarkHero
                    ? 'border-white/30 hover:bg-white/10'
                    : 'border-gold text-ink'
                }`}
              >
                👤 {user.fullName.split(' ')[0]}
              </Link>
              <button
                onClick={logout}
                title={t('auth.logout')}
                className={`hidden h-10 w-10 place-items-center rounded-full border text-base transition-colors sm:grid ${
                  onDarkHero ? 'border-white/30 hover:bg-white/10' : 'border-ink/20 hover:border-ink/50'
                }`}
              >
                ⏻
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className={`hidden whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors sm:block ${
                onDarkHero ? 'border-white/30 hover:bg-white/10' : 'border-ink/20 hover:border-ink/50'
              }`}
            >
              {t('nav.login')}
            </Link>
          )}

          <Link
            to="/booking"
            className="from-gold to-gold-soft hover:shadow-lg hover:shadow-gold/40 hidden whitespace-nowrap rounded-full bg-gradient-to-r px-6 py-2.5 text-sm font-bold text-ink shadow-md transition-shadow md:block"
          >
            {t('nav.cta')}
          </Link>
        </div>
      </nav>

      {/* barre d'actions secondaire mobile — garde le CTA accessible */}
      <div className="flex items-center justify-end gap-3 border-t border-white/10 px-5 pb-3 pt-2 text-mist md:hidden">
        <Link
          to="/booking"
          className="from-gold to-gold-soft rounded-full bg-gradient-to-r px-5 py-2 text-xs font-bold text-ink shadow-md"
        >
          {t('nav.cta')}
        </Link>
      </div>
    </header>
  )
}
