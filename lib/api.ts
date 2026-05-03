const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export async function apiFetch<T>(path: string, initData: string): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { 'X-Init-Data': initData },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

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
