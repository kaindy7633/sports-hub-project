// src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserAuth } from './entities/user-auth.entity';
import { Role } from '../roles/entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { SnowflakeModule } from '../../core/snowflake/snowflake.module';
import { TokenModule } from '../../core/token/token.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserAuth, Role, UserRole]),
    SnowflakeModule,
    TokenModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
