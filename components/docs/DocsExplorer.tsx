'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CodeBlock } from '@/components/ui/CodeBlock';
import {
  MEGABAT_GITHUB_URL,
} from '@/lib/megabat-links';
import { cn } from '@/lib/utils';
import { FamilyExamplesAccordion } from './FamilyExamplesAccordion';

type SectionId = 'contents' | 'sources' | 'logic' | 'auth' | 'delivery' | 'history' | 'routes';

const sections = [
  {
    id: 'contents',
    label: 'Contents',
    description:
      'A signal request is an HTTP wrapper around one `definition` object. Keep delivery, repeat policy, cooldown, and metadata outside the DSL itself, and author conditions through state, indexed, or raw references.',
  },
  {
    id: 'sources',
    label: 'Source Families',
    description:
      'Megabat exposes three source families: `state`, `indexed`, and `raw`. State now has both a raw public surface, `state_ref`, and a sugared metric layer on top.',
  },
  {
    id: 'logic',
    label: 'Logic',
    description:
      'The public DSL supports boolean composition across metric sugar, raw state refs, indexed metrics, and raw event scans. Internal engine math is not a customer-authored DSL surface.',
  },
  {
    id: 'auth',
    label: 'Auth',
    description:
      'Use API keys for systems and SIWE sessions for operators. Protected product routes accept either valid API-key or session auth.',
  },
  {
    id: 'delivery',
    label: 'Delivery',
    description:
      'Managed Telegram is the default first-party path. `webhook_url` is only for explicit destination override, and Telegram inline actions stay backend-managed.',
  },
  {
    id: 'history',
    label: 'History',
    description:
      'History responses now expose normalized condition explanations directly on evaluations and notifications, so clients do not need to dig through opaque metadata blobs.',
  },
  {
    id: 'routes',
    label: 'Routes',
    description:
      'Health, chains, catalog, CRUD, history, and simulation make up the operational API surface customers use day to day, including repeat-policy aware signal writes.',
  },
] as const satisfies ReadonlyArray<{
  id: SectionId;
  label: string;
  description: string;
}>;

const signalFields = [
  ['name', 'Human label for the signal.'],
  ['definition.scope', 'Chains, markets, addresses, and protocol.'],
  ['definition.window', 'Evaluation lookback window.'],
  ['definition.logic', 'Top-level `AND` or `OR` across conditions.'],
  ['definition.conditions[]', 'The actual checks Megabat evaluates across state, indexed, and raw families.'],
  ['condition.metric | condition.state_ref', 'State conditions can use metric sugar or the raw public `state_ref` surface.'],
  ['delivery | webhook_url', 'Managed delivery or explicit override.'],
  ['repeat_policy', 'Optional repeat behavior: `cooldown`, `post_first_alert_snooze`, or `until_resolved`.'],
  ['cooldown_minutes', 'Legacy repeat gap, still used when `repeat_policy.mode` is `cooldown`.'],
] as const;

const sourceFamilies = [
  {
    name: 'State',
    dsl: '`state_ref` or `metric` on `threshold` / `change`; `metric` on `aggregate`',
    note: 'Generic RPC-backed current and historical state reads. `state_ref` is the raw public state surface and `metric` is sugar over it for stable common reads.',
    refs: ['state_ref(protocol/entity_type/field/filters)', 'ERC4626.Position.shares', 'Morpho.Position.supplyShares'],
  },
  {
    name: 'Indexed',
    dsl: '`metric` on indexed event and flow refs',
    note: 'Protocol-aware indexed history, currently served by Envio.',
    refs: ['Morpho.Event.Supply.assets', 'Morpho.Event.Withdraw.count', 'Morpho.Flow.netSupply'],
  },
  {
    name: 'Raw',
    dsl: '`type: "raw-events"`',
    note: 'Decoded event scans with a shared well-known catalog. Today that includes transfer, approval, ERC-4626, swap, and custom ABI event patterns.',
    refs: ['erc20_transfer', 'erc4626_deposit', 'swap', 'contract_event'],
  },
] as const;

