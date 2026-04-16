const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const normalizeBaseUrl = (value: string) => {
  const withScheme = /^[a-z][a-z\d+\-.]*:\/\//i.test(value) ? value : `http://${value}`;
  return trimTrailingSlash(new URL(withScheme).toString());
};

const getConfiguredMegabatApiBaseUrl = () => {
  if (process.env.MEGABAT_API_BASE_URL) {
    return process.env.MEGABAT_API_BASE_URL;
  }

  const fallbackEntry = Object.entries(process.env).find(
    ([key, value]) =>
      key.endsWith('_API_BASE_URL') &&
      key !== 'DELIVERY_BASE_URL' &&
      key !== 'MEGABAT_API_BASE_URL' &&
      !key.startsWith('NEXT_PUBLIC_') &&
      typeof value === 'string' &&
      value.length > 0
  );

  return fallbackEntry?.[1];
};

const inferDeliveryBaseUrl = () => {
  const megabatApiBase = getConfiguredMegabatApiBaseUrl() ?? 'http://localhost:3000/api/v1';
  return normalizeBaseUrl(megabatApiBase).replace(/\/api\/v1$/, '');
};

export const getDeliveryBaseUrl = () =>
  normalizeBaseUrl(process.env.DELIVERY_BASE_URL ?? inferDeliveryBaseUrl());

export const getDeliveryWebhookUrl = () => `${getDeliveryBaseUrl()}/webhook/deliver`;
