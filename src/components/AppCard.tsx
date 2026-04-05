import type { AppInfo } from '../types/app';

interface AppCardProps {
  app: AppInfo;
  onSelect: (app: AppInfo) => void;
}

const ICON_COLORS = [
  'from-indigo-500 to-purple-600',
  'from-cyan-500 to-blue-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600',
];

export const AppCard = ({ app, onSelect }: AppCardProps) => {
  const totalVersions =
    app.environments.staging.versions.length +
    app.environments.production.versions.length;

  const colorIndex = app.name.charCodeAt(0) % ICON_COLORS.length;
  const gradientClass = ICON_COLORS[colorIndex];

  return (
    <button
      type="button"
      onClick={() => onSelect(app)}
      className="glass group flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-black/20 active:scale-[0.99]"
    >
      {/* App icon */}
      <div className="relative shrink-0">
        <div className="overflow-hidden rounded-xl">
          <img
            src={app.icon}
            alt={app.name}
            className="h-[52px] w-[52px] rounded-xl object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div
            className={`hidden h-[52px] w-[52px] items-center justify-center rounded-xl bg-gradient-to-br ${gradientClass} text-xl font-bold text-white shadow-inner`}
          >
            {app.name.charAt(0)}
          </div>
        </div>
        {totalVersions > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1 text-[10px] font-bold text-white shadow-md shadow-primary-500/30">
            {totalVersions}
          </span>
        )}
      </div>

      {/* App info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-[15px] font-semibold text-white">
            {app.name}
          </h3>
        </div>
        <p className="mt-0.5 truncate text-[13px] text-slate-500">
          {app.description}
        </p>
        <div className="mt-2 flex gap-1.5">
          {app.environments.production.versions.length > 0 && (
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
              Production
            </span>
          )}
          {app.environments.staging.versions.length > 0 && (
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
              Staging
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.03] transition-all duration-300 group-hover:bg-white/[0.08]">
        <svg
          className="h-3.5 w-3.5 text-slate-500 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-primary-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
};
