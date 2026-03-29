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
    id: 'liquidity-crisis',
    title: 'Liquidity crisis',
    summary: 'Morpho market stress with coordinated vault exits and rising borrow pressure.',
    details: [
      '3 of 5 tracked vaults reduce supply by more than 20% over 1 day.',
      'Borrow APY increases more than 20% over 2 days.',
      'Both conditions must hold together through an AND gate.',
    ],
    code: `{
  "name": "Liquidity crisis",
  "definition": {
    "scope": {
      "chains": [1],
      "markets": ["0x..."],
      "protocol": "morpho"
    },
    "conditions": [
      {
        "type": "group",
        "addresses": ["0xvault1...", "0xvault2...", "0xvault3...", "0xvault4...", "0xvault5..."],
        "requirement": { "count": 3, "of": 5 },
        "window": { "duration": "1d" },
        "conditions": [
          {
            "type": "change",
            "metric": "Morpho.Position.supplyShares",
            "direction": "decrease",
            "by": { "percent": 20 },
            "window": { "duration": "1d" },
            "chain_id": 1,
            "market_id": "0x..."
          }
        ]
      },
      {
        "type": "change",
        "metric": "Morpho.Market.borrowAPY",
        "direction": "increase",
        "by": { "percent": 20 },
        "window": { "duration": "2d" },
        "chain_id": 1,
        "market_id": "0x..."
      }
    ],
    "logic": "AND",
    "window": { "duration": "2d" }
  }
}`,
  },
  {
    id: 'susd-depeg',
    title: 'SUSD depeg',
    summary: 'A stablecoin stress pattern that combines price, liquidity, and whale flow.',
    details: [
      'Price stays at least 10 bps below average for more than 1 hour.',
      'Onchain liquidity shrinks more than 20% over 2 hours.',
      'A single whale transfer crosses a large USD threshold.',
    ],
    code: `{
  "name": "SUSD depeg",
  "definition": {
    "scope": {
      "chains": [1],
      "addresses": ["0xsusd..."],
      "protocol": "all"
    },
    "conditions": [
      {
        "type": "threshold",
        "metric": "Price.deviationFromAverageBps",
        "operator": "<=",
        "value": -10,
        "window": { "duration": "1h" },
        "address": "0xsusd..."
      },
      {
        "type": "change",
        "metric": "Liquidity.availableUsd",
        "direction": "decrease",
        "by": { "percent": 20 },
        "window": { "duration": "2h" },
        "address": "0xsusd..."
      },
      {
        "type": "threshold",
        "metric": "Transfer.valueUsd",
        "operator": ">=",
        "value": 5000000,
        "window": { "duration": "2h" },
        "address": "0xsusd..."
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
            <SectionTag>Practical DSL</SectionTag>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl mt-4 mb-3">
              Two concrete <span className="text-[#ff6b35]">signal definitions</span>
            </h2>
            <p className="text-secondary max-w-2xl">
              Click a use case to inspect how a precise DSL can describe the actual state change you want Sentinel to evaluate.
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
