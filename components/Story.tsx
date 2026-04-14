'use client';

import { motion } from 'framer-motion';
import { CodeBlock } from './ui/CodeBlock';
import { SectionTag } from './ui/SectionTag';
import { GridDivider } from './ui/GridDivider';

const storyBeats = [
  {
    id: 'problem',
    tag: 'Reads In',
    title: 'Raw reads are too literal.',
    content: `Polling state, querying indexed history, and subscribing to raw events are all easy in isolation. The hard part is turning those separate reads into one durable signal your agent can actually trust.`,
    code: `rpc.read("balanceOf", owner)
index.query("ProtocolEvent", window)
events.on("Transfer", notify)

// State, indexed, and raw reads.
// Too much plumbing, not enough intent.`,
  },
  {
    id: 'insight',
    tag: 'Signal Out',
    title: 'Use DSL to state what you mean.',
    content: `The useful abstraction is a DSL that describes the actual state change you care about: specific scope, exact thresholds, time windows, and logic gates. That gives your agent a signal instead of a feed.`,
    code: `{
  "scope": {
    "chains": [1],
    "protocol": "all"
  },
  "conditions": [
    {
      "type": "change",
      "metric": "ERC4626.Position.shares",
      "direction": "decrease",
      "by": { "percent": 20 },
      "chain_id": 1,
      "contract_address": "0xVault",
      "address": "0xOwner"
    },
    {
      "type": "raw-events",
      "aggregation": "sum",
      "field": "value",
      "operator": ">",
      "value": 1000000,
      "chain_id": 1,
      "event": {
        "kind": "erc20_transfer",
        "contract_addresses": ["0xToken"]
      },
      "filters": [{ "field": "to", "op": "eq", "value": "0xOwner" }]
    }
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
  "name": "3 of 5 vault owners withdrew >1e18 shares",
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
                { "field": "contractAddress", "op": "eq", "value": "0xVault" }
              ]
            },
            "direction": "decrease",
            "by": { "absolute": "1000000000000000000" },
            "window": { "duration": "1d" },
            "chain_id": 1
          }
        ],
        "window": { "duration": "1d" }
      }
    ],
    "logic": "AND",
    "window": { "duration": "7d" }
  },
  "delivery": { "provider": "telegram" },
  "cooldown_minutes": 60,
  "repeat_policy": { "mode": "until_resolved" }
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
