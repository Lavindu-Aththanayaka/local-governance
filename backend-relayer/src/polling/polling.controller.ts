import { Controller, Post, Body } from '@nestjs/common';
import { PollingService } from './polling.service';

interface CreatePollDto {
    title: string;
    description: string;
    ticketId?: number;
}

@Controller('polling')
export class PollingController {
    constructor(private readonly pollingService: PollingService) { }

    @Post('authorize-official')
    async authorizeOfficialPoll(@Body() body: CreatePollDto) {
        // Default to 0 for standalone polls not linked to a specific civic issue
        const ticketId = body.ticketId || 0;

        const authorizedPayload = await this.pollingService.processAndSignPoll(
            body.title,
            body.description,
            ticketId
        );

        return {
            success: true,
            data: authorizedPayload
        };
    }
}