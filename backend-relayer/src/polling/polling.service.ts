import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { IpfsService } from '../ipfs/ipfs.service';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class PollingService {
    private readonly logger = new Logger(PollingService.name);

    constructor(
        private readonly ipfsService: IpfsService,
        private readonly blockchainService: BlockchainService,
    ) { }

    async createPoll(payload: any) {
        const ipfsResult = await this.ipfsService.uploadPoll(payload);
        const tx = await this.blockchainService.createPollOnChain(
            ipfsResult.cid,
            payload.deadline,
            payload.pollType
        );
        return { success: true, pollCID: ipfsResult.cid, txHash: tx.transactionHash };
    }

    async vote(pollId: number, optionIndex: number, nullifier: string) {
        this.logger.log(`Processing vote relay for poll ${pollId} with nullifier protection.`);
        return await this.blockchainService.castPollVoteOnChain(pollId, optionIndex, nullifier);
    }
}