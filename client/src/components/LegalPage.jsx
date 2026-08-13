export default function LegalPage({ title, updated, children }) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-14 sm:px-8">
      <h1 className="font-display text-2xl text-ink">{title}</h1>
      {updated && <p className="mt-1 text-xs text-ink/40">Last updated {updated}</p>}
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink/70">{children}</div>
    </div>
  );
}
