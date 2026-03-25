import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchAll } from '../data';

const TYPE_STYLES = {
  meeting: { bg: 'bg-purple-50', text: 'text-purple-600', label: 'Meeting' },
  action: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Action Item' },
  narrative: { bg: 'bg-green-50', text: 'text-green-600', label: 'Update' },
  leader: { bg: 'bg-accent/10', text: 'text-accent', label: 'Leader' },
  objective: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Objective' },
  campaign: { bg: 'bg-indigo-50', text: 'text-indigo-600', label: 'Campaign' },
  intersection: { bg: 'bg-red-50', text: 'text-red-600', label: 'Intersection' },
};

export default function SearchResults() {
  const [params] = useSearchParams();
  const query = params.get('q') || '';
  const [typeFilter, setTypeFilter] = useState('all');

  const results = searchAll(query);
  const filtered = typeFilter === 'all' ? results : results.filter(r => r.type === typeFilter);

  const typeCounts = {};
  results.forEach(r => { typeCounts[r.type] = (typeCounts[r.type] || 0) + 1; });

  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Search Results</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {results.length} results for "<span className="text-gray-700 font-medium">{query}</span>"
        </p>
      </div>

      {/* Type filter pills */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setTypeFilter('all')}
          className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${typeFilter === 'all' ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          All ({results.length})
        </button>
        {Object.entries(typeCounts).map(([type, count]) => {
          const style = TYPE_STYLES[type] || {};
          return (
            <button key={type} onClick={() => setTypeFilter(type)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${typeFilter === type ? 'bg-accent text-white' : `${style.bg} ${style.text} hover:opacity-80`}`}>
              {style.label || type} ({count})
            </button>
          );
        })}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="text-gray-400 text-sm">No results found for "{query}"</div>
          <div className="text-gray-300 text-xs mt-1">Try a different search term</div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r, i) => {
            const style = TYPE_STYLES[r.type] || { bg: 'bg-gray-50', text: 'text-gray-600', label: r.type };
            return (
              <Link key={`${r.type}-${r.id}-${i}`} to={r.to}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm hover:border-gray-300 transition-all">
                <div className="flex items-start gap-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.bg} ${style.text} shrink-0 mt-0.5`}>
                    {style.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 line-clamp-1">{r.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{r.subtitle}</div>
                    {r.match && r.match !== r.title && (
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2 bg-gray-50 rounded px-2 py-1">
                        ...{highlightMatch(r.match, query)}...
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function highlightMatch(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  const before = text.slice(Math.max(0, idx - 30), idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length, idx + query.length + 50);
  return <>{before}<mark className="bg-yellow-200 font-medium">{match}</mark>{after}</>;
}
