import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'
import { ChatLog, ChatLogSchema } from './schemas/chat-log.schema'
import { Offer, OfferSchema } from '../offers/schemas/offer.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatLog.name, schema: ChatLogSchema },
      { name: Offer.name, schema: OfferSchema },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
