import { useState } from 'react';

type Shell = 'bash' | 'powershell';

const RAW = 'https://raw.githubusercontent.com/vominhtuan-1996/store_page/main';

const INSTALL_ALL: Record<Shell, string> = {
  bash: `curl -fsSL "${RAW}/install.sh" | bash`,
  powershell: `irm "${RAW}/install.ps1" | iex`,
};

const singleInstall = (cmd: string): Record<Shell, string> => ({
  bash: `mkdir -p .claude/commands && curl -fsSL "${RAW}/.claude/commands/${cmd}.md" -o .claude/commands/${cmd}.md`,
  powershell: `New-Item -Force -Path .claude\\commands -Type Directory | Out-Null; irm "${RAW}/.claude/commands/${cmd}.md" -OutFile ".claude\\commands\\${cmd}.md"`,
});

const MCP_INSTALL_ALL: Record<Shell, string> = {
  bash: `curl -fsSL "${RAW}/install-mcp.sh" | bash -s -- all`,
  powershell: `$env:MCP_TARGET="all"; irm "${RAW}/install-mcp.ps1" | iex`,
};

interface McpServer {
  id: string;
  name: string;
  description: string;
  envVars: string[];
  tools: string[];
  color: string;
  badge: string;
}

const MCP_SERVERS: McpServer[] = [
  {
    id: 'task-mcp',
    name: 'task-mcp',
    description: 'Quản lý tasks với Supabase — create, list, update, resume, summary',
    envVars: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'],
    tools: ['create_task', 'list_tasks', 'update_task', 'get_task', 'delete_task', 'resume_task', 'task_summary'],
    color: 'violet',
    badge: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  },
  {
    id: 'doc-reader',
    name: 'mcp-doc-reader',
    description: 'Đọc và tìm kiếm nội dung trong file .docx',
    envVars: [],
    tools: ['read_doc', 'ask_doc'],
    color: 'amber',
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  },
  {
    id: 'telegram-mcp',
    name: 'telegram-mcp',
    description: 'Gửi tin nhắn và ảnh qua Telegram Bot',
    envVars: ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'],
    tools: ['send_telegram_notification', 'send_telegram_photo'],
    color: 'sky',
    badge: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  },
  {
    id: 'figma-mcp-api',
    name: 'figma-mcp-api',
    description: 'Tương tác với Figma REST API — files, nodes, components, styles',
    envVars: ['FIGMA_ACCESS_TOKEN'],
    tools: ['get_file', 'get_nodes', 'get_images', 'get_file_components', 'get_file_styles', 'get_me'],
    color: 'pink',
    badge: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
  },
];

interface Command {
  name: string;
  description: string;
  usage: string;
}

interface Group {
  label: string;
  color: string;
  badge: string;
  commands: Command[];
}

