import type {
  ChangeCondition,
  CreateSignalRequest,
  GroupCondition,
  RawEventKind,
  RawEventsCondition,
  SignalCondition,
  SignalDefinition,
  SignalRecord,
} from '@/lib/types/signal';

export type SignalTemplateKind = 'morpho-whale' | 'erc20-transfer';

export type WhaleTemplateId = 'whale-exit-trio' | 'whale-exit-pair' | 'single-whale-exit';
export type Erc20TransferTemplateId = 'erc20-inflow-watch' | 'erc20-outflow-watch';
export type SignalTemplateId = WhaleTemplateId | Erc20TransferTemplateId;

interface BaseSignalTemplatePreset<TId extends SignalTemplateId, TKind extends SignalTemplateKind, TDefaults> {
  id: TId;
  kind: TKind;
  title: string;
  description: string;
  accent: string;
  defaults: TDefaults;
}

export type WhaleSignalTemplatePreset = BaseSignalTemplatePreset<
  WhaleTemplateId,
  'morpho-whale',
  {
    chainId: number;
    requiredCount: number;
    dropPercent: number;
    windowDuration: string;
    cooldownMinutes: number;
  }
>;

export type Erc20TransferTemplatePreset = BaseSignalTemplatePreset<
  Erc20TransferTemplateId,
  'erc20-transfer',
  {
    chainId: number;
    amountThreshold: number;
    windowDuration: string;
    cooldownMinutes: number;
  }
> & {
  direction: 'inflow' | 'outflow';
};

export type SignalTemplatePreset = WhaleSignalTemplatePreset | Erc20TransferTemplatePreset;

interface BaseTemplateRequest<TId extends SignalTemplateId> {
  templateId: TId;
  chainId?: number;
  windowDuration?: string;
  cooldownMinutes?: number;
  name?: string;
  description?: string;
}

export interface WhaleTemplateRequest extends BaseTemplateRequest<WhaleTemplateId> {
  marketId: string;
  whaleAddresses: string[] | string;
  requiredCount?: number;
  dropPercent?: number;
}

export interface Erc20TransferTemplateRequest extends BaseTemplateRequest<Erc20TransferTemplateId> {
  tokenContract: string;
  watchedAddress: string;
  amountThreshold?: number;
}

export type SignalTemplateRequest = WhaleTemplateRequest | Erc20TransferTemplateRequest;

export interface SignalFocusDetails {
  label: 'Market' | 'Asset' | 'Address' | 'Scope';
  value: string;
  hint?: string;
  href?: string;
}

export class SignalTemplateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SignalTemplateError';
  }
}

export const SIGNAL_TEMPLATE_PRESETS: SignalTemplatePreset[] = [
  {
    id: 'whale-exit-trio',
    kind: 'morpho-whale',
    title: 'Whale Exit Trio',
    description: 'Trigger when 3 tracked Morpho suppliers each cut their position by at least 20% over 7 days.',
    accent: '3 of N suppliers, -20%, 7d',
    defaults: {
      chainId: 1,
      requiredCount: 3,
      dropPercent: 20,
      windowDuration: '7d',
      cooldownMinutes: 60,
    },
  },
  {
    id: 'whale-exit-pair',
    kind: 'morpho-whale',
    title: 'Pair Exit Watch',
    description: 'Catch two large suppliers leaving together before the whole market feels the move.',
    accent: '2 of N suppliers, -15%, 3d',
    defaults: {
      chainId: 1,
      requiredCount: 2,
      dropPercent: 15,
      windowDuration: '3d',
      cooldownMinutes: 30,
    },
  },
  {
    id: 'single-whale-exit',
    kind: 'morpho-whale',
    title: 'Single Whale Exit',
    description: 'Track one major wallet and fire as soon as it meaningfully unwinds a supply position.',
    accent: '1 supplier, -25%, 24h',
    defaults: {
      chainId: 1,
      requiredCount: 1,
      dropPercent: 25,
      windowDuration: '24h',
      cooldownMinutes: 15,
    },
  },
  {
    id: 'erc20-inflow-watch',
    kind: 'erc20-transfer',
    title: 'ERC-20 Inflow Watch',
    description: 'Sum gross inbound ERC-20 transfers to one address and trigger when that inflow exceeds a threshold.',
    accent: 'sum(value) to address',
    direction: 'inflow',
    defaults: {
      chainId: 1,
      amountThreshold: 1000000,
      windowDuration: '24h',
      cooldownMinutes: 15,
    },
  },
  {
    id: 'erc20-outflow-watch',
    kind: 'erc20-transfer',
    title: 'ERC-20 Outflow Watch',
    description: 'Sum gross outbound ERC-20 transfers from one address and trigger when that outflow exceeds a threshold.',
    accent: 'sum(value) from address',
    direction: 'outflow',
    defaults: {
      chainId: 1,
      amountThreshold: 1000000,
      windowDuration: '24h',
      cooldownMinutes: 15,
    },
  },
];

