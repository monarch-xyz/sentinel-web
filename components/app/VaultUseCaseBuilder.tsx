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
import type { SupportedVaultProtocolId, VaultHolder, VaultSummary } from '@/lib/vault-discovery/types';
import type { SignalRepeatPolicyMode } from '@/lib/types/signal';

interface VaultUseCaseBuilderProps {
  protocol: SupportedVaultProtocolId;
}

const formatCompactAddress = (value: string) => `${value.slice(0, 6)}...${value.slice(-4)}`;

const formatUsdCompact = (value: number) =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
    style: 'currency',
    currency: 'USD',
  }).format(value);

const getProtocolHeading = (protocol: SupportedVaultProtocolId) =>
  protocol === 'morpho' ? 'Morpho vaults' : 'Euler Earn vaults';

const getProtocolDescription = (protocol: SupportedVaultProtocolId) =>
  protocol === 'morpho'
    ? 'Pick a Morpho vault, pick holders, and let Sentinel create the alert.'
    : 'Pick an Euler vault, pick holders, and let Sentinel create the alert.';

const getProtocolSearchPlaceholder = (protocol: SupportedVaultProtocolId) =>
  protocol === 'morpho'
    ? 'Search vault name, symbol, asset, or address'
    : 'Search Euler vault name, symbol, or asset address';

