export default function DashboardLoading() {
  return (
    <div className="flex-1 overflow-auto p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-6 w-32 bg-slate-200 rounded mb-1.5" />
          <div className="h-4 w-20 bg-slate-100 rounded" />
        </div>
        <div className="h-9 w-28 bg-slate-200 rounded-md" />
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="h-9 flex-1 bg-slate-100 rounded-md" />
        <div className="h-9 w-full sm:w-44 bg-slate-100 rounded-md" />
        <div className="h-9 w-full sm:w-44 bg-slate-100 rounded-md" />
        <div className="h-9 w-full sm:w-44 bg-slate-100 rounded-md" />
      </div>
      <div className="grid gap-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-[68px] bg-white rounded-lg border border-[#E2E8F0]"
            style={{ opacity: 1 - i * 0.12 }}
          />
        ))}
      </div>
    </div>
  );
}
