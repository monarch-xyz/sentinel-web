import assert from 'node:assert/strict';
import test from 'node:test';
import type { CreateSignalRequest, SignalCondition } from '@/lib/types/signal';
import { SignalTemplateError, buildSignalTemplate } from './templates';

const assertDocCompatibleCondition = (condition: SignalCondition) => {
  if (condition.type === 'threshold' || condition.type === 'change') {
    assert.notEqual(Boolean(condition.metric), Boolean(condition.state_ref), `${condition.type} must use exactly one of metric or state_ref`);
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
  assert.ok(payload.definition.scope.chains.length > 0, 'template payloads require scope.chains');
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
});

test('erc20 raw-event templates stay compatible with the current Iruka docs schema', () => {
  const payload = buildSignalTemplate({
    templateId: 'erc20-inflow-watch',
    tokenContract: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    watchedAddress: '0x1111111111111111111111111111111111111111',
  });

  assertDocCompatibleTemplatePayload(payload);
  const condition = payload.definition.conditions[0];
  assert.equal(condition.type, 'raw-events');
  if (condition.type === 'raw-events') {
    assert.equal(condition.aggregation, 'sum');
    assert.equal(condition.field, 'value');
  }
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
    templateId: 'erc20-inflow-watch',
    tokenContract: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    watchedAddress: '0x1111111111111111111111111111111111111111',
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
