import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { NewsletterSubscriber, NewsletterDocument } from './schemas/newsletter.schema'

@Injectable()
export class NewsletterService {
  constructor(
    @InjectModel(NewsletterSubscriber.name)
    private readonly model: Model<NewsletterDocument>,
  ) {}

  /** idempotent : réabonner une adresse existante ne casse rien */
  async subscribe(email: string): Promise<{ ok: true }> {
    await this.model.updateOne({ email }, { $setOnInsert: { email } }, { upsert: true }).exec()
    return { ok: true }
  }
}
