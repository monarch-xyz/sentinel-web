import 'server-only';

import type {
  MorphoMarketSupplier,
  MorphoMarketSummary,
  MorphoVaultHolder,
  MorphoVaultSummary,
} from '@/lib/morpho-discovery/types';
import { normalizeMorphoMarketAssetSymbol } from '@/lib/morpho-discovery/market-utils';

const MORPHO_GRAPHQL_URL = 'https://api.morpho.org/graphql';

class MorphoDiscoveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MorphoDiscoveryError';
  }
}

const postMorphoGraphql = async <T>(query: string, variables: Record<string, unknown>) => {
  const response = await fetch(MORPHO_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new MorphoDiscoveryError(`Morpho API request failed (${response.status})`);
  }

  const payload = (await response.json()) as {
    data?: T;
    errors?: Array<{ message?: string }>;
  };

  if (payload.errors && payload.errors.length > 0) {
    const message = payload.errors.map((error) => error.message).filter(Boolean).join('; ');
    throw new MorphoDiscoveryError(message || 'Morpho API query failed.');
  }

  if (!payload.data) {
    throw new MorphoDiscoveryError('Morpho API returned no data.');
  }

  return payload.data;
};

const clampLimit = (value: number, max: number) => {
  if (!Number.isInteger(value) || value < 1) {
    return Math.min(20, max);
  }

  return Math.min(value, max);
};

const normalizeSearch = (value: string) => value.trim().toLowerCase();

const toBigIntString = (value: string | number | bigint | null | undefined) => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '0';
  }

  if (typeof value === 'bigint') {
    return value.toString();
  }

  return '0';
};

export const listMorphoVaults = async ({
  chainId = 1,
  limit = 20,
  search = '',
}: {
  chainId?: number;
  limit?: number;
  search?: string;
} = {}): Promise<MorphoVaultSummary[]> => {
  const data = await postMorphoGraphql<{
    vaults: {
      items: Array<{
        address: string;
        name: string;
        symbol: string;
        chain: { id: number };
        asset: { symbol: string; address: string };
        state: { totalAssetsUsd: number; totalAssets: string | number };
      }>;
    };
  }>(
    `
      query ListVaults($chainId: Int!) {
        vaults(
          first: 100
          orderBy: TotalAssetsUsd
          orderDirection: Desc
          where: { chainId_in: [$chainId] }
        ) {
          items {
            address
            name
            symbol
            chain { id }
            asset { symbol address }
            state { totalAssetsUsd totalAssets }
          }
        }
      }
    `,
    { chainId }
  );

  const normalizedSearch = normalizeSearch(search);
  const filtered = data.vaults.items.filter((vault) => {
    if (!normalizedSearch) {
      return true;
    }

    return [vault.name, vault.symbol, vault.asset.symbol, vault.address]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedSearch));
  });

  return filtered.slice(0, clampLimit(limit, 100)).map((vault) => ({
    address: vault.address,
    name: vault.name,
    symbol: vault.symbol,
    chainId: vault.chain.id,
    assetSymbol: vault.asset.symbol,
    assetAddress: vault.asset.address,
    totalAssetsUsd: vault.state.totalAssetsUsd,
    totalAssets: toBigIntString(vault.state.totalAssets),
  }));
};

export const listMorphoVaultHolders = async ({
  vaultAddress,
  chainId = 1,
  limit = 20,
}: {
  vaultAddress: string;
  chainId?: number;
  limit?: number;
}): Promise<MorphoVaultHolder[]> => {
  const data = await postMorphoGraphql<{
    vaultPositions: {
      items: Array<{
        user: { address: string };
        state: { shares: string | number };
      }>;
    };
  }>(
    `
      query ListVaultHolders($vaultAddress: String!, $chainId: Int!, $first: Int!) {
        vaultPositions(
          first: $first
          orderBy: Shares
          orderDirection: Desc
          where: { vaultAddress_in: [$vaultAddress], chainId_in: [$chainId] }
        ) {
          items {
            user { address }
            state { shares }
          }
        }
      }
    `,
    {
      vaultAddress,
      chainId,
      first: clampLimit(limit, 50),
    }
  );

  return data.vaultPositions.items.map((item) => ({
    address: item.user.address,
    shares: toBigIntString(item.state.shares),
  }));
};

