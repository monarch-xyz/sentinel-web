import { RiArrowRightLine, RiBookOpenLine, RiFileCodeLine } from 'react-icons/ri';
import { CreateFlowHeader } from '@/components/app/CreateFlowHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { HelpHint } from '@/components/ui/HelpHint';
import { IRUKA_DOCS_OVERVIEW_URL } from '@/lib/iruka-links';
import { AGENT_GUIDE_RESOURCES, IRUKA_ONE_LINER } from '@/lib/signals/create-flow-catalog';

const agentPrompt = `Read the Iruka docs and create a signal for me.

Goal:
- Watch ERC4626.Position.shares for a vault I specify
- Track multiple owner addresses
- Alert when N owners each reduce shares by at least X% in Y window

Return:
- the final signal JSON
- a short explanation of targeting, triggers, delivery, and metadata.repeat_policy`;

export function AgentSignalGuide() {
  return (
    <div className="space-y-6">
      <CreateFlowHeader
        eyebrow="Agent guide"
        title="Point your agent at the docs"
        summary={`${IRUKA_ONE_LINER} Use docs and a starter prompt.`}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Card className="space-y-5">
          <div>
            <div className="ui-kicker">Resources</div>
            <h2 className="mt-4 font-display text-[1.85rem] leading-none text-foreground">Use these with your agent</h2>
          </div>

          <div className="space-y-3">
            {AGENT_GUIDE_RESOURCES.map((resource) => (
              <a
                key={resource.href}
                href={resource.href}
                target="_blank"
                rel="noopener noreferrer"
                className="ui-option flex items-start justify-between gap-3 px-4 py-3 no-underline"
              >
                <div className="flex items-center gap-2">
                  <p className="text-sm text-foreground">{resource.title}</p>
                  <HelpHint text={resource.helpText} />
                </div>
                <RiArrowRightLine className="mt-1 h-4 w-4 shrink-0 text-secondary" />
              </a>
            ))}
          </div>

          <a href={IRUKA_DOCS_OVERVIEW_URL} target="_blank" rel="noopener noreferrer" className="no-underline">
            <Button className="gap-2">
              Open docs
              <RiBookOpenLine className="h-4 w-4" />
            </Button>
          </a>
        </Card>

        <Card className="space-y-5">
          <div>
            <div className="ui-kicker">Starter prompt</div>
            <h2 className="mt-4 font-display text-[1.85rem] leading-none text-foreground">Minimal handoff</h2>
          </div>

          <div className="ui-panel-ghost p-4">
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-secondary">
              <RiFileCodeLine className="h-4 w-4" />
              Agent prompt
            </div>
            <CodeBlock code={agentPrompt} language="text" filename="agent-prompt.txt" tone="light" />
          </div>
        </Card>
      </div>
    </div>
  );
}
