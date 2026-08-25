import type { Lang } from './i18n'

/** Taux de référence EUR → TND (démo). À brancher sur une API de taux plus tard. */
export const EUR_TND = 3.4

const round10 = (n: number) => Math.round(n / 10) * 10

/** Prix affiché en dinars tunisiens, chiffres latins (usage courant en Tunisie). */
export function formatPrice(eur: number, lang: Lang): string {
  const v = round10(eur * EUR_TND)
  const s = new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'fr-FR').format(v)
  return `${s} DT`
}

/** Conversion exacte (sans arrondi à la dizaine) : prix/nuit × nuits × pers == total. */
export function formatPriceExact(eur: number, lang: Lang): string {
  const v = Math.round(eur * EUR_TND)
  const s = new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'fr-FR').format(v)
  return `${s} DT`
}
