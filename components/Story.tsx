'use client';

import { motion } from 'framer-motion';
import { CodeBlock } from './ui/CodeBlock';
import { SectionTag } from './ui/SectionTag';

const storyBeats = [
  {
    id: 'problem',
    tag: 'Problem',
    title: 'Feeds are not decisions.',
    content:
      'Polling state, querying indexed history, and subscribing to raw events all produce motion. Operators still need a trusted condition that separates signal from churn.',
    code: `rpc.read("balanceOf", owner)
index.query("ProtocolEvent", window)
events.on("Transfer", notify)

// Plenty of motion.
// Still no decision surface.`,
  },
  {
    id: 'insight',
    tag: 'Abstraction',
    title: 'Describe the condition, not the plumbing.',
    content:
      'Iruka turns the watch target into one explicit pattern: scope, thresholds, time windows, and boolean logic. The result is a durable rule instead of a stack of one-off reads.',
    code: `{
  "scope": { "chains": [1], "protocol": "all" },
  "conditions": [
    {
      "type": "change",
      "metric": "ERC4626.Position.shares",
      "direction": "decrease",
      "by": { "percent": 20 }
    },
    {
      "type": "raw-events",
      "aggregation": "sum",
      "field": "value",
      "operator": ">",
      "value": 1000000
    }
  ],
  "logic": "AND",
  "window": { "duration": "2h" }
}`,
  },
  {
    id: 'runtime',
    tag: 'Runtime',
    title: 'Iruka keeps watch after setup.',
    content:
      'Once the pattern exists, Iruka owns the continuous evaluation loop, manages windows, and delivers structured context only when the pattern actually resolves.',
    code: `POST /api/v1/signals
{
  "name": "Vault withdrawal cluster",
  "definition": { "...": "..." },
  "delivery": { "provider": "telegram" },
  "cooldown_minutes": 60,
  "repeat_policy": { "mode": "until_resolved" }
}`,
  },
];

export function Story() {
  return (
    <section id="story" className="relative py-16 md:py-24">
      <div className="page-gutter">
        <div className="mb-10 max-w-3xl">
          <SectionTag>Why Iruka</SectionTag>
          <h2 className="ui-section-title mt-5">Iruka keeps exact conditions legible without turning open data into raw telemetry.</h2>
          <p className="ui-copy mt-4">
            The product exists to make monitoring composable, durable, and useful for the person or agent
            that needs to act. Every layer below exists to support that one outcome.
          </p>
        </div>

        <div className="space-y-6">
          {storyBeats.map((beat, index) => (
            <motion.div
              key={beat.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className="ui-panel grid gap-6 px-6 py-6 sm:px-7 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-start"
            >
              <div className="relative z-10">
                <div className="ui-kicker">{beat.tag}</div>
                <h3 className="mt-4 font-display text-[2rem] leading-none text-foreground">{beat.title}</h3>
                <p className="ui-copy mt-4">{beat.content}</p>
              </div>

              <div className="relative z-10">
                <CodeBlock code={beat.code} tone="light" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
