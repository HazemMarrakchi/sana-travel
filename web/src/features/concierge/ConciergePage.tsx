import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useT } from '../../core/i18n'
import { SparkleIcon, SendIcon } from '../../components/ui/Icons'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'

interface Msg {
  role: 'user' | 'assistant'
  content: string
}

export function ConciergePage() {
  const { t } = useT()
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (msgs.length === 0) setMsgs([{ role: 'assistant', content: t('chat.welcome') }])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [msgs, busy])

  const send = async (text: string) => {
    const q = text.trim()
    if (!q || busy) return
    const next: Msg[] = [...msgs, { role: 'user', content: q }]
    setMsgs(next)
    setInput('')
    setBusy(true)
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, history: next.slice(-6, -1) }),
      })
      const data = (await res.json()) as { reply?: string }
      setMsgs([...next, { role: 'assistant', content: data.reply ?? t('chat.error') }])
    } catch {
      setMsgs([...next, { role: 'assistant', content: t('chat.error') }])
    } finally {
      setBusy(false)
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void send(input)
  }

  return (
    <main className="bg-deep flex min-h-screen flex-col px-5 pt-12 pb-10 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <p className="kicker-gold text-center">{t('ct.kicker')}</p>
        <h1 className="font-display mt-3 flex items-center justify-center gap-2 text-center text-4xl font-black text-white lg:text-5xl">
          <SparkleIcon className="text-gold h-8 w-8" /> Sana<span className="text-gold">.</span>
        </h1>
        <p className="text-mist mx-auto mt-3 max-w-md text-center text-sm">
          {t('ct.body')}
        </p>

        {/* suggestions */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {['Cappadoce ?', 'Quels sont vos prix ?', 'Séjour à Bali', 'Parler à un conseiller'].map((s) => (
            <button
              key={s}
              onClick={() => void send(s)}
              disabled={busy}
              className="border-night hover:border-gold/50 hover:text-gold rounded-full border bg-white/[0.03] px-4 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>

        {/* panneau chat */}
        <div className="panel-dark mt-6 flex h-[52vh] min-h-[380px] flex-col overflow-hidden rounded-[2rem] ring-1 ring-white/5">
          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-6">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <p
                  className={
                    m.role === 'user'
                      ? 'bg-gold max-w-[80%] rounded-2xl rounded-br-sm px-4 py-3 text-sm whitespace-pre-wrap text-ink'
                      : 'border-white/8 max-w-[80%] rounded-2xl rounded-bl-sm border bg-white/[0.05] px-4 py-3 text-sm whitespace-pre-wrap text-white/90'
                  }
                >
                  {m.content}
                </p>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <p className="animate-pulse rounded-2xl rounded-bl-sm bg-white/10 px-4 py-3 text-sm text-mist">● ● ●</p>
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="border-night border-t p-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('chat.placeholder')}
                className="inp-dark flex-1 !rounded-full"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="btn-gold shrink-0 px-6 py-3 text-sm disabled:opacity-40"
              >
                <SendIcon className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
