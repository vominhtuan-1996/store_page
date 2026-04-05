import { useState } from 'react';

interface TodoInputProps {
  onAdd: (text: string) => void;
}

export const TodoInput = ({ onAdd }: TodoInputProps) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What needs to be done?"
        className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-base outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-800"
        autoFocus
      />
      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50"
        disabled={!text.trim()}
      >
        Add
      </button>
    </form>
  );
};
