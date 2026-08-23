import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

@Schema({ collection: 'chat_logs', timestamps: true })
export class ChatLog {
  @Prop({ required: true })
  question!: string

  @Prop({ required: true })
  answer!: string

  /** true when the bot could not answer → human follow-up needed */
  @Prop({ default: false })
  escalated!: boolean

  @Prop({ default: 'rules' })
  engine!: 'groq' | 'rules'

  /** question escalée traitée par l'équipe */
  @Prop({ default: false })
  handled!: boolean
}

export type ChatLogDocument = HydratedDocument<ChatLog>
export const ChatLogSchema = SchemaFactory.createForClass(ChatLog)

ChatLogSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    const clone = ret as unknown as Record<string, unknown>
    delete clone.__v
    return clone
  },
})
