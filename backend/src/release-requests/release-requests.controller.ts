import * as fs from 'node:fs';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CreateReleaseRequestDto } from './dto/create-release-request.dto';
import {
  ReleaseRequestsService,
  type UploadedInvoiceFile,
} from './release-requests.service';

@ApiTags('Release Requests (FR3)')
@Controller()
export class ReleaseRequestsController {
  constructor(
    private readonly releaseRequestsService: ReleaseRequestsService,
  ) {}

  @Post('groups/:groupId/release-requests')
  @UseInterceptors(
    AnyFilesInterceptor({
      limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB max
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Traveler submits a staged release request with amount, supplier, currency, and invoice upload (image or PDF) (FR3)',
  })
  @ApiParam({ name: 'groupId', description: 'Group UUID' })
  @ApiResponse({
    status: 201,
    description:
      'Release request stored with its uploaded invoice file and marked as PENDING for the group.',
  })
  async createGroupReleaseRequest(
    @Param('groupId') groupId: string,
    @Body() dto: CreateReleaseRequestDto,
    @UploadedFiles() files: UploadedInvoiceFile[],
  ) {
    const invoiceFile = files?.[0];
    return this.releaseRequestsService.createReleaseRequest(
      groupId,
      dto,
      invoiceFile,
    );
  }

  @Post('release-requests')
  @UseInterceptors(
    AnyFilesInterceptor({
      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Submit a release request with groupId, amount, supplier, currency, and invoice upload (FR3)',
  })
  async createReleaseRequest(
    @Body() dto: CreateReleaseRequestDto,
    @UploadedFiles() files: UploadedInvoiceFile[],
  ) {
    const invoiceFile = files?.[0];
    return this.releaseRequestsService.createReleaseRequest(
      dto.groupId,
      dto,
      invoiceFile,
    );
  }

  @Get('groups/:groupId/release-requests')
  @ApiOperation({
    summary: 'List all release requests (including pending requests) for a group',
  })
  @ApiParam({ name: 'groupId', description: 'Group UUID' })
  async listGroupReleaseRequests(@Param('groupId') groupId: string) {
    return this.releaseRequestsService.listGroupReleaseRequests(groupId);
  }

  @Get('release-requests/:id')
  @ApiOperation({
    summary: 'Get a single release request by ID',
  })
  @ApiParam({ name: 'id', description: 'Release Request UUID' })
  async getReleaseRequestById(@Param('id') id: string) {
    return this.releaseRequestsService.getReleaseRequestById(id);
  }

  @Get('release-requests/:id/invoice')
  @ApiOperation({
    summary: 'Download or view the stored supplier invoice file (image or PDF)',
  })
  @ApiParam({ name: 'id', description: 'Release Request UUID' })
  async downloadInvoiceFile(@Param('id') id: string, @Res() res: Response) {
    const { absolutePath, fileName, mimeType } =
      await this.releaseRequestsService.resolveInvoiceFile(id);

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    const stream = fs.createReadStream(absolutePath);
    stream.pipe(res);
  }
}

