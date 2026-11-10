import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ApprovalDecision,
  LedgerEntryType,
  Prisma,
  ReleaseRequestStatus,
} from '@prisma/client';
import { AiExtractionService } from '../ai/ai-extraction.service';
import { AiVerificationService } from '../ai/ai-verification.service';
import type { VerifyInvoiceDto } from '../ai/dto/verify-invoice.dto';
import { PaypalService } from '../contributions/paypal.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReleaseRequestDto } from './dto/create-release-request.dto';
import { SubmitApprovalDto } from './dto/submit-approval.dto';
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
    private readonly paypalService: PaypalService,
    private readonly aiExtractionService: AiExtractionService,
    private readonly aiVerificationService: AiVerificationService,
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

    const fileBuffer =
      file.buffer ??
      (file.path ? await fs.promises.readFile(file.path) : Buffer.alloc(0));

    const extraction = await this.aiExtractionService.extractInvoiceBuffer({
      buffer: fileBuffer,
      mimeType: file.mimetype || 'application/pdf',
      originalName: file.originalname || path.basename(storedFilePath),
      sourceFile: storedFilePath,
      supplierHint: supplier,
      currencyHint: currency,
      amountHint: originalAmount,
      languageHint: dto?.sourceLanguage,
      baseCurrency: group.baseCurrency,
    });

    const verification =
      await this.aiVerificationService.verifyExtractionAgainstGroupOrder({
        groupId: group.id,
        extraction,
        requestedAmount: originalAmount,
        requestedAmountCurrency: currency,
        explicitFxRate: fxRate,
      });

    const mergedAiReport = {
      ...extraction,
      passedAllChecks: verification.passedAllChecks,
      verificationStatus: verification.status,
      flags: verification.flags,
      checks: verification.checks,
      lineItemMatches: verification.lineItemMatches,
      verificationSummary: verification.summary,
      verification,
    };

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
        sourceLanguage:
          dto?.sourceLanguage?.trim() || extraction.sourceLanguage || null,
        invoiceFile: storedFilePath,
        aiReport: mergedAiReport as unknown as Prisma.InputJsonValue,
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
      originalCurrency: releaseRequest.currency,
      baseCurrency: group.baseCurrency,
      rateUsed: Number(releaseRequest.fxRate),
      rateDate: releaseRequest.fxRateDate.toISOString(),
      convertedBaseAmount: Number(releaseRequest.amount),
      convertedInCode: true,
      isPending: PENDING_RELEASE_STATUSES.has(releaseRequest.status),
    };
  }

  getRateTable(baseCurrency?: string) {
    return this.fxRatesService.getRateTable(baseCurrency);
  }

  convertCurrencyInCode(params: {
    originalAmount: number;
    fromCurrency: string;
    toBaseCurrency?: string;
    customRate?: number | string;
  }) {
    return this.fxRatesService.convertInvoiceTotalToBase(params);
  }

  async extractReleaseRequestInvoice(releaseRequestId: string) {
    const releaseRequest = await this.prisma.releaseRequest.findUnique({
      where: { id: releaseRequestId },
      include: {
        group: true,
      },
    });

    if (!releaseRequest) {
      throw new NotFoundException(
        `Release request "${releaseRequestId}" not found.`,
      );
    }

    const supplierHint =
      ((releaseRequest as Record<string, unknown>).supplier as
        | string
        | undefined) ?? undefined;

    const extraction = await this.aiExtractionService.extractFromStoredFile({
      invoiceFilePath: releaseRequest.invoiceFile,
      supplierHint,
      currencyHint: releaseRequest.currency,
      amountHint: Number(releaseRequest.originalAmount),
      languageHint: releaseRequest.sourceLanguage,
    });

    const verification =
      await this.aiVerificationService.verifyExtractionAgainstGroupOrder({
        groupId: releaseRequest.groupId,
        releaseRequestId: releaseRequest.id,
        extraction,
        requestedAmount: Number(releaseRequest.originalAmount),
        requestedAmountCurrency: releaseRequest.currency,
        explicitFxRate: Number(releaseRequest.fxRate),
      });

    const mergedAiReport = {
      ...extraction,
      passedAllChecks: verification.passedAllChecks,
      verificationStatus: verification.status,
      flags: verification.flags,
      checks: verification.checks,
      lineItemMatches: verification.lineItemMatches,
      verificationSummary: verification.summary,
      verification,
    };

    const updated = await this.prisma.releaseRequest.update({
      where: { id: releaseRequestId },
      data: {
        sourceLanguage: extraction.sourceLanguage,
        aiReport: mergedAiReport as unknown as Prisma.InputJsonValue,
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
      extraction,
      verification,
      releaseRequest: {
        ...updated,
        isPending: PENDING_RELEASE_STATUSES.has(updated.status),
      },
    };
  }

  async verifyReleaseRequestInvoice(
    releaseRequestId: string,
    dto?: VerifyInvoiceDto,
  ) {
    return this.aiVerificationService.verifyInvoice(undefined, {
      ...dto,
      releaseRequestId,
    });
  }

  async submitApproval(releaseRequestId: string, dto: SubmitApprovalDto) {
    const memberId = dto?.memberId?.trim();
    if (!memberId) {
      throw new BadRequestException('memberId is required.');
    }

    const decision = dto?.decision;
    if (
      decision !== ApprovalDecision.APPROVED &&
      decision !== ApprovalDecision.REJECTED
    ) {
      throw new BadRequestException(
        'decision must be either APPROVED or REJECTED.',
      );
    }

    const releaseRequest = await this.prisma.releaseRequest.findUnique({
      where: { id: releaseRequestId },
      include: {
        group: {
          include: {
            traveler: true,
            members: true,
          },
        },
        approvals: true,
      },
    });

    if (!releaseRequest) {
      throw new NotFoundException(
        `Release request "${releaseRequestId}" not found.`,
      );
    }

    if (releaseRequest.status === ReleaseRequestStatus.RELEASED) {
      throw new BadRequestException(
        'Release request has already been paid out and cannot be modified.',
      );
    }

    if (releaseRequest.status === ReleaseRequestStatus.REJECTED) {
      throw new BadRequestException(
        'Release request has already been rejected.',
      );
    }

    const isGroupMember = releaseRequest.group.members.some(
      (m) => m.id === memberId,
    );
    if (!isGroupMember) {
      throw new BadRequestException(
        `Member "${memberId}" does not belong to group "${releaseRequest.groupId}".`,
      );
    }

    const approval = await this.prisma.approval.upsert({
      where: {
        releaseRequestId_memberId: {
          releaseRequestId,
          memberId,
        },
      },
      update: {
        decision,
        comment: dto?.comment?.trim() || null,
      },
      create: {
        releaseRequestId,
        memberId,
        decision,
        comment: dto?.comment?.trim() || null,
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    const allApprovals = await this.prisma.approval.findMany({
      where: { releaseRequestId },
    });

    const approvedCount = allApprovals.filter(
      (a) => a.decision === ApprovalDecision.APPROVED,
    ).length;
    const rejectedCount = allApprovals.filter(
      (a) => a.decision === ApprovalDecision.REJECTED,
    ).length;

    const threshold = Math.max(1, releaseRequest.group.approvalThreshold);
    const totalMembers = releaseRequest.group.members.length;

    if (approvedCount >= threshold) {
      const payoutOutcome =
        await this.executePayoutForApprovedRelease(releaseRequestId);
      return {
        approval,
        approvedCount,
        rejectedCount,
        approvalThreshold: threshold,
        thresholdMet: true,
        payoutTriggered: true,
        ...payoutOutcome,
      };
    }

    const cannotReachThreshold =
      totalMembers > 0
        ? rejectedCount > totalMembers - threshold
        : rejectedCount > 0;

    if (cannotReachThreshold) {
      const rejectedRelease = await this.prisma.releaseRequest.update({
        where: { id: releaseRequestId },
        data: { status: ReleaseRequestStatus.REJECTED },
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
      });

      return {
        approval,
        approvedCount,
        rejectedCount,
        approvalThreshold: threshold,
        thresholdMet: false,
        payoutTriggered: false,
        releaseRequest: {
          ...rejectedRelease,
          isPending: false,
        },
        ledgerEntry: null,
      };
    }

    const awaitingRelease = await this.prisma.releaseRequest.update({
      where: { id: releaseRequestId },
      data: { status: ReleaseRequestStatus.AWAITING_APPROVAL },
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
    });

    return {
      approval,
      approvedCount,
      rejectedCount,
      approvalThreshold: threshold,
      thresholdMet: false,
      payoutTriggered: false,
      releaseRequest: {
        ...awaitingRelease,
        isPending: true,
      },
      ledgerEntry: null,
    };
  }

  async triggerPayout(releaseRequestId: string) {
    return this.executePayoutForApprovedRelease(releaseRequestId);
  }

  async executePayoutForApprovedRelease(releaseRequestId: string) {
    const releaseRequest = await this.prisma.releaseRequest.findUnique({
      where: { id: releaseRequestId },
      include: {
        group: {
          include: {
            traveler: true,
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
      throw new NotFoundException(
        `Release request "${releaseRequestId}" not found.`,
      );
    }

    // Idempotent return if already released
    if (
      releaseRequest.status === ReleaseRequestStatus.RELEASED &&
      releaseRequest.paypalPayoutId
    ) {
      const existingLedgerEntry = await this.prisma.ledgerEntry.findFirst({
        where: {
          groupId: releaseRequest.groupId,
          type: LedgerEntryType.STAGED_RELEASE,
          paypalRef: releaseRequest.paypalPayoutId,
        },
      });

      return {
        releaseRequest: {
          ...releaseRequest,
          isPending: false,
        },
        ledgerEntry: existingLedgerEntry,
        paypalPayoutId: releaseRequest.paypalPayoutId,
      };
    }

    // Safety Rule (PRD Section 6 & 10): No payout without an explicit approval record meeting threshold
    const approvedRecords = releaseRequest.approvals.filter(
      (a) => a.decision === ApprovalDecision.APPROVED,
    );
    const threshold = Math.max(1, releaseRequest.group.approvalThreshold);

    if (approvedRecords.length === 0 || approvedRecords.length < threshold) {
      throw new BadRequestException(
        `Cannot trigger payout without required member approvals: requires ${threshold} APPROVED record(s), currently has ${approvedRecords.length}.`,
      );
    }

    const supplierLabel =
      ((releaseRequest as Record<string, unknown>).supplier as
        | string
        | undefined) ?? 'Supplier Invoice';

    const payoutResult = await this.paypalService.createPayout({
      releaseRequestId: releaseRequest.id,
      recipientEmail: releaseRequest.group.traveler.email,
      amount: Number(releaseRequest.amount).toFixed(2),
      currency: releaseRequest.group.baseCurrency,
      note: `TrustLoad staged release for ${supplierLabel} (${releaseRequest.group.name})`,
    });

    return this.prisma.$transaction(
      async (tx) => {
        const current = await tx.releaseRequest.findUniqueOrThrow({
          where: { id: releaseRequestId },
        });

        if (
          current.status === ReleaseRequestStatus.RELEASED &&
          current.paypalPayoutId
        ) {
          const existingEntry = await tx.ledgerEntry.findFirst({
            where: {
              groupId: current.groupId,
              type: LedgerEntryType.STAGED_RELEASE,
              paypalRef: current.paypalPayoutId,
            },
          });

          const fullRelease = await tx.releaseRequest.findUniqueOrThrow({
            where: { id: releaseRequestId },
            include: {
              approvals: {
                include: {
                  member: { include: { user: true } },
                },
              },
            },
          });

          return {
            releaseRequest: {
              ...fullRelease,
              isPending: false,
            },
            ledgerEntry: existingEntry,
            paypalPayoutId: current.paypalPayoutId,
          };
        }

        const updatedRelease = await tx.releaseRequest.update({
          where: { id: releaseRequestId },
          data: {
            status: ReleaseRequestStatus.RELEASED,
            paypalPayoutId: payoutResult.payoutBatchId,
          },
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
        });

        const signedBaseAmount = (-Math.abs(
          Number(releaseRequest.amount),
        )).toFixed(2);

        const ledgerEntry = await tx.ledgerEntry.create({
          data: {
            groupId: releaseRequest.groupId,
            type: LedgerEntryType.STAGED_RELEASE,
            amount: signedBaseAmount,
            originalAmount: releaseRequest.originalAmount,
            currency: releaseRequest.currency,
            fxRate: releaseRequest.fxRate,
            fxRateDate: releaseRequest.fxRateDate,
            paypalRef: payoutResult.payoutBatchId,
            description: `Staged payout to ${releaseRequest.group.traveler.name} for ${supplierLabel} (PayPal Payout ${payoutResult.payoutBatchId})`,
          },
        });

        return {
          releaseRequest: {
            ...updatedRelease,
            isPending: false,
          },
          ledgerEntry: {
            ...ledgerEntry,
            originalCurrency: ledgerEntry.currency,
            baseCurrency: releaseRequest.group.baseCurrency,
            rateUsed: Number(ledgerEntry.fxRate),
            rateDate: ledgerEntry.fxRateDate.toISOString(),
            convertedBaseAmount: Number(
              Math.abs(Number(ledgerEntry.amount)).toFixed(2),
            ),
            convertedInCode: true,
          },
          paypalPayoutId: payoutResult.payoutBatchId,
        };
      },
      { maxWait: 15000, timeout: 30000 },
    );
  }

  async listApprovals(releaseRequestId: string) {
    const releaseRequest = await this.prisma.releaseRequest.findUnique({
      where: { id: releaseRequestId },
      include: {
        group: {
          select: {
            id: true,
            name: true,
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
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!releaseRequest) {
      throw new NotFoundException(
        `Release request "${releaseRequestId}" not found.`,
      );
    }

    const approvedCount = releaseRequest.approvals.filter(
      (a) => a.decision === ApprovalDecision.APPROVED,
    ).length;
    const rejectedCount = releaseRequest.approvals.filter(
      (a) => a.decision === ApprovalDecision.REJECTED,
    ).length;
    const threshold = Math.max(1, releaseRequest.group.approvalThreshold);

    return {
      releaseRequestId: releaseRequest.id,
      status: releaseRequest.status,
      paypalPayoutId: releaseRequest.paypalPayoutId,
      approvedCount,
      rejectedCount,
      approvalThreshold: threshold,
      thresholdMet: approvedCount >= threshold,
      approvals: releaseRequest.approvals,
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
