import { useState } from 'react';
import { APP_LIST } from './constants/apps';
import { AppCard } from './components/AppCard';
import { AppDetail } from './components/AppDetail';
import { ApiExplorer } from './components/ApiExplorer';
import { ClipboardSync } from './components/ClipboardSync';
import type { AppInfo } from './types/app';

type Page = 'home' | 'api-explorer' | 'clipboard-sync';

function App() {
  const [selectedApp, setSelectedApp] = useState<AppInfo | null>(null);
  const [page, setPage] = useState<Page>('home');

  return (
    <div className="ambient-glow relative flex min-h-screen flex-col">
      {/* Main content */}
      <main className="relative z-10 flex flex-1 flex-col items-center px-5 py-12 sm:px-6 sm:py-16">
        <div className="w-full max-w-2xl">
          {page === 'clipboard-sync' ? (
            <ClipboardSync onBack={() => setPage('home')} />
          ) : page === 'api-explorer' ? (
            <ApiExplorer onBack={() => setPage('home')} />
          ) : !selectedApp ? (
            <>
              {/* Hero header */}
              <header className="mb-12 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[18px] bg-gradient-to-br from-primary-500 to-accent-violet shadow-lg shadow-primary-500/20">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </div>
                <h1 className="text-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">
                  App Center
                </h1>
                <p className="mt-2 text-sm tracking-wide text-slate-500">
                  Enterprise App Distribution
                </p>
              </header>

              {/* App list */}
              <section className="mb-8">
                <div className="mb-4 flex items-center justify-between px-1">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Applications
                  </h2>
                  <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                    {APP_LIST.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {APP_LIST.map((app) => (
                    <AppCard key={app.id} app={app} onSelect={setSelectedApp} />
                  ))}
                </div>
              </section>

              {/* Tools section */}
              <section>
                <div className="mb-4 px-1">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Developer Tools
                  </h2>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => setPage('api-explorer')}
                    className="glass group w-full rounded-xl px-5 py-4 text-left transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent-cyan/20 to-primary-500/20">
                        <svg className="h-5 w-5 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white group-hover:text-accent-cyan">
                          API Explorer
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Browse & search PMS API endpoints from Postman collection
                        </p>
                      </div>
                      <svg className="h-4 w-4 text-slate-600 transition-colors group-hover:text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </button>

                  <button
                    onClick={() => setPage('clipboard-sync')}
                    className="glass group w-full rounded-xl px-5 py-4 text-left transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-accent-cyan/20">
                        <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white group-hover:text-emerald-400">
                          Clipboard Sync
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Chia se clipboard giua cac thiet bi qua mang
                        </p>
                      </div>
                      <svg className="h-4 w-4 text-slate-600 transition-colors group-hover:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </button>
                </div>
              </section>
            </>
          ) : (
            <AppDetail app={selectedApp} onBack={() => setSelectedApp(null)} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-[11px] tracking-wide text-slate-700">
        Internal use only &middot; Unauthorized distribution is prohibited
      </footer>
    </div>
  );
}

export default App;
