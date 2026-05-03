const BASE  = process.env.NEXT_PUBLIC_API_URL ?? '';
const PROXY = process.env.NEXT_PUBLIC_API_PROXY ?? '';

function buildUrl(path: string): string {
  const target = `${BASE}/api${path}`;
  return PROXY ? `${PROXY}/${encodeURIComponent(target)}` : target;
}

async function req<T>(method: string, path: string, initData: string, body?: unknown): Promise<T> {
  const res = await fetch(buildUrl(path), {
    method,
    headers: { 'X-Init-Data': initData, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const apiFetch = <T>(path: string, initData: string) =>
  req<T>('GET', path, initData);

export const apiPost = <T>(path: string, initData: string, body: unknown) =>
  req<T>('POST', path, initData, body);

export const apiDelete = (path: string, initData: string) =>
  req<void>('DELETE', path, initData);

// ---- Types ----

export interface Prices {
  gold: number; silver: number; usdt: number;
  coin_tamam: number; coin_nim: number; coin_rob: number;
}

export interface SectionSummary {
  invested: number; value: number; pnl: number; pnl_pct: number;
}

export interface SummaryData {
  prices: Prices;
  sections: Record<string, SectionSummary>;
  total: SectionSummary;
}

export interface GoldItem {
  id: number; type: string; label: string; amount: number;
  buy_price: number; buy_value: number; current_value: number;
  pnl: number; pnl_pct: number; title: string; purchase_time: string;
}

export interface CryptoItem {
  id: number; symbol: string; title: string; amount: number;
  buy_price_usdt: number; buy_usdt_rate: number;
  live_price_usdt: number; usdt_rate: number;
  buy_value: number; current_value: number;
  pnl: number; pnl_pct: number; purchase_time: string;
}

export interface CashItem {
  id: number; title: string; amount: number; purchase_time: string;
}

export interface SectionData {
  items: (GoldItem | CryptoItem | CashItem)[];
  summary: SectionSummary & { total_grams?: number; total?: number };
}

export interface AddAssetPayload {
  category: string;
  type?: string;
  symbol?: string;
  amount?: number;
  buy_price?: number;
  buy_usdt_rate?: number;
  title?: string;
  purchase_time?: string;
}
