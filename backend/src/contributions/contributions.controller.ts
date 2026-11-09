import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ContributionsService } from './contributions.service';
import { CreateContributionOrderDto } from './dto/contribution.dto';

@ApiTags('Contributions & Ledger (FR2 / FR8)')
@Controller()
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @Post('groups/:groupId/members/:memberId/contributions/orders')
  @ApiOperation({
    summary:
      'Create a PayPal Sandbox Order for a vendor member contribution (FR2)',
  })
  @ApiParam({ name: 'groupId', description: 'Group UUID' })
  @ApiParam({ name: 'memberId', description: 'Member UUID' })
  @ApiResponse({
    status: 201,
    description:
      'PayPal Sandbox Order created and pending Contribution recorded.',
  })
  async createMemberContributionOrder(
    @Param('groupId') groupId: string,
    @Param('memberId') memberId: string,
    @Body() dto: CreateContributionOrderDto,
  ) {
    return this.contributionsService.createContributionOrder(
      groupId,
      memberId,
      dto,
    );
  }

  @Post('contributions/orders')
  @ApiOperation({
    summary: 'Create a PayPal Sandbox Order for a member contribution (FR2)',
  })
  async createContributionOrder(@Body() dto: CreateContributionOrderDto) {
    return this.contributionsService.createContributionOrder(
      dto.groupId,
      dto.memberId,
      dto,
    );
  }

  @Post('contributions/orders/:paypalOrderId/capture')
  @ApiOperation({
    summary:
      'Capture an approved PayPal Sandbox Order and update the group pot',
  })
  @ApiParam({
    name: 'paypalOrderId',
    description: 'PayPal Order ID returned when creating the order',
  })
  async captureContributionOrder(@Param('paypalOrderId') paypalOrderId: string) {
    return this.contributionsService.captureContributionOrder(paypalOrderId);
  }

  @Get('groups/:groupId/contributions')
  @ApiOperation({
    summary: 'List all vendor contributions and PayPal Order IDs for a group',
  })
  @ApiParam({ name: 'groupId', description: 'Group UUID' })
  async listGroupContributions(@Param('groupId') groupId: string) {
    return this.contributionsService.listGroupContributions(groupId);
  }

  @Get('groups/:groupId/ledger')
  @ApiOperation({
    summary:
      'Get the append-only group ledger with PayPal order/transaction references',
  })
  @ApiParam({ name: 'groupId', description: 'Group UUID' })
  async getGroupLedger(@Param('groupId') groupId: string) {
    return this.contributionsService.getGroupLedger(groupId);
  }
}

