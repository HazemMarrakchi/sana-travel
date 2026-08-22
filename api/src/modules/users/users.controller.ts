import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { User } from './schemas/user.schema'
import { JwtAuthGuard, Roles } from '../auth/jwt-auth.guard'
import type { RequestUser } from '../auth/auth.types'

@Controller('api/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** Admin: list all clients */
  @Get()
  @Roles('admin')
  findAll(): Promise<User[]> {
    return this.usersService.findAll()
  }

  /** Authenticated: own profile */
  @Get('me/profile')
  @Roles('client', 'admin')
  me(@Req() req: Request & { user?: RequestUser }) {
    return this.usersService.findById(req.user!.sub)
  }
}
