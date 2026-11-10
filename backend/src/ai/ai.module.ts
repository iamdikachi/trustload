import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FxRatesService } from '../release-requests/fx-rates.service';
import { AiAllocationService } from './ai-allocation.service';
import { AiExtractionService } from './ai-extraction.service';
import { AiVerificationService } from './ai-verification.service';
import { AiController } from './ai.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AiController],
  providers: [
    AiExtractionService,
    AiVerificationService,
    AiAllocationService,
    FxRatesService,
  ],
  exports: [AiExtractionService, AiVerificationService, AiAllocationService],
})
export class AiModule {}
