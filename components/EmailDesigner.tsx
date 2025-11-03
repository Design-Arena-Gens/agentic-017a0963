'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import clsx from 'classnames';

type ScenarioDefaults = {
  badge: string;
  headline: string;
  subheadline: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  signature: string;
  accent: string;
};

type Scenario = {
  id: string;
  label: string;
  description: string;
  defaults: ScenarioDefaults;
};

const SCENARIOS: Scenario[] = [
  {
    id: 'notice',
    label: 'Notice',
    description:
      'Formal notice template for policy updates, maintenance windows, and structured announcements.',
    defaults: {
      badge: 'Official Notice',
      headline: 'Policy Update Goes Into Effect April 12',
      subheadline: 'Transparent changes for your organization',
      body: `We are updating the retention policy for archived accounts to improve compliance visibility. The new policy takes effect on April 12, providing a dedicated review window and a clearer escalation timeline.`,
      ctaLabel: 'Review Policy Brief',
      ctaUrl: 'https://example.com/policy',
      signature: 'Regulatory Affairs · Northwind Organization',
      accent: '#2D74FF'
    }
  },
  {
    id: 'update',
    label: 'Product Update',
    description:
      'Showcase roadmap milestones, release updates, and feature announcements with clarity.',
    defaults: {
      badge: 'Product Update',
      headline: 'Realtime Dashboards Receive a Performance Boost',
      subheadline: 'Faster insights for global teams',
      body: `Your dashboards now refresh 43% faster thanks to our new rendering engine. Gain real-time clarity across every region, with no workflow changes required.`,
      ctaLabel: 'Explore What’s New',
      ctaUrl: 'https://example.com/updates',
      signature: 'Product Experience Team · Aurora Cloud',
      accent: '#38BDF8'
    }
  },
  {
    id: 'suspension',
    label: 'Account Suspension',
    description:
      'Deliver difficult compliance or suspension messaging with a precise, trustworthy visual tone.',
    defaults: {
      badge: 'Compliance Update',
      headline: 'Account Access Suspended Pending Review',
      subheadline: 'Action required to restore access',
      body: `We detected activity that conflicts with our Acceptable Use Policy. Access will remain paused while our trust & safety team reviews the case. Share the requested documents to accelerate reinstatement.`,
      ctaLabel: 'Provide Documentation',
      ctaUrl: 'https://example.com/review',
      signature: 'Trust & Safety · Sentinel Platform',
      accent: '#F97316'
    }
  },
  {
    id: 'congrats',
    label: 'Congratulations',
    description:
      'Celebrate wins, milestones, and recognition moments with premium visual polish.',
    defaults: {
      badge: 'Congratulations',
      headline: 'You Earned Elite Partner Status in Q1',
      subheadline: 'Recognition for consistent excellence',
      body: `Your team surpassed every benchmark for customer satisfaction, security posture, and delivery velocity. We’re excited to celebrate this milestone and unlock a new tier of benefits for your organization.`,
      ctaLabel: 'View Partner Benefits',
      ctaUrl: 'https://example.com/perks',
      signature: 'Partner Success · Vertex Alliance',
      accent: '#A855F7'
    }
  },
  {
    id: 'thankyou',
    label: 'Thank You',
    description:
      'Deliver gratitude with premium storytelling visuals that reinforce brand trust.',
    defaults: {
      badge: 'Thank You',
      headline: 'Thank You for Joining the Advisory Council',
      subheadline: 'Your insight shapes what we build next',
      body: `We appreciate the time you invest helping us refine our products. Expect tailored briefings, early previews, and executive sessions as we continue to collaborate.`,
      ctaLabel: 'Access Council Portal',
      ctaUrl: 'https://example.com/council',
      signature: 'Executive Programs · Horizon Labs',
      accent: '#22D3EE'
    }
  }
];

const ACCENT_PALETTE = [
  '#2D74FF',
  '#38BDF8',
  '#22D3EE',
  '#F97316',
  '#A855F7',
  '#10B981',
  '#F43F5E',
  '#FACC15'
];

const BACKGROUND_STYLES = [
  {
    id: 'gradient-soft',
    label: 'Signature Gradient',
    description: 'Polished gradient blending deep navy with luminous cyan arcs.',
    gradient:
      'linear-gradient(140deg, rgba(35,54,102,0.95) 0%, rgba(17,37,84,0.98) 45%, rgba(5,17,39,1) 100%)',
    overlay:
      'radial-gradient(120% 140% at 80% 0%, rgba(125,211,252,0.28) 0%, rgba(15,23,42,0) 70%)'
  },
  {
    id: 'gradient-vibrant',
    label: 'Vibrant Energy',
    description: 'High-energy blend for celebratory or momentum-driven narratives.',
    gradient:
      'linear-gradient(135deg, rgba(76,29,149,0.96) 0%, rgba(59,130,246,0.92) 45%, rgba(14,165,233,0.96) 100%)',
    overlay:
      'radial-gradient(120% 160% at 0% 100%, rgba(250,204,21,0.25) 0%, rgba(15,23,42,0) 60%)'
  },
  {
    id: 'gradient-carbon',
    label: 'Carbon Fiber',
    description: 'Precision aesthetic with carbon texture and subtle depth.',
    gradient:
      'linear-gradient(145deg, rgba(15,23,42,0.98) 0%, rgba(15,23,42,0.98) 50%, rgba(8,15,28,1) 100%)',
    overlay:
      'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 6px)'
  },
  {
    id: 'minimal-satin',
    label: 'Minimal Satin',
    description: 'Soft satin sheen with minimal gradients for governance messaging.',
    gradient:
      'linear-gradient(135deg, rgba(30,41,59,1) 0%, rgba(15,23,42,1) 60%, rgba(8,12,23,1) 100%)',
    overlay:
      'radial-gradient(100% 100% at 50% 0%, rgba(148,163,184,0.12) 0%, rgba(15,23,42,0) 65%)'
  }
];

