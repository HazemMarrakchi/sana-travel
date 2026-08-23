import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface FlightProp {
  airline: string
  priceEur: number
  stops: number
}

const AIRLINE_NAMES: Record<string, string> = {
  TU: 'Tunisair',
  BJ: 'Nouvelair',
  TK: 'Turkish Airlines',
  EK: 'Emirates',
  QR: 'Qatar Airways',
  AF: 'Air France',
  MS: 'EgyptAir',
  AT: 'Royal Air Maroc',
  PC: 'Pegasus',
  FZ: 'flydubai',
  TO: 'Transavia',
  LH: 'Lufthansa',
  U2: 'easyJet',
}

const TEST_HOST = 'https://test.api.amadeus.com'

interface CachedOffers {
  exp: number
  data: FlightProp[]
}

/** recherche de vols via Amadeus Self-Service (tier gratuit).
 *  Sans identifiants configurés, renvoie une liste vide — le front retombe sur son catalogue indicatif. */
@Injectable()
export class FlightsService {
  private token = ''
  private tokenExp = 0
  private readonly cache = new Map<string, CachedOffers>()

  constructor(private readonly config: ConfigService) {}

  private creds(): { id?: string; secret?: string } {
    return {
      id: this.config.get<string>('AMADEUS_CLIENT_ID'),
      secret: this.config.get<string>('AMADEUS_CLIENT_SECRET'),
    }
  }

  private async getToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExp) return this.token
    const { id, secret } = this.creds()
    if (!id || !secret) throw new Error('Amadeus non configuré')
    const res = await fetch(`${TEST_HOST}/v1/security/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: id,
        client_secret: secret,
      }),
    })
    if (!res.ok) throw new Error(`Amadeus token ${res.status}`)
    const d = (await res.json()) as { access_token: string; expires_in: number }
    this.token = d.access_token
    this.tokenExp = Date.now() + (d.expires_in - 60) * 1000
    return this.token
  }

  async search(q: { to: string; dep: string; ret?: string; adults: number }): Promise<FlightProp[]> {
    const { id, secret } = this.creds()
    if (!id || !secret) return []

    const key = `${q.to}|${q.dep}|${q.ret ?? ''}|${q.adults}`
    const hit = this.cache.get(key)
    if (hit && hit.exp > Date.now()) return hit.data

    try {
      const token = await this.getToken()
      const params = new URLSearchParams({
        originLocationCode: 'TUN',
        destinationLocationCode: q.to,
        departureDate: q.dep,
        adults: String(q.adults),
        currencyCode: 'EUR',
        max: '6',
      })
      if (q.ret) params.set('returnDate', q.ret)

      const res = await fetch(`${TEST_HOST}/v2/shopping/flight-offers?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`Amadéus ${res.status}`)
      const d = (await res.json()) as {
        data?: {
          price?: { grandTotal?: string }
          validatingAirlineCodes?: string[]
          itineraries?: { segments?: unknown[] }[]
        }[]
      }

      const seen = new Set<string>()
      const offers: FlightProp[] = []
      for (const o of d.data ?? []) {
        const total = Number(o.price?.grandTotal ?? NaN)
        if (!Number.isFinite(total)) continue
        const code = o.validatingAirlineCodes?.[0] ?? '—'
        if (seen.has(code)) continue
        seen.add(code)
        offers.push({
          airline: AIRLINE_NAMES[code] ?? code,
          priceEur: Math.round(total / q.adults),
          stops: Math.max(0, (o.itineraries?.[0]?.segments?.length ?? 1) - 1),
        })
      }
      offers.sort((a, b) => a.priceEur - b.priceEur)

      // cache 15 min — économise le quota gratuit
      this.cache.set(key, { exp: Date.now() + 15 * 60_000, data: offers })
      return offers
    } catch {
      return [] // quota épuisé / indispo → fallback front
    }
  }
}
