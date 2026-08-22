import { SetMetadata } from '@nestjs/common'

export interface JwtPayload {
  sub: string
  email: string
  role: 'client' | 'admin'
}

export interface RequestUser extends JwtPayload {}
