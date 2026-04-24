'use client';

import type { SignalSchedule } from '@/lib/types/signal';

interface ScheduleFieldsProps {
  schedule: SignalSchedule;
  onScheduleChange: (schedule: SignalSchedule) => void;
  className?: string;
}

const CRON_EXAMPLE = '0 8 * * *';

export function ScheduleFields({ schedule, onScheduleChange, className }: ScheduleFieldsProps) {
  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="ui-field">
          Wake-up style
          <select
            value={schedule.kind}
            onChange={(event) =>
              onScheduleChange(
                event.target.value === 'cron'
                  ? { kind: 'cron', expression: schedule.kind === 'cron' ? schedule.expression : CRON_EXAMPLE }
                  : { kind: 'interval', interval_seconds: schedule.kind === 'interval' ? schedule.interval_seconds : 300 }
              )
            }
            className="ui-select"
          >
            <option value="interval">Interval</option>
            <option value="cron">Cron (UTC)</option>
          </select>
          <span className="ui-helper">Use interval for a simple recurring check, or cron when you need a fixed UTC schedule.</span>
        </label>

        {schedule.kind === 'interval' ? (
          <label className="ui-field">
            Check every (seconds)
            <input
              type="number"
              min="1"
              step="1"
              value={schedule.interval_seconds}
              onChange={(event) =>
                onScheduleChange({
                  kind: 'interval',
                  interval_seconds: Number(event.target.value),
                })
              }
              className="ui-input"
            />
            <span className="ui-helper">Common values: 300 for every 5 minutes, 3600 for hourly.</span>
          </label>
        ) : (
          <label className="ui-field sm:col-span-2">
            Cron expression (UTC)
            <input
              type="text"
              value={schedule.expression}
              onChange={(event) =>
                onScheduleChange({
                  kind: 'cron',
                  expression: event.target.value,
                })
              }
              placeholder={CRON_EXAMPLE}
              className="ui-input font-mono"
            />
            <span className="ui-helper">Use standard five-field cron syntax in UTC. Example: <code>{CRON_EXAMPLE}</code> runs every day at 08:00 UTC.</span>
          </label>
        )}
      </div>
    </div>
  );
}
