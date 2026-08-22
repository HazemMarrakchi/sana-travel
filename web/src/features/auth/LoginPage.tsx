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
    <main className="bg-deep grid min-h-screen place-items-center px-5 pt-24 pb-16">
      <div className="w-full max-w-md">
        <Link to="/" className="font-display block text-center text-4xl font-black text-white">
          SANA<span className="text-gold">.</span>
        </Link>

        <div className="bg-night mt-8 rounded-3xl p-8 shadow-xl">
          {/* tabs */}
          <div className="border-white/10 grid grid-cols-2 gap-1 rounded-full border bg-white/5 p-1">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m)
                  setError('')
                }}
                className={`rounded-full py-2.5 text-sm font-bold transition-colors ${
                  mode === m ? 'bg-gold text-ink' : 'text-mist hover:text-white'
                }`}
              >
                {t(m === 'login' ? 'auth.tabLogin' : 'auth.tabRegister')}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === 'register' && (
              <>
                <AuthField label={t('bk.name')}>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Hazem Marrakchi" className="inp" />
                </AuthField>
                <AuthField label={t('bk.phone')}>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+216 …" className="inp" />
                </AuthField>
              </>
            )}
            <AuthField label={t('bk.email')}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="vous@email.com" className="inp" />
            </AuthField>
            <AuthField label={t('auth.password')}>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" className="inp" />
            </AuthField>

            {error && <p className="text-coral text-sm font-semibold">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="from-gold to-gold-soft w-full rounded-full bg-gradient-to-r py-4 text-sm font-bold text-ink shadow-lg transition-transform hover:scale-[1.01] disabled:opacity-60"
            >
              {busy ? '⏳ …' : t(mode === 'login' ? 'auth.submitLogin' : 'auth.submitRegister')}
            </button>
          </form>
        </div>
      </div>
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
