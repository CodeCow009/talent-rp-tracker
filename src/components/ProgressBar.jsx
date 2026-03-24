export default function ProgressBar({ value, max = 100, size = 'md', showLabel = true }) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  const color = pct >= 85 ? 'bg-green-500' : pct >= 70 ? 'bg-amber-400' : 'bg-red-500';
  const h = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className="flex items-center gap-2 w-full">
      <div className={`flex-1 ${h} bg-gray-100 rounded-full overflow-hidden`}>
        <div className={`${h} ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <span className="text-xs font-semibold text-gray-600 w-10 text-right">{pct}%</span>}
    </div>
  );
}