const logicRows = [
  ['`logic`', 'Top-level boolean composition with `AND` or `OR`.'],
  ['`metric`', 'Sugared stable references for common state and indexed reads.'],
  ['`state_ref`', 'Raw public state surface for protocol/entity/field/filter reads.'],
  ['`threshold`', 'Compare one indexed metric, state alias, or raw state ref to a fixed value.'],
  ['`change`', 'Compare current state to historical state for state aliases or raw state refs.'],
  ['`aggregate`', 'Aggregate one metric across the current scope. Contract-scoped state metrics also work here.'],
  ['`group`', 'Evaluate inner conditions per address, then apply an N-of-M requirement.'],
  ['`raw-events`', 'Scan decoded logs directly using a preset catalog or `contract_event` escape hatch.'],
] as const;

const stateAuthoringRows = [
  ['`metric`', 'Use stable sugar when the backend already exposes a named state metric such as `ERC4626.Position.shares` or `Morpho.Position.supplyShares`.'],
  ['`state_ref`', 'Use the raw public state surface when you need a bound state read that is not yet registered as metric sugar.'],
  ['`contract_address`', 'Metric-mode convenience field for contract-scoped state metrics such as ERC-4626 positions.'],
  ['Numeric strings', 'Use decimal strings for large integer state thresholds and absolute deltas.'],
] as const;

const authRows = [
  ['API key', 'Create with `POST /api/v1/auth/register`, then send `X-API-Key`.'],
  ['Browser session', 'Use `POST /api/v1/auth/siwe/nonce` and `POST /api/v1/auth/siwe/verify`.'],
  ['Bearer token', 'The SIWE verify response also returns `session_token`.'],
] as const;

const deliveryRows = [
  ['Managed Telegram', 'Send `delivery: { provider: "telegram" }` and let Megabat resolve the target server-side.'],
  ['Telegram actions', 'Inline `Why`, `Snooze 1h`, and `Snooze 1d` actions are managed by Megabat backend services, not browser callbacks.'],
  ['Custom webhook', 'Send `webhook_url` only when you intentionally want your own endpoint.'],
  ['Repeat policy', 'Set `repeat_policy` on create or update to choose cooldown, incident snooze, or until-resolved behavior.'],
] as const;

const historyRows = [
  ['`evaluations[*].condition_results`', 'Normalized per-condition evaluation output with summaries and optional operands/window fields.'],
  ['`evaluations[*].conditions_met`', 'Normalized matched-condition list ready for UI rendering.'],
  ['`evaluations[*].logic`', 'Normalized top-level `AND` / `OR` evaluation logic.'],
  ['`evaluations[*].scope`', 'Normalized scope object for the evaluation run.'],
  ['`notifications[*].conditions_met`', 'Normalized matched-condition list recovered from stored notification payloads.'],
] as const;

const routes = [
  ['GET', '/health', 'Fast liveness plus source-family capability status.'],
  ['GET', '/chains', 'Configured chain allowlist and archive RPC runtime config.'],
  ['GET', '/ready', 'Readiness across DB, Redis, RPC, and configured providers.'],
  ['GET', '/api/v1/catalog', 'Backend-supported raw-event template catalog for builder UX.'],
  ['POST', '/api/v1/signals', 'Create one stored signal.'],
  ['PATCH', '/api/v1/signals/:id', 'Update definition, delivery, repeat policy, cooldown, or metadata.'],
  ['GET', '/api/v1/signals/:id/history', 'Read evaluations and notification attempts, including normalized explanation fields.'],
  ['POST', '/api/v1/simulate/:id/simulate', 'Replay a signal across a time range.'],
  ['POST', '/api/v1/simulate/:id/first-trigger', 'Find the earliest trigger in a time range.'],
] as const;

const rawTemplateRows = [
  ['Basic', '`erc20_transfer`, `erc20_approval`, `erc721_transfer`, `erc721_approval`, `erc721_approval_for_all`, `erc4626_deposit`, `erc4626_withdraw`, `swap`'],
  ['Advanced', '`contract_event` for arbitrary ABI event signatures'],
] as const;

