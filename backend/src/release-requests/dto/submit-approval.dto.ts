import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApprovalDecision } from '@prisma/client';

export class SubmitApprovalDto {
  @ApiProperty({
    description: 'Member UUID of the vendor casting the approval/rejection vote',
  })
  memberId!: string;

  @ApiProperty({
    enum: ApprovalDecision,
    example: ApprovalDecision.APPROVED,
    description: 'Vendor decision: APPROVED or REJECTED',
  })
  decision!: ApprovalDecision;

  @ApiPropertyOptional({
    example: 'Invoice matches combined order; approved for staged release.',
    description: 'Optional comment from the vendor',
  })
  comment?: string;
}

