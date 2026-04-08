import { useMemo, useState, useCallback } from 'react';

interface DataVisualizerProps {
  data: any;
}

// Vietnamese status labels → color scheme mapping
const STATUS_MAP: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  'đã duyệt': 'success',
  'đã xác nhận': 'success',
  'hiệu lực': 'success',
  'active': 'success',
  'completed': 'success',
  'confirmed': 'success',
  'chờ duyệt': 'warning',
  'đang xử lý': 'warning',
  'pending': 'warning',
  'waiting': 'warning',
  'processing': 'warning',
  'chờ xác nhận': 'warning',
  'bị từ chối': 'error',
  'hủy': 'error',
  'expired': 'error',
  'cancelled': 'error',
  'từ chối': 'error',
  'nháp': 'info',
  'draft': 'info',
  'new': 'info',
  'mới': 'info',
};

const STATUS_STYLES: Record<string, string> = {
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 ring-emerald-500/10',
  warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30 ring-amber-500/10',
  error: 'bg-rose-500/15 text-rose-300 border-rose-500/30 ring-rose-500/10',
  info: 'bg-sky-500/15 text-sky-300 border-sky-500/30 ring-sky-500/10',
  neutral: 'bg-slate-500/15 text-slate-400 border-slate-500/30 ring-slate-500/10',
};

const STATUS_DOTS: Record<string, string> = {
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  error: 'bg-rose-400',
  info: 'bg-sky-400',
  neutral: 'bg-slate-500',
};

// Key → icon mapping
const KEY_ICONS: Array<[string[], string]> = [
  [['phone', 'tel', 'mobile', 'sdt', 'contact'], '📞'],
  [['email', 'mail'], '✉️'],
  [['date', 'ngay', 'from', 'to', 'expire'], '📅'],
  [['address', 'location', 'street', 'ward', 'district', 'duong', 'pho', 'dia'], '📍'],
  [['branch', 'chi', 'nhanh', 'unit'], '🏢'],
  [['name', 'ten', 'person', 'nguoi'], '👤'],
  [['code', 'ma', 'id', 'key'], '🔑'],
  [['cost', 'price', 'fee', 'amount', 'money', 'tien', 'gia'], '💰'],
  [['note', 'ghi', 'desc', 'motas', 'detail'], '📝'],
  [['quantity', 'qty', 'so', 'luong', 'count', 'stock'], '📦'],
];

function getIcon(key: string): string | null {
  const lower = key.toLowerCase();
  for (const [keywords, icon] of KEY_ICONS) {
    if (keywords.some(k => lower.includes(k))) return icon;
  }
  return null;
}

function getStatusType(value: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  const lower = value.toLowerCase();
  for (const [label, type] of Object.entries(STATUS_MAP)) {
    if (lower.includes(label)) return type;
  }
  return 'neutral';
}

