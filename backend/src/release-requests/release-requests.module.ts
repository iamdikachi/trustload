import { Module } from '@nestjs/common';
import { FxRatesService } from './fx-rates.service';
import { ReleaseRequestsController } from './release-requests.controller';
import { ReleaseRequestsService } from './release-requests.service';

@Module({
  controllers: [ReleaseRequestsController],
  providers: [ReleaseRequestsService, FxRatesService],
  exports: [ReleaseRequestsService, FxRatesService],
})
export class ReleaseRequestsModule {}

