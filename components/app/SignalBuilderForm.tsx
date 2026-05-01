'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  RiAlarmWarningLine,
  RiArrowDownLine,
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
  transferFromAddress: string;
  transferToAddress: string;
  chainId: string;
  requiredCount: string;
  dropPercent: string;
  balanceAbsoluteAmount: string;
  balanceDirection: 'increase' | 'decrease';
  balanceThresholdMode: 'percent' | 'absolute';
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
  hideTemplateSelector?: boolean;
}

const presetIcons: Record<SignalTemplateId, ReactNode> = {
  'whale-exit-trio': <RiAlarmWarningLine className="w-5 h-5" />,
  'whale-exit-pair': <RiExchangeDollarLine className="w-5 h-5" />,
  'single-whale-exit': <RiUserSearchLine className="w-5 h-5" />,
  'erc20-event-aggregation-watch': <RiArrowDownLine className="w-5 h-5" />,
  'erc20-balance-watch': <RiExchangeDollarLine className="w-5 h-5" />,
  'erc4626-withdraw-percent-watch': <RiExchangeDollarLine className="w-5 h-5" />,
  'lp-pool-liquidity-drop': <RiExchangeDollarLine className="w-5 h-5" />,
};

const COMMON_ERC20_TOKENS = [
  {
    label: 'USDC',
    symbol: 'USDC',
    address: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    note: 'Circle USD Coin on Ethereum',
  },
  {
    label: 'USDT',
    symbol: 'USDT',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    note: 'Tether USD on Ethereum',
  },
  {
    label: 'DAI',
    symbol: 'DAI',
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    note: 'Maker DAI on Ethereum',
  },
  {
    label: 'WETH',
    symbol: 'WETH',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    note: 'Wrapped Ether on Ethereum',
  },
  {
    label: 'WBTC',
    symbol: 'WBTC',
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    note: 'Wrapped Bitcoin on Ethereum',
  },
  {
    label: 'AAVE',
    symbol: 'AAVE',
    address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDAE9',
    note: 'Aave governance token on Ethereum',
  },
  {
    label: 'sUSDe',
    symbol: 'sUSDe',
    address: '0x9D39A5DE30E57443BFF2A8307A4256C8797A3497',
    note: 'Ethena staked USDe on Ethereum',
  },
] as const;

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
    tokenContract:
      preset.kind === 'erc20-balance' || preset.kind === 'erc20-transfer' ? COMMON_ERC20_TOKENS[0].address : '',
    watchedAddress: '',
    transferFromAddress: '',
    transferToAddress: '',
    chainId: String(preset.defaults.chainId),
    requiredCount:
      preset.kind === 'morpho-whale' || preset.kind === 'erc4626-withdraw'
        ? String(preset.defaults.requiredCount)
        : '1',
    dropPercent:
      preset.kind === 'morpho-whale'
        ? String(preset.defaults.dropPercent)
        : preset.kind === 'erc4626-withdraw'
          ? String(preset.defaults.dropPercent)
          : preset.kind === 'erc20-balance'
            ? String(preset.defaults.percentThreshold)
            : '20',
    balanceAbsoluteAmount: preset.kind === 'erc20-balance' ? String(preset.defaults.absoluteThreshold) : '1000000',
    balanceDirection: preset.kind === 'erc20-balance' ? preset.defaults.direction : 'decrease',
    balanceThresholdMode: preset.kind === 'erc20-balance' ? preset.defaults.thresholdMode : 'percent',
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
    title: 'Tokens',
    summary: 'ERC-20 balance and event builders',
    helpText: 'Use archive-RPC balance reads or raw Transfer event aggregation for ERC-20 monitoring.',
    kinds: ['erc20-balance', 'erc20-transfer'],
  },
];

