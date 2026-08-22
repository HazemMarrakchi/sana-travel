import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { OffersModule } from './modules/offers/offers.module'
import { UsersModule } from './modules/users/users.module'
import { BookingsModule } from './modules/bookings/bookings.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
    }),
    OffersModule,
    UsersModule,
    BookingsModule,
  ],
})
export class AppModule {}
