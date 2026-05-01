import assert from 'node:assert/strict';
import test from 'node:test';
import type { CreateSignalRequest, SignalCondition, SignalDefinition } from '@/lib/types/signal';
import { SignalTemplateError, buildSignalTemplate, describeSignalDefinition } from './templates';

const assertDocCompatibleCondition = (condition: SignalCondition) => {
  if (condition.type === 'threshold' || condition.type === 'change') {
    const sourceCount = Number(Boolean(condition.metric)) + Number(Boolean(condition.state_ref)) + Number(Boolean(condition.source));
    assert.equal(sourceCount, 1, `${condition.type} must use exactly one numeric source`);
  }

  if (condition.type === 'raw-events') {
    if (condition.aggregation === 'count') {
      assert.equal(condition.field, undefined);
    } else {
      assert.ok(condition.field, 'raw-events conditions with non-count aggregation require field');
    }
  }

  if (condition.type === 'group') {
    assert.ok(condition.addresses.length > 0, 'group conditions require addresses');
    assert.ok(condition.conditions.length > 0, 'group conditions require nested conditions');
    condition.conditions.forEach(assertDocCompatibleCondition);
  }
};

const assertDocCompatibleTemplatePayload = (payload: CreateSignalRequest) => {
  assert.equal(payload.version, '1');
  assert.ok(payload.name, 'template payloads require name');
  assert.ok(payload.triggers.length > 0, 'template payloads require triggers');
  assert.ok(payload.definition.window.duration, 'template payloads require definition.window.duration');
  assert.ok(payload.definition.conditions.length > 0, 'template payloads require at least one condition');
  assert.deepEqual(payload.delivery, [{ type: 'telegram' }]);
  assert.ok(payload.metadata?.description, 'template payloads require metadata.description');
  assert.ok(payload.metadata?.repeat_policy, 'template payloads require metadata.repeat_policy');
  payload.definition.conditions.forEach(assertDocCompatibleCondition);
};

test('signal templates default to cooldown repeat policy', () => {
  const payload = buildSignalTemplate({
    templateId: 'single-whale-exit',
    marketId: '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
    whaleAddresses: ['0x1111111111111111111111111111111111111111'],
  });

  assert.deepEqual(payload.metadata?.repeat_policy, { mode: 'cooldown', cooldown_minutes: 15 });
  assert.deepEqual(payload.triggers, [
    {
      type: 'schedule',
      schedule: {
        kind: 'interval',
        interval_seconds: 300,
      },
    },
  ]);
});

test('signal templates can register a cron schedule', () => {
  const payload = buildSignalTemplate({
    templateId: 'single-whale-exit',
    marketId: '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
    whaleAddresses: ['0x1111111111111111111111111111111111111111'],
    schedule: {
      kind: 'cron',
      expression: '0 8 * * *',
    },
  });

  assert.deepEqual(payload.triggers, [
    {
      type: 'schedule',
      schedule: {
        kind: 'cron',
        expression: '0 8 * * *',
      },
    },
  ]);
});

test('signal templates reject malformed cron schedules', () => {
  assert.throws(
    () =>
      buildSignalTemplate({
        templateId: 'single-whale-exit',
        marketId: '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
        whaleAddresses: ['0x1111111111111111111111111111111111111111'],
        schedule: {
          kind: 'cron',
          expression: '0 8 * * * *',
        },
      }),
    SignalTemplateError
  );
});

test('whale movement templates stay compatible with the current Iruka docs schema', () => {
  const payload = buildSignalTemplate({
    templateId: 'whale-exit-pair',
    marketId: '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
    whaleAddresses: [
      '0x1111111111111111111111111111111111111111',
      '0x2222222222222222222222222222222222222222',
    ],
  });

  assertDocCompatibleTemplatePayload(payload);
  assert.deepEqual(payload.delivery, [{ type: 'telegram' }]);
  const groupCondition = payload.definition.conditions[0];
  assert.equal(groupCondition?.type, 'group');

  if (groupCondition?.type === 'group') {
    const changeCondition = groupCondition.conditions[0];
    assert.equal(changeCondition?.type, 'change');
    if (changeCondition?.type === 'change') {
      assert.equal(changeCondition.entity_id, '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41');
    }
  }
});