export function VaultUseCaseBuilder({ protocol }: VaultUseCaseBuilderProps) {
  const router = useRouter();
  const [isVaultPickerExpanded, setIsVaultPickerExpanded] = useState(true);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [vaults, setVaults] = useState<VaultSummary[]>([]);
  const [selectedVault, setSelectedVault] = useState<VaultSummary | null>(null);
  const [holders, setHolders] = useState<VaultHolder[]>([]);
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
  const [holdersLoading, setHoldersLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSearch('');
    setVaults([]);
    setSelectedVault(null);
    setHolders([]);
    setSelectedAddresses([]);
    setLoadError(null);
    setSubmitError(null);
    setIsVaultPickerExpanded(true);
  }, [protocol]);

  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      setResultsLoading(true);
      setLoadError(null);

      try {
        const response = await fetch(
          `/api/discovery/vaults?protocol=${protocol}&chainId=1&limit=20&search=${encodeURIComponent(deferredSearch)}`,
          { signal: controller.signal }
        );
        const payload = (await response.json()) as { items?: VaultSummary[]; details?: string };

        if (!response.ok) {
          throw new Error(payload.details ?? 'Unable to load vault results.');
        }

        setVaults(payload.items ?? []);
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return;
        }

        setLoadError(error instanceof Error ? error.message : 'Unable to load vault results.');
      } finally {
        setResultsLoading(false);
      }
    };

    void run();

    return () => controller.abort();
  }, [protocol, deferredSearch]);

  useEffect(() => {
    const controller = new AbortController();

    if (!selectedVault) {
      return () => controller.abort();
    }

    const run = async () => {
      setHoldersLoading(true);
      setLoadError(null);

      try {
        const response = await fetch(
          `/api/discovery/vaults/${protocol}/${selectedVault.address}/holders?chainId=${selectedVault.chainId}&limit=15`,
          { signal: controller.signal }
        );
        const payload = (await response.json()) as { items?: VaultHolder[]; details?: string };

        if (!response.ok) {
          throw new Error(payload.details ?? 'Unable to load holder data.');
        }

        const items = payload.items ?? [];
        const defaults = items.slice(0, Math.min(items.length, 5)).map((item) => item.address);

        setHolders(items);
        setSelectedAddresses(defaults);
        setRequiredCount(String(Math.min(defaults.length, 3) || 1));
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return;
        }

        setLoadError(error instanceof Error ? error.message : 'Unable to load holder data.');
      } finally {
        setHoldersLoading(false);
      }
    };

    void run();

    return () => controller.abort();
  }, [protocol, selectedVault]);

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
    templateId: 'erc4626-withdraw-percent-watch',
    vaultContract: selectedVault?.address ?? '',
    ownerAddresses: selectedAddresses,
    chainId: selectedVault?.chainId ?? 1,
    requiredCount: Number(requiredCount),
    dropPercent: Number(dropPercent),
    windowDuration,
    cooldownMinutes: Number(cooldownMinutes),
    repeatPolicy: buildSignalRepeatPolicy(repeatMode, Number(snoozeMinutes)),
    name,
    description,
  };

  let previewError: string | null = null;
  let previewDefinition: string | null = null;
  let previewPayload: ReturnType<typeof buildSignalTemplate> | null = null;

  try {
    previewPayload = buildSignalTemplate(previewInput);
    previewDefinition = JSON.stringify(
      {
        name: previewPayload.name,
        description: previewPayload.description,
        definition: previewPayload.definition,
        delivery: previewPayload.delivery,
        cooldown_minutes: previewPayload.cooldown_minutes,
        repeat_policy: previewPayload.repeat_policy,
      },
      null,
      2
    );
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
  const assetLabel =
    selectedVault?.assetSymbol ?? (selectedVault?.assetAddress ? formatCompactAddress(selectedVault.assetAddress) : 'Unknown asset');
  const selectedEntitySummary = selectedVault ? `${selectedVault.name} · ${assetLabel}` : 'No vault selected';

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <div className="space-y-6">
        <Card className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-secondary">Vault source</p>
              <h2 className="mt-2 font-zen text-2xl">{getProtocolHeading(protocol)}</h2>
              <p className="mt-2 text-sm text-secondary">{getProtocolDescription(protocol)}</p>
            </div>
            {selectedVault ? (
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => setIsVaultPickerExpanded((current) => !current)}
              >
                {isVaultPickerExpanded ? 'Hide list' : 'Change vault'}
              </Button>
            ) : null}
          </div>

          {selectedVault && !isVaultPickerExpanded ? (
            <div className="rounded-sm border border-border/80 bg-background/50 p-4">
              <p className="text-sm text-foreground">{selectedVault.name}</p>
              <p className="mt-1 text-xs text-secondary">
                {[selectedVault.symbol, assetLabel, formatCompactAddress(selectedVault.address)].filter(Boolean).join(' · ')}
              </p>
            </div>
          ) : (
            <>
              <label className="flex flex-col gap-2 text-sm text-secondary">
                Search vaults
                <div className="relative">
                  <RiSearchLine className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={getProtocolSearchPlaceholder(protocol)}
                    className="w-full rounded-sm border border-border bg-transparent py-2 pl-9 pr-3 text-sm text-foreground"
                  />
                </div>
              </label>

              {resultsLoading ? <p className="text-sm text-secondary">Loading vault data...</p> : null}
              {loadError ? <p className="text-sm text-red-500">{loadError}</p> : null}

              <div className="grid gap-3">
                {vaults.map((vault) => {
                  const active = selectedVault?.address === vault.address;
                  const vaultAssetLabel =
                    vault.assetSymbol ?? (vault.assetAddress ? formatCompactAddress(vault.assetAddress) : 'Unknown asset');
                  const secondary = [vault.symbol, vaultAssetLabel, formatCompactAddress(vault.address)]
                    .filter(Boolean)
                    .join(' · ');

                  return (
                    <button
                      key={vault.address}
                      type="button"
                      onClick={() => {
                        setSelectedVault(vault);
                        setIsVaultPickerExpanded(false);
                      }}
                      className={`rounded-sm border px-4 py-3 text-left transition-colors ${
                        active
                          ? 'border-[#1f2328] bg-background text-foreground'
                          : 'border-border bg-background/70 text-secondary hover:bg-hovered hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm text-foreground" title={vault.name}>
                            {vault.name}
                          </p>
                          <p className="mt-1 truncate text-xs text-secondary" title={secondary}>
                            {secondary}
                          </p>
                        </div>
                        {typeof vault.totalAssetsUsd === 'number' ? (
                          <p className="shrink-0 text-xs text-secondary">{formatUsdCompact(vault.totalAssetsUsd)}</p>
                        ) : null}
                      </div>
                    </button>
                  );
                })}

                {!resultsLoading && vaults.length === 0 ? (
                  <div className="rounded-sm border border-dashed border-border px-4 py-3 text-sm text-secondary">
                    No vaults matched this search yet.
                  </div>
                ) : null}
              </div>
            </>
          )}
        </Card>

        <Card className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-secondary">Selection</p>
              <h2 className="mt-2 font-zen text-2xl">{selectedEntitySummary}</h2>
            </div>
            {holdersLoading ? <p className="text-sm text-secondary">Loading holders...</p> : null}
          </div>

          <div className="space-y-2">
            {holders.map((item) => {
              const active = selectedAddresses.includes(item.address);

              return (
                <label
                  key={item.address}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-sm border px-3 py-2 text-sm ${
                    active ? 'border-[#1f2328] bg-background text-foreground' : 'border-border bg-background/70 text-secondary'
                  }`}
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
                      <p className="text-xs text-secondary">{item.shares} shares</p>
                    </div>
                  </div>
                  <RiArrowRightLine className="h-4 w-4 text-secondary" />
                </label>
              );
            })}

            {!holdersLoading && selectedVault && holders.length === 0 ? (
              <div className="rounded-sm border border-dashed border-border px-4 py-3 text-sm text-secondary">
                No holder balances were returned for this vault.
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-secondary">
              Required owners
              <input
                type="number"
                min="1"
                value={requiredCount}
                onChange={(event) => setRequiredCount(event.target.value)}
                className="rounded-sm border border-border bg-transparent px-3 py-2 text-sm text-foreground"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-secondary">
              Share drop (%)
              <input
                type="number"
                min="1"
                value={dropPercent}
                onChange={(event) => setDropPercent(event.target.value)}
                className="rounded-sm border border-border bg-transparent px-3 py-2 text-sm text-foreground"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-secondary">
              Window
              <input
                type="text"
                value={windowDuration}
                onChange={(event) => setWindowDuration(event.target.value)}
                className="rounded-sm border border-border bg-transparent px-3 py-2 text-sm text-foreground"
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

            <label className="flex flex-col gap-2 text-sm text-secondary sm:col-span-2">
              Signal name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Optional custom name"
                className="rounded-sm border border-border bg-transparent px-3 py-2 text-sm text-foreground"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-secondary sm:col-span-2">
              Description
              <input
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional description shown in Sentinel"
                className="rounded-sm border border-border bg-transparent px-3 py-2 text-sm text-foreground"
              />
            </label>
          </div>

          {submitError ? <p className="text-sm text-red-500">{submitError}</p> : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={handleCreate} disabled={Boolean(previewError) || isSubmitting || !selectedVault || selectionCount === 0}>
              {isSubmitting ? 'Creating signal...' : 'Create vault watch'}
            </Button>
          </div>
        </Card>
      </div>

      <Card className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-secondary">Preview</p>
          <h2 className="mt-2 font-zen text-2xl">Vault withdrawal watch</h2>
          <p className="mt-2 text-sm text-secondary">
            Generates an ERC-4626 share-withdrawal signal from selected vault holders. This isolates the 4626 logic inside the vault use case instead of treating it as the app’s main entry mode.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-sm border border-border/80 bg-background/50 p-3">
            <p className="text-xs uppercase tracking-[0.25em] text-secondary">Selected</p>
            <p className="mt-2 break-all font-zen text-xl">{selectionCount}</p>
          </div>
          <div className="rounded-sm border border-border/80 bg-background/50 p-3">
            <p className="text-xs uppercase tracking-[0.25em] text-secondary">Required</p>
            <p className="mt-2 break-all font-zen text-xl">{requiredCount || '0'}</p>
          </div>
          <div className="rounded-sm border border-border/80 bg-background/50 p-3">
            <p className="text-xs uppercase tracking-[0.25em] text-secondary">Drop %</p>
            <p className="mt-2 break-all font-zen text-xl">{dropPercent ? `${dropPercent}%` : '—'}</p>
          </div>
          <div className="rounded-sm border border-border/80 bg-background/50 p-3">
            <p className="text-xs uppercase tracking-[0.25em] text-secondary">Window</p>
            <p className="mt-2 break-all font-zen text-xl">{windowDuration || '—'}</p>
          </div>
        </div>

        {!previewError && previewPayload && previewDefinition ? (
          <>
            <div className="rounded-sm border border-border/80 bg-background/50 p-4">
              <p className="text-sm text-secondary">{describeSignalDefinition(previewPayload.definition)}</p>
            </div>
            <CodeBlock
              code={previewDefinition}
              language="json"
              filename="vault-signal-preview.json"
              tone="dark"
              showLineNumbers
            />
          </>
        ) : (
          <div className="rounded-sm border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400">
            {previewError ?? 'Select a vault and holder set to generate a preview.'}
          </div>
        )}
      </Card>
    </div>
  );
}
