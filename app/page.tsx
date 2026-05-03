'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch, SummaryData, SectionSummary } from '@/lib/api';
import { money, pnlClass, pct } from '@/lib/format';

declare global { interface Window { Telegram?: { WebApp: { ready(): void; expand(): void; initData: string } } } }

const SECTIONS = [
  { id: 'gold',   label: 'طلا',    icon: '🥇' },
  { id: 'silver', label: 'نقره',   icon: '🥈' },
  { id: 'coin',   label: 'سکه',    icon: '🪙' },
  { id: 'crypto', label: 'کریپتو', icon: '🔐' },
  { id: 'cash',   label: 'نقد',    icon: '💵' },
];

export default function Dashboard() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [err,  setErr]  = useState('');

  useEffect(() => {
    let initData = '';
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready(); tg.expand();
      initData = tg.initData;
    }
    if (!initData) initData = process.env.NEXT_PUBLIC_DEV_INIT_DATA ?? '';
    if (!initData) { setErr('لطفاً از طریق تلگرام باز کنید'); return; }
    apiFetch<SummaryData>('/miniapp/summary', initData).then(setData).catch(() => setErr('خطا در بارگذاری'));
  }, []);

  if (err)   return <Center>{err}</Center>;
  if (!data) return <Center>در حال بارگذاری…</Center>;

  const { total, sections, prices } = data;

  return (
    <div style={{ padding: '16px', maxWidth: '480px', margin: '0 auto' }}>

      {/* Total card */}
      <div className="card" style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div className="hint" style={{ fontSize: '13px', marginBottom: '4px' }}>ارزش کل دارایی</div>
        <div style={{ fontSize: '24px', fontWeight: 700 }}>{money(total.value)} <span style={{ fontSize: '14px', fontWeight: 400 }}>تومان</span></div>
        <div className={pnlClass(total.pnl)} style={{ fontSize: '14px', marginTop: '6px' }}>
          {pct(total.pnl_pct)} &nbsp;·&nbsp; {money(total.pnl)} تومان
        </div>
        <div className="hint" style={{ fontSize: '12px', marginTop: '4px' }}>سرمایه‌گذاری: {money(total.invested)} تومان</div>
      </div>

      {/* Section cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        {SECTIONS.map(({ id, label, icon }) => {
          const s: SectionSummary = sections[id] ?? { invested: 0, value: 0, pnl: 0, pnl_pct: 0 };
          return (
            <Link key={id} href={`/section/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ cursor: 'pointer' }}>
                <div style={{ marginBottom: '6px' }}>{icon} <strong>{label}</strong></div>
                <div style={{ fontWeight: 600 }}>{money(s.value)}</div>
                <div className="hint" style={{ fontSize: '11px' }}>تومان</div>
                {s.invested > 0 && (
                  <div className={pnlClass(s.pnl)} style={{ fontSize: '12px', marginTop: '4px' }}>
                    {pct(s.pnl_pct)}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Live prices */}
      <div className="card">
        <div style={{ fontWeight: 600, marginBottom: '10px' }}>📊 قیمت لحظه‌ای</div>
        {[
          ['طلا ۱۸ عیار',  `${money(prices.gold)} ت/گرم`],
          ['سکه تمام',     `${money(prices.coin_tamam)} ت`],
          ['نیم سکه',      `${money(prices.coin_nim)} ت`],
          ['ربع سکه',      `${money(prices.coin_rob)} ت`],
          ['نقره',         `${money(prices.silver)} ت/گرم`],
          ['دلار (USDT)',  `${money(prices.usdt)} ت`],
        ].map(([l, v]) => (
          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="hint">{l}</span><span>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center' }}>{children}</div>;
}
