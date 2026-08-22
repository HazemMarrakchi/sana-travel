import { ART, FALLBACK_OFFERS, type Offer } from '../data/offers'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'

export async function fetchOffers(): Promise<{ offers: Offer[]; live: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/offers`)
    if (!res.ok) throw new Error(String(res.status))
    const data = (await res.json()) as Offer[]
    if (!Array.isArray(data) || data.length === 0) throw new Error('empty')
    return { offers: data, live: true }
  } catch {
    return { offers: FALLBACK_OFFERS, live: false }
  }
}

export async function fetchOffer(slug: string): Promise<{ offer: Offer | undefined; live: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/offers/${slug}`)
    if (!res.ok) throw new Error(String(res.status))
    return { offer: (await res.json()) as Offer, live: true }
  } catch {
    return { offer: FALLBACK_OFFERS.find((o) => o.slug === slug), live: false }
  }
}

export function artFor(artKey?: string): string {
  return ART[artKey ?? 'aurora'] ?? ART.aurora
}
