import { Body, Controller, Post } from '@nestjs/common'
import { NewsletterService } from './newsletter.service'

@Controller('api/newsletter')
export class NewsletterController {
  constructor(private readonly service: NewsletterService) {}

  /** public — inscription simple, coercition manuelle (pas de ValidationPipe) */
  @Post()
  subscribe(@Body() body: Record<string, unknown>) {
    const email = String(body?.email ?? '')
      .trim()
      .toLowerCase()
      .slice(0, 160)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return { ok: false }
    }
    return this.service.subscribe(email)
  }
}
