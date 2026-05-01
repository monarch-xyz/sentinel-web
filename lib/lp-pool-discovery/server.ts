import 'server-only';

import type { LpPoolSummary, ListLpPoolsParams } from '@/lib/lp-pool-discovery/types';

const GECKO_TERMINAL_API_BASE = 'https://api.geckoterminal.com/api/v2';
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const ETH_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;

interface GeckoSearchPool {
  id?: string;
  type?: string;
  attributes?: {
    name?: string;
    address?: string;
    reserve_in_usd?: string;
    market_cap_usd?: string | null;
  };
  relationships?: {
    dex?: { data?: { id?: string; type?: string } | null };
    base_token?: { data?: { id?: string; type?: string } | null };
    quote_token?: { data?: { id?: string; type?: string } | null };
  };
}

interface GeckoIncludedResource {
  id?: string;
  type?: string;
  attributes?: {
    symbol?: string;
  };
}

interface GeckoSearchResponse {
  data?: GeckoSearchPool[];
  included?: GeckoIncludedResource[];
}

export class LpPoolDiscoveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LpPoolDiscoveryError';
  }
}

const clampLimit = (value: number | undefined) => {
  if (!Number.isInteger(value) || !value || value < 1) {
    return DEFAULT_LIMIT;
  }

  return Math.min(value, MAX_LIMIT);
};

const getNetworkSlug = (chainId: number) => {
  if (chainId === 1) {
    return 'eth';
  }
  return null;
};

const parseUsd = (value: string | undefined) => {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
};

const parseFeeLabelFromName = (name: string) => {
  const feeMatch = name.match(/\b(\d+(?:\.\d+)?)%\b/);
  if (!feeMatch) {
    return undefined;
  }

  return `${feeMatch[1]}%`;
};

const buildTokenSymbolMap = (included: GeckoIncludedResource[] | undefined) => {
  const symbolMap = new Map<string, string>();
  for (const resource of included ?? []) {
    if (resource.type !== 'token') {
      continue;
    }
    const symbol = resource.attributes?.symbol?.trim();
    if (!symbol || !resource.id) {
      continue;
    }
    symbolMap.set(resource.id, symbol);
  }
  return symbolMap;
};

export const parseUniswapV3PoolsFromGecko = (
  payload: GeckoSearchResponse,
  chainId: number,
  limit: number
): LpPoolSummary[] => {
  const symbolMap = buildTokenSymbolMap(payload.included);
  const items: LpPoolSummary[] = [];

  for (const raw of payload.data ?? []) {
    if (raw.type !== 'pool') {
      continue;
    }

    const dexId = raw.relationships?.dex?.data?.id ?? '';
    if (!dexId.includes('uniswap_v3')) {
      continue;
    }

    const address = raw.attributes?.address?.toLowerCase() ?? '';
    if (!ETH_ADDRESS_PATTERN.test(address)) {
      continue;
    }

    const name = raw.attributes?.name?.trim() || `Pool ${address.slice(0, 8)}`;
    const baseTokenId = raw.relationships?.base_token?.data?.id;
    const quoteTokenId = raw.relationships?.quote_token?.data?.id;

    items.push({
      protocol: 'uniswap_v3',
      chainId,
      name,
      address,
      feeLabel: parseFeeLabelFromName(name),
      reserveUsd: parseUsd(raw.attributes?.reserve_in_usd),
      token0Symbol: baseTokenId ? symbolMap.get(baseTokenId) : undefined,
      token1Symbol: quoteTokenId ? symbolMap.get(quoteTokenId) : undefined,
    });

    if (items.length >= limit) {
      break;
    }
  }

  return items;
};

export const listLpPools = async ({
  chainId = 1,
  search = '',
  limit = DEFAULT_LIMIT,
}: ListLpPoolsParams = {}): Promise<LpPoolSummary[]> => {
  const network = getNetworkSlug(chainId);
  if (!network) {
    return [];
  }

  const normalizedLimit = clampLimit(limit);
  const query = search.trim() || 'USDC WETH';
  const endpoint = `${GECKO_TERMINAL_API_BASE}/search/pools?query=${encodeURIComponent(query)}&network=${network}&include=dex,base_token,quote_token`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'User-Agent': 'iruka-web-lp-discovery/1.0',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new LpPoolDiscoveryError(`LP pool search failed (${response.status})`);
  }

  const payload = (await response.json()) as GeckoSearchResponse;
  return parseUniswapV3PoolsFromGecko(payload, chainId, normalizedLimit);
};
