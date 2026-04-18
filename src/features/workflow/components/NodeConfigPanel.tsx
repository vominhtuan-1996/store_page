import { useEffect, useRef, useState } from 'react';
import type { ApiData, FlowNode, FlowEdge } from '../types';
import type { ApiDefinition } from '../../../types/api';
import { DataBrowser } from './DataBrowser';

interface NodeConfigPanelProps {
  node: FlowNode | null;
  apis: ApiDefinition[];
  allNodes: FlowNode[];
  edges: FlowEdge[];
  onClose: () => void;
  onChange: (nodeId: string, data: Partial<ApiData>) => void;
}

function getUpstreamNodes(nodeId: string, allNodes: FlowNode[], edges: FlowEdge[]): FlowNode[] {
  const visited = new Set<string>();
  const result: FlowNode[] = [];
  function walk(id: string) {
    for (const e of edges.filter(e => e.target === id)) {
      if (visited.has(e.source)) continue;
      visited.add(e.source);
      walk(e.source);
      const n = allNodes.find(n => n.id === e.source);
      if (n) result.push(n);
    }
  }
  walk(nodeId);
  return result;
}

export const NodeConfigPanel = ({ node, apis, allNodes, edges, onClose, onChange }: NodeConfigPanelProps) => {
  const [toolName, setToolName] = useState('');
  const [env, setEnv] = useState<'staging' | 'production'>('staging');
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});
  const [body, setBody] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [activeField, setActiveField] = useState<string | null>(null);

  // Ref mirrors state so DataBrowser callbacks always see the latest value (no stale closure)
  const activeFieldRef = useRef<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const cursorRef = useRef<{ start: number; end: number } | null>(null);

  const selectedApi = apis.find(a => a.toolName === toolName);
  const upstreamNodes = node ? getUpstreamNodes(node.id, allNodes, edges) : [];

  useEffect(() => {
    if (node?.type === 'api') {
      const d = node.data as unknown as ApiData;
      setToolName(d.toolName ?? '');
      setEnv(d.environment ?? 'staging');
      setQueryParams(d.queryParams ?? {});
      setBody(d.body ?? {});
    }
    setSearch('');
    setActiveField(null);
    activeFieldRef.current = null;
    inputRefs.current = {};
    cursorRef.current = null;
  }, [node?.id]);

  if (!node || node.type !== 'api') return null;

  const filtered = apis.filter(a =>
    !search || a.displayName.toLowerCase().includes(search.toLowerCase()) ||
    a.toolName.toLowerCase().includes(search.toLowerCase()) ||
    a.folder.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 20);

  const handleFocus = (fid: string, el: HTMLInputElement | null) => {
    setActiveField(fid);
    activeFieldRef.current = fid;
    // Save cursor when focusing
    if (el) cursorRef.current = { start: el.selectionStart ?? 0, end: el.selectionEnd ?? 0 };
  };

  const trackCursor = (el: HTMLInputElement | null) => {
    if (el) cursorRef.current = { start: el.selectionStart ?? 0, end: el.selectionEnd ?? 0 };
  };

  const handleToolSelect = (api: ApiDefinition) => {
    setToolName(api.toolName);
    setQueryParams({});
    setBody({});
    setSearch('');
    onChange(node.id, { toolName: api.toolName, label: api.displayName, queryParams: {}, body: {} });
  };

  // Called from DataBrowser — uses ref so it always has fresh activeField
  const handleInsert = (ref: string) => {
    const fid = activeFieldRef.current;
    if (!fid) return;

    const isParam = fid.startsWith('param.');
    const isBody = fid.startsWith('body.');
    const key = fid.replace(/^(param|body)\./, '');
    const el = inputRefs.current[fid] ?? null;

    const insert = (current: string, setter: (v: string) => void) => {
      const { start = current.length, end = current.length } = cursorRef.current ?? {};
      const next = current.slice(0, start) + ref + current.slice(end);
      setter(next);
      cursorRef.current = { start: start + ref.length, end: start + ref.length };
      // Re-focus and restore cursor
      requestAnimationFrame(() => {
        if (el) {
          el.focus();
          el.selectionStart = el.selectionEnd = start + ref.length;
        }
      });
    };

    if (isParam) insert(queryParams[key] ?? '', v => setQueryParams(p => ({ ...p, [key]: v })));
    else if (isBody) insert(body[key] ?? '', v => setBody(p => ({ ...p, [key]: v })));
  };

  const handleSave = () => {
    onChange(node.id, { toolName, environment: env, queryParams, body });
    onClose();
  };

  const paramId = (k: string) => `param.${k}`;
  const bodyId = (k: string) => `body.${k}`;

  const fieldInput = (fid: string, value: string, placeholder: string, setter: (v: string) => void) => (
    <input
      ref={el => { inputRefs.current[fid] = el; }}
      type="text"
      value={value}
      onChange={e => setter(e.target.value)}
      onFocus={() => handleFocus(fid, inputRefs.current[fid] ?? null)}
      onKeyUp={() => trackCursor(inputRefs.current[fid] ?? null)}
      onClick={() => trackCursor(inputRefs.current[fid] ?? null)}
      placeholder={placeholder}
      className={`w-full rounded-lg border bg-white/5 px-3 py-1.5 font-mono text-xs text-white placeholder-slate-600 outline-none transition-colors ${
        activeField === fid ? 'border-primary-500/60 ring-1 ring-primary-500/20' : 'border-white/10 focus:border-primary-500/40'
      }`}
    />
  );

  return (
    <div className="flex h-full w-80 flex-col border-l border-white/5 bg-[#0c0e14]">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-white/5 px-4 py-3">
        <span className="text-sm font-semibold text-white">Cấu hình Node</span>
        <button onClick={onClose} className="text-slate-500 hover:text-white">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-4">

          {/* Endpoint picker */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Endpoint</label>
            {toolName ? (
              <div className="flex items-center justify-between rounded-lg border border-primary-500/30 bg-primary-500/10 px-3 py-2">
                <div>
                  <p className="text-xs font-medium text-white">{selectedApi?.displayName ?? toolName}</p>
                  <p className="font-mono text-[10px] text-primary-400">{toolName}</p>
                </div>
                <button onClick={() => { setToolName(''); setQueryParams({}); setBody({}); }} className="text-slate-500 hover:text-red-400">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input type="text" placeholder="Tìm endpoint..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-primary-500/50" />
                <div className="max-h-44 space-y-0.5 overflow-y-auto">
                  {filtered.map(api => (
                    <button key={api.toolName} onClick={() => handleToolSelect(api)}
                      className="w-full rounded-lg border border-transparent px-3 py-2 text-left hover:border-primary-500/30 hover:bg-primary-500/10">
                      <p className="text-xs font-medium text-white">{api.displayName}</p>
                      <p className="flex items-center gap-1.5 text-[10px] text-slate-500">
                        <span className={`rounded px-1 font-mono text-[9px] ${
                          api.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400' :
                          api.method === 'POST' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>{api.method}</span>
                        {api.folder}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Environment */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Môi trường</label>
            <div className="flex gap-2">
              {(['staging', 'production'] as const).map(e => (
                <button key={e} onClick={() => setEnv(e)}
                  className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition-all ${
                    env === e ? 'border-primary-500/50 bg-primary-500/20 text-primary-400' : 'border-white/10 text-slate-500 hover:border-white/20'
                  }`}>{e}</button>
              ))}
            </div>
          </div>

          {/* Query Params */}
          {selectedApi && selectedApi.queryParams.length > 0 && (
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Query Params</label>
              <div className="space-y-2">
                {selectedApi.queryParams.map(p => (
                  <div key={p.key}>
                    <p className="mb-0.5 font-mono text-[10px] text-slate-400">{p.key}</p>
                    {fieldInput(
                      paramId(p.key),
                      queryParams[p.key] ?? '',
                      p.description || p.value || '{{ref}} hoặc giá trị',
                      v => setQueryParams(prev => ({ ...prev, [p.key]: v })),
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Body */}
          {selectedApi?.bodySchema && Object.keys(selectedApi.bodySchema).length > 0 && (
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">Request Body</label>
              <div className="space-y-2">
                {Object.keys(selectedApi.bodySchema).map(key => (
                  <div key={key}>
                    <p className="mb-0.5 font-mono text-[10px] text-slate-400">{key}</p>
                    {fieldInput(
                      bodyId(key),
                      body[key] ?? '',
                      '{{ref}} hoặc literal',
                      v => setBody(prev => ({ ...prev, [key]: v })),
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Browser */}
          {upstreamNodes.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Output từ node trước
                </label>
                {activeField ? (
                  <span className="rounded bg-primary-500/15 px-1.5 py-0.5 text-[9px] font-bold text-primary-400 animate-pulse">
                    → {activeField.replace(/^(param|body)\./, '')}
                  </span>
                ) : (
                  <span className="rounded bg-slate-700/50 px-1.5 py-0.5 text-[9px] text-slate-500">
                    click ô param trước
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {upstreamNodes.map(n => (
                  <DataBrowser
                    key={n.id}
                    nodeId={n.id}
                    nodeLabel={(n.data as Record<string, unknown>).label as string ?? n.id}
                    data={(n.data as Record<string, unknown>).output}
                    activeField={activeField}
                    onInsert={handleInsert}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Save */}
        <div className="flex-shrink-0 border-t border-white/5 p-4">
          <button onClick={handleSave}
            className="w-full rounded-xl bg-primary-500 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-600">
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
};
