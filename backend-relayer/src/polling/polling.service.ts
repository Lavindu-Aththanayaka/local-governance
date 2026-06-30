// backend-relayer/src/polling/polling.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { IpfsService } from '../ipfs/ipfs.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ethers } from 'ethers';

@Injectable()
export class PollingService {
    private readonly logger = new Logger(PollingService.name);

    constructor(
        private readonly ipfsService: IpfsService,
        private readonly blockchainService: BlockchainService,
    ) { }


    async createPoll(payload: {
        title: string;
        description: string;
        pollType: number;
        options: string[];
        deadline: number;
        images?: Express.Multer.File[];
    }) {
        // 1. Upload to IPFS via the new IpfsService method
        const ipfsResult = await this.ipfsService.uploadPoll(payload);

        // 2. Submit to Blockchain
        const tx = await this.blockchainService.createPollOnChain(
            ipfsResult.ipfsUri, // "ipfs://Qm..."
            payload.deadline,
            payload.pollType
        );

        return { success: true, pollCID: ipfsResult.cid, txHash: tx.hash };
    }
}