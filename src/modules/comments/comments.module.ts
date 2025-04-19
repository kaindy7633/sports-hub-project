import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from './entities/comment.entity';
import { TokenModule } from '../../core/token/token.module';
import { SnowflakeModule } from '../../core/snowflake/snowflake.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    TokenModule,
    SnowflakeModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
