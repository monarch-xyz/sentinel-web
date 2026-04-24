'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  RiAlarmWarningLine,
  RiArrowDownLine,
  RiArrowUpLine,
  RiExchangeDollarLine,
  RiUserSearchLine,
} from 'react-icons/ri';
import { RepeatPolicyFields } from '@/components/app/RepeatPolicyFields';
import { ScheduleFields } from '@/components/app/ScheduleFields';
import { SignalPresetCard } from '@/components/app/SignalPresetCard';
import { Button } from '@/components/ui/Button';
import { HelpHint } from '@/components/ui/HelpHint';
import {
  SIGNAL_TEMPLATE_PRESETS,
  buildSignalTemplate,
  describeSignalDefinition,
  getTemplatePreset,
  parseWhaleAddresses,
  type SignalTemplateKind,
  type SignalTemplateId,
  type SignalTemplateRequest,
} from '@/lib/signals/templates';
import { buildSignalRepeatPolicy } from '@/lib/signals/repeat-policy';
import { CodeBlock } from '@/components/ui/CodeBlock';
import type { SignalRepeatPolicyMode, SignalSchedule } from '@/lib/types/signal';

interface BuilderFormState {
  name: string;
  description: string;
  marketId: string;
  whaleAddresses: string;
  vaultContract: string;
  ownerAddresses: string;
  tokenContract: string;
  watchedAddress: string;
  chainId: string;
  requiredCount: string;
  dropPercent: string;
  amountThreshold: string;
  windowDuration: string;
  cooldownMinutes: string;
  schedule: SignalSchedule;
  repeatMode: SignalRepeatPolicyMode;
  snoozeMinutes: string;
}

interface SignalBuilderFormProps {
  initialPreset?: SignalTemplateId;
  telegramLinked?: boolean;
}

const presetIcons: Record<SignalTemplateId, ReactNode> = {
  'whale-exit-trio': <RiAlarmWarningLine className="w-5 h-5" />,
  'whale-exit-pair': <RiExchangeDollarLine className="w-5 h-5" />,
  'single-whale-exit': <RiUserSearchLine className="w-5 h-5" />,
  'erc20-inflow-watch': <RiArrowDownLine className="w-5 h-5" />,
  'erc20-outflow-watch': <RiArrowUpLine className="w-5 h-5" />,
  'erc4626-withdraw-percent-watch': <RiExchangeDollarLine className="w-5 h-5" />,
};

const formatCompactAddress = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '—';
  }

  if (trimmed.length <= 16) {
    return trimmed;
  }

  return `${trimmed.slice(0, 6)}...${trimmed.slice(-4)}`;
};

const buildDefaultState = (templateId: SignalTemplateId): BuilderFormState => {
  const preset = getTemplatePreset(templateId);

  return {
    name: '',
    description: '',
    marketId: '',
    whaleAddresses: '',
    vaultContract: '',
    ownerAddresses: '',
    tokenContract: '',
    watchedAddress: '',
    chainId: String(preset.defaults.chainId),
    requiredCount:
      preset.kind === 'morpho-whale' || preset.kind === 'erc4626-withdraw'
        ? String(preset.defaults.requiredCount)
        : '1',
    dropPercent:
      preset.kind === 'morpho-whale'
        ? String(preset.defaults.dropPercent)
        : preset.kind === 'erc4626-withdraw' && typeof preset.defaults.dropPercent === 'number'
          ? String(preset.defaults.dropPercent)
          : '20',
    amountThreshold: preset.kind === 'erc20-transfer' ? String(preset.defaults.amountThreshold) : '1000000',
    windowDuration: preset.defaults.windowDuration,
    cooldownMinutes: String(preset.defaults.cooldownMinutes),
    schedule: { kind: 'interval', interval_seconds: 300 },
    repeatMode: 'cooldown',
    snoozeMinutes: '1440',
  };
};

