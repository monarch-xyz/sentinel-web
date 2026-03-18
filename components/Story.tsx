'use client';

import { motion } from 'framer-motion';
import { CodeBlock } from './ui/CodeBlock';
import { SectionTag } from './ui/SectionTag';
import { GridDivider } from './ui/GridDivider';

const storyBeats = [
  {
    id: 'problem',
    tag: 'Events In',
    title: 'Raw feeds are too literal.',
    content: `Subscribing to raw events is easy. Deciding which combinations actually matter is the hard part. Agents still end up reading noisy feeds and rebuilding the same logic again and again.`,
    code: `events.on("Transfer", notify)
events.on("Borrow", notify)
events.on("Liquidate", notify)
events.on("Redeem", notify)

// Raw event streams.
// Too much activity, not enough intent.`,
  },
  {
    id: 'insight',
    tag: 'Signal Out',
    title: 'Use DSL to state what you mean.',
    content: `The useful abstraction is a DSL that describes the actual state change you care about: specific scope, exact thresholds, time windows, and logic gates. That gives your agent a signal instead of a feed.`,
    code: `{
  "scope": { "chains": [1], "protocol": "all" },
  "conditions": [
    { "metric": "Price.deviationBps", "operator": "<=", "value": -10 },
    { "metric": "Liquidity.availableUsd", "operator": "<", "value": 5000000 }
  ],
  "logic": "AND",
  "window": { "duration": "2h" }
}`,
  },
  {
    id: 'solution',
    tag: 'DSL Infrastructure',
    title: 'Write intent. Rely on the infrastructure.',
    content: `Your agent can use DSL to describe exactly what it wants, while Sentinel handles the hard part: continuous evaluation, stateful windows, logic composition, and reliable delivery. That keeps the signal definition precise without making the production path fragile.`,
    code: `POST /api/v1/signals
{
  "name": "3 of 5 Morpho vault exits",
  "definition": {
    "scope": {
      "chains": [1],
      "markets": ["0x..."],
      "protocol": "morpho"
    },
    "conditions": [
      {
        "type": "group",
        "addresses": ["0x1...", "0x2...", "0x3...", "0x4...", "0x5..."],
        "requirement": { "count": 3, "of": 5 },
        "conditions": [
          {
            "type": "change",
            "metric": "Morpho.Position.supplyShares",
            "direction": "decrease",
            "by": { "percent": 20 },
            "window": { "duration": "1d" }
          }
        ]
      }
    ],
    "logic": "AND",
    "window": { "duration": "7d" }
  },
  "notify": ["telegram", "webhook"]
}`,
  },
];

export function Story() {
  return (
    <section id="story" className="relative">
      {/* Grid divider at top */}
      <GridDivider rows={4} />

      <div className="py-16 md:py-24">
        <div className="page-gutter">
          {storyBeats.map((beat, index) => (
            <motion.div
              key={beat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5 }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
                index < storyBeats.length - 1 ? 'mb-24 md:mb-32' : ''
              }`}
            >
              {/* Text side */}
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <SectionTag>{beat.tag}</SectionTag>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl mt-4 mb-4">
                  {beat.title}
                </h2>
                <p className="text-secondary leading-relaxed">
                  {beat.content}
                </p>
              </div>
              
              {/* Code side */}
              <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                <CodeBlock code={beat.code} tone="light" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
