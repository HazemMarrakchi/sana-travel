import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useT } from '../../core/i18n'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'

interface Msg {
  role: 'user' | 'assistant'
  content: string
}

export function ChatWidget() {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [msgs, open])

  const send = async (e: FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || busy) return
    const next: Msg[] = [...msgs, { role: 'user', content: text }]
    setMsgs(next)
    setInput('')
    setBusy(true)
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: next.slice(-6, -1) }),
      })
      const data = (await res.json()) as { reply?: string }
      setMsgs([...next, { role: 'assistant', content: data.reply ?? t('chat.error') }])
    } catch {
      setMsgs([...next, { role: 'assistant', content: t('chat.error') }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => {
            setOpen(true)
            if (msgs.length === 0) setMsgs([{ role: 'assistant', content: t('chat.welcome') }])
          }}
          aria-label={t('chat.open')}
          title={t('chat.open')}
          className="bg-gold fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full text-2xl shadow-xl transition hover:scale-110"
        >
          💬
        </button>
      )}

      {open && (
        <div className="border-night bg-deep fixed bottom-5 right-5 z-50 flex h-[480px] w-[min(92vw,370px)] flex-col overflow-hidden rounded-2xl border shadow-2xl">
          <div className="bg-night flex items-center justify-between px-4 py-3">
            <p className="text-gold font-display font-semibold">✨ {t('chat.title')}</p>
            <button
              onClick={() => setOpen(false)}
              aria-label="×"
              className="text-mist hover:text-ivory rounded-full px-2 text-lg leading-none"
            >
              ×
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <p
                  className={
                    m.role === 'user'
                      ? 'bg-gold max-w-[85%] rounded-2xl rounded-br-sm px-3.5 py-2.5 text-sm whitespace-pre-wrap text-[#0a1628]'
                      : 'bg-night text-ivory max-w-[85%] rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm whitespace-pre-wrap'
                  }
                >
                  {m.content}
                </p>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <p className="bg-night text-mist animate-pulse rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm">
                  ● ● ●
                </p>
              </div>
            )}
          </div>

          <form onSubmit={send} className="border-night border-t p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('chat.placeholder')}
                className="inp flex-1"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="bg-gold rounded-xl px-4 text-sm font-semibold text-[#0a1628] disabled:opacity-40"
              >
                ➤
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
