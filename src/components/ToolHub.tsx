import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIAgent } from './AIAgent';
import { TaskManager } from './TaskManager';
import { StorageManager } from './StorageManager';
import { CommandMarketplace } from './CommandMarketplace';
import { WorkflowList } from '../features/workflow/WorkflowList';
import { WorkflowBuilder } from '../features/workflow/WorkflowBuilder';
import {
  useCurrentRoute,
  useNavigate,
  useBack,
  useCanGoBack,
  type ToolId,
} from '../router';

/* ── Tool metadata ────────────────────────────────────────────────── */
const TOOLS: { id: ToolId; label: string; icon: string; accent: string; description: string }[] = [
  { id: 'workflow', label: 'Workflow Builder', icon: '⬡', accent: '#89AACC', description: 'Visual automation flow' },
  { id: 'agent',    label: 'AI Agent',         icon: '◈', accent: '#A78BFA', description: 'Chat & execute tasks'  },
  { id: 'commands', label: 'Slash Commands',   icon: '/',  accent: '#34D399', description: '35+ Claude commands'  },
  { id: 'mcp',      label: 'MCP Servers',      icon: '⬡', accent: '#F59E0B', description: '4 MCP integrations'   },
  { id: 'tasks',    label: 'Task Manager',     icon: '☑', accent: '#60A5FA', description: 'Supabase task board'  },
  { id: 'storage',  label: 'Storage',          icon: '⬢', accent: '#2DD4BF', description: 'File management'      },
];

/* ── ToolHub ──────────────────────────────────────────────────────── */
const ToolHub: React.FC = () => {
  const route    = useCurrentRoute();
  const navigate = useNavigate();
  const back     = useBack();
  const canBack  = useCanGoBack();

  const activeTool = route.page === 'tool' ? route.tool
                   : route.page === 'workflow-builder' ? 'workflow' as ToolId
                   : null;


  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#080808', fontFamily: 'Inter, sans-serif' }}>
      {/* ── Top bar ── */}
      {/* ── Nav bar ── */}
      <div
        className="flex items-center flex-shrink-0 sticky top-0 z-50"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(8,8,8,0.9)',
          backdropFilter: 'blur(16px)',
          padding: '0 40px',
          height: 64,
          gap: 50,
        }}
      >
        {/* Logo / home */}
        <button
          onClick={() => navigate({ page: 'landing' })}
          className="text-sm font-bold tracking-[0.15em] uppercase flex-shrink-0 transition-opacity hover:opacity-60"
          style={{ color: '#fff', fontFamily: 'Inter, sans-serif' }}
        >
          Archetype<sup style={{ fontSize: 8 }}>™</sup>
        </button>

        {/* Tool nav links */}
        <nav className="flex items-center" style={{ gap: 50 }}>
          {TOOLS.map(t => {
            const isActive = activeTool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => navigate({ page: 'tool', tool: t.id })}
                className="relative text-xs font-semibold uppercase tracking-widest transition-all flex-shrink-0 hidden md:block"
                style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif' }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'; }}
              >
                {t.label}
                {isActive && (
                  <span
                    className="absolute -bottom-[1px] left-0 right-0 h-px"
                    style={{ background: t.accent, boxShadow: `0 0 6px ${t.accent}` }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right — back + breadcrumb */}
        <div className="ml-auto flex items-center gap-4 flex-shrink-0">
          {route.page === 'workflow-builder' && (
            <span className="text-xs truncate max-w-[160px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {route.workflowName}
            </span>
          )}
          {canBack && (
            <button
              onClick={back}
              className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full transition-all"
              style={{
                color: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}
            >
              ← Back
            </button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={route.page === 'workflow-builder' ? `wf-${route.workflowId}` : route.page + (activeTool ?? '')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            {route.page === 'hub'              && <HubGrid />}
            {route.page === 'tool'             && <ToolRenderer toolId={route.tool} />}
            {route.page === 'workflow-builder' && (
              <WorkflowBuilder
                onBack={() => navigate({ page: 'tool', tool: 'workflow' })}
                workflowId={route.workflowId}
                workflowName={route.workflowName}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ── Hub grid — tool picker ───────────────────────────────────────── */
const HubGrid: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex items-center justify-center" style={{ padding: '64px 40px' }}>
      <div className="w-full max-w-5xl">

        {/* Header */}
        <div className="mb-16" style={{ paddingBottom: 50, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <p
            className="text-xs font-bold uppercase mb-5"
            style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.4em', fontFamily: 'Inter, sans-serif' }}
          >
            Developer Toolkit
          </p>
          <div className="flex items-end justify-between gap-8">
            <h1
              className="text-5xl md:text-6xl text-white leading-tight"
              style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic' }}
            >
              Choose your tool
            </h1>
            <p
              className="text-sm mb-2 max-w-xs text-right"
              style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif', lineHeight: 1.7 }}
            >
              Tất cả tools trong một hub.<br />Click để mở trực tiếp.
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: 20 }}>
          {TOOLS.map((tool, i) => (
            <motion.button
              key={tool.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              onClick={() => navigate({ page: 'tool', tool: tool.id })}
              className="group relative rounded-2xl text-left flex flex-col"
              style={{
                padding: '28px 32px',
                gap: 28,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
              whileHover={{ background: 'rgba(255,255,255,0.055)', borderColor: `${tool.accent}30`, y: -5,
                transition: { duration: 0.2 } } as never}
              whileTap={{ scale: 0.98 } as never}
            >
              {/* Glow */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                style={{ background: `radial-gradient(circle at 30% 0%, ${tool.accent}0a, transparent 65%)` }} />

              {/* Icon row */}
              <div className="flex items-center justify-between">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${tool.accent}12`, border: `1px solid ${tool.accent}25` }}
                >
                  <span style={{ color: tool.accent, fontSize: 20 }}>{tool.icon}</span>
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ color: tool.accent, fontFamily: 'Inter, sans-serif' }}
                >
                  Open →
                </span>
              </div>

              {/* Label */}
              <div>
                <div
                  className="font-semibold text-white mb-2"
                  style={{ fontSize: 15, fontFamily: 'Inter, sans-serif' }}
                >
                  {tool.label}
                </div>
                <div
                  className="text-xs leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif' }}
                >
                  {tool.description}
                </div>
              </div>

              {/* Bottom accent line */}
              <div
                className="absolute bottom-0 left-8 right-8 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${tool.accent}50, transparent)` }}
              />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Tool renderer ────────────────────────────────────────────────── */
const ToolRenderer: React.FC<{ toolId: ToolId }> = ({ toolId }) => {
  const navigate = useNavigate();
  const back     = useBack();

  if (toolId === 'workflow') {
    return (
      <WorkflowList
        onBack={back}
        onOpen={wf  => navigate({ page: 'workflow-builder', workflowId: wf.id, workflowName: wf.name })}
        onNew={wf   => navigate({ page: 'workflow-builder', workflowId: wf.id, workflowName: wf.name })}
      />
    );
  }

  switch (toolId) {
    case 'agent':    return <AIAgent    onBack={back} />;
    case 'commands': return <CommandMarketplace onBack={back} />;
    case 'mcp':      return <CommandMarketplace onBack={back} />;
    case 'tasks':    return <TaskManager   onBack={back} />;
    case 'storage':  return <StorageManager onBack={back} />;
  }
};

export default ToolHub;
// Re-export ToolId so FeaturesSection can import from here if needed
export type { ToolId };
