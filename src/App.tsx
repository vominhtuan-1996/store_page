import { useState } from 'react';
import { APP_LIST } from './constants/apps';
import { AppCard } from './components/AppCard';
import { AppDetail } from './components/AppDetail';
import { ApiExplorer } from './components/ApiExplorer';
import { ClipboardSync } from './components/ClipboardSync';
import { DocReader } from './components/DocReader';
import { TelegramSender } from './components/TelegramSender';
import { McpDocReaderInstall } from './components/McpDocReaderInstall';
import { TaskManager } from './components/TaskManager';
import { TaskMcpInstall } from './components/TaskMcpInstall';
import { TelegramMcpInstall } from './components/TelegramMcpInstall';
import { FigmaMcpInstall } from './components/FigmaMcpInstall';
import { AIAgent } from './components/AIAgent';
import { StorageManager } from './components/StorageManager';
import { CommandMarketplace } from './components/CommandMarketplace';
import { WorkflowBuilder } from './features/workflow/WorkflowBuilder';
import { WorkflowList } from './features/workflow/WorkflowList';
import type { WorkflowRecord } from './features/workflow/workflowService';
import type { AppInfo } from './types/app';

type Page = 'home' | 'api-explorer' | 'clipboard-sync' | 'doc-reader' | 'telegram' | 'mcp-install' | 'tasks' | 'task-mcp-install' | 'telegram-mcp-install' | 'figma-mcp-install' | 'storage-manager' | 'ai-agent' | 'workflow' | 'command-marketplace';

