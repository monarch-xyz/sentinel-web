import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AGENT_GUIDE_RESOURCES,
  ASSISTED_PROTOCOL_EXAMPLES,
  ASSISTED_VAULT_EXAMPLES,
  CREATE_SIGNAL_PERSONAS,
  HUMAN_SIGNAL_CATEGORIES,
  getCreateSignalPersona,
  getHumanSignalCategory,
} from './create-flow-catalog';

test('create-flow personas stay explicit and ordered', () => {
  assert.deepEqual(
    CREATE_SIGNAL_PERSONAS.map((option) => option.id),
    ['human', 'agent']
  );
  assert.ok(CREATE_SIGNAL_PERSONAS.every((option) => option.summary.length > 0 && option.helpText.length > 0));
});

test('human categories stay split between vaults, protocols, and tokens', () => {
  assert.deepEqual(
    HUMAN_SIGNAL_CATEGORIES.map((option) => option.id),
    ['vaults', 'protocols', 'tokens']
  );
  assert.ok(HUMAN_SIGNAL_CATEGORIES.every((option) => option.summary.length > 0 && option.helpText.length > 0));
});

test('vault examples keep Morpho and Euler live while Aave remains staged', () => {
  const liveVaults = ASSISTED_VAULT_EXAMPLES.filter((option) => option.status === 'live').map((option) => option.id);
  const stagedVaults = ASSISTED_VAULT_EXAMPLES.filter((option) => option.status === 'coming-soon').map((option) => option.id);

  assert.deepEqual(liveVaults, ['morpho', 'euler']);
  assert.deepEqual(stagedVaults, ['aave-v3']);
});

test('protocol examples expose Morpho markets and Uniswap LP pools', () => {
  assert.deepEqual(
    ASSISTED_PROTOCOL_EXAMPLES.map((option) => option.id),
    ['morpho-markets', 'uniswap-lp-pools']
  );
  assert.ok(ASSISTED_PROTOCOL_EXAMPLES.every((option) => option.summary.length > 0 && option.helpText.length > 0));
});

test('agent route keeps docs resources available', () => {
  assert.equal(AGENT_GUIDE_RESOURCES.length, 3);
  assert.ok(AGENT_GUIDE_RESOURCES.every((resource) => resource.href.length > 0));
  assert.ok(AGENT_GUIDE_RESOURCES.every((resource) => resource.helpText.length > 0));
});

test('catalog lookups resolve stable ids', () => {
  assert.equal(getCreateSignalPersona('human').title.length > 0, true);
  assert.equal(getHumanSignalCategory('vaults').title, 'Vaults');
});
