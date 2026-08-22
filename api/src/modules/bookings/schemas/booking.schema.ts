import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type BookingStatus = 'draft' | 'quote_sent' | 'confirmed' | 'cancelled'

@Schema({ collection: 'bookings', timestamps: true })
export class Booking {
  /** set when the client creates an account (session 4) */
  @Prop()
  userId?: string

  /** public reference shown to the client, e.g. SNA-7K2Q9F */
  @Prop({ required: true, unique: true })
  reference!: string

  @Prop({ required: true })
  offerId!: string

  @Prop({ required: true })
  offerSlug!: string

  @Prop({ required: true })
  contactName!: string

  @Prop({ required: true })
  contactEmail!: string

  @Prop()
  contactPhone?: string

  @Prop({ required: true, min: 1, max: 12 })
  travelers!: number

  @Prop({ type: Date, required: true })
  startDate!: Date

  @Prop({ enum: ['draft', 'quote_sent', 'confirmed', 'cancelled'], default: 'draft' })
  status!: BookingStatus

  /** snapshot of the price at booking time */
  @Prop({ required: true, min: 0 })
  totalEur!: number
}

export type BookingDocument = HydratedDocument<Booking>
export const BookingSchema = SchemaFactory.createForClass(Booking)

BookingSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const clone = ret as unknown as Record<string, unknown>
    delete clone.__v
    return clone
  },
})
