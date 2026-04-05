import type { AppInfo } from '../types/app';

interface AppCardProps {
  app: AppInfo;
  onSelect: (app: AppInfo) => void;
}

export const AppCard = ({ app, onSelect }: AppCardProps) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(app)}
      className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 shadow-md transition hover:shadow-lg active:scale-[0.98] dark:bg-gray-800"
    >
      <img
        src={app.icon}
        alt={app.name}
        className="h-16 w-16 rounded-2xl bg-gray-100 object-cover dark:bg-gray-700"
        onError={(e) => {
          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${app.name}&size=64&background=6366f1&color=fff&rounded=true`;
        }}
      />
      <div className="text-left">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {app.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {app.description}
        </p>
      </div>
      <svg
        className="ml-auto h-5 w-5 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
};
