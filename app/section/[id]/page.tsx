'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, SectionData, GoldItem, CryptoItem, CashItem } from '@/lib/api';
import { money, pnlClass, pct } from '@/lib/format';

declare global { interface Window { Telegram?: { WebApp: { ready(): void; expand(): void; initData: string; BackButton: { show(): void; onClick(fn: () => void): void } } } } }

const LABELS: Record<string, string> = { gold: 'طلا', silver: 'نقره', coin: 'سکه', crypto: 'کریپتو', cash: 'نقد' };
const ICONS:  Record<string, string> = { gold: '🥇', silver: '🥈', coin: '🪙', crypto: '🔐', cash: '💵' };

export default function SectionPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<SectionData | null>(null);
  const [err,  setErr]  = useState('');

  useEffect(() => {
    let initData = '';
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready(); tg.expand();
      tg.BackButton.show();
      tg.BackButton.onClick(() => history.back());
      initData = tg.initData;
    }
    if (!initData) initData = process.env.NEXT_PUBLIC_DEV_INIT_DATA ?? '';
    if (!initData) { setErr('لطفاً از طریق تلگرام باز کنید'); return; }
    apiFetch<SectionData>(`/miniapp/section/${id}`, initData).then(setData).catch(() => setErr('خطا در بارگذاری'));
  }, [id]);

  if (err)   return <Center>{err}<br /><Link href="/">بازگشت</Link></Center>;
  if (!data) return <Center>در حال بارگذاری…</Center>;

  const { items, summary } = data;
  const isCash   = id === 'cash';
  const isCrypto = id === 'crypto';

  return (
    <div style={{ padding: '16px', maxWidth: '480px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none', fontSize: '20px' }}>‹</Link>
        <h1 style={{ margin: 0, fontSize: '18px' }}>{ICONS[id]} {LABELS[id] ?? id}</h1>
      </div>

      {/* Summary */}
      {!isCash && (
        <div className="card" style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '20px' }}>{money(summary.value ?? 0)} <span style={{ fontSize: '13px', fontWeight: 400 }}>تومان</span></div>
          {(summary.pnl ?? 0) !== 0 && (
            <div className={pnlClass(summary.pnl ?? 0)} style={{ fontSize: '14px', marginTop: '4px' }}>
              {pct(summary.pnl_pct ?? 0)} &nbsp;·&nbsp; {money(summary.pnl ?? 0)} تومان
            </div>
          )}
          {summary.total_grams && summary.total_grams > 0 && (
            <div className="hint" style={{ fontSize: '12px', marginTop: '4px' }}>جمع گرم: {summary.total_grams.toFixed(2)} گرم</div>
          )}
        </div>
      )}
      {isCash && (
        <div className="card" style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '20px' }}>{money(summary.total ?? 0)} <span style={{ fontSize: '13px', fontWeight: 400 }}>تومان</span></div>
        </div>
      )}

      {/* Item list */}
      {items.length === 0 ? (
        <div className="hint" style={{ textAlign: 'center', padding: '32px' }}>دارایی‌ای ثبت نشده</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.map((item) => (
            <div key={item.id} className="card">
              {!isCrypto && !isCash && <GoldRow item={item as GoldItem} />}
              {isCrypto  && <CryptoRow item={item as CryptoItem} />}
              {isCash    && <CashRow   item={item as CashItem} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GoldRow({ item }: { item: GoldItem }) {
  return (
    <>
      <div style={{ fontWeight: 600, marginBottom: '8px' }}>{item.label}{item.title ? ` — ${item.title}` : ''}</div>
      <Row label="خرید"       value={`${money(item.buy_value)} ت`} />
      <Row label="ارزش فعلی"  value={`${money(item.current_value)} ت`} />
      <Row label="سود/زیان"   value={`${money(item.pnl)} ت`} cls={pnlClass(item.pnl)} extra={pct(item.pnl_pct)} />
    </>
  );
}

function CryptoRow({ item }: { item: CryptoItem }) {
  return (
    <>
      <div style={{ fontWeight: 600, marginBottom: '8px' }}>{item.symbol}{item.title ? ` — ${item.title}` : ''}</div>
      <Row label="مقدار"       value={item.amount.toFixed(4)} />
      <Row label="قیمت خرید"  value={`${item.buy_price_usdt.toFixed(2)} USDT`} />
      <Row label="قیمت فعلی"  value={`${item.live_price_usdt.toFixed(2)} USDT`} />
      <Row label="ارزش خرید"  value={`${money(item.buy_value)} ت`} />
      <Row label="ارزش فعلی"  value={`${money(item.current_value)} ت`} />
      <Row label="سود/زیان"   value={`${money(item.pnl)} ت`} cls={pnlClass(item.pnl)} extra={pct(item.pnl_pct)} />
    </>
  );
}

function CashRow({ item }: { item: CashItem }) {
  return (
    <>
      <div style={{ fontWeight: 600 }}>{item.title || 'نقد'}</div>
      <div style={{ marginTop: '4px' }}>{money(item.amount)} <span className="hint">تومان</span></div>
    </>
  );
}

function Row({ label, value, cls, extra }: { label: string; value: string; cls?: string; extra?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '3px 0' }}>
      <span className="hint">{label}</span>
      <span className={cls}>{value}{extra ? ` (${extra})` : ''}</span>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>{children}</div>;
}
