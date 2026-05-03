'use client';

import { useState } from 'react';
import { apiPost, AddAssetPayload } from '@/lib/api';
import { parseNum } from '@/lib/format';

interface Props {
  section: string;
  initData: string;
  onDone: () => void;
  onClose: () => void;
}

const COIN_TYPES = [
  { value: 'tamam', label: 'سکه تمام' },
  { value: 'nim',   label: 'نیم سکه' },
  { value: 'rob',   label: 'ربع سکه' },
];

export default function AddForm({ section, initData, onDone, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState('');

  const [f, setF] = useState({
    type: 'tamam', symbol: '', amount: '', buy_price: '',
    buy_usdt_rate: '', title: '', purchase_time: '',
  });

  const set = (k: string, v: string) => setF(p => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const payload: AddAssetPayload = { category: section };
      const amt = parseNum(f.amount);
      const bp  = parseNum(f.buy_price);

      if (amt <= 0) { setErr('مقدار را وارد کنید'); setLoading(false); return; }
      if (bp  <= 0 && section !== 'cash') { setErr('قیمت خرید را وارد کنید'); setLoading(false); return; }

      if (section === 'gold' || section === 'silver') {
        payload.amount    = amt;
        payload.buy_price = bp;
      } else if (section === 'coin') {
        payload.type      = f.type;
        payload.amount    = amt;
        payload.buy_price = bp;
      } else if (section === 'crypto') {
        if (!f.symbol.trim()) { setErr('نماد ارز را وارد کنید'); setLoading(false); return; }
        payload.symbol        = f.symbol.trim().toUpperCase();
        payload.amount        = amt;
        payload.buy_price     = bp;
        payload.buy_usdt_rate = parseNum(f.buy_usdt_rate);
      } else if (section === 'cash') {
        if (amt <= 0) { setErr('مبلغ را وارد کنید'); setLoading(false); return; }
        payload.amount = amt;
      }

      if (f.title.trim())         payload.title         = f.title.trim();
      if (f.purchase_time.trim()) payload.purchase_time = f.purchase_time + ':00';

      await apiPost('/miniapp/asset', initData, payload);
      onDone();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'خطا');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={sheet} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <strong>افزودن دارایی</strong>
          <button onClick={onClose} style={btnReset}>✕</button>
        </div>

        <form onSubmit={submit}>
          {/* Coin type selector */}
          {section === 'coin' && (
            <Field label="نوع سکه">
              <select value={f.type} onChange={e => set('type', e.target.value)} style={input}>
                {COIN_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
          )}

          {/* Crypto symbol */}
          {section === 'crypto' && (
            <Field label="نماد ارز (مثال: BTC)">
              <input value={f.symbol} onChange={e => set('symbol', e.target.value)}
                placeholder="BTC" style={input} autoCapitalize="characters" />
            </Field>
          )}

          {/* Amount */}
          <Field label={section === 'cash' ? 'مبلغ (تومان)' : section === 'coin' ? 'تعداد' : 'مقدار'}>
            <input inputMode="decimal" value={f.amount} onChange={e => set('amount', e.target.value)}
              placeholder="0" style={input} />
          </Field>

          {/* Buy price */}
          {section !== 'cash' && (
            <Field label={section === 'crypto' ? 'قیمت خرید (USDT)' : section === 'coin' ? 'قیمت خرید (تومان)' : 'قیمت خرید (تومان/گرم)'}>
              <input inputMode="decimal" value={f.buy_price} onChange={e => set('buy_price', e.target.value)}
                placeholder="0" style={input} />
            </Field>
          )}

          {/* USDT rate for crypto */}
          {section === 'crypto' && (
            <Field label="نرخ دلار هنگام خرید (تومان)">
              <input inputMode="decimal" value={f.buy_usdt_rate} onChange={e => set('buy_usdt_rate', e.target.value)}
                placeholder="0" style={input} />
            </Field>
          )}

          {/* Title */}
          <Field label="توضیح (اختیاری)">
            <input value={f.title} onChange={e => set('title', e.target.value)}
              placeholder="..." style={input} />
          </Field>

          {/* Purchase time */}
          <Field label="تاریخ خرید (اختیاری)">
            <input type="datetime-local" value={f.purchase_time}
              onChange={e => set('purchase_time', e.target.value)} style={input} />
          </Field>

          {err && <div style={{ color: '#f4665c', fontSize: '13px', marginBottom: '12px' }}>{err}</div>}

          <button type="submit" disabled={loading}
            style={{ ...submitBtn, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'در حال ثبت…' : 'ثبت دارایی'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ fontSize: '12px', color: 'var(--tg-hint)', marginBottom: '4px' }}>{label}</div>
      {children}
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100,
  display: 'flex', alignItems: 'flex-end',
};
const sheet: React.CSSProperties = {
  background: 'var(--tg-secondary-bg)', width: '100%', borderRadius: '16px 16px 0 0',
  padding: '20px 16px 32px', maxHeight: '90vh', overflowY: 'auto',
};
const input: React.CSSProperties = {
  width: '100%', background: 'var(--tg-bg)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px', padding: '10px 12px', color: 'var(--tg-text)', fontSize: '15px',
  direction: 'ltr', textAlign: 'right',
};
const submitBtn: React.CSSProperties = {
  width: '100%', padding: '14px', background: 'var(--tg-button, #2b5278)',
  color: 'var(--tg-button-text, #fff)', border: 'none', borderRadius: '10px',
  fontSize: '16px', fontFamily: 'inherit', cursor: 'pointer', marginTop: '4px',
};
const btnReset: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--tg-hint)', fontSize: '18px', cursor: 'pointer',
};