const familyExamples = [
  {
    id: 'state-ref',
    title: 'Raw state example',
    description: 'Direct `state_ref` authoring for a contract-backed state read.',
    code: `{
  "name": "Vault Shares Drop",
  "definition": {
    "scope": {
      "chains": [1],
      "protocol": "all"
    },
    "window": { "duration": "7d" },
    "conditions": [
      {
        "type": "change",
        "state_ref": {
          "protocol": "erc4626",
          "entity_type": "Position",
          "field": "shares",
          "filters": [
            { "field": "chainId", "op": "eq", "value": 1 },
            { "field": "contractAddress", "op": "eq", "value": "0xVaultAddress" },
            { "field": "owner", "op": "eq", "value": "0xOwnerAddress" }
          ]
        },
        "direction": "decrease",
        "by": { "percent": 20 }
      }
    ]
  },
  "delivery": { "provider": "telegram" },
  "cooldown_minutes": 30,
  "repeat_policy": { "mode": "cooldown" }
}`,
    language: 'json',
    filename: 'state-ref.json',
  },
  {
    id: 'state',
    title: 'State metric example',
    description: 'Threshold on a sugared state alias.',
    code: `{
  "name": "Large Vault Share Balance",
  "definition": {
    "scope": {
      "chains": [1],
      "protocol": "all"
    },
    "window": { "duration": "1h" },
    "conditions": [
      {
        "type": "threshold",
        "metric": "ERC4626.Position.shares",
        "operator": ">",
        "value": "1000000000000000000",
        "chain_id": 1,
        "contract_address": "0xVaultAddress",
        "address": "0xOwnerAddress"
      }
    ]
  },
  "delivery": { "provider": "telegram" },
  "cooldown_minutes": 5,
  "repeat_policy": { "mode": "until_resolved" }
}`,
    language: 'json',
    filename: 'state-metric.json',
  },
  {
    id: 'indexed',
    title: 'Indexed metric example',
    description: 'Threshold on a protocol-aware indexed flow metric.',
    code: `{
  "name": "Net Supply Falls",
  "definition": {
    "scope": {
      "chains": [1],
      "markets": ["0xM"],
      "protocol": "morpho"
    },
    "window": { "duration": "6h" },
    "conditions": [
      {
        "type": "threshold",
        "metric": "Morpho.Flow.netSupply",
        "operator": "<",
        "value": -1000000,
        "chain_id": 1,
        "market_id": "0xM"
      }
    ]
  },
  "webhook_url": "https://your-webhook.example/alert",
  "cooldown_minutes": 15,
  "repeat_policy": { "mode": "cooldown" }
}`,
    language: 'json',
    filename: 'indexed.json',
  },
  {
    id: 'raw-transfer',
    title: 'Raw transfer example',
    description: 'Decoded ERC-20 transfer scan with the preset catalog.',
    code: `{
  "name": "USDC Transfer Burst",
  "definition": {
    "scope": {
      "chains": [1],
      "protocol": "all"
    },
    "window": { "duration": "30m" },
    "conditions": [
      {
        "type": "raw-events",
        "aggregation": "sum",
        "field": "value",
        "operator": ">",
        "value": 1000000,
        "chain_id": 1,
        "event": {
          "kind": "erc20_transfer",
          "contract_addresses": ["0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"]
        },
        "filters": [
          {
            "field": "to",
            "op": "eq",
            "value": "0xReceiver"
          }
        ]
      }
    ]
  },
  "webhook_url": "https://your-webhook.example/raw-events",
  "cooldown_minutes": 10,
  "repeat_policy": { "mode": "cooldown" }
}`,
    language: 'json',
    filename: 'raw-transfer.json',
  },
  {
    id: 'raw-swap',
    title: 'Raw swap preset example',
    description: 'Normalized swap scan across supported Uniswap presets.',
    code: `{
  "name": "Swap Volume Burst",
  "definition": {
    "scope": {
      "chains": [1],
      "protocol": "all"
    },
    "window": { "duration": "30m" },
    "conditions": [
      {
        "type": "raw-events",
        "aggregation": "sum",
        "field": "amount0_abs",
        "operator": ">",
        "value": 500000,
        "chain_id": 1,
        "event": {
          "kind": "swap",
          "protocols": ["uniswap_v2", "uniswap_v3"],
          "contract_addresses": ["0xPoolA", "0xPoolB"]
        },
        "filters": [
          {
            "field": "recipient",
            "op": "eq",
            "value": "0xRecipient"
          }
        ]
      }
    ]
  },
  "webhook_url": "https://your-webhook.example/swap-events",
  "cooldown_minutes": 10,
  "repeat_policy": { "mode": "post_first_alert_snooze", "snooze_minutes": 1440 }
}`,
    language: 'json',
    filename: 'raw-swap.json',
  },
  {
    id: 'raw-contract-event',
    title: 'Custom contract event example',
    description: 'Advanced ABI-signature escape hatch via `contract_event`.',
    code: `{
  "name": "Pool Swap Inflow",
  "definition": {
    "scope": {
      "chains": [1],
      "protocol": "all"
    },
    "window": { "duration": "30m" },
    "conditions": [
      {
        "type": "raw-events",
        "aggregation": "sum",
        "field": "amount0In",
        "operator": ">",
        "value": 500000,
        "chain_id": 1,
        "event": {
          "kind": "contract_event",
          "contract_addresses": ["0xPool"],
          "signature": "Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address indexed to)"
        }
      }
    ]
  },
  "webhook_url": "https://your-webhook.example/contract-events",
  "cooldown_minutes": 10,
  "repeat_policy": { "mode": "cooldown" }
}`,
    language: 'json',
    filename: 'raw-contract-event.json',
  },
] as const;

