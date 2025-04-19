import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const createTypeOrmOptions = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('database.host'),
  port: configService.get<number>('database.port'),
  username: configService.get<string>('database.username'),
  password: configService.get<string>('database.password'),
  database: configService.get<string>('database.database'),
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  synchronize: configService.get<string>('app.nodeEnv') !== 'production',
  logging: configService.get<string>('app.nodeEnv') === 'development',
  autoLoadEntities: true,
});
