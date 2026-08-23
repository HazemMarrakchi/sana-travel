import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { OffersService, type OfferFilters } from './offers.service'
import { Offer } from './schemas/offer.schema'
import { JwtAuthGuard, Roles } from '../auth/jwt-auth.guard'

@Controller('api/offers')
@UseGuards(JwtAuthGuard)
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
  @Roles('admin')
  create(@Body() data: Partial<Offer>): Promise<Offer> {
    return this.offersService.create(data)
  }

  @Put(':slug')
  @Roles('admin')
  update(@Param('slug') slug: string, @Body() data: Partial<Offer>): Promise<Offer> {
    return this.offersService.update(slug, data)
  }

  @Delete(':slug')
  @Roles('admin')
  remove(@Param('slug') slug: string): Promise<void> {
    return this.offersService.remove(slug)
  }
}
