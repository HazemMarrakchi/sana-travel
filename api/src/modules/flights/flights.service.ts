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
  FR: 'Ryanair',
  W6: 'Wizz Air',
  V7: 'Volotea',
  AH: 'Air Algérie',
  LN: 'Libyan Airlines',
  RJ: 'Royal Jordanian',
  SV: 'Saudia',
  KU: 'Kuwait Airways',
  GF: 'Gulf Air',
  ET: 'Ethiopian',
  OS: 'Austrian',
  SN: 'Brussels Airlines',
}

const TEST_HOST = 'https://test.api.amadeus.com'
const TP_HOST = 'https://api.travelpayouts.com'

interface CachedOffers {
  exp: number
  data: FlightProp[]
}

/** recherche de vols — Amadeus Self-Service OU Travelpayouts (prix réels des dernières
 *  48 h, inscription par simple email). Sans identifiants, renvoie [] : le front
 *  retombe sur son catalogue indicatif. */
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
    const tpToken = this.config.get<string>('TRAVELPAYOUTS_TOKEN')
    if (id && secret) return this.searchAmadeus(q)
    if (tpToken) return this.searchTravelpayouts(q, tpToken)
    return []
  }

  /** Travelpayouts / Aviasales v3 — prix réels trouvés ces dernières 48 h.
   *  Stratégie : dates exactes, puis repli sur le mois entier si le cache est vide. */
  private async searchTravelpayouts(
    q: { to: string; dep: string; ret?: string; adults: number },
    token: string,
  ): Promise<FlightProp[]> {
    const exact = await this.tpAttempt(q, token, q.dep, q.ret)
    if (exact.length > 0) return exact
    // repli : mois de départ sans date de retour précise (cache plus dense)
    return this.tpAttempt(q, token, q.dep.slice(0, 7), undefined)
  }

  private async tpAttempt(
    q: { to: string; dep: string; ret?: string; adults: number },
    token: string,
    departureAt: string,
    returnAt?: string,
  ): Promise<FlightProp[]> {
    const key = `tp|${q.to}|${departureAt}|${returnAt ?? ''}|${q.adults}`
    const hit = this.cache.get(key)
    if (hit && hit.exp > Date.now()) return hit.data

    try {
      const params = new URLSearchParams({
        origin: 'TUN',
        destination: q.to,
        departure_at: departureAt,
        sorting: 'price',
        direct: 'false',
        currency: 'eur',
        limit: '6',
        one_way: returnAt ? 'false' : 'true',
      })
      if (returnAt) params.set('return_at', returnAt)

      const res = await fetch(`${TP_HOST}/aviasales/v3/prices_for_dates?${params}`, {
        headers: { 'X-Access-Token': token },
      })
      if (!res.ok) throw new Error(`TP ${res.status}`)
      const d = (await res.json()) as {
        data?: { airline?: string; price?: number; transfers?: number }[]
      }

      const seen = new Set<string>()
      const offers: FlightProp[] = []
      for (const o of d.data ?? []) {
        const price = Number(o.price)
        if (!o.airline || !Number.isFinite(price)) continue
        if (seen.has(o.airline)) continue
        seen.add(o.airline)
        offers.push({
          airline: AIRLINE_NAMES[o.airline] ?? o.airline,
          // prix Aviasales = 1 adulte ; on affiche par personne
          priceEur: Math.round(price),
          stops: o.transfers ?? 0,
        })
      }
      offers.sort((a, b) => a.priceEur - b.priceEur)

      this.cache.set(key, { exp: Date.now() + 15 * 60_000, data: offers })
      return offers
    } catch {
      return []
    }
  }

  private async searchAmadeus(q: { to: string; dep: string; ret?: string; adults: number }): Promise<FlightProp[]> {
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
