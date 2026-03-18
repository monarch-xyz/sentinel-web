'use client';

import { useMemo, useState } from 'react';
import { Highlight } from 'prism-react-renderer';
import { RiCheckLine, RiCodeSSlashLine, RiFileCopyLine, RiFileTextLine, RiTerminalLine } from 'react-icons/ri';
import { cn } from '@/lib/utils';
import { sentinelDarkTheme } from '@/lib/sentinel-theme';

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
  tone = 'dark',
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

  return (
    <div className={cn('relative group rounded-lg overflow-hidden', className)}>
      {!isLight ? (
        <div
          className="absolute -inset-0.5 bg-gradient-to-r from-[#ff6b35]/0 via-[#ff6b35]/10 to-[#ff9f1c]/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm pointer-events-none"
          aria-hidden="true"
        />
      ) : null}

      <div
        className={cn(
          'relative rounded-lg overflow-hidden border transition-colors duration-300',
          isLight
            ? 'bg-background border-border'
            : 'bg-[#0d1117] border-[#30363d] group-hover:border-[#ff6b35]/30'
        )}
      >
        {showHeader ? (
          <div
            className={cn(
              'flex items-center justify-between px-4 py-2.5 border-b',
              isLight ? 'bg-surface border-border' : 'bg-[#161b22] border-[#30363d]'
            )}
          >
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5 mr-3">
                <div className={cn('w-3 h-3 rounded-full', isLight ? 'bg-red-500/50' : 'bg-[#ff5f57]')} />
                <div className={cn('w-3 h-3 rounded-full', isLight ? 'bg-yellow-500/50' : 'bg-[#febc2e]')} />
                <div className={cn('w-3 h-3 rounded-full', isLight ? 'bg-green-500/50' : 'bg-[#28c840]')} />
              </div>

              <div className={cn('flex items-center gap-1.5', isLight ? 'text-secondary' : 'text-[#8b949e]')}>
                <Icon className="w-4 h-4" />
                <span className="text-xs font-mono">{filename || label}</span>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all',
                copied
                  ? isLight
                    ? 'bg-green-500/10 text-green-700'
                    : 'bg-green-500/20 text-green-400'
                  : isLight
                    ? 'bg-background text-secondary hover:bg-hovered hover:text-foreground'
                    : 'bg-[#30363d]/50 text-[#8b949e] hover:bg-[#ff6b35]/20 hover:text-[#ff6b35]'
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
              'overflow-x-auto custom-scrollbar text-[13px] sm:text-sm leading-relaxed bg-background',
              showHeader ? 'p-4' : 'p-4'
            )}
          >
            <code className="block min-w-fit text-secondary">
              {lines.map((line, index) => {
                const lineNumber = index + 1;
                const isHighlighted = highlightLines.includes(lineNumber);

                return (
                  <div
                    key={lineNumber}
                    className={cn(
                      'relative whitespace-pre',
                      isHighlighted && 'bg-[#ff6b35]/10 -mx-4 px-4 border-l-2 border-[#ff6b35]'
                    )}
                  >
                    {showLineNumbers ? (
                      <span
                        className={cn(
                          'inline-block text-right mr-4 text-secondary/60 select-none text-xs tabular-nums',
                          gutterWidth,
                          isHighlighted && 'text-[#ff6b35]'
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
          <Highlight theme={sentinelDarkTheme} code={trimmedCode} language={language}>
            {({ className: preClassName, style, tokens, getLineProps, getTokenProps }) => (
              <pre
                className={cn(
                  preClassName,
                  'overflow-x-auto custom-scrollbar text-[13px] sm:text-sm leading-relaxed',
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
                          isHighlighted && 'bg-[#ff6b35]/10 -mx-4 px-4 border-l-2 border-[#ff6b35]'
                        )}
                      >
                        {showLineNumbers ? (
                          <span
                            className={cn(
                              'inline-block text-right mr-4 text-[#484f58] select-none text-xs tabular-nums',
                              gutterWidth,
                              isHighlighted && 'text-[#ff6b35]'
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
