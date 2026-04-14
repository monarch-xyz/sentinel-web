import Link from 'next/link';
import { RiArrowRightLine, RiBookOpenLine, RiFileCodeLine } from 'react-icons/ri';
import { CreateFlowHeader } from '@/components/app/CreateFlowHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { HelpHint } from '@/components/ui/HelpHint';
import { AGENT_GUIDE_RESOURCES, SENTINEL_ONE_LINER } from '@/lib/signals/create-flow-catalog';

const agentPrompt = `Read the Sentinel docs and create a signal for me.

Goal:
- Watch ERC4626.Position.shares for a vault I specify
- Track multiple owner addresses
- Alert when N owners each reduce shares by at least X% in Y window

Return:
- the final signal JSON
- a short explanation of the scope, condition, delivery settings, and repeat_policy choice`;

export function AgentSignalGuide() {
  return (
    <div className="space-y-6">
      <CreateFlowHeader
        eyebrow="Agent guide"
        title="Point your agent at the docs"
        summary={`${SENTINEL_ONE_LINER} Use docs and a starter prompt.`}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Card className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-secondary">Resources</p>
            <h2 className="mt-2 font-zen text-2xl">Use these with your agent</h2>
          </div>

          <div className="space-y-3">
            {AGENT_GUIDE_RESOURCES.map((resource) => (
              <Link
                key={resource.href}
                href={resource.href}
                className="flex items-start justify-between gap-3 rounded-sm border border-border bg-background/50 px-4 py-3 no-underline transition-colors hover:bg-hovered"
              >
                <div className="flex items-center gap-2">
                  <p className="text-sm text-foreground">{resource.title}</p>
                  <HelpHint text={resource.helpText} />
                </div>
                <RiArrowRightLine className="mt-1 h-4 w-4 shrink-0 text-secondary" />
              </Link>
            ))}
          </div>

          <Link href="/docs" className="no-underline">
            <Button className="gap-2">
              Open docs
              <RiBookOpenLine className="h-4 w-4" />
            </Button>
          </Link>
        </Card>

        <Card className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-secondary">Starter prompt</p>
            <h2 className="mt-2 font-zen text-2xl">Minimal handoff</h2>
          </div>

          <div className="rounded-sm border border-border/80 bg-background/50 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-secondary">
              <RiFileCodeLine className="h-4 w-4" />
              Agent prompt
            </div>
            <CodeBlock code={agentPrompt} language="text" filename="agent-prompt.txt" tone="dark" />
          </div>
        </Card>
      </div>
    </div>
  );
}
