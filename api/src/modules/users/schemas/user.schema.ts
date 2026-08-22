import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type UserRole = 'client' | 'admin'

@Schema({ collection: 'users', timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string

  @Prop({ required: true })
  passwordHash!: string

  @Prop({ required: true })
  fullName!: string

  @Prop({ enum: ['client', 'admin'], default: 'client' })
  role!: UserRole

  @Prop({ default: '' })
  phone!: string
}

export type UserDocument = HydratedDocument<User>
export const UserSchema = SchemaFactory.createForClass(User)

UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const clone = ret as unknown as Record<string, unknown>
    delete clone.passwordHash
    delete clone.__v
    return ret
  },
})
