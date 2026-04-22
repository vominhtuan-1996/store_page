import { useState, useEffect, useCallback } from 'react';
import { ToolHeader } from './ui/HubButton';
import { supabase } from '../services/supabase';
import type { Task, TaskStatus, TaskPriority, CreateTaskDto } from '../types/task.types';

interface TaskManagerProps {
  onBack: () => void;
}

const STATUS_TABS: { key: TaskStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'in_progress', label: 'Đang làm' },
  { key: 'pending', label: 'Chờ' },
  { key: 'done', label: 'Xong' },
];

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  high: 'text-red-400 bg-red-500/10',
  normal: 'text-amber-400 bg-amber-500/10',
  low: 'text-slate-400 bg-slate-500/10',
};

const PRIORITY_LABEL: Record<TaskPriority, string> = { high: 'Gấp', normal: 'Normal', low: 'Low' };

const STATUS_ICON: Record<TaskStatus, string> = {
  pending: '⏳', in_progress: '🔄', done: '✅', cancelled: '🚫',
};

const STATUS_COLOR: Record<TaskStatus, string> = {
  pending: 'text-slate-400', in_progress: 'text-blue-400', done: 'text-emerald-400', cancelled: 'text-slate-600',
};

const USER_COLORS = [
  'bg-violet-500/15 text-violet-400',
  'bg-sky-500/15 text-sky-400',
  'bg-pink-500/15 text-pink-400',
  'bg-emerald-500/15 text-emerald-400',
  'bg-amber-500/15 text-amber-400',
  'bg-orange-500/15 text-orange-400',
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'vừa xong';
  if (m < 60) return `${m}p`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function getUserColor(name: string, allUsers: string[]) {
  const idx = allUsers.indexOf(name) % USER_COLORS.length;
  return USER_COLORS[idx < 0 ? 0 : idx];
}

export const TaskManager = ({ onBack }: TaskManagerProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TaskStatus | 'all'>('all');
  const [filterUser, setFilterUser] = useState('');
  const [filterTool, setFilterTool] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateTaskDto>({ title: '', priority: 'normal', user: '', tool: '' });
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (activeTab !== 'all') query = query.eq('status', activeTab);
    else query = query.neq('status', 'cancelled');
    if (filterUser) query = query.eq('user', filterUser);
    if (filterTool) query = query.eq('tool', filterTool);
    const { data, error } = await query;
    if (!error && data) setTasks(data as Task[]);
    setLoading(false);
  }, [activeTab, filterUser, filterTool]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // Derive unique users/tools from all tasks (unfiltered)
  const allUsers = [...new Set(tasks.map(t => t.user).filter(Boolean) as string[])];
  const allTools = [...new Set(tasks.map(t => t.tool).filter(Boolean) as string[])];

  const createTask = async () => {
    if (!form.title.trim()) return;
    setCreating(true);
    await supabase.from('tasks').insert({
      title: form.title.trim(),
      description: form.description?.trim() || null,
      priority: form.priority,
      status: 'pending',
      user: form.user?.trim() || null,
      tool: form.tool?.trim() || null,
    });
    setForm({ title: '', priority: 'normal', user: '', tool: '' });
    setShowCreate(false);
    setCreating(false);
    fetchTasks();
  };

  const updateStatus = async (id: string, status: TaskStatus) => {
    setUpdatingId(id);
    await supabase.from('tasks').update({ status }).eq('id', id);
    setUpdatingId(null);
    fetchTasks();
  };

  const filteredCount = (tab: TaskStatus | 'all') =>
    tab === 'all' ? tasks.filter(t => t.status !== 'cancelled').length : tasks.filter(t => t.status === tab).length;

  return (
    <div className="flex h-full w-full flex-col">
      <ToolHeader
        title="Task Manager"
        subtitle="Powered by Supabase"
        accent="#60A5FA"
        onBack={onBack}
        action={{
          label: 'New Task',
          icon: <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
          onClick: () => setShowCreate(true),
        }}
      />
      <div className="flex flex-1 flex-col overflow-auto px-10 py-8">

      {/* Filter bar: User + Tool */}
      {(allUsers.length > 0 || allTools.length > 0) && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {/* User filter */}
          {allUsers.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">User:</span>
              <button
                onClick={() => setFilterUser('')}
                className={`rounded-lg px-2 py-0.5 text-[11px] font-medium transition-colors ${!filterUser ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Tất cả
              </button>
              {allUsers.map(u => (
                <button
                  key={u}
                  onClick={() => setFilterUser(filterUser === u ? '' : u)}
                  className={`rounded-lg px-2 py-0.5 text-[11px] font-medium transition-all ${
                    filterUser === u ? getUserColor(u, allUsers) + ' ring-1 ring-current' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          )}

          {allUsers.length > 0 && allTools.length > 0 && <div className="h-4 w-px bg-white/10" />}

          {/* Tool filter */}
          {allTools.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Tool:</span>
              <button
                onClick={() => setFilterTool('')}
                className={`rounded-lg px-2 py-0.5 text-[11px] font-medium transition-colors ${!filterTool ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Tất cả
              </button>
              {allTools.map(t => (
                <button
                  key={t}
                  onClick={() => setFilterTool(filterTool === t ? '' : t)}
                  className={`rounded-lg px-2 py-0.5 text-[11px] font-medium transition-all ${
                    filterTool === t ? 'bg-accent-cyan/15 text-accent-cyan ring-1 ring-accent-cyan/40' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="glass mb-5 rounded-2xl p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Tạo task mới</p>
          <input
            autoFocus
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && createTask()}
            placeholder="Tiêu đề task..."
            className="mb-2 w-full rounded-lg bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:ring-1 focus:ring-violet-500/50"
          />
          <textarea
            value={form.description || ''}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Mô tả (tuỳ chọn)..."
            rows={2}
            className="mb-3 w-full resize-none rounded-lg bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none focus:ring-1 focus:ring-violet-500/50"
          />

          {/* User + Tool row */}
          <div className="mb-3 grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-600">User / Người làm</label>
              <input
                value={form.user || ''}
                onChange={e => setForm(f => ({ ...f, user: e.target.value }))}
                placeholder="vd: Nam, Lan..."
                list="user-suggestions"
                className="w-full rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white placeholder-slate-600 outline-none focus:ring-1 focus:ring-violet-500/50"
              />
              <datalist id="user-suggestions">
                {allUsers.map(u => <option key={u} value={u} />)}
              </datalist>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-600">Tool / Feature</label>
              <input
                value={form.tool || ''}
                onChange={e => setForm(f => ({ ...f, tool: e.target.value }))}
                placeholder="vd: workflow, ai-agent..."
                list="tool-suggestions"
                className="w-full rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white placeholder-slate-600 outline-none focus:ring-1 focus:ring-violet-500/50"
              />
              <datalist id="tool-suggestions">
                {allTools.map(t => <option key={t} value={t} />)}
              </datalist>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {(['low', 'normal', 'high'] as TaskPriority[]).map(p => (
                <button
                  key={p}
                  onClick={() => setForm(f => ({ ...f, priority: p }))}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    form.priority === p ? PRIORITY_COLOR[p] + ' ring-1 ring-current' : 'text-slate-600 hover:text-slate-400'
                  }`}
                >
                  {PRIORITY_LABEL[p]}
                </button>
              ))}
            </div>
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => { setShowCreate(false); setForm({ title: '', priority: 'normal', user: '', tool: '' }); }}
                className="rounded-lg px-3 py-1.5 text-xs text-slate-500 hover:text-white"
              >
                Hủy
              </button>
              <button
                onClick={createTask}
                disabled={creating || !form.title.trim()}
                className="rounded-lg bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40 hover:bg-violet-400"
              >
                {creating ? 'Đang tạo...' : 'Tạo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status tabs */}
      <div className="mb-4 flex gap-1 rounded-xl bg-white/5 p-1">
        {STATUS_TABS.map(tab => {
          const count = filteredCount(tab.key);
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab.key ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === tab.key ? 'bg-white/10' : 'bg-white/5'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-sm text-slate-600">
          <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Đang tải...
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-600">Không có task nào</div>
      ) : (
        <div className="space-y-2">
          {tasks.map(task => {
            const isExpanded = expandedId === task.id;
            const isUpdating = updatingId === task.id;
            return (
              <div key={task.id} className="glass overflow-hidden rounded-xl">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : task.id)}
                  className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
                >
                  <span className="mt-0.5 text-base leading-none">{STATUS_ICON[task.status]}</span>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-medium ${
                      task.status === 'done' ? 'text-slate-500 line-through' :
                      task.status === 'cancelled' ? 'text-slate-600 line-through' : 'text-white'
                    }`}>
                      {task.title}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${PRIORITY_COLOR[task.priority]}`}>
                        {PRIORITY_LABEL[task.priority]}
                      </span>
                      <span className={`text-[11px] ${STATUS_COLOR[task.status]}`}>
                        {task.status === 'in_progress' ? 'Đang làm' : task.status === 'pending' ? 'Chờ' : task.status === 'done' ? 'Xong' : 'Đã hủy'}
                      </span>
                      {task.user && (
                        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${getUserColor(task.user, allUsers)}`}>
                          👤 {task.user}
                        </span>
                      )}
                      {task.tool && (
                        <span className="rounded-md bg-accent-cyan/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent-cyan">
                          🔧 {task.tool}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-600">{timeAgo(task.updated_at)}</span>
                    </div>
                  </div>
                  <svg
                    className={`mt-1 h-4 w-4 shrink-0 text-slate-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="border-t border-white/5 px-4 pb-4 pt-3">
                    {task.description && <p className="mb-3 text-xs text-slate-400">{task.description}</p>}
                    {task.notes && (
                      <div className="mb-3">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">Notes</p>
                        <p className="text-xs text-slate-400">{task.notes}</p>
                      </div>
                    )}
                    {task.context && (
                      <div className="mb-3">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">Context</p>
                        <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-white/5 px-3 py-2 font-mono text-[11px] text-slate-400">{task.context}</pre>
                      </div>
                    )}
                    {task.next_steps && (
                      <div className="mb-3">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">Next Steps</p>
                        <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-white/5 px-3 py-2 font-mono text-[11px] text-slate-400">{task.next_steps}</pre>
                      </div>
                    )}
                    <p className="mb-3 text-[10px] text-slate-700">
                      ID: {task.id.slice(0, 8)}... · Tạo: {new Date(task.created_at).toLocaleDateString('vi-VN')}
                    </p>
                    {task.status !== 'cancelled' && (
                      <div className="flex flex-wrap gap-2">
                        {task.status !== 'in_progress' && task.status !== 'done' && (
                          <button onClick={() => updateStatus(task.id, 'in_progress')} disabled={isUpdating}
                            className="rounded-lg bg-blue-500/15 px-3 py-1.5 text-xs font-medium text-blue-400 hover:bg-blue-500/25 disabled:opacity-40">
                            🔄 Bắt đầu
                          </button>
                        )}
                        {task.status !== 'done' && (
                          <button onClick={() => updateStatus(task.id, 'done')} disabled={isUpdating}
                            className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-40">
                            ✅ Hoàn thành
                          </button>
                        )}
                        {task.status !== 'pending' && task.status !== 'done' && (
                          <button onClick={() => updateStatus(task.id, 'pending')} disabled={isUpdating}
                            className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-white/10 disabled:opacity-40">
                            ⏳ Pending
                          </button>
                        )}
                        <button onClick={() => updateStatus(task.id, 'cancelled')} disabled={isUpdating}
                          className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-400 disabled:opacity-40">
                          Hủy
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
};
