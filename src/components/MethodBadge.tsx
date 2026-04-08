const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  POST: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  PUT: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  PATCH: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  DELETE: 'bg-red-500/15 text-red-400 border-red-500/20',
};

interface MethodBadgeProps {
  method: string;
}

export const MethodBadge = ({ method }: MethodBadgeProps) => {
  const colors = METHOD_COLORS[method] || 'bg-slate-500/15 text-slate-400 border-slate-500/20';
  return (
    <span className={`inline-block rounded-md border px-2 py-0.5 text-xs font-bold tracking-wide ${colors}`}>
      {method}
    </span>
  );
};
