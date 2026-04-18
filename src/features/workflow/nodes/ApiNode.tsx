import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import type { ApiData } from '../types';

const STATUS_COLORS = {
  idle: 'border-primary-600/50 bg-[#0d1320]',
  running: 'border-primary-400 bg-[#0d1320] shadow-primary-500/20',
  success: 'border-emerald-500/70 bg-[#0d1320]',
  error: 'border-red-500/70 bg-[#0d1320]',
};

type ApiNode = Node<ApiData, 'api'>;

export const ApiNode = ({ data, selected }: NodeProps<ApiNode>) => {
  const d = data;
  const status = d.status ?? 'idle';

  return (
    <div className={`min-w-[180px] rounded-xl border-2 px-4 py-3 shadow-lg transition-all ${STATUS_COLORS[status]} ${
      selected ? 'ring-2 ring-primary-400/50' : ''
    }`}>
      <Handle type="target" position={Position.Left} className="!border-primary-500 !bg-primary-400" />
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary-500/20">
          {status === 'running' ? (
            <svg className="h-3.5 w-3.5 animate-spin text-primary-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : status === 'success' ? (
            <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : status === 'error' ? (
            <svg className="h-3.5 w-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25" />
            </svg>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary-400">API Call</p>
          <p className="truncate text-xs font-semibold text-white">{d.label || 'Chưa cấu hình'}</p>
          {d.toolName && (
            <p className="truncate font-mono text-[9px] text-slate-500">{d.toolName}</p>
          )}
        </div>
      </div>
      {status === 'error' && d.errorMsg && (
        <p className="mt-1.5 truncate text-[9px] text-red-400">{d.errorMsg}</p>
      )}
      <Handle type="source" position={Position.Right} className="!border-primary-500 !bg-primary-400" />
    </div>
  );
};
