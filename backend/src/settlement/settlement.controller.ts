import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SettleGroupDto } from './dto/settlement.dto';
import { SettlementService } from './settlement.service';

@ApiTags('Settlement & Refunds (FR7)')
@Controller('groups/:groupId')
export class SettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  @Post('settlement/preview')
  @ApiOperation({
    summary:
      'Calculate and preview each vendor final amount owed or refunded and update allocations (FR7)',
  })
  @ApiParam({ name: 'groupId', description: 'Group UUID' })
  async previewSettlement(
    @Param('groupId') groupId: string,
    @Body() dto: SettleGroupDto,
  ) {
    return this.settlementService.calculateSettlement(groupId, dto);
  }

  @Post('settlement')
  @ApiOperation({
    summary:
      'Execute final settlement: calculate net owed/refund per vendor, send PayPal refunds, record ledger entries, and close the group with a balanced ledger (FR7)',
  })
  @ApiParam({ name: 'groupId', description: 'Group UUID' })
  @ApiResponse({
    status: 201,
    description:
      'Leftover funds returned to vendors via PayPal and group closed with a balanced ledger.',
  })
  async settleGroup(
    @Param('groupId') groupId: string,
    @Body() dto: SettleGroupDto,
  ) {
    return this.settlementService.settleGroup(groupId, dto);
  }

  @Post('settle')
  @ApiOperation({
    summary: 'Alias for POST /groups/:groupId/settlement (FR7)',
  })
  @ApiParam({ name: 'groupId', description: 'Group UUID' })
  async settleGroupAlias(
    @Param('groupId') groupId: string,
    @Body() dto: SettleGroupDto,
  ) {
    return this.settlementService.settleGroup(groupId, dto);
  }

  @Get('settlement')
  @ApiOperation({
    summary:
      'Get the group settlement summary, per-vendor allocations, and refund ledger entries (FR7)',
  })
  @ApiParam({ name: 'groupId', description: 'Group UUID' })
  async getGroupSettlement(@Param('groupId') groupId: string) {
    return this.settlementService.getGroupSettlement(groupId);
  }
}

