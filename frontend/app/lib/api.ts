import {
  Group,
  CombinedOrderItem,
  Contribution,
  LedgerEntry,
  ReleaseRequest,
  Receipt,
  Allocation,
  Approval,
} from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = res.statusText;
    try {
      const json = await res.json();
      errorDetail = json.message || JSON.stringify(json);
    } catch {
      // ignore
    }
    throw new Error(`API Error (${res.status}): ${errorDetail}`);
  }
  return res.json();
}

export interface EndpointDescriptor {
  id: string;
  category: 'GROUPS' | 'CONTRIBUTIONS' | 'RELEASES' | 'FX' | 'AI_RECEIPTS' | 'SETTLEMENT';
  method: 'GET' | 'POST';
  path: string;
  summary: string;
}

export const ENDPOINT_REGISTRY: EndpointDescriptor[] = [
  // System Root
  { id: 'root', category: 'GROUPS', method: 'GET', path: '/', summary: 'Root API Health & Version Info' },
  // Groups Domain
  { id: 'createGroup', category: 'GROUPS', method: 'POST', path: '/groups', summary: 'Create Buying Group with Traveler & Orders' },
  { id: 'listGroups', category: 'GROUPS', method: 'GET', path: '/groups', summary: 'List All Escrow Buying Groups' },
  { id: 'getGroupById', category: 'GROUPS', method: 'GET', path: '/groups/:id', summary: 'Get Group by ID with Members & Pot Metrics' },
  { id: 'getCombinedOrders', category: 'GROUPS', method: 'GET', path: '/groups/:id/orders', summary: 'Get Aggregate Order Line Manifest' },
  { id: 'addMember', category: 'GROUPS', method: 'POST', path: '/groups/:id/members', summary: 'Add Vendor Member to Group' },
  { id: 'addMemberOrders', category: 'GROUPS', method: 'POST', path: '/groups/:id/members/:memberId/orders', summary: 'Attach Manifest Orders to Member' },
  // Contributions & Pot Domain
  { id: 'createContributionOrder', category: 'CONTRIBUTIONS', method: 'POST', path: '/groups/:groupId/members/:memberId/contributions/orders', summary: 'Generate PayPal Sandbox Deposit Order' },
  { id: 'createContributionOrderDirect', category: 'CONTRIBUTIONS', method: 'POST', path: '/contributions/orders', summary: 'Create PayPal Contribution Order Direct' },
  { id: 'captureContributionOrder', category: 'CONTRIBUTIONS', method: 'POST', path: '/contributions/orders/:paypalOrderId/capture', summary: 'Capture PayPal Deposit into Vault Pot' },
  { id: 'getGroupContributions', category: 'CONTRIBUTIONS', method: 'GET', path: '/groups/:groupId/contributions', summary: 'List All Member Contributions' },
  { id: 'getGroupLedger', category: 'CONTRIBUTIONS', method: 'GET', path: '/groups/:groupId/ledger', summary: 'Get Immutable Vault Pot Ledger Entries' },
  { id: 'paypalWebhook', category: 'CONTRIBUTIONS', method: 'POST', path: '/webhooks/paypal', summary: 'Simulate/Handle PayPal Sandbox Webhook' },
  // Release Requests Domain
  { id: 'createReleaseRequest', category: 'RELEASES', method: 'POST', path: '/groups/:groupId/release-requests', summary: 'Submit Traveler Staged Release Claim with Invoice' },
  { id: 'createReleaseRequestDirect', category: 'RELEASES', method: 'POST', path: '/release-requests', summary: 'Submit Release Claim (Direct Alias)' },
  { id: 'getReleaseRequests', category: 'RELEASES', method: 'GET', path: '/groups/:groupId/release-requests', summary: 'List Staged Release Requests for Group' },
  { id: 'getReleaseRequestById', category: 'RELEASES', method: 'GET', path: '/release-requests/:id', summary: 'Get Single Release Claim Details & Status' },
  { id: 'getInvoiceDownload', category: 'RELEASES', method: 'GET', path: '/release-requests/:id/invoice', summary: 'Stream/Download Uploaded Invoice File' },
  { id: 'extractReleaseAi', category: 'RELEASES', method: 'POST', path: '/release-requests/:id/extract', summary: 'Trigger Gemini Multimodal Invoice OCR' },
  { id: 'verifyReleaseRequest', category: 'RELEASES', method: 'POST', path: '/release-requests/:id/verify', summary: 'Audit Invoice Line-Items Against Group Orders' },
  { id: 'submitApproval', category: 'RELEASES', method: 'POST', path: '/release-requests/:id/approvals', summary: 'Submit Member Consensus Sign-Off Vote' },
  { id: 'submitGroupApproval', category: 'RELEASES', method: 'POST', path: '/groups/:groupId/release-requests/:id/approvals', summary: 'Submit Member Consensus Vote (Group Alias)' },
  { id: 'getApprovals', category: 'RELEASES', method: 'GET', path: '/release-requests/:id/approvals', summary: 'List Recorded Votes and Consensus Quorum' },
  { id: 'triggerPayout', category: 'RELEASES', method: 'POST', path: '/release-requests/:id/payout', summary: 'Trigger PayPal Payout to Traveler on Quorum' },
  // Multi-Currency FX Domain
  { id: 'getFxRates', category: 'FX', method: 'GET', path: '/fx-rates', summary: 'Fetch Real-Time FX Conversion Rates' },
  { id: 'convertFxRate', category: 'FX', method: 'POST', path: '/fx-rates/convert', summary: 'Convert Currencies with Spot Rates' },
  // AI OCR, Receipts & Allocations Domain
  { id: 'aiExtractInvoice', category: 'AI_RECEIPTS', method: 'POST', path: '/ai/invoices/extract', summary: 'Gemini AI Multilingual Invoice OCR Extraction' },
  { id: 'aiExtractInvoiceAlias', category: 'AI_RECEIPTS', method: 'POST', path: '/ai/extract-invoice', summary: 'Gemini AI Multilingual OCR (Short Alias)' },
  { id: 'aiVerifyInvoice', category: 'AI_RECEIPTS', method: 'POST', path: '/ai/invoices/verify', summary: 'Gemini AI Arithmetic & Manifest Discrepancy Check' },
  { id: 'aiVerifyGroupInvoice', category: 'AI_RECEIPTS', method: 'POST', path: '/groups/:groupId/invoices/verify', summary: 'AI Verify Invoice Against Group Manifest' },
  { id: 'uploadReceipt', category: 'AI_RECEIPTS', method: 'POST', path: '/groups/:groupId/receipts', summary: 'Upload Final Store Receipt for Group Trip' },
  { id: 'getReceipts', category: 'AI_RECEIPTS', method: 'GET', path: '/groups/:groupId/receipts', summary: 'List All Trip Receipts with OCR Breakdown' },
  { id: 'allocateReceipts', category: 'AI_RECEIPTS', method: 'POST', path: '/groups/:groupId/receipts/allocate', summary: 'Auto-Allocate Goods & Shared Logistics per Vendor' },
  { id: 'setAllocations', category: 'AI_RECEIPTS', method: 'POST', path: '/groups/:groupId/allocations', summary: 'Save Member Cost Allocations to Ledger' },
  { id: 'getAllocations', category: 'AI_RECEIPTS', method: 'GET', path: '/groups/:groupId/allocations', summary: 'Get Final Vendor Allocations & Reconciliation' },
  // Settlement & Closure Domain
  { id: 'previewSettlement', category: 'SETTLEMENT', method: 'POST', path: '/groups/:groupId/settlement/preview', summary: 'Preview Net Owed / Refund Balances per Member' },
  { id: 'settleGroup', category: 'SETTLEMENT', method: 'POST', path: '/groups/:groupId/settlement', summary: 'Disburse PayPal Refunds and Close Escrow Pot' },
  { id: 'settleGroupAlias', category: 'SETTLEMENT', method: 'POST', path: '/groups/:groupId/settle', summary: 'Disburse PayPal Refunds (Short Alias)' },
  { id: 'getSettlement', category: 'SETTLEMENT', method: 'GET', path: '/groups/:groupId/settlement', summary: 'Get Cryptographic Audit Settlement Closure' },
];

