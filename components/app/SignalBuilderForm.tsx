'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiAlarmWarningLine, RiExchangeDollarLine, RiUserSearchLine } from 'react-icons/ri';
import { SignalPresetCard } from '@/components/app/SignalPresetCard';
import { Button } from '@/components/ui/Button';
import {
  SIGNAL_TEMPLATE_PRESETS,
  buildWhaleMovementTemplate,
  describeSignalDefinition,
  parseWhaleAddresses,
  type SignalTemplateId,
} from '@/lib/signals/templates';

interface BuilderFormState {
  name: string;
  description: string;
  marketId: string;
  whaleAddresses: string;
  chainId: string;
  requiredCount: string;
  dropPercent: string;
  windowDuration: string;
  cooldownMinutes: string;
}

interface SignalBuilderFormProps {
  initialPreset?: SignalTemplateId;
}

const presetIcons: Record<SignalTemplateId, ReactNode> = {
  'whale-exit-trio': <RiAlarmWarningLine className="w-5 h-5" />,
  'whale-exit-pair': <RiExchangeDollarLine className="w-5 h-5" />,
  'single-whale-exit': <RiUserSearchLine className="w-5 h-5" />,
};

const buildDefaultState = (templateId: SignalTemplateId): BuilderFormState => {
  const preset = SIGNAL_TEMPLATE_PRESETS.find((item) => item.id === templateId) ?? SIGNAL_TEMPLATE_PRESETS[0];

  return {
    name: '',
    description: '',
    marketId: '',
    whaleAddresses: '',
    chainId: String(preset.defaults.chainId),
    requiredCount: String(preset.defaults.requiredCount),
    dropPercent: String(preset.defaults.dropPercent),
    windowDuration: preset.defaults.windowDuration,
    cooldownMinutes: String(preset.defaults.cooldownMinutes),
  };
};

