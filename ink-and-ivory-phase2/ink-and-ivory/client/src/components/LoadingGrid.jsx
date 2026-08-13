export default function LoadingGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-ink/10">
          <div className="aspect-[3/4] bg-ink/5" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-3/4 rounded bg-ink/10" />
            <div className="h-3 w-1/2 rounded bg-ink/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