const GROUPS: Group[] = [
  {
    label: 'Task Management',
    color: 'violet',
    badge: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
    commands: [
      { name: 'task-mcp-v2', description: 'Entry point thống nhất — tự route tới create/update/list/done/resume', usage: '/task-mcp-v2 fix bug login' },
      { name: 'task-create', description: 'Tạo task mới, auto-fill user & suy luận feature tool từ context', usage: '/task-create gấp fix crash màn hình home' },
      { name: 'task-update', description: 'Cập nhật status, notes, context của task', usage: '/task-update xong rồi task workflow' },
      { name: 'task-list', description: 'Xem danh sách tasks, lọc theo status/user/tool', usage: '/task-list' },
      { name: 'task-done', description: 'Đánh dấu task hoàn thành và ghi kết quả', usage: '/task-done task-id' },
      { name: 'task-resume', description: 'Load context task cũ và tiếp tục làm việc', usage: '/task-resume task-id' },
      { name: 'task-summary', description: 'Tổng quan tiến độ tất cả tasks', usage: '/task-summary' },
      { name: 'task-delete', description: 'Xoá task theo ID', usage: '/task-delete task-id' },
    ],
  },
  {
    label: 'Figma',
    color: 'pink',
    badge: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
    commands: [
      { name: 'figma-file', description: 'Xem thông tin file Figma', usage: '/figma-file FILE_KEY' },
      { name: 'figma-nodes', description: 'Xem các node trong frame/component', usage: '/figma-nodes FILE_KEY NODE_ID' },
      { name: 'figma-components', description: 'Liệt kê components trong file', usage: '/figma-components FILE_KEY' },
      { name: 'figma-styles', description: 'Liệt kê styles (color, text, effect)', usage: '/figma-styles FILE_KEY' },
      { name: 'figma-export', description: 'Export assets từ Figma sang ảnh', usage: '/figma-export FILE_KEY NODE_ID' },
      { name: 'figma-comments', description: 'Xem và thêm comment trong file Figma', usage: '/figma-comments FILE_KEY' },
      { name: 'figma-projects', description: 'Liệt kê projects trong Figma team', usage: '/figma-projects TEAM_ID' },
    ],
  },
  {
    label: 'Documentation',
    color: 'amber',
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    commands: [
      { name: 'ask-doc', description: 'Hỏi câu hỏi về nội dung file .docx', usage: '/ask-doc /path/to/file.docx | câu hỏi' },
      { name: 'read-doc', description: 'Đọc toàn bộ nội dung file .docx', usage: '/read-doc /path/to/file.docx' },
      { name: 'summarize-doc', description: 'Tóm tắt nội dung file .docx', usage: '/summarize-doc /path/to/file.docx' },
    ],
  },
  {
    label: 'Code Generation',
    color: 'cyan',
    badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
    commands: [
      { name: 'create-component', description: 'Tạo React component theo chuẩn dự án', usage: '/create-component UserCard' },
      { name: 'create-feature', description: 'Tạo feature module đầy đủ (components, hooks, services)', usage: '/create-feature auth' },
      { name: 'create-page', description: 'Tạo page component với routing', usage: '/create-page Dashboard' },
      { name: 'create-hook', description: 'Tạo custom hook', usage: '/create-hook useAuth' },
      { name: 'create-service', description: 'Tạo API service với Axios', usage: '/create-service user' },
      { name: 'create-store', description: 'Tạo Zustand store theo domain', usage: '/create-store auth' },
      { name: 'add-form', description: 'Thêm form với React Hook Form + Zod validation', usage: '/add-form LoginForm' },
      { name: 'gen-types', description: 'Generate TypeScript types từ API response', usage: '/gen-types' },
    ],
  },
  {
    label: 'Review & Quality',
    color: 'emerald',
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    commands: [
      { name: 'review-component', description: 'Review React component về cấu trúc, performance, a11y', usage: '/review-component src/components/Foo.tsx' },
      { name: 'refactor-component', description: 'Refactor component cải thiện code quality', usage: '/refactor-component src/components/Foo.tsx' },
      { name: 'check-mr-compliance', description: 'Kiểm tra MR có tuân thủ convention dự án không', usage: '/check-mr-compliance' },
    ],
  },
  {
    label: 'DevOps & Setup',
    color: 'orange',
    badge: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    commands: [
      { name: 'deploy-ghpages', description: 'Deploy ứng dụng lên GitHub Pages', usage: '/deploy-ghpages' },
      { name: 'setup-project', description: 'Khởi tạo dự án React mới với đầy đủ config', usage: '/setup-project my-app' },
      { name: 'setup-flutter', description: 'Khởi tạo Flutter mobile với Clean Architecture + BLoC + GetIt', usage: '/setup-flutter my_app' },
      { name: 'setup-dotnet', description: 'Khởi tạo .NET Web API với Clean Architecture + CQRS + MediatR', usage: '/setup-dotnet MyApp' },
    ],
  },
  {
    label: 'Telegram',
    color: 'sky',
    badge: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
    commands: [
      { name: 'telegram-notify', description: 'Gửi thông báo text đến Telegram', usage: '/telegram-notify Deploy thành công!' },
      { name: 'telegram-photo', description: 'Gửi ảnh + caption đến Telegram', usage: '/telegram-photo /path/to/image.png caption' },
    ],
  },
];

