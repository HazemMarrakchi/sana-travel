import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

@Schema({ collection: 'reviews', timestamps: true })
export class Review {
  @Prop({ required: true, index: true })
  offerSlug!: string

  @Prop({ required: true })
  authorName!: string

  @Prop({ required: true, min: 1, max: 5 })
  rating!: number

  @Prop({ required: true })
  comment!: string
}

export type ReviewDocument = HydratedDocument<Review>
export const ReviewSchema = SchemaFactory.createForClass(Review)

ReviewSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const clone = ret as unknown as Record<string, unknown>
    delete clone.__v
    return clone
  },
})
