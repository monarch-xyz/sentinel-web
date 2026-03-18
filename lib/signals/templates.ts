import type {
  ChangeCondition,
  CreateSignalRequest,
  GroupCondition,
  SignalDefinition,
  SignalRecord,
} from '@/lib/types/signal';

export type SignalTemplateId = 'whale-exit-trio' | 'whale-exit-pair' | 'single-whale-exit';

export interface SignalTemplatePreset {
  id: SignalTemplateId;
  title: string;
  description: string;
  accent: string;
  defaults: {
    chainId: number;
    requiredCount: number;
    dropPercent: number;
    windowDuration: string;
    cooldownMinutes: number;
  };
}

export interface WhaleTemplateRequest {
  templateId: SignalTemplateId;
  marketId: string;
  whaleAddresses: string[] | string;
  chainId?: number;
  requiredCount?: number;
  dropPercent?: number;
  windowDuration?: string;
  cooldownMinutes?: number;
  name?: string;
  description?: string;
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
];

const ETH_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;

const normalizeAddress = (value: string) => value.trim().toLowerCase();

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

export const describeSignalDefinition = (definition: SignalDefinition) => {
  const { group, change } = getWhaleChangeCondition(definition);
  if (group && change && 'percent' in change.by) {
    const duration = group.window?.duration ?? change.window?.duration ?? definition.window.duration;
    return `${group.requirement.count} of ${group.addresses.length} tracked wallets drop supply by ${change.by.percent}% within ${duration}.`;
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
  const marketValue = definition.scope.markets?.[0];
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
        (nestedCondition): nestedCondition is ChangeCondition => 'chain_id' in nestedCondition && typeof nestedCondition.chain_id === 'number'
      )?.chain_id;

      if (typeof nestedChainId === 'number') {
        return nestedChainId;
      }
    }
  }

  return null;
};

export const getSignalMarketHref = (definition: SignalDefinition) => {
  const marketValue = definition.scope.markets?.[0];
  const chainId = getSignalPrimaryChainId(definition);
  const marketId = marketValue ? normalizeSignalMarketId(marketValue) : '';

  if (!marketId || chainId === null) {
    return null;
  }

  return `https://www.monarchlend.xyz/market/${chainId}/${marketId}`;
};

export const buildWhaleMovementTemplate = (input: WhaleTemplateRequest): CreateSignalRequest => {
  const preset = getPreset(input.templateId);
  const whaleAddresses = parseWhaleAddresses(input.whaleAddresses);
  const chainId = input.chainId ?? preset.defaults.chainId;
  const requiredCount = input.requiredCount ?? preset.defaults.requiredCount;
  const dropPercent = input.dropPercent ?? preset.defaults.dropPercent;
  const windowDuration = input.windowDuration?.trim() || preset.defaults.windowDuration;
  const cooldownMinutes = input.cooldownMinutes ?? preset.defaults.cooldownMinutes;
  const marketId = normalizeSignalMarketId(input.marketId);

  if (!marketId) {
    throw new SignalTemplateError('Market ID is required.');
  }

  if (requiredCount < 1) {
    throw new SignalTemplateError('Required wallet count must be at least 1.');
  }

  if (requiredCount > whaleAddresses.length) {
    throw new SignalTemplateError('Required wallet count cannot exceed the number of tracked addresses.');
  }

  if (dropPercent <= 0) {
    throw new SignalTemplateError('Drop percent must be greater than 0.');
  }

  if (cooldownMinutes < 0) {
    throw new SignalTemplateError('Cooldown minutes cannot be negative.');
  }

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

  return {
    name: input.name?.trim() || generatedName,
    description:
      input.description?.trim() ||
      `Watches ${whaleAddresses.length} Morpho supplier wallets and triggers when ${requiredCount} of them reduce supply shares by at least ${dropPercent}% over ${windowDuration}.`,
    definition,
    webhook_url: '',
    cooldown_minutes: cooldownMinutes,
  };
};

export const getTemplatePreset = (templateId: SignalTemplateId) => getPreset(templateId);

export const isWhaleMovementSignal = (signal: SignalRecord) => {
  const { group, change } = getWhaleChangeCondition(signal.definition);
  return Boolean(group && change);
};
