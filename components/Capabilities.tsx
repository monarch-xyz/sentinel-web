'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SectionTag } from './ui/SectionTag';
import { GridDivider } from './ui/GridDivider';
import { CodeBlock } from './ui/CodeBlock';

type UseCase = {
  id: string;
  title: string;
  summary: string;
  details: string[];
  code: string;
};

const useCases: UseCase[] = [
  {
    id: 'vault-withdrawal-cluster',
    title: 'Vault withdrawal cluster',
    summary: 'Contract-scoped state monitoring for coordinated ERC-4626 share withdrawals.',
    details: [
      '3 of 5 tracked owners reduce vault shares by at least 1e18 over 7 days.',
      'Uses the `ERC4626.Position.shares` state alias instead of raw events.',
      'Large integer thresholds can be authored as decimal strings.',
    ],
    code: `{
  "name": "Vault withdrawal cluster",
  "definition": {
    "scope": {
      "chains": [1],
      "addresses": [
        "0x1111111111111111111111111111111111111111",
        "0x2222222222222222222222222222222222222222",
        "0x3333333333333333333333333333333333333333",
        "0x4444444444444444444444444444444444444444",
        "0x5555555555555555555555555555555555555555"
      ],
      "protocol": "all"
    },
    "conditions": [
      {
        "type": "group",
        "addresses": [
          "0x1111111111111111111111111111111111111111",
          "0x2222222222222222222222222222222222222222",
          "0x3333333333333333333333333333333333333333",
          "0x4444444444444444444444444444444444444444",
          "0x5555555555555555555555555555555555555555"
        ],
        "requirement": { "count": 3, "of": 5 },
        "window": { "duration": "1d" },
        "logic": "AND",
        "conditions": [
          {
            "type": "change",
            "metric": "ERC4626.Position.shares",
            "direction": "decrease",
            "by": { "absolute": "1000000000000000000" },
            "window": { "duration": "7d" },
            "chain_id": 1,
            "contract_address": "0xVaultAddress"
          }
        ]
      }
    ],
    "logic": "AND",
    "window": { "duration": "7d" }
  }
}`,
  },
  {
    id: 'treasury-outflow',
    title: 'Treasury outflow',
    summary: 'A raw-event monitor for large ERC-20 outflows from one treasury or vault.',
    details: [
      'Scan decoded ERC-20 `Transfer` logs directly instead of relying on a derived metric.',
      'Filter to one sender address and one token contract.',
      'Trigger when gross outflow over the window exceeds a fixed threshold.',
    ],
    code: `{
  "name": "Treasury outflow",
  "definition": {
    "scope": {
      "chains": [1],
      "addresses": ["0x1111111111111111111111111111111111111111"],
      "protocol": "all"
    },
    "conditions": [
      {
        "type": "raw-events",
        "aggregation": "sum",
        "field": "value",
        "operator": ">=",
        "value": 5000000,
        "window": { "duration": "2h" },
        "chain_id": 1,
        "event": {
          "kind": "erc20_transfer",
          "contract_addresses": ["0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"]
        },
        "filters": [
          {
            "field": "from",
            "op": "eq",
            "value": "0x1111111111111111111111111111111111111111"
          }
        ]
      }
    ],
    "logic": "AND",
    "window": { "duration": "2h" }
  }
}`,
  },
];

export function Capabilities() {
  const [activeUseCaseId, setActiveUseCaseId] = useState(useCases[0].id);
  const activeUseCase = useCases.find((useCase) => useCase.id === activeUseCaseId) ?? useCases[0];

  return (
    <section className="relative">
      <GridDivider rows={4} />

      <div className="relative py-16 md:py-24 bg-surface">
        <div
          className="absolute inset-0 bg-line-grid opacity-40 pointer-events-none"
          aria-hidden="true"
        />

        <div className="page-gutter relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <SectionTag>Detection Patterns</SectionTag>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl mt-4 mb-3">
              Two concrete patterns <span className="text-[#ff6b35]">Megabat can detect</span>
            </h2>
            <p className="text-secondary max-w-2xl">
              Click a use case to inspect how the DSL turns subtle but important movement into a signal Megabat can keep watching for.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(300px,0.78fr)_minmax(0,1.22fr)] gap-6 items-start">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {useCases.map((useCase, index) => {
                  const isActive = useCase.id === activeUseCaseId;

                  return (
                    <motion.button
                      key={useCase.id}
                      type="button"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.08 }}
                      onClick={() => setActiveUseCaseId(useCase.id)}
                      className={cn(
                        'w-full rounded-md border px-4 py-3 text-left transition-colors',
                        isActive
                          ? 'border-[#1f2328] bg-background text-foreground'
                          : 'border-border bg-background/70 text-secondary hover:border-[#ff6b35]/20 hover:text-foreground'
                      )}
                    >
                      <p className="text-sm text-foreground">{useCase.title}</p>
                    </motion.button>
                  );
                })}
              </div>

              <motion.div
                key={activeUseCase.id + '-details'}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="rounded-md border border-border bg-background/80 p-5"
              >
                <p className="text-sm text-foreground">{activeUseCase.title}</p>
                <p className="mt-2 text-sm text-secondary leading-relaxed">{activeUseCase.summary}</p>
                <div className="mt-4 space-y-2">
                  {activeUseCase.details.map((detail) => (
                    <p key={detail} className="text-sm text-secondary leading-relaxed">
                      {detail}
                    </p>
                  ))}
                </div>
              </motion.div>
            </div>

            <motion.div
              key={activeUseCase.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-md border border-border bg-background/80 p-4 sm:p-5"
            >
              <CodeBlock
                code={activeUseCase.code}
                language="json"
                filename={`${activeUseCase.id}.json`}
                showLineNumbers
                tone="light"
                className="rounded-md"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
