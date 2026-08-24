import { apiAuth } from './auth'

const LS_KEY = 'sana-favs'

function guestFavorites(): string[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

/** Favoris du compte connecté, sinon stockage local invité */
export async function loadFavorites(token: string | null): Promise<string[]> {
  if (!token) return guestFavorites()
  try {
    const res = (await apiAuth('/users/me/favorites', token)) as unknown
    return Array.isArray(res) ? (res as string[]) : []
  } catch {
    return guestFavorites()
  }
}

/** Toggle un favori — API si connecté, localStorage sinon */
export async function toggleFavorite(slug: string, token: string | null): Promise<string[]> {
  if (!token) {
    const cur = guestFavorites()
    const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug]
    localStorage.setItem(LS_KEY, JSON.stringify(next))
    return next
  }
  const res = (await apiAuth('/users/me/favorites', token, { method: 'PUT', body: { slug } })) as unknown
  return Array.isArray(res) ? (res as string[]) : []
}
