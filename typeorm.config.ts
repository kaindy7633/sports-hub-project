import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// 加载环境变量
const environment = process.env.NODE_ENV || 'development';
const envFile = `./src/config/.env.${environment}`;

if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
} else {
  dotenv.config();
}

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'sports-hub',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['database/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations_history',
  logging: process.env.NODE_ENV === 'development',
  synchronize: false, // 在生产环境中禁用自动同步
});
