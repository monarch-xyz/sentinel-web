import type { SignalRepeatPolicyMode } from '@/lib/types/signal';
import { getSignalRepeatPolicyHint } from '@/lib/signals/repeat-policy';

interface RepeatPolicyFieldsProps {
  mode: SignalRepeatPolicyMode;
  cooldownMinutes: string;
  snoozeMinutes: string;
  onModeChange: (mode: SignalRepeatPolicyMode) => void;
  onCooldownMinutesChange: (value: string) => void;
  onSnoozeMinutesChange: (value: string) => void;
}

export function RepeatPolicyFields({
  mode,
  cooldownMinutes,
  snoozeMinutes,
  onModeChange,
  onCooldownMinutesChange,
  onSnoozeMinutesChange,
}: RepeatPolicyFieldsProps) {
  return (
    <>
      <label className="flex flex-col gap-2 text-sm text-secondary">
        Repeat behavior
        <select
          value={mode}
          onChange={(event) => onModeChange(event.target.value as SignalRepeatPolicyMode)}
          className="rounded-sm border border-border bg-transparent px-3 py-2 text-sm text-foreground"
        >
          <option value="cooldown">Cooldown</option>
          <option value="post_first_alert_snooze">Post-first alert snooze</option>
          <option value="until_resolved">Until resolved</option>
        </select>
        <span className="text-xs text-secondary">{getSignalRepeatPolicyHint(mode)}</span>
      </label>

      {mode === 'post_first_alert_snooze' ? (
        <label className="flex flex-col gap-2 text-sm text-secondary">
          Snooze after first alert (minutes)
          <input
            type="number"
            min="1"
            value={snoozeMinutes}
            onChange={(event) => onSnoozeMinutesChange(event.target.value)}
            className="rounded-sm border border-border bg-transparent px-3 py-2 text-sm text-foreground"
          />
          <span className="text-xs text-secondary">
            Telegram `Why`, `Snooze 1h`, and `Snooze 1d` actions stay backend-managed.
          </span>
        </label>
      ) : mode === 'cooldown' ? (
        <label className="flex flex-col gap-2 text-sm text-secondary">
          Cooldown (minutes)
          <input
            type="number"
            min="0"
            value={cooldownMinutes}
            onChange={(event) => onCooldownMinutesChange(event.target.value)}
            className="rounded-sm border border-border bg-transparent px-3 py-2 text-sm text-foreground"
          />
          <span className="text-xs text-secondary">Sentinel uses this value only for cooldown repeat mode.</span>
        </label>
      ) : (
        <div className="rounded-sm border border-border/80 bg-background/50 p-4 text-sm text-secondary">
          Sentinel sends one alert per incident, then waits until the signal evaluates false before alerting again.
        </div>
      )}
    </>
  );
}
