import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ethers } from 'ethers';
import type { Multer } from 'multer';
import { BlockchainService } from '../blockchain/blockchain.service';
// import { IpfsService } from '../ipfs/ipfs.service';
// import { AiOracleService } from '../ai-oracle/ai-oracle.service';

export interface SubmitReportPayload {
  description: string;
  zkpTicketId: string;
  zkpSignature: string;
  citizenPubKey: string;
  signature: string;
}

@Injectable()
export class ReportingService {
  private readonly logger = new Logger(ReportingService.name);

  // NOTE: In production, this MUST come from your .env file
  private readonly GOV_PUBLIC_KEY = process.env.GOV_PUBLIC_KEY || '0xYourGovWalletPublicKeyHere';

  constructor(
    private readonly blockchainService: BlockchainService,
    // private readonly ipfsService: IpfsService,
    // private readonly aiOracleService: AiOracleService,
  ) {}

  // Renamed method to match the controller
  async createReport(payload: SubmitReportPayload, image?: Express.Multer.File) {
    const { description, zkpTicketId, zkpSignature, citizenPubKey, signature } = payload;

    if (!description || !zkpTicketId || !zkpSignature || !citizenPubKey || !signature) {
      throw new BadRequestException('Missing required fields in payload');
    }

    try {
      // STEP 1: Verify Government Ticket
      const recoveredGovAddress = ethers.verifyMessage(
        ethers.getBytes(zkpTicketId),
        zkpSignature
      );

      if (recoveredGovAddress.toLowerCase() !== this.GOV_PUBLIC_KEY.toLowerCase()) {
         this.logger.error(`Gov signature mismatch. Expected: ${this.GOV_PUBLIC_KEY}, Got: ${recoveredGovAddress}`);
         throw new UnauthorizedException('Invalid or forged government ticket');
      }

      // STEP 2: Verify Citizen Payload Signature
      const messageHash = ethers.solidityPackedKeccak256(
        ['string', 'string'],
        [description, zkpTicketId]
      );

      const recoveredCitizenAddress = ethers.verifyMessage(
        ethers.getBytes(messageHash),
        signature
      );

      if (recoveredCitizenAddress.toLowerCase() !== citizenPubKey.toLowerCase()) {
         this.logger.error(`Citizen signature mismatch. Data tampered in transit.`);
         throw new UnauthorizedException('Invalid citizen signature. Payload may be tampered.');
      }

      this.logger.log('✅ Cryptographic verification passed. Payload is secure.');

      // STEP 3: Storage (IPFS)
      const ipfsCID = 'ipfs://QmMockHashForNow12345'; 
      this.logger.log(`IPFS upload mocked: ${ipfsCID}`);

      // STEP 4: AI Moderation
      this.logger.log('AI moderation mocked: content approved');

      // STEP 5: Blockchain Submission
      const txResult = await this.blockchainService.submitReportToChain(
        ipfsCID,
        zkpTicketId
      );

      this.logger.log(`Report successfully processed and sent to chain.`);
      return txResult;

    } catch (error: any) {
      this.logger.error(`Submission pipeline failed: ${error.message}`);
      if (error.status) throw error; 
      throw new BadRequestException('Cryptographic verification or blockchain submission failed');
    }
  }
}