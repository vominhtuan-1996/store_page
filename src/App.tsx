import { useState } from 'react';
import { APP_LIST } from './constants/apps';
import { AppCard } from './components/AppCard';
import { AppDetail } from './components/AppDetail';
import type { AppInfo } from './types/app';

function App() {
  const [selectedApp, setSelectedApp] = useState<AppInfo | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-900">
      <div className="mx-auto w-full max-w-lg">
        {!selectedApp ? (
          <>
            <h1 className="mb-2 text-center text-3xl font-bold text-gray-800 dark:text-white">
              App Store
            </h1>
            <p className="mb-8 text-center text-sm text-gray-400">
              Ung dung noi bo - Enterprise Distribution
            </p>

            <div className="space-y-3">
              {APP_LIST.map((app) => (
                <AppCard key={app.id} app={app} onSelect={setSelectedApp} />
              ))}
            </div>
          </>
        ) : (
          <AppDetail app={selectedApp} onBack={() => setSelectedApp(null)} />
        )}

        <p className="mt-8 text-center text-xs text-gray-400">
          Chi danh cho su dung noi bo
        </p>
      </div>
    </div>
  );
}

export default App;
