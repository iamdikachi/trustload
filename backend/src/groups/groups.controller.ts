import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  AddMemberOrdersDto,
  CreateGroupDto,
  CreateGroupMemberDto,
} from './dto/create-group.dto';
import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  async createGroup(@Body() dto: CreateGroupDto) {
    return this.groupsService.createGroup(dto);
  }

  @Get()
  async listGroups() {
    return this.groupsService.listGroups();
  }

  @Get(':id')
  async getGroupById(@Param('id') id: string) {
    return this.groupsService.getGroupById(id);
  }

  @Get(':id/orders')
  async getGroupCombinedOrders(@Param('id') id: string) {
    return this.groupsService.getGroupCombinedOrders(id);
  }

  @Post(':id/members')
  async addMemberToGroup(
    @Param('id') id: string,
    @Body() dto: CreateGroupMemberDto,
  ) {
    return this.groupsService.addMemberToGroup(id, dto);
  }

  @Post(':id/members/:memberId/orders')
  async addMemberOrders(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() dto: AddMemberOrdersDto,
  ) {
    return this.groupsService.addMemberOrders(id, memberId, dto);
  }
}

