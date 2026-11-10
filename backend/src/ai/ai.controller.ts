import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { UploadedInvoiceFile } from '../release-requests/release-requests.service';
import { AiExtractionService } from './ai-extraction.service';
import { ExtractInvoiceDto } from './dto/extract-invoice.dto';

@ApiTags('AI Invoice & Receipt Extraction (FR4)')
@Controller('ai')
export class AiController {
  constructor(private readonly aiExtractionService: AiExtractionService) {}

  @Post('invoices/extract')
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

  @Post('extract-invoice')
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
}

