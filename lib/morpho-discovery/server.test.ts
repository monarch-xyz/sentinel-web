import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeMorphoMarketAssetSymbol } from './market-utils.ts';

test('normalizeMorphoMarketAssetSymbol keeps non-empty symbols', () => {
  assert.equal(normalizeMorphoMarketAssetSymbol('WETH', 'No collateral'), 'WETH');
});

test('normalizeMorphoMarketAssetSymbol falls back for null asset metadata', () => {
  assert.equal(normalizeMorphoMarketAssetSymbol(null, 'No collateral'), 'No collateral');
  assert.equal(normalizeMorphoMarketAssetSymbol(undefined, 'Unknown loan asset'), 'Unknown loan asset');
  assert.equal(normalizeMorphoMarketAssetSymbol('   ', 'No collateral'), 'No collateral');
});
