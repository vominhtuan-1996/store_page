import { useState } from 'react';

interface DataBrowserProps {
  nodeId: string;
  nodeLabel: string;
  data: unknown;
  activeField: string | null;
  onInsert: (ref: string) => void;
}

interface JsonNodeProps {
  value: unknown;
  path: string;
  nodeId: string;
  depth: number;
  onInsert: (ref: string) => void;
  activeField: string | null;
}

function buildRef(nodeId: string, path: string) {
  return `{{${nodeId}${path ? '.' + path : ''}}}`;
}

// Prevent input blur when clicking inside the browser
function noBlur(e: React.MouseEvent) {
  e.preventDefault();
}

function InsertButton({ ref: _ref, label, title, onClick }: { ref?: string; label: string; title: string; onClick: () => void }) {
  return (
    <button
      onMouseDown={noBlur}
      onClick={onClick}
      title={title}
      className="ml-auto hidden shrink-0 rounded bg-primary-500/20 px-1.5 py-0.5 text-[9px] font-bold text-primary-400 group-hover:block hover:bg-primary-500/40"
    >
      {label}
    </button>
  );
}

function JsonNode({ value, path, nodeId, depth, onInsert, activeField }: JsonNodeProps) {
  const [collapsed, setCollapsed] = useState(depth > 1);
  const ref = buildRef(nodeId, path);
  const canInsert = !!activeField;

  if (value === null || value === undefined) {
    return (
      <div className="group flex items-center gap-1 rounded px-1 py-0.5">
        <span className="text-slate-600 italic text-[10px]">null</span>
        {canInsert && <InsertButton label="+ ref" title={ref} onClick={() => onInsert(ref)} />}
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div>
        <div className="group flex items-center gap-1">
          <button onMouseDown={noBlur} onClick={() => setCollapsed(v => !v)}
            className="flex items-center gap-1 rounded px-1 py-0.5 text-[10px] text-slate-500 hover:bg-white/5">
            <svg className={`h-2.5 w-2.5 transition-transform ${collapsed ? '' : 'rotate-90'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <span className="text-slate-400">Array</span>
            <span className="text-slate-600">[{value.length}]</span>
          </button>
          {canInsert && <InsertButton label="+ ref" title={ref} onClick={() => onInsert(ref)} />}
        </div>
        {!collapsed && (
          <div className="ml-3 border-l border-white/5 pl-2">
            {(value as unknown[]).slice(0, 5).map((item, i) => (
              <div key={i}>
                <span className="text-[9px] text-slate-600 font-mono">[{i}]</span>
                <JsonNode value={item} path={`${path}[${i}]`} nodeId={nodeId} depth={depth + 1} onInsert={onInsert} activeField={activeField} />
              </div>
            ))}
            {value.length > 5 && <p className="text-[9px] text-slate-600 px-1">+{value.length - 5} more</p>}
          </div>
        )}
      </div>
    );
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    return (
      <div>
        {entries.length > 1 && (
          <div className="group flex items-center gap-1">
            <button onMouseDown={noBlur} onClick={() => setCollapsed(v => !v)}
              className="flex items-center gap-1 rounded px-1 py-0.5 text-[10px] text-slate-500 hover:bg-white/5">
              <svg className={`h-2.5 w-2.5 transition-transform ${collapsed ? '' : 'rotate-90'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              <span className="text-slate-600">{'{}'} {entries.length} keys</span>
            </button>
            {canInsert && <InsertButton label="+ ref" title={ref} onClick={() => onInsert(ref)} />}
          </div>
        )}
        {!collapsed && (
          <div className={entries.length > 1 ? 'ml-3 border-l border-white/5 pl-2' : ''}>
            {entries.map(([k, v]) => (
              <div key={k} className="group">
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[10px] text-emerald-400 shrink-0">{k}:</span>
                  {(typeof v !== 'object' || v === null) ? (
                    <>
                      <span className={`font-mono text-[10px] truncate max-w-[110px] ${
                        typeof v === 'string' ? 'text-amber-400' :
                        typeof v === 'number' ? 'text-sky-400' :
                        typeof v === 'boolean' ? 'text-violet-400' : 'text-slate-400'
                      }`}>
                        {typeof v === 'string' ? `"${String(v).slice(0, 32)}"` : String(v)}
                      </span>
                      {canInsert && (
                        <InsertButton
                          label="+ insert"
                          title={buildRef(nodeId, path ? `${path}.${k}` : k)}
                          onClick={() => onInsert(buildRef(nodeId, path ? `${path}.${k}` : k))}
                        />
                      )}
                    </>
                  ) : (
                    <JsonNode value={v} path={path ? `${path}.${k}` : k} nodeId={nodeId} depth={depth + 1} onInsert={onInsert} activeField={activeField} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Primitive leaf
  return (
    <div className="group flex items-center gap-1 rounded px-1 py-0.5">
      <span className={`font-mono text-[10px] truncate ${
        typeof value === 'string' ? 'text-amber-400' :
        typeof value === 'number' ? 'text-sky-400' : 'text-violet-400'
      }`}>
        {typeof value === 'string' ? `"${String(value).slice(0, 40)}"` : String(value)}
      </span>
      {canInsert && <InsertButton label="+ insert" title={ref} onClick={() => onInsert(ref)} />}
    </div>
  );
}

export const DataBrowser = ({ nodeId, nodeLabel, data, activeField, onInsert }: DataBrowserProps) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02]" onMouseDown={noBlur}>
      <button
        onMouseDown={noBlur}
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/15">
          <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
          </svg>
        </div>
        <span className="flex-1 truncate text-[11px] font-semibold text-white">{nodeLabel}</span>
        <span className="font-mono text-[9px] text-slate-600">{nodeId.slice(0, 8)}</span>
        <svg className={`h-3 w-3 text-slate-600 transition-transform ${open ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-white/5 px-3 pb-3 pt-2 max-h-52 overflow-y-auto">
          {data === undefined || data === null ? (
            <p className="text-[10px] italic text-slate-600">Chưa có output — chạy workflow trước</p>
          ) : (
            <JsonNode value={data} path="" nodeId={nodeId} depth={0} onInsert={onInsert} activeField={activeField} />
          )}
        </div>
      )}
    </div>
  );
};
