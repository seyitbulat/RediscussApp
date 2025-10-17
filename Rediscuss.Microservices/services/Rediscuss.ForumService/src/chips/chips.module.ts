import { Module } from '@nestjs/common';
import { ChipsService } from './chips.service';
import { ChipsController } from './chips.controller';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [ChipsController],
  providers: [
    ChipsService

  ],
  exports: [ChipsService]

})
export class ChipsModule { }
