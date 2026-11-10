import {
  Body,
  Controller,
  Get,
  Param,
  Post,
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
import type { UploadedInvoiceFile } from '../release-requests/release-requests.service';
import { AiAllocationService } from './ai-allocation.service';
import { AiExtractionService } from './ai-extraction.service';
import { AiVerificationService } from './ai-verification.service';
import { ExtractInvoiceDto } from './dto/extract-invoice.dto';
import {
  AllocateReceiptsDto,
  CreateReceiptDto,
} from './dto/receipt-allocation.dto';
import { VerifyInvoiceDto } from './dto/verify-invoice.dto';

@ApiTags('AI Invoice Extraction, Verification & Receipt Allocation (FR4 / FR6)')
@Controller()
export class AiController {
  constructor(
    private readonly aiExtractionService: AiExtractionService,
    private readonly aiVerificationService: AiVerificationService,
    private readonly aiAllocationService: AiAllocationService,
  ) {}

  @Post('ai/invoices/extract')
  @UseInterceptors(
    AnyFilesInterceptor({
      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Extract structured JSON from an invoice photo or PDF in any language/currency with per-field confidence scores (FR4)',
  })
  @ApiResponse({
    status: 201,
    description:
      'Structured JSON containing supplier, date, originalCurrency, lineItems, grandTotal, sourceLanguage, confidencePerField, and lowConfidenceFields.',
  })
  async extractInvoice(
    @Body() dto: ExtractInvoiceDto,
    @UploadedFiles() files: UploadedInvoiceFile[],
  ) {
    return this.aiExtractionService.extractFromUploadedFile(files?.[0], dto);
  }

  @Post('ai/extract-invoice')
  @UseInterceptors(
    AnyFilesInterceptor({
      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Alias for POST /ai/invoices/extract (FR4)',
  })
  async extractInvoiceAlias(
    @Body() dto: ExtractInvoiceDto,
    @UploadedFiles() files: UploadedInvoiceFile[],
  ) {
    return this.aiExtractionService.extractFromUploadedFile(files?.[0], dto);
  }

  @Post('ai/invoices/verify')
  @UseInterceptors(
    AnyFilesInterceptor({
      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  )
  @ApiOperation({
    summary:
      'Verify an extracted invoice (or uploaded invoice file) against the group combined order and historical prices (FR4)',
  })
  @ApiResponse({
    status: 201,
    description:
      'Match report with checks (itemsMatch, quantitiesWithinOrder, lineTotalsAddUp, invoiceTotalWithinRequestedAmount, pricesReasonable), lineItemMatches, and flags.',
  })
  async verifyInvoice(
    @Body() dto: VerifyInvoiceDto,
    @UploadedFiles() files?: UploadedInvoiceFile[],
  ) {
    return this.aiVerificationService.verifyInvoice(
      undefined,
      dto,
      files?.[0],
    );
  }

  @Post('groups/:groupId/invoices/verify')
  @UseInterceptors(
    AnyFilesInterceptor({
      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  )
  @ApiParam({ name: 'groupId', description: 'Group UUID' })
  @ApiOperation({
    summary:
      'Verify an invoice file or extracted JSON payload against a specific group combined order (FR4)',
  })
  @ApiResponse({
    status: 201,
    description:
      'Match report comparing invoice items, quantities, line totals, grand total, and unit prices against the group order.',
  })
  async verifyGroupInvoice(
    @Param('groupId') groupId: string,
    @Body() dto: VerifyInvoiceDto,
    @UploadedFiles() files?: UploadedInvoiceFile[],
  ) {
    return this.aiVerificationService.verifyInvoice(groupId, dto, files?.[0]);
  }

  @Post('groups/:groupId/receipts')
  @UseInterceptors(
    AnyFilesInterceptor({
      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  )
  @ApiParam({ name: 'groupId', description: 'Group UUID' })
  @ApiOperation({
    summary:
      'Upload and extract a final trip receipt (photo/PDF or JSON), convert to group base currency in code, and store in receipts (FR6)',
  })
  async uploadGroupReceipt(
    @Param('groupId') groupId: string,
    @Body() dto: CreateReceiptDto,
    @UploadedFiles() files?: UploadedInvoiceFile[],
  ) {
    return this.aiAllocationService.createGroupReceipt(
      groupId,
      dto,
      files?.[0],
    );
  }

  @Get('groups/:groupId/receipts')
  @ApiParam({ name: 'groupId', description: 'Group UUID' })
  @ApiOperation({
    summary: 'List all final trip receipts stored for a group (FR6)',
  })
  async listGroupReceipts(@Param('groupId') groupId: string) {
    return this.aiAllocationService.listGroupReceipts(groupId);
  }

  @Post('groups/:groupId/receipts/allocate')
  @UseInterceptors(
    AnyFilesInterceptor({
      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  )
  @ApiParam({ name: 'groupId', description: 'Group UUID' })
  @ApiOperation({
    summary:
      'Read final receipts, assign goods to the vendor who ordered them, split shared costs proportionally (or by configurable rule), and reconcile totals with the pot (FR6)',
  })
  @ApiResponse({
    status: 201,
    description:
      'Per-vendor goods total, shared-cost share, net owed or refunded, and pot reconciliation.',
  })
  async allocateGroupReceipts(
    @Param('groupId') groupId: string,
    @Body() dto: AllocateReceiptsDto,
    @UploadedFiles() files?: UploadedInvoiceFile[],
  ) {
    return this.aiAllocationService.allocateGroupReceipts(groupId, dto, files);
  }

  @Post('groups/:groupId/allocations')
  @UseInterceptors(
    AnyFilesInterceptor({
      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  )
  @ApiParam({ name: 'groupId', description: 'Group UUID' })
  @ApiOperation({
    summary: 'Alias for POST /groups/:groupId/receipts/allocate (FR6)',
  })
  async allocateGroupReceiptsAlias(
    @Param('groupId') groupId: string,
    @Body() dto: AllocateReceiptsDto,
    @UploadedFiles() files?: UploadedInvoiceFile[],
  ) {
    return this.aiAllocationService.allocateGroupReceipts(groupId, dto, files);
  }

  @Get('groups/:groupId/allocations')
  @ApiParam({ name: 'groupId', description: 'Group UUID' })
  @ApiOperation({
    summary:
      'Get each vendor goods total, shared-cost share, net owed or refunded, and pot reconciliation (FR6)',
  })
  async getGroupAllocations(@Param('groupId') groupId: string) {
    return this.aiAllocationService.getGroupAllocations(groupId);
  }
}
