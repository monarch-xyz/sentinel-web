'use client';

import { motion } from 'framer-motion';
import { RiRobot2Line, RiCheckLine, RiFileCopyLine } from 'react-icons/ri';
import { useState } from 'react';
import { CodeBlock } from './ui/CodeBlock';
import { SENTINEL_ARCHITECTURE_DOCS_URL } from '@/lib/sentinel-links';

const step1Code = `# sentinel-skill.md

You have access to Sentinel for blockchain monitoring.

## Capabilities
- Monitor DeFi positions for changes
- Track market state aliases and computed refs (utilization, borrow, supply)
- Query raw event presets or custom ABI events with "type": "raw-events"
- Receive webhooks when conditions trigger

## Quick Setup
To monitor a market, create a signal:

POST https://your-sentinel-host/api/v1/signals
X-API-Key: YOUR_API_KEY

{
  "name": "High Utilization",
  "definition": {
    "scope": { "chains": [1], "markets": ["0xMarket"], "protocol": "morpho" },
    "window": { "duration": "1h" },
    "conditions": [{
      "type": "threshold",
      "metric": "Morpho.Market.utilization",
      "operator": ">",
      "value": 0.9,
      "chain_id": 1,
      "market_id": "0xMarket"
    }]
  },
  "webhook_url": "YOUR_WEBHOOK_URL",
  "cooldown_minutes": 5,
  "repeat_policy": { "mode": "cooldown" }
}`;

const step2Code = `curl -X POST https://your-sentinel-host/api/v1/signals \\
  -H "X-API-Key: $SENTINEL_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Swap Volume Burst",
    "definition": {
      "scope": { "chains": [1], "protocol": "all" },
      "window": { "duration": "30m" },
      "conditions": [{
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
        "filters": [{ "field": "recipient", "op": "eq", "value": "0xReceiver" }]
      }]
    },
    "webhook_url": "https://your-agent.com/webhook",
    "cooldown_minutes": 10,
    "repeat_policy": { "mode": "post_first_alert_snooze", "snooze_minutes": 1440 }
  }'`;

const step3Code = `# When Sentinel triggers, you receive:
{
  "signal_id": "sig_abc123",
  "signal_name": "Swap Volume Burst",
  "triggered_at": "2026-02-02T15:30:00Z",
  "scope": {
    "chains": [1],
    "addresses": ["0xReceiver"]
  },
  "conditions_met": [
    {
      "conditionIndex": 0,
      "conditionType": "simple",
      "triggered": true,
      "summary": "500000 > 100000"
    }
  ],
  "context": {
    "app_user_id": "user_123",
    "address": "0xReceiver",
    "chain_id": 1
  }
}

# Your agent can then:
→ Alert the user via Telegram/Discord
→ Execute on-chain transactions
→ Log to monitoring systems
→ Trigger other automations`;

export function AgentOnboarding() {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const copyToClipboard = (text: string, step: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(step);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const steps = [
    {
      number: 1,
      title: 'Add Sentinel to your agent skills',
      description: 'Include the Sentinel skill in your agent\'s capabilities. This teaches your agent how to create and manage blockchain monitors.',
      code: step1Code,
      language: 'markdown',
      filename: 'sentinel-skill.md',
    },
    {
      number: 2,
      title: 'Create your first signal',
      description: 'Your agent calls the Sentinel API to register a monitoring condition. Use state aliases for common reads or raw-event presets when you need direct decoded logs.',
      code: step2Code,
      language: 'bash',
      filename: 'create-signal.sh',
    },
    {
      number: 3,
      title: 'React to events',
      description: 'When conditions trigger, Sentinel sends a webhook to your agent. Take action automatically—no polling required.',
      code: step3Code,
      language: 'json',
      filename: 'webhook-response.md',
    },
  ];

  return (
    <section id="onboarding" className="relative py-24 md:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-surface" />
      <div
        className="absolute inset-0 bg-line-grid opacity-30 pointer-events-none"
        aria-hidden="true"
      />

      <div className="page-gutter relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <RiRobot2Line className="w-6 h-6 text-[#ff6b35]" />
            <span className="text-sm font-medium text-[#ff6b35]">Agent Integration Guide</span>
          </div>
          <h2 className="font-zen text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Get Your Agent <span className="text-[#ff6b35]">Watching in Minutes</span>
          </h2>
          <p className="text-secondary text-lg max-w-2xl mx-auto">
            Three steps to give your AI agent eyes on the blockchain. No infrastructure setup, no complex indexers.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-12 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              {/* Step indicator */}
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-[#ff6b35] rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {step.number}
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="font-zen text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-secondary mb-4">{step.description}</p>
                  
                  {/* Code block with copy button */}
                  <div className="relative group">
                    <button
                      onClick={() => copyToClipboard(step.code, step.number)}
                      className="absolute top-3 right-3 z-10 p-2 rounded-md bg-background/50 hover:bg-background border border-border opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Copy code"
                    >
                      {copiedStep === step.number ? (
                        <RiCheckLine className="w-4 h-4 text-green-500" />
                      ) : (
                        <RiFileCopyLine className="w-4 h-4 text-secondary" />
                      )}
                    </button>
                    <CodeBlock 
                      code={step.code} 
                      language={step.language}
                      filename={step.filename}
                    />
                  </div>
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-6 top-14 bottom-0 w-px bg-gradient-to-b from-[#ff6b35]/50 to-transparent -translate-x-1/2" />
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-secondary mb-4">Ready to give your agent superpowers?</p>
          <a
            href={SENTINEL_ARCHITECTURE_DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff6b35] text-white font-medium rounded-md hover:opacity-90 transition-opacity no-underline"
          >
            <RiRobot2Line className="w-5 h-5" />
            Read Full Agent Docs
          </a>
        </motion.div>
      </div>
    </section>
  );
}
