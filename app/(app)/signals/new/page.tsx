import { SignalBuilderForm } from '@/components/app/SignalBuilderForm';
import { TelegramSetupGuide } from '@/components/app/TelegramSetupGuide';
import { SIGNAL_TEMPLATE_PRESETS, type SignalTemplateId } from '@/lib/signals/templates';

interface NewSignalPageProps {
  searchParams?: Promise<{ preset?: string }> | { preset?: string };
}

export default async function NewSignalPage({ searchParams }: NewSignalPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const presetParam = resolvedSearchParams?.preset;
  const hasPreset = (value: string): value is SignalTemplateId =>
    SIGNAL_TEMPLATE_PRESETS.some((preset) => preset.id === value);
  const initialPreset =
    typeof presetParam === 'string' && hasPreset(presetParam) ? presetParam : undefined;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-secondary mb-2">Create</p>
        <h1 className="font-zen text-3xl sm:text-4xl">New whale signal</h1>
        <p className="text-secondary mt-2 max-w-2xl">
          Start with a Morpho whale movement template, paste the supplier wallets you care about, and let Sentinel register the full JSON definition for you.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-secondary">
          <p>Telegram delivery is optional and lives in its own workspace when you need it.</p>
          <TelegramSetupGuide triggerLabel="How Telegram linking works" />
        </div>
      </div>

      <SignalBuilderForm initialPreset={initialPreset} />
    </div>
  );
}
