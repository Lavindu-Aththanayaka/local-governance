import { Module } from '@nestjs/common';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';
import { AiOracleService } from 'src/ai-oracle/ai-oracle.service';
import { IpfsService } from 'src/ipfs/ipfs.service';

@Module({
  imports: [BlockchainModule],
  controllers: [ReportingController],
  providers: [ReportingService, AiOracleService, IpfsService]
})
export class ReportingModule {}
