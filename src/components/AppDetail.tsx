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

const ENV_CONFIG: Record<EnvKey, { label: string; dot: string }> = {
  production: { label: 'Production', dot: 'bg-emerald-400' },
  staging: { label: 'Staging', dot: 'bg-amber-400' },
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
        className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Quay lai
      </button>

      <div className="mb-8 flex items-center gap-5">
        <img
          src={app.icon}
          alt={app.name}
          className="h-20 w-20 rounded-2xl bg-slate-800 object-cover shadow-lg ring-1 ring-white/10"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.name)}&size=80&background=4f46e5&color=fff&rounded=true&bold=true`;
          }}
        />
        <div>
          <h2 className="text-2xl font-bold text-white">{app.name}</h2>
          <p className="mt-1 text-sm text-slate-400">{app.description}</p>
        </div>
      </div>

      <div className="mb-6 inline-flex rounded-xl bg-white/5 p-1 backdrop-blur-sm">
        {(['production', 'staging'] as EnvKey[]).map((env) => (
          <button
            key={env}
            type="button"
            onClick={() => setActiveEnv(env)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
              activeEnv === env
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${ENV_CONFIG[env].dot}`} />
            {ENV_CONFIG[env].label}
          </button>
        ))}
      </div>

      {versions.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-white/5 p-12 text-center backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
            <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <p className="text-sm text-slate-500">Chua co phien ban nao</p>
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map((version, index) => (
            <div
              key={version.version}
              className={`rounded-2xl border bg-white/5 p-5 backdrop-blur-sm transition ${
                index === 0
                  ? 'border-primary-500/20 shadow-lg shadow-primary-500/5'
                  : 'border-white/5'
              }`}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-primary-500/10 px-2.5 py-1 text-sm font-bold text-primary-400">
                    v{version.version}
                  </span>
                  {index === 0 && (
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                      Latest
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500">
                    Build {version.buildNumber}
                  </span>
                  <p className="text-xs text-slate-600">{version.releaseDate}</p>
                </div>
              </div>

              <p className="mb-4 text-sm leading-relaxed text-slate-400">
                {version.releaseNotes}
              </p>

              <div className="flex gap-2">
                {version.android && (
                  <a
                    href={getAndroidDownloadUrl(app.id, activeEnv, version)}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.523 2.246a.75.75 0 0 0-1.046.254l-1.574 2.614A7.94 7.94 0 0 0 12 4.5a7.94 7.94 0 0 0-2.903.614L7.523 2.5A.75.75 0 1 0 6.223 3.3l1.5 2.491A7.98 7.98 0 0 0 4 12h16a7.98 7.98 0 0 0-3.723-6.209l1.5-2.491a.75.75 0 0 0-.254-1.054zM9.5 9.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm7 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zM4 13h16v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7z" />
                    </svg>
                    Android
                  </a>
                )}
                {version.ios && (
                  <a
                    href={getIosInstallUrl(app.id, activeEnv, version)}
                    className="inline-flex items-center gap-2 rounded-xl bg-sky-500/10 px-4 py-2.5 text-sm font-semibold text-sky-400 transition hover:bg-sky-500/20"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
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