const downloadFile = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
};

type FormState = ScenarioDefaults & {
  includeCta: boolean;
  footerNote: string;
};

const DEFAULT_FOOTER_NOTE =
  'This visual is optimized for high-resolution displays. Export at full size for best results.';

export function EmailDesigner() {
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);
  const scenario = useMemo(
    () => SCENARIOS.find((item) => item.id === scenarioId) ?? SCENARIOS[0],
    [scenarioId]
  );

  const [form, setForm] = useState<FormState>({
    ...scenario.defaults,
    includeCta: true,
    footerNote: DEFAULT_FOOTER_NOTE
  });

  useEffect(() => {
    setForm({
      ...scenario.defaults,
      includeCta: true,
      footerNote: DEFAULT_FOOTER_NOTE
    });
  }, [scenario]);

  const [backgroundStyle, setBackgroundStyle] = useState<string>(
    BACKGROUND_STYLES[0].id
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const background = useMemo(
    () => BACKGROUND_STYLES.find((item) => item.id === backgroundStyle),
    [backgroundStyle]
  );

  const handleDownload = useCallback(async () => {
    if (!previewRef.current) return;
    try {
      setIsDownloading(true);
      const dataUrl = await toPng(previewRef.current, {
        cacheBust: true,
        pixelRatio: 2
      });
      downloadFile(
        dataUrl,
        `${scenario.label.toLowerCase().replace(/\s+/g, '-')}-email-card.png`
      );
    } catch (error) {
      console.error('Failed to export image:', error);
    } finally {
      setIsDownloading(false);
    }
  }, [scenario.label]);

  return (
    <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-6 pb-24 pt-8 lg:flex-row lg:gap-12 lg:pt-16">
      <div className="absolute inset-0 scrim opacity-60" aria-hidden="true" />
      <aside className="relative z-10 w-full max-w-xl rounded-3xl border border-slate-800/60 bg-slate-950/70 p-6 shadow-[0_20px_80px_-40px_rgba(14,20,35,0.8)] backdrop-blur xl:max-w-sm">
        <div className="space-y-5">
          <header>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Campaign Studio
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-white">
              Realistic Email Visuals
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Curate premium announcement artwork for notices, updates,
              suspensions, congratulations, and gratitude messages.
            </p>
          </header>

          <section className="space-y-3">
            <h2 className="text-sm font-medium text-slate-300">
              Message Intent
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {SCENARIOS.map((item) => {
                const isActive = scenario.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setScenarioId(item.id)}
                    className={clsx(
                      'rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 text-left transition hover:border-slate-700 hover:bg-slate-900',
                      isActive && 'border-slate-500/80 bg-slate-900'
                    )}
                  >
                    <span className="text-sm font-semibold text-slate-100">
                      {item.label}
                    </span>
                    <p className="mt-1 text-xs text-slate-400">
                      {item.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-medium text-slate-300">
              Copy & Signature
            </h2>
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-wide text-slate-400">
                Badge
              </span>
              <input
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600"
                value={form.badge}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, badge: event.target.value }))
                }
              />
            </label>
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-wide text-slate-400">
                Headline
              </span>
              <input
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600"
                value={form.headline}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, headline: event.target.value }))
                }
              />
            </label>
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-wide text-slate-400">
                Subheadline
              </span>
              <input
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600"
                value={form.subheadline}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    subheadline: event.target.value
                  }))
                }
              />
            </label>
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-wide text-slate-400">
                Narrative
              </span>
              <textarea
                className="h-32 w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm leading-relaxed text-slate-100 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600"
                value={form.body}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, body: event.target.value }))
                }
              />
            </label>
            <div className="flex items-center justify-between space-x-3 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
              <span className="text-xs uppercase tracking-wide text-slate-400">
                Call To Action
              </span>
              <label className="inline-flex items-center space-x-2">
                <span className="text-xs text-slate-400">Off</span>
                <input
                  type="checkbox"
                  checked={form.includeCta}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      includeCta: event.target.checked
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-slate-500 focus:ring-0"
                />
                <span className="text-xs text-slate-200">On</span>
              </label>
            </div>
            {form.includeCta && (
              <>
                <label className="block space-y-2">
                  <span className="text-xs uppercase tracking-wide text-slate-400">
                    CTA Label
                  </span>
                  <input
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600"
                    value={form.ctaLabel}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        ctaLabel: event.target.value
                      }))
                    }
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-xs uppercase tracking-wide text-slate-400">
                    CTA URL
                  </span>
                  <input
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600"
                    value={form.ctaUrl}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        ctaUrl: event.target.value
                      }))
                    }
                  />
                </label>
              </>
            )}
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-wide text-slate-400">
                Signature
              </span>
              <input
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600"
                value={form.signature}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    signature: event.target.value
                  }))
                }
              />
            </label>
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-wide text-slate-400">
                Footer Note
              </span>
              <input
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-slate-100 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600"
                value={form.footerNote}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    footerNote: event.target.value
                  }))
                }
              />
            </label>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-medium text-slate-300">
              Visual Styling
            </h2>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Accent
              </p>
              <div className="grid grid-cols-8 gap-2">
                {ACCENT_PALETTE.map((color) => {
                  const isActive = form.accent === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          accent: color
                        }))
                      }
                      className={clsx(
                        'aspect-square rounded-full border-2 transition',
                        isActive
                          ? 'border-white shadow-[0_0_0_3px_rgba(255,255,255,0.3)]'
                          : 'border-transparent'
                      )}
                      style={{ backgroundColor: color }}
                      aria-label={`Select accent ${color}`}
                    />
                  );
                })}
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Background
              </p>
              <div className="space-y-2">
                {BACKGROUND_STYLES.map((style) => {
                  const isActive = background?.id === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setBackgroundStyle(style.id)}
                      className={clsx(
                        'w-full rounded-2xl border border-slate-800/80 bg-slate-900/60 px-4 py-3 text-left transition hover:border-slate-700 hover:bg-slate-900',
                        isActive && 'border-slate-500/80 bg-slate-900'
                      )}
                    >
                      <span className="text-sm font-medium text-slate-100">
                        {style.label}
                      </span>
                      <p className="mt-1 text-xs text-slate-400">
                        {style.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </aside>

      <main className="relative z-10 flex-1">
        <div className="sticky top-10 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Real-time Preview
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-100">
                Export-ready Artwork
              </h2>
            </div>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 rounded-full border border-slate-500 bg-slate-900/80 px-5 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-300 hover:bg-slate-900 disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500"
            >
              {isDownloading ? (
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-ping rounded-full bg-slate-300" />
                  Exporting…
                </span>
              ) : (
                <>
                  <span className="text-lg leading-none">⬇️</span>
                  Download PNG
                </>
              )}
            </button>
          </div>

          <div className="rounded-[40px] border border-white/10 bg-slate-900/30 p-[1px] shadow-[0_25px_80px_rgba(8,14,35,0.65)] backdrop-blur">
            <div
              ref={previewRef}
              style={{
                background: background?.gradient,
                position: 'relative'
              }}
              className="relative overflow-hidden rounded-[38px] p-10"
            >
              <div
                className="absolute inset-0"
                style={{
                  background: background?.overlay,
                  mixBlendMode: 'screen',
                  opacity: 0.9
                }}
              />
              <div className="relative flex min-h-[520px] flex-col justify-between rounded-[28px] border border-white/8 bg-white/6 p-10 shadow-ambient">
                <header className="space-y-5">
                  <span
                    className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]"
                    style={{ color: form.accent }}
                  >
                    {form.badge}
                  </span>

                  <div className="space-y-3 text-white">
                    <h3 className="text-3xl font-semibold leading-tight">
                      {form.headline}
                    </h3>
                    <p className="text-base font-medium text-white/80">
                      {form.subheadline}
                    </p>
                    <p className="max-w-2xl text-sm leading-relaxed text-white/70">
                      {form.body}
                    </p>
                  </div>
                </header>

                <footer className="space-y-6">
                  {form.includeCta && (
                    <a
                      href={form.ctaUrl || '#'}
                      className="inline-flex w-auto items-center gap-2 rounded-full border border-white/20 bg-white/15 px-6 py-2 text-sm font-semibold text-white transition"
                      style={{ boxShadow: `0 10px 40px -15px ${form.accent}` }}
                    >
                      <span
                        className="inline-flex h-6 w-6 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: form.accent,
                          color: '#0B1220'
                        }}
                      >
                        →
                      </span>
                      {form.ctaLabel}
                    </a>
                  )}

                  <div className="flex flex-wrap items-end justify-between gap-4 text-sm text-white/60">
                    <span className="font-medium text-white/80">
                      {form.signature}
                    </span>
                    <span className="text-xs uppercase tracking-[0.3em] text-white/30">
                      {form.footerNote}
                    </span>
                  </div>
                </footer>

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-60"
                  style={{
                    background: `radial-gradient(circle at center, ${form.accent}, transparent 65%)`,
                    filter: 'blur(20px)'
                  }}
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full opacity-50"
                  style={{
                    background: `radial-gradient(circle at center, ${form.accent}, transparent 70%)`,
                    filter: 'blur(30px)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
