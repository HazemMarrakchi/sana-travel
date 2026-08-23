import { Link } from 'react-router-dom'
import { useT } from '../../core/i18n'

export function AboutPage() {
  const { t } = useT()

  return (
    <main className="bg-deep min-h-screen px-5 pt-32 pb-24 text-white lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="max-w-2xl">
          <p className="text-gold text-xs font-bold uppercase tracking-[0.35em]">{t('ab.kicker')}</p>
          <h1 className="font-display mt-3 text-5xl font-black leading-[1.05]">{t('ab.title')}</h1>
        </header>

        <p className="text-mist mt-8 max-w-3xl text-lg leading-relaxed">{t('ab.story')}</p>

        <section className="mt-14 grid gap-5 md:grid-cols-3">
          {([
            ['🤝', 'ab.v1t', 'ab.v1d'],
            ['💎', 'ab.v2t', 'ab.v2d'],
            ['🛡️', 'ab.v3t', 'ab.v3d'],
          ] as const).map(([icon, title, desc]) => (
            <div key={title} className="bg-night rounded-[1.75rem] border border-white/10 p-7 transition-colors hover:border-gold/40">
              <p className="text-3xl">{icon}</p>
              <h2 className="font-display mt-4 text-xl font-black">{t(title)}</h2>
              <p className="text-mist mt-2 text-sm leading-relaxed">{t(desc)}</p>
            </div>
          ))}
        </section>

        <section className="mt-16">
          <h2 className="font-display mb-6 text-2xl font-black">❓ {t('ab.faq')}</h2>
          <div className="space-y-3">
            {([['ab.q1', 'ab.a1'], ['ab.q2', 'ab.a2'], ['ab.q3', 'ab.a3']] as const).map(([q, a]) => (
              <details key={q} className="bg-night group rounded-2xl border border-white/10 px-6 py-4 open:border-gold/40">
                <summary className="cursor-pointer list-none text-sm font-bold marker:hidden [&::-webkit-details-marker]:hidden">
                  <span className="text-gold mr-3 inline-block transition-transform group-open:rotate-90">▸</span>
                  {t(q)}
                </summary>
                <p className="text-mist mt-3 ps-7 text-sm leading-relaxed">{t(a)}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="from-gold to-gold-soft mt-16 rounded-[2rem] bg-gradient-to-r p-[1px]">
          <div className="bg-night flex flex-wrap items-center justify-between gap-6 rounded-[calc(2rem-1px)] p-10">
            <h3 className="font-display max-w-md text-2xl font-black">{t('vt.title')}</h3>
            <Link to="/voyage-libre" className="from-gold to-gold-soft rounded-full bg-gradient-to-r px-8 py-4 text-sm font-black text-ink shadow-lg transition-transform hover:scale-[1.02]">
              {t('nav.custom')} →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
