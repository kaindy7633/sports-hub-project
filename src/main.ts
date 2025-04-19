import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig, swaggerCustomOptions } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const apiPrefix = configService.get<string>('app.apiPrefix');
  const apiVersion = configService.get<string>('app.apiVersion');

  app.setGlobalPrefix(`${apiPrefix}/${apiVersion}`);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // 配置Swagger文档
  const config = swaggerConfig();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(
    `${apiPrefix}/${apiVersion}/docs`,
    app,
    document,
    swaggerCustomOptions,
  );

  const port = configService.get<number>('app.port') || 9000;
  await app.listen(port);
  console.log(`Application running on port ${port}`);
  console.log(
    `Swagger documentation is available at http://localhost:${port}/${apiPrefix}/${apiVersion}/docs`,
  );
}
bootstrap();
