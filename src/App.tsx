import { useState } from 'react';
import { APP_LIST } from './constants/apps';
import { AppCard } from './components/AppCard';
import { AppDetail } from './components/AppDetail';
import type { AppInfo } from './types/app';

function App() {
  const [selectedApp, setSelectedApp] = useState<AppInfo | null>(null);

  return (
    <div className="ambient-glow relative flex min-h-screen flex-col">
      {/* Main content */}
      <main className="relative z-10 flex flex-1 flex-col items-center px-5 py-12 sm:px-6 sm:py-16">
        <div className="w-full max-w-lg">
          {!selectedApp ? (
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
              <section>
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
