export default function KPICard({ label, value, sub, trend, color = 'accent' }) {
  const trendColor = trend?.startsWith('+') || trend?.startsWith('▲') ? 'text-green-600' : trend?.startsWith('-') || trend?.startsWith('▼') ? 'text-red-500' : 'text-gray-400';
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
      <div className="flex items-center gap-2 mt-1">
        {sub && <span className="text-xs text-gray-500">{sub}</span>}
        {trend && <span className={`text-xs font-medium ${trendColor}`}>{trend}</span>}
      </div>
    </div>
  );
}
