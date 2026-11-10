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
import { VerifyInvoiceDto } from '../ai/dto/verify-invoice.dto';
import { CreateReleaseRequestDto } from './dto/create-release-request.dto';
import { SubmitApprovalDto } from './dto/submit-approval.dto';
import {
  ReleaseRequestsService,
  type UploadedInvoiceFile,
} from './release-requests.service';

@ApiTags('Release Requests & Approvals (FR3 / FR5)')
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

  @Post('release-requests/:id/extract')
  @ApiOperation({
    summary:
      'Run AI multimodal extraction on the stored invoice of a release request and update aiReport (FR4)',
  })
  @ApiParam({ name: 'id', description: 'Release Request UUID' })
  async extractReleaseInvoice(@Param('id') id: string) {
    return this.releaseRequestsService.extractReleaseRequestInvoice(id);
  }

  @Post('release-requests/:id/verify')
  @ApiOperation({
    summary:
      'Verify a release request invoice against the group combined order and historical prices, updating aiReport with flags (FR4)',
  })
  @ApiParam({ name: 'id', description: 'Release Request UUID' })
  async verifyReleaseInvoice(
    @Param('id') id: string,
    @Body() dto?: VerifyInvoiceDto,
  ) {
    return this.releaseRequestsService.verifyReleaseRequestInvoice(id, dto);
  }

  @Post('release-requests/:id/approvals')
  @ApiOperation({
    summary:
      'Member approves or rejects a release request; triggers PayPal payout when approvalThreshold is met (FR5)',
  })
  @ApiParam({ name: 'id', description: 'Release Request UUID' })
  @ApiResponse({
    status: 201,
    description:
      'Approval recorded; if approval threshold is reached, triggers a staged PayPal payout and writes a ledger entry.',
  })
  async submitApproval(
    @Param('id') id: string,
    @Body() dto: SubmitApprovalDto,
  ) {
    return this.releaseRequestsService.submitApproval(id, dto);
  }

  @Post('groups/:groupId/release-requests/:id/approvals')
  @ApiOperation({
    summary:
      'Member approves or rejects a release request within a group; triggers PayPal payout when approvalThreshold is met (FR5)',
  })
  @ApiParam({ name: 'groupId', description: 'Group UUID' })
  @ApiParam({ name: 'id', description: 'Release Request UUID' })
  async submitGroupReleaseApproval(
    @Param('id') id: string,
    @Body() dto: SubmitApprovalDto,
  ) {
    return this.releaseRequestsService.submitApproval(id, dto);
  }

  @Get('release-requests/:id/approvals')
  @ApiOperation({
    summary: 'List all member approvals/rejections and threshold progress for a release request',
  })
  @ApiParam({ name: 'id', description: 'Release Request UUID' })
  async listApprovals(@Param('id') id: string) {
    return this.releaseRequestsService.listApprovals(id);
  }

  @Post('release-requests/:id/payout')
  @ApiOperation({
    summary:
      'Trigger staged PayPal payout for an approved release request (fails if approval threshold is not met) (FR5)',
  })
  @ApiParam({ name: 'id', description: 'Release Request UUID' })
  async triggerPayout(@Param('id') id: string) {
    return this.releaseRequestsService.triggerPayout(id);
  }
}
