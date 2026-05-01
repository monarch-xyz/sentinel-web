import {
  IRUKA_DOCS_API_REFERENCE_URL,
  IRUKA_DOCS_OVERVIEW_URL,
  IRUKA_DOCS_WRITING_SIGNALS_URL,
} from '@/lib/iruka-links';

export type CreateSignalPersonaId = 'human' | 'agent';
export type HumanSignalCategoryId = 'vaults' | 'protocols' | 'tokens';
export type AssistedVaultExampleId = 'morpho' | 'euler' | 'aave-v3';
export type AssistedProtocolExampleId = 'morpho-markets' | 'uniswap-lp-pools';

export interface CreateSignalPersonaOption {
  id: CreateSignalPersonaId;
  title: string;
  summary: string;
  helpText: string;
  eyebrow: string;
  cta: string;
}

export interface HumanSignalCategoryOption {
  id: HumanSignalCategoryId;
  title: string;
  summary: string;
  helpText: string;
}

export interface AssistedExampleOption<TId extends string> {
  id: TId;
  title: string;
  summary: string;
  helpText: string;
  badge: string;
  status: 'live' | 'coming-soon';
}

export interface AgentGuideResource {
  title: string;
  helpText: string;
  href: string;
}

export const IRUKA_ONE_LINER = 'Iruka turns onchain conditions into managed alerts.';

export const CREATE_SIGNAL_PERSONAS: CreateSignalPersonaOption[] = [
  {
    id: 'human',
    eyebrow: "I'm a human",
    title: 'Guided builder',
    summary: 'Guided alerts',
    helpText:
      'Iruka builds the alert for you from guided vault and protocol surfaces. Today that includes Morpho vaults, Euler vaults, Morpho markets, and a custom fallback.',
    cta: 'Open human builder',
  },
  {
    id: 'agent',
    eyebrow: "I'm an agent",
    title: 'Docs and prompt',
    summary: 'Agent-authored alerts',
    helpText:
      'Iruka exposes docs, DSL, API routes, and a starter prompt so an agent can author the alert directly.',
    cta: 'Open agent guide',
  },
];

export const HUMAN_SIGNAL_CATEGORIES: HumanSignalCategoryOption[] = [
  {
    id: 'vaults',
    title: 'Vaults',
    summary: 'Vault alerts',
    helpText:
      'Pick a vault, pick holders, and let Iruka watch ERC-4626 share changes for you.',
  },
  {
    id: 'protocols',
    title: 'Protocols',
    summary: 'Protocol alerts',
    helpText:
      'Use protocol-specific indexed surfaces. Today that means Morpho markets, with room for more protocol builders later.',
  },
  {
    id: 'tokens',
    title: 'Tokens',
    summary: 'ERC-20 alerts',
    helpText:
      'Start from common ERC-20 tokens like USDC, USDT, and WETH, then either watch one holder balance or aggregate exact transfer routes over time.',
  },
];

export const ASSISTED_VAULT_EXAMPLES: AssistedExampleOption<AssistedVaultExampleId>[] = [
  {
    id: 'morpho',
    title: 'Morpho',
    summary: 'Vault alert',
    helpText:
      'Search Morpho vaults, select holders, and let Iruka create the vault alert.',
    badge: 'Live now',
    status: 'live',
  },
  {
    id: 'euler',
    title: 'Euler',
    summary: 'Vault alert',
    helpText:
      'Search Euler Earn vaults, select holders, and let Iruka create the vault alert.',
    badge: 'Live now',
    status: 'live',
  },
  {
    id: 'aave-v3',
    title: 'Aave V3',
    summary: 'Later',
    helpText:
      'Reserved as a future assisted vault surface so the app hierarchy already has a place for broader vault coverage.',
    badge: 'Coming soon',
    status: 'coming-soon',
  },
];

export const ASSISTED_PROTOCOL_EXAMPLES: AssistedExampleOption<AssistedProtocolExampleId>[] = [
  {
    id: 'morpho-markets',
    title: 'Morpho markets',
    summary: 'Protocol alert',
    helpText:
      'Use backend-indexed Morpho markets to select suppliers and let Iruka watch for coordinated exits.',
    badge: 'Live now',
    status: 'live',
  },
  {
    id: 'uniswap-lp-pools',
    title: 'Uniswap LP pools',
    summary: 'Liquidity drop alert',
    helpText:
      'Search public Uniswap v3 pools, optionally add manual Uniswap v4 pools, and trigger when liquidity drops by percent.',
    badge: 'Live now',
    status: 'live',
  },
];

export const CUSTOM_SIGNAL_FALLBACK = {
  title: 'Custom inputs',
  summary: 'Manual fallback',
  helpText:
    "Use this when the guided flow doesn't expose the exact vault, market, token, or address set you need yet, but you still want Iruka to manage the alert.",
  cta: 'Open custom builder',
};

export const AGENT_GUIDE_RESOURCES: AgentGuideResource[] = [
  {
    title: 'Docs overview',
    helpText: 'Current docs map for integrators, reading order, and page-level navigation.',
    href: IRUKA_DOCS_OVERVIEW_URL,
  },
  {
    title: 'Writing signals',
    helpText: 'Top-level request shape, condition examples, and repeat-policy-aware payload structure.',
    href: IRUKA_DOCS_WRITING_SIGNALS_URL,
  },
  {
    title: 'API reference',
    helpText: 'Protected routes, signal CRUD, history, simulation, and response behavior.',
    href: IRUKA_DOCS_API_REFERENCE_URL,
  },
];

export const getCreateSignalPersona = (id: CreateSignalPersonaId) => {
  const option = CREATE_SIGNAL_PERSONAS.find((item) => item.id === id);
  if (!option) {
    throw new Error(`Unknown create-signal persona: ${id}`);
  }

  return option;
};

export const getHumanSignalCategory = (id: HumanSignalCategoryId) => {
  const option = HUMAN_SIGNAL_CATEGORIES.find((item) => item.id === id);
  if (!option) {
    throw new Error(`Unknown human signal category: ${id}`);
  }

  return option;
};
