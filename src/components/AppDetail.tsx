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

const ICON_COLORS = [
  'from-indigo-500 to-purple-600',
  'from-cyan-500 to-blue-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600',
];

const ENV_TABS: { key: EnvKey; label: string; dot: string; count: (app: AppInfo) => number }[] = [
  {
    key: 'production',
    label: 'Production',
    dot: 'bg-emerald-400 shadow-emerald-400/50',
    count: (app) => app.environments.production.versions.length,
  },
  {
    key: 'staging',
    label: 'Staging',
    dot: 'bg-amber-400 shadow-amber-400/50',
    count: (app) => app.environments.staging.versions.length,
  },
];

export const AppDetail = ({ app, onBack }: AppDetailProps) => {
  const [activeEnv, setActiveEnv] = useState<EnvKey>('production');
  const versions = app.environments[activeEnv].versions;

  const colorIndex = app.name.charCodeAt(0) % ICON_COLORS.length;
  const gradientClass = ICON_COLORS[colorIndex];

  return (
    <div>
      {/* Navigation */}
      <button
        type="button"
        onClick={onBack}
        className="mb-8 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Quay lại
      </button>

      {/* App hero */}
      <div className="glass mb-8 rounded-2xl p-6">
        <div className="flex items-center gap-5">
          <div className="shrink-0 overflow-hidden rounded-2xl shadow-lg">
            <img
              src={app.icon}
              alt={app.name}
              className="h-20 w-20 rounded-2xl object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div
              className={`hidden h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${gradientClass} text-3xl font-bold text-white`}
            >
              {app.name.charAt(0)}
            </div>
          </div>
          <div className="min-w-0">
            <h2 className="text-gradient truncate text-2xl font-bold">{app.name}</h2>
            <p className="mt-1 text-sm text-slate-400">{app.description}</p>
            <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                {app.environments.production.versions.length + app.environments.staging.versions.length} phiên bản
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Environment tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-white/[0.03] p-1">
        {ENV_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveEnv(tab.key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              activeEnv === tab.key
                ? 'tab-active text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full shadow-sm ${tab.dot}`} />
            {tab.label}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
              activeEnv === tab.key
                ? 'bg-white/10 text-white'
                : 'bg-white/[0.03] text-slate-600'
            }`}>
              {tab.count(app)}
            </span>
          </button>
        ))}
      </div>

      {/* Versions */}
      {versions.length === 0 ? (
        <div className="glass rounded-2xl px-6 py-20 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.03]">
            <svg className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-500">Chưa có phiên bản nào</p>
          <p className="mt-1 text-xs text-slate-600">Phiên bản mới sẽ xuất hiện tại đây</p>
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map((version, index) => {
            const isLatest = index === 0;
            return (
              <div
                key={version.version}
                className={`glass rounded-2xl p-5 transition-all ${
                  isLatest ? 'ring-1 ring-primary-500/20 shadow-lg shadow-primary-500/5' : ''
                }`}
              >
                {/* Version header */}
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge-glow rounded-lg px-2.5 py-1 text-sm font-bold text-primary-400">
                      v{version.version}
                    </span>
                    {isLatest && (
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                        Latest
                      </span>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-xs font-medium text-slate-400">
                      Build {version.buildNumber}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-600">{version.releaseDate}</div>
                  </div>
                </div>

                {/* Release notes */}
                <p className="mb-4 text-[13px] leading-relaxed text-slate-400">
                  {version.releaseNotes}
                </p>

                {/* Download buttons */}
                <div className="flex flex-wrap gap-2">
                  {version.android && (
                    <a
                      href={getAndroidDownloadUrl(app.id, activeEnv, version)}
                      className="btn-android inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-emerald-400"
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
                      className="btn-ios inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-sky-400"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                      </svg>
                      iOS
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
