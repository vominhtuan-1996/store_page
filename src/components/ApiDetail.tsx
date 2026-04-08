import { useState, useMemo } from 'react';
import type { ApiDefinition } from '../types/api';
import { MethodBadge } from './MethodBadge';

interface ApiDetailProps {
  api: ApiDefinition;
  onClose: () => void;
  resolveUrl: (rawUrl: string) => string;
  authToken: string;
  onTokenChange: (token: string) => void;
}

const isLoginApi = (toolName: string) => toolName.startsWith('login_');

export const ApiDetail = ({ api, onClose, resolveUrl, authToken, onTokenChange }: ApiDetailProps) => {
  const cleanUrl = resolveUrl(api.url);

  // Editable query params
  const [queryValues, setQueryValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const p of api.queryParams) {
      init[p.key] = p.value || '';
    }
    return init;
  });

  // Editable body fields
  const [bodyValues, setBodyValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    if (api.bodySchema) {
      for (const key of Object.keys(api.bodySchema)) {
        init[key] = '';
      }
    }
    return init;
  });

  // API call state
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [tokenSaved, setTokenSaved] = useState(false);

  // Build full URL with query params
  const fullUrl = useMemo(() => {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(queryValues)) {
      if (val) params.append(key, val);
    }
    const qs = params.toString();
    return qs ? `${cleanUrl}?${qs}` : cleanUrl;
  }, [cleanUrl, queryValues]);

  const handleCall = async () => {
    setLoading(true);
    setResponse(null);
    setResponseStatus(null);
    setTokenSaved(false);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Attach token for non-login APIs
      if (authToken && !isLoginApi(api.toolName)) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const fetchOptions: RequestInit = { method: api.method, headers };

      if (['POST', 'PUT', 'PATCH'].includes(api.method) && api.bodySchema) {
        const body: Record<string, unknown> = {};
        for (const [key, type] of Object.entries(api.bodySchema)) {
          const val = bodyValues[key];
          if (val) {
            if (type === 'number') body[key] = Number(val);
            else if (type === 'boolean') body[key] = val === 'true';
            else body[key] = val;
          }
        }
        fetchOptions.body = JSON.stringify(body);
      }

      const res = await fetch(fullUrl, fetchOptions);
      setResponseStatus(res.status);
      const contentType = res.headers.get('content-type') || '';
      let jsonData: unknown = null;

      if (contentType.includes('application/json')) {
        jsonData = await res.json();
        setResponse(JSON.stringify(jsonData, null, 2));
      } else {
        setResponse(await res.text());
      }

      // Auto-save token on login success
      if (isLoginApi(api.toolName) && jsonData && typeof jsonData === 'object') {
        const data = jsonData as Record<string, unknown>;
        if (data.code === 0) {
          const innerData = data.data as Record<string, unknown> | undefined;
          const token = innerData?.token as string | undefined;
          if (token) {
            onTokenChange(token);
            setTokenSaved(true);
          }
        }
      }
    } catch (err) {
      setResponse(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const updateQuery = (key: string, value: string) => {
    setQueryValues((prev) => ({ ...prev, [key]: value }));
  };

  const updateBody = (key: string, value: string) => {
    setBodyValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="glass animate-fade-in rounded-2xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-3">
            <MethodBadge method={api.method} />
            <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-slate-500">
              {api.folder}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">{api.displayName}</h2>
        </div>
        <button
          onClick={onClose}
          className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* URL */}
      <div className="mb-5">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
          Endpoint
        </label>
        <div className="overflow-x-auto rounded-lg bg-black/40 px-4 py-3 font-mono text-sm text-accent-cyan">
          {fullUrl}
        </div>
      </div>

      {/* Tool name */}
      <div className="mb-5">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-500">
          MCP Tool Name
        </label>
        <div className="rounded-lg bg-black/40 px-4 py-3 font-mono text-sm text-primary-400">
          {api.toolName}
        </div>
      </div>

      {/* Query Params - Editable */}
      {api.queryParams.length > 0 && (
        <div className="mb-5">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-500">
            Query Parameters
          </label>
          <div className="space-y-2">
            {api.queryParams.map((param) => (
              <div key={param.key} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2.5">
                <span className="w-32 shrink-0 font-mono text-sm text-accent-cyan">{param.key}</span>
                <input
                  type="text"
                  value={queryValues[param.key] || ''}
                  onChange={(e) => updateQuery(param.key, e.target.value)}
                  placeholder={param.description || param.key}
                  className="flex-1 rounded-md bg-black/30 px-3 py-1.5 text-sm text-white placeholder-slate-600 outline-none ring-1 ring-white/5 transition-all focus:ring-primary-500/50"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Body Schema - Editable */}
      {api.bodySchema && (
        <div className="mb-5">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-500">
            Body
          </label>
          <div className="space-y-2">
            {Object.entries(api.bodySchema).map(([key, type]) => (
              <div key={key} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-2.5">
                <div className="w-32 shrink-0">
                  <span className="font-mono text-sm text-accent-cyan">{key}</span>
                  <span className="ml-2 rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-accent-violet">
                    {type}
                  </span>
                </div>
                <input
                  type="text"
                  value={bodyValues[key] || ''}
                  onChange={(e) => updateBody(key, e.target.value)}
                  placeholder={type === 'boolean' ? 'true / false' : key}
                  className="flex-1 rounded-md bg-black/30 px-3 py-1.5 text-sm text-white placeholder-slate-600 outline-none ring-1 ring-white/5 transition-all focus:ring-primary-500/50"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No params hint */}
      {api.queryParams.length === 0 && !api.bodySchema && (
        <div className="mb-5 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-6 text-center text-sm text-slate-500">
          API này không có tham số
        </div>
      )}

      {/* Call API button */}
      <button
        onClick={handleCall}
        disabled={loading}
        className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-accent-violet px-5 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
      >
        {loading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Calling...
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
            </svg>
            Send Request
          </>
        )}
      </button>

      {/* Token saved notification */}
      {tokenSaved && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5">
          <svg className="h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs text-emerald-400">Token saved successfully - all API calls will now use this token</span>
        </div>
      )}

      {/* Response */}
      {response !== null && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Response
            </label>
            {responseStatus !== null && (
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                  responseStatus >= 200 && responseStatus < 300
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : responseStatus >= 400
                      ? 'bg-red-500/15 text-red-400'
                      : 'bg-amber-500/15 text-amber-400'
                }`}
              >
                {responseStatus}
              </span>
            )}
          </div>
          <pre className="max-h-96 overflow-auto rounded-lg bg-black/40 px-4 py-3 font-mono text-xs leading-relaxed text-slate-300">
            {response}
          </pre>
        </div>
      )}
    </div>
  );
};
