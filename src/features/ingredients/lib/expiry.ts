/** Shared expiry helpers for pantry items. */

export function isExpired(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso) < new Date(new Date().toDateString());
}

export function isExpiringSoon(iso: string | null, withinDays = 7): boolean {
  if (!iso) return false;
  const diff = new Date(iso).getTime() - Date.now();
  return diff >= 0 && diff <= withinDays * 24 * 60 * 60 * 1000;
}

export function daysUntilExpiry(iso: string | null): number | null {
  if (!iso) return null;
  const target = new Date(iso);
  const today = new Date(new Date().toDateString());
  return Math.ceil((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

export function expiryLabel(iso: string | null, labels: {
  noDate: string;
  expired: string;
  today: string;
  tomorrow: string;
  inDays: (count: number) => string;
}): string {
  if (!iso) return labels.noDate;
  const days = daysUntilExpiry(iso);
  if (days === null) return labels.noDate;
  if (days < 0) return labels.expired;
  if (days === 0) return labels.today;
  if (days === 1) return labels.tomorrow;
  return labels.inDays(days);
}
