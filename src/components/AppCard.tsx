import type { AppInfo } from '../types/app';

interface AppCardProps {
  app: AppInfo;
  onSelect: (app: AppInfo) => void;
}

export const AppCard = ({ app, onSelect }: AppCardProps) => {
  const envCount = (env: 'staging' | 'production') =>
    app.environments[env].versions.length;
  const totalVersions = envCount('staging') + envCount('production');

  return (
    <button
      type="button"
      onClick={() => onSelect(app)}
      className="group flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur-sm transition-all duration-200 hover:border-primary-500/30 hover:bg-white/10 hover:shadow-lg hover:shadow-primary-500/5 active:scale-[0.98]"
    >
      <div className="relative">
        <img
          src={app.icon}
          alt={app.name}
          className="h-14 w-14 rounded-xl bg-slate-800 object-cover ring-1 ring-white/10"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.name)}&size=56&background=4f46e5&color=fff&rounded=true&bold=true`;
          }}
        />
        {totalVersions > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white ring-2 ring-slate-900">
            {totalVersions}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-semibold text-white">
          {app.name}
        </h3>
        <p className="mt-0.5 truncate text-sm text-slate-400">
          {app.description}
        </p>
      </div>

      <svg
        className="h-5 w-5 shrink-0 text-slate-600 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
};
