import type { SignalRepeatPolicy, SignalRepeatPolicyMode } from '@/lib/types/signal';

export const DEFAULT_SIGNAL_REPEAT_POLICY: SignalRepeatPolicy = { mode: 'cooldown' };

export const buildSignalRepeatPolicy = (
  mode: SignalRepeatPolicyMode,
  snoozeMinutes?: number | null
): SignalRepeatPolicy => {
  if (mode === 'post_first_alert_snooze') {
    return {
      mode,
      snooze_minutes: Number(snoozeMinutes ?? 0),
    };
  }

  return { mode };
};

export const normalizeSignalRepeatPolicy = (
  repeatPolicy?: SignalRepeatPolicy | null
): SignalRepeatPolicy => repeatPolicy ?? DEFAULT_SIGNAL_REPEAT_POLICY;

export const describeSignalRepeatPolicy = (
  repeatPolicy?: SignalRepeatPolicy | null,
  cooldownMinutes?: number | null
) => {
  const resolvedPolicy = normalizeSignalRepeatPolicy(repeatPolicy);

  switch (resolvedPolicy.mode) {
    case 'cooldown':
      return `Cooldown ${cooldownMinutes ?? 0}m`;
    case 'post_first_alert_snooze':
      return `Post-first snooze ${resolvedPolicy.snooze_minutes}m`;
    case 'until_resolved':
      return 'Until resolved';
  }
};

export const getSignalRepeatPolicyHint = (mode: SignalRepeatPolicyMode) => {
  switch (mode) {
    case 'cooldown':
      return 'Repeat while the condition stays true, spaced by cooldown minutes.';
    case 'post_first_alert_snooze':
      return 'Alert immediately on a new incident, then suppress reminders for the snooze window.';
    case 'until_resolved':
      return 'Alert once per incident and wait until the condition resolves before notifying again.';
  }
};
