import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { API_BASE } from '../../core/auth'
import { useT } from '../../core/i18n'

export function PaymentReturnPage() {
  const [sp] = useSearchParams()
  const ref = sp.get('ref') ?? ''
  const sessionId = sp.get('session_id') ?? ''
  const [state, setState] = useState<'loading' | 'ok' | 'ko'>('loading')
  const { t } = useT()

  useEffect(() => {
    if (!ref || !sessionId) {
      setState('ko')
      return
    }
    fetch(`${API_BASE}/bookings/pay-confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: ref, sessionId }),
    })
      .then((res) => setState(res.ok ? 'ok' : 'ko'))
      .catch(() => setState('ko'))
  }, [ref, sessionId])

  return (
    <main className="bg-deep grid min-h-screen place-items-center px-6 text-center text-white">
      <div className="max-w-md">
        {state === 'loading' && (
          <>
            <p className="text-gold font-display text-6xl font-black animate-pulse">…</p>
            <p className="text-mist mt-4">{t('pay.redirect')}</p>
          </>
        )}
        {state === 'ok' && (
          <>
            <p className="bg-lagoon/20 text-lagoon mx-auto grid size-20 place-items-center rounded-full text-3xl">✓</p>
            <h1 className="font-display mt-6 text-4xl font-black">{t('pay.success')}</h1>
            <p className="text-mist mt-3 text-sm">{t('pay.sub')}</p>
            {ref && <p className="text-gold mt-2 font-mono text-sm font-bold">{ref}</p>}
          </>
        )}
        {state === 'ko' && (
          <>
            <p className="bg-coral/20 text-coral mx-auto grid size-20 place-items-center rounded-full text-3xl">✕</p>
            <h1 className="font-display mt-6 text-4xl font-black">{t('pay.fail')}</h1>
          </>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/account"
            className="from-gold to-gold-soft shadow-gold/25 rounded-full bg-gradient-to-r px-8 py-3.5 text-sm font-bold text-ink shadow-lg transition-transform hover:scale-[1.02]"
          >
            {t('acct.myBookings')} →
          </Link>
          <Link
            to="/"
            className="border-white/25 text-mist hover:bg-white/10 hover:text-white rounded-full border px-8 py-3.5 text-sm font-semibold transition-colors"
          >
            {t('bk.home')}
          </Link>
        </div>
      </div>
    </main>
  )
}
