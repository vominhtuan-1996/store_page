import { useState, useRef, useEffect } from 'react';
import type { ApiDefinition } from '../types/api';
import { useSmartAssistant, type SmartResponse } from '../hooks/useSmartAssistant';
import { MethodBadge } from './MethodBadge';

import { DataVisualizer } from './DataVisualizer';

interface SmartAssistantProps {
  apis: ApiDefinition[];
  onSelectApi: (api: ApiDefinition) => void;
  resolveUrl: (url: string) => string;
  authToken: string;
  onTokenChange: (token: string) => void;
}

export const SmartAssistant = ({ apis, onSelectApi, resolveUrl, authToken }: SmartAssistantProps) => {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [response, setResponse] = useState<SmartResponse | null>(null);
  
  // Execution states
  const [isCalling, setIsCalling] = useState(false);
  const [apiResult, setApiResult] = useState<{ status: number; data: any } | null>(null);
  const [viewMode, setViewMode] = useState<'visual' | 'raw'>('visual');
  
  const { getSmartResponse } = useSmartAssistant(apis);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setIsAnalyzing(true);
    setResponse(null);
    setApiResult(null);

    // Simulate AI thinking
    setTimeout(() => {
      const result = getSmartResponse(query);
      setResponse(result);
      setIsAnalyzing(false);

      // Auto-execute if a strong candidate is found
      if (result.bestMatch) {
        handleExecute(result.bestMatch, result.inferredParams);
      }
    }, 800);
  };

  const handleExecute = async (api: ApiDefinition, params: Record<string, string> = {}) => {
    setIsCalling(true);
    setApiResult(null);

    try {
      const cleanUrl = resolveUrl(api.url);
      const urlParams = new URLSearchParams();
      
      // Merge original query params with inferred ones
      const finalQueryParams: Record<string, string> = {};
      api.queryParams.forEach(p => {
        finalQueryParams[p.key] = p.value || '';
      });
      Object.entries(params).forEach(([key, val]) => {
        finalQueryParams[key] = val;
      });

      for (const [key, val] of Object.entries(finalQueryParams)) {
        if (val) urlParams.append(key, val);
      }
      
      const fullUrl = urlParams.toString() ? `${cleanUrl}?${urlParams.toString()}` : cleanUrl;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch(fullUrl, { method: api.method, headers });
      const status = res.status;
      const contentType = res.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        const json = await res.json();
        setApiResult({ status, data: json });
      } else {
        const text = await res.text();
        setApiResult({ status, data: text });
      }
    } catch (err) {
      setApiResult({ status: 500, data: `Error: ${err instanceof Error ? err.message : String(err)}` });
    } finally {
      setIsCalling(false);
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Input Section */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-accent-violet rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500" />
        <form onSubmit={handleSearch} className="relative glass flex items-center gap-3 rounded-2xl px-5 py-4">
          <svg className="h-5 w-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Bạn muốn tìm và chạy API gì? (Ví dụ: login, ấn phẩm Q1 2026...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-base text-white placeholder-slate-500 outline-none"
          />
          <button
            type="submit"
            disabled={isAnalyzing || !query.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500/10 text-primary-400 transition-all hover:bg-primary-500 hover:text-white disabled:opacity-30"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </form>
      </div>

      {/* Loading State */}
      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-xl border-2 border-primary-500/20" />
            <div className="absolute inset-0 rounded-xl border-2 border-primary-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-slate-400 animate-pulse font-medium">Đang suy luận logic API phù hợp...</p>
        </div>
      )}

      {/* Response Section */}
      {response && (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="glass relative overflow-hidden rounded-2xl border-l-4 border-l-primary-500 p-6">
            <div className="relative z-10">
              <p className="text-slate-200 leading-relaxed">{response.answer}</p>
              
              {response.inferredParams && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(response.inferredParams).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 rounded-lg bg-primary-500/10 border border-primary-500/20 px-2.5 py-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary-400/70">{key}</span>
                      <span className="text-xs font-mono text-primary-300">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Manual Call Button (Can be used to re-trigger) */}
              {response.bestMatch && (
                <button
                  onClick={() => handleExecute(response.bestMatch!, response.inferredParams)}
                  disabled={isCalling}
                  className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-accent-violet px-4 py-2.5 text-xs font-bold text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary-500/25 disabled:opacity-50"
                >
                  {isCalling ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.96 5.96m0 0L2.25 21l.75-6.75 6.631-5.84m0 0l5.96 5.96" />
                    </svg>
                  )}
                  {apiResult ? 'GỌI LẠI API' : 'ĐANG TỰ ĐỘNG GỌI...'}
                </button>
              )}
            </div>
            <div className="absolute right-0 top-0 h-32 w-32 translate-x-16 translate-y--16 bg-primary-500/10 blur-3xl" />
          </div>

          {/* API Result Display */}
          {apiResult && (
            <div className="animate-in zoom-in-95 duration-500">
              <div className="mb-2 flex items-center justify-between px-1">
                <div className="flex items-center gap-4">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Kết quả API</h3>
                  <div className="glass flex rounded-lg p-0.5">
                    <button
                      onClick={() => setViewMode('visual')}
                      className={`rounded px-2 py-0.5 text-[10px] font-bold transition-all ${viewMode === 'visual' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      Visual
                    </button>
                    <button
                      onClick={() => setViewMode('raw')}
                      className={`rounded px-2 py-0.5 text-[10px] font-bold transition-all ${viewMode === 'raw' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      Raw
                    </button>
                  </div>
                </div>
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${apiResult.status >= 200 && apiResult.status < 300 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                  HTTP {apiResult.status}
                </span>
              </div>
              
              {viewMode === 'visual' ? (
                <DataVisualizer data={apiResult.data} />
              ) : (
                <div className="rounded-2xl bg-black/40 p-5 border border-white/5 shadow-2xl">
                  <pre className="max-h-80 overflow-auto font-mono text-[11px] leading-relaxed text-slate-300">
                    {typeof apiResult.data === 'string' ? apiResult.data : JSON.stringify(apiResult.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Suggested Flows */}
          {response.suggestedFlows && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 px-1">Quy trình đề xuất</h3>
              <div className="space-y-3">
                {response.suggestedFlows.map((flow, i) => (
                  <div key={i} className="glass rounded-2xl p-5 border border-primary-500/10">
                    <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[10px] text-white">{i + 1}</span>
                      {flow.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2">
                      {flow.steps.map((api, idx) => (
                        <div key={api.toolName} className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectApi(api)}
                            className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors border border-white/5"
                          >
                            {api.displayName}
                          </button>
                          {idx < flow.steps.length - 1 && (
                            <svg className="h-3 w-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related APIs List */}
          {response.relatedApis.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 px-1">Tìm thấy {response.relatedApis.length} API liên quan</h3>
              <div className="grid gap-3">
                {response.relatedApis.map((api) => (
                  <button
                    key={api.toolName}
                    onClick={() => onSelectApi(api)}
                    className="glass group w-full rounded-xl px-4 py-3.5 text-left transition-all hover:scale-[1.01] border border-white/5 hover:border-primary-500/30"
                  >
                    <div className="flex items-center gap-3">
                      <MethodBadge method={api.method} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white group-hover:text-primary-400">
                          {api.displayName}
                        </p>
                        <p className="mt-0.5 truncate font-mono text-[10px] text-slate-600">
                          {resolveUrl(api.url)}
                        </p>
                      </div>
                      <svg className="h-4 w-4 text-slate-600 transition-colors group-hover:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
