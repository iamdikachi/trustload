export function formatMoney(
  amount: number | string | null | undefined,
  currency: string = 'USD',
  minimumFractionDigits: number = 2
): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return `${currency} 0.00`;
  }
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits,
      maximumFractionDigits: 2,
    }).format(num);
  }
  
  if (currency === 'NGN') {
    return `₦${new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(num))}`;
  }

  return `${currency} ${new Intl.NumberFormat('en-US', {
    minimumFractionDigits,
    maximumFractionDigits: 2,
  }).format(num)}`;
}

export function formatDualCurrency(
  amountUsd: number | string | null | undefined,
  fxRateNgn: number = 1500
): { usd: string; ngn: string } {
  const num = typeof amountUsd === 'string' ? parseFloat(amountUsd) : (amountUsd ?? 0);
  const ngnVal = num * fxRateNgn;
  return {
    usd: formatMoney(num, 'USD'),
    ngn: formatMoney(ngnVal, 'NGN'),
  };
}

export function formatDate(dateStr?: string | Date | null): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return String(dateStr);
  }
}

export function getStatusBadge(status: string): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case 'ACTIVE':
      return { label: 'Active Trip', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' };
    case 'FUNDING':
      return { label: 'Funding Pot', bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' };
    case 'SETTLING':
      return { label: 'Settling', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' };
    case 'CLOSED':
      return { label: 'Closed / Settled', bg: 'bg-zinc-100 dark:bg-zinc-800', text: 'text-zinc-600 dark:text-zinc-300', border: 'border-zinc-300 dark:border-zinc-700' };
    case 'COMPLETED':
    case 'RELEASED':
    case 'APPROVED':
      return { label: status, bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' };
    case 'AWAITING_APPROVAL':
      return { label: 'Awaiting Approval', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' };
    case 'PENDING':
    case 'PENDING_VERIFICATION':
      return { label: 'Pending Verification', bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-800' };
    case 'REJECTED':
    case 'FAILED':
      return { label: status, bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' };
    default:
      return { label: status, bg: 'bg-zinc-100 dark:bg-zinc-800', text: 'text-zinc-700 dark:text-zinc-300', border: 'border-zinc-200 dark:border-zinc-700' };
  }
}
