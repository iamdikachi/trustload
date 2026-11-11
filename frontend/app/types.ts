export type UserRole = 'TRAVELER' | 'VENDOR';

export type GroupStatus = 'SETUP' | 'FUNDING' | 'ACTIVE' | 'SETTLING' | 'CLOSED';

export type SharedCostRule = 'PROPORTIONAL_TO_VALUE' | 'EQUAL' | 'BY_CONTRIBUTION';

export type ContributionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export type ReleaseRequestStatus =
  | 'PENDING'
  | 'PENDING_VERIFICATION'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'RELEASED';

export type ApprovalDecision = 'APPROVED' | 'REJECTED';

export type LedgerEntryType =
  | 'CONTRIBUTION'
  | 'STAGED_RELEASE'
  | 'RECEIPT_SPEND'
  | 'REFUND'
  | 'REVERSAL';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface OrderLine {
  id: string;
  groupId: string;
  memberId: string;
  item: string;
  quantity: number;
  budget: string | number;
  createdAt?: string;
  member?: Member;
}

export interface Contribution {
  id: string;
  memberId: string;
  amount: string | number;
  currency: string;
  paypalOrderId: string;
  paypalCaptureId?: string | null;
  status: ContributionStatus;
  createdAt: string;
  member?: Member;
}

export interface Approval {
  id: string;
  releaseRequestId: string;
  memberId: string;
  decision: ApprovalDecision;
  comment?: string | null;
  createdAt: string;
  member?: Member;
}

export interface AiFlag {
  code: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
}

export interface AiLineItem {
  originalDescription?: string;
  translatedDescription?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  confidence?: number;
}

export interface AiVerificationReport {
  supplier?: string;
  date?: string;
  sourceLanguage?: string;
  currency?: string;
  grandTotal?: number;
  convertedTotalUsd?: number;
  overallConfidence?: number;
  passedAllChecks?: boolean;
  flags?: AiFlag[];
  lineItems?: AiLineItem[];
  confidencePerField?: Record<string, number>;
  checks?: {
    itemsMatch?: boolean;
    quantitiesWithinOrder?: boolean;
    lineTotalsAddUp?: boolean;
    invoiceTotalWithinRequestedAmount?: boolean;
    pricesReasonable?: boolean;
  };
}

export interface ReleaseRequest {
  id: string;
  groupId: string;
  supplier?: string | null;
  amount: string | number;
  currency: string;
  originalAmount: string | number;
  fxRate: string | number;
  fxRateDate?: string;
  sourceLanguage?: string | null;
  invoiceFile: string;
  aiReport?: AiVerificationReport | null;
  status: ReleaseRequestStatus;
  paypalPayoutId?: string | null;
  createdAt: string;
  updatedAt?: string;
  approvals?: Approval[];
}

export interface Receipt {
  id: string;
  groupId: string;
  file: string;
  aiExtraction?: {
    supplier?: string;
    date?: string;
    currency?: string;
    goodsSubtotal?: number;
    sharedCosts?: Array<{ description: string; amount: number }>;
    grandTotal?: number;
  } | null;
  currency: string;
  originalAmount: string | number;
  fxRate: string | number;
  fxRateDate?: string;
  sourceLanguage?: string | null;
  createdAt: string;
}

export interface Allocation {
  id: string;
  groupId: string;
  memberId: string;
  goodsTotal: string | number;
  sharedCostShare: string | number;
  netOwedOrRefund: string | number;
  createdAt?: string;
  updatedAt?: string;
  member?: Member;
}

export interface LedgerEntry {
  id: string;
  groupId: string;
  memberId?: string | null;
  type: LedgerEntryType;
  amount: string | number;
  originalAmount: string | number;
  currency: string;
  fxRate: string | number;
  fxRateDate: string;
  paypalRef: string;
  description?: string | null;
  createdAt: string;
  member?: Member;
}

export interface Member {
  id: string;
  groupId: string;
  userId: string;
  contributionExpected: string | number;
  createdAt?: string;
  user: User;
  orderLines?: OrderLine[];
  contributions?: Contribution[];
  approvals?: Approval[];
  allocations?: Allocation[];
}

export interface GroupSummary {
  memberCount: number;
  orderLineCount: number;
  pendingReleaseRequestCount: number;
  totalExpectedContribution: number;
  totalContributionsCompleted: number;
  totalOrderBudget: number;
  totalReleased: number;
  totalReversals: number;
  netSpend: number;
  totalRefunded: number;
  potBalance: number;
  isBalanced: boolean;
}

export interface Group {
  id: string;
  name: string;
  travelerId: string;
  status: GroupStatus;
  approvalThreshold: number;
  sharedCostRule: SharedCostRule;
  baseCurrency: string;
  createdAt: string;
  updatedAt: string;
  traveler: User;
  members: Member[];
  orderLines?: OrderLine[];
  releaseRequests?: ReleaseRequest[];
  receipts?: Receipt[];
  allocations?: Allocation[];
  ledgerEntries?: LedgerEntry[];
  pendingReleaseRequests?: ReleaseRequest[];
  summary?: GroupSummary;
}

export interface CombinedOrderItem {
  item: string;
  totalQuantity: number;
  totalBudget: number;
  memberCount: number;
  vendorDetails: Array<{
    memberId: string;
    memberName: string;
    quantity: number;
    budget: number;
  }>;
}