const TEMPLATE_GROUPS: Array<{
  title: string;
  summary: string;
  helpText: string;
  kinds: SignalTemplateKind[];
}> = [
  {
    title: 'Vaults',
    summary: 'Manual vault watches',
    helpText: 'Use this when the guided vault flow cannot find the exact vault or owner set yet.',
    kinds: ['erc4626-withdraw'],
  },
  {
    title: 'Protocols',
    summary: 'Protocol-specific templates',
    helpText: 'Detailed indexed templates such as Morpho markets.',
    kinds: ['morpho-whale'],
  },
  {
    title: 'Raw events',
    summary: 'Event-level monitoring',
    helpText: 'Use raw events when you want lower-level flow checks instead of state metrics.',
    kinds: ['erc20-transfer'],
  },
];

export function SignalBuilderForm({ initialPreset = 'whale-exit-trio', telegramLinked = false }: SignalBuilderFormProps) {
  const router = useRouter();
  const [selectedPreset, setSelectedPreset] = useState<SignalTemplateId>(initialPreset);
  const [formState, setFormState] = useState<BuilderFormState>(() => buildDefaultState(initialPreset));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormState(buildDefaultState(selectedPreset));
    setError(null);
  }, [selectedPreset]);

  const selectedPresetConfig = getTemplatePreset(selectedPreset);
  const isMorphoWhalePreset = selectedPresetConfig.kind === 'morpho-whale';
  const isErc20TransferPreset = selectedPresetConfig.kind === 'erc20-transfer';
  const isErc4626WithdrawPreset = selectedPresetConfig.kind === 'erc4626-withdraw';

  const updateField = (field: keyof BuilderFormState, value: string) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const previewInput: SignalTemplateRequest =
    selectedPresetConfig.kind === 'morpho-whale'
      ? {
          templateId: selectedPresetConfig.id,
          marketId: formState.marketId,
          whaleAddresses: formState.whaleAddresses,
          chainId: Number(formState.chainId),
          requiredCount: Number(formState.requiredCount),
          dropPercent: Number(formState.dropPercent),
          windowDuration: formState.windowDuration,
          cooldownMinutes: Number(formState.cooldownMinutes),
          schedule: formState.schedule,
          repeatPolicy: buildSignalRepeatPolicy(
            formState.repeatMode,
            Number(formState.snoozeMinutes),
            Number(formState.cooldownMinutes)
          ),
          name: formState.name,
          description: formState.description,
        }
      : selectedPresetConfig.kind === 'erc20-transfer'
        ? {
            templateId: selectedPresetConfig.id,
            tokenContract: formState.tokenContract,
            watchedAddress: formState.watchedAddress,
            chainId: Number(formState.chainId),
            amountThreshold: Number(formState.amountThreshold),
            windowDuration: formState.windowDuration,
            cooldownMinutes: Number(formState.cooldownMinutes),
            schedule: formState.schedule,
            repeatPolicy: buildSignalRepeatPolicy(
              formState.repeatMode,
              Number(formState.snoozeMinutes),
              Number(formState.cooldownMinutes)
            ),
            name: formState.name,
            description: formState.description,
          }
        : {
            templateId: selectedPresetConfig.id,
            vaultContract: formState.vaultContract,
            ownerAddresses: formState.ownerAddresses,
            chainId: Number(formState.chainId),
            requiredCount: Number(formState.requiredCount),
            dropPercent: Number(formState.dropPercent),
            windowDuration: formState.windowDuration,
            cooldownMinutes: Number(formState.cooldownMinutes),
            schedule: formState.schedule,
            repeatPolicy: buildSignalRepeatPolicy(
              formState.repeatMode,
              Number(formState.snoozeMinutes),
              Number(formState.cooldownMinutes)
            ),
            name: formState.name,
            description: formState.description,
          };

  let previewError: string | null = null;
  let previewDefinition: string | null = null;
  let previewPayload: ReturnType<typeof buildSignalTemplate> | null = null;
  let parsedAddressCount = 0;

  try {
    if (selectedPresetConfig.kind === 'morpho-whale') {
      parsedAddressCount = parseWhaleAddresses(formState.whaleAddresses).length;
    } else if (selectedPresetConfig.kind === 'erc4626-withdraw') {
      parsedAddressCount = parseWhaleAddresses(formState.ownerAddresses).length;
    }

    previewPayload = buildSignalTemplate(previewInput);
    previewDefinition = JSON.stringify(previewPayload, null, 2);
  } catch (previewBuildError) {
    previewError = previewBuildError instanceof Error ? previewBuildError.message : 'Unable to build template preview.';
  }

  const handleSubmit = async () => {
    if (!telegramLinked) {
      setError('Connect Telegram before creating a template signal.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/signals/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(previewInput),
      });

      const payload = (await response.json().catch(() => null)) as
        | { id?: string; details?: string; payload?: { error?: string; field?: string } }
        | null;

      if (!response.ok || !payload?.id) {
        throw new Error(payload?.details ?? payload?.payload?.error ?? 'Unable to create signal.');
      }

      router.push(`/signals/${payload.id}`);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create signal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewTitle = isMorphoWhalePreset
    ? 'Morpho whale movement signal'
    : isErc4626WithdrawPreset
      ? 'ERC-4626 owner withdrawal % signal'
      : 'ERC-20 transfer raw-event signal';
  const previewDescription = isMorphoWhalePreset
    ? 'Iruka watches the tracked Morpho suppliers and alerts on coordinated exits.'
    : isErc4626WithdrawPreset
      ? 'Iruka watches tracked vault owners and alerts on share withdrawals.'
      : 'Iruka watches ERC-20 transfer flow for one address.';
  const scheduleSummary =
    formState.schedule.kind === 'interval'
      ? `Every ${formState.schedule.interval_seconds}s`
      : `Cron · ${formState.schedule.expression || '—'} UTC`;

  const previewStats = isMorphoWhalePreset
    ? [
        { label: 'Tracked wallets', value: String(parsedAddressCount) },
        { label: 'Required movers', value: formState.requiredCount || '0' },
        { label: 'Drop %', value: formState.dropPercent ? `${formState.dropPercent}%` : '—' },
        { label: 'Window', value: formState.windowDuration || '—' },
      ]
    : isErc4626WithdrawPreset
      ? [
          { label: 'Vault', value: formatCompactAddress(formState.vaultContract) },
          { label: 'Tracked owners', value: String(parsedAddressCount) },
          { label: 'Required owners', value: formState.requiredCount || '0' },
          { label: 'Drop %', value: formState.dropPercent ? `${formState.dropPercent}%` : '—' },
        ]
      : [
          { label: 'Asset', value: formatCompactAddress(formState.tokenContract) },
          { label: 'Address', value: formatCompactAddress(formState.watchedAddress) },
          { label: 'Direction', value: isErc20TransferPreset && selectedPresetConfig.direction === 'inflow' ? 'Inflow' : 'Outflow' },
          { label: 'Threshold', value: formState.amountThreshold ? `${formState.amountThreshold} base` : '0' },
        ];
  const previewStatsWithSchedule = [...previewStats, { label: 'Wake-up', value: scheduleSummary }];

  return (
    <div className="space-y-6">
      <div className="ui-panel p-4">
        <p className="ui-stat-label mb-2">Template</p>
        <p className="mb-4 max-w-3xl text-sm text-secondary">Pick a template family, then fill the exact inputs Iruka should watch.</p>

        <div className="space-y-4">
          {TEMPLATE_GROUPS.map((group) => (
            <div key={group.title} className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-sm text-foreground">{group.title}</p>
                <HelpHint text={group.helpText} />
                <p className="text-sm text-secondary">{group.summary}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {SIGNAL_TEMPLATE_PRESETS.filter((option) => group.kinds.includes(option.kind)).map((option) => (
                  <button
                    key={option.id}
                    data-active={selectedPreset === option.id}
                    className="ui-option px-3 py-2 text-sm"
                    onClick={() => setSelectedPreset(option.id)}
                    type="button"
                  >
                    {option.title}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-6">
        <SignalPresetCard title={selectedPresetConfig.title} description={selectedPresetConfig.description} icon={presetIcons[selectedPreset]}>
          <p className="ui-stat-label">{selectedPresetConfig.accent}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="ui-field">
              Signal name
              <input
                type="text"
                value={formState.name}
                onChange={(event) => updateField('name', event.target.value)}
                placeholder="Optional custom name"
                className="ui-input"
              />
            </label>

            <label className="ui-field">
              Chain ID
              <input
                type="number"
                min="1"
                value={formState.chainId}
                onChange={(event) => updateField('chainId', event.target.value)}
                className="ui-input"
              />
            </label>

            {isMorphoWhalePreset ? (
              <>
                <label className="ui-field">
                  Morpho market ID
                  <input
                    type="text"
                    value={formState.marketId}
                    onChange={(event) => updateField('marketId', event.target.value)}
                    placeholder="0xb8fc70e82bc5... or full market URL"
                    className="ui-input"
                  />
                  <span className="ui-helper">
                    Chain is set separately. If you paste a supported market URL, Iruka extracts and stores only the final market id.
                  </span>
                </label>

                <label className="ui-field">
                  Wallets required
                  <input
                    type="number"
                    min="1"
                    value={formState.requiredCount}
                    onChange={(event) => updateField('requiredCount', event.target.value)}
                    className="ui-input"
                  />
                </label>

                <label className="ui-field">
                  Supply drop (%)
                  <input
                    type="number"
                    min="1"
                    value={formState.dropPercent}
                    onChange={(event) => updateField('dropPercent', event.target.value)}
                    className="ui-input"
                  />
                </label>
              </>
            ) : isErc4626WithdrawPreset ? (
              <>
                <label className="ui-field">
                  Vault contract
                  <input
                    type="text"
                    value={formState.vaultContract}
                    onChange={(event) => updateField('vaultContract', event.target.value)}
                    placeholder="0x1111111111111111111111111111111111111111"
                    className="ui-input font-mono"
                  />
                  <span className="ui-helper">
                    Iruka reads `balanceOf(owner)` on this ERC-4626 vault through archive RPC.
                  </span>
                </label>

                <label className="ui-field">
                  Owners required
                  <input
                    type="number"
                    min="1"
                    value={formState.requiredCount}
                    onChange={(event) => updateField('requiredCount', event.target.value)}
                    className="ui-input"
                  />
                </label>

                <label className="ui-field">
                  Share drop (%)
                  <input
                    type="number"
                    min="1"
                    value={formState.dropPercent}
                    onChange={(event) => updateField('dropPercent', event.target.value)}
                    className="ui-input"
                  />
                  <span className="ui-helper">
                    Triggers when each tracked owner reduces shares by at least this percentage over the window.
                  </span>
                </label>
              </>
            ) : (
              <>
                <label className="ui-field">
                  Token contract
                  <input
                    type="text"
                    value={formState.tokenContract}
                    onChange={(event) => updateField('tokenContract', event.target.value)}
                    placeholder="0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
                    className="ui-input font-mono"
                  />
                  <span className="ui-helper">Use the ERC-20 contract that emits the `Transfer` logs you care about.</span>
                </label>

                <label className="ui-field">
                  Watched address
                  <input
                    type="text"
                    value={formState.watchedAddress}
                    onChange={(event) => updateField('watchedAddress', event.target.value)}
                    placeholder="0x1111111111111111111111111111111111111111"
                    className="ui-input font-mono"
                  />
                  <span className="ui-helper">This can be a vault, router, treasury, adapter, or any wallet address.</span>
                </label>

                <label className="ui-field">
                  Transfer threshold (base units)
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formState.amountThreshold}
                    onChange={(event) => updateField('amountThreshold', event.target.value)}
                    className="ui-input"
                  />
                </label>
              </>
            )}

            <label className="ui-field">
              Window
              <input
                type="text"
                value={formState.windowDuration}
                onChange={(event) => updateField('windowDuration', event.target.value)}
                placeholder="24h"
                className="ui-input"
              />
            </label>

            <div className="sm:col-span-2">
              <ScheduleFields
                schedule={formState.schedule}
                onScheduleChange={(value) =>
                  setFormState((current) => ({
                    ...current,
                    schedule: value,
                  }))
                }
              />
            </div>

            <RepeatPolicyFields
              mode={formState.repeatMode}
              cooldownMinutes={formState.cooldownMinutes}
              snoozeMinutes={formState.snoozeMinutes}
              onModeChange={(value) => updateField('repeatMode', value)}
              onCooldownMinutesChange={(value) => updateField('cooldownMinutes', value)}
              onSnoozeMinutesChange={(value) => updateField('snoozeMinutes', value)}
            />

            <label className="ui-field sm:col-span-2">
              Description
              <input
                type="text"
                value={formState.description}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="Optional description shown in Iruka"
                className="ui-input"
              />
            </label>
          </div>

          {isMorphoWhalePreset ? (
            <label className="ui-field mt-4">
              Wallet addresses
              <textarea
                value={formState.whaleAddresses}
                onChange={(event) => updateField('whaleAddresses', event.target.value)}
                placeholder={`0x1111111111111111111111111111111111111111\n0x2222222222222222222222222222222222222222\n0x3333333333333333333333333333333333333333`}
                rows={7}
                className="ui-textarea font-mono"
              />
              <span className="ui-helper">
                One address per line or comma-separated. Use the suppliers you care about most.
              </span>
            </label>
          ) : isErc4626WithdrawPreset ? (
            <label className="ui-field mt-4">
              Owner addresses
              <textarea
                value={formState.ownerAddresses}
                onChange={(event) => updateField('ownerAddresses', event.target.value)}
                placeholder={`0x1111111111111111111111111111111111111111\n0x2222222222222222222222222222222222222222\n0x3333333333333333333333333333333333333333`}
                rows={7}
                className="ui-textarea font-mono"
              />
              <span className="ui-helper">
                One owner per line or comma-separated. Iruka injects each owner into the group condition at evaluation time.
              </span>
            </label>
          ) : (
            <div className="ui-panel-ghost mt-4 p-4 text-sm text-secondary">
              This template uses Iruka’s `raw-events` ERC-20 transfer preset. Thresholds are compared against token base units, not formatted token decimals. It measures gross flow only, not true net balance change. The broader raw-event catalog also includes approvals, ERC-721 events, ERC-4626 deposits and withdrawals, swap presets, and `contract_event` for custom ABI signatures.
            </div>
          )}

          {!telegramLinked ? (
            <p className="text-sm text-secondary">Template signals use Telegram delivery. Connect Telegram before creating one.</p>
          ) : null}

          {error ? <p className="ui-notice text-sm" data-tone="danger">{error}</p> : null}

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button onClick={handleSubmit} disabled={isSubmitting || Boolean(previewError) || !telegramLinked}>
              {isSubmitting ? 'Creating signal...' : telegramLinked ? 'Create custom signal' : 'Connect Telegram to create'}
            </Button>
            <Button variant="secondary" type="button" onClick={() => setFormState(buildDefaultState(selectedPreset))}>
              Reset fields
            </Button>
          </div>
        </SignalPresetCard>

        <div className="ui-panel space-y-4 p-6">
          <div>
            <p className="ui-stat-label mb-2">Preview</p>
            <h3 className="font-display text-[1.75rem] leading-none text-foreground">{previewTitle}</h3>
            <p className="mt-3 text-sm text-secondary">{previewDescription}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {previewStatsWithSchedule.map((stat) => (
              <div key={stat.label} className="ui-stat">
                <p className="ui-stat-label">{stat.label}</p>
                <p className="ui-stat-value break-all">{stat.value}</p>
              </div>
            ))}
          </div>

          {!previewError && previewDefinition && previewPayload ? (
            <>
              <div className="ui-panel-ghost p-4">
                <p className="text-sm text-secondary">{describeSignalDefinition(previewPayload.definition)}</p>
              </div>
              <CodeBlock
                code={previewDefinition}
                language="json"
                filename="signal-preview.json"
                tone="light"
                showLineNumbers
              />
            </>
          ) : (
            <div className="ui-notice text-sm" data-tone="danger">
              {previewError ?? 'Fill in the form to generate a template preview.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