test('erc20 event aggregation templates stay compatible with the current Iruka docs schema', () => {
  const payload = buildSignalTemplate({
    templateId: 'erc20-event-aggregation-watch',
    tokenContract: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    fromAddress: '0x1111111111111111111111111111111111111111',
    toAddress: '0x2222222222222222222222222222222222222222',
  });

  assertDocCompatibleTemplatePayload(payload);
  const condition = payload.definition.conditions[0];
  assert.equal(condition.type, 'raw-events');
  if (condition.type === 'raw-events') {
    assert.equal(condition.aggregation, 'sum');
    assert.equal(condition.field, 'value');
    assert.deepEqual(condition.filters, [
      { field: 'from', op: 'eq', value: '0x1111111111111111111111111111111111111111' },
      { field: 'to', op: 'eq', value: '0x2222222222222222222222222222222222222222' },
    ]);
  }
});

test('erc20 balance templates support percent decreases', () => {
  const payload = buildSignalTemplate({
    templateId: 'erc20-balance-watch',
    tokenContract: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    watchedAddress: '0x1111111111111111111111111111111111111111',
    balanceDirection: 'decrease',
    thresholdMode: 'percent',
    percentThreshold: 20,
    windowDuration: '2h',
  });

  assertDocCompatibleTemplatePayload(payload);
  const condition = payload.definition.conditions[0];
  assert.equal(condition?.type, 'change');
  if (condition?.type === 'change') {
    assert.deepEqual(condition.source, { kind: 'alias', name: 'ERC20.Position.balance' });
    assert.equal(condition.direction, 'decrease');
    assert.deepEqual(condition.by, { percent: 20 });
    assert.equal(condition.contract_address, '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48');
    assert.equal(condition.address, '0x1111111111111111111111111111111111111111');
    assert.deepEqual(condition.window, { duration: '2h' });
  }
});

test('erc20 balance templates support absolute increases', () => {
  const payload = buildSignalTemplate({
    templateId: 'erc20-balance-watch',
    tokenContract: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    watchedAddress: '0x1111111111111111111111111111111111111111',
    balanceDirection: 'increase',
    thresholdMode: 'absolute',
    absoluteThreshold: '5000000',
    windowDuration: '6h',
  });

  const condition = payload.definition.conditions[0];
  assert.equal(condition?.type, 'change');
  if (condition?.type === 'change') {
    assert.equal(condition.direction, 'increase');
    assert.deepEqual(condition.by, { absolute: '5000000' });
    assert.deepEqual(condition.window, { duration: '6h' });
  }
});

test('describeSignalDefinition uses alias sources for threshold summaries', () => {
  const definition: SignalDefinition = {
    window: { duration: '5m' },
    conditions: [
      {
        type: 'threshold',
        source: { kind: 'alias', name: 'ERC20.Position.balance' },
        operator: '>',
        value: '100000000000000000000000',
        chain_id: 1,
        contract_address: '0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8',
        address: '0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8',
      },
    ],
  };

  assert.equal(describeSignalDefinition(definition), 'ERC20.Position.balance > 100000000000000000000000');
});

test('erc4626 withdraw templates stay compatible with the current Iruka docs schema', () => {
  const payload = buildSignalTemplate({
    templateId: 'erc4626-withdraw-percent-watch',
    vaultContract: '0x1111111111111111111111111111111111111111',
    ownerAddresses: [
      '0x2222222222222222222222222222222222222222',
      '0x3333333333333333333333333333333333333333',
      '0x4444444444444444444444444444444444444444',
    ],
  });

  assertDocCompatibleTemplatePayload(payload);
  assert.deepEqual(payload.delivery, [{ type: 'telegram' }]);
});

