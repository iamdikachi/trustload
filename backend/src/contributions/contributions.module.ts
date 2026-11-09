import { Module } from '@nestjs/common';
import { ContributionsController } from './contributions.controller';
import { ContributionsService } from './contributions.service';
import { PaypalService } from './paypal.service';
import { PaypalWebhooksController } from './webhooks.controller';

@Module({
  controllers: [ContributionsController, PaypalWebhooksController],
  providers: [ContributionsService, PaypalService],
  exports: [ContributionsService, PaypalService],
})
export class ContributionsModule {}

