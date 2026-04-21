'use client';

import { motion } from 'framer-motion';
import { RiArrowDownLine, RiArrowRightUpLine } from 'react-icons/ri';
import { CodeBlock } from './ui/CodeBlock';
import { SectionTag } from './ui/SectionTag';
import { IRUKA_DOCS_OVERVIEW_URL } from '@/lib/iruka-links';

const previewSignals = [
  { label: 'State', value: 'Vault shares dropped 22% across 3 of 5 addresses', tone: 'accent' },
  { label: 'Indexed', value: 'Net supply turned negative over the last 6h', tone: 'default' },
  { label: 'Raw', value: 'USDC transfer burst crossed the 1M threshold', tone: 'telegram' },
] as const;

const previewCode = `signal.when({
  state: "ERC4626.Position.shares",
  indexed: "Morpho.Flow.netSupply",
  raw: "erc20_transfer",
  logic: "AND",
  window: "6h"
});`;

export function Hero() {
  const scrollToSection = () => {
    const element = document.getElementById('story');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden pt-24 pb-16 md:pt-30 md:pb-22">

      <div className="page-gutter relative z-10">
        <div className="px-1 py-7 sm:px-2 sm:py-10 lg:py-12">
          <div className="relative z-10 grid items-start gap-10 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                <SectionTag>Iruka</SectionTag>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08 }}
                className="mt-5 ui-kicker"
              >
                For Operators And Agent Builders
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.14 }}
                className="ui-display mt-4"
              >
                Onchain conditions, kept quietly in view.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.2 }}
                className="ui-copy mt-6 text-base sm:text-lg"
              >
                Iruka turns state, indexed history, and raw events into a clean operating surface.
                Define the condition once, then let the system carry the monitoring.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.26 }}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <button onClick={scrollToSection} className="w-fit">
                  <span className="ui-button px-5 py-3.5" data-variant="primary">
                    See The Flow
                    <RiArrowDownLine className="h-4 w-4" />
                  </span>
                </button>
                <a href={IRUKA_DOCS_OVERVIEW_URL} target="_blank" rel="noopener noreferrer" className="no-underline">
                  <span className="ui-button px-5 py-3.5" data-variant="secondary">
                    Read The Docs
                    <RiArrowRightUpLine className="h-4 w-4" />
                  </span>
                </a>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24 }}
              className="ui-panel space-y-6 p-6 sm:p-7"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="ui-kicker">Condition Set</div>
                  <h2 className="mt-3 font-display text-[1.35rem] leading-tight text-foreground">
                    Quiet monitoring, clear handoff.
                  </h2>
                </div>
                <span className="ui-chip" data-tone="accent">
                  Ready
                </span>
              </div>

              <div className="space-y-3">
                {previewSignals.map((signal, index) => (
                  <motion.div
                    key={signal.value}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.32, delay: 0.34 + index * 0.08 }}
                    className="ui-panel-ghost px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="ui-chip" data-tone={signal.tone}>
                        {signal.label}
                      </span>
                      <span className="text-[0.72rem] uppercase tracking-[0.18em] text-[color:var(--ink-muted)]">
                        Tracking
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-secondary">{signal.value}</p>
                  </motion.div>
                ))}
              </div>

              <div className="ui-panel-ghost p-4">
                <div className="ui-kicker">Definition</div>
                <div className="mt-4">
                  <CodeBlock code={previewCode} language="typescript" showHeader={false} tone="light" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
