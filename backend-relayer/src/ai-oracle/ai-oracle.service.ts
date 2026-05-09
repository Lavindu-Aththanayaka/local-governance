import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ethers } from 'ethers';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export interface AiModerationResponse {
  success: boolean;
  isApproved: boolean;
  reason?: string;
}

@Injectable()
export class AiOracleService {
  private readonly logger = new Logger(AiOracleService.name);
  private readonly endpoint = 'https://ai-moderation.internalbuildtools.online/moderate/report';
  
  private readonly apiKey = process.env.ORACLE_API_KEY || 'default-api-key';
  
  // 1. FIX: Provide a strict fallback or handle the undefined type properly
  private readonly relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY || '';

  constructor() {
    if (!this.relayerPrivateKey) {
      this.logger.warn('RELAYER_PRIVATE_KEY is missing from environment variables!');
    }
  }

  async moderateContent(
    description: string,
    images: Express.Multer.File[] = [],
    zkpTicketId: string,
    citizenSignature: string,
    zkpSignature: string,
    payloadHash: string,
  ): Promise<AiModerationResponse> {
    this.logger.log('Preparing payload for AI Moderation Oracle...');

    if (!this.relayerPrivateKey) {
      throw new InternalServerErrorException('Relayer wallet is not configured properly.');
    }

    const reportId = `RPT-${uuidv4()}`;
    const nonce = uuidv4();
    const timestamp = new Date().toISOString();
    
    const category = 'General Civic Issue';
    const location = 'Unknown';

    const textHash = crypto.createHash('sha256').update(description).digest('hex');
    const mediaHashes = images.map(img => 
      crypto.createHash('sha256').update(img.buffer).digest('hex')
    );

    const canonicalObject = {
      report_id: reportId,
      text_hash: textHash,
      media_hashes: mediaHashes,
      category: category,
      location: location,
      ticket_hash: zkpTicketId,
      payload_hash: payloadHash,
      timestamp: timestamp,
      nonce: nonce
    };

    // 2. FIX: Sort keys safely without destroying the array data
    const sortedKeys = Object.keys(canonicalObject).sort();
    const sortedCanonicalObject: Record<string, any> = {};
    for (const key of sortedKeys) {
      sortedCanonicalObject[key] = (canonicalObject as any)[key];
    }

    const wallet = new ethers.Wallet(this.relayerPrivateKey);
    const canonicalString = JSON.stringify(sortedCanonicalObject);
    const relayerSignature = await wallet.signMessage(canonicalString);

    const metadata = {
      report_id: reportId,
      text: description,
      category: category,
      location: location,
      ticket_hash: zkpTicketId,
      payload_hash: payloadHash,
      citizen_signature: citizenSignature,
      government_ticket_signature: zkpSignature
    };

    // 3. FIX: Cast to 'any' to bypass TS DOM complaining, relying on Node 18+ globals
    const formData = new (globalThis as any).FormData();
    formData.append('metadata', JSON.stringify(metadata));

    images.forEach((img, index) => {
      const blob = new (globalThis as any).Blob([img.buffer], { type: img.mimetype });
      formData.append('files', blob, img.originalname || `image-${index}.webp`);
    });

    try {
      this.logger.log(`Dispatching request to AI Oracle (Report ID: ${reportId})`);
      
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'x-relayer-signature': relayerSignature,
          'x-request-timestamp': timestamp,
          'x-request-nonce': nonce,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Oracle responded with HTTP ${response.status}: ${errorText}`);
        throw new InternalServerErrorException('AI Moderation service failed.');
      }

      const result = await response.json();
      
      return {
        success: true,
        isApproved: result.approved ?? true,
        reason: result.reason,
      };

    } catch (error: any) {
      this.logger.error(`Failed to reach AI Oracle: ${error.message}`);
      throw new InternalServerErrorException('Could not connect to AI Moderation service.');
    }
  }
}