export function SignalBuilderForm({ initialPreset = 'whale-exit-trio', telegramLinked = false, hideTemplateSelector = false }: SignalBuilderFormProps) {
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
  const isErc20BalancePreset = selectedPresetConfig.kind === 'erc20-balance';
  const isErc4626WithdrawPreset = selectedPresetConfig.kind === 'erc4626-withdraw';
  const isLpPoolPreset = selectedPresetConfig.kind === 'lp-pool-liquidity';

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
            fromAddress: formState.transferFromAddress,
            toAddress: formState.transferToAddress,
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
        : selectedPresetConfig.kind === 'erc20-balance'
          ? {
              templateId: selectedPresetConfig.id,
              tokenContract: formState.tokenContract,
              watchedAddress: formState.watchedAddress,
              chainId: Number(formState.chainId),
              balanceDirection: formState.balanceDirection,
              thresholdMode: formState.balanceThresholdMode,
              percentThreshold: Number(formState.dropPercent),
              absoluteThreshold: formState.balanceAbsoluteAmount,
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
          : selectedPresetConfig.kind === 'erc4626-withdraw'
            ? {
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
              }
            : {
                templateId: selectedPresetConfig.id,
                pools: [],
                chainId: Number(formState.chainId),
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
      : isLpPoolPreset
        ? 'LP pool liquidity signal'
        : isErc20BalancePreset
        ? 'ERC-20 balance change signal'
        : 'ERC-20 event aggregation signal';
  const previewDescription = isMorphoWhalePreset
    ? 'Iruka watches the tracked Morpho suppliers and alerts on coordinated exits.'
    : isErc4626WithdrawPreset
      ? 'Iruka watches tracked vault owners and alerts on share withdrawals.'
      : isLpPoolPreset
        ? 'Iruka watches selected LP pools and alerts on liquidity drops.'
        : isErc20BalancePreset
        ? 'Iruka watches one holder balance through archive RPC and alerts on flexible balance changes.'
        : 'Iruka aggregates ERC-20 transfer flow over the selected lookback window.';
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
      : isErc20BalancePreset
        ? [
            { label: 'Asset', value: formatCompactAddress(formState.tokenContract) },
            { label: 'Holder', value: formatCompactAddress(formState.watchedAddress) },
            { label: 'Direction', value: formState.balanceDirection === 'increase' ? 'Increase' : 'Decrease' },
            {
              label: 'Threshold',
              value:
                formState.balanceThresholdMode === 'percent'
                  ? `${formState.dropPercent || '0'}%`
                  : `${formState.balanceAbsoluteAmount || '0'} absolute`,
            },
          ]
        : [
            { label: 'Asset', value: formatCompactAddress(formState.tokenContract) },
            { label: 'From', value: formatCompactAddress(formState.transferFromAddress) },
            { label: 'To', value: formatCompactAddress(formState.transferToAddress) },
            { label: 'Threshold', value: formState.amountThreshold ? `${formState.amountThreshold} base` : '0' },
          ];
  const previewStatsWithSchedule = [...previewStats, { label: 'Wake-up', value: scheduleSummary }];

  return (
    <div className="space-y-6">
      {hideTemplateSelector ? null : (
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
      )}

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
              {isErc20BalancePreset || isErc20TransferPreset ? (
                <span className="ui-helper">Popular token buttons fill Ethereum mainnet contracts and reset Chain ID to 1. You can still replace both values manually.</span>
              ) : null}
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
            ) : isErc20BalancePreset ? (
              <>
                <div className="ui-field sm:col-span-2">
                  Popular tokens
                  <div className="mt-2 flex flex-wrap gap-2">
                    {COMMON_ERC20_TOKENS.map((token) => (
                      <button
                        key={token.symbol}
                        type="button"
                        className="ui-option px-3 py-2 text-sm"
                        onClick={() => {
                          updateField('tokenContract', token.address);
                          updateField('chainId', '1');
                        }}
                      >
                        {token.label}
                      </button>
                    ))}
                  </div>
                  <span className="ui-helper">Start from common Ethereum mainnet tokens, or paste any ERC-20 contract below.</span>
                </div>

                <label className="ui-field">
                  Token contract
                  <input
                    type="text"
                    value={formState.tokenContract}
                    onChange={(event) => updateField('tokenContract', event.target.value)}
                    placeholder="0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
                    className="ui-input font-mono"
                  />
                </label>

                <label className="ui-field">
                  Holder address
                  <input
                    type="text"
                    value={formState.watchedAddress}
                    onChange={(event) => updateField('watchedAddress', event.target.value)}
                    placeholder="0x1111111111111111111111111111111111111111"
                    className="ui-input font-mono"
                  />
                  <span className="ui-helper">Iruka compares this address&apos;s current balance to the balance at the start of the window.</span>
                </label>

                <label className="ui-field">
                  Direction
                  <select
                    value={formState.balanceDirection}
                    onChange={(event) => updateField('balanceDirection', event.target.value)}
                    className="ui-input"
                  >
                    <option value="decrease">Decrease</option>
                    <option value="increase">Increase</option>
                  </select>
                </label>

                <label className="ui-field">
                  Threshold mode
                  <select
                    value={formState.balanceThresholdMode}
                    onChange={(event) => updateField('balanceThresholdMode', event.target.value)}
                    className="ui-input"
                  >
                    <option value="percent">Percent</option>
                    <option value="absolute">Absolute amount</option>
                  </select>
                </label>

                {formState.balanceThresholdMode === 'percent' ? (
                  <label className="ui-field">
                    Balance change (%)
                    <input
                      type="number"
                      min="1"
                      value={formState.dropPercent}
                      onChange={(event) => updateField('dropPercent', event.target.value)}
                      className="ui-input"
                    />
                    <span className="ui-helper">Triggers when the holder balance moves by at least this percentage over the window.</span>
                  </label>
                ) : (
                  <label className="ui-field">
                    Absolute change (base units)
                    <input
                      type="text"
                      value={formState.balanceAbsoluteAmount}
                      onChange={(event) => updateField('balanceAbsoluteAmount', event.target.value)}
                      className="ui-input"
                    />
                    <span className="ui-helper">Use raw token base units, not formatted decimals.</span>
                  </label>
                )}
              </>
            ) : (
              <>
                <div className="ui-field sm:col-span-2">
                  Popular tokens
                  <div className="mt-2 flex flex-wrap gap-2">
                    {COMMON_ERC20_TOKENS.map((token) => (
                      <button
                        key={token.symbol}
                        type="button"
                        className="ui-option px-3 py-2 text-sm"
                        onClick={() => {
                          updateField('tokenContract', token.address);
                          updateField('chainId', '1');
                        }}
                      >
                        {token.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="ui-field sm:col-span-2">
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
                  From address
                  <input
                    type="text"
                    value={formState.transferFromAddress}
                    onChange={(event) => updateField('transferFromAddress', event.target.value)}
                    placeholder="Optional exact sender address"
                    className="ui-input font-mono"
                  />
                </label>

                <label className="ui-field">
                  To address
                  <input
                    type="text"
                    value={formState.transferToAddress}
                    onChange={(event) => updateField('transferToAddress', event.target.value)}
                    placeholder="Optional exact recipient address"
                    className="ui-input font-mono"
                  />
                  <span className="ui-helper">Set one side or both. At least one address filter is required.</span>
                </label>

                <label className="ui-field">
                  Aggregated amount threshold (base units)
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
          ) : isErc20BalancePreset ? (
            <div className="ui-panel-ghost mt-4 p-4 text-sm text-secondary">
              This template uses archive RPC-backed ERC-20 balance reads. Iruka compares the holder&apos;s current balance to the balance at the start of the window, so the alert reflects true balance change rather than gross transfer flow.
            </div>
          ) : (
            <div className="ui-panel-ghost mt-4 p-4 text-sm text-secondary">
              This template aggregates raw ERC-20 `Transfer` events. Thresholds are compared against token base units, not formatted token decimals. Use exact `from` and `to` filters when you want a narrow routed-flow alert.
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
