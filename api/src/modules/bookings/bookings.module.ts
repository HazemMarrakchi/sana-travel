import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { BookingsController } from './bookings.controller'
import { BookingsService } from './bookings.service'
import { Booking, BookingSchema } from './schemas/booking.schema'
import { Offer, OfferSchema } from '../offers/schemas/offer.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Offer.name, schema: OfferSchema },
    ]),
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