const CopyButton = ({ text, label = 'Copy' }: { text: string; label?: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
        copied
          ? 'bg-emerald-500/20 text-emerald-400'
          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
      }`}
    >
      {copied ? (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
        </svg>
      )}
      {copied ? 'Copied!' : label}
    </button>
  );
};

interface CommandMarketplaceProps {
  onBack: () => void;
}

export const CommandMarketplace = ({ onBack }: CommandMarketplaceProps) => {
  const [search, setSearch] = useState('');
  const [expandedCmd, setExpandedCmd] = useState<string | null>(null);
  const [shell, setShell] = useState<Shell>('bash');

  const totalCommands = GROUPS.reduce((s, g) => s + g.commands.length, 0);

  const filtered = search
    ? GROUPS.map(g => ({
        ...g,
        commands: g.commands.filter(
          c => c.name.includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(g => g.commands.length > 0)
    : GROUPS;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-white">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </button>
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Command Marketplace</span>
      </div>

      {/* Hero */}
      <div className="mb-6 rounded-2xl border border-primary-500/20 bg-gradient-to-br from-primary-500/10 to-accent-violet/5 p-5">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-lg font-bold text-white">Claude Code Commands</span>
          <span className="rounded-full bg-primary-500/20 px-2 py-0.5 text-[10px] font-bold text-primary-400">
            {totalCommands} commands
          </span>
        </div>
        <p className="mb-4 text-xs text-slate-400">Cài tất cả hoặc từng command vào project của bạn.</p>

        {/* Shell toggle */}
        <div className="mb-3 flex gap-1 rounded-lg border border-white/10 bg-black/20 p-1 w-fit">
          {(['bash', 'powershell'] as Shell[]).map(s => (
            <button
              key={s}
              onClick={() => setShell(s)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-[11px] font-semibold transition-all ${
                shell === s
                  ? 'bg-primary-500/30 text-primary-300'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {s === 'bash' ? (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
                </svg>
              ) : (
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.5 4.5A2.5 2.5 0 002 7v10a2.5 2.5 0 002.5 2.5h15A2.5 2.5 0 0022 17V7a2.5 2.5 0 00-2.5-2.5h-15zm1.28 5.47l3.5 2.5a.5.5 0 010 .82l-3.5 2.5A.5.5 0 015 15.25v-5a.5.5 0 01.78-.41zM10.5 14h4a.5.5 0 010 1h-4a.5.5 0 010-1z"/>
                </svg>
              )}
              {s === 'bash' ? 'macOS / Linux' : 'Windows (PS)'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
          <code className="flex-1 font-mono text-[11px] text-emerald-400 break-all">{INSTALL_ALL[shell]}</code>
          <CopyButton text={INSTALL_ALL[shell]} label="Copy All" />
        </div>
      </div>

      {/* Search */}
      <div className="mb-5 relative">
        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          placeholder="Tìm command..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-primary-500/50"
        />
      </div>

      {/* MCP Servers */}
      {!search && (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2 px-1">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">MCP Servers</h2>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
              {MCP_SERVERS.length}
            </span>
          </div>
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/5 bg-black/20 px-3 py-2">
            <span className="text-[10px] text-slate-500">Install all MCPs:</span>
            <code className="flex-1 font-mono text-[10px] text-emerald-400 break-all">{MCP_INSTALL_ALL[shell]}</code>
            <CopyButton text={MCP_INSTALL_ALL[shell]} label="Copy" />
          </div>
          <div className="space-y-2">
            {MCP_SERVERS.map(mcp => {
              const isExp = expandedCmd === `mcp:${mcp.id}`;
              const installCmd: Record<Shell, string> = {
                bash: `curl -fsSL "${RAW}/install-mcp.sh" | bash -s -- ${mcp.id}`,
                powershell: `$env:MCP_TARGET="${mcp.id}"; irm "${RAW}/install-mcp.ps1" | iex`,
              };
              return (
                <div key={mcp.id} className="glass rounded-xl border border-white/5">
                  <button
                    className="w-full px-4 py-3 text-left"
                    onClick={() => setExpandedCmd(isExp ? null : `mcp:${mcp.id}`)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`shrink-0 rounded-lg border px-2 py-0.5 font-mono text-[10px] font-bold ${mcp.badge}`}>
                          MCP
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white">{mcp.name}</p>
                          <p className="truncate text-[10px] text-slate-500">{mcp.description}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <CopyButton text={installCmd[shell]} label="Install" />
                        <svg className={`h-3.5 w-3.5 text-slate-600 transition-transform ${isExp ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                    </div>
                  </button>
                  {isExp && (
                    <div className="border-t border-white/5 px-4 py-3 space-y-3">
                      <div>
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">Install command</p>
                        <div className="flex items-start gap-2 rounded-lg border border-white/5 bg-black/30 px-3 py-2">
                          <code className="flex-1 font-mono text-[10px] text-emerald-400 break-all leading-relaxed">{installCmd[shell]}</code>
                          <CopyButton text={installCmd[shell]} />
                        </div>
                      </div>
                      {mcp.envVars.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">Env vars cần thiết</p>
                          <div className="flex flex-wrap gap-1.5">
                            {mcp.envVars.map(v => (
                              <code key={v} className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-amber-400">{v}</code>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">MCP Tools</p>
                        <div className="flex flex-wrap gap-1.5">
                          {mcp.tools.map(t => (
                            <code key={t} className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-400">{t}</code>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Groups */}
      <div className="space-y-6">
        {filtered.map(group => (
          <div key={group.label}>
            <div className="mb-3 flex items-center gap-2 px-1">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{group.label}</h2>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${group.badge}`}>
                {group.commands.length}
              </span>
            </div>
            <div className="space-y-2">
              {group.commands.map(cmd => {
                const isExpanded = expandedCmd === cmd.name;
                const installCmds = singleInstall(cmd.name);
                return (
                  <div
                    key={cmd.name}
                    className="glass rounded-xl border border-white/5 transition-all"
                  >
                    <button
                      className="w-full px-4 py-3 text-left"
                      onClick={() => setExpandedCmd(isExpanded ? null : cmd.name)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <code className="shrink-0 rounded-lg bg-white/5 px-2 py-0.5 font-mono text-[11px] font-bold text-primary-400">
                            /{cmd.name}
                          </code>
                          <p className="truncate text-xs text-slate-400">{cmd.description}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <CopyButton text={installCmds[shell]} label="Install" />
                          <svg
                            className={`h-3.5 w-3.5 text-slate-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-white/5 px-4 py-3 space-y-3">
                        <div>
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">Cách dùng</p>
                          <code className="block rounded-lg bg-white/5 px-3 py-2 font-mono text-[11px] text-slate-300">
                            {cmd.usage}
                          </code>
                        </div>
                        <div>
                          <div className="mb-1 flex items-center justify-between">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">Install command</p>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${shell === 'bash' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-blue-500/15 text-blue-400'}`}>
                              {shell === 'bash' ? 'bash' : 'PowerShell'}
                            </span>
                          </div>
                          <div className="flex items-start gap-2 rounded-lg border border-white/5 bg-black/30 px-3 py-2">
                            <code className="flex-1 font-mono text-[10px] text-emerald-400 break-all leading-relaxed">
                              {installCmds[shell]}
                            </code>
                            <CopyButton text={installCmds[shell]} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-sm text-slate-500">
          Không tìm thấy command nào cho "{search}"
        </div>
      )}
    </div>
  );
};
