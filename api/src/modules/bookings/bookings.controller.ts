import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { BookingsService, type CreateBookingInput } from './bookings.service'
import { Booking } from './schemas/booking.schema'
import type { BookingStatus } from './schemas/booking.schema'

@Controller('api/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  /** Admin: all bookings (guard in session 4) */
  @Get()
  findAll(@Query('userId') userId?: string): Promise<Booking[]> {
    return this.bookingsService.findAllForUser(userId ?? '')
  }

  @Post()
  create(@Body() data: CreateBookingInput): Promise<Booking> {
    return this.bookingsService.create(data)
  }

  @Get(':reference')
  findByReference(@Param('reference') reference: string): Promise<Booking> {
    return this.bookingsService.findByReference(reference)
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: BookingStatus): Promise<Booking> {
    return this.bookingsService.updateStatus(id, status)
  }
}
