import { useTodos } from './hooks/useTodos';
import { TodoInput } from './components/TodoInput';
import { TodoItem } from './components/TodoItem';
import { TodoFilter } from './components/TodoFilter';

function App() {
  const {
    todos,
    filter,
    setFilter,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    clearCompleted,
    activeCount,
    completedCount,
    totalCount,
  } = useTodos();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-900">
      <div className="mx-auto w-full max-w-lg">
        <h1 className="mb-8 text-center text-4xl font-bold text-gray-800 dark:text-white">
          Todo List
        </h1>

        <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <TodoInput onAdd={addTodo} />

          {totalCount > 0 && (
            <>
              <ul className="mt-6 space-y-2">
                {todos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                    onEdit={editTodo}
                  />
                ))}
              </ul>

              {todos.length === 0 && (
                <p className="mt-6 text-center text-gray-400">
                  No {filter} todos
                </p>
              )}

              <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
                <TodoFilter
                  filter={filter}
                  onFilterChange={setFilter}
                  activeCount={activeCount}
                  completedCount={completedCount}
                  onClearCompleted={clearCompleted}
                />
              </div>
            </>
          )}

          {totalCount === 0 && (
            <p className="mt-6 text-center text-gray-400 dark:text-gray-500">
              No todos yet. Add one above!
            </p>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          Double-click a todo to edit it
        </p>
      </div>
    </div>
  );
}

export default App;
