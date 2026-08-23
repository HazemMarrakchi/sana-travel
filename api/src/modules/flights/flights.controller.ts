import { Controller, Get, Query } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FlightsService } from './flights.service'

@Controller('api/flights')
export class FlightsController {
  constructor(
    private readonly service: FlightsService,
    private readonly config: ConfigService,
  ) {}

  /** public — propositions de vols A/R au départ de Tunis */
  @Get('search')
  search(
    @Query('to') to?: string,
    @Query('dep') dep?: string,
    @Query('ret') ret?: string,
    @Query('adults') adults?: string,
  ) {
    const dest = String(to ?? '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3)
    const depDate = String(dep ?? '').slice(0, 10)
    const retDate = /^\d{4}-\d{2}-\d{2}$/.test(String(ret ?? '')) ? String(ret).slice(0, 10) : undefined
    const pax = Math.max(1, Math.min(9, Number(adults) || 1))
    if (dest.length !== 3 || !/^\d{4}-\d{2}-\d{2}$/.test(depDate)) {
      return { source: 'invalid', provider: 'none', offers: [] }
    }
    const hasAmadeus = !!this.config.get<string>('AMADEUS_CLIENT_ID')
    const hasTp = !!this.config.get<string>('TRAVELPAYOUTS_TOKEN')
    const provider = hasAmadeus ? 'amadeus' : hasTp ? 'travelpayouts' : 'none'
    return this.service
      .search({ to: dest, dep: depDate, ret: retDate, adults: pax })
      .then((offers) => ({
        source: offers.length > 0 ? 'live' : 'empty',
        provider,
        offers,
      }))
  }
}
