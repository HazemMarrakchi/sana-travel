import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from './schemas/user.schema'

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec()
  }

  async create(data: Partial<User>): Promise<User> {
    return this.userModel.create(data)
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().sort({ createdAt: -1 }).exec()
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec()
    if (!user) {
      throw new NotFoundException(`User ${id} not found`)
    }
    return user
  }
}
