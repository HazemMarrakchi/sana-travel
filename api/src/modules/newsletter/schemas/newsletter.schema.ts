import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

@Schema({ collection: 'newsletter_subscribers', timestamps: true })
export class NewsletterSubscriber {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string
}

export type NewsletterDocument = HydratedDocument<NewsletterSubscriber>
export const NewsletterSchema = SchemaFactory.createForClass(NewsletterSubscriber)

NewsletterSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const clone = ret as unknown as Record<string, unknown>
    delete clone.__v
    return clone
  },
})
