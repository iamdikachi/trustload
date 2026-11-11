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

export const api = {
  // Groups
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
    return handleResponse<{
      groupId: string;
      items: CombinedOrderItem[];
      totalGroupBudget: number;
      totalItemCount: number;
    }>(res);
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

  // Contributions & Ledger
  async createContributionOrder(
    groupId: string,
    memberId: string,
    amount: number,
    currency = 'USD'
  ) {
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
          returnUrl: 'http://localhost:3000/paypal/return',
          cancelUrl: 'http://localhost:3000/paypal/cancel',
        }),
      }
    );
    return handleResponse<{
      orderId: string;
      status: string;
      approvalUrl?: string;
      contribution: Contribution;
    }>(res);
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

  // Staged Releases & Approvals
  async getReleaseRequests(groupId: string): Promise<ReleaseRequest[]> {
    const res = await fetch(`${API_BASE}/groups/${groupId}/release-requests`, {
      cache: 'no-store',
    });
    return handleResponse<ReleaseRequest[]>(res);
  },

  async createReleaseRequest(groupId: string, formData: FormData): Promise<ReleaseRequest> {
    const res = await fetch(`${API_BASE}/groups/${groupId}/release-requests`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<ReleaseRequest>(res);
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

  // FX Rates
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

  // Final Receipts & Allocation
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

  // Settlement & Refunds
  async previewSettlement(groupId: string) {
    const res = await fetch(`${API_BASE}/groups/${groupId}/settlement/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    return handleResponse(res);
  },

  async settleGroup(groupId: string) {
    const res = await fetch(`${API_BASE}/groups/${groupId}/settlement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
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
