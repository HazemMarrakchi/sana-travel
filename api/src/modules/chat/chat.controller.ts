import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { ChatService, ChatMessage } from './chat.service'
import { JwtAuthGuard, Roles } from '../auth/jwt-auth.guard'

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /** metatype Object → pas de transformation ValidationPipe ; coercition manuelle */
  @Post()
  ask(@Body() body: Record<string, unknown>) {
    const rawHistory = Array.isArray(body.history) ? body.history : []
    const history: ChatMessage[] = rawHistory
      .filter(
        (h): h is ChatMessage =>
          !!h &&
          typeof h === 'object' &&
          (h as ChatMessage).role in { user: 1, assistant: 1 } &&
          typeof (h as ChatMessage).content === 'string',
      )
      .slice(-6)
    return this.chatService.ask(String(body.message ?? '').slice(0, 1000), history)
  }

  /** questions sans réponse du bot → suivi admin */
  @Get('escalations')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  escalations() {
    return this.chatService.escalatedLogs()
  }
}
