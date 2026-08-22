import { Body, Controller, Get, Post } from '@nestjs/common'
import { UsersService } from './users.service'
import { User } from './schemas/user.schema'

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** Admin: list all clients (guard added in session 3 with JWT) */
  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll()
  }

  @Post()
  create(@Body() data: Partial<User>): Promise<User> {
    return this.usersService.create(data)
  }
}
