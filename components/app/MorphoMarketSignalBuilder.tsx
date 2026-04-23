'use client';

import { useDeferredValue, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiArrowRightLine, RiSearchLine } from 'react-icons/ri';
import { RepeatPolicyFields } from '@/components/app/RepeatPolicyFields';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { buildSignalRepeatPolicy } from '@/lib/signals/repeat-policy';
import { buildSignalTemplate, describeSignalDefinition, type SignalTemplateRequest } from '@/lib/signals/templates';
import type { MorphoMarketSupplier, MorphoMarketSummary } from '@/lib/morpho-discovery/types';
import type { SignalRepeatPolicyMode } from '@/lib/types/signal';

const formatCompactAddress = (value: string) => `${value.slice(0, 6)}...${value.slice(-4)}`;

const formatUsdCompact = (value: number) =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
    style: 'currency',
    currency: 'USD',
  }).format(value);

const formatPercent = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);

const getMorphoWhaleTemplateId = (requiredCount: number) => {
  if (requiredCount <= 1) {
    return 'single-whale-exit' as const;
  }

  if (requiredCount === 2) {
    return 'whale-exit-pair' as const;
  }

  return 'whale-exit-trio' as const;
};

export function MorphoMarketSignalBuilder() {
  const router = useRouter();
  const [isMarketPickerExpanded, setIsMarketPickerExpanded] = useState(true);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [markets, setMarkets] = useState<MorphoMarketSummary[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<MorphoMarketSummary | null>(null);
  const [suppliers, setSuppliers] = useState<MorphoMarketSupplier[]>([]);
  const [selectedAddresses, setSelectedAddresses] = useState<string[]>([]);
  const [requiredCount, setRequiredCount] = useState('3');
  const [dropPercent, setDropPercent] = useState('20');
  const [windowDuration, setWindowDuration] = useState('7d');
  const [cooldownMinutes, setCooldownMinutes] = useState('60');
  const [repeatMode, setRepeatMode] = useState<SignalRepeatPolicyMode>('cooldown');
  const [snoozeMinutes, setSnoozeMinutes] = useState('1440');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [resultsLoading, setResultsLoading] = useState(false);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      setResultsLoading(true);
      setLoadError(null);

      try {
        const response = await fetch(
          `/api/discovery/morpho/markets?chainId=1&limit=20&search=${encodeURIComponent(deferredSearch)}`,
          { signal: controller.signal }
        );
        const payload = (await response.json()) as { items?: MorphoMarketSummary[]; details?: string };

        if (!response.ok) {
          throw new Error(payload.details ?? 'Unable to load Morpho markets.');
        }

        setMarkets(payload.items ?? []);
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return;
        }

        setLoadError(error instanceof Error ? error.message : 'Unable to load Morpho markets.');
      } finally {
        setResultsLoading(false);
      }
    };

    void run();

    return () => controller.abort();
  }, [deferredSearch]);

  useEffect(() => {
    const controller = new AbortController();

    if (!selectedMarket) {
      return () => controller.abort();
    }

    const run = async () => {
      setSuppliersLoading(true);
      setLoadError(null);

      try {
        const response = await fetch(
          `/api/discovery/morpho/markets/${selectedMarket.marketId}/suppliers?chainId=${selectedMarket.chainId}&limit=15`,
          { signal: controller.signal }
        );
        const payload = (await response.json()) as { items?: MorphoMarketSupplier[]; details?: string };

        if (!response.ok) {
          throw new Error(payload.details ?? 'Unable to load supplier data.');
        }

        const items = payload.items ?? [];
        const defaults = items.slice(0, Math.min(items.length, 5)).map((item) => item.address);

        setSuppliers(items);
        setSelectedAddresses(defaults);
        setRequiredCount(String(Math.min(defaults.length, 3) || 1));
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return;
        }

        setLoadError(error instanceof Error ? error.message : 'Unable to load supplier data.');
      } finally {
        setSuppliersLoading(false);
      }
    };

    void run();

    return () => controller.abort();
  }, [selectedMarket]);

  useEffect(() => {
    const numericRequired = Number(requiredCount);
    if (selectedAddresses.length === 0) {
      return;
    }

    if (!Number.isInteger(numericRequired) || numericRequired < 1) {
      setRequiredCount('1');
      return;
    }

    if (numericRequired > selectedAddresses.length) {
      setRequiredCount(String(selectedAddresses.length));
    }
  }, [requiredCount, selectedAddresses]);

  const toggleAddress = (address: string) => {
    setSelectedAddresses((current) =>
      current.includes(address) ? current.filter((item) => item !== address) : [...current, address]
    );
  };

  const previewInput: SignalTemplateRequest = {
    templateId: getMorphoWhaleTemplateId(Number(requiredCount)),
    marketId: selectedMarket?.marketId ?? '',
    whaleAddresses: selectedAddresses,
    chainId: selectedMarket?.chainId ?? 1,
    requiredCount: Number(requiredCount),
    dropPercent: Number(dropPercent),
    windowDuration,
    cooldownMinutes: Number(cooldownMinutes),
    repeatPolicy: buildSignalRepeatPolicy(repeatMode, Number(snoozeMinutes), Number(cooldownMinutes)),
    name,
    description,
  };

  let previewError: string | null = null;
  let previewDefinition: string | null = null;
  let previewPayload: ReturnType<typeof buildSignalTemplate> | null = null;

  try {
    previewPayload = buildSignalTemplate(previewInput);
    previewDefinition = JSON.stringify(previewPayload, null, 2);
  } catch (error) {
    previewError = error instanceof Error ? error.message : 'Unable to build signal preview.';
  }

  const handleCreate = async () => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/signals/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  const selectionCount = selectedAddresses.length;
  const selectedEntitySummary = selectedMarket
    ? `${selectedMarket.loanAssetSymbol}/${selectedMarket.collateralAssetSymbol}`
    : 'No market selected';

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <div className="space-y-6">
        <Card className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="ui-stat-label">Protocol source</p>
              <h2 className="mt-3 font-display text-[1.8rem] leading-none text-foreground">Morpho markets</h2>
              <p className="mt-2 text-sm text-secondary">
                Pick a Morpho market, pick suppliers, and let Iruka watch for coordinated exits.
              </p>
            </div>
            {selectedMarket ? (
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => setIsMarketPickerExpanded((current) => !current)}
              >
                {isMarketPickerExpanded ? 'Hide list' : 'Change market'}
              </Button>
            ) : null}
          </div>

          {selectedMarket && !isMarketPickerExpanded ? (
            <div className="ui-panel-ghost p-4">
              <p className="text-sm text-foreground">{selectedEntitySummary}</p>
              <p className="mt-1 font-mono text-xs text-secondary" title={selectedMarket.marketId}>
                {formatCompactAddress(selectedMarket.marketId)}
              </p>
            </div>
          ) : (
            <>
              <label className="ui-field">
                Search markets
                <div className="relative">
                  <RiSearchLine className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search loan / collateral pair or market id"
                    className="ui-input pl-9"
                  />
                </div>
              </label>

              {resultsLoading ? <p className="text-sm text-secondary">Loading market data...</p> : null}
              {loadError ? <p className="ui-notice text-sm" data-tone="danger">{loadError}</p> : null}

              <div className="grid gap-3">
                {markets.map((market) => {
                  const active = selectedMarket?.marketId === market.marketId;

                  return (
                    <button
                      key={market.marketId}
                      type="button"
                      onClick={() => {
                        setSelectedMarket(market);
                        setIsMarketPickerExpanded(false);
                      }}
                      data-active={active}
                      className="ui-option px-4 py-3 text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm text-foreground">
                            {market.loanAssetSymbol}/{market.collateralAssetSymbol}
                          </p>
                          <p className="mt-1 truncate font-mono text-xs text-secondary" title={market.marketId}>
                            {formatCompactAddress(market.marketId)}
                          </p>
                        </div>
                        <div className="shrink-0 text-right text-xs text-secondary">
                          <p>{formatUsdCompact(market.supplyAssetsUsd)}</p>
                          <p>{formatPercent(market.utilization)}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {!resultsLoading && markets.length === 0 ? (
                  <div className="ui-panel-ghost px-4 py-3 text-sm text-secondary">
                    No Morpho markets matched this search yet.
                  </div>
                ) : null}
              </div>
            </>
          )}
        </Card>

        <Card className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="ui-stat-label">Selection</p>
              <h2 className="mt-3 font-display text-[1.8rem] leading-none text-foreground">{selectedEntitySummary}</h2>
              {selectedMarket ? (
                <p className="mt-1 font-mono text-xs text-secondary" title={selectedMarket.marketId}>
                  {formatCompactAddress(selectedMarket.marketId)}
                </p>
              ) : null}
            </div>
            {suppliersLoading ? <p className="text-sm text-secondary">Loading suppliers...</p> : null}
          </div>

          <div className="space-y-2">
            {suppliers.map((item) => {
              const active = selectedAddresses.includes(item.address);

              return (
                <label
                  key={item.address}
                  data-active={active}
                  className="ui-option flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleAddress(item.address)}
                      className="h-4 w-4 rounded-sm border-border"
                    />
                    <div>
                      <p className="font-mono text-sm" title={item.address}>
                        {formatCompactAddress(item.address)}
                      </p>
                      <p className="text-xs text-secondary">{formatUsdCompact(item.supplyAssetsUsd)} supplied</p>
                    </div>
                  </div>
                  <RiArrowRightLine className="h-4 w-4 text-secondary" />
                </label>
              );
            })}

            {!suppliersLoading && selectedMarket && suppliers.length === 0 ? (
              <div className="ui-panel-ghost px-4 py-3 text-sm text-secondary">
                No supplier balances were returned for this market.
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="ui-field">
              Required suppliers
              <input
                type="number"
                min="1"
                value={requiredCount}
                onChange={(event) => setRequiredCount(event.target.value)}
                className="ui-input"
              />
            </label>

            <label className="ui-field">
              Supply drop (%)
              <input
                type="number"
                min="1"
                value={dropPercent}
                onChange={(event) => setDropPercent(event.target.value)}
                className="ui-input"
              />
            </label>

            <label className="ui-field">
              Window
              <input
                type="text"
                value={windowDuration}
                onChange={(event) => setWindowDuration(event.target.value)}
                className="ui-input"
              />
            </label>

            <RepeatPolicyFields
              mode={repeatMode}
              cooldownMinutes={cooldownMinutes}
              snoozeMinutes={snoozeMinutes}
              onModeChange={setRepeatMode}
              onCooldownMinutesChange={setCooldownMinutes}
              onSnoozeMinutesChange={setSnoozeMinutes}
            />

            <label className="ui-field sm:col-span-2">
              Signal name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Optional custom name"
                className="ui-input"
              />
            </label>

            <label className="ui-field sm:col-span-2">
              Description
              <input
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional description shown in Iruka"
                className="ui-input"
              />
            </label>
          </div>

          {submitError ? <p className="ui-notice text-sm" data-tone="danger">{submitError}</p> : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={handleCreate} disabled={Boolean(previewError) || isSubmitting || !selectedMarket || selectionCount === 0}>
              {isSubmitting ? 'Creating signal...' : 'Create protocol watch'}
            </Button>
          </div>
        </Card>
      </div>

      <Card className="space-y-5">
        <div>
          <p className="ui-stat-label">Preview</p>
          <h2 className="mt-3 font-display text-[1.8rem] leading-none text-foreground">Morpho market supplier watch</h2>
          <p className="mt-2 text-sm text-secondary">
            Generates a Morpho market supplier-exit signal from your backend-indexed market layer, keeping protocol-level detail separate from the broader vault flow.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="ui-stat">
            <p className="ui-stat-label">Selected</p>
            <p className="ui-stat-value break-all">{selectionCount}</p>
          </div>
          <div className="ui-stat">
            <p className="ui-stat-label">Required</p>
            <p className="ui-stat-value break-all">{requiredCount || '0'}</p>
          </div>
          <div className="ui-stat">
            <p className="ui-stat-label">Drop %</p>
            <p className="ui-stat-value break-all">{dropPercent ? `${dropPercent}%` : '—'}</p>
          </div>
          <div className="ui-stat">
            <p className="ui-stat-label">Window</p>
            <p className="ui-stat-value break-all">{windowDuration || '—'}</p>
          </div>
        </div>

        {!previewError && previewPayload && previewDefinition ? (
          <>
            <div className="ui-panel-ghost p-4">
              <p className="text-sm text-secondary">{describeSignalDefinition(previewPayload.definition)}</p>
            </div>
            <CodeBlock
              code={previewDefinition}
              language="json"
              filename="protocol-signal-preview.json"
              tone="light"
              showLineNumbers
            />
          </>
        ) : (
          <div className="ui-notice text-sm" data-tone="danger">
            {previewError ?? 'Select a market and supplier set to generate a preview.'}
          </div>
        )}
      </Card>
    </div>
  );
}
