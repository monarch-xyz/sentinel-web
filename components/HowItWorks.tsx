'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CodeBlock } from './ui/CodeBlock';

const editFrames = [
  {
    label: 'Start with an interval',
    note: 'A recurring check is just one trigger entry.',
    code: `"triggers": [
  {
    "type": "schedule",
    "schedule": { "kind": "interval", "interval_seconds": 300 }
  }
]`,
  },
  {
    label: 'Change to cron',
    note: 'Swap the schedule style without touching the definition.',
    code: `"triggers": [
  {
    "type": "schedule",
    "schedule": { "kind": "cron", "expression": "0 8 * * *" }
  }
]`,
  },
  {
    label: 'Add another wake-up path',
    note: 'Multiple triggers live in the same array.',
    code: `"triggers": [
  {
    "type": "schedule",
    "schedule": { "kind": "cron", "expression": "0 8 * * *" }
  },
  {
    "type": "iruka_signal",
    "id": "sig_upstream_abc123"
  }
]`,
  },
  {
    label: 'Tune repeat behavior',
    note: 'Cooldown policy belongs in metadata, separate from the trigger.',
    code: `"metadata": {
  "description": "Watch coordinated supplier exits.",
  "repeat_policy": {
    "mode": "cooldown",
    "cooldown_minutes": 60
  }
}`,
  },
  {
    label: 'Route delivery',
    note: 'Notification routing is one small field.',
    code: `"delivery": [
  { "type": "telegram" }
]`,
  },
];

function TypingCode() {
  const [frameIndex, setFrameIndex] = useState(0);
  const [visibleChars, setVisibleChars] = useState(0);
  const frame = editFrames[frameIndex];

  useEffect(() => {
    if (visibleChars < frame.code.length) {
      const timeout = window.setTimeout(() => setVisibleChars((value) => value + 3), 18);
      return () => window.clearTimeout(timeout);
    }

    const timeout = window.setTimeout(() => {
      setFrameIndex((value) => (value + 1) % editFrames.length);
      setVisibleChars(0);
    }, 1600);
    return () => window.clearTimeout(timeout);
  }, [frame.code.length, visibleChars]);

  const typedCode = useMemo(() => frame.code.slice(0, visibleChars), [frame.code, visibleChars]);

  return (
    <div className="ui-panel p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="ui-kicker">Schema edit</div>
          <h3 className="mt-4 font-display text-[1.5rem] leading-none text-foreground">{frame.label}</h3>
          <p className="mt-3 text-sm leading-relaxed text-secondary">{frame.note}</p>
        </div>
        <span className="ui-chip" data-tone="accent">
          {frameIndex + 1}/{editFrames.length}
        </span>
      </div>

      <div className="mt-5">
        <CodeBlock code={typedCode || ' '} language="json" filename="signal.patch.json" tone="light" showLineNumbers={false} />
      </div>
    </div>
  );
}

const principles = [
  {
    title: 'Triggers wake it',
    description: 'Use interval, cron, or signal-to-signal triggers in one array.',
  },
  {
    title: 'Definition checks it',
    description: 'The monitored condition stays stable while trigger style changes.',
  },
  {
    title: 'Delivery routes it',
    description: 'Telegram delivery is configured separately from wake-up logic.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-16 md:py-24">
      <div className="page-gutter">
        <div className="mx-auto max-w-3xl text-center">
          <div className="ui-kicker justify-center">Public Schema</div>
          <h2 className="ui-section-title mt-5">Changing trigger style should feel like editing one field.</h2>
          <p className="ui-copy mx-auto mt-4">
            Start with one trigger, swap the schedule style, add another wake-up path, or tune cooldown without rewriting the signal.
          </p>
        </div>

        <motion.div
          className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } }}
            className="grid gap-4"
          >
            {principles.map((item) => (
              <div key={item.title} className="ui-panel p-5">
                <div className="ui-kicker">Field boundary</div>
                <h3 className="mt-4 font-display text-[1.35rem] leading-none text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-secondary">{item.description}</p>
              </div>
            ))}
          </motion.div>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } }}
          >
            <TypingCode />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
