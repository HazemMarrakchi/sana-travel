import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { NewsletterSubscriber, NewsletterSchema } from './schemas/newsletter.schema'
import { NewsletterService } from './newsletter.service'
import { NewsletterController } from './newsletter.controller'

@Module({
  imports: [MongooseModule.forFeature([{ name: NewsletterSubscriber.name, schema: NewsletterSchema }])],
  providers: [NewsletterService],
  controllers: [NewsletterController],
})
export class NewsletterModule {}
