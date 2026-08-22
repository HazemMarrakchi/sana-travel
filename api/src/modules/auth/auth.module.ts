import { Global, Module } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt-auth.guard'
import { User, UserSchema } from '../users/schemas/user.schema'

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'sana-dev-jwt-secret-2026',
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, Reflector],
  exports: [JwtModule, JwtAuthGuard, Reflector],
})
export class AuthModule {}
