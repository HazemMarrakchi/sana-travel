import { Link } from 'react-router-dom'
import { useT } from '../../core/i18n'
import { HandshakeIcon, GemIcon, ShieldIcon, HelpIcon } from '../../components/ui/Icons'
import { PosterImage } from '../../components/ui/PosterImage'

export function AboutPage() {
  const { t } = useT()

  return (
    <main className="bg-deep min-h-screen text-white">
      {/* en-tête immersif éditorial */}
      <div className="relative overflow-hidden bg-deep">
        <div className="absolute inset-0">
          <PosterImage src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1920&q=80" alt="" />
          <div className="from-deep absolute inset-0 bg-gradient-to-t via-deep/50 to-deep/70" />
          <div className="texture-dark pointer-events-none absolute inset-0 opacity-40" />
        </div>
        <div className="relative mx-auto max-w-5xl px-5 pt-32 pb-14 lg:px-8">
          <header className="max-w-2xl">
            <p className="kicker-gold">{t('ab.kicker')}</p>
            <h1 className="font-display mt-4 text-5xl leading-[0.98] font-medium sm:text-6xl">{t('ab.title')}</h1>
          </header>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
        <p className="text-mist max-w-3xl text-lg leading-relaxed">{t('ab.story')}</p>

        <section className="mt-14 grid gap-5 md:grid-cols-3">
          {([
            ['ab.v1t', 'ab.v1d', <HandshakeIcon key="h" className="h-8 w-8" />],
            ['ab.v2t', 'ab.v2d', <GemIcon key="g" className="h-8 w-8" />],
            ['ab.v3t', 'ab.v3d', <ShieldIcon key="s" className="h-8 w-8" />],
          ] as const).map(([title, desc, icon]) => (
            <div key={title} className="panel-dark transition-colors hover:border-gold/40">
              <p className="text-gold">{icon}</p>
              <h2 className="font-display mt-4 text-xl font-black">{t(title)}</h2>
              <p className="text-mist mt-2 text-sm leading-relaxed">{t(desc)}</p>
            </div>
          ))}
        </section>

        <section className="mt-16">
          <h2 className="font-display mb-6 flex items-center gap-2 text-2xl font-black"><HelpIcon className="text-gold h-6 w-6" /> {t('ab.faq')}</h2>
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
            <Link to="/voyage-libre" className="btn-gold px-8 py-4 text-sm font-black">
              {t('nav.custom')} →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
