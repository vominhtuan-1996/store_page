import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { TriggerData } from '../types';

export const TriggerNode = ({ data, selected }: NodeProps<{ data: TriggerData }>) => {
  return (
    <div className={`min-w-[140px] rounded-xl border-2 bg-[#0f1a12] px-4 py-3 shadow-lg transition-all ${
      selected ? 'border-emerald-400 shadow-emerald-500/20' : 'border-emerald-600/50'
    }`}>
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20">
          <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Trigger</p>
          <p className="text-xs font-semibold text-white">{(data as unknown as TriggerData).label}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!border-emerald-500 !bg-emerald-400" />
    </div>
  );
};
