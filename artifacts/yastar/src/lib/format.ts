export function formatIDR(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export const TIER_LABELS: Record<string, string> = {
  free: 'Gratis',
  starter: 'Starter',
  professional: 'Professional',
};

export const BUSINESS_TYPE_LABELS: Record<string, string> = {
  barbershop: 'Barbershop',
  salon: 'Salon',
  nail: 'Nail Studio',
  spa: 'Spa',
  custom: 'Lainnya',
};

export const COMMISSION_MODEL_LABELS: Record<string, string> = {
  flat: 'Persentase Flat',
  base_plus_commission: 'Gaji Pokok + Komisi',
  tiered: 'Komisi Bertingkat',
};
