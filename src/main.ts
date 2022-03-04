import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import { ConfigService } from '@nestjs/config';
import { PORT } from './shared/constants';
import { Logger } from '@nestjs/common';

const bootstrap = async () => {
  try{
    const app = await NestFactory.create(AppModule);
    const config = new DocumentBuilder()
        .setTitle('Docs')
        .setDescription('The car-sharing API')
        .setVersion('1.0')
        .build();

    const configService = app.get(ConfigService);
    const logger = app.get(Logger);
    const port = +configService.get<number>(PORT) || 3000;
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    await app.listen(port).then(() => logger.log(`Application running on port = ${port}`))
  } catch (e) {
    console.log(e);
  }
}

bootstrap()
