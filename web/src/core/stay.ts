import type { Offer } from '../data/offers'

export type Board = 'bb' | 'hb' | 'ai'

export const BOARDS: { id: Board; coef: number; key: string }[] = [
  { id: 'bb', coef: 1, key: 'bk.board.bb' },
  { id: 'hb', coef: 1.18, key: 'bk.board.hb' },
  { id: 'ai', coef: 1.35, key: 'bk.board.ai' },
]

export const isHotelOffer = (o: Offer): boolean => o.tags.includes('hôtel')

export const boardCoef = (b: string | null | undefined): number =>
  BOARDS.find((x) => x.id === b)?.coef ?? BOARDS[0].coef

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export function nightsBetween(startISO: string, endISO: string): number {
  if (!DATE_RE.test(startISO) || !DATE_RE.test(endISO)) return 0
  const ms = new Date(`${endISO}T12:00:00`).getTime() - new Date(`${startISO}T12:00:00`).getTime()
  return Math.round(ms / 86400000)
}

export interface Quote {
  nights: number
  perNightEur: number
  coef: number
  totalEur: number
}

/** Devis transparent : prix/nuit/pers dérivé du forfait, durée et formule ajustables. */
export function quoteStay(
  o: Offer,
  opts: { start?: string; end?: string; travelers: number; board?: string },
): Quote {
  const custom = opts.end && opts.start ? nightsBetween(opts.start, opts.end) : 0
  const nights = Math.min(30, Math.max(1, custom || o.nights))
  const perNightEur = o.priceEur / o.nights
  const coef = isHotelOffer(o) ? boardCoef(opts.board) : 1
  return {
    nights,
    perNightEur,
    coef,
    totalEur: Math.round(nights * Math.max(1, opts.travelers) * perNightEur * coef),
  }
}
