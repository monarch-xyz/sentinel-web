import type {
  ChangeCondition,
  CreateSignalRequest,
  GroupCondition,
  NumericInput,
  RawEventKind,
  RawEventsCondition,
  SignalCondition,
  SignalDefinition,
  SignalRepeatPolicy,
  SignalRecord,
  SignalSchedule,
  SignalTrigger,
} from '@/lib/types/signal';
import { DEFAULT_SIGNAL_REPEAT_POLICY, normalizeSignalRepeatPolicy } from '@/lib/signals/repeat-policy';

export type SignalTemplateKind = 'morpho-whale' | 'erc20-transfer' | 'erc20-balance' | 'erc4626-withdraw' | 'lp-pool-liquidity';

export type WhaleTemplateId = 'whale-exit-trio' | 'whale-exit-pair' | 'single-whale-exit';
export type Erc20TransferTemplateId = 'erc20-event-aggregation-watch';
export type Erc20BalanceTemplateId = 'erc20-balance-watch';
export type Erc4626WithdrawTemplateId = 'erc4626-withdraw-percent-watch';
export type LpPoolLiquidityTemplateId = 'lp-pool-liquidity-drop';
export type SignalTemplateId =
  | WhaleTemplateId
  | Erc20TransferTemplateId
  | Erc20BalanceTemplateId
  | Erc4626WithdrawTemplateId
  | LpPoolLiquidityTemplateId;

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
>;

export type Erc20BalanceTemplatePreset = BaseSignalTemplatePreset<
  Erc20BalanceTemplateId,
  'erc20-balance',
  {
    chainId: number;
    windowDuration: string;
    cooldownMinutes: number;
    direction: 'increase' | 'decrease';
    thresholdMode: 'percent' | 'absolute';
    percentThreshold: number;
    absoluteThreshold: NumericInput;
  }
>;

export type Erc4626WithdrawTemplatePreset = BaseSignalTemplatePreset<
  Erc4626WithdrawTemplateId,
  'erc4626-withdraw',
  {
    chainId: number;
    requiredCount: number;
    windowDuration: string;
    cooldownMinutes: number;
    dropPercent: number;
  }
>;

export type LpPoolLiquidityTemplatePreset = BaseSignalTemplatePreset<
  LpPoolLiquidityTemplateId,
  'lp-pool-liquidity',
  {
    chainId: number;
    dropPercent: number;
    windowDuration: string;
    cooldownMinutes: number;
  }
>;

export type SignalTemplatePreset =
  | WhaleSignalTemplatePreset
  | Erc20TransferTemplatePreset
  | Erc20BalanceTemplatePreset
  | Erc4626WithdrawTemplatePreset
  | LpPoolLiquidityTemplatePreset;

interface BaseTemplateRequest<TId extends SignalTemplateId> {
  templateId: TId;
  chainId?: number;
  windowDuration?: string;
  cooldownMinutes?: number;
  schedule?: SignalSchedule;
  repeatPolicy?: SignalRepeatPolicy;
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
  fromAddress?: string;
  toAddress?: string;
  amountThreshold?: number;
}

export interface Erc20BalanceTemplateRequest extends BaseTemplateRequest<Erc20BalanceTemplateId> {
  tokenContract: string;
  watchedAddress: string;
  balanceDirection?: 'increase' | 'decrease';
  thresholdMode?: 'percent' | 'absolute';
  percentThreshold?: number;
  absoluteThreshold?: NumericInput;
}

export interface Erc4626WithdrawTemplateRequest extends BaseTemplateRequest<Erc4626WithdrawTemplateId> {
  vaultContract: string;
  ownerAddresses: string[] | string;
  requiredCount?: number;
  dropPercent?: number;
}

export interface LpPoolTemplatePoolInput {
  protocol: 'uniswap_v3' | 'uniswap_v4';
  address: string;
  poolId?: string;
  label?: string;
}

export interface LpPoolLiquidityTemplateRequest extends BaseTemplateRequest<LpPoolLiquidityTemplateId> {
  pools: LpPoolTemplatePoolInput[];
  dropPercent?: number;
}

export type SignalTemplateRequest =
  | WhaleTemplateRequest
  | Erc20TransferTemplateRequest
  | Erc20BalanceTemplateRequest
  | Erc4626WithdrawTemplateRequest
  | LpPoolLiquidityTemplateRequest;

