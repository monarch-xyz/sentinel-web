import assert from 'node:assert/strict';
import test from 'node:test';
import { SignalTemplateError, buildSignalTemplate } from './templates';

test('signal templates default to cooldown repeat policy', () => {
  const payload = buildSignalTemplate({
    templateId: 'single-whale-exit',
    marketId: '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
    whaleAddresses: ['0x1111111111111111111111111111111111111111'],
  });

  assert.deepEqual(payload.repeat_policy, { mode: 'cooldown' });
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

  assert.deepEqual(payload.repeat_policy, {
    mode: 'post_first_alert_snooze',
    snooze_minutes: 1440,
  });
  assert.equal(payload.cooldown_minutes, 15);
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
