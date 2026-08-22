import { useState, type FormEvent } from 'react'
import { useT } from '../../core/i18n'

export function ContactPage() {
  const { t } = useT()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`)
    window.location.href = `mailto:contact@sanatravel.tn?subject=${encodeURIComponent('Demande SANA Travel — ' + name)}&body=${body}`
  }

  const cards = [
    { icon: '📍', label: t('ct.address'), value: 'Avenue Habib Bourguiba, Tunis 1001' },
    { icon: '📞', label: t('ct.phone'), value: '+216 71 000 000' },
    { icon: '✉️', label: 'Email', value: 'contact@sanatravel.tn' },
    { icon: '🕘', label: t('ct.hours'), value: 'Lun – Sam · 9h – 18h' },
  ]

  return (
    <main className="bg-deep min-h-screen px-5 pt-12 pb-24 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-gold text-center text-xs font-bold tracking-[0.35em] uppercase">{t('nav.contact')}</p>
        <h1 className="font-display mt-3 text-center text-4xl font-black text-white lg:text-5xl">
          {t('ct.title')}
        </h1>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <div
              key={c.label}
              className="border-night hover:border-gold/40 rounded-3xl border bg-white/[0.03] p-6 text-center transition-colors"
            >
              <p className="text-3xl">{c.icon}</p>
              <p className="text-mist mt-3 text-[10px] font-bold uppercase tracking-[0.25em]">{c.label}</p>
              <p className="mt-1.5 text-sm font-semibold break-words text-white">{c.value}</p>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="border-night from-night to-deep mx-auto mt-12 max-w-xl space-y-5 rounded-[2rem] border bg-gradient-to-b p-8 shadow-2xl ring-1 ring-white/5">
          <label className="block">
            <span className="text-mist block text-xs font-bold uppercase tracking-widest">{t('bk.name')}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="inp mt-2" placeholder="Hazem Marrakchi" />
          </label>
          <label className="block">
            <span className="text-mist block text-xs font-bold uppercase tracking-widest">{t('bk.email')}</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="inp mt-2" placeholder="vous@email.com" />
          </label>
          <label className="block">
            <span className="text-mist block text-xs font-bold uppercase tracking-widest">Message</span>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} className="inp mt-2 resize-none" placeholder={t('ct.placeholder')} />
          </label>
          <button
            type="submit"
            className="from-gold to-gold-soft hover:shadow-gold/30 w-full rounded-full bg-gradient-to-r py-4 text-sm font-bold text-[#0a1628] shadow-lg transition-all hover:scale-[1.01] hover:shadow-xl"
          >
            ✉️ {t('ct.send')}
          </button>
        </form>
      </div>
    </main>
  )
}