export const listMorphoMarkets = async ({
  chainId = 1,
  limit = 20,
  search = '',
}: {
  chainId?: number;
  limit?: number;
  search?: string;
} = {}): Promise<MorphoMarketSummary[]> => {
  const data = await postMorphoGraphql<{
    markets: {
      items: Array<{
        marketId: string;
        loanAsset: { symbol: string | null } | null;
        collateralAsset: { symbol: string | null } | null;
        state: { supplyAssetsUsd: number; borrowAssetsUsd: number; utilization: number };
      }>;
    };
  }>(
    `
      query ListMarkets($chainId: Int!) {
        markets(
          first: 100
          orderBy: SupplyAssetsUsd
          orderDirection: Desc
          where: { chainId_in: [$chainId] }
        ) {
          items {
            marketId
            loanAsset { symbol }
            collateralAsset { symbol }
            state { supplyAssetsUsd borrowAssetsUsd utilization }
          }
        }
      }
    `,
    { chainId }
  );

  const normalizedItems = data.markets.items.map((market) => {
    const loanAssetSymbol = normalizeMorphoMarketAssetSymbol(
      market.loanAsset?.symbol,
      'Unknown loan asset'
    );
    const collateralAssetSymbol = normalizeMorphoMarketAssetSymbol(
      market.collateralAsset?.symbol,
      'No collateral'
    );

    return {
      marketId: market.marketId,
      loanAssetSymbol,
      collateralAssetSymbol,
      supplyAssetsUsd: market.state.supplyAssetsUsd,
      borrowAssetsUsd: market.state.borrowAssetsUsd,
      utilization: market.state.utilization,
    };
  });

  const normalizedSearch = normalizeSearch(search);
  const filtered = normalizedItems.filter((market) => {
    if (!normalizedSearch) {
      return true;
    }

    return [
      `${market.loanAssetSymbol}/${market.collateralAssetSymbol}`,
      market.loanAssetSymbol,
      market.collateralAssetSymbol,
      market.marketId,
    ]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedSearch));
  });

  return filtered.slice(0, clampLimit(limit, 100)).map((market) => ({
    marketId: market.marketId,
    chainId,
    loanAssetSymbol: market.loanAssetSymbol,
    collateralAssetSymbol: market.collateralAssetSymbol,
    supplyAssetsUsd: market.supplyAssetsUsd,
    borrowAssetsUsd: market.borrowAssetsUsd,
    utilization: market.utilization,
  }));
};

export const listMorphoMarketSuppliers = async ({
  marketId,
  chainId = 1,
  limit = 20,
}: {
  marketId: string;
  chainId?: number;
  limit?: number;
}): Promise<MorphoMarketSupplier[]> => {
  const data = await postMorphoGraphql<{
    marketPositions: {
      items: Array<{
        user: { address: string };
        state: { supplyShares: string | number; supplyAssetsUsd: number };
      }>;
    };
  }>(
    `
      query ListMarketSuppliers($marketId: String!, $chainId: Int!, $first: Int!) {
        marketPositions(
          first: $first
          orderBy: SupplyShares
          orderDirection: Desc
          where: { marketUniqueKey_in: [$marketId], chainId_in: [$chainId] }
        ) {
          items {
            user { address }
            state { supplyShares supplyAssetsUsd }
          }
        }
      }
    `,
    {
      marketId,
      chainId,
      first: clampLimit(limit, 50),
    }
  );

  return data.marketPositions.items.map((item) => ({
    address: item.user.address,
    supplyShares: toBigIntString(item.state.supplyShares),
    supplyAssetsUsd: item.state.supplyAssetsUsd,
  }));
};
