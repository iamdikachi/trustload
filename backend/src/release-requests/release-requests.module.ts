import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { ContributionsModule } from '../contributions/contributions.module';
import { FxRatesService } from './fx-rates.service';
import { ReleaseRequestsController } from './release-requests.controller';
import { ReleaseRequestsService } from './release-requests.service';

@Module({
  imports: [ContributionsModule, AiModule],
  controllers: [ReleaseRequestsController],
  providers: [ReleaseRequestsService, FxRatesService],
  exports: [ReleaseRequestsService, FxRatesService],
})
export class ReleaseRequestsModule {}
