export type Platform = 'telegram' | 'bale';

export interface WebAppLike {
  initData: string;
  ready(): void;
  expand(): void;
  BackButton: { show(): void; hide(): void; onClick(fn: () => void): void };
}

export function getWebApp(): { webapp: WebAppLike; platform: Platform } | null {
  if (typeof window === 'undefined') return null;
  if (window.Telegram?.WebApp?.initData) return { webapp: window.Telegram.WebApp, platform: 'telegram' };
  if (window.Bale?.WebApp?.initData)     return { webapp: window.Bale.WebApp,     platform: 'bale' };
  return null;
}
