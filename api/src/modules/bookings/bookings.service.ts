import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Booking, BookingDocument } from './schemas/booking.schema'

@Injectable()
export class BookingsService {
  constructor(@InjectModel(Booking.name) private bookingModel: Model<BookingDocument>) {}

  async findAllForUser(userId: string): Promise<Booking[]> {
    return this.bookingModel.find({ userId }).sort({ createdAt: -1 }).exec()
  }

  async create(data: Partial<Booking>): Promise<Booking> {
    return this.bookingModel.create(data)
  }

  async updateStatus(id: string, status: Booking['status']): Promise<Booking> {
    const booking = await this.bookingModel.findByIdAndUpdate(id, { status }, { new: true }).exec()
    if (!booking) throw new NotFoundException(`Booking ${id} not found`)
    return booking
  }
}
