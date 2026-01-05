import { NestFactory } from '@nestjs/core'
import { AppModule } from '@/infra/app.module.js'
import { EnvService } from '@/infra/env/env.service.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const envService = app.get(EnvService)
  const port = envService.get('PORT')

  await app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })
}
bootstrap()
