import { useLocation } from 'react-router-dom'
import { useT } from '../../core/i18n'
import { legalContent, LEGAL_META, type LegalType } from '../../data/legal'

const PATH_TO_TYPE: Record<string, LegalType> = {
  '/mentions-legales': 'mentions',
  '/cgv': 'cgv',
  '/confidentialite': 'privacy',
}

export function LegalPage() {
  const { pathname } = useLocation()
  const { t, lang } = useT()
  const key = PATH_TO_TYPE[pathname] ?? 'mentions'
  const blocks = legalContent(key, lang)
  const title = LEGAL_META[key].title[lang]

  return (
    <main className="bg-deep min-h-screen px-5 py-16 text-white lg:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-gold text-xs font-bold uppercase tracking-[0.3em]">SANA Travel</p>
        <h1 className="font-display mt-3 text-4xl font-black lg:text-5xl">{title}</h1>
        <div className="mt-10 space-y-8">
          {blocks.map((b, i) => (
            <section key={i}>
              <h2 className="text-lg font-bold text-gold-soft">{b.h}</h2>
              <p className="text-mist mt-2 text-sm leading-relaxed">{b.p}</p>
            </section>
          ))}
        </div>
        <p className="text-mist mt-12 border-t border-white/10 pt-6 text-xs">
          © {new Date().getFullYear()} SANA Travel Agency — {t('footer.rights')}
        </p>
      </div>
    </main>
  )
}
