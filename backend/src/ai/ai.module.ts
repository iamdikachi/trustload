import { Module } from '@nestjs/common';
import { AiExtractionService } from './ai-extraction.service';
import { AiController } from './ai.controller';

@Module({
  controllers: [AiController],
  providers: [AiExtractionService],
  exports: [AiExtractionService],
})
export class AiModule {}