const ETH_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;
const HEX_IDENTIFIER_PATTERN = /^0x[a-fA-F0-9]{8,}$/;

const normalizeAddress = (value: string) => value.trim().toLowerCase();

const formatCompactIdentifier = (value: string) => {
  const trimmed = value.trim();
  if (trimmed.length <= 16) {
    return trimmed;
  }

  if (HEX_IDENTIFIER_PATTERN.test(trimmed)) {
    return `${trimmed.slice(0, 6)}...${trimmed.slice(-4)}`;
  }

  return trimmed;
};

const parseRequiredAddress = (value: string, label: string) => {
  const normalized = normalizeAddress(value);
  if (!normalized) {
    throw new SignalTemplateError(`${label} is required.`);
  }

  if (!ETH_ADDRESS_PATTERN.test(normalized)) {
    throw new SignalTemplateError(`Invalid ${label.toLowerCase()}: ${normalized}`);
  }

  return normalized;
};

const assertPositiveChainId = (value: number) => {
  if (!Number.isInteger(value) || value < 1) {
    throw new SignalTemplateError('Chain ID must be a positive integer.');
  }
};

const assertNonNegativeCooldown = (value: number) => {
  if (!Number.isInteger(value) || value < 0) {
    throw new SignalTemplateError('Cooldown minutes cannot be negative.');
  }
};

const buildManagedTelegramSignal = (
  name: string,
  description: string,
  definition: SignalDefinition,
  cooldownMinutes: number
): CreateSignalRequest => ({
  name,
  description,
  definition,
  delivery: {
    provider: 'telegram',
  },
  cooldown_minutes: cooldownMinutes,
});

export const parseWhaleAddresses = (value: string[] | string) => {
  const rawValues = Array.isArray(value) ? value : value.split(/[\n,]/);
  const unique = Array.from(new Set(rawValues.map(normalizeAddress).filter(Boolean)));

  if (unique.length === 0) {
    throw new SignalTemplateError('Add at least one wallet address.');
  }

  const invalid = unique.find((address) => !ETH_ADDRESS_PATTERN.test(address));
  if (invalid) {
    throw new SignalTemplateError(`Invalid wallet address: ${invalid}`);
  }

  return unique;
};

const getPreset = (templateId: SignalTemplateId) => {
  const preset = SIGNAL_TEMPLATE_PRESETS.find((item) => item.id === templateId);
  if (!preset) {
    throw new SignalTemplateError(`Unknown template: ${templateId}`);
  }
  return preset;
};

const getWhaleChangeCondition = (definition: SignalDefinition) => {
  const group = definition.conditions.find((condition): condition is GroupCondition => condition.type === 'group');
  const change = group?.conditions.find(
    (condition): condition is ChangeCondition =>
      condition.type === 'change' && condition.metric === 'Morpho.Position.supplyShares'
  );

  return {
    group,
    change,
  };
};

const getRawEventsCondition = (definition: SignalDefinition) =>
  definition.conditions.find((condition): condition is RawEventsCondition => condition.type === 'raw-events');

