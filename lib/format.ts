export function money(n: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(n));
}

export function pnlClass(n: number): string {
  return n >= 0 ? 'positive' : 'negative';
}

export function pct(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
}

/** Normalize Persian/Arabic-Indic digits to ASCII */
export function normalizeNum(s: string): string {
  return s.replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 0x06f0))
          .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x0660));
}

export function parseNum(s: string): number {
  return parseFloat(normalizeNum(s).replace(/,/g, '')) || 0;
}
