export function money(n: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(n));
}

export function pnlClass(n: number): string {
  return n >= 0 ? 'positive' : 'negative';
}

export function pnlSign(n: number): string {
  return n >= 0 ? '+' : '';
}

export function pct(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
}
