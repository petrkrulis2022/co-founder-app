export default function ProjectLoading() {
  return (
    <div className="flex flex-col h-full animate-pulse">
      <div className="border-b border-border px-6 py-4 flex items-center gap-4 shrink-0">
        <div className="w-10 h-10 rounded-full bg-secondary" />
        <div className="space-y-2">
          <div className="h-5 w-32 bg-secondary rounded" />
          <div className="h-3 w-48 bg-secondary rounded" />
        </div>
      </div>
      <div className="flex flex-1 min-h-0">
        <div className="hidden lg:block w-[400px] border-r border-border p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-secondary rounded-lg" />
          ))}
        </div>
        <div className="flex-1 p-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-secondary rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
