import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

@Schema({ collection: 'offers', timestamps: true })
export class Offer {
  @Prop({ required: true, unique: true })
  slug!: string

  @Prop({ required: true })
  title!: string

  @Prop({ required: true })
  city!: string

  @Prop({ required: true })
  country!: string

  @Prop({ required: true })
  summary!: string

  @Prop({ required: true })
  description!: string

  @Prop({ required: true, min: 0 })
  priceEur!: number

  @Prop({ required: true, min: 1 })
  nights!: number

  @Prop({ required: true })
  hotelName!: string

  @Prop({ default: 0, min: 0, max: 5 })
  rating!: number

  @Prop({ type: [String], default: [] })
  images!: string[]

  /** gradient art key for the poster card (until real images) */
  @Prop({ default: 'aurora' })
  artKey!: string

  @Prop({ type: [String], default: [] })
  tags!: string[]

  @Prop({ default: false })
  featured!: boolean

  @Prop({ type: Date, required: true })
  availableFrom!: Date

  @Prop({ type: Date, required: true })
  availableTo!: Date
}

export type OfferDocument = HydratedDocument<Offer>
export const OfferSchema = SchemaFactory.createForClass(Offer)

OfferSchema.set('toJSON', {
  virtuals: false,
  versionKey: false,
})
