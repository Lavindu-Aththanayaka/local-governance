import { Injectable, InternalServerErrorException, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ethers } from 'ethers';
import { AiOracleService } from '../ai-oracle/ai-oracle.service'; // Adjust path based on your folder structure

@Injectable()
export class PollingService {
    private readonly logger = new Logger(PollingService.name);

    // Loaded from backend-relayer/.env
    // This is the private key for 0x55132Cc173CF552E3732f1e37Ba5a2cFD2686bF2
    private readonly oraclePrivateKey = process.env.ORACLE_PRIVATE_KEY;

    // The local Hardhat deployment parameters
    private readonly verifyingContract = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';
    private readonly chainId = 31337;

    constructor(private readonly aiOracleService: AiOracleService) { }

    async processAndSignPoll(title: string, description: string, ticketId: number) {
        this.logger.log(`Processing new official poll request: ${title}`);

        // 1. Call the newly created, dedicated poll endpoint
        const isSafe = await this.aiOracleService.evaluatePoll(title, description);

        if (!isSafe) {
            this.logger.warn(`Poll rejected by AI moderation: ${title}`);
            // Throwing HttpException ensures the controller returns a clean 400 error to the Next.js frontend
            throw new HttpException('Poll content violates moderation guidelines.', HttpStatus.BAD_REQUEST);
        }

        // 2. Generate Content Hash (Must perfectly match Ethers.js Keccak256 behavior)
        const contentString = JSON.stringify({ title, description });
        const contentHash = ethers.keccak256(ethers.toUtf8Bytes(contentString));

        // 3. Calculate Deadline (7 days from execution)
        const deadline = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);

        // 4. Generate the Cryptographic Signature using the Oracle's Private Key
        const signature = await this.signPollApproval(contentHash, deadline, ticketId);

        return {
            contentHash,
            deadline,
            ticketId,
            signature
        };
    }

    private async signPollApproval(contentHash: string, deadline: number, ticketId: number): Promise<string> {
        if (!this.oraclePrivateKey) {
            this.logger.error('ORACLE_PRIVATE_KEY is missing from environment variables.');
            throw new InternalServerErrorException('Server cryptographic misconfiguration.');
        }

        const wallet = new ethers.Wallet(this.oraclePrivateKey);

        // This DOMAIN_SEPARATOR must identically match OpinionPolling.sol
        const domain = {
            name: 'OpinionPolling',
            version: '1',
            chainId: this.chainId,
            verifyingContract: this.verifyingContract,
        };

        // This TYPEHASH must identically match OpinionPolling.sol
        const types = {
            OfficialPollApproval: [
                { name: 'contentHash', type: 'bytes32' },
                { name: 'deadline', type: 'uint256' },
                { name: 'ticketId', type: 'uint256' },
            ],
        };

        const value = { contentHash, deadline, ticketId };

        try {
            this.logger.log('Generating EIP-712 typed data signature for blockchain authorization.');
            this.logger.log(`Signing with address: ${wallet.address}`);
            return await wallet.signTypedData(domain, types, value);
        } catch (error: any) {
            this.logger.error(`EIP-712 Signing failed: ${error.message}`);
            throw new InternalServerErrorException('Failed to generate oracle signature.');
        }
    }
}