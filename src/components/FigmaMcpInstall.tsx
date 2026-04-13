import { useState } from 'react';

interface FigmaMcpInstallProps {
  onBack: () => void;
}

const CONFIG_SNIPPET = `"figma-api": {
  "command": "node",
  "args": ["/path/to/figma_mcp_api/server.js"]
}`;

const ENV_SNIPPET = `FIGMA_ACCESS_TOKEN=figd_your_token_here`;

const TOOLS = [
  { name: 'get_file', desc: 'Lấy toàn bộ JSON của file Figma' },
  { name: 'get_nodes', desc: 'Lấy JSON của các node cụ thể' },
  { name: 'get_images', desc: 'Export URL ảnh cho các node' },
  { name: 'get_file_components', desc: 'Liệt kê tất cả components' },
  { name: 'get_file_styles', desc: 'Liệt kê tất cả styles' },
  { name: 'get_me', desc: 'Thông tin user đang xác thực' },
  { name: 'get_file_versions', desc: 'Lịch sử phiên bản file' },
  { name: 'get_comments', desc: 'Danh sách comments' },
  { name: 'post_comment', desc: 'Thêm comment mới' },
  { name: 'get_project_files', desc: 'Files trong project' },
  { name: 'get_team_projects', desc: 'Projects trong team' },
];

const COMMANDS = [
  { cmd: '/figma-file', desc: 'Đọc nội dung file Figma' },
  { cmd: '/figma-nodes', desc: 'Lấy dữ liệu node cụ thể' },
  { cmd: '/figma-export', desc: 'Export ảnh từ node' },
  { cmd: '/figma-components', desc: 'Xem components trong file' },
  { cmd: '/figma-styles', desc: 'Xem styles trong file' },
  { cmd: '/figma-comments', desc: 'Xem/thêm comments' },
  { cmd: '/figma-projects', desc: 'Xem projects trong team' },
];

