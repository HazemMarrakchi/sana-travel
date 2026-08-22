import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
import { BookingsService } from './bookings.service'
import { Booking } from './schemas/booking.schema'
import { JwtAuthGuard, Roles } from '../auth/jwt-auth.guard'
import type { RequestUser } from '../auth/auth.types'
import type { BookingStatus } from './schemas/booking.schema'

@Controller('api/bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  /** Public: create a guest quote (no auth needed) */
  @Post()
  create(@Body() data: Parameters<BookingsService['create']>[0]): Promise<Booking> {
    return this.bookingsService.create(data)
  }

  /** Admin: all bookings */
  @Get()
  @Roles('admin')
  findAll(@Query('userId') userId?: string): Promise<Booking[]> {
    return this.bookingsService.findAllForUser(userId ?? '')
  }

  /** Authenticated: my bookings (linked after account creation) */
  @Get('mine')
  @Roles('client', 'admin')
  findMine(@Req() req: Request & { user?: RequestUser }): Promise<Booking[]> {
    return this.bookingsService.findAllForUser(req.user!.sub)
  }

  /** Public: quote lookup by reference */
  @Get(':reference')
  findByReference(@Param('reference') reference: string): Promise<Booking> {
    return this.bookingsService.findByReference(reference)
  }

  /** Admin: change booking status */
  @Patch(':id/status')
  @Roles('admin')
  updateStatus(@Param('id') id: string, @Body('status') status: BookingStatus): Promise<Booking> {
    return this.bookingsService.updateStatus(id, status)
  }
}