const getRawEventLabel = (kind: RawEventKind) => {
  switch (kind) {
    case 'erc20_transfer':
      return 'ERC-20 transfers';
    case 'contract_event':
      return 'contract events';
    case 'swap':
      return 'swap events';
  }
};

const getConditionMarketId = (condition: SignalCondition): string | null => {
  if ('market_id' in condition && typeof condition.market_id === 'string' && condition.market_id) {
    return condition.market_id;
  }

  if (condition.type === 'group') {
    for (const nestedCondition of condition.conditions) {
      const nestedMarketId = getConditionMarketId(nestedCondition);
      if (nestedMarketId) {
        return nestedMarketId;
      }
    }
  }

  return null;
};

const getRawEventFilterStringValue = (condition: RawEventsCondition, field: string) => {
  const filter = condition.filters?.find(
    (item) => item.field === field && item.op === 'eq' && typeof item.value === 'string'
  );

  return typeof filter?.value === 'string' ? normalizeAddress(filter.value) : null;
};

const getRawEventFlowDirection = (condition: RawEventsCondition): 'inflow' | 'outflow' | null => {
  if (getRawEventFilterStringValue(condition, 'to')) {
    return 'inflow';
  }

  if (getRawEventFilterStringValue(condition, 'from')) {
    return 'outflow';
  }

  return null;
};

const getRawEventTrackedAddress = (condition: RawEventsCondition) =>
  getRawEventFilterStringValue(condition, 'to') ?? getRawEventFilterStringValue(condition, 'from');

const getRawEventTokenAddress = (condition: RawEventsCondition) => {
  const address = condition.event.contract_addresses?.[0];
  return typeof address === 'string' ? normalizeAddress(address) : null;
};

export const describeSignalDefinition = (definition: SignalDefinition) => {
  const { group, change } = getWhaleChangeCondition(definition);
  if (group && change && 'percent' in change.by) {
    const duration = group.window?.duration ?? change.window?.duration ?? definition.window.duration;
    return `${group.requirement.count} of ${group.addresses.length} tracked wallets drop supply by ${change.by.percent}% within ${duration}.`;
  }

  const rawEvents = getRawEventsCondition(definition);
  if (rawEvents) {
    const duration = rawEvents.window?.duration ?? definition.window.duration;
    if (rawEvents.event.kind === 'erc20_transfer') {
      const direction = getRawEventFlowDirection(rawEvents);
      const trackedAddress = getRawEventTrackedAddress(rawEvents);
      const tokenAddress = getRawEventTokenAddress(rawEvents);

      if (direction && trackedAddress && rawEvents.aggregation === 'sum' && rawEvents.field === 'value') {
        const directionLabel = direction === 'inflow' ? 'inflow to' : 'outflow from';
        const tokenSummary = tokenAddress ? ` for ${formatCompactIdentifier(tokenAddress)}` : '';
        return `ERC-20 ${directionLabel} ${formatCompactIdentifier(trackedAddress)}${tokenSummary} exceeds ${rawEvents.value} base units within ${duration}.`;
      }

      if (direction && trackedAddress && rawEvents.aggregation === 'count') {
        const directionLabel = direction === 'inflow' ? 'into' : 'out of';
        return `Count ERC-20 transfers ${directionLabel} ${formatCompactIdentifier(trackedAddress)} > ${rawEvents.value} within ${duration}.`;
      }
    }

    const eventLabel = getRawEventLabel(rawEvents.event.kind);
    if (rawEvents.aggregation === 'count') {
      return `Count ${eventLabel} ${rawEvents.operator} ${rawEvents.value} within ${duration}.`;
    }

    return `${rawEvents.aggregation} ${eventLabel} ${rawEvents.field ?? 'value'} ${rawEvents.operator} ${rawEvents.value} within ${duration}.`;
  }

  const firstCondition = definition.conditions[0];
  if (!firstCondition) {
    return 'Signal definition is empty.';
  }

  if (firstCondition.type === 'aggregate') {
    return `${firstCondition.aggregation} ${firstCondition.metric} ${firstCondition.operator} ${firstCondition.value}`;
  }

  if (firstCondition.type === 'threshold') {
    return `${firstCondition.metric} ${firstCondition.operator} ${firstCondition.value}`;
  }

  if (firstCondition.type === 'change') {
    const amount =
      'percent' in firstCondition.by ? `${firstCondition.by.percent}%` : `${firstCondition.by.absolute} absolute`;
    return `${firstCondition.metric} ${firstCondition.direction} by ${amount}`;
  }

  return `${definition.conditions.length} condition signal`;
};