export const FigmaMcpInstall = ({ onBack }: FigmaMcpInstallProps) => {
  const [os, setOs] = useState<'mac' | 'win'>('mac');
  const [copied, setCopied] = useState<'config' | 'env' | null>(null);
  const [showTools, setShowTools] = useState(false);

  const handleCopy = (type: 'config' | 'env', text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-white"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back
      </button>

      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/30 to-rose-600/30">
          <svg className="h-7 w-7 text-pink-400" viewBox="0 0 38 57" fill="currentColor">
            <path d="M19 28.5C19 25.9804 20.0009 23.5641 21.7825 21.7825C23.5641 20.0009 25.9804 19 28.5 19C31.0196 19 33.4359 20.0009 35.2175 21.7825C36.9991 23.5641 38 25.9804 38 28.5C38 31.0196 36.9991 33.4359 35.2175 35.2175C33.4359 36.9991 31.0196 38 28.5 38C25.9804 38 23.5641 36.9991 21.7825 35.2175C20.0009 33.4359 19 31.0196 19 28.5Z"/>
            <path d="M0 47.5C0 44.9804 1.00089 42.5641 2.78249 40.7825C4.56408 39.0009 6.98044 38 9.5 38H19V47.5C19 50.0196 17.9991 52.4359 16.2175 54.2175C14.4359 55.9991 12.0196 57 9.5 57C6.98044 57 4.56408 55.9991 2.78249 54.2175C1.00089 52.4359 0 50.0196 0 47.5Z"/>
            <path d="M19 0V19H28.5C31.0196 19 33.4359 17.9991 35.2175 16.2175C36.9991 14.4359 38 12.0196 38 9.5C38 6.98044 36.9991 4.56408 35.2175 2.78249C33.4359 1.00089 31.0196 0 28.5 0H19Z"/>
            <path d="M0 9.5C0 12.0196 1.00089 14.4359 2.78249 16.2175C4.56408 17.9991 6.98044 19 9.5 19H19V0H9.5C6.98044 0 4.56408 1.00089 2.78249 2.78249C1.00089 4.56408 0 6.98044 0 9.5Z"/>
            <path d="M0 28.5C0 31.0196 1.00089 33.4359 2.78249 35.2175C4.56408 36.9991 6.98044 38 9.5 38H19V19H9.5C6.98044 19 4.56408 20.0009 2.78249 21.7825C1.00089 23.5641 0 25.9804 0 28.5Z"/>
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">figma-mcp-api</h1>
          <p className="text-sm text-slate-500">MCP Server · v1.1.0 · 24 KB · Yêu cầu Node.js ≥ 18 + Figma Token</p>
        </div>
      </div>

      {/* Download */}
      <a
        href={`${import.meta.env.BASE_URL}downloads/figma-mcp-api-v1.0.0.zip`}
        download
        className="mb-8 flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 transition-opacity hover:opacity-90 active:opacity-75"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        Download figma-mcp-api-v1.0.0.zip
      </a>

      {/* Install guide */}
      <div className="glass rounded-2xl p-5">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Hướng dẫn cài đặt
        </h2>

        {/* OS toggle */}
        <div className="mb-5 flex rounded-lg bg-white/5 p-1">
          <button
            onClick={() => setOs('mac')}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
              os === 'mac' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Mac / Linux
          </button>
          <button
            onClick={() => setOs('win')}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
              os === 'win' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Windows
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-5">
          {/* Step 1 - Get token */}
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-500/20 text-[11px] font-bold text-pink-400">1</div>
            <div className="flex-1">
              <p className="mb-1.5 text-sm font-medium text-slate-300">Lấy Figma Access Token</p>
              <p className="text-xs text-slate-500">
                Figma → <span className="text-slate-400">Settings → Account → Personal access tokens</span> → Generate new token.
                Token bắt đầu bằng <code className="rounded bg-white/5 px-1 text-pink-300">figd_</code>.
              </p>
            </div>
          </div>

          {/* Step 2 - Extract */}
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-500/20 text-[11px] font-bold text-pink-400">2</div>
            <div className="flex-1">
              <p className="mb-1.5 text-sm font-medium text-slate-300">Giải nén file zip</p>
              <code className="block rounded-lg bg-white/5 px-3 py-2 font-mono text-[12px] text-slate-400">
                {os === 'mac' ? '~/tools/figma_mcp_api/' : 'C:\\tools\\figma_mcp_api\\'}
              </code>
            </div>
          </div>

          {/* Step 3 - Install script */}
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-500/20 text-[11px] font-bold text-pink-400">3</div>
            <div className="flex-1">
              <p className="mb-1.5 text-sm font-medium text-slate-300">Chạy script cài đặt</p>
              <code className="block rounded-lg bg-white/5 px-3 py-2 font-mono text-[12px] text-slate-400">
                {os === 'mac'
                  ? 'bash ~/tools/figma_mcp_api/install.sh'
                  : 'powershell -ExecutionPolicy Bypass -File install.ps1'}
              </code>
              <p className="mt-1.5 text-xs text-slate-600">
                Script tự động: cài dependencies, nhập Figma token, patch Claude Desktop, copy slash commands.
              </p>
            </div>
          </div>

          {/* Step 4 - .env manual */}
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-500/20 text-[11px] font-bold text-pink-400">4</div>
            <div className="flex-1">
              <p className="mb-1.5 text-sm font-medium text-slate-300">
                Tạo <code className="rounded bg-white/5 px-1 text-pink-300">.env</code> thủ công (nếu cần)
              </p>
              <p className="mb-2 text-xs text-slate-600">
                Đặt trong thư mục <strong className="text-slate-400">cha</strong> của <code className="text-slate-500">figma_mcp_api/</code>:
              </p>
              <div className="relative">
                <pre className="overflow-x-auto rounded-lg bg-white/5 px-3 py-2.5 font-mono text-[12px] leading-relaxed text-slate-400">
                  {ENV_SNIPPET}
                </pre>
                <button
                  onClick={() => handleCopy('env', ENV_SNIPPET)}
                  className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[11px] text-slate-400 transition-colors hover:bg-white/15 hover:text-white"
                >
                  {copied === 'env' ? (
                    <><svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg><span className="text-emerald-400">Copied</span></>
                  ) : (
                    <><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>Copy</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Step 5 - Config */}
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-500/20 text-[11px] font-bold text-pink-400">5</div>
            <div className="flex-1">
              <p className="mb-1.5 text-sm font-medium text-slate-300">Thêm config vào .mcp.json</p>
              <div className="relative">
                <pre className="overflow-x-auto rounded-lg bg-white/5 px-3 py-2.5 font-mono text-[12px] leading-relaxed text-slate-400">
                  {CONFIG_SNIPPET}
                </pre>
                <button
                  onClick={() => handleCopy('config', CONFIG_SNIPPET)}
                  className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[11px] text-slate-400 transition-colors hover:bg-white/15 hover:text-white"
                >
                  {copied === 'config' ? (
                    <><svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg><span className="text-emerald-400">Copied</span></>
                  ) : (
                    <><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>Copy</>
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Thay <code className="text-slate-500">/path/to/figma_mcp_api/server.js</code> bằng đường dẫn thực tế.
              </p>
            </div>
          </div>

          {/* Done */}
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[11px] font-bold text-emerald-400">✓</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-300">Restart Claude Desktop / reload Claude Code</p>
              <p className="mt-0.5 text-xs text-slate-600">11 tools + 7 slash commands sẽ khả dụng.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tools list (collapsible) */}
      <div className="mt-4 glass rounded-2xl">
        <button
          onClick={() => setShowTools(v => !v)}
          className="flex w-full items-center justify-between px-5 py-4"
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">11 Tools</h2>
          <svg
            className={`h-4 w-4 text-slate-600 transition-transform ${showTools ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
        {showTools && (
          <div className="border-t border-white/5 px-5 pb-4">
            <div className="mt-3 space-y-2">
              {TOOLS.map(({ name, desc }) => (
                <div key={name} className="flex items-start gap-3">
                  <code className="mt-0.5 shrink-0 rounded-md bg-pink-500/10 px-2 py-0.5 text-[11px] font-mono text-pink-400">{name}</code>
                  <span className="text-xs text-slate-500">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Slash commands */}
      <div className="mt-3 glass rounded-2xl p-5">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Slash Commands</h2>
        <div className="space-y-2">
          {COMMANDS.map(({ cmd, desc }) => (
            <div key={cmd} className="flex items-center gap-3">
              <code className="shrink-0 rounded-md bg-pink-500/10 px-2 py-0.5 text-[12px] font-mono text-pink-400">{cmd}</code>
              <span className="text-xs text-slate-500">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
