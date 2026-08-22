import { CanActivate, ExecutionContext, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import type { Request } from 'express'
import type { JwtPayload } from './auth.types'

export const ROLES_KEY = 'roles'
export const Roles = (...roles: Array<'client' | 'admin'>) => SetMetadata(ROLES_KEY, roles)

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Array<'client' | 'admin'> | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    )
    // routes without @Roles are public
    if (!requiredRoles || requiredRoles.length === 0) return true

    const request = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>()
    const header = request.headers.authorization ?? ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : ''
    if (!token) throw new UnauthorizedException('Token manquant')

    let payload: JwtPayload
    try {
      payload = this.jwtService.verify<JwtPayload>(token)
    } catch {
      throw new UnauthorizedException('Token invalide ou expiré')
    }

    if (!requiredRoles.includes(payload.role)) {
      throw new UnauthorizedException('Accès refusé')
    }
    request.user = payload
    return true
  }
}