export const countTrackedWallets = (definition: SignalDefinition) => {
  const { group } = getWhaleChangeCondition(definition);
  if (group) {
    return group.addresses.length;
  }

  return definition.scope.addresses?.length ?? 0;
};

export const getSignalTrackingSummary = (definition: SignalDefinition) => {
  const rawEvents = getRawEventsCondition(definition);
  if (rawEvents) {
    const direction = getRawEventFlowDirection(rawEvents);
    const trackedAddress = getRawEventTrackedAddress(rawEvents);
    if (direction && trackedAddress) {
      return `${direction === 'inflow' ? 'Inflow to' : 'Outflow from'} ${formatCompactIdentifier(trackedAddress)}`;
    }

    return getRawEventLabel(rawEvents.event.kind);
  }

  const trackedWallets = countTrackedWallets(definition);
  if (trackedWallets > 0) {
    return `${trackedWallets} wallet${trackedWallets === 1 ? '' : 's'}`;
  }

  return `${definition.conditions.length} condition${definition.conditions.length === 1 ? '' : 's'}`;
};

const extractMarketIdentifier = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  try {
    const url = new URL(trimmed);
    const lastPathSegment = url.pathname.split('/').filter(Boolean).at(-1);
    if (lastPathSegment?.startsWith('0x')) {
      return lastPathSegment.toLowerCase();
    }
  } catch {}

  const hexMatch = trimmed.match(/0x[a-fA-F0-9]{8,}/g);
  if (hexMatch && hexMatch.length > 0) {
    return hexMatch[hexMatch.length - 1].toLowerCase();
  }

  return trimmed;
};

export const normalizeSignalMarketId = (value: string) => extractMarketIdentifier(value);

export const getSignalMarketId = (definition: SignalDefinition) => {
  const marketValue = definition.scope.markets?.[0] ?? definition.conditions.map(getConditionMarketId).find(Boolean);
  if (!marketValue) {
    return '—';
  }

  return normalizeSignalMarketId(marketValue);
};

export const getSignalPrimaryChainId = (definition: SignalDefinition): number | null => {
  const scopeChainId = definition.scope.chains.find((chainId) => Number.isFinite(chainId));
  if (typeof scopeChainId === 'number') {
    return scopeChainId;
  }

  for (const condition of definition.conditions) {
    if ('chain_id' in condition && typeof condition.chain_id === 'number') {
      return condition.chain_id;
    }

    if (condition.type === 'group') {
      const nestedChainId = condition.conditions.find(
        (nestedCondition) => 'chain_id' in nestedCondition && typeof nestedCondition.chain_id === 'number'
      );

      if (nestedChainId && 'chain_id' in nestedChainId && typeof nestedChainId.chain_id === 'number') {
        return nestedChainId.chain_id;
      }
    }
  }

  return null;
};

export const getSignalMarketHref = (definition: SignalDefinition) => {
  const chainId = getSignalPrimaryChainId(definition);
  const marketId = getSignalMarketId(definition);

  if (marketId === '—' || chainId === null) {
    return null;
  }

  return `https://www.monarchlend.xyz/market/${chainId}/${marketId}`;
};

