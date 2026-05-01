export type LpPoolProtocol = 'uniswap_v3' | 'uniswap_v4';

export interface LpPoolSummary {
  protocol: LpPoolProtocol;
  chainId: number;
  name: string;
  address: string;
  feeLabel?: string;
  reserveUsd?: number;
  liquidityUsd?: number;
  token0Symbol?: string;
  token1Symbol?: string;
}

export interface ListLpPoolsParams {
  chainId?: number;
  search?: string;
  limit?: number;
}
