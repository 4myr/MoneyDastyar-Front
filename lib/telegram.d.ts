interface TelegramWebApp {
  ready(): void;
  expand(): void;
  initData: string;
  BackButton: {
    show(): void;
    hide(): void;
    onClick(fn: () => void): void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}

export {};
