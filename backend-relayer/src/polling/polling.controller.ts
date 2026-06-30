import {
    Controller,
    Post,
    Body,
    UseInterceptors,
    UploadedFiles,
    ParseIntPipe
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PollingService } from './polling.service';

@Controller('polling')
export class PollingController {
    constructor(private readonly pollingService: PollingService) { }

    @Post('create')
    @UseInterceptors(FilesInterceptor('images', 5)) // Accept up to 5 images
    async createOfficialPoll(
        @Body('title') title: string,
        @Body('description') description: string,
        @Body('pollType', ParseIntPipe) pollType: number,
        @Body('options') options: string, // Received as JSON string from frontend
        @Body('deadline', ParseIntPipe) deadline: number,
        @UploadedFiles() images: Express.Multer.File[]
    ) {
        // Parse options from JSON string
        const parsedOptions = JSON.parse(options);

        // Call the service method we defined earlier
        const result = await this.pollingService.createPoll({
            title,
            description,
            pollType,
            options: parsedOptions,
            deadline,
            images
        });

        return {
            success: true,
            data: result
        };
    }
}