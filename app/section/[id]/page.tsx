'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, apiDelete, SectionData, GoldItem, CryptoItem, CashItem } from '@/lib/api';
import { money, pnlClass, pct } from '@/lib/format';
import AddForm from './AddForm';

const LABELS: Record<string, string> = { gold: 'طلا', silver: 'نقره', coin: 'سکه', crypto: 'کریپتو', cash: 'نقد' };
const ICONS:  Record<string, string> = { gold: '🥇', silver: '🥈', coin: '🪙', crypto: '🔐', cash: '💵' };
const FK_CAT: Record<string, string> = { gold: 'gold', silver: 'gold', coin: 'gold', crypto: 'crypto', cash: 'cash' };

export default function SectionPage() {
  const { id } = useParams<{ id: string }>();
  const [data,      setData]      = useState<SectionData | null>(null);
  const [err,       setErr]       = useState('');
  const [initData,  setInitData]  = useState('');
  const [showAdd,   setShowAdd]   = useState(false);
  const [deleting,  setDeleting]  = useState<number | null>(null);

  const load = useCallback((iData: string) => {
    apiFetch<SectionData>(`/miniapp/section/${id}`, iData)
      .then(setData)
      .catch(() => setErr('خطا در بارگذاری'));
  }, [id]);

  useEffect(() => {
    let iData = '';
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready(); tg.expand();
      tg.BackButton.show();
      tg.BackButton.onClick(() => history.back());
      iData = tg.initData;
    }
    if (!iData) iData = process.env.NEXT_PUBLIC_DEV_INIT_DATA ?? '';
    if (!iData) { setErr('لطفاً از طریق تلگرام باز کنید'); return; }
    setInitData(iData);
    load(iData);
  }, [load]);

  async function handleDelete(itemId: number) {
    if (!confirm('حذف شود؟')) return;
    setDeleting(itemId);
    try {
      await apiDelete(`/miniapp/asset/${FK_CAT[id]}/${itemId}`, initData);
      load(initData);
    } catch {
      alert('خطا در حذف');
    } finally {
      setDeleting(null);
    }
  }

  if (err)   return <Center>{err}<br /><Link href="/">بازگشت</Link></Center>;
  if (!data) return <Center>در حال بارگذاری…</Center>;

  const { items, summary } = data;
  const isCash   = id === 'cash';
  const isCrypto = id === 'crypto';

  return (
    <div style={{ padding: '16px', maxWidth: '480px', margin: '0 auto', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link href="/" style={{ color: 'var(--tg-hint)', textDecoration: 'none', fontSize: '22px', lineHeight: 1 }}>‹</Link>
          <h1 style={{ margin: 0, fontSize: '18px' }}>{ICONS[id]} {LABELS[id] ?? id}</h1>
        </div>
        <button onClick={() => setShowAdd(true)} style={addBtn}>+ افزودن</button>
      </div>

      {/* Summary */}
      {!isCash && summary.value != null && (
        <div className="card" style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '20px' }}>
            {money(summary.value)} <span style={{ fontSize: '13px', fontWeight: 400 }}>تومان</span>
          </div>
          {(summary.pnl ?? 0) !== 0 && (
            <div className={pnlClass(summary.pnl!)} style={{ fontSize: '14px', marginTop: '4px' }}>
              {pct(summary.pnl_pct!)} &nbsp;·&nbsp; {money(summary.pnl!)} تومان
            </div>
          )}
          {summary.total_grams ? (
            <div className="hint" style={{ fontSize: '12px', marginTop: '4px' }}>
              {summary.total_grams.toFixed(2)} گرم
            </div>
          ) : null}
        </div>
      )}
      {isCash && (
        <div className="card" style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '20px' }}>{money(summary.total ?? 0)} <span style={{ fontSize: '13px', fontWeight: 400 }}>تومان</span></div>
        </div>
      )}

      {/* Items */}
      {items.length === 0 ? (
        <div className="hint" style={{ textAlign: 'center', padding: '40px' }}>دارایی‌ای ثبت نشده</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.map(item => (
            <div key={item.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  {!isCrypto && !isCash && <GoldRow item={item as GoldItem} />}
                  {isCrypto  && <CryptoRow item={item as CryptoItem} />}
                  {isCash    && <CashRow   item={item as CashItem} />}
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting === item.id}
                  style={trashBtn}
                  title="حذف"
                >
                  {deleting === item.id ? '…' : '🗑'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add form bottom sheet */}
      {showAdd && initData && (
        <AddForm
          section={id}
          initData={initData}
          onDone={() => { setShowAdd(false); load(initData); }}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}

function GoldRow({ item }: { item: GoldItem }) {
  return (
    <>
      <div style={{ fontWeight: 600, marginBottom: '8px' }}>{item.label}{item.title ? ` — ${item.title}` : ''}</div>
      <Row label="خرید"      value={`${money(item.buy_value)} ت`} />
      <Row label="ارزش فعلی" value={`${money(item.current_value)} ت`} />
      <Row label="سود/زیان"  value={`${money(item.pnl)} ت`} cls={pnlClass(item.pnl)} extra={pct(item.pnl_pct)} />
    </>
  );
}

function CryptoRow({ item }: { item: CryptoItem }) {
  return (
    <>
      <div style={{ fontWeight: 600, marginBottom: '8px' }}>{item.symbol}{item.title ? ` — ${item.title}` : ''}</div>
      <Row label="مقدار"      value={item.amount.toFixed(4)} />
      <Row label="قیمت خرید" value={`${item.buy_price_usdt.toFixed(2)} USDT`} />
      <Row label="قیمت فعلی" value={`${item.live_price_usdt.toFixed(2)} USDT`} />
      <Row label="ارزش خرید" value={`${money(item.buy_value)} ت`} />
      <Row label="ارزش فعلی" value={`${money(item.current_value)} ت`} />
      <Row label="سود/زیان"  value={`${money(item.pnl)} ت`} cls={pnlClass(item.pnl)} extra={pct(item.pnl_pct)} />
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
  return (
    <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
      {children}
    </div>
  );
}

const addBtn: React.CSSProperties = {
  background: 'var(--tg-button, #2b5278)', color: 'var(--tg-button-text, #fff)',
  border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '14px',
  fontFamily: 'inherit', cursor: 'pointer',
};
const trashBtn: React.CSSProperties = {
  background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer',
  padding: '4px 0 4px 4px', color: 'var(--tg-hint)', flexShrink: 0,
};