export interface SignalFocusDetails {
  label: 'Market' | 'Vault' | 'Asset' | 'Address' | 'Chain' | 'Pool';
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
    description: 'Trigger when 3 tracked Morpho suppliers each cut `Morpho.Position.supplyShares` by at least 20% over 7 days.',
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
    description: 'Catch two large suppliers leaving together by watching the canonical `Morpho.Position.supplyShares` state alias.',
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
    description: 'Track one major wallet and fire as soon as the canonical Morpho supply-share state read meaningfully unwinds.',
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
    id: 'erc20-event-aggregation-watch',
    kind: 'erc20-transfer',
    title: 'ERC-20 Event Aggregation',
    description: 'Aggregate ERC-20 transfer value over a rolling window with exact token, from, and to filters.',
    accent: 'raw-events · sum(value) · exact filters',
    defaults: {
      chainId: 1,
      amountThreshold: 1000000,
      windowDuration: '24h',
      cooldownMinutes: 15,
    },
  },
  {
    id: 'erc20-balance-watch',
    kind: 'erc20-balance',
    title: 'Custom ERC-20 Balance Watch',
    description: 'Track one holder balance and alert on ERC-20 increases or decreases by percent or absolute amount.',
    accent: 'archive RPC · balanceOf(address) · flexible threshold',
    defaults: {
      chainId: 1,
      direction: 'decrease',
      thresholdMode: 'percent',
      percentThreshold: 20,
      absoluteThreshold: '1000000',
      windowDuration: '2h',
      cooldownMinutes: 15,
    },
  },
  {
    id: 'erc4626-withdraw-percent-watch',
    kind: 'erc4626-withdraw',
    title: 'ERC-4626 Owner Withdraw %',
    description:
      'Track archive-RPC share balance changes for one ERC-4626 vault and trigger when N tracked owners each reduce shares by at least a percentage.',
    accent: 'state metric · N of N owners · % shares',
    defaults: {
      chainId: 1,
      requiredCount: 3,
      dropPercent: 20,
      windowDuration: '7d',
      cooldownMinutes: 60,
    },
  },
  {
    id: 'lp-pool-liquidity-drop',
    kind: 'lp-pool-liquidity',
    title: 'LP Pool Liquidity Drop',
    description: 'Track one or more LP pools and trigger when pool liquidity drops by a percentage over a rolling window.',
    accent: 'state_ref · uniswap_v3/v4 · percent drop',
    defaults: {
      chainId: 1,
      dropPercent: 20,
      windowDuration: '1h',
      cooldownMinutes: 15,
    },
  },
];

const ETH_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;
const HEX_IDENTIFIER_PATTERN = /^0x[a-fA-F0-9]{8,}$/;
const BYTES32_PATTERN = /^0x[a-fA-F0-9]{64}$/;

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

const isFiveFieldCronExpression = (value: string) => value.trim().split(/\s+/).length === 5;

const normalizeTemplateSchedule = (schedule?: SignalSchedule): SignalSchedule => {
  if (!schedule) {
    return {
      kind: 'interval',
      interval_seconds: 300,
    };
  }

  if (schedule.kind === 'interval') {
    if (!Number.isInteger(schedule.interval_seconds) || schedule.interval_seconds < 1) {
      throw new SignalTemplateError('Interval seconds must be a positive integer.');
    }

    return schedule;
  }

  const expression = schedule.expression.trim();
  if (!expression || !isFiveFieldCronExpression(expression)) {
    throw new SignalTemplateError('Cron expressions must use standard five-field syntax.');
  }

  return {
    kind: 'cron',
    expression,
  };
};

const assertRepeatPolicy = (repeatPolicy: SignalRepeatPolicy) => {
  if (repeatPolicy.mode !== 'post_first_alert_snooze') {
    return;
  }

  if (!Number.isInteger(repeatPolicy.snooze_minutes) || repeatPolicy.snooze_minutes < 1) {
    throw new SignalTemplateError('Snooze minutes must be a positive integer.');
  }
};

const withCooldownRepeatPolicy = (repeatPolicy: SignalRepeatPolicy, cooldownMinutes: number): SignalRepeatPolicy => {
  if (repeatPolicy.mode !== 'cooldown') {
    return repeatPolicy;
  }

  return {
    ...repeatPolicy,
    cooldown_minutes: cooldownMinutes,
  };
};

const buildManagedTelegramSignal = (
  name: string,
  description: string,
  definition: SignalDefinition,
  cooldownMinutes: number,
  repeatPolicy: SignalRepeatPolicy = DEFAULT_SIGNAL_REPEAT_POLICY,
  schedule?: SignalSchedule
): CreateSignalRequest => {
  const metadataRepeatPolicy = withCooldownRepeatPolicy(repeatPolicy, cooldownMinutes);
  const normalizedSchedule = normalizeTemplateSchedule(schedule);

  return {
    version: '1',
    name,
    triggers: [
      {
        type: 'schedule',
        schedule: normalizedSchedule,
      },
    ],
    definition,
    delivery: [{ type: 'telegram' }],
    metadata: {
      description,
      repeat_policy: metadataRepeatPolicy,
    },
  };
};

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

