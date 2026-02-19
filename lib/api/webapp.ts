import { createApiClient } from '@/lib/api/client';

const webappBaseUrl = process.env.NEXT_PUBLIC_WEBAPP_API_BASE_URL ?? '';

export const webappClient = createApiClient({
  baseUrl: webappBaseUrl,
});
