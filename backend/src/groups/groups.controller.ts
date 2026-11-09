import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AddMemberOrdersDto,
  CreateGroupDto,
  CreateGroupMemberDto,
} from './dto/create-group.dto';
import { GroupsService } from './groups.service';

@ApiTags('Groups & Orders (FR1)')
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a buying group with traveler, vendor members, and orders (FR1)',
  })
  @ApiResponse({
    status: 201,
    description: 'Group created with members, order lines, and summary metrics.',
  })
  async createGroup(@Body() dto: CreateGroupDto) {
    return this.groupsService.createGroup(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all buying groups with members, orders, and pot summary',
  })
  async listGroups() {
    return this.groupsService.listGroups();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single buying group by ID with full details and ledger summary',
  })
  @ApiParam({ name: 'id', description: 'Group UUID' })
  async getGroupById(@Param('id') id: string) {
    return this.groupsService.getGroupById(id);
  }

  @Get(':id/orders')
  @ApiOperation({
    summary: 'Get combined group order lines aggregated by item across all vendors',
  })
  @ApiParam({ name: 'id', description: 'Group UUID' })
  async getGroupCombinedOrders(@Param('id') id: string) {
    return this.groupsService.getGroupCombinedOrders(id);
  }

  @Post(':id/members')
  @ApiOperation({
    summary: 'Add a vendor member and their order lines to an existing group',
  })
  @ApiParam({ name: 'id', description: 'Group UUID' })
  async addMemberToGroup(
    @Param('id') id: string,
    @Body() dto: CreateGroupMemberDto,
  ) {
    return this.groupsService.addMemberToGroup(id, dto);
  }

  @Post(':id/members/:memberId/orders')
  @ApiOperation({
    summary: 'Append additional order lines for a specific member in a group',
  })
  @ApiParam({ name: 'id', description: 'Group UUID' })
  @ApiParam({ name: 'memberId', description: 'Member UUID' })
  async addMemberOrders(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() dto: AddMemberOrdersDto,
  ) {
    return this.groupsService.addMemberOrders(id, memberId, dto);
  }
}
