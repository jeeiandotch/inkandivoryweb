export default function EmptyState({ icon = "❦", title, description }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="mb-3 text-2xl text-taupe/60">{icon}</span>
      <p className="font-display text-lg text-ink/80">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-ink/50">{description}</p>}
    </div>
  );
}
