import { useState } from 'react';
import { useApiCollection } from '../hooks/useApiCollection';
import { ApiDetail } from './ApiDetail';
import { MethodBadge } from './MethodBadge';
import type { ApiDefinition } from '../types/api';
import { SmartAssistant } from './SmartAssistant';

const TOKEN_KEY = 'pms_auth_token';

interface ApiExplorerProps {
  onBack: () => void;
}

export const ApiExplorer = ({ onBack }: ApiExplorerProps) => {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');

  const handleTokenChange = (token: string) => {
    setAuthToken(token);
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  };

  const {
    apis,
    totalCount,
    loading,
    error,
    search,
    setSearch,
    methodFilter,
    setMethodFilter,
    folderFilter,
    setFolderFilter,
    folders,
    methods,
    environment,
    setEnvironment,
    resolveUrl,
  } = useApiCollection();

  const [selectedApi, setSelectedApi] = useState<ApiDefinition | null>(null);
  const [isAssistantMode, setIsAssistantMode] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
        <p className="text-red-400">Failed to load API collection</p>
        <p className="mt-1 text-sm text-slate-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div>
            <h1 className="text-gradient text-2xl font-extrabold tracking-tight">API Explorer</h1>
            <p className="text-xs tracking-wide text-slate-500">
              PMS Postman Collection &middot; {totalCount} endpoints
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Token status */}
          {authToken ? (
            <button
              onClick={() => handleTokenChange('')}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-xs text-emerald-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
              title="Click to clear token"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              Token
            </button>
          ) : (
            <span className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              No token
            </span>
          )}

          {/* Mode switcher */}
          <div className="glass flex rounded-xl p-1">
            <button
              onClick={() => setIsAssistantMode(false)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                !isAssistantMode
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
              List
            </button>
            <button
              onClick={() => setIsAssistantMode(true)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                isAssistantMode
                  ? 'bg-primary-500/20 text-primary-400 shadow-sm shadow-primary-500/10'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Smart
            </button>
          </div>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Environment switcher */}
          <div className="glass flex rounded-xl p-1">
            <button
              onClick={() => setEnvironment('staging')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                environment === 'staging'
                  ? 'bg-amber-500/15 text-amber-400 shadow-sm shadow-amber-500/10'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Stag
            </button>
            <button
              onClick={() => setEnvironment('production')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                environment === 'production'
                  ? 'bg-emerald-500/15 text-emerald-400 shadow-sm shadow-emerald-500/10'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Prod
            </button>
          </div>
        </div>
      </div>

      {selectedApi ? (
        <ApiDetail
          api={selectedApi}
          onClose={() => setSelectedApi(null)}
          resolveUrl={resolveUrl}
          authToken={authToken}
          onTokenChange={handleTokenChange}
        />
      ) : (
        <>
          {isAssistantMode ? (
            <SmartAssistant
              apis={apis}
              onSelectApi={setSelectedApi}
              resolveUrl={resolveUrl}
              authToken={authToken}
              onTokenChange={handleTokenChange}
            />
          ) : (
            <>
              {/* Search */}
              <div className="mb-4">
                <div className="glass flex items-center gap-3 rounded-xl px-4 py-3">
                  <svg className="h-4 w-4 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search APIs by name, URL, or tool name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent text-sm text-white placeholder-slate-600 outline-none"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="text-slate-500 hover:text-white">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Filters */}
              <div className="mb-5 flex gap-3">
                {/* Method filter */}
                <div className="flex-1">
                  <select
                    value={methodFilter}
                    onChange={(e) => setMethodFilter(e.target.value)}
                    className="glass w-full cursor-pointer rounded-xl px-3 py-2.5 text-sm text-slate-300 outline-none"
                  >
                    {methods.map((m) => (
                      <option key={m} value={m} className="bg-[#0a0a0f]">
                        {m === 'ALL' ? 'All Methods' : m}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Folder filter */}
                <div className="flex-1">
                  <select
                    value={folderFilter}
                    onChange={(e) => setFolderFilter(e.target.value)}
                    className="glass w-full cursor-pointer rounded-xl px-3 py-2.5 text-sm text-slate-300 outline-none"
                  >
                    {folders.map((f) => (
                      <option key={f} value={f} className="bg-[#0a0a0f]">
                        {f === 'ALL' ? 'All Folders' : f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Result count */}
              <div className="mb-3 px-1 text-xs text-slate-500">
                {apis.length} / {totalCount} endpoints
              </div>

              {/* API list */}
              <div className="space-y-2">
                {apis.length === 0 ? (
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] py-12 text-center text-sm text-slate-500">
                    No APIs found matching your search
                  </div>
                ) : (
                  apis.map((api) => (
                    <button
                      key={api.toolName}
                      onClick={() => setSelectedApi(api)}
                      className="glass group w-full rounded-xl px-4 py-3.5 text-left transition-all hover:scale-[1.01]"
                    >
                      <div className="flex items-center gap-3">
                        <MethodBadge method={api.method} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white group-hover:text-primary-400">
                            {api.displayName}
                          </p>
                          <p className="mt-0.5 truncate font-mono text-xs text-slate-600">
                            {resolveUrl(api.url)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {api.queryParams.length > 0 && (
                            <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-500">
                              {api.queryParams.length} params
                            </span>
                          )}
                          {api.bodySchema && (
                            <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-500">
                              body
                            </span>
                          )}
                          <svg className="h-4 w-4 text-slate-600 transition-colors group-hover:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
