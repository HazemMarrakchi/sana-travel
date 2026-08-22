import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JwtAuthGuard, Roles } from './jwt-auth.guard'
import type { RequestUser } from './auth.types'
import { LoginDto, RegisterDto } from './dto'

@Controller('api/auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Get('me')
  @Roles('client', 'admin')
  me(@Req() req: Request & { user?: RequestUser }) {
    return this.authService.me(req.user!)
  }
}
