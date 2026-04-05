import { useState } from 'react';
import type { AppInfo, AppVersion } from '../types/app';

interface AppDetailProps {
  app: AppInfo;
  onBack: () => void;
}

type EnvKey = 'staging' | 'production';

const BASE_URL = import.meta.env.BASE_URL;

const getIosInstallUrl = (appId: string, env: string, version: AppVersion) => {
  if (!version.ios) return '';
  const plistUrl = `${window.location.origin}${BASE_URL}apps/${appId}/${env}/ios/manifest-${version.version}.plist`;
  return `itms-services://?action=download-manifest&url=${encodeURIComponent(plistUrl)}`;
};

const getAndroidDownloadUrl = (appId: string, env: string, version: AppVersion) => {
  if (!version.android) return '';
  return `${BASE_URL}apps/${appId}/${env}/android/${version.android.downloadUrl}`;
};

export const AppDetail = ({ app, onBack }: AppDetailProps) => {
  const [activeEnv, setActiveEnv] = useState<EnvKey>('production');

  const environment = app.environments[activeEnv];
  const versions = environment.versions;

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Quay lai
      </button>

      <div className="flex items-center gap-4 mb-6">
        <img
          src={app.icon}
          alt={app.name}
          className="h-20 w-20 rounded-2xl bg-gray-100 object-cover dark:bg-gray-700"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${app.name}&size=80&background=6366f1&color=fff&rounded=true`;
          }}
        />
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{app.name}</h2>
          <p className="text-gray-500 dark:text-gray-400">{app.description}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(['production', 'staging'] as EnvKey[]).map((env) => (
          <button
            key={env}
            type="button"
            onClick={() => setActiveEnv(env)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeEnv === env
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {app.environments[env].name}
          </button>
        ))}
      </div>

      {versions.length === 0 ? (
        <div className="rounded-xl bg-gray-50 p-8 text-center dark:bg-gray-800">
          <p className="text-gray-400">Chua co phien ban nao</p>
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map((version) => (
            <div
              key={version.version}
              className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    v{version.version}
                  </span>
                  <span className="ml-2 text-xs text-gray-400">
                    Build {version.buildNumber}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{version.releaseDate}</span>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {version.releaseNotes}
              </p>

              <div className="flex gap-2">
                {version.android && (
                  <a
                    href={getAndroidDownloadUrl(app.id, activeEnv, version)}
                    className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 transition"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.523 2.246a.75.75 0 0 0-1.046.254l-1.574 2.614A7.94 7.94 0 0 0 12 4.5a7.94 7.94 0 0 0-2.903.614L7.523 2.5A.75.75 0 1 0 6.223 3.3l1.5 2.491A7.98 7.98 0 0 0 4 12h16a7.98 7.98 0 0 0-3.723-6.209l1.5-2.491a.75.75 0 0 0-.254-1.054zM9.5 9.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm7 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zM4 13h16v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7z" />
                    </svg>
                    Android
                  </a>
                )}
                {version.ios && (
                  <a
                    href={getIosInstallUrl(app.id, activeEnv, version)}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                    iOS
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
