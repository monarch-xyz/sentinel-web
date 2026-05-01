'use client';

import { useDeferredValue, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiSearchLine } from 'react-icons/ri';
import { RepeatPolicyFields } from '@/components/app/RepeatPolicyFields';
import { ScheduleFields } from '@/components/app/ScheduleFields';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { buildSignalRepeatPolicy } from '@/lib/signals/repeat-policy';
import { buildSignalTemplate, describeSignalDefinition, type SignalTemplateRequest } from '@/lib/signals/templates';
import type { LpPoolSummary } from '@/lib/lp-pool-discovery/types';
import type { SignalRepeatPolicyMode, SignalSchedule } from '@/lib/types/signal';

const DEFAULT_SCHEDULE: SignalSchedule = { kind: 'interval', interval_seconds: 300 };

const formatUsdCompact = (value: number) =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
    style: 'currency',
    currency: 'USD',
  }).format(value);

export function LpPoolSignalBuilder() {
  const router = useRouter();
  const [search, setSearch] = useState('USDC WETH');
  const deferredSearch = useDeferredValue(search);
  const [results, setResults] = useState<LpPoolSummary[]>([]);
  const [selectedV3Pools, setSelectedV3Pools] = useState<LpPoolSummary[]>([]);
  const [manualV4Address, setManualV4Address] = useState('');
  const [manualV4PoolId, setManualV4PoolId] = useState('');
  const [manualV4Label, setManualV4Label] = useState('');
  const [manualV4Pools, setManualV4Pools] = useState<Array<{ address: string; poolId: string; label?: string }>>([]);
  const [dropPercent, setDropPercent] = useState('20');
  const [windowDuration, setWindowDuration] = useState('1h');
  const [cooldownMinutes, setCooldownMinutes] = useState('15');
  const [schedule, setSchedule] = useState<SignalSchedule>(DEFAULT_SCHEDULE);
  const [repeatMode, setRepeatMode] = useState<SignalRepeatPolicyMode>('cooldown');
  const [snoozeMinutes, setSnoozeMinutes] = useState('1440');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await fetch(
          `/api/discovery/lp-pools?chainId=1&limit=20&search=${encodeURIComponent(deferredSearch)}`,
          { signal: controller.signal }
        );
        const payload = (await response.json()) as { items?: LpPoolSummary[]; details?: string };
        if (!response.ok) {
          throw new Error(payload.details ?? 'Unable to load LP pool results.');
        }
        setResults(payload.items ?? []);
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return;
        }
        setLoadError(error instanceof Error ? error.message : 'Unable to load LP pool results.');
      } finally {
        setIsLoading(false);
      }
    };

    void run();
    return () => controller.abort();
  }, [deferredSearch]);

  const togglePool = (pool: LpPoolSummary) => {
    setSelectedV3Pools((current) =>
      current.some((item) => item.address === pool.address)
        ? current.filter((item) => item.address !== pool.address)
        : [...current, pool]
    );
  };

  const addManualV4Pool = () => {
    if (!manualV4Address.trim() || !manualV4PoolId.trim()) {
      return;
    }
    setManualV4Pools((current) => [
      ...current,
      {
        address: manualV4Address.trim(),
        poolId: manualV4PoolId.trim(),
        label: manualV4Label.trim() || undefined,
      },
    ]);
    setManualV4Address('');
    setManualV4PoolId('');
    setManualV4Label('');
  };

  const removeManualV4Pool = (index: number) => {
    setManualV4Pools((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const selectedV3Addresses = new Set(selectedV3Pools.map((pool) => pool.address));
  const previewInput: SignalTemplateRequest = {
    templateId: 'lp-pool-liquidity-drop',
    chainId: 1,
    pools: [
      ...selectedV3Pools.map((pool) => ({
        protocol: 'uniswap_v3' as const,
        address: pool.address,
        label: pool.name,
      })),
      ...manualV4Pools.map((pool) => ({
        protocol: 'uniswap_v4' as const,
        address: pool.address,
        poolId: pool.poolId,
        label: pool.label,
      })),
    ],
    dropPercent: Number(dropPercent),
    windowDuration,
    cooldownMinutes: Number(cooldownMinutes),
    schedule,
    repeatPolicy: buildSignalRepeatPolicy(repeatMode, Number(snoozeMinutes), Number(cooldownMinutes)),
    name,
    description,
  };

  let previewError: string | null = null;
  let previewPayload: ReturnType<typeof buildSignalTemplate> | null = null;
  try {
    previewPayload = buildSignalTemplate(previewInput);
  } catch (error) {
    previewError = error instanceof Error ? error.message : 'Unable to build signal preview.';
  }

  const handleCreate = async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/signals/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(previewInput),
      });
      const payload = (await response.json().catch(() => null)) as
        | { id?: string; details?: string; payload?: { error?: string } }
        | null;
      if (!response.ok || !payload?.id) {
        throw new Error(payload?.details ?? payload?.payload?.error ?? 'Unable to create signal.');
      }
      router.push(`/signals/${payload.id}`);
      router.refresh();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to create signal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <div className="space-y-6">
        <Card className="space-y-4">
          <div>
            <p className="ui-stat-label">Protocol source</p>
            <h2 className="mt-3 font-display text-[1.8rem] leading-none text-foreground">Uniswap LP pools</h2>
            <p className="mt-2 text-sm text-secondary">Select one or more v3 pools from discovery, or add v4 PoolManager pools manually. The alert fires when every selected pool drops by the threshold in the same window.</p>
          </div>
          <label className="ui-field">
            <span className="ui-label">Search v3 pools</span>
            <div className="mt-2 flex items-center gap-2 rounded-md border border-black/20 px-3 py-2">
              <RiSearchLine className="h-4 w-4 text-muted" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} className="ui-input border-none p-0" />
            </div>
          </label>
          <div className="space-y-2">
            {results.map((pool) => (
              <button
                key={pool.address}
                type="button"
                onClick={() => togglePool(pool)}
                data-active={selectedV3Addresses.has(pool.address)}
                className="ui-option w-full p-3 text-left"
              >
                <p className="text-sm text-foreground">{pool.name}</p>
                <p className="mt-1 text-xs text-muted">
                  {pool.token0Symbol ?? 'Token0'}/{pool.token1Symbol ?? 'Token1'}
                  {pool.feeLabel ? ` · ${pool.feeLabel}` : ''}
                  {typeof pool.reserveUsd === 'number' ? ` · ${formatUsdCompact(pool.reserveUsd)}` : ''}
                </p>
              </button>
            ))}
            {!isLoading && results.length === 0 ? <p className="text-sm text-secondary">No pools found for this search.</p> : null}
            {loadError ? <p className="text-sm text-red-500">{loadError}</p> : null}
          </div>
          {selectedV3Pools.length > 0 ? (
            <div className="space-y-2 border-t border-black/10 pt-4">
              <p className="ui-stat-label">Selected v3 pools</p>
              {selectedV3Pools.map((pool) => (
                <div key={pool.address} className="ui-panel flex items-start justify-between gap-3 p-3">
                  <div>
                    <p className="text-sm text-foreground">{pool.name}</p>
                    <p className="text-xs text-muted">{pool.address}</p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => togglePool(pool)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
        </Card>

        <Card className="space-y-4">
          <p className="ui-stat-label">Manual Uniswap v4 pool</p>
          <label className="ui-field">
            <span className="ui-label">PoolManager address</span>
            <input value={manualV4Address} onChange={(event) => setManualV4Address(event.target.value)} className="ui-input mt-2" />
          </label>
          <label className="ui-field">
            <span className="ui-label">Pool ID (bytes32)</span>
            <input value={manualV4PoolId} onChange={(event) => setManualV4PoolId(event.target.value)} className="ui-input mt-2" />
          </label>
          <label className="ui-field">
            <span className="ui-label">Label (optional)</span>
            <input value={manualV4Label} onChange={(event) => setManualV4Label(event.target.value)} className="ui-input mt-2" />
          </label>
          <Button type="button" variant="secondary" onClick={addManualV4Pool}>
            Add v4 pool
          </Button>
          <div className="space-y-2">
            {manualV4Pools.map((pool, index) => (
              <div key={`${pool.address}-${pool.poolId}-${index}`} className="ui-panel p-3">
                <p className="text-sm text-foreground">{pool.label || pool.address}</p>
                <p className="text-xs text-muted">{pool.poolId}</p>
                <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => removeManualV4Pool(index)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="space-y-4">
          <p className="ui-stat-label">Alert settings</p>
          <label className="ui-field">
            <span className="ui-label">Drop percent</span>
            <input value={dropPercent} onChange={(event) => setDropPercent(event.target.value)} className="ui-input mt-2" />
          </label>
          <label className="ui-field">
            <span className="ui-label">Window duration</span>
            <input value={windowDuration} onChange={(event) => setWindowDuration(event.target.value)} className="ui-input mt-2" />
          </label>
          <label className="ui-field">
            <span className="ui-label">Cooldown minutes</span>
            <input value={cooldownMinutes} onChange={(event) => setCooldownMinutes(event.target.value)} className="ui-input mt-2" />
          </label>
          <ScheduleFields schedule={schedule} onScheduleChange={setSchedule} />
          <RepeatPolicyFields
            mode={repeatMode}
            snoozeMinutes={snoozeMinutes}
            cooldownMinutes={cooldownMinutes}
            onModeChange={setRepeatMode}
            onCooldownMinutesChange={setCooldownMinutes}
            onSnoozeMinutesChange={setSnoozeMinutes}
          />
          <label className="ui-field">
            <span className="ui-label">Signal name (optional)</span>
            <input value={name} onChange={(event) => setName(event.target.value)} className="ui-input mt-2" />
          </label>
          <label className="ui-field">
            <span className="ui-label">Description (optional)</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="ui-input mt-2 min-h-24" />
          </label>
          {previewPayload ? <p className="text-sm text-secondary">{describeSignalDefinition(previewPayload.definition)}</p> : null}
          {previewError ? <p className="text-sm text-red-500">{previewError}</p> : null}
          {submitError ? <p className="text-sm text-red-500">{submitError}</p> : null}
          <Button type="button" disabled={!previewPayload || Boolean(previewError) || isSubmitting} onClick={handleCreate}>
            {isSubmitting ? 'Creating…' : 'Create LP liquidity alert'}
          </Button>
        </Card>
        <Card>
          <CodeBlock code={JSON.stringify(previewPayload ?? previewInput, null, 2)} language="json" />
        </Card>
      </div>
    </div>
  );
}