export const parseTrackedAddresses = parseWhaleAddresses;

const getPreset = (templateId: SignalTemplateId) => {
  const preset = SIGNAL_TEMPLATE_PRESETS.find((item) => item.id === templateId);
  if (!preset) {
    throw new SignalTemplateError(`Unknown template: ${templateId}`);
  }
  return preset;
};

const getGroupChangeCondition = (definition: SignalDefinition, metric: string) => {
  const group = definition.conditions.find((condition): condition is GroupCondition => condition.type === 'group');
  const change = group?.conditions.find(
    (condition): condition is ChangeCondition =>
      condition.type === 'change' && condition.metric === metric
  );

  return {
    group,
    change,
  };
};

const getWhaleChangeCondition = (definition: SignalDefinition) =>
  getGroupChangeCondition(definition, 'Morpho.Position.supplyShares');

const getErc4626WithdrawCondition = (definition: SignalDefinition) =>
  getGroupChangeCondition(definition, 'ERC4626.Position.shares');

const getErc20BalanceCondition = (definition: SignalDefinition) =>
  definition.conditions.find(
    (condition): condition is ChangeCondition =>
      condition.type === 'change' &&
      ((condition.source?.kind === 'alias' && condition.source.name === 'ERC20.Position.balance') ||
        condition.metric === 'ERC20.Position.balance')
  );

const getLpPoolChangeConditions = (definition: SignalDefinition) =>
  definition.conditions.filter(
    (condition): condition is ChangeCondition =>
      condition.type === 'change' &&
      condition.source?.kind === 'state' &&
      (condition.source.state_ref.protocol === 'uniswap_v3' || condition.source.state_ref.protocol === 'uniswap_v4')
  );

const getRawEventsCondition = (definition: SignalDefinition) =>
  definition.conditions.find((condition): condition is RawEventsCondition => condition.type === 'raw-events');

const RAW_EVENT_LABELS: Record<RawEventKind, string> = {
  erc20_transfer: 'ERC-20 transfers',
  erc20_approval: 'ERC-20 approvals',
  erc721_transfer: 'ERC-721 transfers',
  erc721_approval: 'ERC-721 approvals',
  erc721_approval_for_all: 'ERC-721 approval-for-all events',
  erc4626_deposit: 'ERC-4626 deposits',
  erc4626_withdraw: 'ERC-4626 withdrawals',
  contract_event: 'contract events',
  swap: 'swap events',
};

const getRawEventLabel = (kind: RawEventKind) => RAW_EVENT_LABELS[kind];

const getNumericConditionLabel = (condition: Pick<SignalCondition, 'type'> & {
  metric?: string;
  state_ref?: { protocol: string; entity_type: string; field: string };
  source?: { kind: 'alias'; name: string } | { kind: 'state'; state_ref: { protocol: string; entity_type: string; field: string } };
}) => {
  if (condition.source?.kind === 'alias') {
    return condition.source.name;
  }

  if (condition.source?.kind === 'state') {
    const stateRef = condition.source.state_ref;
    return `${stateRef.protocol}.${stateRef.entity_type}.${stateRef.field}`;
  }

  if (condition.metric) {
    return condition.metric;
  }

  if (condition.state_ref) {
    return `${condition.state_ref.protocol}.${condition.state_ref.entity_type}.${condition.state_ref.field}`;
  }

  return condition.type;
};

export const describeSignalSchedule = (schedule: SignalSchedule) => {
  if (schedule.kind === 'interval') {
    const seconds = schedule.interval_seconds;
    if (seconds % 3600 === 0) {
      const hours = seconds / 3600;
      return `Every ${hours}h`;
    }
    if (seconds % 60 === 0) {
      const minutes = seconds / 60;
      return `Every ${minutes}m`;
    }
    return `Every ${seconds}s`;
  }

  return `Cron · ${schedule.expression} UTC`;
};

export const getPrimaryScheduleSummary = (triggers: SignalTrigger[]) => {
  const scheduleTrigger = triggers.find((trigger): trigger is Extract<SignalTrigger, { type: 'schedule' }> => trigger.type === 'schedule');
  return scheduleTrigger ? describeSignalSchedule(scheduleTrigger.schedule) : 'No schedule';
};


const getConditionEntityId = (condition: SignalCondition): string | null => {
  if ('entity_id' in condition && typeof condition.entity_id === 'string' && condition.entity_id) {
    return condition.entity_id;
  }

  if (condition.type === 'group') {
    for (const nestedCondition of condition.conditions) {
      const nestedEntityId = getConditionEntityId(nestedCondition);
      if (nestedEntityId) {
        return nestedEntityId;
      }
    }
  }

  return null;
};