export const api = {
  // System Root
  async getRoot(): Promise<{ message: string; version?: string }> {
    const res = await fetch(`${API_BASE}/`, { cache: 'no-store' });
    return handleResponse(res);
  },

  // 1. Groups & Orders
  async getGroups(): Promise<Group[]> {
    const res = await fetch(`${API_BASE}/groups`, { cache: 'no-store' });
    return handleResponse<Group[]>(res);
  },

  async getGroupById(id: string): Promise<Group> {
    const res = await fetch(`${API_BASE}/groups/${id}`, { cache: 'no-store' });
    return handleResponse<Group>(res);
  },

  async createGroup(data: {
    name: string;
    travelerName: string;
    travelerEmail: string;
    approvalThreshold?: number;
    sharedCostRule?: string;
    baseCurrency?: string;
    members?: Array<{
      name: string;
      email: string;
      contributionExpected: number;
      orders?: Array<{ item: string; quantity: number; budget: number }>;
    }>;
  }): Promise<Group> {
    const res = await fetch(`${API_BASE}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Group>(res);
  },

  async getCombinedOrders(groupId: string): Promise<{
    groupId: string;
    items: CombinedOrderItem[];
    totalGroupBudget: number;
    totalItemCount: number;
  }> {
    const res = await fetch(`${API_BASE}/groups/${groupId}/orders`, {
      cache: 'no-store',
    });
    return handleResponse(res);
  },

  async addMemberToGroup(
    groupId: string,
    data: {
      name: string;
      email: string;
      contributionExpected: number;
      orders?: Array<{ item: string; quantity: number; budget: number }>;
    }
  ) {
    const res = await fetch(`${API_BASE}/groups/${groupId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async addMemberOrders(
    groupId: string,
    memberId: string,
    orders: Array<{ item: string; quantity: number; budget: number }>
  ) {
    const res = await fetch(
      `${API_BASE}/groups/${groupId}/members/${memberId}/orders`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders }),
      }
    );
    return handleResponse(res);
  },

  // 2. Contributions, Pot & PayPal
  async createContributionOrder(
    groupId: string,
    memberId: string,
    amount: number,
    currency = 'USD'
  ) {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const returnUrl = `${origin}/paypal/return?groupId=${encodeURIComponent(groupId)}&memberId=${encodeURIComponent(memberId)}`;
    const cancelUrl = `${origin}/paypal/cancel?groupId=${encodeURIComponent(groupId)}`;

    const res = await fetch(
      `${API_BASE}/groups/${groupId}/members/${memberId}/contributions/orders`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          memberId,
          amount,
          currency,
          returnUrl,
          cancelUrl,
        }),
      }
    );
    const data = await handleResponse<any>(res);
    return {
      orderId: (data.paypalOrder?.id || data.orderId || data.contribution?.paypalOrderId) as string,
      status: (data.paypalOrder?.status || data.status) as string,
      approvalUrl: (data.paypalOrder?.approveUrl || data.approvalUrl) as string | undefined,
      contribution: data.contribution as Contribution,
    };
  },

  async createContributionOrderDirect(data: {
    groupId: string;
    memberId: string;
    amount: number;
    currency?: string;
  }) {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const returnUrl = `${origin}/paypal/return?groupId=${encodeURIComponent(data.groupId)}&memberId=${encodeURIComponent(data.memberId)}`;
    const cancelUrl = `${origin}/paypal/cancel?groupId=${encodeURIComponent(data.groupId)}`;

    const res = await fetch(`${API_BASE}/contributions/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        currency: data.currency || 'USD',
        returnUrl,
        cancelUrl,
      }),
    });
    const result = await handleResponse<any>(res);
    return {
      orderId: (result.paypalOrder?.id || result.orderId || result.contribution?.paypalOrderId) as string,
      status: (result.paypalOrder?.status || result.status) as string,
      approvalUrl: (result.paypalOrder?.approveUrl || result.approvalUrl) as string | undefined,
      contribution: result.contribution as Contribution,
    };
  },

  async captureContributionOrder(paypalOrderId: string) {
    const res = await fetch(
      `${API_BASE}/contributions/orders/${paypalOrderId}/capture`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return handleResponse(res);
  },

  async getGroupContributions(groupId: string): Promise<Contribution[]> {
    const res = await fetch(`${API_BASE}/groups/${groupId}/contributions`, {
      cache: 'no-store',
    });
    return handleResponse<Contribution[]>(res);
  },

  async getGroupLedger(groupId: string): Promise<{
    groupId: string;
    potBalance: number;
    entries: LedgerEntry[];
  }> {
    const res = await fetch(`${API_BASE}/groups/${groupId}/ledger`, {
      cache: 'no-store',
    });
    return handleResponse<{
      groupId: string;
      potBalance: number;
      entries: LedgerEntry[];
    }>(res);
  },

  async simulatePaypalWebhook(eventData: any) {
    const res = await fetch(`${API_BASE}/webhooks/paypal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    return handleResponse(res);
  },

  // 3. Staged Releases & Consensus Approvals
  async createReleaseRequest(groupId: string, formData: FormData): Promise<ReleaseRequest> {
    const res = await fetch(`${API_BASE}/groups/${groupId}/release-requests`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<ReleaseRequest>(res);
  },

  async createReleaseRequestDirect(formData: FormData): Promise<ReleaseRequest> {
    const res = await fetch(`${API_BASE}/release-requests`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<ReleaseRequest>(res);
  },

  async getReleaseRequests(groupId: string): Promise<ReleaseRequest[]> {
    const res = await fetch(`${API_BASE}/groups/${groupId}/release-requests`, {
      cache: 'no-store',
    });
    return handleResponse<ReleaseRequest[]>(res);
  },

  async getReleaseRequestById(id: string): Promise<ReleaseRequest> {
    const res = await fetch(`${API_BASE}/release-requests/${id}`, {
      cache: 'no-store',
    });
    return handleResponse<ReleaseRequest>(res);
  },

  getInvoiceDownloadUrl(id: string): string {
    return `${API_BASE}/release-requests/${id}/invoice`;
  },

  async extractInvoiceAi(id: string) {
    const res = await fetch(`${API_BASE}/release-requests/${id}/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(res);
  },

  async verifyReleaseRequest(id: string) {
    const res = await fetch(`${API_BASE}/release-requests/${id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse<ReleaseRequest>(res);
  },

  async submitApproval(
    releaseRequestId: string,
    data: { memberId: string; decision: 'APPROVED' | 'REJECTED'; comment?: string }
  ) {
    const res = await fetch(
      `${API_BASE}/release-requests/${releaseRequestId}/approvals`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    return handleResponse<{
      approval: Approval;
      approvalCount: number;
      approvalThreshold: number;
      isThresholdMet: boolean;
      releaseRequestStatus: string;
      payout?: { payoutBatchId: string; payoutItemId: string };
    }>(res);
  },

  async submitGroupApproval(
    groupId: string,
    releaseRequestId: string,
    data: { memberId: string; decision: 'APPROVED' | 'REJECTED'; comment?: string }
  ) {
    const res = await fetch(
      `${API_BASE}/groups/${groupId}/release-requests/${releaseRequestId}/approvals`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    return handleResponse(res);
  },

  async getApprovals(releaseRequestId: string): Promise<Approval[]> {
    const res = await fetch(
      `${API_BASE}/release-requests/${releaseRequestId}/approvals`,
      { cache: 'no-store' }
    );
    return handleResponse<Approval[]>(res);
  },

  async triggerPayout(releaseRequestId: string) {
    const res = await fetch(
      `${API_BASE}/release-requests/${releaseRequestId}/payout`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return handleResponse(res);
  },

  // 4. Multi-Currency FX Rates
  async getFxRates(baseCurrency = 'USD') {
    const res = await fetch(`${API_BASE}/fx-rates?baseCurrency=${baseCurrency}`, {
      cache: 'no-store',
    });
    return handleResponse<{
      baseCurrency: string;
      rateDate: string;
      rates: Record<string, number>;
    }>(res);
  },

  async convertFxRate(data: { amount: number; from: string; to: string }) {
    const res = await fetch(`${API_BASE}/fx-rates/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<{
      originalAmount: number;
      from: string;
      to: string;
      rate: number;
      convertedAmount: number;
    }>(res);
  },

  // 5. Multimodal AI OCR, Receipts & Allocations
  async aiExtractInvoice(formData: FormData) {
    const res = await fetch(`${API_BASE}/ai/invoices/extract`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async aiExtractInvoiceAlias(formData: FormData) {
    const res = await fetch(`${API_BASE}/ai/extract-invoice`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async aiVerifyInvoice(formData: FormData) {
    const res = await fetch(`${API_BASE}/ai/invoices/verify`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async aiVerifyGroupInvoice(groupId: string, formData: FormData) {
    const res = await fetch(`${API_BASE}/groups/${groupId}/invoices/verify`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },

  async getReceipts(groupId: string): Promise<Receipt[]> {
    const res = await fetch(`${API_BASE}/groups/${groupId}/receipts`, {
      cache: 'no-store',
    });
    return handleResponse<Receipt[]>(res);
  },

  async uploadReceipt(groupId: string, formData: FormData): Promise<Receipt> {
    const res = await fetch(`${API_BASE}/groups/${groupId}/receipts`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<Receipt>(res);
  },

  async allocateReceipts(
    groupId: string,
    data: {
      rule?: string;
      manualAllocations?: Array<{
        memberId: string;
        goodsTotal: number;
        sharedCostShare: number;
      }>;
    }
  ) {
    const res = await fetch(`${API_BASE}/groups/${groupId}/receipts/allocate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async setAllocations(
    groupId: string,
    data: {
      allocations: Array<{
        memberId: string;
        goodsTotal: number;
        sharedCostShare: number;
        netOwedOrRefund: number;
      }>;
    }
  ) {
    const res = await fetch(`${API_BASE}/groups/${groupId}/allocations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getAllocations(groupId: string): Promise<{
    groupId: string;
    allocations: Allocation[];
    potReconciliation: {
      totalContributions: number;
      totalGoodsAllocated: number;
      totalSharedCosts: number;
      totalSpend: number;
      potBalance: number;
    };
  }> {
    const res = await fetch(`${API_BASE}/groups/${groupId}/allocations`, {
      cache: 'no-store',
    });
    return handleResponse(res);
  },

  // 6. Settlement & Closure
  async previewSettlement(groupId: string, data: Record<string, any> = {}) {
    const res = await fetch(`${API_BASE}/groups/${groupId}/settlement/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async settleGroup(groupId: string, data: Record<string, any> = {}) {
    const res = await fetch(`${API_BASE}/groups/${groupId}/settlement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async settleGroupAlias(groupId: string, data: Record<string, any> = {}) {
    const res = await fetch(`${API_BASE}/groups/${groupId}/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getSettlement(groupId: string) {
    const res = await fetch(`${API_BASE}/groups/${groupId}/settlement`, {
      cache: 'no-store',
    });
    return handleResponse(res);
  },
};
