import { useState } from 'react';
import { APP_LIST } from './constants/apps';
import { AppCard } from './components/AppCard';
import { AppDetail } from './components/AppDetail';
import type { AppInfo } from './types/app';

function App() {
  const [selectedApp, setSelectedApp] = useState<AppInfo | null>(null);

  return (
    <div className="relative min-h-screen px-4 py-8 sm:py-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-md">
        {!selectedApp ? (
          <>
            <div className="mb-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 shadow-lg shadow-primary-500/25">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                App Center
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Enterprise Distribution Platform
              </p>
            </div>

            <div className="space-y-3">
              {APP_LIST.map((app) => (
                <AppCard key={app.id} app={app} onSelect={setSelectedApp} />
              ))}
            </div>
          </>
        ) : (
          <AppDetail app={selectedApp} onBack={() => setSelectedApp(null)} />
        )}

        <p className="mt-10 text-center text-xs text-slate-600">
          Internal use only &middot; Unauthorized distribution is prohibited
        </p>
      </div>
    </div>
  );
}

export default App;
