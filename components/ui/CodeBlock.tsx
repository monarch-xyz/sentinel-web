'use client';

import { useMemo, useState } from 'react';
import { Highlight } from 'prism-react-renderer';
import { RiCheckLine, RiCodeSSlashLine, RiFileCopyLine, RiFileTextLine, RiTerminalLine } from 'react-icons/ri';
import { irukaDarkTheme } from '@/lib/iruka-theme';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  showLineNumbers?: boolean;
  showHeader?: boolean;
  filename?: string;
  highlightLines?: number[];
  tone?: 'dark' | 'light';
}

const languageIcons: Record<string, React.ElementType> = {
  json: RiCodeSSlashLine,
  javascript: RiCodeSSlashLine,
  typescript: RiCodeSSlashLine,
  bash: RiTerminalLine,
  shell: RiTerminalLine,
  markdown: RiFileTextLine,
  md: RiFileTextLine,
};

const languageLabels: Record<string, string> = {
  json: 'JSON',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  bash: 'Shell',
  shell: 'Shell',
  markdown: 'Markdown',
  md: 'Markdown',
};

export function CodeBlock({
  code,
  language = 'json',
  className,
  showLineNumbers = false,
  showHeader = true,
  filename,
  highlightLines = [],
  tone = 'light',
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const Icon = languageIcons[language] || RiCodeSSlashLine;
  const label = languageLabels[language] || language.toUpperCase();
  const trimmedCode = code.trim();
  const lines = useMemo(() => trimmedCode.split('\n'), [trimmedCode]);
  const lineCount = lines.length;
  const gutterWidth = useMemo(() => (lineCount >= 100 ? 'w-10' : lineCount >= 10 ? 'w-8' : 'w-6'), [lineCount]);
  const isLight = tone === 'light';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(trimmedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const surfaceClassName = isLight
    ? 'border-border bg-[color:var(--surface-panel)]'
    : 'border-[color:color-mix(in_oklch,var(--signal-copper)_22%,var(--stroke-soft))] bg-[color:color-mix(in_oklch,var(--surface-canvas-deep)_94%,black)]';

  const headerClassName = isLight
    ? 'bg-[color:color-mix(in_oklch,var(--surface-muted)_88%,white)] text-secondary'
    : 'bg-[color:color-mix(in_oklch,var(--surface-panel-strong)_92%,black)] text-secondary';

  return (
    <div className={cn('relative group overflow-hidden rounded-lg', className)}>
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border transition-colors duration-300 code-glow',
          surfaceClassName
        )}
      >
        {showHeader ? (
          <div
            className={cn(
              'flex items-center justify-between border-b border-border px-4 py-2.5',
              headerClassName
            )}
          >
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5 mr-3">
                <div className="h-2.5 w-2.5 rounded-[0.08rem] bg-[color:var(--signal-alert)]/75" />
                <div className="h-2.5 w-2.5 rounded-[0.08rem] bg-[color:var(--signal-ember)]/75" />
                <div className="h-2.5 w-2.5 rounded-[0.08rem] bg-[color:var(--signal-success)]/75" />
              </div>

              <div className="flex items-center gap-1.5">
                <Icon className="w-4 h-4" />
                <span className="text-xs font-mono">{filename || label}</span>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className={cn(
                'flex items-center gap-1.5 rounded-[0.45rem] px-2 py-1 text-xs transition-all',
                copied
                  ? isLight
                    ? 'bg-[color:color-mix(in_oklch,var(--signal-success)_12%,var(--surface-inset))] text-[color:color-mix(in_oklch,var(--signal-success)_70%,white)]'
                    : 'bg-[color:color-mix(in_oklch,var(--signal-success)_14%,var(--surface-panel))] text-[color:color-mix(in_oklch,var(--signal-success)_70%,white)]'
                  : isLight
                    ? 'bg-background text-secondary hover:bg-hovered hover:text-foreground'
                    : 'bg-[color:color-mix(in_oklch,var(--surface-inset)_88%,black)] text-secondary hover:border-[color:var(--stroke-strong)] hover:text-foreground'
              )}
              aria-label={copied ? 'Copied!' : 'Copy code'}
            >
              {copied ? (
                <>
                  <RiCheckLine className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copied!</span>
                </>
              ) : (
                <>
                  <RiFileCopyLine className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>
          </div>
        ) : null}

        {isLight ? (
          <pre
            className={cn(
              'overflow-x-auto custom-scrollbar bg-transparent text-[13px] leading-relaxed sm:text-sm',
              showHeader ? 'p-4' : 'p-4'
            )}
          >
            <code className="block min-w-fit text-[color:var(--ink-primary)]">
              {lines.map((line, index) => {
                const lineNumber = index + 1;
                const isHighlighted = highlightLines.includes(lineNumber);

                return (
                  <div
                    key={lineNumber}
                    className={cn(
                      'relative whitespace-pre',
                      isHighlighted && 'mx-[-0.4rem] rounded-[0.45rem] bg-[color:color-mix(in_oklch,var(--signal-copper)_10%,white)] px-[0.4rem]'
                    )}
                  >
                    {showLineNumbers ? (
                      <span
                        className={cn(
                          'inline-block text-right mr-4 text-secondary/60 select-none text-xs tabular-nums',
                          gutterWidth,
                          isHighlighted && 'text-[color:var(--signal-copper)]'
                        )}
                      >
                        {lineNumber}
                      </span>
                    ) : null}
                    {line || ' '}
                  </div>
                );
              })}
            </code>
          </pre>
        ) : (
          <Highlight theme={irukaDarkTheme} code={trimmedCode} language={language}>
            {({ className: preClassName, style, tokens, getLineProps, getTokenProps }) => (
              <pre
                className={cn(
                  preClassName,
                  'overflow-x-auto custom-scrollbar text-[13px] leading-relaxed sm:text-sm',
                  showHeader ? 'p-4' : 'p-4 pr-12'
                )}
                style={{ ...style, backgroundColor: 'transparent', margin: 0 }}
              >
                <code className="block min-w-fit">
                  {tokens.map((line, index) => {
                    const lineNumber = index + 1;
                    const isHighlighted = highlightLines.includes(lineNumber);

                    return (
                      <div
                        key={lineNumber}
                        {...getLineProps({ line })}
                        className={cn(
                          'relative',
                          isHighlighted && 'mx-[-0.4rem] rounded-[0.7rem] bg-[color:color-mix(in_oklch,var(--signal-copper)_10%,transparent)] px-[0.4rem]'
                        )}
                      >
                        {showLineNumbers ? (
                          <span
                            className={cn(
                              'mr-4 inline-block text-right text-xs tabular-nums text-[color:var(--ink-muted)] select-none',
                              gutterWidth,
                              isHighlighted && 'text-[color:var(--signal-copper)]'
                            )}
                          >
                            {lineNumber}
                          </span>
                        ) : null}
                        {line.map((token, tokenIndex) => (
                          <span key={tokenIndex} {...getTokenProps({ token })} />
                        ))}
                      </div>
                    );
                  })}
                </code>
              </pre>
            )}
          </Highlight>
        )}
      </div>
    </div>
  );
}