const contentsExample = `POST /api/v1/signals
Content-Type: application/json
X-API-Key: megabat_...

{
  "name": "Vault Shares Drop",
  "definition": {
    "scope": {
      "chains": [1],
      "protocol": "all"
    },
    "window": { "duration": "7d" },
    "logic": "AND",
    "conditions": [
      {
        "type": "change",
        "state_ref": {
          "protocol": "erc4626",
          "entity_type": "Position",
          "field": "shares",
          "filters": [
            { "field": "chainId", "op": "eq", "value": 1 },
            { "field": "contractAddress", "op": "eq", "value": "0xVaultAddress" },
            { "field": "owner", "op": "eq", "value": "0xOwnerAddress" }
          ]
        },
        "direction": "decrease",
        "by": { "absolute": "1000000000000000000" }
      }
    ]
  },
  "delivery": { "provider": "telegram" },
  "cooldown_minutes": 5,
  "repeat_policy": { "mode": "post_first_alert_snooze", "snooze_minutes": 1440 }
}`;

const logicExample = `{
  "scope": {
    "chains": [1],
    "addresses": ["0xA", "0xB", "0xC"],
    "protocol": "all"
  },
  "window": { "duration": "7d" },
  "logic": "OR",
  "conditions": [
    {
      "type": "group",
      "addresses": ["0xA", "0xB", "0xC"],
      "requirement": { "count": 2, "of": 3 },
      "logic": "AND",
      "window": { "duration": "7d" },
      "conditions": [
        {
          "type": "change",
          "metric": "ERC4626.Position.shares",
          "direction": "decrease",
          "by": { "absolute": "1000000000000000000" },
          "chain_id": 1,
          "contract_address": "0xVaultAddress"
        }
      ]
    },
    {
      "type": "raw-events",
      "aggregation": "count",
      "operator": ">",
      "value": 10,
      "chain_id": 1,
      "event": {
        "kind": "erc4626_withdraw",
        "contract_addresses": ["0xVaultAddress"]
      },
      "filters": [{ "field": "owner", "op": "eq", "value": "0xA" }]
    }
  ]
}`;

const authExample = `POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Acme Alerts",
  "key_name": "prod-key"
}

200 OK

{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "api_key_id": "2e4d1e12-3a0d-4b0c-9b54-7a1f4d8c3ed1",
  "api_key": "megabat_..."
}`;

const deliveryExample = `{
  "signal_id": "550e8400-e29b-41d4-a716-446655440000",
  "signal_name": "My Alert",
  "triggered_at": "2026-02-02T15:30:00Z",
  "scope": {
    "chains": [1],
    "markets": ["0x..."],
    "addresses": ["0x..."]
  },
  "conditions_met": [],
  "context": {
    "app_user_id": "550e8400-e29b-41d4-a716-446655440000",
    "address": "0x...",
    "market_id": "0x...",
    "chain_id": 1
  }
}`;

const historyExample = `{
  "signal_id": "550e8400-e29b-41d4-a716-446655440000",
  "evaluations": [
    {
      "id": "eval_123",
      "evaluated_at": "2026-02-02T15:30:00Z",
      "triggered": true,
      "logic": "AND",
      "scope": {
        "chains": [1],
        "markets": ["0x..."],
        "addresses": ["0x..."]
      },
      "condition_results": [
        {
          "conditionIndex": 0,
          "conditionType": "simple",
          "triggered": true,
          "summary": "100 > 50",
          "window": "1h",
          "operator": "gt",
          "leftValue": 100,
          "rightValue": 50
        }
      ],
      "conditions_met": [
        {
          "conditionIndex": 0,
          "conditionType": "simple",
          "triggered": true,
          "summary": "100 > 50"
        }
      ]
    }
  ],
  "notifications": [
    {
      "id": "notif_123",
      "triggered_at": "2026-02-02T15:30:01Z",
      "conditions_met": [
        {
          "conditionIndex": 0,
          "conditionType": "group",
          "triggered": true,
          "summary": "3 of 5 addresses matched (required 3)",
          "matchedAddresses": ["0x1", "0x2", "0x3"]
        }
      ]
    }
  ]
}`;

