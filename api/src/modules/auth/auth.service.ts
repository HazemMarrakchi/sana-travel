import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as bcrypt from 'bcryptjs'
import { User, UserDocument } from '../users/schemas/user.schema'
import type { JwtPayload } from './auth.types'
import type { RegisterDto, LoginDto } from './dto'

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string; user: Partial<User> }> {
    const exists = await this.userModel.findOne({ email: dto.email.toLowerCase() }).exec()
    if (exists) throw new UnauthorizedException('Email déjà utilisé')

    const passwordHash = await bcrypt.hash(dto.password, 10)
    const created = await this.userModel.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      fullName: dto.fullName.trim(),
      phone: dto.phone?.trim() || '',
      role: 'client',
    })
    return this.issueToken(created)
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; user: Partial<User> }> {
    const user = await this.userModel.findOne({ email: dto.email.toLowerCase() }).exec()
    if (!user) throw new UnauthorizedException('Identifiants invalides')
    const ok = await bcrypt.compare(dto.password, user.passwordHash)
    if (!ok) throw new UnauthorizedException('Identifiants invalides')
    return this.issueToken(user)
  }

  async me(payload: JwtPayload): Promise<Partial<User>> {
    const user = await this.userModel.findById(payload.sub).exec()
    if (!user) throw new UnauthorizedException()
    return user.toJSON()
  }

  private issueToken(user: UserDocument): { accessToken: string; user: Partial<User> } {
    const payload: JwtPayload = {
      sub: String(user._id),
      email: user.email,
      role: user.role,
    }
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: user.toJSON(),
    }
  }
}