function App() {
  const [selectedApp, setSelectedApp] = useState<AppInfo | null>(null);
  const [page, setPage] = useState<Page>('home');
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowRecord | null>(null);

  if (page === 'workflow' && activeWorkflow) {
    return (
      <WorkflowBuilder
        workflowId={activeWorkflow.id}
        workflowName={activeWorkflow.name}
        onBack={() => setActiveWorkflow(null)}
      />
    );
  }

  if (page === 'workflow') {
    return (
      <div className="ambient-glow relative flex min-h-screen flex-col">
        <main className="relative z-10 flex flex-1 flex-col items-center px-5 py-12 sm:px-6 sm:py-16">
          <div className="w-full max-w-2xl">
            <WorkflowList
              onBack={() => setPage('home')}
              onOpen={wf => setActiveWorkflow(wf)}
              onNew={wf => setActiveWorkflow(wf)}
            />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="ambient-glow relative flex min-h-screen flex-col">
      {/* Main content */}
      <main className="relative z-10 flex flex-1 flex-col items-center px-5 py-12 sm:px-6 sm:py-16">
        <div className="w-full max-w-2xl">
          {page === 'doc-reader' ? (
            <DocReader onBack={() => setPage('home')} />
          ) : page === 'clipboard-sync' ? (
            <ClipboardSync onBack={() => setPage('home')} />
          ) : page === 'api-explorer' ? (
            <ApiExplorer onBack={() => setPage('home')} />
          ) : page === 'telegram' ? (
            <TelegramSender onBack={() => setPage('home')} />
          ) : page === 'mcp-install' ? (
            <McpDocReaderInstall onBack={() => setPage('home')} />
          ) : page === 'task-mcp-install' ? (
            <TaskMcpInstall onBack={() => setPage('home')} />
          ) : page === 'telegram-mcp-install' ? (
            <TelegramMcpInstall onBack={() => setPage('home')} />
          ) : page === 'figma-mcp-install' ? (
            <FigmaMcpInstall onBack={() => setPage('home')} />
          ) : page === 'tasks' ? (
            <TaskManager onBack={() => setPage('home')} />
          ) : page === 'storage-manager' ? (
            <StorageManager onBack={() => setPage('home')} />
          ) : page === 'ai-agent' ? (
            <AIAgent onBack={() => setPage('home')} />
          ) : page === 'command-marketplace' ? (
            <CommandMarketplace onBack={() => setPage('home')} />
          ) : !selectedApp ? (
            <>
              {/* Hero header */}
              <header className="mb-12 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[18px] bg-gradient-to-br from-primary-500 to-accent-violet shadow-lg shadow-primary-500/20">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </div>
                <h1 className="text-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">
                  App Center
                </h1>
                <p className="mt-2 text-sm tracking-wide text-slate-500">
                  Enterprise App Distribution
                </p>
              </header>

              {/* App list */}
              <section className="mb-8">
                <div className="mb-4 flex items-center justify-between px-1">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Applications
                  </h2>
                  <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                    {APP_LIST.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {APP_LIST.map((app) => (
                    <AppCard key={app.id} app={app} onSelect={setSelectedApp} />
                  ))}
                </div>
              </section>

              <section className="mb-8">
                <div className="mb-4 px-1">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-primary-400">
                    AI Power
                  </h2>
                </div>
                <div className="space-y-3">
                <button
                  onClick={() => setPage('workflow')}
                  className="glass group w-full rounded-2xl px-6 py-5 text-left transition-all hover:scale-[1.02] border-2 border-emerald-500/20 hover:border-emerald-500/50 relative overflow-hidden shadow-2xl shadow-emerald-500/10 mb-3"
                >
                  <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-emerald-500/10 to-transparent" />
                  <div className="flex items-center gap-5 relative z-10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-accent-cyan shadow-lg shadow-emerald-500/30">
                      <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">Workflow Builder</p>
                      <p className="mt-1 text-sm text-slate-400">Kéo thả API nodes, tạo automation flow như n8n</p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 group-hover:bg-emerald-500/20">
                      <svg className="h-5 w-5 text-slate-600 group-hover:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setPage('ai-agent')}
                  className="glass group w-full rounded-2xl px-6 py-5 text-left transition-all hover:scale-[1.02] border-2 border-primary-500/20 hover:border-primary-500/50 relative overflow-hidden shadow-2xl shadow-primary-500/10"
                >
                  <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-primary-500/10 to-transparent" />
                  <div className="flex items-center gap-5 relative z-10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-violet shadow-lg shadow-primary-500/30">
                      <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">AI Agent Center</p>
                      <p className="mt-1 text-sm text-slate-400">Giao tiếp và điều khiển toàn bộ hệ thống bằng ngôn ngữ tự nhiên</p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 group-hover:bg-primary-500/20">
                      <svg className="h-5 w-5 text-slate-600 group-hover:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                  </div>
                </button>
                </div>
              </section>

              {/* Tools section */}
              <section>
                <div className="mb-4 px-1">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Developer Tools
                  </h2>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => setPage('command-marketplace')}
                    className="glass group w-full rounded-xl px-5 py-4 text-left transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-violet/20">
                        <svg className="h-5 w-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white group-hover:text-primary-400">Command Marketplace</p>
                        <p className="mt-0.5 text-xs text-slate-500">Tất cả Claude Code slash commands — install từng cái hoặc cả bộ</p>
                      </div>
                      <svg className="h-4 w-4 text-slate-600 transition-colors group-hover:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </button>
                  <button
                    onClick={() => setPage('api-explorer')}
                    className="glass group w-full rounded-xl px-5 py-4 text-left transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent-cyan/20 to-primary-500/20">
                        <svg className="h-5 w-5 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white group-hover:text-accent-cyan">API Explorer</p>
                        <p className="mt-0.5 text-xs text-slate-500">Browse & search PMS API endpoints from Postman collection</p>
                      </div>
                      <svg className="h-4 w-4 text-slate-600 transition-colors group-hover:text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </button>

                  <button
                    onClick={() => setPage('doc-reader')}
                    className="glass group w-full rounded-xl px-5 py-4 text-left transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                        <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white group-hover:text-amber-400">Doc Reader</p>
                        <p className="mt-0.5 text-xs text-slate-500">Doc & tim kiem noi dung trong file .docx</p>
                      </div>
                      <svg className="h-4 w-4 text-slate-600 transition-colors group-hover:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </button>

                  <button
                    onClick={() => setPage('telegram')}
                    className="glass group w-full rounded-xl px-5 py-4 text-left transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/20">
                        <svg className="h-5 w-5 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.012 9.483c-.148.658-.538.818-1.09.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.19 14.53l-2.95-.924c-.64-.203-.653-.64.136-.948l11.52-4.44c.533-.194 1 .13.666.93z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white group-hover:text-sky-400">Telegram Sender</p>
                        <p className="mt-0.5 text-xs text-slate-500">Gửi tin nhắn & ảnh đến Telegram</p>
                      </div>
                      <svg className="h-4 w-4 text-slate-600 transition-colors group-hover:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </button>

                  <button
                    onClick={() => setPage('clipboard-sync')}
                    className="glass group w-full rounded-xl px-5 py-4 text-left transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-accent-cyan/20">
                        <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white group-hover:text-emerald-400">Clipboard Sync</p>
                        <p className="mt-0.5 text-xs text-slate-500">Chia se clipboard giua cac thiet bi qua mang</p>
                      </div>
                      <svg className="h-4 w-4 text-slate-600 transition-colors group-hover:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </button>

                  <button
                    onClick={() => setPage('tasks')}
                    className="glass group w-full rounded-xl px-5 py-4 text-left transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20">
                        <svg className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white group-hover:text-violet-400">Task Manager</p>
                        <p className="mt-0.5 text-xs text-slate-500">Quản lý tasks của Claude, lưu trên Supabase</p>
                      </div>
                      <svg className="h-4 w-4 text-slate-600 transition-colors group-hover:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </button>

                  <button
                    onClick={() => setPage('storage-manager')}
                    className="glass group w-full rounded-xl px-5 py-4 text-left transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent-cyan/20 to-primary-500/20">
                        <svg className="h-5 w-5 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white group-hover:text-accent-cyan">Storage Manager</p>
                        <p className="mt-0.5 text-xs text-slate-500">Upload & Download files từ Supabase Storage</p>
                      </div>
                      <svg className="h-4 w-4 text-slate-600 transition-colors group-hover:text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </button>

                  <button
                    onClick={() => setPage('mcp-install')}
                    className="glass group w-full rounded-xl px-5 py-4 text-left transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20">
                        <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white group-hover:text-amber-400">mcp-doc-reader</p>
                        <p className="mt-0.5 text-xs text-slate-500">Download & hướng dẫn cài đặt MCP Server đọc file .docx</p>
                      </div>
                      <svg className="h-4 w-4 text-slate-600 transition-colors group-hover:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </button>

                  <button
                    onClick={() => setPage('task-mcp-install')}
                    className="glass group w-full rounded-xl px-5 py-4 text-left transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20">
                        <svg className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white group-hover:text-violet-400">task-mcp</p>
                        <p className="mt-0.5 text-xs text-slate-500">Download & hướng dẫn cài đặt MCP Server quản lý tasks</p>
                      </div>
                      <svg className="h-4 w-4 text-slate-600 transition-colors group-hover:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </button>

                  <button
                    onClick={() => setPage('telegram-mcp-install')}
                    className="glass group w-full rounded-xl px-5 py-4 text-left transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/20">
                        <svg className="h-5 w-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white group-hover:text-sky-400">telegram-mcp</p>
                        <p className="mt-0.5 text-xs text-slate-500">Download & hướng dẫn cài đặt MCP Server gửi Telegram</p>
                      </div>
                      <svg className="h-4 w-4 text-slate-600 transition-colors group-hover:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </button>

                  <button
                    onClick={() => setPage('figma-mcp-install')}
                    className="glass group w-full rounded-xl px-5 py-4 text-left transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-600/20">
                        <svg className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white group-hover:text-pink-400">figma-mcp-api</p>
                        <p className="mt-0.5 text-xs text-slate-500">Download & hướng dẫn cài đặt MCP Server Figma REST API</p>
                      </div>
                      <svg className="h-4 w-4 text-slate-600 transition-colors group-hover:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </button>
                </div>
              </section>
            </>
          ) : (
            <AppDetail app={selectedApp} onBack={() => setSelectedApp(null)} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-[11px] tracking-wide text-slate-700">
        Internal use only &middot; Unauthorized distribution is prohibited
      </footer>

    </div>
  );
}

export default App;
