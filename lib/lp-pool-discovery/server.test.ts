import assert from 'node:assert/strict';
import test from 'node:test';
import { parseUniswapV3PoolsFromGecko } from '@/lib/lp-pool-discovery/server';

test('parseUniswapV3PoolsFromGecko keeps only uniswap v3 pools with valid addresses', () => {
  const parsed = parseUniswapV3PoolsFromGecko(
    {
      data: [
        {
          type: 'pool',
          attributes: {
            name: 'USDC / WETH 0.05%',
            address: '0x1111111111111111111111111111111111111111',
            reserve_in_usd: '12345.67',
          },
          relationships: {
            dex: { data: { id: 'eth_uniswap_v3', type: 'dex' } },
            base_token: { data: { id: 'eth_0xa0b...', type: 'token' } },
            quote_token: { data: { id: 'eth_0xc02...', type: 'token' } },
          },
        },
        {
          type: 'pool',
          attributes: {
            name: 'Other Dex Pool',
            address: '0x2222222222222222222222222222222222222222',
          },
          relationships: {
            dex: { data: { id: 'eth_sushiswap_v2', type: 'dex' } },
          },
        },
      ],
      included: [
        { type: 'token', id: 'eth_0xa0b...', attributes: { symbol: 'USDC' } },
        { type: 'token', id: 'eth_0xc02...', attributes: { symbol: 'WETH' } },
      ],
    },
    1,
    20
  );

  assert.equal(parsed.length, 1);
  assert.equal(parsed[0]?.protocol, 'uniswap_v3');
  assert.equal(parsed[0]?.feeLabel, '0.05%');
  assert.equal(parsed[0]?.token0Symbol, 'USDC');
  assert.equal(parsed[0]?.token1Symbol, 'WETH');
  assert.equal(parsed[0]?.reserveUsd, 12345.67);
});
