import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../core/auth'
import { useT } from '../../core/i18n'

export function LoginPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const { t } = useT()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const user =
        mode === 'login'
          ? await login(email, password)
          : await register(fullName, email, password, phone || undefined)
      navigate(user.role === 'admin' ? '/admin' : '/account')
    } catch (err) {
      const msg = (err as Error).message
      setError(msg === 'Email déjà utilisé' ? t('auth.taken') : msg === 'Identifiants invalides' ? t('auth.badCreds') : t('auth.fail'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="bg-deep min-h-screen lg:grid lg:grid-cols-[1.1fr_1fr]">
      {/* ── Panneau immersif (desktop) ─────────────── */}
      <section className="from-deep via-night relative hidden overflow-hidden bg-gradient-to-br to-[#0d1e38] lg:flex lg:flex-col lg:justify-between">
        <div className="bg-gold/15 pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-coral/10 pointer-events-none absolute right-0 bottom-0 h-80 w-80 rounded-full blur-3xl" />

        <svg viewBox="0 0 600 300" className="pointer-events-none absolute inset-x-0 top-1/2 w-full opacity-[0.14]" fill="none">
          <path d="M-20 260 C 150 200, 260 60, 620 20" stroke="#e2b04a" strokeWidth="1.5" strokeDasharray="6 8" />
          <circle cx="470" cy="52" r="5" fill="#e2b04a" />
          <circle cx="180" cy="212" r="3" fill="#2ec4b6" />
        </svg>

        <div className="relative p-12">
          <Link to="/" className="font-display text-4xl font-black text-white">
            SANA<span className="text-gold">.</span>
          </Link>
        </div>

        <div className="relative px-12 pb-14">
          <p className="font-display text-mist text-sm font-semibold tracking-[0.35em] uppercase">Voyages sur mesure</p>
          <h2 className="font-display mt-4 text-6xl leading-[1.02] font-black text-white">
            Le monde<br />
            vous attend<span className="text-gold">.</span>
          </h2>
          <p className="font-display text-gold-soft/70 mt-8 space-y-1 text-lg italic">
            Marrakech · Istanbul · Santorin<br />
            Bali · Maldives · Cappadoce
          </p>
        </div>
      </section>

      {/* ── Formulaire ─────────────────────────────── */}
      <section className="flex flex-col justify-center px-6 py-16 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="font-display block text-center text-4xl font-black text-white lg:hidden">
            SANA<span className="text-gold">.</span>
          </Link>

          <div className="panel-dark mt-10 rounded-[2rem] p-8 sm:p-10 lg:mt-8">
            {/* tabs soulignés */}
            <div className="flex gap-8 border-b border-white/10">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m)
                    setError('')
                  }}
                  className={`relative pb-4 text-sm font-bold transition-colors ${
                    mode === m ? 'text-white' : 'text-mist hover:text-white/70'
                  }`}
                >
                  {t(m === 'login' ? 'auth.tabLogin' : 'auth.tabRegister')}
                  {mode === m && <span className="bg-gold absolute inset-x-0 -bottom-px h-0.5 rounded-full shadow-[0_0_12px_rgba(226,176,74,0.6)]" />}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="mt-8 space-y-5">
              {mode === 'register' && (
                <>
                  <AuthField label={t('bk.name')}>
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Hazem Marrakchi" className="inp-dark w-full" />
                  </AuthField>
                  <AuthField label={t('bk.phone')}>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+216 …" className="inp-dark w-full" />
                  </AuthField>
                </>
              )}
              <AuthField label={t('bk.email')}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="vous@email.com" className="inp-dark w-full" autoComplete="email" />
              </AuthField>
              <AuthField label={t('auth.password')}>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" className="inp-dark w-full" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
              </AuthField>

              {error && <p className="text-coral text-sm font-semibold">{error}</p>}

              <button
                type="submit"
                disabled={busy}
                className="btn-gold w-full py-4 text-sm disabled:opacity-60"
              >
                {busy
                  ? <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
                  : t(mode === 'login' ? 'auth.submitLogin' : 'auth.submitRegister')}
              </button>

              <p className="text-mist pt-2 text-center text-xs">
                {mode === 'login' ? t('auth.tabRegister') + ' →' : ''}{' '}
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}

function AuthField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-mist block text-xs font-bold uppercase tracking-widest">{label}</span>
      <span className="mt-2 block">{children}</span>
    </label>
  )
}