test('signal templates forward post-first-alert snooze repeat policy', () => {
  const payload = buildSignalTemplate({
    templateId: 'erc20-event-aggregation-watch',
    tokenContract: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    toAddress: '0x1111111111111111111111111111111111111111',
    repeatPolicy: {
      mode: 'post_first_alert_snooze',
      snooze_minutes: 1440,
    },
    cooldownMinutes: 15,
  });

  assert.deepEqual(payload.metadata?.repeat_policy, {
    mode: 'post_first_alert_snooze',
    snooze_minutes: 1440,
  });
});

test('signal templates reject invalid snooze repeat policy input', () => {
  assert.throws(
    () =>
      buildSignalTemplate({
        templateId: 'erc4626-withdraw-percent-watch',
        vaultContract: '0x1111111111111111111111111111111111111111',
        ownerAddresses: ['0x2222222222222222222222222222222222222222'],
        repeatPolicy: {
          mode: 'post_first_alert_snooze',
          snooze_minutes: 0,
        },
      }),
    SignalTemplateError
  );
});

test('lp pool template creates one state_ref condition per uniswap v3 pool', () => {
  const payload = buildSignalTemplate({
    templateId: 'lp-pool-liquidity-drop',
    pools: [
      { protocol: 'uniswap_v3', address: '0x1111111111111111111111111111111111111111', label: 'USDC/WETH 0.05%' },
      { protocol: 'uniswap_v3', address: '0x2222222222222222222222222222222222222222', label: 'WBTC/WETH 0.3%' },
    ],
    dropPercent: 20,
    windowDuration: '1h',
    chainId: 1,
  });

  assert.equal(payload.definition.logic, 'AND');
  assert.equal(payload.definition.conditions.length, 2);
  for (const condition of payload.definition.conditions) {
    assert.equal(condition.type, 'change');
    if (condition.type !== 'change' || condition.source?.kind !== 'state') {
      continue;
    }
    assert.equal(condition.source.state_ref.protocol, 'uniswap_v3');
    assert.equal(condition.source.state_ref.entity_type, 'Pool');
    assert.equal(condition.source.state_ref.field, 'liquidity');
  }
});

test('lp pool template supports mixed uniswap v3 and v4 pools', () => {
  const payload = buildSignalTemplate({
    templateId: 'lp-pool-liquidity-drop',
    pools: [
      { protocol: 'uniswap_v3', address: '0x1111111111111111111111111111111111111111' },
      {
        protocol: 'uniswap_v4',
        address: '0x3333333333333333333333333333333333333333',
        poolId: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      },
    ],
    dropPercent: 15,
    windowDuration: '2h',
    chainId: 1,
  });

  const v4 = payload.definition.conditions[1];
  assert.equal(v4?.type, 'change');
  if (v4?.type === 'change' && v4.source?.kind === 'state') {
    assert.equal(v4.source.state_ref.protocol, 'uniswap_v4');
    assert.equal(v4.source.state_ref.entity_type, 'PoolManager');
    assert.equal(v4.source.state_ref.field, 'liquidity');
    const poolIdFilter = v4.source.state_ref.filters.find((filter) => filter.field === 'poolId');
    assert.equal(poolIdFilter?.value, '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
  }
});

test('lp pool template rejects missing pools and invalid v4 poolId', () => {
  assert.throws(
    () =>
      buildSignalTemplate({
        templateId: 'lp-pool-liquidity-drop',
        pools: [],
      }),
    SignalTemplateError
  );

  assert.throws(
    () =>
      buildSignalTemplate({
        templateId: 'lp-pool-liquidity-drop',
        pools: [
          {
            protocol: 'uniswap_v4',
            address: '0x3333333333333333333333333333333333333333',
            poolId: '0x1234',
          },
        ],
      }),
    SignalTemplateError
  );
});
