import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import type { LogData } from '../types';

type LogNode = Node<LogData, 'log'>;

export const LogNode = ({ data, selected }: NodeProps<LogNode>) => {
  const d = data;
  const status = d.status ?? 'idle';

  return (
    <div className={`min-w-[160px] rounded-xl border-2 bg-[#111318] px-4 py-3 shadow-lg transition-all ${
      status === 'success' ? 'border-amber-500/60' : 'border-slate-700/60'
    } ${selected ? 'ring-2 ring-amber-400/40' : ''}`}>
      <Handle type="target" position={Position.Left} className="!border-slate-500 !bg-slate-400" />
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
          <svg className="h-3.5 w-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Output</p>
          <p className="text-xs font-semibold text-white">{d.label}</p>
        </div>
      </div>
      {d.output !== undefined && (
        <div className="mt-2 max-h-16 overflow-hidden rounded-lg bg-white/5 px-2 py-1.5">
          <p className="font-mono text-[9px] text-slate-400 line-clamp-3">
            {JSON.stringify(d.output, null, 2).slice(0, 200)}
          </p>
        </div>
      )}
    </div>
  );
};
