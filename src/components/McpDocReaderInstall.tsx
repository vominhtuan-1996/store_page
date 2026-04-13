import { useState } from 'react';

interface McpDocReaderInstallProps {
  onBack: () => void;
}

const CONFIG_SNIPPET = `"doc-reader": {
  "command": "node",
  "args": ["/path/to/mcp-doc-reader/server.js"]
}`;

export const McpDocReaderInstall = ({ onBack }: McpDocReaderInstallProps) => {
  const [os, setOs] = useState<'mac' | 'win'>('mac');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CONFIG_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-600/30">
          <svg className="h-7 w-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">mcp-doc-reader</h1>
          <p className="text-sm text-slate-500">MCP Server · v1.0.0 · 24 KB · Yêu cầu Node.js ≥ 18</p>
        </div>
      </div>

      {/* Download */}
      <a
        href={`${import.meta.env.BASE_URL}downloads/mcp-doc-reader-v1.0.0.zip`}
        download
        className="mb-8 flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-opacity hover:opacity-90 active:opacity-75"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        Download mcp-doc-reader-v1.0.0.zip
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
          {/* Step 1 */}
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-[11px] font-bold text-amber-400">1</div>
            <div className="flex-1">
              <p className="mb-1.5 text-sm font-medium text-slate-300">Giải nén file zip</p>
              <code className="block rounded-lg bg-white/5 px-3 py-2 font-mono text-[12px] text-slate-400">
                {os === 'mac' ? '~/tools/mcp-doc-reader/' : 'C:\\tools\\mcp-doc-reader\\'}
              </code>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-[11px] font-bold text-amber-400">2</div>
            <div className="flex-1">
              <p className="mb-1.5 text-sm font-medium text-slate-300">Chạy script cài đặt</p>
              <code className="block rounded-lg bg-white/5 px-3 py-2 font-mono text-[12px] text-slate-400">
                {os === 'mac'
                  ? 'bash ~/tools/mcp-doc-reader/install.sh'
                  : 'powershell -ExecutionPolicy Bypass -File install.ps1'}
              </code>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-[11px] font-bold text-amber-400">3</div>
            <div className="flex-1">
              <p className="mb-1.5 text-sm font-medium text-slate-300">Thêm config vào .mcp.json</p>
              <div className="relative">
                <pre className="overflow-x-auto rounded-lg bg-white/5 px-3 py-2.5 font-mono text-[12px] leading-relaxed text-slate-400">
                  {CONFIG_SNIPPET}
                </pre>
                <button
                  onClick={handleCopy}
                  className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[11px] text-slate-400 transition-colors hover:bg-white/15 hover:text-white"
                >
                  {copied ? (
                    <>
                      <svg className="h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Thay <code className="text-slate-500">/path/to/mcp-doc-reader/server.js</code> bằng đường dẫn thực tế trên máy bạn.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[11px] font-bold text-emerald-400">✓</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-300">Restart Claude Desktop / reload Claude Code</p>
              <p className="mt-0.5 text-xs text-slate-600">Tools <code className="text-slate-500">read_doc</code> và <code className="text-slate-500">ask_doc</code> sẽ khả dụng.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tools summary */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="glass rounded-xl p-4">
          <p className="mb-1 text-xs font-semibold text-amber-400">read_doc</p>
          <p className="text-xs text-slate-500">Đọc toàn bộ nội dung file .docx</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="mb-1 text-xs font-semibold text-amber-400">ask_doc</p>
          <p className="text-xs text-slate-500">Tìm kiếm thông tin trong file lớn</p>
        </div>
      </div>
    </div>
  );
};