export const getSignalFocusDetails = (definition: SignalDefinition): SignalFocusDetails => {
  const marketId = getSignalMarketId(definition);
  const marketHref = getSignalMarketHref(definition);
  const primaryChainId = getSignalPrimaryChainId(definition);
  if (marketId !== '—') {
    return {
      label: 'Market',
      value: marketId,
      hint: primaryChainId !== null ? `Chain ${primaryChainId}` : undefined,
      href: marketHref ?? undefined,
    };
  }

  const rawEvents = getRawEventsCondition(definition);
  if (rawEvents?.event.kind === 'erc20_transfer') {
    const tokenAddress = getRawEventTokenAddress(rawEvents);
    const trackedAddress = getRawEventTrackedAddress(rawEvents);
    const direction = getRawEventFlowDirection(rawEvents);

    if (tokenAddress) {
      return {
        label: 'Asset',
        value: tokenAddress,
        hint:
          trackedAddress && direction
            ? `${direction === 'inflow' ? 'Inflow to' : 'Outflow from'} ${formatCompactIdentifier(trackedAddress)}`
            : trackedAddress
              ? `Address ${formatCompactIdentifier(trackedAddress)}`
              : undefined,
      };
    }

    if (trackedAddress) {
      return {
        label: 'Address',
        value: trackedAddress,
        hint: direction === 'inflow' ? 'Inbound transfer watch' : direction === 'outflow' ? 'Outbound transfer watch' : undefined,
      };
    }
  }

  const primaryAddress = definition.scope.addresses?.[0];
  if (primaryAddress) {
    return {
      label: 'Address',
      value: primaryAddress,
      hint:
        definition.scope.addresses && definition.scope.addresses.length > 1
          ? `${definition.scope.addresses.length} addresses in scope`
          : undefined,
    };
  }

  return {
    label: 'Scope',
    value: `Chains ${definition.scope.chains.join(', ') || '—'}`,
  };
};

export const getSignalScopeSummary = (definition: SignalDefinition) => {
  const focus = getSignalFocusDetails(definition);
  const compactValue = focus.label === 'Scope' ? focus.value : formatCompactIdentifier(focus.value);
  return focus.hint ? `${focus.label}: ${compactValue} · ${focus.hint}` : `${focus.label}: ${compactValue}`;
};

export const buildWhaleMovementTemplate = (input: WhaleTemplateRequest): CreateSignalRequest => {
  const preset = getPreset(input.templateId);
  if (preset.kind !== 'morpho-whale') {
    throw new SignalTemplateError(`Template ${input.templateId} is not a Morpho whale template.`);
  }

  const whaleAddresses = parseWhaleAddresses(input.whaleAddresses);
  const chainId = input.chainId ?? preset.defaults.chainId;
  const requiredCount = input.requiredCount ?? preset.defaults.requiredCount;
  const dropPercent = input.dropPercent ?? preset.defaults.dropPercent;
  const windowDuration = input.windowDuration?.trim() || preset.defaults.windowDuration;
  const cooldownMinutes = input.cooldownMinutes ?? preset.defaults.cooldownMinutes;
  const marketId = normalizeSignalMarketId(input.marketId);

  assertPositiveChainId(chainId);

  if (!marketId) {
    throw new SignalTemplateError('Market ID is required.');
  }

  if (!Number.isInteger(requiredCount) || requiredCount < 1) {
    throw new SignalTemplateError('Required wallet count must be at least 1.');
  }

  if (requiredCount > whaleAddresses.length) {
    throw new SignalTemplateError('Required wallet count cannot exceed the number of tracked addresses.');
  }

  if (!Number.isFinite(dropPercent) || dropPercent <= 0) {
    throw new SignalTemplateError('Drop percent must be greater than 0.');
  }

  assertNonNegativeCooldown(cooldownMinutes);

  const definition: SignalDefinition = {
    scope: {
      chains: [chainId],
      markets: [marketId],
      protocol: 'morpho',
    },
    window: {
      duration: windowDuration,
    },
    logic: 'AND',
    conditions: [
      {
        type: 'group',
        addresses: whaleAddresses,
        requirement: {
          count: requiredCount,
          of: whaleAddresses.length,
        },
        logic: 'AND',
        window: {
          duration: windowDuration,
        },
        conditions: [
          {
            type: 'change',
            metric: 'Morpho.Position.supplyShares',
            direction: 'decrease',
            by: {
              percent: dropPercent,
            },
            window: {
              duration: windowDuration,
            },
            chain_id: chainId,
            market_id: marketId,
          },
        ],
      },
    ],
  };

  const generatedName = `Morpho whale watch: ${requiredCount}/${whaleAddresses.length} suppliers -${dropPercent}% in ${windowDuration}`;

  return buildManagedTelegramSignal(
    input.name?.trim() || generatedName,
    input.description?.trim() ||
      `Watches ${whaleAddresses.length} Morpho supplier wallets and triggers when ${requiredCount} of them reduce supply shares by at least ${dropPercent}% over ${windowDuration}.`,
    definition,
    cooldownMinutes
  );
};