function exportToCsv(headers: string[], rows: any[], filename = 'export.csv') {
  const escape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(','), ...rows.map(row => headers.map(h => escape(row[h])).join(','))];
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Cell Renderer ────────────────────────────────────────────────────────────
function CellValue({ colKey, value }: { colKey: string; value: any }) {
  const lowerKey = colKey.toLowerCase();
  const strValue = String(value ?? '—');

  // Null / empty
  if (value === null || value === undefined || strValue === '' || strValue === '—') {
    return <span className="text-slate-600 italic text-[10px]">—</span>;
  }

  // Status badge
  if (lowerKey.includes('status') || lowerKey.includes('state') || lowerKey.includes('trang') || lowerKey.includes('trangthai')) {
    const type = getStatusType(strValue);
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ring-1 ${STATUS_STYLES[type]}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOTS[type]}`} />
        {strValue}
      </span>
    );
  }

  // Date
  if (typeof value === 'string' && /^\d{4}[-/]\d{2}/.test(strValue)) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800/60 px-2 py-1 font-mono text-[10px] text-slate-400">
        <svg className="h-3 w-3 shrink-0 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
        </svg>
        {strValue}
      </span>
    );
  }

  // Numeric with progress bar
  if (typeof value === 'number' && (lowerKey.includes('quantity') || lowerKey.includes('qty') || lowerKey.includes('count') || lowerKey.includes('luong') || lowerKey.includes('stock'))) {
    const max = value > 1000 ? 10000 : value > 100 ? 1000 : 100;
    const pct = Math.min((value / max) * 100, 100);
    return (
      <div className="flex items-center gap-3">
        <span className="w-10 font-mono text-[11px] font-semibold text-slate-200 tabular-nums">{value.toLocaleString()}</span>
        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-violet transition-all duration-1000" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  // Generic number
  if (typeof value === 'number') {
    return <span className="font-mono text-[11px] text-slate-300 tabular-nums">{value.toLocaleString()}</span>;
  }

  // With icon
  const icon = getIcon(colKey);
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      {icon && <span className="shrink-0 text-[11px] opacity-60">{icon}</span>}
      <span className="truncate text-slate-300 max-w-[200px]" title={strValue}>{strValue}</span>
    </div>
  );
}

// ─── Summary stat chip ────────────────────────────────────────────────────────
function StatChip({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2.5 backdrop-blur">
      <span className={`text-base font-bold tabular-nums ${accent ?? 'text-white'}`}>{value}</span>
      <span className="text-[9px] uppercase tracking-widest text-slate-500">{label}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const DataVisualizer = ({ data }: DataVisualizerProps) => {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const parsedData = useMemo(() => {
    if (!data) return null;

    const findList = (obj: any, depth = 0): any[] | null => {
      if (depth > 5) return null;
      if (Array.isArray(obj)) {
        if (obj.length > 0 && typeof obj[0] === 'object') return obj;
        return null;
      }
      if (typeof obj !== 'object' || obj === null) return null;

      // Priority keys
      const priorities = ['data', 'items', 'list', 'results', 'records', 'content'];
      for (const key of priorities) {
        if (obj[key] && Array.isArray(obj[key]) && obj[key].length > 0 && typeof obj[key][0] === 'object') {
          return obj[key];
        }
      }
      // Deep search – prefer largest array found
      let best: any[] | null = null;
      for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          const found = findList(obj[key], depth + 1);
          if (found && (!best || found.length > best.length)) best = found;
        }
      }
      return best;
    };

    return findList(data);
  }, [data]);

  const headers = useMemo(() => {
    if (!parsedData || parsedData.length === 0) return [];
    // Prefer the row with most keys
    const richRow = parsedData.reduce((a, b) => Object.keys(a).length >= Object.keys(b).length ? a : b, parsedData[0]);
    return Object.keys(richRow).filter(k => {
      const v = richRow[k];
      return v === null || typeof v !== 'object' || Array.isArray(v) === false;
    }).slice(0, 10);
  }, [parsedData]);

  const filtered = useMemo(() => {
    if (!parsedData) return [];
    const q = search.toLowerCase();
    return parsedData.filter(row =>
      !q || headers.some(h => String(row[h] ?? '').toLowerCase().includes(q))
    );
  }, [parsedData, search, headers]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const va = a[sortKey] ?? '';
      const vb = b[sortKey] ?? '';
      const cmp = typeof va === 'number' && typeof vb === 'number'
        ? va - vb
        : String(va).localeCompare(String(vb), 'vi');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const handleSort = useCallback((key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }, [sortKey]);

  // ── Fallback: raw JSON ──
  if (!parsedData || parsedData.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-black/40 p-5 shadow-2xl">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Raw Response</p>
        </div>
        <pre className="max-h-72 overflow-auto rounded-xl bg-black/30 p-4 font-mono text-[10px] leading-relaxed text-slate-300 custom-scrollbar">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-500">

      {/* ── Summary Header ── */}
      <div className="flex flex-wrap gap-2">
        <StatChip label="Tổng bản ghi" value={parsedData.length} accent="text-primary-400" />
        <StatChip label="Hiển thị" value={filtered.length} />
        <StatChip label="Cột" value={headers.length} />
        {parsedData.length !== filtered.length && (
          <StatChip label="Lọc bởi" value={`"${search}"`} accent="text-accent-violet" />
        )}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm trong kết quả..."
            className="w-full rounded-xl border border-white/5 bg-black/40 py-2.5 pl-9 pr-4 text-[11px] text-slate-200 placeholder-slate-600 outline-none ring-0 backdrop-blur transition focus:border-primary-500/40 focus:ring-1 focus:ring-primary-500/20"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <button
          onClick={() => exportToCsv(headers, sorted, 'data_export.csv')}
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.04] px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400 transition-all hover:border-primary-500/30 hover:text-primary-300 hover:bg-primary-500/5"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Xuất CSV
        </button>
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-black/50 shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto custom-scrollbar">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <svg className="h-8 w-8 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
              </svg>
              <p className="text-[11px] text-slate-600">Không tìm thấy kết quả cho <span className="font-semibold text-slate-400">"{search}"</span></p>
            </div>
          ) : (
            <table className="w-full text-left text-[11px] leading-relaxed">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.025]">
                  <th className="w-10 px-4 py-3.5 text-center text-slate-600 font-medium">#</th>
                  {headers.map(header => (
                    <th
                      key={header}
                      onClick={() => handleSort(header)}
                      className="group cursor-pointer select-none whitespace-nowrap px-4 py-3.5 font-semibold uppercase tracking-wider text-slate-500 transition-colors hover:text-slate-300"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{header.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="opacity-0 transition-opacity group-hover:opacity-100">
                          {sortKey === header
                            ? sortDir === 'asc'
                              ? <span className="text-primary-400">↑</span>
                              : <span className="text-primary-400">↓</span>
                            : <span className="text-slate-700">↕</span>}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {sorted.map((item: any, i: number) => (
                  <tr key={i} className="group transition-colors hover:bg-white/[0.025]">
                    <td className="px-4 py-3.5 text-center font-mono text-[10px] text-slate-600">{i + 1}</td>
                    {headers.map(header => (
                      <td key={header} className="px-4 py-3.5 transition-colors group-hover:text-white">
                        <CellValue colKey={header} value={item[header]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-[10px] text-slate-500">Smart Column Discovery · {headers.length} cột phát hiện tự động</p>
        </div>
        {sortKey && (
          <button onClick={() => setSortKey(null)} className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors underline underline-offset-2">
            Xóa bộ lọc sắp xếp
          </button>
        )}
      </div>
    </div>
  );
};
