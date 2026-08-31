import { useState, type FormEvent } from 'react'
import { useT } from '../../core/i18n'
import { MapPinIcon, PhoneIcon, MailIcon, ClockIcon, SendIcon } from '../../components/ui/Icons'
import { PosterImage } from '../../components/ui/PosterImage'

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
    { icon: <MapPinIcon key="a" className="h-7 w-7" />, label: t('ct.address'), value: 'Avenue Habib Bourguiba, Tunis 1001' },
    { icon: <PhoneIcon key="p" className="h-7 w-7" />, label: t('ct.phone'), value: '+216 71 000 000' },
    { icon: <MailIcon key="m" className="h-7 w-7" />, label: 'Email', value: 'contact@sanatravel.tn' },
    { icon: <ClockIcon key="c" className="h-7 w-7" />, label: t('ct.hours'), value: 'Lun – Sam · 9h – 18h' },
  ]

  return (
    <main className="bg-deep min-h-screen">
      {/* en-tête immersif éditorial */}
      <div className="relative overflow-hidden bg-deep">
        <div className="absolute inset-0">
          <PosterImage src="https://images.unsplash.com/photo-1502920514313-52581002a659?auto=format&fit=crop&w=1920&q=80" alt="" />
          <div className="from-deep absolute inset-0 bg-gradient-to-t via-deep/50 to-deep/70" />
          <div className="texture-dark pointer-events-none absolute inset-0 opacity-40" />
        </div>
        <div className="relative mx-auto max-w-5xl px-5 pt-28 pb-14 lg:px-8">
          <p className="kicker-gold text-center">{t('nav.contact')}</p>
          <h1 className="font-display mt-4 text-center text-5xl leading-[0.98] font-medium text-white sm:text-6xl">
            {t('ct.title')}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
        <div className="mt-0 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <div
              key={c.label}
              className="card-dark hover:border-gold/40 rounded-3xl border p-6 text-center transition-colors"
            >
              <p className="text-gold inline-flex rounded-2xl bg-gold/10 p-3">{c.icon}</p>
              <p className="text-mist mt-3 text-[10px] font-bold uppercase tracking-[0.25em]">{c.label}</p>
              <p className="mt-1.5 text-sm font-semibold break-words text-white">{c.value}</p>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="panel-dark mx-auto mt-12 max-w-xl space-y-5 rounded-[2rem] p-8 ring-1 ring-white/5">
          <label className="block">
            <span className="text-mist block text-xs font-bold uppercase tracking-widest">{t('bk.name')}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="inp-dark mt-2 w-full" placeholder="Hazem Marrakchi" />
          </label>
          <label className="block">
            <span className="text-mist block text-xs font-bold uppercase tracking-widest">{t('bk.email')}</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="inp-dark mt-2 w-full" placeholder="vous@email.com" />
          </label>
          <label className="block">
            <span className="text-mist block text-xs font-bold uppercase tracking-widest">Message</span>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} className="inp-dark mt-2 w-full resize-none" placeholder={t('ct.placeholder')} />
          </label>
          <button
            type="submit"
            className="btn-gold mt-4 w-full py-4 text-sm"
          >
            <SendIcon className="h-4 w-4" /> {t('ct.send')}
          </button>
        </form>
      </div>
    </main>
  )
}
