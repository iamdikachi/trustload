import {
  Body,
  Controller,
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
import { AiExtractionService } from './ai-extraction.service';
import { AiVerificationService } from './ai-verification.service';
import { ExtractInvoiceDto } from './dto/extract-invoice.dto';
import { VerifyInvoiceDto } from './dto/verify-invoice.dto';

@ApiTags('AI Invoice Extraction & Verification (FR4)')
@Controller()
export class AiController {
  constructor(
    private readonly aiExtractionService: AiExtractionService,
    private readonly aiVerificationService: AiVerificationService,
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
}