export function SignalBuilderForm({ initialPreset = 'whale-exit-trio' }: SignalBuilderFormProps) {
  const router = useRouter();
  const [selectedPreset, setSelectedPreset] = useState<SignalTemplateId>(initialPreset);
  const [formState, setFormState] = useState<BuilderFormState>(() => buildDefaultState(initialPreset));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormState(buildDefaultState(selectedPreset));
    setError(null);
  }, [selectedPreset]);

  const updateField = (field: keyof BuilderFormState, value: string) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const previewInput = {
    templateId: selectedPreset,
    marketId: formState.marketId,
    whaleAddresses: formState.whaleAddresses,
    chainId: Number(formState.chainId),
    requiredCount: Number(formState.requiredCount),
    dropPercent: Number(formState.dropPercent),
    windowDuration: formState.windowDuration,
    cooldownMinutes: Number(formState.cooldownMinutes),
    name: formState.name,
    description: formState.description,
  } as const;

  let previewError: string | null = null;
  let previewDefinition: string | null = null;
  let parsedAddressCount = 0;

  try {
    parsedAddressCount = parseWhaleAddresses(formState.whaleAddresses).length;
    const preview = buildWhaleMovementTemplate(previewInput);
    previewDefinition = JSON.stringify(
      {
        name: preview.name,
        description: preview.description,
        definition: preview.definition,
        cooldown_minutes: preview.cooldown_minutes,
      },
      null,
      2
    );
  } catch (previewBuildError) {
    previewError = previewBuildError instanceof Error ? previewBuildError.message : 'Unable to build template preview.';
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/signals/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(previewInput),
      });

      const payload = (await response.json().catch(() => null)) as
        | { id?: string; details?: string; payload?: { error?: string; field?: string } }
        | null;

      if (!response.ok || !payload?.id) {
        throw new Error(payload?.details ?? payload?.payload?.error ?? 'Unable to create signal.');
      }

      router.push(`/signals/${payload.id}`);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create signal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border bg-surface p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-secondary mb-2">Template</p>
        <div className="flex flex-wrap gap-2">
          {SIGNAL_TEMPLATE_PRESETS.map((option) => (
            <button
              key={option.id}
              className={`rounded-sm border px-3 py-2 text-sm transition-colors ${
                selectedPreset === option.id
                  ? 'border-[#1f2328] bg-[#1f2328]/4 text-foreground'
                  : 'border-border text-secondary hover:text-foreground hover:bg-hovered'
              }`}
              onClick={() => setSelectedPreset(option.id)}
              type="button"
            >
              {option.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-6">
        <SignalPresetCard
          title={SIGNAL_TEMPLATE_PRESETS.find((preset) => preset.id === selectedPreset)?.title ?? 'Whale Exit Trio'}
          description={SIGNAL_TEMPLATE_PRESETS.find((preset) => preset.id === selectedPreset)?.description ?? ''}
          icon={presetIcons[selectedPreset]}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-2 text-sm text-secondary">
              Signal name
              <input
                type="text"
                value={formState.name}
                onChange={(event) => updateField('name', event.target.value)}
                placeholder="Optional custom name"
                className="rounded-sm border border-border bg-transparent px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-secondary">
              Morpho market ID
              <input
                type="text"
                value={formState.marketId}
                onChange={(event) => updateField('marketId', event.target.value)}
                placeholder="0xb8fc70e82bc5..."
                className="rounded-sm border border-border bg-transparent px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-secondary">
              Chain ID
              <input
                type="number"
                min="1"
                value={formState.chainId}
                onChange={(event) => updateField('chainId', event.target.value)}
                className="rounded-sm border border-border bg-transparent px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-secondary">
              Wallets required
              <input
                type="number"
                min="1"
                value={formState.requiredCount}
                onChange={(event) => updateField('requiredCount', event.target.value)}
                className="rounded-sm border border-border bg-transparent px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-secondary">
              Supply drop (%)
              <input
                type="number"
                min="1"
                value={formState.dropPercent}
                onChange={(event) => updateField('dropPercent', event.target.value)}
                className="rounded-sm border border-border bg-transparent px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-secondary">
              Window
              <input
                type="text"
                value={formState.windowDuration}
                onChange={(event) => updateField('windowDuration', event.target.value)}
                placeholder="7d"
                className="rounded-sm border border-border bg-transparent px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-secondary">
              Cooldown (minutes)
              <input
                type="number"
                min="0"
                value={formState.cooldownMinutes}
                onChange={(event) => updateField('cooldownMinutes', event.target.value)}
                className="rounded-sm border border-border bg-transparent px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-secondary sm:col-span-2">
              Description
              <input
                type="text"
                value={formState.description}
                onChange={(event) => updateField('description', event.target.value)}
                placeholder="Optional description shown in Sentinel"
                className="rounded-sm border border-border bg-transparent px-3 py-2 text-sm text-foreground"
              />
            </label>
          </div>

          <label className="mt-4 flex flex-col gap-2 text-sm text-secondary">
            Wallet addresses
            <textarea
              value={formState.whaleAddresses}
              onChange={(event) => updateField('whaleAddresses', event.target.value)}
              placeholder={`0x1111111111111111111111111111111111111111\n0x2222222222222222222222222222222222222222\n0x3333333333333333333333333333333333333333`}
              rows={7}
              className="rounded-sm border border-border bg-transparent px-3 py-2 text-sm text-foreground font-mono"
            />
            <span className="text-xs text-secondary">
              One address per line or comma-separated. For the main preset, use the major suppliers you care about.
            </span>
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button onClick={handleSubmit} disabled={isSubmitting || Boolean(previewError)}>
              {isSubmitting ? 'Creating signal...' : 'Create signal from template'}
            </Button>
            <Button variant="secondary" type="button" onClick={() => setFormState(buildDefaultState(selectedPreset))}>
              Reset fields
            </Button>
          </div>
        </SignalPresetCard>

        <div className="rounded-md border border-border bg-surface p-6 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-secondary mb-2">Preview</p>
            <h3 className="font-zen text-xl">Morpho whale movement signal</h3>
            <p className="text-sm text-secondary mt-2">
              Enter a market plus the supplier wallets you want to watch. This UI creates a Sentinel group-change signal behind the scenes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-sm border border-border/80 bg-background/50 p-3">
              <p className="text-xs uppercase tracking-[0.25em] text-secondary">Tracked wallets</p>
              <p className="font-zen text-2xl mt-2">{parsedAddressCount}</p>
            </div>
            <div className="rounded-sm border border-border/80 bg-background/50 p-3">
              <p className="text-xs uppercase tracking-[0.25em] text-secondary">Required movers</p>
              <p className="font-zen text-2xl mt-2">{formState.requiredCount || '0'}</p>
            </div>
            <div className="rounded-sm border border-border/80 bg-background/50 p-3">
              <p className="text-xs uppercase tracking-[0.25em] text-secondary">Window</p>
              <p className="font-zen text-2xl mt-2">{formState.windowDuration || '—'}</p>
            </div>
          </div>

          {!previewError && previewDefinition ? (
            <>
              <div className="rounded-sm border border-border/80 bg-background/50 p-4">
                <p className="text-sm text-secondary">
                  {describeSignalDefinition(buildWhaleMovementTemplate(previewInput).definition)}
                </p>
              </div>
              <pre className="overflow-x-auto rounded-md bg-[#0d1117] p-4 text-xs leading-relaxed text-[#e6edf3]">
                {previewDefinition}
              </pre>
            </>
          ) : (
            <div className="rounded-sm border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400">
              {previewError ?? 'Fill in the form to generate a template preview.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
