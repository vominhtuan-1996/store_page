import { useMemo } from 'react';

interface DataVisualizerProps {
  data: any;
}

export const DataVisualizer = ({ data }: DataVisualizerProps) => {
  const parsedData = useMemo(() => {
    if (!data) return null;
    
    // Recursive hunter for the most significant list of objects
    const findList = (obj: any, depth = 0): any[] | null => {
      if (depth > 4) return null; // Avoid circular or too deep recursion
      if (Array.isArray(obj)) {
        if (obj.length > 0 && typeof obj[0] === 'object') return obj;
        return null;
      }
      if (typeof obj !== 'object' || obj === null) return null;

      // Check immediate properties (priority order)
      const priorities = ['data', 'items', 'list', 'results', 'records'];
      for (const key of priorities) {
        if (obj[key] && Array.isArray(obj[key])) {
          return obj[key].filter((i: any) => typeof i === 'object');
        }
      }

      // Deep search
      for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          const list = findList(obj[key], depth + 1);
          if (list) return list;
        }
      }
      return null;
    };

    return findList(data);
  }, [data]);

  const renderValue = (key: string, value: any) => {
    const lowerKey = key.toLowerCase();
    const strValue = String(value ?? '—');

    // Status Badges
    if (lowerKey.includes('status') || lowerKey.includes('state') || lowerKey.includes('active')) {
      const isSuccess = ['active', 'success', 'completed', 'active', 'đã duyệt', 'hiệu lực'].some(s => strValue.toLowerCase().includes(s));
      const isWarning = ['pending', 'waiting', 'process', 'chờ', 'đang'].some(s => strValue.toLowerCase().includes(s));
      const style = isSuccess 
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
        : isWarning 
          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
          : 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      
      return (
        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${style}`}>
          {strValue}
        </span>
      );
    }

    // Numeric Indicators (Quantities)
    if (typeof value === 'number' && (lowerKey.includes('quantity') || lowerKey.includes('stock') || lowerKey.includes('inventory') || lowerKey.includes('amount'))) {
      const max = value > 100 ? 1000 : 100;
      const percentage = Math.min((value / max) * 100, 100);
      return (
        <div className="flex items-center gap-3">
          <span className="w-8 font-mono font-medium">{value}</span>
          <div className="h-1 w-16 overflow-hidden rounded-full bg-slate-800">
            <div 
              className="h-full bg-primary-500 transition-all duration-1000" 
              style={{ width: `${percentage}%` }} 
            />
          </div>
        </div>
      );
    }

    // Dates
    if (strValue.match(/^\d{4}[-/]\d{2}[-/]\d{2}/)) {
      return <span className="text-slate-500">{strValue}</span>;
    }

    // Icons
    const icons: Record<string, string> = {
      branch: '🏢',
      user: '👤',
      location: '📍',
      code: '🔑',
      name: '📝',
      cost: '💰',
      price: '🏷️'
    };
    const matchingIcon = Object.entries(icons).find(([k]) => lowerKey.includes(k))?.[1];

    return (
      <div className="flex items-center gap-2">
        {matchingIcon && <span className="opacity-50 text-[10px]">{matchingIcon}</span>}
        <span className="truncate max-w-[200px]">{strValue}</span>
      </div>
    );
  };

  if (!parsedData || parsedData.length === 0) {
    return (
      <div className="rounded-2xl bg-black/40 p-5 border border-white/5 shadow-2xl">
        <p className="mb-4 text-[10px] uppercase tracking-widest text-slate-500 font-semibold opacity-50">Raw API Response</p>
        <pre className="font-mono text-[11px] leading-relaxed text-slate-300 overflow-auto max-h-80 custom-scrollbar">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  }

  const headers = Object.keys(parsedData[0]).filter(key => 
    typeof parsedData[0][key] !== 'object' || parsedData[0][key] === null
  ).slice(0, 8);

  return (
    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-black/50 shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-[11px] leading-relaxed">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.03]">
                {headers.map(header => (
                  <th key={header} className="px-5 py-4 font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                    {header.replace(/([A-Z])/g, ' $1').trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {parsedData.map((item: any, i: number) => (
                <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                  {headers.map(header => (
                    <td key={header} className="px-5 py-4 text-slate-300 group-hover:text-white transition-colors">
                      {renderValue(header, item[header])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-[10px] text-slate-500 font-medium">Automatic Column Discovery Active</p>
        </div>
        <p className="text-[10px] text-slate-600 italic">
          Mapped {parsedData.length} records into dashboard view
        </p>
      </div>
    </div>
  );
};