const getConditionContractAddress = (condition: SignalCondition): string | null => {
  if (
    'contract_address' in condition &&
    typeof condition.contract_address === 'string' &&
    condition.contract_address
  ) {
    return normalizeAddress(condition.contract_address);
  }

  if (condition.type === 'group') {
    for (const nestedCondition of condition.conditions) {
      const nestedContractAddress = getConditionContractAddress(nestedCondition);
      if (nestedContractAddress) {
        return nestedContractAddress;
      }
    }
  }

  return null;
};

const getConditionChainId = (condition: SignalCondition): number | null => {
  if ('chain_id' in condition && typeof condition.chain_id === 'number') {
    return condition.chain_id;
  }

  if (condition.type === 'group') {
    for (const nestedCondition of condition.conditions) {
      const nestedChainId = getConditionChainId(nestedCondition);
      if (typeof nestedChainId === 'number') {
        return nestedChainId;
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

const getRawEventFromAddress = (condition: RawEventsCondition) => getRawEventFilterStringValue(condition, 'from');

const getRawEventToAddress = (condition: RawEventsCondition) => getRawEventFilterStringValue(condition, 'to');

const getRawEventFlowDirection = (condition: RawEventsCondition): 'inflow' | 'outflow' | null => {
  if (getRawEventToAddress(condition) && !getRawEventFromAddress(condition)) {
    return 'inflow';
  }

  if (getRawEventFromAddress(condition) && !getRawEventToAddress(condition)) {
    return 'outflow';
  }

  return null;
};

const getRawEventTrackedAddress = (condition: RawEventsCondition) =>
  getRawEventToAddress(condition) ?? getRawEventFromAddress(condition);

const getRawEventTokenAddress = (condition: RawEventsCondition) => {
  const address = condition.event.contract_addresses?.[0];
  return typeof address === 'string' ? normalizeAddress(address) : null;
};

const getTrackedAddresses = (definition: SignalDefinition) => {
  const addresses = new Set<string>();

  for (const condition of definition.conditions) {
    if (condition.type === 'group') {
      for (const address of condition.addresses) {
        addresses.add(normalizeAddress(address));
      }
      continue;
    }

    if ('address' in condition && typeof condition.address === 'string' && condition.address) {
      addresses.add(normalizeAddress(condition.address));
    }
  }

  return Array.from(addresses);
};

export const describeSignalDefinition = (definition: SignalDefinition) => {
  const { group, change } = getWhaleChangeCondition(definition);
  if (group && change && 'percent' in change.by) {
    const duration = group.window?.duration ?? change.window?.duration ?? definition.window.duration;
    return `${group.requirement.count} of ${group.addresses.length} tracked wallets drop supply by ${change.by.percent}% within ${duration}.`;
  }

  const erc4626Withdraw = getErc4626WithdrawCondition(definition);
  if (erc4626Withdraw.group && erc4626Withdraw.change && 'percent' in erc4626Withdraw.change.by) {
    const duration =
      erc4626Withdraw.group.window?.duration ?? erc4626Withdraw.change.window?.duration ?? definition.window.duration;
    return `${erc4626Withdraw.group.requirement.count} of ${erc4626Withdraw.group.addresses.length} tracked owners reduce vault shares by at least ${erc4626Withdraw.change.by.percent}% within ${duration}.`;
  }

  const erc20Balance = getErc20BalanceCondition(definition);
  if (erc20Balance) {
    const duration = erc20Balance.window?.duration ?? definition.window.duration;
    const holder = erc20Balance.address ? formatCompactIdentifier(erc20Balance.address) : 'holder';
    const token = erc20Balance.contract_address ? formatCompactIdentifier(erc20Balance.contract_address) : 'asset';
    const amount = 'percent' in erc20Balance.by ? `${erc20Balance.by.percent}%` : `${erc20Balance.by.absolute} absolute`;
    return `${token} balance for ${holder} ${erc20Balance.direction}s by at least ${amount} within ${duration}.`;
  }

  const lpChanges = getLpPoolChangeConditions(definition);
  if (lpChanges.length > 0) {
    const first = lpChanges[0];
    const duration = first.window?.duration ?? definition.window.duration;
    const amount = 'percent' in first.by ? `${first.by.percent}%` : `${first.by.absolute} absolute`;
    return `${lpChanges.length} LP pool${lpChanges.length === 1 ? '' : 's'} ${first.direction} by at least ${amount} within ${duration}.`;
  }

  const rawEvents = getRawEventsCondition(definition);
  if (rawEvents) {
    const duration = rawEvents.window?.duration ?? definition.window.duration;
    if (rawEvents.event.kind === 'erc20_transfer') {
      const direction = getRawEventFlowDirection(rawEvents);
      const trackedAddress = getRawEventTrackedAddress(rawEvents);
      const tokenAddress = getRawEventTokenAddress(rawEvents);
      const fromAddress = getRawEventFromAddress(rawEvents);
      const toAddress = getRawEventToAddress(rawEvents);

      if (fromAddress && toAddress && rawEvents.aggregation === 'sum' && rawEvents.field === 'value') {
        const tokenSummary = tokenAddress ? ` for ${formatCompactIdentifier(tokenAddress)}` : '';
        return `ERC-20 transfers from ${formatCompactIdentifier(fromAddress)} to ${formatCompactIdentifier(toAddress)}${tokenSummary} exceed ${rawEvents.value} base units within ${duration}.`;
      }

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
    return `${getNumericConditionLabel(firstCondition)} ${firstCondition.operator} ${firstCondition.value}`;
  }

  if (firstCondition.type === 'change') {
    const amount =
      'percent' in firstCondition.by ? `${firstCondition.by.percent}%` : `${firstCondition.by.absolute} absolute`;
    return `${getNumericConditionLabel(firstCondition)} ${firstCondition.direction} by ${amount}`;
  }

  return `${definition.conditions.length} condition signal`;
};

export const countTrackedWallets = (definition: SignalDefinition) => {
  const morphoGroup = getWhaleChangeCondition(definition).group;
  if (morphoGroup) {
    return morphoGroup.addresses.length;
  }

  const erc4626Group = getErc4626WithdrawCondition(definition).group;
  if (erc4626Group) {
    return erc4626Group.addresses.length;
  }

  return getTrackedAddresses(definition).length;
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
  const entityValue = definition.conditions.map(getConditionEntityId).find(Boolean);
  if (!entityValue) {
    return '—';
  }

  return normalizeSignalMarketId(entityValue);
};

export const getSignalPrimaryChainId = (definition: SignalDefinition): number | null => {
  for (const condition of definition.conditions) {
    const chainId = getConditionChainId(condition);
    if (typeof chainId === 'number') {
      return chainId;
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

  const erc20Balance = getErc20BalanceCondition(definition);
  if (erc20Balance?.contract_address) {
    return {
      label: 'Asset',
      value: normalizeAddress(erc20Balance.contract_address),
      hint:
        erc20Balance.address && primaryChainId !== null
          ? `${erc20Balance.direction === 'increase' ? 'Holder gains' : 'Holder losses'} · ${formatCompactIdentifier(erc20Balance.address)} · Chain ${primaryChainId}`
          : erc20Balance.address
            ? `${erc20Balance.direction === 'increase' ? 'Holder gains' : 'Holder losses'} · ${formatCompactIdentifier(erc20Balance.address)}`
            : primaryChainId !== null
              ? `Chain ${primaryChainId}`
              : undefined,
    };
  }

  const lpChanges = getLpPoolChangeConditions(definition);
  if (lpChanges.length > 0) {
    const stateRef = lpChanges[0].source?.kind === 'state' ? lpChanges[0].source.state_ref : null;
    const contractAddressFilter = stateRef?.filters.find((filter) => filter.field === 'contractAddress' && filter.op === 'eq');
    const contractAddress = typeof contractAddressFilter?.value === 'string' ? normalizeAddress(contractAddressFilter.value) : null;
    return {
      label: 'Pool',
      value: contractAddress ?? 'unknown',
      hint: `${lpChanges.length} pool condition${lpChanges.length === 1 ? '' : 's'}${primaryChainId !== null ? ` · Chain ${primaryChainId}` : ''}`,
    };
  }

  const contractAddress = definition.conditions.map(getConditionContractAddress).find(Boolean);
  if (contractAddress) {
    return {
      label: 'Vault',
      value: contractAddress,
      hint: primaryChainId !== null ? `Chain ${primaryChainId}` : undefined,
    };
  }

  const rawEvents = getRawEventsCondition(definition);
  if (rawEvents?.event.kind === 'erc20_transfer') {
    const tokenAddress = getRawEventTokenAddress(rawEvents);
    const trackedAddress = getRawEventTrackedAddress(rawEvents);
    const direction = getRawEventFlowDirection(rawEvents);
    const fromAddress = getRawEventFromAddress(rawEvents);
    const toAddress = getRawEventToAddress(rawEvents);

    if (tokenAddress) {
      return {
        label: 'Asset',
        value: tokenAddress,
        hint:
          fromAddress && toAddress
            ? `From ${formatCompactIdentifier(fromAddress)} to ${formatCompactIdentifier(toAddress)}`
            : trackedAddress && direction
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

  const trackedAddresses = getTrackedAddresses(definition);
  const primaryAddress = trackedAddresses[0];
  if (primaryAddress) {
    return {
      label: 'Address',
      value: primaryAddress,
      hint: trackedAddresses.length > 1 ? `${trackedAddresses.length} tracked addresses` : undefined,
    };
  }

  if (primaryChainId !== null) {
    return {
      label: 'Chain',
      value: String(primaryChainId),
    };
  }

  return {
    label: 'Chain',
    value: '—',
  };
};

export const getSignalTargetingSummary = (definition: SignalDefinition) => {
  const focus = getSignalFocusDetails(definition);
  const compactValue = focus.label === 'Chain' ? focus.value : formatCompactIdentifier(focus.value);
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
  const repeatPolicy = normalizeSignalRepeatPolicy(input.repeatPolicy);
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
  assertRepeatPolicy(repeatPolicy);

  const definition: SignalDefinition = {
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
            entity_id: marketId,
          },
        ],
      },
    ],
  };

  const generatedName = `Morpho whale watch: ${requiredCount}/${whaleAddresses.length} suppliers -${dropPercent}% in ${windowDuration}`;

  return buildManagedTelegramSignal(
    input.name?.trim() || generatedName,
    input.description?.trim() ||
      `Watches ${whaleAddresses.length} Morpho supplier wallets and triggers when ${requiredCount} of them reduce the canonical Morpho supply-share state by at least ${dropPercent}% over ${windowDuration}.`,
    definition,
    cooldownMinutes,
    repeatPolicy,
    input.schedule
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
  const repeatPolicy = normalizeSignalRepeatPolicy(input.repeatPolicy);
  const amountThreshold = input.amountThreshold ?? preset.defaults.amountThreshold;
  const tokenContract = parseRequiredAddress(input.tokenContract, 'Token contract address');
  const fromAddress = input.fromAddress?.trim() ? parseRequiredAddress(input.fromAddress, 'From address') : null;
  const toAddress = input.toAddress?.trim() ? parseRequiredAddress(input.toAddress, 'To address') : null;

  assertPositiveChainId(chainId);

  if (!fromAddress && !toAddress) {
    throw new SignalTemplateError('Provide at least one transfer filter address.');
  }

  if (!Number.isFinite(amountThreshold) || amountThreshold <= 0) {
    throw new SignalTemplateError('Transfer threshold must be greater than 0.');
  }

  assertNonNegativeCooldown(cooldownMinutes);
  assertRepeatPolicy(repeatPolicy);

  const definition: SignalDefinition = {
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
          ...(fromAddress
            ? [
                {
                  field: 'from',
                  op: 'eq' as const,
                  value: fromAddress,
                },
              ]
            : []),
          ...(toAddress
            ? [
                {
                  field: 'to',
                  op: 'eq' as const,
                  value: toAddress,
                },
              ]
            : []),
        ],
      },
    ],
  };

  const routeLabel = fromAddress && toAddress
    ? `${formatCompactIdentifier(fromAddress)} → ${formatCompactIdentifier(toAddress)}`
    : fromAddress
      ? `from ${formatCompactIdentifier(fromAddress)}`
      : `to ${formatCompactIdentifier(toAddress!)}`;
  const generatedName = `ERC-20 event aggregation: ${routeLabel} in ${windowDuration}`;
  const routeDescription = [fromAddress ? `from ${fromAddress}` : null, toAddress ? `to ${toAddress}` : null]
    .filter(Boolean)
    .join(' ');

  return buildManagedTelegramSignal(
    input.name?.trim() || generatedName,
    input.description?.trim() ||
      `Uses Iruka raw-event ERC-20 transfers for ${tokenContract} and triggers when aggregated transfer value ${routeDescription} exceeds ${amountThreshold} base units over ${windowDuration}.`,
    definition,
    cooldownMinutes,
    repeatPolicy,
    input.schedule
  );
};

export const buildErc20BalanceTemplate = (input: Erc20BalanceTemplateRequest): CreateSignalRequest => {
  const preset = getPreset(input.templateId);
  if (preset.kind !== 'erc20-balance') {
    throw new SignalTemplateError(`Template ${input.templateId} is not an ERC-20 balance template.`);
  }

  const chainId = input.chainId ?? preset.defaults.chainId;
  const windowDuration = input.windowDuration?.trim() || preset.defaults.windowDuration;
  const cooldownMinutes = input.cooldownMinutes ?? preset.defaults.cooldownMinutes;
  const repeatPolicy = normalizeSignalRepeatPolicy(input.repeatPolicy);
  const balanceDirection = input.balanceDirection ?? preset.defaults.direction;
  const thresholdMode = input.thresholdMode ?? preset.defaults.thresholdMode;
  const percentThreshold = input.percentThreshold ?? preset.defaults.percentThreshold;
  const absoluteThreshold = input.absoluteThreshold ?? preset.defaults.absoluteThreshold;
  const tokenContract = parseRequiredAddress(input.tokenContract, 'Token contract address');
  const watchedAddress = parseRequiredAddress(input.watchedAddress, 'Holder address');

  assertPositiveChainId(chainId);

  if (thresholdMode === 'percent') {
    if (!Number.isFinite(percentThreshold) || percentThreshold <= 0) {
      throw new SignalTemplateError('Balance change percent must be greater than 0.');
    }
  } else {
    const parsedAbsolute = typeof absoluteThreshold === 'string' ? Number(absoluteThreshold) : absoluteThreshold;
    if (!Number.isFinite(parsedAbsolute) || parsedAbsolute <= 0) {
      throw new SignalTemplateError('Absolute balance threshold must be greater than 0.');
    }
  }

  assertNonNegativeCooldown(cooldownMinutes);
  assertRepeatPolicy(repeatPolicy);

  const definition: SignalDefinition = {
    window: {
      duration: windowDuration,
    },
    logic: 'AND',
    conditions: [
      {
        type: 'change',
        source: { kind: 'alias', name: 'ERC20.Position.balance' },
        direction: balanceDirection,
        by:
          thresholdMode === 'percent'
            ? {
                percent: percentThreshold,
              }
            : {
                absolute: absoluteThreshold,
              },
        window: {
          duration: windowDuration,
        },
        chain_id: chainId,
        contract_address: tokenContract,
        address: watchedAddress,
      },
    ],
  };

  const thresholdLabel = thresholdMode === 'percent' ? `${percentThreshold}%` : `${absoluteThreshold} absolute`;
  const generatedName = `ERC-20 balance ${balanceDirection}: ${formatCompactIdentifier(watchedAddress)} ${thresholdLabel} in ${windowDuration}`;

  return buildManagedTelegramSignal(
    input.name?.trim() || generatedName,
    input.description?.trim() ||
      `Uses archive RPC ERC-20 balance reads for ${tokenContract} and triggers when ${watchedAddress} ${balanceDirection === 'increase' ? 'gains' : 'loses'} at least ${thresholdLabel} over ${windowDuration}.`,
    definition,
    cooldownMinutes,
    repeatPolicy,
    input.schedule
  );
};

export const buildErc4626WithdrawTemplate = (input: Erc4626WithdrawTemplateRequest): CreateSignalRequest => {
  const preset = getPreset(input.templateId);
  if (preset.kind !== 'erc4626-withdraw') {
    throw new SignalTemplateError(`Template ${input.templateId} is not an ERC-4626 withdrawal template.`);
  }

  const ownerAddresses = parseTrackedAddresses(input.ownerAddresses);
  const chainId = input.chainId ?? preset.defaults.chainId;
  const requiredCount = input.requiredCount ?? preset.defaults.requiredCount;
  const windowDuration = input.windowDuration?.trim() || preset.defaults.windowDuration;
  const cooldownMinutes = input.cooldownMinutes ?? preset.defaults.cooldownMinutes;
  const repeatPolicy = normalizeSignalRepeatPolicy(input.repeatPolicy);
  const dropPercent = input.dropPercent ?? preset.defaults.dropPercent;
  const vaultContract = parseRequiredAddress(input.vaultContract, 'Vault contract address');

  assertPositiveChainId(chainId);

  if (!Number.isInteger(requiredCount) || requiredCount < 1) {
    throw new SignalTemplateError('Required owner count must be at least 1.');
  }

  if (requiredCount > ownerAddresses.length) {
    throw new SignalTemplateError('Required owner count cannot exceed the number of tracked addresses.');
  }

  if (!Number.isFinite(dropPercent) || dropPercent <= 0) {
    throw new SignalTemplateError('Share drop percent must be greater than 0.');
  }

  assertNonNegativeCooldown(cooldownMinutes);
  assertRepeatPolicy(repeatPolicy);

  const definition: SignalDefinition = {
    window: {
      duration: windowDuration,
    },
    logic: 'AND',
    conditions: [
      {
        type: 'group',
        addresses: ownerAddresses,
        requirement: {
          count: requiredCount,
          of: ownerAddresses.length,
        },
        logic: 'AND',
        window: {
          duration: windowDuration,
        },
        conditions: [
          {
            type: 'change',
            metric: 'ERC4626.Position.shares',
            direction: 'decrease',
            by: {
              percent: dropPercent,
            },
            window: {
              duration: windowDuration,
            },
            chain_id: chainId,
            contract_address: vaultContract,
          },
        ],
      },
    ],
  };

  const generatedName = `ERC-4626 withdraw watch: ${requiredCount}/${ownerAddresses.length} owners -${dropPercent}% in ${windowDuration}`;

  return buildManagedTelegramSignal(
    input.name?.trim() || generatedName,
    input.description?.trim() ||
      `Watches archive-RPC ERC-4626 share balances for ${ownerAddresses.length} owners in vault ${vaultContract} and triggers when ${requiredCount} of them reduce shares by at least ${dropPercent}% over ${windowDuration}.`,
    definition,
    cooldownMinutes,
    repeatPolicy,
    input.schedule
  );
};

export const buildLpPoolLiquidityTemplate = (input: LpPoolLiquidityTemplateRequest): CreateSignalRequest => {
  const preset = getPreset(input.templateId);
  if (preset.kind !== 'lp-pool-liquidity') {
    throw new SignalTemplateError(`Template ${input.templateId} is not an LP pool liquidity template.`);
  }

  const chainId = input.chainId ?? preset.defaults.chainId;
  const windowDuration = input.windowDuration?.trim() || preset.defaults.windowDuration;
  const cooldownMinutes = input.cooldownMinutes ?? preset.defaults.cooldownMinutes;
  const repeatPolicy = normalizeSignalRepeatPolicy(input.repeatPolicy);
  const dropPercent = input.dropPercent ?? preset.defaults.dropPercent;
  const pools = input.pools ?? [];

  assertPositiveChainId(chainId);
  assertNonNegativeCooldown(cooldownMinutes);
  assertRepeatPolicy(repeatPolicy);

  if (pools.length < 1) {
    throw new SignalTemplateError('Add at least one LP pool.');
  }

  if (!Number.isFinite(dropPercent) || dropPercent <= 0) {
    throw new SignalTemplateError('Drop percent must be greater than 0.');
  }

  const conditions: ChangeCondition[] = pools.map((pool, index) => {
    const address = parseRequiredAddress(pool.address, `Pool ${index + 1} address`);
    if (pool.protocol === 'uniswap_v4') {
      const poolId = pool.poolId?.trim() ?? '';
      if (!BYTES32_PATTERN.test(poolId)) {
        throw new SignalTemplateError(`Invalid Uniswap v4 poolId for pool ${index + 1}. Expected bytes32.`);
      }
      return {
        type: 'change',
        source: {
          kind: 'state',
          state_ref: {
            protocol: 'uniswap_v4',
            entity_type: 'PoolManager',
            field: 'liquidity',
            filters: [
              { field: 'chainId', op: 'eq', value: chainId },
              { field: 'contractAddress', op: 'eq', value: address },
              { field: 'poolId', op: 'eq', value: poolId },
            ],
          },
        },
        direction: 'decrease',
        by: { percent: dropPercent },
        window: { duration: windowDuration },
        chain_id: chainId,
        contract_address: address,
      };
    }

    return {
      type: 'change',
      source: {
        kind: 'state',
        state_ref: {
          protocol: 'uniswap_v3',
          entity_type: 'Pool',
          field: 'liquidity',
          filters: [
            { field: 'chainId', op: 'eq', value: chainId },
            { field: 'contractAddress', op: 'eq', value: address },
          ],
        },
      },
      direction: 'decrease',
      by: { percent: dropPercent },
      window: { duration: windowDuration },
      chain_id: chainId,
      contract_address: address,
    };
  });

  const definition: SignalDefinition = {
    window: { duration: windowDuration },
    logic: 'AND',
    conditions,
  };

  const generatedName = `LP pool liquidity drop: ${pools.length} pool${pools.length === 1 ? '' : 's'} -${dropPercent}% in ${windowDuration}`;

  return buildManagedTelegramSignal(
    input.name?.trim() || generatedName,
    input.description?.trim() ||
      `Watches ${pools.length} LP pool${pools.length === 1 ? '' : 's'} and alerts when liquidity drops by at least ${dropPercent}% within ${windowDuration}.`,
    definition,
    cooldownMinutes,
    repeatPolicy,
    input.schedule
  );
};

export const buildSignalTemplate = (input: SignalTemplateRequest): CreateSignalRequest => {
  switch (input.templateId) {
    case 'whale-exit-trio':
    case 'whale-exit-pair':
    case 'single-whale-exit':
      return buildWhaleMovementTemplate(input);
    case 'erc20-event-aggregation-watch':
      return buildErc20TransferTemplate(input);
    case 'erc20-balance-watch':
      return buildErc20BalanceTemplate(input);
    case 'erc4626-withdraw-percent-watch':
      return buildErc4626WithdrawTemplate(input);
    case 'lp-pool-liquidity-drop':
      return buildLpPoolLiquidityTemplate(input);
  }
};

export const getTemplatePreset = (templateId: SignalTemplateId) => getPreset(templateId);

export const isWhaleMovementSignal = (signal: SignalRecord) => {
  const { group, change } = getWhaleChangeCondition(signal.definition);
  return Boolean(group && change);
};
