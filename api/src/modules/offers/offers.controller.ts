import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { OffersService, type OfferFilters } from './offers.service'
import { Offer } from './schemas/offer.schema'

@Controller('api/offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  findAll(@Query() filters: OfferFilters): Promise<Offer[]> {
    return this.offersService.findAll(filters)
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string): Promise<Offer> {
    return this.offersService.findBySlug(slug)
  }

  @Post()
  create(@Body() data: Partial<Offer>): Promise<Offer> {
    return this.offersService.create(data)
  }

  @Put(':slug')
  update(@Param('slug') slug: string, @Body() data: Partial<Offer>): Promise<Offer> {
    return this.offersService.update(slug, data)
  }

  @Delete(':slug')
  remove(@Param('slug') slug: string): Promise<void> {
    return this.offersService.remove(slug)
  }
}
