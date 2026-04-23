'use client';

import { motion } from 'framer-motion';
import { CodeBlock } from './ui/CodeBlock';

const canonicalSnippet = `{
  "version": "1",
  "name": "Morpho supplier unwind watch",
  "triggers": [
    {
      "type": "schedule",
      "schedule": { "kind": "interval", "interval_seconds": 300 }
    },
    {
      "type": "iruka_signal",
      "id": "sig_upstream_abc123"
    }
  ],
  "definition": {
    "scope": { "chains": [1], "markets": ["0xMarket"], "protocol": "morpho" },
    "window": { "duration": "7d" },
    "logic": "AND",
    "conditions": [{ "...": "..." }]
  },
  "delivery": [{ "type": "telegram" }],
  "metadata": {
    "description": "Trigger when 2 of 3 tracked suppliers each reduce supply shares by >=20%.",
    "repeat_policy": { "mode": "until_resolved" }
  }
}`;

const triggerVariationSnippet = `[
  {
    "type": "schedule",
    "schedule": { "kind": "interval", "interval_seconds": 300 }
  },
  {
    "type": "schedule",
    "schedule": { "kind": "cron", "expression": "0 8 * * *" }
  },
  {
    "type": "iruka_signal",
    "id": "sig_upstream_abc123"
  }
]

// "external" is in the target schema but public input is not live yet.`;

const deliverySnippet = `[
  { "type": "telegram" }
]`;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-16 md:py-24">
      <div className="page-gutter">
        <div className="mx-auto max-w-3xl text-center">
          <div className="ui-kicker justify-center">Public Schema</div>
          <h2 className="ui-section-title mt-5">Define one signal with one or more wake-up paths.</h2>
          <p className="ui-copy mx-auto mt-4">
            The user should see the clean split: triggers decide when to wake, definition decides what to check, delivery decides where the alert goes.
          </p>
        </div>

        <motion.div
          className="mt-10 grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } }}
            className="ui-panel p-5"
          >
            <div className="ui-kicker">Canonical request</div>
            <div className="mt-5">
              <CodeBlock code={canonicalSnippet} language="json" filename="signal.json" tone="light" showLineNumbers />
            </div>
          </motion.div>

          <div className="space-y-4">
            <motion.div
              variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } }}
              className="ui-panel p-5"
            >
              <div className="ui-kicker">Trigger variations</div>
              <p className="mt-3 text-sm text-secondary">Swap the schedule style or add another trigger entry without rewriting the condition.</p>
              <div className="mt-4">
                <CodeBlock code={triggerVariationSnippet} language="json" tone="light" showHeader={false} />
              </div>
            </motion.div>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } }}
              className="ui-panel p-5"
            >
              <div className="ui-kicker">Delivery</div>
              <p className="mt-3 text-sm text-secondary">Delivery is its own field, so notification routing does not change the trigger or definition.</p>
              <div className="mt-4">
                <CodeBlock code={deliverySnippet} language="json" tone="light" showHeader={false} />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