const routesExample = `POST /api/v1/simulate/:id/simulate
Content-Type: application/json
X-API-Key: megabat_...

{
  "start_time": "2026-01-01T00:00:00Z",
  "end_time": "2026-02-01T00:00:00Z",
  "interval_ms": 3600000,
  "compact": true
}`;

function SubsectionTitle({ children }: { children: string }) {
  return <h3 className="text-lg tracking-tight text-foreground">{children}</h3>;
}

function ExampleBlock({
  title,
  code,
  language,
  filename,
}: {
  title: string;
  code: string;
  language: string;
  filename: string;
}) {
  return (
    <div className="border-t border-border pt-6">
      <SubsectionTitle>{title}</SubsectionTitle>
      <CodeBlock code={code} language={language} filename={filename} tone="light" showHeader={false} className="mt-3" />
    </div>
  );
}

function RowList({
  rows,
  columns = 'default',
}: {
  rows: readonly (readonly string[])[];
  columns?: 'default' | 'method';
}) {
  return (
    <div className="divide-y divide-border border-y border-border">
      {rows.map((row) => (
        <div
          key={row[0]}
          className={cn(
            'py-4',
            columns === 'method' ? 'grid gap-2 md:grid-cols-[84px_minmax(0,1fr)_minmax(0,1.5fr)] md:gap-4' : 'md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-4'
          )}
        >
          <p className={cn('text-sm text-foreground', columns === 'method' && 'font-mono text-xs uppercase tracking-[0.16em] text-secondary md:pt-0.5')}>
            {row[0]}
          </p>
          {columns === 'method' ? (
            <>
              <p className="font-mono text-sm text-foreground">{row[1]}</p>
              <p className="text-sm leading-relaxed text-secondary">{row[2]}</p>
            </>
          ) : (
            <p className="text-sm leading-relaxed text-secondary">{row[1]}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export function DocsExplorer() {
  const [activeId, setActiveId] = useState<SectionId>('contents');
  const activeSection = sections.find((section) => section.id === activeId) ?? sections[0];

  const renderContent = () => {
    switch (activeId) {
      case 'contents':
        return (
          <>
            <RowList rows={signalFields} />
            <ExampleBlock title="Example request" code={contentsExample} language="shell" filename="create-signal.http" />
          </>
        );
      case 'sources':
        return (
          <>
            <div className="divide-y divide-border border-y border-border">
              {sourceFamilies.map((family) => (
                <div key={family.name} className="py-4">
                  <div className="md:grid md:grid-cols-[140px_minmax(0,1fr)] md:gap-4">
                    <p className="text-sm text-foreground">{family.name}</p>
                    <div>
                      <p className="font-mono text-xs text-foreground">{family.dsl}</p>
                      <p className="mt-2 text-sm leading-relaxed text-secondary">{family.note}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {family.refs.map((ref) => (
                          <span key={ref} className="font-mono text-[11px] text-secondary">
                            {ref}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm leading-relaxed text-secondary">
              State-family reads are public in two layers. `state_ref` is the raw authoring surface for
              protocol, entity, field, and filters; `metric` is sugar that compiles into that same state
              path when the backend already exposes a stable alias.
            </p>

            <div className="mt-6">
              <SubsectionTitle>State Authoring</SubsectionTitle>
              <RowList rows={stateAuthoringRows} />
            </div>

            <div className="mt-6">
              <SubsectionTitle>Raw Event Catalog</SubsectionTitle>
              <RowList rows={rawTemplateRows} />
            </div>

            <p className="mt-6 text-sm leading-relaxed text-secondary">
              `GET /health` reports which families are enabled. If a signal depends on a disabled
              family, create, update, activation, and simulation routes return `409 Conflict`.
            </p>

            <div className="mt-6">
              <SubsectionTitle>Examples</SubsectionTitle>
              <FamilyExamplesAccordion items={[...familyExamples]} defaultOpenId="state-ref" />
            </div>
          </>
        );
      case 'logic':
        return (
          <>
            <RowList rows={logicRows} />
            <p className="mt-6 text-sm leading-relaxed text-secondary">
              Megabat has internal arithmetic in the engine AST, but customers do not author free-form
              `add` or `sub` expressions in the public DSL today. The public surface stays declarative:
              metric sugar, raw state refs, indexed metrics, and raw event scans.
            </p>
            <ExampleBlock title="Example definition" code={logicExample} language="json" filename="logic.json" />
          </>
        );
      case 'auth':
        return (
          <>
            <RowList rows={authRows} />
            <p className="mt-6 text-sm leading-relaxed text-secondary">
              Public routes are `GET /health`, `GET /chains`, `GET /ready`, `POST /api/v1/auth/register`,
              `POST /api/v1/auth/siwe/nonce`, and `POST /api/v1/auth/siwe/verify`.
            </p>
            <ExampleBlock title="Register for API-key access" code={authExample} language="shell" filename="auth.http" />
          </>
        );
      case 'delivery':
        return (
          <>
            <RowList rows={deliveryRows} />
            <p className="mt-6 text-sm leading-relaxed text-secondary">
              For direct Telegram delivery, `context.app_user_id` in the outbound payload should
              match the Telegram link mapping used by the delivery service. Telegram inline `Why`
              and snooze actions are already owned by the backend delivery path, so the frontend
              only configures repeat policy at signal create or update time.
            </p>
            <ExampleBlock title="Outbound webhook payload" code={deliveryExample} language="json" filename="webhook-payload.json" />
          </>
        );
      case 'history':
        return (
          <>
            <RowList rows={historyRows} />
            <p className="mt-6 text-sm leading-relaxed text-secondary">
              Normalized explanation fields are duplicated out of historical metadata so UI clients
              can render evaluation and notification reasoning without parsing backend-specific blobs.
              Existing `metadata` and stored notification `payload` values still exist for backward compatibility.
            </p>
            <ExampleBlock title="History response" code={historyExample} language="json" filename="history.json" />
          </>
        );
      case 'routes':
        return (
          <>
            <RowList rows={routes} columns="method" />
            <p className="mt-6 text-sm leading-relaxed text-secondary">
              `GET /health` is liveness. `GET /ready` checks live dependencies. `GET /api/v1/catalog`
              exposes the backend raw-event template catalog. Raw state and metric sugar are authored
              directly in the DSL. Signal history returns normalized explanation fields. Simulation
              returns `409 Conflict` when the stored signal depends on a disabled source family.
            </p>
            <ExampleBlock title="Simulation request" code={routesExample} language="shell" filename="simulate.http" />
          </>
        );
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <header className="max-w-3xl">
        <h1 className="text-4xl tracking-tight text-foreground sm:text-5xl">Megabat Docs</h1>
        <p className="mt-4 text-base leading-relaxed text-secondary sm:text-lg">
          Reference for `state_ref`, metric sugar, indexed metrics, raw events, repeat policy, history, auth, delivery, and routes.
        </p>
      </header>

      <div className="mt-10 lg:grid lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-12">
        <aside className="border-b border-border pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
          <nav className="flex gap-5 overflow-x-auto lg:flex-col lg:gap-1">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveId(section.id)}
                className={cn(
                  'border-b-2 border-transparent py-2 text-left text-sm text-secondary transition-colors lg:border-b-0 lg:border-l-2 lg:py-3 lg:pl-3',
                  activeId === section.id && 'border-foreground text-foreground',
                  activeId !== section.id && 'hover:text-foreground'
                )}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="pt-8 lg:pt-0">
          <div className="border-b border-border pb-6">
            <h2 className="text-3xl tracking-tight text-foreground">{activeSection.label}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-secondary">
              {activeSection.description}
            </p>
          </div>

          <div className="space-y-6 pt-8">{renderContent()}</div>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-6 border-t border-border pt-6 text-sm">
        <Link href="/login" className="text-foreground no-underline transition-colors hover:text-[#ff6b35]">
          Open app
        </Link>
        <a
          href={MEGABAT_GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="text-foreground no-underline transition-colors hover:text-[#ff6b35]"
        >
          GitHub
        </a>
      </div>
    </div>
  );
}
