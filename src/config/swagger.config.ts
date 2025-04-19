import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';

export const swaggerConfig = () => {
  return new DocumentBuilder()
    .setTitle('SportsHub API')
    .setDescription('SportsHub应用程序的API文档')
    .setVersion('1.0')
    .addTag('users', '用户管理')
    .addTag('teams', '团队管理')
    .addTag('ping', '健康检查')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: '输入JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
};

export const swaggerCustomOptions: SwaggerCustomOptions = {
  swaggerOptions: {
    persistAuthorization: true,
  },
  customSiteTitle: 'SportsHub API文档',
  customCss: '.swagger-ui .topbar { display: none }',
  explorer: true,
};
