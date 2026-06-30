import { Module } from '@nestjs/common';
import { PollingController } from './polling.controller';
import { PollingService } from './polling.service';
import { AiOracleModule } from '../ai-oracle/ai-oracle.module'; // Import to access AiOracleService

@Module({
  imports: [AiOracleModule],
  controllers: [PollingController],
  providers: [PollingService],
})
export class PollingModule { }