export const buildErc20TransferTemplate = (input: Erc20TransferTemplateRequest): CreateSignalRequest => {
  const preset = getPreset(input.templateId);
  if (preset.kind !== 'erc20-transfer') {
    throw new SignalTemplateError(`Template ${input.templateId} is not an ERC-20 transfer template.`);
  }

  const chainId = input.chainId ?? preset.defaults.chainId;
  const windowDuration = input.windowDuration?.trim() || preset.defaults.windowDuration;
  const cooldownMinutes = input.cooldownMinutes ?? preset.defaults.cooldownMinutes;
  const amountThreshold = input.amountThreshold ?? preset.defaults.amountThreshold;
  const tokenContract = parseRequiredAddress(input.tokenContract, 'Token contract address');
  const watchedAddress = parseRequiredAddress(input.watchedAddress, 'Watched address');
  const watchedField = preset.direction === 'inflow' ? 'to' : 'from';

  assertPositiveChainId(chainId);

  if (!Number.isFinite(amountThreshold) || amountThreshold <= 0) {
    throw new SignalTemplateError('Transfer threshold must be greater than 0.');
  }

  assertNonNegativeCooldown(cooldownMinutes);

  const definition: SignalDefinition = {
    scope: {
      chains: [chainId],
      addresses: [watchedAddress],
      protocol: 'all',
    },
    window: {
      duration: windowDuration,
    },
    logic: 'AND',
    conditions: [
      {
        type: 'raw-events',
        aggregation: 'sum',
        field: 'value',
        operator: '>',
        value: amountThreshold,
        window: {
          duration: windowDuration,
        },
        chain_id: chainId,
        event: {
          kind: 'erc20_transfer',
          contract_addresses: [tokenContract],
        },
        filters: [
          {
            field: watchedField,
            op: 'eq',
            value: watchedAddress,
          },
        ],
      },
    ],
  };

  const directionLabel = preset.direction === 'inflow' ? 'inflow' : 'outflow';
  const generatedName = `ERC-20 ${directionLabel} watch: ${formatCompactIdentifier(watchedAddress)} in ${windowDuration}`;

  return buildManagedTelegramSignal(
    input.name?.trim() || generatedName,
    input.description?.trim() ||
      `Watches ERC-20 Transfer logs for ${tokenContract} and triggers when gross ${directionLabel} for ${watchedAddress} exceeds ${amountThreshold} base units over ${windowDuration}.`,
    definition,
    cooldownMinutes
  );
};

export const buildSignalTemplate = (input: SignalTemplateRequest): CreateSignalRequest => {
  switch (input.templateId) {
    case 'whale-exit-trio':
    case 'whale-exit-pair':
    case 'single-whale-exit':
      return buildWhaleMovementTemplate(input);
    case 'erc20-inflow-watch':
    case 'erc20-outflow-watch':
      return buildErc20TransferTemplate(input);
  }
};

export const getTemplatePreset = (templateId: SignalTemplateId) => getPreset(templateId);

export const isWhaleMovementSignal = (signal: SignalRecord) => {
  const { group, change } = getWhaleChangeCondition(signal.definition);
  return Boolean(group && change);
};
