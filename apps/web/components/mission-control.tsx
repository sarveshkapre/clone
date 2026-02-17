"use client";

import { useMemo } from "react";

type Metric = {
  label: string;
  value: string;
  hint: string;
};

export function MissionControl({ status }: { status: { active: boolean; runState: string } }) {
  const metrics = useMemo<Metric[]>(
    () => [
      {
        label: "Runtime",
        value: status.active ? "Active" : "Idle",
        hint: status.runState,
      },
      {
        label: "Launch",
        value: "Manual",
        hint: "`clone start` launches UI/services only",
      },
      {
        label: "Cutover",
        value: "Dark Launch",
        hint: "v2 scaffold enabled by flag",
      },
    ],
    [status.active, status.runState],
  );

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <header className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">Clone</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Mission Control</h1>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          Next.js + worker runtime scaffold is live behind feature flag. Legacy Python control plane remains default.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">{metric.hint}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
