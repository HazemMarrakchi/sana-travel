import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { cors: true })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  const config = app.get(ConfigService)
  const port = config.get<number>('PORT') ?? 3001
  await app.listen(port)
  console.log(`✈️  SANA API ready on http://localhost:${port}/api`)
}

void bootstrap()
