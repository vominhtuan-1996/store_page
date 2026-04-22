import React, { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import type { ToolId } from '../router';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: i * 0.12 },
  }),
};

/* ── Shared helpers ───────────────────────────────────────────────── */
const ActionBtn: React.FC<{
  label: string;
  onClick: () => void;
  accent?: string;
  variant?: 'primary' | 'ghost';
  flash?: string | null;
  disabled?: boolean;
}> = ({ label, onClick, accent = '#fff', variant = 'ghost', flash, disabled }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    disabled={disabled}
    className="text-[10px] font-bold tracking-wide px-3 py-1.5 rounded-lg transition-all flex-1"
    style={{
      fontFamily: 'Inter, sans-serif',
      cursor: disabled ? 'not-allowed' : 'pointer',
      ...(variant === 'primary'
        ? { background: `${accent}18`, border: `1px solid ${accent}40`, color: flash ? '#34D399' : accent }
        : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: flash ? '#34D399' : 'rgba(255,255,255,0.45)' }),
    }}
  >
    {flash ?? label}
  </motion.button>
);

/* ── Workflow Builder ─────────────────────────────────────────────── */
const WorkflowPreview: React.FC = () => {
  const [nodes, setNodes] = useState(['Login', 'Get List', 'Filter', 'Log']);
  const [active, setActive] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState<number[]>([]);
  const [flash, setFlash] = useState<string | null>(null);

  const doFlash = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(null), 1500); };

  const run = () => {
    if (running) return;
    setRunning(true); setDone([]); setActive(0);
    nodes.forEach((_, i) => {
      setTimeout(() => {
        setActive(i);
        setDone(prev => [...prev, i - 1].filter(x => x >= 0));
        if (i === nodes.length - 1) setTimeout(() => { setDone(nodes.map((_, k) => k)); setActive(null); setRunning(false); }, 400);
      }, i * 550);
    });
  };

  const addNode = () => {
    const labels = ['Validate', 'Transform', 'Notify', 'Save', 'Retry'];
    const next = labels.find(l => !nodes.includes(l));
    if (!next) return doFlash('Max nodes!');
    setNodes(prev => [...prev.slice(0, -1), next, prev[prev.length - 1]]);
    setDone([]); setActive(null);
    doFlash('Node added');
  };

  const reset = () => { setNodes(['Login', 'Get List', 'Filter', 'Log']); setDone([]); setActive(null); doFlash('Reset'); };

  return (
    <div className="flex flex-col gap-5">
      {/* Flow diagram */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        {nodes.map((label, i) => (
          <React.Fragment key={label + i}>
            <motion.div
              animate={{
                scale: active === i ? 1.08 : 1,
                borderColor: done.includes(i) ? '#34D399' : active === i ? '#89AACC' : 'rgba(137,170,204,0.2)',
                background: done.includes(i) ? 'rgba(52,211,153,0.1)' : active === i ? 'rgba(137,170,204,0.14)' : 'rgba(137,170,204,0.04)',
              }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center gap-1.5 rounded-xl border px-3 py-2.5 min-w-[52px]"
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{
                background: done.includes(i) ? '#34D399' : active === i ? '#89AACC' : 'rgba(255,255,255,0.2)',
                boxShadow: active === i ? '0 0 6px #89AACC' : 'none',
              }} />
              <span className="text-[9px] font-bold uppercase" style={{
                color: done.includes(i) ? '#34D399' : active === i ? '#89AACC' : 'rgba(255,255,255,0.35)',
                fontFamily: 'Inter',
              }}>{label}</span>
            </motion.div>
            {i < nodes.length - 1 && (
              <motion.div className="h-px w-3 flex-shrink-0"
                animate={{ background: done.includes(i) ? '#34D399' : 'rgba(137,170,204,0.2)' }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <ActionBtn label={running ? 'Running…' : done.length > 0 ? '↺ Run Again' : '▶ Run Flow'}
          onClick={run} accent="#89AACC" variant="primary" disabled={running} flash={running ? 'Running…' : null} />
        <ActionBtn label="＋ Node" onClick={addNode} flash={flash === 'Node added' ? '✓ Added' : flash === 'Max nodes!' ? 'Max!' : null} />
        <ActionBtn label="↺ Reset" onClick={reset} flash={flash === 'Reset' ? '✓ Reset' : null} />
      </div>
    </div>
  );
};

/* ── AI Agent ─────────────────────────────────────────────────────── */
const AIAgentPreview: React.FC = () => {
  const SUGGESTIONS = ['Lấy danh sách phiếu', 'Tạo task mới', 'Upload ảnh storage'];
  const RESPONSES: Record<string, string> = {
    'Lấy danh sách phiếu': '→ call_api("managerticket") — 24 records found',
    'Tạo task mới':         '→ create_task(priority:"normal") — Task #a3f2 created',
    'Upload ảnh storage':   '→ storage_upload(file) — img_20260421.jpg done',
  };
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [thinking, setThinking] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const send = (text: string) => {
    if (thinking) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setThinking(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: RESPONSES[text] ?? '→ Processing…' }]);
      setThinking(false);
    }, 900);
  };

  const clearChat = () => { setMessages([]); setFlash('Cleared'); setTimeout(() => setFlash(null), 1200); };
  const copyLast = () => {
    const last = messages.filter(m => m.role === 'ai').pop();
    if (!last) return;
    navigator.clipboard.writeText(last.text);
    setFlash('Copied!'); setTimeout(() => setFlash(null), 1200);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Chat window */}
      <div className="rounded-xl p-3 min-h-[80px] space-y-2" style={{ background: 'rgba(0,0,0,0.3)' }}>
        <AnimatePresence>
          {messages.slice(-4).map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${m.role === 'ai' ? 'pl-2' : ''}`}>
              <span className="text-[9px] font-bold shrink-0" style={{ color: m.role === 'ai' ? '#A78BFA' : 'rgba(255,255,255,0.3)' }}>
                {m.role === 'ai' ? 'AI' : 'U'}
              </span>
              <span className="text-[10px] font-mono leading-relaxed" style={{ color: m.role === 'ai' ? '#A78BFA' : 'rgba(255,255,255,0.6)' }}>
                {m.text}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        {thinking && (
          <div className="flex gap-1 pl-6">
            {[0,1,2].map(i => (
              <motion.div key={i} className="w-1 h-1 rounded-full" style={{ background: '#A78BFA' }}
                animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }} />
            ))}
          </div>
        )}
        {messages.length === 0 && !thinking && (
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'Inter' }}>Chọn lệnh bên dưới…</p>
        )}
      </div>

      {/* Suggestions */}
      <div className="flex flex-col gap-1.5">
        {SUGGESTIONS.map(s => (
          <button key={s} onClick={() => send(s)} disabled={thinking}
            className="text-left text-[10px] px-3 py-2 rounded-lg transition-all"
            style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)',
              color: 'rgba(255,255,255,0.5)', cursor: thinking ? 'not-allowed' : 'pointer', fontFamily: 'Inter' }}>
            {s}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <ActionBtn label="Clear Chat" onClick={clearChat} flash={flash === 'Cleared' ? '✓ Cleared' : null} />
        <ActionBtn label="Copy Last" onClick={copyLast} flash={flash === 'Copied!' ? '✓ Copied' : null}
          accent="#A78BFA" variant={messages.some(m => m.role === 'ai') ? 'primary' : 'ghost'}
          disabled={!messages.some(m => m.role === 'ai')} />
      </div>
    </div>
  );
};

/* ── Slash Commands ───────────────────────────────────────────────── */
const SlashCommandsPreview: React.FC = () => {
  const CMDS = ['/task-create', '/setup-flutter', '/setup-dotnet', '/figma-nodes', '/create-feature', '/deploy-ghpages'];
  const [active, setActive] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [flash, setFlash] = useState<string | null>(null);

  const install = (cmd: string) => {
    if (active || done.includes(cmd)) return;
    setActive(cmd);
    setTimeout(() => { setDone(prev => [...prev, cmd]); setActive(null); }, 1100);
  };

  const installAll = () => {
    const remaining = CMDS.filter(c => !done.includes(c));
    if (!remaining.length) return;
    let delay = 0;
    remaining.forEach(cmd => {
      setTimeout(() => { setActive(cmd); }, delay);
      delay += 700;
      setTimeout(() => { setDone(prev => [...prev, cmd]); setActive(null); }, delay);
      delay += 200;
    });
    setTimeout(() => { setFlash('All installed!'); setTimeout(() => setFlash(null), 1500); }, delay);
  };

  const reset = () => { setDone([]); setActive(null); setFlash('Reset'); setTimeout(() => setFlash(null), 1200); };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {CMDS.map(cmd => (
          <motion.button key={cmd} onClick={() => install(cmd)} whileTap={{ scale: 0.95 }}
            className="px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all"
            style={{
              background: done.includes(cmd) ? 'rgba(52,211,153,0.12)' : active === cmd ? 'rgba(52,211,153,0.08)' : 'rgba(52,211,153,0.05)',
              border: `1px solid ${done.includes(cmd) ? 'rgba(52,211,153,0.4)' : active === cmd ? 'rgba(52,211,153,0.3)' : 'rgba(52,211,153,0.15)'}`,
              color: done.includes(cmd) ? '#34D399' : active === cmd ? '#34D399' : 'rgba(255,255,255,0.4)',
              cursor: done.includes(cmd) ? 'default' : 'pointer',
            }}>
            {active === cmd ? '⟳' : done.includes(cmd) ? '✓ ' : ''}{cmd}
          </motion.button>
        ))}
      </div>
      <div className="flex gap-2">
        <ActionBtn label="Install All" onClick={installAll} accent="#34D399" variant="primary"
          flash={flash === 'All installed!' ? '✓ All Done' : null}
          disabled={done.length === CMDS.length || !!active} />
        <ActionBtn label="↺ Reset" onClick={reset} flash={flash === 'Reset' ? '✓ Reset' : null} />
        <ActionBtn label={`${done.length}/${CMDS.length} done`} onClick={() => {}} disabled />
      </div>
    </div>
  );
};

/* ── MCP Servers ──────────────────────────────────────────────────── */
const MCPPreview: React.FC = () => {
  const MCPS = [
    { name: 'task-mcp',     tools: 7, color: '#A78BFA' },
    { name: 'telegram-mcp', tools: 2, color: '#38BDF8' },
    { name: 'figma-mcp',    tools: 6, color: '#F472B6' },
    { name: 'doc-reader',   tools: 2, color: '#F59E0B' },
  ];
  const [installed, setInstalled] = useState<string[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const toggle = (name: string) => {
    if (loading) return;
    if (installed.includes(name)) { setInstalled(prev => prev.filter(n => n !== name)); return; }
    setLoading(name);
    setTimeout(() => { setInstalled(prev => [...prev, name]); setLoading(null); }, 1000);
  };

  const installAll = () => {
    const remaining = MCPS.filter(m => !installed.includes(m.name));
    let delay = 0;
    remaining.forEach(m => {
      setTimeout(() => setLoading(m.name), delay);
      delay += 800;
      setTimeout(() => { setInstalled(prev => [...prev, m.name]); setLoading(null); }, delay);
    });
    setTimeout(() => { setFlash('All ready!'); setTimeout(() => setFlash(null), 1500); }, delay + 100);
  };

  const uninstallAll = () => { setInstalled([]); setFlash('Cleared'); setTimeout(() => setFlash(null), 1200); };

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2.5">
        {MCPS.map(m => (
          <div key={m.name} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{
                background: m.color,
                boxShadow: installed.includes(m.name) ? `0 0 6px ${m.color}` : 'none',
              }} />
              <span className="text-[11px] font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>{m.name}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                style={{ background: `${m.color}18`, color: m.color }}>{m.tools} tools</span>
            </div>
            <button onClick={() => toggle(m.name)}
              className="text-[9px] font-bold px-3 py-1 rounded-full transition-all"
              style={{
                minWidth: 60, textAlign: 'center',
                background: installed.includes(m.name) ? 'rgba(52,211,153,0.1)' : `${m.color}10`,
                border: `1px solid ${installed.includes(m.name) ? 'rgba(52,211,153,0.3)' : `${m.color}25`}`,
                color: installed.includes(m.name) ? '#34D399' : m.color,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}>
              {loading === m.name ? '…' : installed.includes(m.name) ? '✓ On' : 'Install'}
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <ActionBtn label="Install All" onClick={installAll} accent="#F59E0B" variant="primary"
          flash={flash === 'All ready!' ? '✓ All Ready' : null}
          disabled={installed.length === MCPS.length || !!loading} />
        <ActionBtn label="Uninstall All" onClick={uninstallAll}
          flash={flash === 'Cleared' ? '✓ Cleared' : null}
          disabled={!installed.length || !!loading} />
        <ActionBtn label={`${installed.length}/${MCPS.length} on`} onClick={() => {}} disabled />
      </div>
    </div>
  );
};

/* ── Task Manager ─────────────────────────────────────────────────── */
const TaskPreview: React.FC = () => {
  const STATUSES = ['pending', 'in_progress', 'done'] as const;
  type Status = typeof STATUSES[number];
  const DEFAULT = [
    { title: 'Fix TS build error',      status: 'done'        as Status, tool: 'deploy'  },
    { title: 'Setup Flutter command',   status: 'done'        as Status, tool: 'command' },
    { title: 'Build landing features',  status: 'in_progress' as Status, tool: 'ui'      },
  ];
  const [tasks, setTasks] = useState(DEFAULT);
  const [flash, setFlash] = useState<string | null>(null);
  const [input, setInput] = useState('');

  const COLOR: Record<Status, string> = { done: '#34D399', in_progress: '#60A5FA', pending: 'rgba(255,255,255,0.25)' };
  const LABEL: Record<Status, string> = { done: '✓ done', in_progress: '● active', pending: '○ pending' };

  const cycle = (i: number) =>
    setTasks(prev => prev.map((t, idx) => idx !== i ? t : { ...t, status: STATUSES[(STATUSES.indexOf(t.status) + 1) % 3] }));

  const addTask = () => {
    const title = input.trim() || `New task #${tasks.length + 1}`;
    setTasks(prev => [...prev, { title, status: 'pending', tool: 'ui' }]);
    setInput('');
    setFlash('Task added'); setTimeout(() => setFlash(null), 1200);
  };

  const clearDone = () => {
    setTasks(prev => prev.filter(t => t.status !== 'done'));
    setFlash('Cleared'); setTimeout(() => setFlash(null), 1200);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Task list */}
      <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
        <AnimatePresence>
          {tasks.map((t, i) => (
            <motion.div key={t.title + i} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
              onClick={() => cycle(i)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              whileHover={{ background: 'rgba(255,255,255,0.06)' } as never}
              whileTap={{ scale: 0.98 } as never}>
              <motion.div className="w-2 h-2 rounded-full flex-shrink-0"
                animate={{ background: COLOR[t.status], boxShadow: t.status === 'in_progress' ? '0 0 6px #60A5FA' : 'none' }} />
              <span className="text-[11px] flex-1 truncate" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter' }}>{t.title}</span>
              <motion.span className="text-[9px] font-mono px-2 py-0.5 rounded-full shrink-0"
                animate={{ color: COLOR[t.status], background: `${COLOR[t.status]}18` }} transition={{ duration: 0.2 }}>
                {LABEL[t.status]}
              </motion.span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Inline add */}
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          placeholder="New task title…"
          className="flex-1 text-[10px] px-3 py-2 rounded-lg outline-none"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter', caretColor: '#60A5FA' }} />
        <ActionBtn label="＋ Add" onClick={addTask} accent="#60A5FA" variant="primary"
          flash={flash === 'Task added' ? '✓' : null} />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <ActionBtn label="Clear Done" onClick={clearDone}
          flash={flash === 'Cleared' ? '✓ Cleared' : null}
          disabled={!tasks.some(t => t.status === 'done')} />
        <ActionBtn label={`${tasks.filter(t=>t.status==='done').length} done · ${tasks.filter(t=>t.status==='in_progress').length} active`}
          onClick={() => {}} disabled />
      </div>
    </div>
  );
};

/* ── Supabase Storage ─────────────────────────────────────────────── */
const StoragePreview: React.FC = () => {
  const DEFAULT_FILES = [
    { name: 'img_001.jpg', size: '2.4 MB', type: 'image' },
    { name: 'report.pdf',  size: '1.1 MB', type: 'pdf'   },
    { name: 'banner.png',  size: '3.8 MB', type: 'image' },
  ];
  const [files, setFiles] = useState(DEFAULT_FILES);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [uploaded, setUploaded] = useState<string[]>([]);
  const [flash, setFlash] = useState<string | null>(null);

  const upload = (name: string) => {
    if (progress[name] !== undefined || uploaded.includes(name)) return;
    setProgress(prev => ({ ...prev, [name]: 0 }));
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 30 + 10;
      if (p >= 100) {
        clearInterval(iv);
        setTimeout(() => {
          setUploaded(prev => [...prev, name]);
          setProgress(prev => { const n = { ...prev }; delete n[name]; return n; });
        }, 200);
        p = 100;
      }
      setProgress(prev => ({ ...prev, [name]: Math.min(p, 100) }));
    }, 120);
  };

  const uploadAll = () => files.forEach(f => upload(f.name));

  const clearUploaded = () => {
    setUploaded([]); setProgress({});
    setFlash('Cleared'); setTimeout(() => setFlash(null), 1200);
  };

  const addFile = () => {
    const names = ['avatar.jpg', 'doc_final.pdf', 'logo.svg', 'data.csv'];
    const next = names.find(n => !files.find(f => f.name === n));
    if (!next) return;
    setFiles(prev => [...prev, { name: next, size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`, type: 'image' }]);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="space-y-1.5">
        <AnimatePresence>
          {files.map(f => (
            <motion.div key={f.name} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-1">
              <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all"
                style={{ background: 'rgba(45,212,191,0.04)', border: '1px solid rgba(45,212,191,0.12)' }}
                onClick={() => upload(f.name)}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px]"
                  style={{ background: 'rgba(45,212,191,0.1)' }}>
                  {f.type === 'image' ? '🖼' : f.type === 'pdf' ? '📄' : '📁'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-mono truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>{f.name}</div>
                  <div className="text-[9px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{f.size}</div>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{
                  background: uploaded.includes(f.name) ? 'rgba(52,211,153,0.1)' : 'rgba(45,212,191,0.08)',
                  color: uploaded.includes(f.name) ? '#34D399' : progress[f.name] !== undefined ? '#2DD4BF' : 'rgba(45,212,191,0.6)',
                  border: `1px solid ${uploaded.includes(f.name) ? 'rgba(52,211,153,0.25)' : 'rgba(45,212,191,0.15)'}`,
                }}>
                  {uploaded.includes(f.name) ? '✓ Done' : progress[f.name] !== undefined ? `${Math.round(progress[f.name])}%` : 'Upload'}
                </span>
              </div>
              {progress[f.name] !== undefined && (
                <motion.div className="h-0.5 rounded-full overflow-hidden mx-3" style={{ background: 'rgba(45,212,191,0.1)' }}>
                  <motion.div className="h-full rounded-full" style={{ background: '#2DD4BF' }}
                    animate={{ width: `${progress[f.name]}%` }} transition={{ duration: 0.1 }} />
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex gap-2">
        <ActionBtn label="Upload All" onClick={uploadAll} accent="#2DD4BF" variant="primary"
          disabled={uploaded.length === files.length}
          flash={uploaded.length === files.length ? '✓ All Done' : null} />
        <ActionBtn label="＋ File" onClick={addFile} />
        <ActionBtn label="Clear" onClick={clearUploaded}
          flash={flash === 'Cleared' ? '✓ Cleared' : null}
          disabled={!uploaded.length} />
      </div>
    </div>
  );
};

/* ── Tool definitions ─────────────────────────────────────────────── */
const TOOLS: { tag: string; title: string; accent: string; description: string; toolId: ToolId; preview: React.ReactNode }[] = [
  { tag: 'Automation', title: 'Workflow Builder', accent: '#89AACC', toolId: 'workflow',
    description: 'Kéo thả API nodes, kết nối logic — automation flow trực quan. Token login tự động lưu, response chuyền qua từng bước.',
    preview: <WorkflowPreview /> },
  { tag: 'Intelligence', title: 'AI Agent', accent: '#A78BFA', toolId: 'agent',
    description: 'Giao tiếp bằng tiếng Việt — Agent tự gọi đúng API, chạy workflow đã lưu, quản lý tasks. Powered by Groq llama-3.1.',
    preview: <AIAgentPreview /> },
  { tag: 'Commands', title: 'Slash Commands', accent: '#34D399', toolId: 'commands',
    description: '35+ Claude Code slash commands — từ task management, code generation, Figma, đến deploy. Install một lệnh curl.',
    preview: <SlashCommandsPreview /> },
  { tag: 'Integration', title: 'MCP Servers', accent: '#F59E0B', toolId: 'mcp',
    description: '4 MCP servers sẵn sàng cài đặt — task-mcp, doc-reader, telegram-mcp, figma-mcp. Bash & PowerShell installer.',
    preview: <MCPPreview /> },
  { tag: 'Productivity', title: 'Task Manager', accent: '#60A5FA', toolId: 'tasks',
    description: 'Supabase-backed task tracking với auto context save. Agent tự tạo task, lưu progress, resume sau mỗi session.',
    preview: <TaskPreview /> },
  { tag: 'Storage', title: 'Supabase Storage', accent: '#2DD4BF', toolId: 'storage',
    description: 'Upload, preview và quản lý files qua Supabase Storage. Tích hợp trực tiếp với PMS image API.',
    preview: <StoragePreview /> },
];

/* ── Install commands ─────────────────────────────────────────────── */
const INSTALL_CMDS = [
  { label: 'Commands (bash)',       cmd: 'curl -fsSL ".../install.sh" | bash' },
  { label: 'MCP Servers (bash)',    cmd: 'curl -fsSL ".../install-mcp.sh" | bash -s -- task-mcp' },
  { label: 'Windows (PowerShell)', cmd: 'irm ".../install.ps1" | iex' },
];

/* ── Main Section ─────────────────────────────────────────────────── */
interface FeaturesSectionProps { onOpenTool: (id: ToolId) => void; }

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onOpenTool }) => {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-80px' });

  return (
    <section id="features" className="relative overflow-hidden"
      style={{ background: 'hsl(0 0% 3%)', padding: '8rem 0 10rem' }}>
      <div className="pointer-events-none absolute inset-0">
        {/* Ambient glows */}
        <div className="absolute left-1/4 top-1/4 h-[600px] w-[600px] -translate-x-1/2 rounded-full opacity-10 blur-[120px]"
          style={{ background: 'radial-gradient(circle, #89AACC 0%, transparent 70%)' }} />
        <div className="absolute right-1/4 bottom-1/4 h-[500px] w-[500px] translate-x-1/2 rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, #A78BFA 0%, transparent 70%)', opacity: 0.08 }} />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32"
          style={{ background: 'linear-gradient(to bottom, transparent, #000)' }} />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16">
        {/* Header */}
        <div ref={headerRef} className="mb-24 text-center">
          <motion.p initial={{ opacity: 0, y: 16 }} animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-[10px] font-bold tracking-[0.5em] uppercase mb-6"
            style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'Inter, sans-serif' }}>
            Developer Toolkit • Claude Code
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 30 }} animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl text-white mb-8 leading-tight"
            style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic' }}>
            Tools that{' '}<span style={{ color: 'rgba(255,255,255,0.3)' }}>think with</span> you
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.25 }}
            className="text-sm md:text-base max-w-xl leading-relaxed mx-auto"
            style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>
            Một hệ sinh thái công cụ cho Claude Code — từ slash commands, MCP servers, đến visual workflow và AI agent thao tác PMS.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-28">
          {TOOLS.map((tool, i) => <ToolCard key={tool.title} tool={tool} index={i} onOpen={() => onOpenTool(tool.toolId)} />)}
        </div>

        <div className="w-full h-px mb-20" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <InstallSection />
      </div>
    </section>
  );
};

/* ── Tool Card ────────────────────────────────────────────────────── */
interface Tool { tag: string; title: string; description: string; accent: string; toolId: ToolId; preview: React.ReactNode; }

const ToolCard: React.FC<{ tool: Tool; index: number; onOpen: () => void }> = ({ tool, index, onOpen }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div ref={ref} custom={index % 3} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
      className="group relative rounded-3xl overflow-hidden flex flex-col"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      whileHover={{ background: 'rgba(255,255,255,0.06)', borderColor: `${tool.accent}35`, y: -6,
        transition: { duration: 0.3 } }}>
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
        style={{ background: `radial-gradient(circle at 50% 0%, ${tool.accent}10 0%, transparent 55%)` }} />

      {/* Metadata */}
      <div className="px-8 pt-8 pb-6 text-center flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
            style={{ background: tool.accent, boxShadow: `0 0 8px ${tool.accent}` }} />
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase"
            style={{ color: tool.accent, fontFamily: 'Inter, sans-serif' }}>{tool.tag}</span>
        </div>
        <h3 className="text-2xl md:text-3xl text-white leading-tight"
          style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic' }}>{tool.title}</h3>
        <p className="text-xs md:text-sm leading-relaxed max-w-xs"
          style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif' }}>{tool.description}</p>
      </div>

      <div className="mx-8 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* Interactive preview + actions */}
      <div className="px-8 py-6 flex-1 flex flex-col gap-5" style={{ background: 'rgba(0,0,0,0.18)' }}>
        {tool.preview}

        {/* Open tool CTA */}
        <button
          onClick={onOpen}
          className="w-full mt-auto flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all"
          style={{
            border: `1px solid ${tool.accent}30`,
            color: tool.accent,
            background: `${tool.accent}08`,
            fontFamily: 'Inter, sans-serif',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${tool.accent}18`; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${tool.accent}08`; }}
        >
          <span>Open {tool.title}</span>
          <span>→</span>
        </button>
      </div>
    </motion.div>
  );
};

/* ── Install Section ──────────────────────────────────────────────── */
const InstallSection: React.FC = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text); setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div ref={ref}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-10 max-w-2xl mx-auto w-full">
        <div className="text-center">
          <p className="text-[10px] font-bold tracking-[0.5em] uppercase mb-6"
            style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'Inter, sans-serif' }}>One-liner Install</p>
          <h3 className="text-4xl md:text-5xl text-white mb-6 leading-tight"
            style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic' }}>
            Setup trong{' '}<span style={{ color: 'rgba(255,255,255,0.3)' }}>30 giây</span>
          </h3>
          <p className="text-sm leading-relaxed max-w-md mx-auto"
            style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif' }}>
            Bash hoặc PowerShell. Auto-detect project vs global. Cài commands, MCP servers trong một lệnh.
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden w-full"
          style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2 px-5 py-3.5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
            <span className="ml-2 text-[10px] text-white/20 font-mono">terminal</span>
          </div>
          <div className="p-6 space-y-4">
            {INSTALL_CMDS.map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, x: -16 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}>
                <p className="text-[9px] font-bold tracking-widest uppercase mb-2"
                  style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'Inter' }}>{item.label}</p>
                <div className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                  onClick={() => copy(item.cmd, item.label)}>
                  <span className="text-[11px] font-mono flex-1 break-all leading-relaxed" style={{ color: '#89AACC' }}>
                    $ {item.cmd}
                  </span>
                  <button className="shrink-0 text-[9px] font-bold px-2.5 py-1 rounded-lg transition-all" style={{
                    color: copied === item.label ? '#34D399' : 'rgba(255,255,255,0.25)',
                    background: copied === item.label ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${copied === item.label ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  }}>
                    {copied === item.label ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FeaturesSection;
