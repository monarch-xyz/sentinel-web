const DEFAULT_TELEGRAM_BOT_HANDLE = 'sentinel_beta_bot';

const normalizeTelegramBotHandle = (value: string | undefined) => {
  const normalized = value?.trim().replace(/^@/, '');
  return normalized || DEFAULT_TELEGRAM_BOT_HANDLE;
};

export const telegramBotHandle = normalizeTelegramBotHandle(process.env.NEXT_PUBLIC_TELEGRAM_BOT_HANDLE);
export const telegramBotLabel = `@${telegramBotHandle}`;
export const telegramBotUrl = `https://t.me/${telegramBotHandle}`;
