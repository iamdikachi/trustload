import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReleaseRequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReleaseRequestDto } from './dto/create-release-request.dto';
import { FxRatesService } from './fx-rates.service';

export interface UploadedInvoiceFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
  path?: string;
}

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.heic',
  '.heif',
]);

const PENDING_STATUS = 'PENDING' as ReleaseRequestStatus;

export const PENDING_RELEASE_STATUSES = new Set<ReleaseRequestStatus>([
  PENDING_STATUS,
  ReleaseRequestStatus.PENDING_VERIFICATION,
  ReleaseRequestStatus.AWAITING_APPROVAL,
]);

@Injectable()
export class ReleaseRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fxRatesService: FxRatesService,
  ) {}

  async createReleaseRequest(
    groupIdParam: string | undefined,
    dto: CreateReleaseRequestDto,
    file?: UploadedInvoiceFile,
  ) {
    const groupId = (groupIdParam ?? dto?.groupId)?.trim();
    if (!groupId) {
      throw new BadRequestException('groupId is required.');
    }

    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });
    if (!group) {
      throw new NotFoundException(`Group with id "${groupId}" not found.`);
    }

    const supplier = dto?.supplier?.trim();
    if (!supplier) {
      throw new BadRequestException('supplier is required.');
    }

    const currency = (dto?.currency ?? group.baseCurrency ?? 'USD')
      .trim()
      .toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency)) {
      throw new BadRequestException(
        'currency must be a 3-letter ISO currency code (e.g. CNY, AED, TRY, USD).',
      );
    }

    const rawAmount = Number(dto?.amount);
    if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
      throw new BadRequestException('amount must be a positive number.');
    }

    if (!file) {
      throw new BadRequestException(
        'An invoice file (image or PDF) must be uploaded.',
      );
    }

    this.validateUploadedFile(file);
    const storedFilePath = await this.persistInvoiceFile(groupId, file);

    const { fxRate, fxRateDate } = this.fxRatesService.getConversionRate(
      currency,
      group.baseCurrency,
      dto?.fxRate,
    );

    const originalAmount =
      dto?.originalAmount !== undefined
        ? Number(dto.originalAmount)
        : rawAmount;

    if (!Number.isFinite(originalAmount) || originalAmount <= 0) {
      throw new BadRequestException(
        'originalAmount must be a positive number.',
      );
    }

    const baseAmount =
      dto?.originalAmount !== undefined
        ? Number(rawAmount.toFixed(2))
        : this.fxRatesService.convertAmount(originalAmount, fxRate);

    const extraFields: Record<string, unknown> = { supplier };
    const releaseRequest = await this.prisma.releaseRequest.create({
      data: {
        groupId: group.id,
        ...extraFields,
        amount: baseAmount.toFixed(2),
        currency,
        originalAmount: originalAmount.toFixed(2),
        fxRate: fxRate.toFixed(6),
        fxRateDate,
        sourceLanguage: dto?.sourceLanguage?.trim() || null,
        invoiceFile: storedFilePath,
        status: PENDING_STATUS,
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            baseCurrency: true,
            approvalThreshold: true,
          },
        },
        approvals: true,
      },
    });

    return {
      ...releaseRequest,
      isPending: PENDING_RELEASE_STATUSES.has(releaseRequest.status),
    };
  }

  async listGroupReleaseRequests(groupId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        name: true,
        baseCurrency: true,
        approvalThreshold: true,
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with id "${groupId}" not found.`);
    }

    const releaseRequests = await this.prisma.releaseRequest.findMany({
      where: { groupId },
      include: {
        approvals: {
          include: {
            member: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = releaseRequests.map((req) => ({
      ...req,
      isPending: PENDING_RELEASE_STATUSES.has(req.status),
    }));

    const pendingReleaseRequests = formatted.filter((req) => req.isPending);

    return {
      groupId: group.id,
      groupName: group.name,
      baseCurrency: group.baseCurrency,
      approvalThreshold: group.approvalThreshold,
      totalCount: formatted.length,
      pendingCount: pendingReleaseRequests.length,
      pendingReleaseRequests,
      releaseRequests: formatted,
    };
  }

  async getReleaseRequestById(id: string) {
    const releaseRequest = await this.prisma.releaseRequest.findUnique({
      where: { id },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            baseCurrency: true,
            approvalThreshold: true,
          },
        },
        approvals: {
          include: {
            member: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!releaseRequest) {
      throw new NotFoundException(`Release request "${id}" not found.`);
    }

    return {
      ...releaseRequest,
      isPending: PENDING_RELEASE_STATUSES.has(releaseRequest.status),
    };
  }

  async resolveInvoiceFile(id: string) {
    const releaseRequest = await this.prisma.releaseRequest.findUnique({
      where: { id },
    });

    if (!releaseRequest) {
      throw new NotFoundException(`Release request "${id}" not found.`);
    }

    const absolutePath = path.isAbsolute(releaseRequest.invoiceFile)
      ? releaseRequest.invoiceFile
      : path.resolve(process.cwd(), releaseRequest.invoiceFile);

    if (!fs.existsSync(absolutePath)) {
      throw new NotFoundException(
        `Stored invoice file "${releaseRequest.invoiceFile}" does not exist on disk.`,
      );
    }

    const ext = path.extname(absolutePath).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.heic': 'image/heic',
      '.heif': 'image/heif',
    };

    return {
      absolutePath,
      fileName: path.basename(absolutePath),
      mimeType: mimeMap[ext] ?? 'application/octet-stream',
    };
  }

  private validateUploadedFile(file: UploadedInvoiceFile) {
    if (!file.size || file.size <= 0) {
      throw new BadRequestException('Uploaded invoice file is empty.');
    }

    const ext = path.extname(file.originalname ?? '').toLowerCase();
    const mime = (file.mimetype ?? '').toLowerCase();

    const isAllowedMime = ALLOWED_MIME_TYPES.has(mime);
    const isAllowedExt = ALLOWED_EXTENSIONS.has(ext);

    if (!isAllowedMime && !isAllowedExt) {
      throw new BadRequestException(
        'Invoice file must be an image (JPEG, PNG, WebP, GIF, HEIC) or PDF.',
      );
    }
  }

  private async persistInvoiceFile(
    groupId: string,
    file: UploadedInvoiceFile,
  ): Promise<string> {
    const uploadRoot = process.env.UPLOAD_DIR ?? './uploads';
    const invoicesDir = path.resolve(process.cwd(), uploadRoot, 'invoices');
    await fs.promises.mkdir(invoicesDir, { recursive: true });

    const safeBaseName = path
      .basename(file.originalname || 'invoice')
      .replace(/[^a-zA-Z0-9._-]/g, '_');

    const fileName = `invoice-${groupId}-${Date.now()}-${safeBaseName}`;
    const fullPath = path.join(invoicesDir, fileName);

    if (file.buffer) {
      await fs.promises.writeFile(fullPath, file.buffer);
    } else if (file.path) {
      await fs.promises.copyFile(file.path, fullPath);
    } else {
      throw new BadRequestException('Uploaded invoice file buffer is missing.');
    }

    // Store normalized relative path for portability across environments
    return path
      .relative(process.cwd(), fullPath)
      .split(path.sep)
      .join('/');
  }
}

