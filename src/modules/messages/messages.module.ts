import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Message } from './entities/message.entity';
import { TokenModule } from '../../core/token/token.module';
import { SnowflakeModule } from '../../core/snowflake/snowflake.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    TokenModule,
    SnowflakeModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
