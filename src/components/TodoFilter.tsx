import type { FilterType } from '../types/todo';

interface TodoFilterProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  activeCount: number;
  completedCount: number;
  onClearCompleted: () => void;
}

const filters: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

export const TodoFilter = ({
  filter,
  onFilterChange,
  activeCount,
  completedCount,
  onClearCompleted,
}: TodoFilterProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <span className="text-gray-500 dark:text-gray-400">
        {activeCount} item{activeCount !== 1 ? 's' : ''} left
      </span>

      <div className="flex gap-1">
        {filters.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onFilterChange(value)}
            className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
              filter === value
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {completedCount > 0 && (
        <button
          onClick={onClearCompleted}
          className="text-gray-400 transition-colors hover:text-red-500"
        >
          Clear completed
        </button>
      )}
    </div>
  );
};
