import { Link } from 'react-router-dom'
import { useT } from '../../core/i18n'

export function Footer() {
  const { t } = useT()
  return (
    <footer className="bg-deep text-white">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-4xl font-black">
              SANA<span className="text-gold">.</span>
            </p>
            <p className="text-mist mt-3 max-w-xs text-sm leading-relaxed">
              {t('footer.tagline')}
            </p>
            <div className="mt-6 flex gap-2">
              {['Tunis', 'Paris', 'Dubaï'].map((city) => (
                <span
                  key={city}
                  className="border-white/15 rounded-full border px-3 py-1 text-xs font-semibold text-mist"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>

          <FooterCol
            title={t('footer.explorer')}
            items={[t('footer.fe1'), t('footer.fe2'), t('footer.fe3'), t('footer.fe4')]}
          />
          <FooterCol
            title={t('footer.agency')}
            items={[t('footer.fa1'), t('footer.fa2'), t('footer.fa3'), t('footer.fa4')]}
          />
          <FooterCol
            title={t('footer.legal')}
            items={[t('footer.fl1'), t('footer.fl2'), t('footer.fl3'), t('footer.fl4')]}
          />
        </div>

        <div className="border-white/10 mt-14 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-mist text-xs">
            © {new Date().getFullYear()} SANA Travel Agency {t('footer.rights')}
          </p>
          <p className="text-mist text-xs">
            {t('footer.demo')}{' '}
            <Link
              to="https://hazemmarrakchi.github.io/portfolio/"
              className="text-gold hover:underline"
            >
              Hazem Marrakchi
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {items.map((it) => (
          <li key={it}>
            <a href="#" className="text-mist hover:text-white text-sm transition-colors">
              {it}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
